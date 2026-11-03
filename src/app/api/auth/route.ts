import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/api/client';
import { lerPermissoes } from '@/lib/api/permissoes';
import type { AuthUser } from '@/lib/api/types';
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyAdminSession,
  authenticateUser,
  validateCsrfOrigin,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origem da requisição inválida' }, { status: 403 });
    }

    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Informe usuário e senha' }, { status: 400 });
    }

    // 1. Tenta autenticar na mesma API que o navegador usará com o token emitido aqui
    const backendUrl = getApiBaseUrl();
    let backendTokens: { access_token: string; refresh_token: string } | null = null;
    let backendUser: Pick<AuthUser, 'id' | 'nome' | 'cpf' | 'perfil_nome' | 'admin' | 'permissoes'> | null = null;
    let backendUnavailable = false;
    let tooManyAttempts = false;

    try {
      const backendRes = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: username, password }),
        signal: AbortSignal.timeout(5000),
      });

      if (backendRes.ok) {
        const backendJson = await backendRes.json();
        if (backendJson?.data?.access_token) {
          backendTokens = backendJson.data;

          // Busca perfil do usuário em /auth/me
          const meRes = await fetch(`${backendUrl}/auth/me`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${backendTokens?.access_token}`,
            },
            signal: AbortSignal.timeout(5000),
          });
          if (meRes.ok) {
            const meJson = await meRes.json();
            backendUser = meJson.data;
          } else {
            backendUnavailable = true;
          }
        }
      } else if (backendRes.status === 429) {
        tooManyAttempts = true;
      } else if (backendRes.status >= 500) {
        backendUnavailable = true;
      }
    } catch (err) {
      backendUnavailable = true;
      console.warn('API Backend indisponível para validação de login, recorrendo à validação local:', err);
    }

    // Se o backend autenticou com sucesso
    if (backendUser && backendTokens) {
      const userLogin = backendUser.cpf;
      // O papel do cookie local segue o campo admin do /auth/me, nunca o nome do perfil.
      const { admin, permissoes } = lerPermissoes(backendUser);
      const role = admin ? 'gestor' : 'operador';
      const name = backendUser.nome;
      const profileType = backendUser.perfil_nome;
      const token = createSessionToken(userLogin, role, name, profileType);

      const response = NextResponse.json({
        success: true,
        message: 'Autenticado com sucesso!',
        user: { username: userLogin, role, name, profileType, admin, permissoes },
        tokens: backendTokens,
      });

      const isHttps =
        request.headers.get('x-forwarded-proto') === 'https' ||
        request.url.startsWith('https://');

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
        sameSite: 'lax',
        secure: isHttps,
      });

      return response;
    }

    // Mais de 10 tentativas por minuto: a API bloqueia e a senha nem foi conferida (ROTAS_FRONT.md, seção 5).
    if (tooManyAttempts) {
      return NextResponse.json({ success: false, error: 'Muitas tentativas de login. Aguarde 1 minuto e tente novamente.' }, { status: 429 });
    }

    // 2. Validação local (fallback para Gestor Geral ou banco local)
    const authResult = authenticateUser(username, password);

    if (authResult.authenticated && authResult.user) {
      const { username: userLogin, role, name, profileType } = authResult.user;
      const token = createSessionToken(userLogin, role, name, profileType);
      const response = NextResponse.json({ 
        success: true, 
        message: 'Autenticado com sucesso!',
        user: { username: userLogin, role, name, profileType }
      });

      const isHttps =
        request.headers.get('x-forwarded-proto') === 'https' ||
        request.url.startsWith('https://');

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
        sameSite: 'lax',
        secure: isHttps,
      });

      return response;
    }

    // Sem resposta da API, a senha não foi avaliada: não dá para acusá-la de incorreta.
    if (backendUnavailable) {
      return NextResponse.json({ success: false, error: 'Serviço de autenticação indisponível. Tente novamente em instantes.' }, { status: 503 });
    }

    return NextResponse.json({ success: false, error: authResult.error || 'Usuário/CPF ou senha inválidos' }, { status: 401 });
  } catch (error) {
    console.error('Erro no endpoint de autenticação POST /api/auth:', error);
    return NextResponse.json({ success: false, error: 'Erro ao processar login' }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ success: true, message: 'Logout realizado com sucesso' });
}

export async function GET() {
  const auth = await verifyAdminSession();

  if (auth.valid) {
    return NextResponse.json({ 
      authenticated: true, 
      user: auth.username,
      role: auth.role,
      name: auth.name,
      profileType: auth.profileType,
      isGestor: auth.isGestor
    });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

