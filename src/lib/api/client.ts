/**
 * Cliente HTTP Centralizado da API MEDTEC
 * Gerencia URL-base, headers, serialização de query params/filtros,
 * autenticação por Bearer token, suporte a FormData, e mutex de renovação de token.
 */

import { ApiResponse, AuthTokens, QueryParams } from './types';
import { ApiError } from './errors';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
} from './tokens';

/**
 * Obtém a URL-base configurada da API (ex: http://localhost:3000/api/v1).
 * Lê prioritariamente NEXT_PUBLIC_API_URL do navegador/ambiente.
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

// Mutex de renovação concorrente de tokens: apenas 1 chamada a /auth/refresh_token por vez
let activeRefreshPromise: Promise<boolean> | null = null;

async function executeTokenRefresh(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredTokens();
    return false;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/refresh_token`, {
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
}

/**
 * Cliente HTTP unificado para comunicação com a API MEDTEC
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
  isRetry: boolean = false
): Promise<T> {
  const { params, skipAuth, ...fetchOptions } = options;

  const queryString = buildQueryString(params);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? `${endpoint}${queryString}`
    : `${getApiBaseUrl()}${cleanEndpoint}${queryString}`;

  const headers = new Headers(fetchOptions.headers || {});

  // Define Content-Type application/json se não for FormData e se não foi explicitamente setado
  if (!(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Injeta Authorization: Bearer <token>
  if (!skipAuth) {
    const token = getStoredAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw ApiError.fromResponse(0, {
      message: 'Falha de conexão com a API do MEDTEC. Verifique sua rede e a URL do servidor.',
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
      // JSON inválido
    }
  }

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, responseData);
  }

  return responseData as T;
}
