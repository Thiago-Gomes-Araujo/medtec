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
  CanalPublico,
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

// Site público: nenhum Bearer, cookie ou refresh da sessão administrativa.
export const canaisPublicosService = {
  async list(signal?: AbortSignal): Promise<ApiResponse<CanalPublico[]>> {
    const response = await apiFetch<ApiResponse<CanalPublico[]>>('/publico/canais_contato', {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
    });
    if (response?.success !== true || !Array.isArray(response.data) ||
        response.data.some(item => !item || typeof item.rede !== 'string' || typeof item.valor !== 'string')) {
      throw new Error('Resposta inválida da API pública de Canais de Contato.');
    }
    return { ...response, data: response.data.map(({ rede, valor }) => ({ rede, valor })) };
  },
};
