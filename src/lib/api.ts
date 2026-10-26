/**
 * Cliente de Integração com a API Backend MEDTEC Rondônia (Rails API v1)
 * Especificação e contratos definidos em: docs/rotas_front.md
 * URL Base: http://172.16.107.63:3023/api/v1 (ou configurável via NEXT_PUBLIC_API_URL)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  'http://172.16.107.63:3023/api/v1';

// ============================================================================
// Tipos e Interfaces Oficiais (rotas_front.md)
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
  erro_bruto?: string;
  timestamp: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthUser {
  id: number;
  nome: string;
  cpf: string;
  ativo: boolean;
  perfil_id: number;
  perfil_nome: string;
}

export interface TokenPayload {
  user_id: number;
  perfil_id: number;
  perfil_nome: string;
  usuario_ativo: boolean;
  iat: number;
  exp: number;
  jti: string;
}

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  ativo: boolean;
  perfil_id: number;
  perfil_nome: string;
  created_at: string;
  updated_at: string;
}

export interface Perfil {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RegraPermissao {
  id: number;
  acao: string;
  descricao: string;
  marcada: boolean;
}

export interface ModuloPermissoes {
  id: number;
  nome: string;
  regras: RegraPermissao[];
}

export interface RegraExtra {
  id: number;
  acao: string;
  descricao: string;
  do_perfil: boolean;
  extra: boolean;
  concedido_por: string | null;
}

export interface ModuloPermissoesExtras {
  id: number;
  nome: string;
  regras: RegraExtra[];
}

export interface Estado {
  id: number;
  nome: string;
  sigla_uf: string;
  codigo_ibge?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Cidade {
  id: number;
  nome: string;
  codigo_ibge?: string;
  g_estado_id: number;
  g_estado?: Estado;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Gerenciamento de Tokens no Navegador (LocalStorage)
// ============================================================================

const TOKEN_KEY = 'medtec_access_token';
const REFRESH_TOKEN_KEY = 'medtec_refresh_token';

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Decodifica o payload do access_token sem depender de bibliotecas externas.
 */
export function decodeAccessToken(token?: string | null): TokenPayload | null {
  const target = token || getStoredAccessToken();
  if (!target) return null;

  try {
    const parts = target.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as TokenPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// Interceptor & Handler de Concorrência para Refresh de Token
// ============================================================================

let pendingRefreshPromise: Promise<AuthTokens | null> | null = null;

async function executeRefreshToken(): Promise<AuthTokens | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredTokens();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearStoredTokens();
      return null;
    }

    const data: ApiResponse<AuthTokens> = await response.json();
    if (data.success && data.data) {
      setStoredTokens(data.data);
      return data.data;
    }

    clearStoredTokens();
    return null;
  } catch {
    clearStoredTokens();
    return null;
  }
}

