/**
 * Cliente Server-Side para integração com a API Rails v1 do MEDTEC
 * Conforme especificado em rotas_front.md
 */

const RAILS_API_URL = process.env.BACKEND_API_URL || 'http://172.16.107.63:3023/api/v1';
const ADMIN_CPF = process.env.BACKEND_ADMIN_CPF || '111.444.777-35';
const ADMIN_PASSWORD = process.env.BACKEND_ADMIN_PASSWORD || 'SenhaAdmin123';

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let tokenExpiresAt = 0; // timestamp em ms

/**
 * Obtém um token de acesso administrativo válido no Rails v1.
 * Realiza login ou refresh conforme necessário.
 */
export async function getBackendAdminToken(): Promise<string | null> {
  const now = Date.now();

  // Se o token atual ainda tem pelo menos 60 segundos de validade, reutiliza
  if (cachedAccessToken && tokenExpiresAt > now + 60000) {
    return cachedAccessToken;
  }

  // Se temos refresh_token, tenta renovar
  if (cachedRefreshToken) {
    try {
      const refreshRes = await fetch(`${RAILS_API_URL}/auth/refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: cachedRefreshToken }),
      });

      if (refreshRes.ok) {
        const refreshJson = await refreshRes.json();
        if (refreshJson?.data?.access_token) {
          cachedAccessToken = refreshJson.data.access_token;
          cachedRefreshToken = refreshJson.data.refresh_token;
          tokenExpiresAt = now + 14 * 60 * 1000; // 14 min
          return cachedAccessToken;
        }
      }
    } catch (err) {
      console.warn('Falha ao tentar renovar refresh_token no Rails, efetuando novo login:', err);
    }
  }

  // Realiza novo login com credenciais administrativas
  try {
    const loginRes = await fetch(`${RAILS_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: ADMIN_CPF, password: ADMIN_PASSWORD }),
    });

    if (loginRes.ok) {
      const loginJson = await loginRes.json();
      if (loginJson?.data?.access_token) {
        cachedAccessToken = loginJson.data.access_token;
        cachedRefreshToken = loginJson.data.refresh_token;
        tokenExpiresAt = now + 14 * 60 * 1000;
        return cachedAccessToken;
      }
    }
  } catch (err) {
    console.error('Falha ao autenticar no Rails API:', err);
  }

  return null;
}

/**
 * Executa requisição autenticada contra a API Rails v1
 */
export async function railsApiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; errors?: string[]; message?: string }> {
  let token = await getBackendAdminToken();
  if (!token) {
    return { ok: false, status: 503, message: 'Serviço da API Rails temporariamente indisponível' };
  }

  const url = `${RAILS_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(url, { ...options, headers });

  // Se retornou 401 token_expirado, tenta renovar uma vez
  if (res.status === 401) {
    cachedAccessToken = null;
    token = await getBackendAdminToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      res = await fetch(url, { ...options, headers });
    }
  }

  if (res.status === 204) {
    return { ok: true, status: 204 };
  }

  try {
    const json = await res.json();
    if (res.ok) {
      return { ok: true, status: res.status, data: json };
    }
    return {
      ok: false,
      status: res.status,
      message: json?.message || 'Erro retornado pela API Rails',
      errors: json?.errors || [],
      data: json,
    };
  } catch {
    return {
      ok: res.ok,
      status: res.status,
      message: res.statusText,
    };
  }
}
