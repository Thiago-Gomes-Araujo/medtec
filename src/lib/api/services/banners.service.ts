/** Banners do carrossel da home. Contrato: docs/ROTAS_BANNERS.md. */
import { apiFetch } from '../client';
import { ensurePaginated } from './escolas.service';
import type { ApiResponse, BannerPublico, BBanner, BBannerInput, PaginatedData, QueryParams } from '../types';

// Arquivo vai em multipart e link em JSON; o que vier passa a valer na API.
function bannerBody(data: BBannerInput): FormData | string {
  if (!data.imagem) return JSON.stringify({ b_banner: { imagem_url: data.imagem_url } });
  const form = new FormData();
  form.append('b_banner[imagem]', data.imagem);
  return form;
}

export const bannersService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<BBanner>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<BBanner>>>('/b_banners', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Banners');
  },
  async get(id: number, signal?: AbortSignal): Promise<BBanner> {
    return apiFetch<BBanner>(`/b_banners/${id}`, { method: 'GET', signal, cache: 'no-store' });
  },
  async create(data: BBannerInput): Promise<BBanner> {
    return apiFetch<BBanner>('/b_banners', { method: 'POST', body: bannerBody(data) });
  },
  async update(id: number, data: BBannerInput): Promise<BBanner> {
    return apiFetch<BBanner>(`/b_banners/${id}`, { method: 'PATCH', body: bannerBody(data) });
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/b_banners/${id}`, { method: 'DELETE' });
  },
};

// Site público: nenhum Bearer, cookie ou refresh da sessão administrativa.
export const bannersPublicosService = {
  async list(signal?: AbortSignal): Promise<ApiResponse<BannerPublico[]>> {
    const response = await apiFetch<ApiResponse<BannerPublico[]>>('/publico/b_banners', {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
    });
    if (response?.success !== true || !Array.isArray(response.data) ||
        response.data.some(item => !item || !Number.isSafeInteger(item.id) || typeof item.imagem !== 'string' || !item.imagem)) {
      throw new Error('Resposta inválida da API pública de Banners.');
    }
    return { ...response, data: response.data.map(({ id, imagem }) => ({ id, imagem })) };
  },
};
