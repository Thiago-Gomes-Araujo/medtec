/**
 * Serviço de Usuários e Permissões Extras da API MEDTEC
 * Conforme especificações de docs/rotas_front.md seções 6 e 9
 */

import { apiFetch } from '../client';
import {
  ApiResponse,
  PaginatedData,
  Usuario,
  UsuarioCreateInput,
  UsuarioUpdateInput,
  ModuloPermissoesExtras,
  QueryParams,
} from '../types';

export const usuariosService = {
  /**
   * Lista usuários com paginação e filtros
   * Endpoint: GET /usuarios
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<Usuario>>> {
    return apiFetch<ApiResponse<PaginatedData<Usuario>>>('/usuarios', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta os dados de um usuário pelo ID (retorna objeto direto)
   * Endpoint: GET /usuarios/:id
   */
  async get(id: number): Promise<Usuario> {
    return apiFetch<Usuario>(`/usuarios/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra um novo usuário (retorna objeto direto)
   * Endpoint: POST /usuarios
   */
  async create(data: UsuarioCreateInput): Promise<Usuario> {
    return apiFetch<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza um usuário existente (retorna objeto direto)
   * Endpoint: PATCH /usuarios/:id
   */
  async update(id: number, data: UsuarioUpdateInput): Promise<Usuario> {
    return apiFetch<Usuario>(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove um usuário (retorna 204 sem corpo)
   * Endpoint: DELETE /usuarios/:id
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/usuarios/${id}`, { method: 'DELETE' });
  },

  /**
   * Consulta a lista de permissões extras de um usuário
   * Endpoint: GET /usuarios/:usuario_id/permissoes_extras
   */
  async getPermissoesExtras(usuarioId: number): Promise<ApiResponse<ModuloPermissoesExtras[]>> {
    return apiFetch<ApiResponse<ModuloPermissoesExtras[]>>(
      `/usuarios/${usuarioId}/permissoes_extras`,
      { method: 'GET' }
    );
  },

  /**
   * Salva a lista final de IDs de regras extras concedidas ao usuário (204 sem corpo)
   * Endpoint: PUT /usuarios/:usuario_id/permissoes_extras
   */
  async savePermissoesExtras(usuarioId: number, regraIds: number[]): Promise<void> {
    return apiFetch<void>(`/usuarios/${usuarioId}/permissoes_extras`, {
      method: 'PUT',
      body: JSON.stringify({ regra_ids: regraIds }),
    });
  },
};
