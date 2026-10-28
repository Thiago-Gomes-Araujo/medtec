/**
 * Cliente de Integração com a API Backend Oficial MEDTEC Rondônia (Rails API v1)
 * Especificação e contratos definidos em: docs/rotas_front.md / ROTAS_FRONT.md
 * URL Base: http://localhost:3000/api/v1 (ou configurável via NEXT_PUBLIC_API_URL)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const API_SERVER_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Monta URL de imagem do Active Storage ou retorna link externo.
 */
export function getMediaUrl(imagePathOrUrl?: string | null): string {
  if (!imagePathOrUrl) return '';
  if (imagePathOrUrl.startsWith('http://') || imagePathOrUrl.startsWith('https://')) {
    return imagePathOrUrl;
  }
  if (imagePathOrUrl.startsWith('/rails/active_storage') || imagePathOrUrl.startsWith('/')) {
    return `${API_SERVER_URL}${imagePathOrUrl}`;
  }
  return `${API_SERVER_URL}/${imagePathOrUrl}`;
}

// ============================================================================
// Tipos e Interfaces Oficiais (ROTAS_FRONT.md)
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
  timestamp?: string;
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
  perfil_nome?: string;
  created_at: string;
  updated_at: string;
}

export interface Perfil {
  id: number;
  nome: string;
  descricao?: string | null;
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
  codigo_ibge?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Cidade {
  id: number;
  nome: string;
  codigo_ibge?: string | null;
  g_estado_id: number;
  created_at?: string;
  updated_at?: string;
  g_estado?: Estado;
}

export interface ATipoAviso {
  id: number;
  nome: string;
  slug: string;
  cor: string;
  posicao: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AAviso {
  id: number;
  titulo: string;
  a_tipo_aviso_id: number;
  conteudo: string;
  link_texto?: string | null;
  link_url?: string | null;
  ativo: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  a_tipo_aviso?: ATipoAviso;
}

export interface CategoriaGaleria {
  id: number;
  nome: string;
  slug: string;
  posicao: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FotoGaleria {
  id: number;
  titulo: string;
  categoria_galeria_id: number;
  descricao?: string | null;
  imagem_url?: string | null;
  imagem?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  categoria_galeria?: CategoriaGaleria;
}

export interface CanalContato {
  id?: number;
  rede: 'youtube' | 'instagram' | 'facebook' | 'whatsapp' | 'telefone' | 'email' | 'endereco' | string;
  valor: string;
  posicao: number;
  ativo: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Gerenciamento de Tokens no Navegador (LocalStorage)
// ============================================================================

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
// Suporte retrocompatível
const LEGACY_TOKEN_KEY = 'medtec_access_token';
const LEGACY_REFRESH_TOKEN_KEY = 'medtec_refresh_token';

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY);
}

export function setStoredTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  // Mantém retrocompatibilidade
  localStorage.setItem(LEGACY_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
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

let refreshPromise: Promise<boolean> | null = null;

async function executeRefreshToken(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredTokens();
    return false;
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
      return false;
    }

    const data: ApiResponse<AuthTokens> = await response.json();
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

/**
 * Cliente HTTP centralizado com injeção automática de Bearer token,
 * trava contra refresh paralelo e auto-refresh em 401 'token_expirado'.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = getStoredAccessToken();

  const headers = new Headers(options.headers || {});

  // Define Content-Type JSON somente se não for FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Se o token expirou (401 com errors = ["token_expirado"]), aciona mutex de refresh
  if (response.status === 401 && !isRetry) {
    let errorData: Partial<ApiErrorResponse> | null = null;
    try {
      errorData = (await response.clone().json()) as Partial<ApiErrorResponse>;
    } catch {
      // Se não for JSON, prossegue
    }

    if (errorData?.errors?.[0] === 'token_expirado') {
      // Trava contra refresh concorrente: apenas UMA chamada real a /auth/refresh_token
      refreshPromise ??= executeRefreshToken().finally(() => {
        refreshPromise = null;
      });

      const refreshSuccess = await refreshPromise;
      if (refreshSuccess) {
        // Repete a requisição original com o novo token
        return apiFetch<T>(endpoint, options, true);
      } else {
        clearStoredTokens();
      }
    } else {
      // Erro 401 definitivo (nao_autenticado, token_revogado, etc)
      clearStoredTokens();
    }
  }

  // Resposta 204 No Content (sem corpo)
  if (response.status === 204) {
    return null as T;
  }

  let responseData: unknown = null;
  try {
    responseData = await response.json();
  } catch {
    // Caso a resposta não tenha JSON
  }

  if (!response.ok) {
    throw (responseData || {
      success: false,
      message: `Erro na requisição (Status ${response.status})`,
      errors: [`http_${response.status}`],
    }) as ApiErrorResponse;
  }

  return responseData as T;
}

// ============================================================================
// Métodos Oficiais de Integração da API v1
// ============================================================================

export const medtecApi = {
  // 1. AUTENTICAÇÃO (/auth)
  auth: {
    async login(cpf: string, password: string): Promise<ApiResponse<AuthTokens>> {
      const cleanCpf = cpf.trim();
      const res = await apiFetch<ApiResponse<AuthTokens>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ cpf: cleanCpf, password }),
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

  // 6. TIPOS DE AVISO (/a_tipos_aviso)
  tiposAviso: {
    async list(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedData<ATipoAviso>>> {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return apiFetch<ApiResponse<PaginatedData<ATipoAviso>>>(`/a_tipos_aviso${search}`);
    },

    async get(id: number): Promise<ATipoAviso> {
      return apiFetch<ATipoAviso>(`/a_tipos_aviso/${id}`);
    },

    async create(data: { nome: string; slug: string; cor: string; posicao?: number; ativo?: boolean }): Promise<ATipoAviso> {
      return apiFetch<ATipoAviso>('/a_tipos_aviso', {
        method: 'POST',
        body: JSON.stringify({ a_tipo_aviso: data }),
      });
    },

    async update(
      id: number,
      data: Partial<{ nome: string; slug: string; cor: string; posicao: number; ativo: boolean }>
    ): Promise<ATipoAviso> {
      return apiFetch<ATipoAviso>(`/a_tipos_aviso/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ a_tipo_aviso: data }),
      });
    },

    async delete(id: number): Promise<void> {
      return apiFetch<void>(`/a_tipos_aviso/${id}`, { method: 'DELETE' });
    },
  },

  // 7. AVISOS (/a_avisos)
  avisos: {
    async list(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedData<AAviso>>> {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return apiFetch<ApiResponse<PaginatedData<AAviso>>>(`/a_avisos${search}`);
    },

    async get(id: number): Promise<AAviso> {
      return apiFetch<AAviso>(`/a_avisos/${id}`);
    },

    async create(data: {
      titulo: string;
      a_tipo_aviso_id: number;
      conteudo: string;
      link_texto?: string;
      link_url?: string;
      ativo?: boolean;
    }): Promise<AAviso> {
      return apiFetch<AAviso>('/a_avisos', {
        method: 'POST',
        body: JSON.stringify({ a_aviso: data }),
      });
    },

    async update(
      id: number,
      data: Partial<{
        titulo: string;
        a_tipo_aviso_id: number;
        conteudo: string;
        link_texto: string;
        link_url: string;
        ativo: boolean;
      }>
    ): Promise<AAviso> {
      return apiFetch<AAviso>(`/a_avisos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ a_aviso: data }),
      });
    },

    async delete(id: number): Promise<void> {
      return apiFetch<void>(`/a_avisos/${id}`, { method: 'DELETE' });
    },
  },

  // 8. CATEGORIAS DA GALERIA (/categorias_galeria)
  categoriasGaleria: {
    async list(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedData<CategoriaGaleria>>> {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return apiFetch<ApiResponse<PaginatedData<CategoriaGaleria>>>(`/categorias_galeria${search}`);
    },

    async get(id: number): Promise<CategoriaGaleria> {
      return apiFetch<CategoriaGaleria>(`/categorias_galeria/${id}`);
    },

    async create(data: { nome: string; slug: string; posicao?: number; ativo?: boolean }): Promise<CategoriaGaleria> {
      return apiFetch<CategoriaGaleria>('/categorias_galeria', {
        method: 'POST',
        body: JSON.stringify({ categoria_galeria: data }),
      });
    },

    async update(
      id: number,
      data: Partial<{ nome: string; slug: string; posicao: number; ativo: boolean }>
    ): Promise<CategoriaGaleria> {
      return apiFetch<CategoriaGaleria>(`/categorias_galeria/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ categoria_galeria: data }),
      });
    },

    async delete(id: number): Promise<void> {
      return apiFetch<void>(`/categorias_galeria/${id}`, { method: 'DELETE' });
    },
  },

  // 9. FOTOS DA GALERIA (/fotos_galeria)
  fotosGaleria: {
    async list(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedData<FotoGaleria>>> {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return apiFetch<ApiResponse<PaginatedData<FotoGaleria>>>(`/fotos_galeria${search}`);
    },

    async get(id: number): Promise<FotoGaleria> {
      return apiFetch<FotoGaleria>(`/fotos_galeria/${id}`);
    },

    /**
     * Suporta criação com FormData (arquivo) ou JSON (link externo).
     */
    async create(data: FormData | {
      foto_galeria: {
        titulo: string;
        categoria_galeria_id: number;
        descricao?: string;
        imagem_url?: string;
      };
    }): Promise<FotoGaleria> {
      return apiFetch<FotoGaleria>('/fotos_galeria', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
    },

    async update(
      id: number,
      data: FormData | {
        foto_galeria: Partial<{
          titulo: string;
          categoria_galeria_id: number;
          descricao: string;
          imagem_url: string;
        }>;
      }
    ): Promise<FotoGaleria> {
      return apiFetch<FotoGaleria>(`/fotos_galeria/${id}`, {
        method: 'PATCH',
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
    },

    async delete(id: number): Promise<void> {
      return apiFetch<void>(`/fotos_galeria/${id}`, { method: 'DELETE' });
    },
  },

  // 10. CANAIS DE CONTATO (/canais_contato)
  canaisContato: {
    async list(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedData<CanalContato>>> {
      const search = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return apiFetch<ApiResponse<PaginatedData<CanalContato>>>(`/canais_contato${search}`);
    },

    async updateMany(canais: Partial<CanalContato>[]): Promise<ApiResponse<CanalContato[]>> {
      return apiFetch<ApiResponse<CanalContato[]>>('/canais_contato', {
        method: 'PUT',
        body: JSON.stringify({ canais_contato: canais }),
      });
    },
  },
};

export default medtecApi;
