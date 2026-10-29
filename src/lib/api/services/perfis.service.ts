/**
 * Serviço de Perfis e Permissões da API MEDTEC
 * Conforme especificações de docs/rotas_front.md seções 7 e 8
 */

import { apiFetch } from '../client';
import {
  ApiResponse,
  PaginatedData,
  Perfil,
  PerfilInput,
  ModuloPermissoes,
  QueryParams,
} from '../types';

export const perfisService = {
  /**
   * Lista perfis com paginação e filtros
   * Endpoint: GET /perfis
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<Perfil>>> {
    return apiFetch<ApiResponse<PaginatedData<Perfil>>>('/perfis', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta os dados de um perfil pelo ID (retorna objeto direto)
   * Endpoint: GET /perfis/:id
   */
  async get(id: number): Promise<Perfil> {
    return apiFetch<Perfil>(`/perfis/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra um novo perfil (retorna objeto direto)
   * Endpoint: POST /perfis
   */
  async create(data: PerfilInput): Promise<Perfil> {
    return apiFetch<Perfil>('/perfis', {
      method: 'POST',
      body: JSON.stringify({ perfil: data }),
    });
  },

  /**
   * Atualiza um perfil existente (retorna objeto direto)
   * Endpoint: PATCH /perfis/:id
   */
  async update(id: number, data: Partial<PerfilInput>): Promise<Perfil> {
    return apiFetch<Perfil>(`/perfis/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ perfil: data }),
    });
  },

  /**
   * Remove um perfil (retorna 204 sem corpo)
   * Endpoint: DELETE /perfis/:id
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/perfis/${id}`, { method: 'DELETE' });
  },

  /**
   * Consulta os módulos e permissões de um perfil com indicador booleano 'marcada'
   * Endpoint: GET /perfis/:perfil_id/permissoes
   */
  async getPermissoes(perfilId: number): Promise<ApiResponse<ModuloPermissoes[]>> {
    return apiFetch<ApiResponse<ModuloPermissoes[]>>(`/perfis/${perfilId}/permissoes`, {
      method: 'GET',
    });
  },

  /**
   * Salva a lista FINAL de regras concedidas ao perfil (204 sem corpo)
   * Endpoint: PUT /perfis/:perfil_id/permissoes
   */
  async savePermissoes(perfilId: number, regraIds: number[]): Promise<void> {
    return apiFetch<void>(`/perfis/${perfilId}/permissoes`, {
      method: 'PUT',
      body: JSON.stringify({ regra_ids: regraIds }),
    });
  },
};
