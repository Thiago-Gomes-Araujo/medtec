/**
 * Cliente HTTP Centralizado da API MEDTEC
 * Gerencia URL-base, headers, serialização de query params/filtros,
 * autenticação por Bearer token, suporte a FormData, e mutex de renovação de token.
 */

import { ApiResponse, AuthTokens, AuthUser, QueryParams } from './types';
import { API_TIMEOUT_MESSAGE, API_UNREACHABLE_MESSAGE, ApiError } from './errors';
import { definirPermissoes } from './permissoes';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
} from './tokens';

/**
 * Obtém a URL-base configurada da API (ex: http://localhost:3000/api/v1).
 * Lê prioritariamente NEXT_PUBLIC_API_URL do navegador/ambiente.
 * É a única origem da URL: rotas do servidor e navegador precisam falar com o mesmo host,
 * porque o token emitido no login só vale na API que o emitiu.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Se estiver em ambiente Node.js server-side, pode verificar BACKEND_API_URL
  if (typeof window === 'undefined' && process.env.BACKEND_API_URL) {
    return process.env.BACKEND_API_URL.trim().replace(/\/+$/, '');
  }

  // Fallback seguro documentado em rotas_front.md
  return 'http://localhost:3000/api/v1';
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * Origem do servidor backend (sem o sufixo /api/v1), utilizada para imagens do Active Storage.
 */
export function getApiServerUrl(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
}

export const API_SERVER_URL = getApiServerUrl();

/**
 * Monta URL absoluta para imagens do servidor (Active Storage) ou retorna a URL externa intacta.
 */
export function getMediaUrl(imagePathOrUrl?: string | null): string {
  if (!imagePathOrUrl || typeof imagePathOrUrl !== 'string') return '';
  if (imagePathOrUrl.startsWith('http://') || imagePathOrUrl.startsWith('https://')) {
    return imagePathOrUrl;
  }
  const cleanPath = imagePathOrUrl.startsWith('/') ? imagePathOrUrl : `/${imagePathOrUrl}`;
  return `${getApiServerUrl()}${cleanPath}`;
}

/**
 * Constrói a query string com suporte a filtros padrão da API:
 * - q[campo_predicado]=valor
 * - q[id_in][]=1&q[id_in][]=2
 * - page=all ou page=1&per_page=10
 */
export function buildQueryString(params?: QueryParams | Record<string, unknown>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (key === 'q' && typeof value === 'object' && !Array.isArray(value)) {
      // Serializa objeto de filtros q[campo_predicado]=valor
      for (const [qKey, qVal] of Object.entries(value as Record<string, unknown>)) {
        if (qVal === undefined || qVal === null || qVal === '') continue;

        if (Array.isArray(qVal)) {
          qVal.forEach((item) => {
            searchParams.append(`q[${qKey}][]`, String(item));
          });
        } else {
          searchParams.append(`q[${qKey}]`, String(qVal));
        }
      }
    } else if (key.startsWith('q[') && Array.isArray(value)) {
      // Suporte direto para chaves como 'q[id_in]'
      value.forEach((item) => {
        searchParams.append(`${key}[]`, String(item));
      });
    } else {
      searchParams.append(key, String(value));
    }
  }

  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

// API travada vira erro na tela, nunca carregamento infinito. Upload de arquivo precisa de mais tempo.
export const API_TIMEOUT_MS = 8000;
export const API_UPLOAD_TIMEOUT_MS = 60000;

/**
 * Soma o tempo limite ao signal de quem chamou: qualquer um dos dois cancela a requisição.
 * Usa AbortController porque AbortSignal.any ainda falta em navegadores aceitos pelo Next.
 */
function withTimeoutSignal(timeoutMs: number, callerSignal?: AbortSignal | null) {
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!callerSignal) return { signal: timeout, timeout };

  const combined = new AbortController();
  for (const source of [callerSignal, timeout]) {
    if (source.aborted) combined.abort(source.reason);
    else source.addEventListener('abort', () => combined.abort(source.reason), { once: true, signal: combined.signal });
  }
  return { signal: combined.signal, timeout };
}

/**
 * fetch com tempo limite, para o que não passa por apiFetch. A leitura do corpo também é coberta.
 */
export function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number = API_TIMEOUT_MS
): Promise<Response> {
  return fetch(input, { ...init, signal: withTimeoutSignal(timeoutMs, init.signal).signal });
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'TimeoutError';
}

