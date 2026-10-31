/** Categorias do FAQ autenticado. Contrato: ROTAS_NOVAS_AVISOS_DUVIDAS.md. */
import { apiFetch } from '../client';
import type { ApiResponse, PaginatedData, DCategoriaDuvida, DCategoriaDuvidaInput, QueryParams } from '../types';
import type { DDuvida, DDuvidaInput } from '../types';
import type { DDuvidaVisitante } from '../types';

function validateCategory(value: DCategoriaDuvida): DCategoriaDuvida {
  if (!value || !Number.isSafeInteger(value.id) || value.id < 1 ||
      typeof value.nome !== 'string' || typeof value.slug !== 'string' || typeof value.ativo !== 'boolean') {
    throw new Error('Resposta inválida da API de Categorias de Dúvidas.');
  }
  return value;
}

export const categoriasDuvidaService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<DCategoriaDuvida>>> {
    const response = await apiFetch<ApiResponse<PaginatedData<DCategoriaDuvida>>>('/d_categorias_duvida', {
      method: 'GET', params, signal, cache: 'no-store',
    });
    const pagination = response?.data?.pagination;
    if (response?.success !== true || !Array.isArray(response.data?.items) || !pagination ||
        !Number.isSafeInteger(pagination.current_page) || pagination.current_page < 1 ||
        !Number.isSafeInteger(pagination.total_pages) || pagination.total_pages < 0 ||
        !Number.isSafeInteger(pagination.total_count) || pagination.total_count < 0 ||
        !Number.isSafeInteger(pagination.per_page) || pagination.per_page < 1) {
      throw new Error('Resposta inválida da API de Categorias de Dúvidas.');
    }
    response.data.items.forEach(validateCategory);
    return response;
  },

  async get(id: number, signal?: AbortSignal): Promise<DCategoriaDuvida> {
    return validateCategory(await apiFetch<DCategoriaDuvida>(`/d_categorias_duvida/${id}`, {
      method: 'GET', signal, cache: 'no-store',
    }));
  },

  async create(data: DCategoriaDuvidaInput): Promise<DCategoriaDuvida> {
    return validateCategory(await apiFetch<DCategoriaDuvida>('/d_categorias_duvida', {
      method: 'POST', body: JSON.stringify({ d_categoria_duvida: data }),
    }));
  },

  async update(id: number, data: Partial<DCategoriaDuvidaInput>): Promise<DCategoriaDuvida> {
    return validateCategory(await apiFetch<DCategoriaDuvida>(`/d_categorias_duvida/${id}`, {
      method: 'PATCH', body: JSON.stringify({ d_categoria_duvida: data }),
    }));
  },

  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/d_categorias_duvida/${id}`, { method: 'DELETE' });
  },
};

// Dúvidas recorrentes: operações independentes do fluxo de Notícias.
function validateDuvida(value: DDuvida): DDuvida {
  if (!value || !Number.isSafeInteger(value.id) || value.id < 1 ||
      !Number.isSafeInteger(value.d_categoria_duvida_id) || value.d_categoria_duvida_id < 1 ||
      !['aguardando', 'reprovada', 'publicada'].includes(value.status) ||
      !['pergunta', 'resposta', 'categoria_nome', 'status_nome', 'autor_nome']
        .every(key => typeof value[key as keyof DDuvida] === 'string')) {
    throw new Error('Resposta inválida da API de Dúvidas.');
  }
  return value;
}

// Seleção explícita: nem chamadas JavaScript com campos extras enviam autor,
// status, motivo, tags, personas ou links do modelo antigo.
function duvidaBody(data: DDuvidaInput): string {
  return JSON.stringify({ d_duvida: {
    d_categoria_duvida_id: data.d_categoria_duvida_id,
    pergunta: data.pergunta,
    resposta: data.resposta,
  } });
}

export const duvidasService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<DDuvida>>> {
    const response = await apiFetch<ApiResponse<PaginatedData<DDuvida>>>('/d_duvidas', {
      method: 'GET', params, signal, cache: 'no-store',
    });
    const pagination = response?.data?.pagination;
    if (response?.success !== true || !Array.isArray(response.data?.items) || !pagination ||
        !Number.isSafeInteger(pagination.current_page) || pagination.current_page < 1 ||
        !Number.isSafeInteger(pagination.total_pages) || pagination.total_pages < 0 ||
        !Number.isSafeInteger(pagination.total_count) || pagination.total_count < 0 ||
        !Number.isSafeInteger(pagination.per_page) || pagination.per_page < 1) {
      throw new Error('Resposta inválida da API de Dúvidas.');
    }
    response.data.items.forEach(validateDuvida);
    return response;
  },
  async get(id: number, signal?: AbortSignal): Promise<DDuvida> {
    return validateDuvida(await apiFetch<DDuvida>(`/d_duvidas/${id}`, { method: 'GET', signal, cache: 'no-store' }));
  },
  async create(data: DDuvidaInput): Promise<DDuvida> {
    return validateDuvida(await apiFetch<DDuvida>('/d_duvidas', { method: 'POST', body: duvidaBody(data) }));
  },
  async update(id: number, data: DDuvidaInput): Promise<DDuvida> {
    return validateDuvida(await apiFetch<DDuvida>(`/d_duvidas/${id}`, { method: 'PATCH', body: duvidaBody(data) }));
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/d_duvidas/${id}`, { method: 'DELETE' });
  },
  async publicar(id: number): Promise<DDuvida> {
    return validateDuvida(await apiFetch<DDuvida>(`/d_duvidas/${id}/publicar`, { method: 'PATCH' }));
  },
  async reprovar(id: number): Promise<DDuvida> {
    return validateDuvida(await apiFetch<DDuvida>(`/d_duvidas/${id}/reprovar`, { method: 'PATCH' }));
  },
  async despublicar(id: number): Promise<DDuvida> {
    return validateDuvida(await apiFetch<DDuvida>(`/d_duvidas/${id}/despublicar`, { method: 'PATCH' }));
  },
};

