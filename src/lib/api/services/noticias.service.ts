/**
 * Serviço de Notícias e Fila Editorial da API MEDTEC
 * Especificações oficiais de ROTAS_FRONT.md seções 18 (CMS) e 19 (Site público)
 */

import { apiFetch } from '../client';
import { ApiError } from '../errors';
import {
  ApiResponse,
  PaginatedData,
  QueryParams,
  NNoticia,
  NNoticiaInput,
  NCategoriaNoticia,
  NCategoriaNoticiaInput,
  NStatusNoticia,
  NoticiaPublica,
  CategoriaPublica,
  PublicoNoticiasParams,
} from '../types';

export const noticiasService = {
  // ==========================================================================
  // CMS AUTENTICADO (Requer token e permissão no backend)
  // ==========================================================================

  /**
   * Lista notícias no CMS com paginação e filtros (ordem decrescente de data)
   * Filtros úteis: q[n_status_noticia_slug_eq]=aguardando (fila de aprovação)
   * Endpoint: GET /n_noticias
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<NNoticia>>> {
    return apiFetch<ApiResponse<PaginatedData<NNoticia>>>('/n_noticias', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta uma notícia pelo ID (retorna objeto direto)
   * Endpoint: GET /n_noticias/:id
   */
  async get(id: number): Promise<NNoticia> {
    return apiFetch<NNoticia>(`/n_noticias/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra uma nova notícia (JSON ou FormData para upload de imagem_capa)
   * Endpoint: POST /n_noticias
   */
  async create(data: FormData | { n_noticia: NNoticiaInput }): Promise<NNoticia> {
    return apiFetch<NNoticia>('/n_noticias', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Edita uma notícia existente (JSON ou FormData)
   * Endpoint: PATCH /n_noticias/:id
   */
  async update(id: number, data: FormData | { n_noticia: Partial<NNoticiaInput> }): Promise<NNoticia> {
    return apiFetch<NNoticia>(`/n_noticias/${id}`, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Exclui uma notícia (exclusão lógica - retorna 204 sem corpo)
   * Endpoint: DELETE /n_noticias/:id
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/n_noticias/${id}`, { method: 'DELETE' });
  },

  /**
   * Botão "Publicar": aprova e publica notícia no site
   * Endpoint: PATCH /n_noticias/:id/publicar (sem corpo)
   */
  async publicar(id: number): Promise<NNoticia> {
    return apiFetch<NNoticia>(`/n_noticias/${id}/publicar`, {
      method: 'PATCH',
    });
  },

  /**
   * Botão "Reprovar": reprova notícia informando o motivo
   * Endpoint: PATCH /n_noticias/:id/reprovar
   */
  async reprovar(id: number, motivo: string): Promise<NNoticia> {
    const trimmed = (motivo || '').trim();
    if (!trimmed) {
      throw new ApiError('O motivo da reprovação é obrigatório.', 422, ['motivo_obrigatorio']);
    }
    return apiFetch<NNoticia>(`/n_noticias/${id}/reprovar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo: trimmed }),
    });
  },

  /**
   * Botão "Despublicar": retira do site e devolve à fila de aprovação (aguardando)
   * Endpoint: PATCH /n_noticias/:id/despublicar (sem corpo)
   */
  async despublicar(id: number): Promise<NNoticia> {
    return apiFetch<NNoticia>(`/n_noticias/${id}/despublicar`, {
      method: 'PATCH',
    });
  },

  /**
   * Lista categorias de notícias para formulários e filtros do CMS
   * Endpoint: GET /n_categorias_noticia
   */
  async listCategorias(
    params?: QueryParams | Record<string, unknown>
  ): Promise<ApiResponse<PaginatedData<NCategoriaNoticia>>> {
    return apiFetch<ApiResponse<PaginatedData<NCategoriaNoticia>>>('/n_categorias_noticia', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta uma categoria de notícia pelo ID
   * Endpoint: GET /n_categorias_noticia/:id
   */
  async getCategoria(id: number): Promise<NCategoriaNoticia> {
    return apiFetch<NCategoriaNoticia>(`/n_categorias_noticia/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra uma nova categoria de notícia
   * Endpoint: POST /n_categorias_noticia
   */
  async createCategoria(data: NCategoriaNoticiaInput): Promise<NCategoriaNoticia> {
    return apiFetch<NCategoriaNoticia>('/n_categorias_noticia', {
      method: 'POST',
      body: JSON.stringify({ n_categoria_noticia: data }),
    });
  },

  /**
   * Atualiza uma categoria de notícia existente
   * Endpoint: PATCH /n_categorias_noticia/:id
   */
  async updateCategoria(id: number, data: Partial<NCategoriaNoticiaInput>): Promise<NCategoriaNoticia> {
    return apiFetch<NCategoriaNoticia>(`/n_categorias_noticia/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ n_categoria_noticia: data }),
    });
  },

  /**
   * Exclui categoria de notícia (422 se ainda tiver notícias associadas)
   * Endpoint: DELETE /n_categorias_noticia/:id
   */
  async deleteCategoria(id: number): Promise<void> {
    return apiFetch<void>(`/n_categorias_noticia/${id}`, { method: 'DELETE' });
  },

  /**
   * Lista status oficiais de notícias (Aguardando aprovação, Reprovada, Publicada)
   * Endpoint: GET /n_status_noticias
   */
  async listStatus(
    params?: QueryParams | Record<string, unknown>
  ): Promise<ApiResponse<PaginatedData<NStatusNoticia>>> {
    return apiFetch<ApiResponse<PaginatedData<NStatusNoticia>>>('/n_status_noticias', {
      method: 'GET',
      params,
    });
  },

  // ==========================================================================
  // SITE PÚBLICO (SEM LOGIN / SEM TOKEN)
  // ==========================================================================

  /**
   * Lista notícias públicas para os cards e listagens do portal
   * Filtros: categoria (slug), busca (título), page, per_page
   * Endpoint: GET /publico/n_noticias
   */
  async listPublico(
    params?: PublicoNoticiasParams | Record<string, unknown>
  ): Promise<ApiResponse<PaginatedData<NoticiaPublica>>> {
    return apiFetch<ApiResponse<PaginatedData<NoticiaPublica>>>('/publico/n_noticias', {
      method: 'GET',
      params,
      skipAuth: true,
    });
  },

  /**
   * Consulta notícia pública completa pelo slug
   * Endpoint: GET /publico/n_noticias/:slug
   */
  async getPublicoBySlug(slug: string): Promise<ApiResponse<NoticiaPublica>> {
    const cleanSlug = encodeURIComponent(slug.trim());
    return apiFetch<ApiResponse<NoticiaPublica>>(`/publico/n_noticias/${cleanSlug}`, {
      method: 'GET',
      skipAuth: true,
    });
  },

  /**
   * Lista categorias ativas no portal público em ordem alfabética
   * Endpoint: GET /publico/n_categorias_noticia
   */
  async listCategoriasPublico(): Promise<ApiResponse<CategoriaPublica[]>> {
    return apiFetch<ApiResponse<CategoriaPublica[]>>('/publico/n_categorias_noticia', {
      method: 'GET',
      skipAuth: true,
    });
  },
};