// Rejeição do próprio fetch: o servidor não foi alcançado, o que não diz nada sobre a sessão ou os dados.
export function isConnectionFailure(error: unknown): boolean {
  return isTimeoutError(error) || error instanceof TypeError;
}

function timeoutError(): ApiError {
  return ApiError.fromResponse(0, {
    message: API_TIMEOUT_MESSAGE,
    errors: ['tempo_esgotado'],
  });
}

// Mutex de renovação concorrente de tokens: apenas 1 chamada a /auth/refresh_token por vez
let activeRefreshPromise: Promise<boolean> | null = null;

/**
 * As permissões não ficam no token: cada refresh relê o GET /auth/me.
 * Se a leitura falhar, as permissões atuais continuam até a próxima confirmação.
 */
export async function reloadPermissions(accessToken: string): Promise<void> {
  try {
    const response = await fetchWithTimeout(`${getApiBaseUrl()}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return;
    const data = (await response.json()) as ApiResponse<AuthUser>;
    if (data.success && data.data) definirPermissoes(data.data);
  } catch {
    // Mantém as permissões já confirmadas.
  }
}

async function executeTokenRefresh(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredTokens();
    return false;
  }

  try {
    const response = await fetchWithTimeout(`${getApiBaseUrl()}/auth/refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearStoredTokens();
      return false;
    }

    const data = (await response.json()) as ApiResponse<AuthTokens>;
    if (data.success && data.data?.access_token && data.data?.refresh_token) {
      setStoredTokens(data.data);
      await reloadPermissions(data.data.access_token);
      return true;
    }

    clearStoredTokens();
    return false;
  } catch {
    clearStoredTokens();
    return false;
  }
}

export interface ApiFetchOptions extends RequestInit {
  params?: QueryParams | Record<string, unknown>;
  skipAuth?: boolean;
  timeoutMs?: number;
}

/**
 * Cliente HTTP unificado para comunicação com a API MEDTEC
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
  isRetry: boolean = false
): Promise<T> {
  const { params, skipAuth, timeoutMs, signal: callerSignal, ...fetchOptions } = options;

  const queryString = buildQueryString(params);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? `${endpoint}${queryString}`
    : `${getApiBaseUrl()}${cleanEndpoint}${queryString}`;

  const headers = new Headers(fetchOptions.headers || {});

  // Define Content-Type application/json só quando há corpo, se não for FormData e se não foi explicitamente setado.
  // Sem corpo, o header só forçaria um preflight de CORS a cada URL pública.
  if (fetchOptions.body != null && !(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Injeta Authorization: Bearer <token>
  if (!skipAuth) {
    const token = getStoredAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const { signal, timeout } = withTimeoutSignal(
    timeoutMs ?? (fetchOptions.body instanceof FormData ? API_UPLOAD_TIMEOUT_MS : API_TIMEOUT_MS),
    callerSignal
  );

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
      signal,
    });
  } catch {
    if (timeout.aborted) throw timeoutError();
    throw ApiError.fromResponse(0, {
      message: API_UNREACHABLE_MESSAGE,
      errors: ['falha_de_rede'],
    });
  }

  // Tratamento de 401: Renovação automática se 'token_expirado'
  if (response.status === 401 && !isRetry && !skipAuth && !endpoint.includes('/auth/refresh_token')) {
    let errorJson: { errors?: string[] } | null = null;
    try {
      errorJson = (await response.clone().json()) as { errors?: string[] };
    } catch {
      // Ignora erro de parse
    }

    const firstError = errorJson?.errors?.[0];
    if (firstError === 'token_expirado') {
      // Aciona o mutex de refresh garantindo execução única
      activeRefreshPromise ??= executeTokenRefresh().finally(() => {
        activeRefreshPromise = null;
      });

      const refreshSuccess = await activeRefreshPromise;
      if (refreshSuccess) {
        // Repete a requisição original apenas uma vez com os novos tokens
        return apiFetch<T>(endpoint, options, true);
      } else {
        clearStoredTokens();
      }
    } else {
      // Outro erro 401 (nao_autenticado, token_revogado, usuario_inativo)
      clearStoredTokens();
    }
  }

  // Resposta HTTP 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  let responseData: unknown = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      // O corpo pode travar depois dos headers; sem isso, a falha viraria resposta vazia.
      if (timeout.aborted) throw timeoutError();
      // JSON inválido
    }
  }

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, responseData);
  }

  return responseData as T;
}