function validateVisitante(value: DDuvidaVisitante): DDuvidaVisitante {
  if (!value || !Number.isSafeInteger(value.id) || value.id < 1 || typeof value.respondida !== 'boolean' ||
      !['nome', 'email', 'descricao', 'created_at', 'updated_at']
        .every(key => typeof value[key as keyof DDuvidaVisitante] === 'string') ||
      !['telefone', 'respondida_por_nome', 'respondida_em']
        .every(key => value[key as keyof DDuvidaVisitante] === null || typeof value[key as keyof DDuvidaVisitante] === 'string') ||
      !(value.respondida_por_id === null || (Number.isSafeInteger(value.respondida_por_id) && value.respondida_por_id > 0))) {
    throw new Error('Resposta inválida da API de Dúvidas de Visitantes.');
  }
  return value;
}

// Caixa administrativa: responder apenas registra o atendimento externo.
export const duvidasVisitanteService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<DDuvidaVisitante>>> {
    const response = await apiFetch<ApiResponse<PaginatedData<DDuvidaVisitante>>>('/d_duvidas_visitante', {
      method: 'GET', params, signal, cache: 'no-store',
    });
    const pagination = response?.data?.pagination;
    if (response?.success !== true || !Array.isArray(response.data?.items) || !pagination ||
        !Number.isSafeInteger(pagination.current_page) || pagination.current_page < 1 ||
        !Number.isSafeInteger(pagination.total_pages) || pagination.total_pages < 0 ||
        !Number.isSafeInteger(pagination.total_count) || pagination.total_count < 0 ||
        !Number.isSafeInteger(pagination.per_page) || pagination.per_page < 1) {
      throw new Error('Resposta inválida da API de Dúvidas de Visitantes.');
    }
    response.data.items.forEach(validateVisitante);
    return response;
  },
  async get(id: number, signal?: AbortSignal): Promise<DDuvidaVisitante> {
    return validateVisitante(await apiFetch<DDuvidaVisitante>(`/d_duvidas_visitante/${id}`, {
      method: 'GET', signal, cache: 'no-store',
    }));
  },
  async responder(id: number): Promise<DDuvidaVisitante> {
    return validateVisitante(await apiFetch<DDuvidaVisitante>(`/d_duvidas_visitante/${id}/responder`, { method: 'PATCH' }));
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/d_duvidas_visitante/${id}`, { method: 'DELETE' });
  },
};
