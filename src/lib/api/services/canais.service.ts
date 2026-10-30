/**
 * Serviço de Canais de Contato da API MEDTEC
 * Conforme especificações de docs/rotas_front.md seção 16
 */

import { apiFetch } from '../client';
import {
  ApiResponse,
  PaginatedData,
  CanalContato,
  CanalContatoInput,
  QueryParams,
} from '../types';

export const canaisService = {
  /**
   * Lista os canais de contato institucionais (ordenados por posição)
   * Endpoint: GET /canais_contato
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<CanalContato>>> {
    return apiFetch<ApiResponse<PaginatedData<CanalContato>>>('/canais_contato', {
      method: 'GET',
      params,
    });
  },

  /**
   * Atualiza múltiplos canais de contato de uma única vez
   * Endpoint: PUT /canais_contato
   */
  async updateMany(canais: CanalContatoInput[]): Promise<ApiResponse<CanalContato[]>> {
    return apiFetch<ApiResponse<CanalContato[]>>('/canais_contato', {
      method: 'PUT',
      body: JSON.stringify({ canais_contato: canais }),
    });
  },

  async updateBatch(canais: CanalContatoInput[]): Promise<ApiResponse<CanalContato[]>> {
    return this.updateMany(canais);
  },
};
