import crypto from 'crypto';
import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'medtec_admin_session';

// Duração da sessão: 7 dias (em segundos)
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  username: string;
  iat: number;
  exp: number;
}

/**
 * Retorna a chave secreta usada para assinar as sessões HMAC-SHA256.
 * Em produção, lança erro se a variável não estiver definida.
 */
export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'CONFIGURAÇÃO CRÍTICA DE SEGURANÇA: ADMIN_SESSION_SECRET não está definida no ambiente de produção. Defina esta variável para habilitar sessões seguras.'
      );
    }
    // Chave padrão apenas para ambiente de desenvolvimento local
    return 'medtec-local-dev-session-secret-change-in-production';
  }

  if (secret.length < 32 && process.env.NODE_ENV === 'production') {
    throw new Error(
      'CONFIGURAÇÃO CRÍTICA DE SEGURANÇA: ADMIN_SESSION_SECRET deve conter pelo menos 32 caracteres em produção.'
    );
  }

  return secret;
}

/**
 * Retorna as credenciais administrativas configuradas via variáveis de ambiente.
 */
export function getAdminCredentials(): { username: string; passwordHashOrPlain: string } {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'CONFIGURAÇÃO CRÍTICA DE SEGURANÇA: ADMIN_USER ou ADMIN_PASSWORD não estão definidas no ambiente de produção.'
      );
    }
    // Fallback restrito apenas a ambiente de desenvolvimento local
    return {
      username: user || 'admin',
      passwordHashOrPlain: pass || 'medtec2025',
    };
  }

  return { username: user, passwordHashOrPlain: pass };
}

/**
 * Valida o par usuário/senha utilizando comparação em tempo constante (timingSafeEqual).
 */
export function verifyCredentials(usernameAttempt: string, passwordAttempt: string): boolean {
  if (!usernameAttempt || !passwordAttempt) {
    return false;
  }

  const { username, passwordHashOrPlain } = getAdminCredentials();

  const userAttemptBuffer = Buffer.from(usernameAttempt);
  const userExpectedBuffer = Buffer.from(username);
  const passAttemptBuffer = Buffer.from(passwordAttempt);
  const passExpectedBuffer = Buffer.from(passwordHashOrPlain);

  const userMatch =
    userAttemptBuffer.length === userExpectedBuffer.length &&
    crypto.timingSafeEqual(userAttemptBuffer, userExpectedBuffer);

  const passMatch =
    passAttemptBuffer.length === passExpectedBuffer.length &&
    crypto.timingSafeEqual(passAttemptBuffer, passExpectedBuffer);

  return userMatch && passMatch;
}

/**
 * Gera um token assinado com HMAC-SHA256 no formato: base64url(payload).base64url(signature)
 */
export function createSessionToken(username: string): string {
  const secret = getSessionSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    username,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifica e decodifica um token HMAC-SHA256.
 * Retorna o payload se válido ou null se corrompido, adulterado ou expirado.
 */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return null;

  let secret: string;
  try {
    secret = getSessionSecret();
  } catch {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedSigBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
    return null; // Assinatura inválida / adulterada
  }

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr) as SessionPayload;

    if (!payload.username || typeof payload.exp !== 'number' || typeof payload.iat !== 'number') {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now >= payload.exp) {
      return null; // Sessão expirada
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Helper assíncrono para verificar se a requisição possui sessão válida via cookie.
 */
export async function verifyAdminSession(): Promise<{ valid: boolean; username?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return { valid: false };
    }

    return { valid: true, username: session.username };
  } catch {
    return { valid: false };
  }
}

/**
 * Validação de origem e host para defesa em profundidade contra CSRF.
 */
export function validateCsrfOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}
