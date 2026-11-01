/** Conquistas dos alunos e categorias. Contrato: docs/ROTAS_CONQUISTAS_ALUNO.md. */
import { apiFetch } from '../client';
import { ensurePaginated } from './escolas.service';
import type {
  ApiResponse,
  CategoriaConquistaPublica,
  CCategoriaConquista,
  CCategoriaConquistaInput,
  CConquistaAluno,
  CConquistaAlunoInput,
  ConquistaPublica,
  PaginatedData,
  PublicoConquistasParams,
  QueryParams,
} from '../types';

export const categoriasConquistaService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<CCategoriaConquista>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<CCategoriaConquista>>>('/c_categorias_conquista_aluno', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Categorias de Conquistas');
  },
  async get(id: number, signal?: AbortSignal): Promise<CCategoriaConquista> {
    return apiFetch<CCategoriaConquista>(`/c_categorias_conquista_aluno/${id}`, { method: 'GET', signal, cache: 'no-store' });
  },
  async create(data: CCategoriaConquistaInput): Promise<CCategoriaConquista> {
    return apiFetch<CCategoriaConquista>('/c_categorias_conquista_aluno', {
      method: 'POST', body: JSON.stringify({ c_categoria_conquista_aluno: data }),
    });
  },
  async update(id: number, data: Partial<CCategoriaConquistaInput>): Promise<CCategoriaConquista> {
    return apiFetch<CCategoriaConquista>(`/c_categorias_conquista_aluno/${id}`, {
      method: 'PATCH', body: JSON.stringify({ c_categoria_conquista_aluno: data }),
    });
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/c_categorias_conquista_aluno/${id}`, { method: 'DELETE' });
  },
};

// Autor e situação nunca são enviados. Com arquivo vai multipart; sem arquivo, JSON.
function conquistaBody(data: CConquistaAlunoInput): FormData | string {
  const fields = {
    nome_aluno: data.nome_aluno,
    titulo: data.titulo,
    relato: data.relato,
    c_categoria_conquista_aluno_id: data.c_categoria_conquista_aluno_id,
    escola_id: data.escola_id,
  };
  if (!data.imagem) return JSON.stringify({ c_conquista_aluno: { ...fields, imagem_url: data.imagem_url || undefined } });
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(`c_conquista_aluno[${key}]`, String(value));
  form.append('c_conquista_aluno[imagem]', data.imagem);
  return form;
}

export const conquistasService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<CConquistaAluno>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<CConquistaAluno>>>('/c_conquistas_aluno', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Conquistas');
  },
  async get(id: number, signal?: AbortSignal): Promise<CConquistaAluno> {
    return apiFetch<CConquistaAluno>(`/c_conquistas_aluno/${id}`, { method: 'GET', signal, cache: 'no-store' });
  },
  async create(data: CConquistaAlunoInput): Promise<CConquistaAluno> {
    return apiFetch<CConquistaAluno>('/c_conquistas_aluno', { method: 'POST', body: conquistaBody(data) });
  },
  async update(id: number, data: CConquistaAlunoInput): Promise<CConquistaAluno> {
    return apiFetch<CConquistaAluno>(`/c_conquistas_aluno/${id}`, { method: 'PATCH', body: conquistaBody(data) });
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/c_conquistas_aluno/${id}`, { method: 'DELETE' });
  },
  async publicar(id: number): Promise<CConquistaAluno> {
    return apiFetch<CConquistaAluno>(`/c_conquistas_aluno/${id}/publicar`, { method: 'PATCH' });
  },
  async reprovar(id: number): Promise<CConquistaAluno> {
    return apiFetch<CConquistaAluno>(`/c_conquistas_aluno/${id}/reprovar`, { method: 'PATCH' });
  },
  async despublicar(id: number): Promise<CConquistaAluno> {
    return apiFetch<CConquistaAluno>(`/c_conquistas_aluno/${id}/despublicar`, { method: 'PATCH' });
  },
};

// Projeção explícita: autor, avaliador e auditoria nunca chegam ao site.
function toConquistaPublica(value: ConquistaPublica): ConquistaPublica {
  if (!value || !Number.isSafeInteger(value.id) || value.id < 1 ||
      typeof value.nome_aluno !== 'string' || typeof value.titulo !== 'string') {
    throw new Error('Resposta inválida da API pública de Conquistas.');
  }
  return {
    id: value.id,
    nome_aluno: value.nome_aluno,
    titulo: value.titulo,
    relato: value.relato,
    categoria_nome: value.categoria_nome,
    categoria_slug: value.categoria_slug,
    escola_nome: value.escola_nome,
    cidade_nome: value.cidade_nome,
    imagem: value.imagem,
    imagem_url: value.imagem_url,
    created_at: value.created_at,
  };
}

// Site público: nenhum Bearer, cookie ou refresh da sessão administrativa.
export const conquistasPublicasService = {
  async list(params?: PublicoConquistasParams, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<ConquistaPublica>>> {
    const response = ensurePaginated(await apiFetch<ApiResponse<PaginatedData<ConquistaPublica>>>('/publico/c_conquistas_aluno', {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
      params: { categoria: params?.categoria, cidade: params?.cidade, busca: params?.busca, page: params?.page, per_page: params?.per_page },
    }), 'Conquistas');
    return { ...response, data: { ...response.data, items: response.data.items.map(toConquistaPublica) } };
  },

  async get(id: number, signal?: AbortSignal): Promise<ApiResponse<ConquistaPublica>> {
    const response = await apiFetch<ApiResponse<ConquistaPublica>>(`/publico/c_conquistas_aluno/${id}`, {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
    });
    if (response?.success !== true) throw new Error('Resposta inválida da API pública de Conquistas.');
    return { ...response, data: toConquistaPublica(response.data) };
  },

  async listCategorias(signal?: AbortSignal): Promise<ApiResponse<CategoriaConquistaPublica[]>> {
    const response = await apiFetch<ApiResponse<CategoriaConquistaPublica[]>>('/publico/c_categorias_conquista_aluno', {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
    });
    if (response?.success !== true || !Array.isArray(response.data) ||
        response.data.some(item => !item || typeof item.nome !== 'string' || typeof item.slug !== 'string')) {
      throw new Error('Resposta inválida da API pública de Categorias de Conquistas.');
    }
    return response;
  },
};
