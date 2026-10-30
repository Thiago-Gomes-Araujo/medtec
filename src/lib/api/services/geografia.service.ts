/**
 * Serviço de Dados Geográficos (Estados e Cidades) da API MEDTEC
 * Conforme especificações de docs/rotas_front.md seções 10 e 11
 */

import { apiFetch } from '../client';
import {
  ApiResponse,
  PaginatedData,
  Estado,
  EstadoInput,
  Cidade,
  CidadeInput,
  QueryParams,
} from '../types';

export const estadosService = {
  /**
   * Lista estados com suporte a paginação e filtros (ex: page=all para selects)
   * Endpoint: GET /g_estados
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<Estado>>> {
    return apiFetch<ApiResponse<PaginatedData<Estado>>>('/g_estados', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta os dados de um estado pelo ID
   * Endpoint: GET /g_estados/:id
   */
  async get(id: number): Promise<Estado> {
    return apiFetch<Estado>(`/g_estados/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra um novo estado
   * Endpoint: POST /g_estados
   */
  async create(data: EstadoInput): Promise<Estado> {
    return apiFetch<Estado>('/g_estados', {
      method: 'POST',
      body: JSON.stringify({ g_estado: data }),
    });
  },

  /**
   * Atualiza um estado existente
   * Endpoint: PATCH /g_estados/:id
   */
  async update(id: number, data: Partial<EstadoInput>): Promise<Estado> {
    return apiFetch<Estado>(`/g_estados/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ g_estado: data }),
    });
  },

  /**
   * Exclui um estado (exclusão lógica)
   * Endpoint: DELETE /g_estados/:id
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/g_estados/${id}`, { method: 'DELETE' });
  },
};

export const cidadesService = {
  /**
   * Lista cidades com suporte a filtros (ex: q[g_estado_id_eq]=1&page=all)
   * Endpoint: GET /g_cidades
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<Cidade>>> {
    return apiFetch<ApiResponse<PaginatedData<Cidade>>>('/g_cidades', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta os dados de uma cidade pelo ID
   * Endpoint: GET /g_cidades/:id
   */
  async get(id: number): Promise<Cidade> {
    return apiFetch<Cidade>(`/g_cidades/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra uma nova cidade associada a um estado
   * Endpoint: POST /g_cidades
   */
  async create(data: CidadeInput): Promise<Cidade> {
    return apiFetch<Cidade>('/g_cidades', {
      method: 'POST',
      body: JSON.stringify({ g_cidade: data }),
    });
  },

  /**
   * Atualiza uma cidade existente
   * Endpoint: PATCH /g_cidades/:id
   */
  async update(id: number, data: Partial<CidadeInput>): Promise<Cidade> {
    return apiFetch<Cidade>(`/g_cidades/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ g_cidade: data }),
    });
  },

  /**
   * Exclui uma cidade (exclusão lógica)
   * Endpoint: DELETE /g_cidades/:id
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/g_cidades/${id}`, { method: 'DELETE' });
  },
};
