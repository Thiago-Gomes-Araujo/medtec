/** Escolas para os selects do CMS. Contrato: docs/ROTAS_PROFESSORES.md. */
import { apiFetch } from '../client';
import type { ApiResponse, Escola, PaginatedData, QueryParams } from '../types';

// Valida o envelope paginado comum às listagens de professores e conquistas.
export function ensurePaginated<T>(response: ApiResponse<PaginatedData<T>>, label: string): ApiResponse<PaginatedData<T>> {
  const pagination = response?.data?.pagination;
  if (response?.success !== true || !Array.isArray(response.data?.items) || !pagination ||
      !Number.isSafeInteger(pagination.current_page) || pagination.current_page < 1 ||
      !Number.isSafeInteger(pagination.total_pages) || pagination.total_pages < 0 ||
      !Number.isSafeInteger(pagination.total_count) || pagination.total_count < 0 ||
      // page=all devolve per_page igual ao total: 0 quando não há registros.
      !Number.isSafeInteger(pagination.per_page) || pagination.per_page < (pagination.total_count === 0 ? 0 : 1)) {
    throw new Error(`Resposta inválida da API de ${label}.`);
  }
  return response;
}

export const escolasService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<Escola>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<Escola>>>('/escolas', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Escolas');
  },
};
