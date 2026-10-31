/**
 * Serviço de Avisos e Tipos de Aviso da API MEDTEC
 * Conforme especificações de docs/rotas_front.md seções 12 e 13
 */

import { apiFetch } from '../client';
import {
  ApiResponse,
  PaginatedData,
  ATipoAviso,
  ATipoAvisoInput,
  AAviso,
  AAvisoInput,
  QueryParams,
  AvisoPublico,
  PublicoAvisosParams,
} from '../types';

export const tiposAvisoService = {
  /**
   * Lista os tipos de aviso (ordenados por posição)
   * Endpoint: GET /a_tipos_aviso
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<ATipoAviso>>> {
    return apiFetch<ApiResponse<PaginatedData<ATipoAviso>>>('/a_tipos_aviso', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta os dados de um tipo de aviso
   * Endpoint: GET /a_tipos_aviso/:id
   */
  async get(id: number): Promise<ATipoAviso> {
    return apiFetch<ATipoAviso>(`/a_tipos_aviso/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra um novo tipo de aviso
   * Endpoint: POST /a_tipos_aviso
   */
  async create(data: ATipoAvisoInput): Promise<ATipoAviso> {
    return apiFetch<ATipoAviso>('/a_tipos_aviso', {
      method: 'POST',
      body: JSON.stringify({ a_tipo_aviso: data }),
    });
  },

  /**
   * Atualiza um tipo de aviso existente
   * Endpoint: PATCH /a_tipos_aviso/:id
   */
  async update(id: number, data: Partial<ATipoAvisoInput>): Promise<ATipoAviso> {
    return apiFetch<ATipoAviso>(`/a_tipos_aviso/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ a_tipo_aviso: data }),
    });
  },

  /**
   * Remove um tipo de aviso
   * Endpoint: DELETE /a_tipos_aviso/:id
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/a_tipos_aviso/${id}`, { method: 'DELETE' });
  },
};

export const avisosService = {
  /** Leitura anônima do site; mantém os métodos autenticados do CMS abaixo. */
  async listPublico(params?: PublicoAvisosParams): Promise<ApiResponse<PaginatedData<AvisoPublico>>> {
    const response = await apiFetch<ApiResponse<PaginatedData<AvisoPublico>>>('/publico/a_avisos', {
      method: 'GET', params: { ...params }, skipAuth: true, cache: 'no-store',
    });
    const items = response?.data?.items;
    const pagination = response?.data?.pagination;
    if (response?.success !== true || !Array.isArray(items) || !pagination ||
        !Number.isSafeInteger(pagination.current_page) || pagination.current_page < 1 ||
        !Number.isSafeInteger(pagination.total_pages) || pagination.total_pages < 0 ||
        !Number.isSafeInteger(pagination.total_count) || pagination.total_count < 0 ||
        !Number.isSafeInteger(pagination.per_page) || pagination.per_page < 1 ||
        items.some(item => !item ||
          !['titulo', 'conteudo', 'tipo_nome', 'tipo_slug', 'tipo_cor', 'created_at']
            .every(key => typeof item[key as keyof AvisoPublico] === 'string') ||
          !(item.link_texto === null || typeof item.link_texto === 'string') ||
          !(item.link_url === null || typeof item.link_url === 'string'))) {
      throw new Error('Resposta inválida da API pública de Avisos.');
    }
    return response;
  },

  /**
   * Lista os avisos ativos ou filtrados por tipo (mais recentes primeiro)
   * Endpoint: GET /a_avisos
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<AAviso>>> {
    return apiFetch<ApiResponse<PaginatedData<AAviso>>>('/a_avisos', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta os dados de um aviso pelo ID
   * Endpoint: GET /a_avisos/:id
   */
  async get(id: number): Promise<AAviso> {
    return apiFetch<AAviso>(`/a_avisos/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra um novo aviso institucional
   * Endpoint: POST /a_avisos
   */
  async create(data: AAvisoInput): Promise<AAviso> {
    return apiFetch<AAviso>('/a_avisos', {
      method: 'POST',
      body: JSON.stringify({ a_aviso: data }),
    });
  },

  /**
   * Atualiza um aviso existente
   * Endpoint: PATCH /a_avisos/:id
   */
  async update(id: number, data: Partial<AAvisoInput>): Promise<AAviso> {
    return apiFetch<AAviso>(`/a_avisos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ a_aviso: data }),
    });
  },

  /**
   * Exclui um aviso (exclusão lógica)
   * Endpoint: DELETE /a_avisos/:id
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/a_avisos/${id}`, { method: 'DELETE' });
  },
};
