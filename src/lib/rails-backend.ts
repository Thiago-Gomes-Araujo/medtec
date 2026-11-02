/**
 * Cliente Server-Side para integração com a API Rails v1 do MEDTEC
 * Conforme especificado em rotas_front.md
 */

import { fetchWithTimeout, getApiBaseUrl, isTimeoutError } from '@/lib/api/client';
import { API_TIMEOUT_MESSAGE } from '@/lib/api/errors';

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let tokenExpiresAt = 0; // timestamp em ms

/**
 * Lê a conta administrativa das rotas do servidor; sem ela, não há login a tentar.
 */
function getBackendAdminCredentials(): { cpf: string; password: string } {
  const cpf = process.env.BACKEND_ADMIN_CPF;
  const password = process.env.BACKEND_ADMIN_PASSWORD;
  if (!cpf || !password) {
    throw new Error('Configuração ausente: defina BACKEND_ADMIN_CPF e BACKEND_ADMIN_PASSWORD para as rotas administrativas do servidor.');
  }
  return { cpf, password };
}

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
      const refreshRes = await fetchWithTimeout(`${getApiBaseUrl()}/auth/refresh_token`, {
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
  const credentials = getBackendAdminCredentials();
  try {
    const loginRes = await fetchWithTimeout(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
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

  const url = `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  const timedOut = { ok: false, status: 504, message: API_TIMEOUT_MESSAGE, errors: ['tempo_esgotado'] };

  let res: Response;
  try {
    res = await fetchWithTimeout(url, { ...options, headers });

    // Se retornou 401 token_expirado, tenta renovar uma vez
    if (res.status === 401) {
      cachedAccessToken = null;
      token = await getBackendAdminToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        res = await fetchWithTimeout(url, { ...options, headers });
      }
    }
  } catch (err) {
    if (isTimeoutError(err)) return timedOut;
    throw err;
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
  } catch (err) {
    if (isTimeoutError(err)) return timedOut;
    return {
      ok: res.ok,
      status: res.status,
      message: res.statusText,
    };
  }
}