/**
 * Requisição segura com injeção automática de Bearer token e auto-refresh em 401 'token_expirado'.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = getStoredAccessToken();

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Se o token expirou (401 com errors = ["token_expirado"]), executa refresh atômico e repete
  if (response.status === 401 && !isRetry) {
    try {
      const errorJson = (await response.clone().json()) as Partial<ApiErrorResponse>;
      if (errorJson.errors?.includes('token_expirado')) {
        // Garante uma única renovação por vez para evitar invalidação concorrente
        pendingRefreshPromise ??= executeRefreshToken().finally(() => {
          pendingRefreshPromise = null;
        });

        const newTokens = await pendingRefreshPromise;
        if (newTokens?.access_token) {
          // Repete a requisição original com o novo token
          return apiFetch<T>(endpoint, options, true);
        }
      }
    } catch {
      // Se não for JSON ou falhar o parse, prossegue com o erro padrão
    }
  }

  // Tratamento de respostas de sucesso sem corpo (204 No Content)
  if (response.status === 204) {
    return null as T;
  }

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData as ApiErrorResponse;
  }

  return responseData as T;
}

// ============================================================================
// Métodos de Integração da API (Agrupados por Módulo)
// ============================================================================

export const medtecApi = {
  // 1. AUTENTICAÇÃO (/auth)
  auth: {
    async login(cpf: string, password: string): Promise<ApiResponse<AuthTokens>> {
      const res = await apiFetch<ApiResponse<AuthTokens>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ cpf, password }),
      });
      if (res.success && res.data) {
        setStoredTokens(res.data);
      }
      return res;
    },

    async refreshToken(): Promise<ApiResponse<AuthTokens>> {
      const refreshToken = getStoredRefreshToken();
      const res = await apiFetch<ApiResponse<AuthTokens>>('/auth/refresh_token', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (res.success && res.data) {
        setStoredTokens(res.data);
      }
      return res;
    },

    async me(): Promise<ApiResponse<AuthUser>> {
      return apiFetch<ApiResponse<AuthUser>>('/auth/me', { method: 'GET' });
    },

    async logout(): Promise<void> {
      try {
        await apiFetch<ApiResponse<null>>('/auth/logout', { method: 'DELETE' });
      } finally {
        clearStoredTokens();
      }
    },

    getTokens: getStoredAccessToken,
    clearTokens: clearStoredTokens,
    getDecodedToken: decodeAccessToken,
    isAuthenticated: () => !!getStoredAccessToken(),
  },

  // 2. USUÁRIOS (/usuarios)
  usuarios: {
    async list(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedData<Usuario>>> {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return apiFetch<ApiResponse<PaginatedData<Usuario>>>(`/usuarios${search}`);
    },

    async get(id: number): Promise<Usuario> {
      return apiFetch<Usuario>(`/usuarios/${id}`);
    },

    async create(data: {
      nome: string;
      cpf: string;
      password: string;
      perfil_id: number;
      ativo?: boolean;
    }): Promise<Usuario> {
      return apiFetch<Usuario>('/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(
      id: number,
      data: Partial<{
        nome: string;
        cpf: string;
        password: string;
        perfil_id: number;
        ativo: boolean;
      }>
    ): Promise<Usuario> {
      return apiFetch<Usuario>(`/usuarios/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    async delete(id: number): Promise<void> {
      return apiFetch<void>(`/usuarios/${id}`, { method: 'DELETE' });
    },

    async getPermissoesExtras(usuarioId: number): Promise<ApiResponse<ModuloPermissoesExtras[]>> {
      return apiFetch<ApiResponse<ModuloPermissoesExtras[]>>(`/usuarios/${usuarioId}/permissoes_extras`);
    },

    async savePermissoesExtras(usuarioId: number, regraIds: number[]): Promise<void> {
      return apiFetch<void>(`/usuarios/${usuarioId}/permissoes_extras`, {
        method: 'PUT',
        body: JSON.stringify({ regra_ids: regraIds }),
      });
    },
  },

  // 3. PERFIS (/perfis)
  perfis: {
    async list(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedData<Perfil>>> {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return apiFetch<ApiResponse<PaginatedData<Perfil>>>(`/perfis${search}`);
    },

    async get(id: number): Promise<Perfil> {
      return apiFetch<Perfil>(`/perfis/${id}`);
    },

    async create(data: { nome: string; descricao?: string; ativo?: boolean }): Promise<Perfil> {
      return apiFetch<Perfil>('/perfis', {
        method: 'POST',
        body: JSON.stringify({ perfil: data }),
      });
    },

    async update(id: number, data: Partial<{ nome: string; descricao: string; ativo: boolean }>): Promise<Perfil> {
      return apiFetch<Perfil>(`/perfis/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ perfil: data }),
      });
    },

    async delete(id: number): Promise<void> {
      return apiFetch<void>(`/perfis/${id}`, { method: 'DELETE' });
    },

    async getPermissoes(perfilId: number): Promise<ApiResponse<ModuloPermissoes[]>> {
      return apiFetch<ApiResponse<ModuloPermissoes[]>>(`/perfis/${perfilId}/permissoes`);
    },

    async savePermissoes(perfilId: number, regraIds: number[]): Promise<void> {
      return apiFetch<void>(`/perfis/${perfilId}/permissoes`, {
        method: 'PUT',
        body: JSON.stringify({ regra_ids: regraIds }),
      });
    },
  },

  // 4. ESTADOS (/g_estados)
  estados: {
    async list(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedData<Estado>>> {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return apiFetch<ApiResponse<PaginatedData<Estado>>>(`/g_estados${search}`);
    },

    async get(id: number): Promise<Estado> {
      return apiFetch<Estado>(`/g_estados/${id}`);
    },

    async create(data: { nome: string; sigla_uf: string; codigo_ibge?: string }): Promise<Estado> {
      return apiFetch<Estado>('/g_estados', {
        method: 'POST',
        body: JSON.stringify({ g_estado: data }),
      });
    },

    async update(id: number, data: Partial<{ nome: string; sigla_uf: string; codigo_ibge: string }>): Promise<Estado> {
      return apiFetch<Estado>(`/g_estados/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ g_estado: data }),
      });
    },

    async delete(id: number): Promise<void> {
      return apiFetch<void>(`/g_estados/${id}`, { method: 'DELETE' });
    },
  },

  // 5. CIDADES (/g_cidades)
  cidades: {
    async list(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedData<Cidade>>> {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return apiFetch<ApiResponse<PaginatedData<Cidade>>>(`/g_cidades${search}`);
    },

    async get(id: number): Promise<Cidade> {
      return apiFetch<Cidade>(`/g_cidades/${id}`);
    },

    async create(data: { g_estado_id: number; nome: string; codigo_ibge?: string }): Promise<Cidade> {
      return apiFetch<Cidade>('/g_cidades', {
        method: 'POST',
        body: JSON.stringify({ g_cidade: data }),
      });
    },

    async update(id: number, data: Partial<{ g_estado_id: number; nome: string; codigo_ibge: string }>): Promise<Cidade> {
      return apiFetch<Cidade>(`/g_cidades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ g_cidade: data }),
      });
    },

    async delete(id: number): Promise<void> {
      return apiFetch<void>(`/g_cidades/${id}`, { method: 'DELETE' });
    },
  },
};

export default medtecApi;
