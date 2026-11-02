/**
 * Serviço de Galeria de Fotos e Categorias da API MEDTEC
 * Conforme especificações de docs/rotas_front.md seções 14 e 15
 */

import { apiFetch } from '../client';
import {
  ApiResponse,
  PaginatedData,
  CategoriaGaleria,
  CategoriaGaleriaInput,
  FotoGaleria,
  FotoGaleriaJsonInput,
  FotoGaleriaPublica,
  PublicoGaleriaParams,
  QueryParams,
} from '../types';
import { ensurePaginated } from './escolas.service';

export const categoriasGaleriaService = {
  /**
   * Lista categorias da galeria de fotos
   * Endpoint: GET /categorias_galeria
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<CategoriaGaleria>>> {
    return apiFetch<ApiResponse<PaginatedData<CategoriaGaleria>>>('/categorias_galeria', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta os dados de uma categoria de galeria pelo ID
   * Endpoint: GET /categorias_galeria/:id
   */
  async get(id: number): Promise<CategoriaGaleria> {
    return apiFetch<CategoriaGaleria>(`/categorias_galeria/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra uma nova categoria de galeria
   * Endpoint: POST /categorias_galeria
   */
  async create(data: CategoriaGaleriaInput): Promise<CategoriaGaleria> {
    return apiFetch<CategoriaGaleria>('/categorias_galeria', {
      method: 'POST',
      body: JSON.stringify({ categoria_galeria: data }),
    });
  },

  /**
   * Atualiza uma categoria de galeria existente
   * Endpoint: PATCH /categorias_galeria/:id
   */
  async update(id: number, data: Partial<CategoriaGaleriaInput>): Promise<CategoriaGaleria> {
    return apiFetch<CategoriaGaleria>(`/categorias_galeria/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ categoria_galeria: data }),
    });
  },

  /**
   * Exclui uma categoria de galeria (422 se ainda possuir fotos vinculadas)
   * Endpoint: DELETE /categorias_galeria/:id
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/categorias_galeria/${id}`, { method: 'DELETE' });
  },
};

export const fotosGaleriaService = {
  /**
   * Lista fotos da galeria (mais recentes primeiro)
   * Endpoint: GET /fotos_galeria
   */
  async list(params?: QueryParams | Record<string, unknown>): Promise<ApiResponse<PaginatedData<FotoGaleria>>> {
    return apiFetch<ApiResponse<PaginatedData<FotoGaleria>>>('/fotos_galeria', {
      method: 'GET',
      params,
    });
  },

  /**
   * Consulta os dados de uma foto pelo ID
   * Endpoint: GET /fotos_galeria/:id
   */
  async get(id: number): Promise<FotoGaleria> {
    return apiFetch<FotoGaleria>(`/fotos_galeria/${id}`, { method: 'GET' });
  },

  /**
   * Cadastra uma foto usando FormData (upload de arquivo) ou JSON (link externo)
   * Endpoint: POST /fotos_galeria
   */
  async create(data: FormData | FotoGaleriaJsonInput): Promise<FotoGaleria> {
    return apiFetch<FotoGaleria>('/fotos_galeria', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Atualiza uma foto existente usando FormData ou JSON
   * Endpoint: PATCH /fotos_galeria/:id
   */
  async update(
    id: number,
    data: FormData | { foto_galeria: Partial<FotoGaleriaJsonInput['foto_galeria']> }
  ): Promise<FotoGaleria> {
    return apiFetch<FotoGaleria>(`/fotos_galeria/${id}`, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Exclui uma foto (exclusão lógica)
   * Endpoint: DELETE /fotos_galeria/:id
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/fotos_galeria/${id}`, { method: 'DELETE' });
  },
};

// Projeção explícita: só os campos do contrato chegam ao site, sem Bearer nem cookie.
function toFotoPublica(value: FotoGaleriaPublica): FotoGaleriaPublica {
  if (!value || !Number.isSafeInteger(value.id) || value.id < 1 || typeof value.titulo !== 'string') {
    throw new Error('Resposta inválida da API pública de Galeria.');
  }
  return {
    id: value.id,
    titulo: value.titulo,
    descricao: value.descricao ?? null,
    imagem: value.imagem ?? null,
    categoria_nome: value.categoria_nome ?? null,
    categoria_slug: value.categoria_slug ?? null,
  };
}

export const galeriaPublicaService = {
  async list(params?: PublicoGaleriaParams, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<FotoGaleriaPublica>>> {
    const response = ensurePaginated(await apiFetch<ApiResponse<PaginatedData<FotoGaleriaPublica>>>('/publico/fotos_galeria', {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
      params: { categoria: params?.categoria, page: params?.page, per_page: params?.per_page },
    }), 'Galeria');
    return { ...response, data: { ...response.data, items: response.data.items.map(toFotoPublica) } };
  },
};
