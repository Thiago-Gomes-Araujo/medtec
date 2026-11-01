/** Professores, disciplinas e relatos. Contrato: docs/ROTAS_PROFESSORES.md. */
import { apiFetch } from '../client';
import { ensurePaginated } from './escolas.service';
import type {
  ApiResponse,
  DisciplinaPublica,
  PaginatedData,
  PDisciplina,
  PDisciplinaInput,
  PProfessor,
  PProfessorInput,
  PRelato,
  ProfessorPublico,
  ProfessorPublicoDetalhe,
  PublicoProfessoresParams,
  QueryParams,
  RelatoPublicoInput,
} from '../types';

export const disciplinasProfessorService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<PDisciplina>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<PDisciplina>>>('/p_disciplinas', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Disciplinas');
  },
  async get(id: number, signal?: AbortSignal): Promise<PDisciplina> {
    return apiFetch<PDisciplina>(`/p_disciplinas/${id}`, { method: 'GET', signal, cache: 'no-store' });
  },
  async create(data: PDisciplinaInput): Promise<PDisciplina> {
    return apiFetch<PDisciplina>('/p_disciplinas', { method: 'POST', body: JSON.stringify({ p_disciplina: data }) });
  },
  async update(id: number, data: Partial<PDisciplinaInput>): Promise<PDisciplina> {
    return apiFetch<PDisciplina>(`/p_disciplinas/${id}`, { method: 'PATCH', body: JSON.stringify({ p_disciplina: data }) });
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/p_disciplinas/${id}`, { method: 'DELETE' });
  },
};

// Seleção explícita: p_disciplina_ids substitui a lista inteira na edição.
function professorBody(data: PProfessorInput): string {
  return JSON.stringify({ p_professor: {
    nome: data.nome,
    escola_id: data.escola_id,
    pratica_pedagogica: data.pratica_pedagogica,
    ativo: data.ativo,
    p_disciplina_ids: data.p_disciplina_ids,
  } });
}

export const professoresService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<PProfessor>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<PProfessor>>>('/p_professores', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Professores');
  },
  async get(id: number, signal?: AbortSignal): Promise<PProfessor> {
    return apiFetch<PProfessor>(`/p_professores/${id}`, { method: 'GET', signal, cache: 'no-store' });
  },
  async create(data: PProfessorInput): Promise<PProfessor> {
    return apiFetch<PProfessor>('/p_professores', { method: 'POST', body: professorBody(data) });
  },
  async update(id: number, data: PProfessorInput): Promise<PProfessor> {
    return apiFetch<PProfessor>(`/p_professores/${id}`, { method: 'PATCH', body: professorBody(data) });
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/p_professores/${id}`, { method: 'DELETE' });
  },
};

// Relatos chegam pelo site: no CMS só existem leitura, moderação e exclusão.
export const relatosService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<PRelato>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<PRelato>>>('/p_relatos', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Relatos');
  },
  async get(id: number, signal?: AbortSignal): Promise<PRelato> {
    return apiFetch<PRelato>(`/p_relatos/${id}`, { method: 'GET', signal, cache: 'no-store' });
  },
  async publicar(id: number): Promise<PRelato> {
    return apiFetch<PRelato>(`/p_relatos/${id}/publicar`, { method: 'PATCH' });
  },
  async reprovar(id: number): Promise<PRelato> {
    return apiFetch<PRelato>(`/p_relatos/${id}/reprovar`, { method: 'PATCH' });
  },
  async despublicar(id: number): Promise<PRelato> {
    return apiFetch<PRelato>(`/p_relatos/${id}/despublicar`, { method: 'PATCH' });
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/p_relatos/${id}`, { method: 'DELETE' });
  },
};

// Projeção explícita: mesmo que a API devolva campos extras, e-mail e telefone
// nunca chegam aos componentes do site.
function toProfessorPublico(value: ProfessorPublico): ProfessorPublico {
  if (!value || !Number.isSafeInteger(value.id) || value.id < 1 || typeof value.nome !== 'string') {
    throw new Error('Resposta inválida da API pública de Professores.');
  }
  return {
    id: value.id,
    nome: value.nome,
    pratica_pedagogica: value.pratica_pedagogica,
    escola_nome: value.escola_nome,
    cidade_nome: value.cidade_nome,
    disciplinas: (Array.isArray(value.disciplinas) ? value.disciplinas : []).map(({ nome, slug }) => ({ nome, slug })),
  };
}

// Site público: nenhum Bearer, cookie ou refresh da sessão administrativa.
export const professoresPublicosService = {
  async list(params?: PublicoProfessoresParams, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<ProfessorPublico>>> {
    const response = ensurePaginated(await apiFetch<ApiResponse<PaginatedData<ProfessorPublico>>>('/publico/p_professores', {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
      params: { disciplina: params?.disciplina, cidade: params?.cidade, busca: params?.busca, page: params?.page, per_page: params?.per_page },
    }), 'Professores');
    return { ...response, data: { ...response.data, items: response.data.items.map(toProfessorPublico) } };
  },

  async get(id: number, signal?: AbortSignal): Promise<ApiResponse<ProfessorPublicoDetalhe>> {
    const response = await apiFetch<ApiResponse<ProfessorPublicoDetalhe>>(`/publico/p_professores/${id}`, {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
    });
    if (response?.success !== true) throw new Error('Resposta inválida da API pública de Professores.');
    return { ...response, data: {
      ...toProfessorPublico(response.data),
      relatos: (Array.isArray(response.data.relatos) ? response.data.relatos : []).map(({ nome, texto, created_at }) => ({ nome, texto, created_at })),
    } };
  },

  async listDisciplinas(signal?: AbortSignal): Promise<ApiResponse<DisciplinaPublica[]>> {
    const response = await apiFetch<ApiResponse<DisciplinaPublica[]>>('/publico/p_disciplinas', {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
    });
    if (response?.success !== true || !Array.isArray(response.data) ||
        response.data.some(item => !item || typeof item.nome !== 'string' || typeof item.slug !== 'string')) {
      throw new Error('Resposta inválida da API pública de Disciplinas.');
    }
    return response;
  },

  async enviarRelato(professorId: number, data: RelatoPublicoInput): Promise<ApiResponse<null>> {
    const response = await apiFetch<ApiResponse<null>>(`/publico/p_professores/${professorId}/p_relatos`, {
      method: 'POST', skipAuth: true, credentials: 'omit',
      body: JSON.stringify({ p_relato: { nome: data.nome, email: data.email, telefone: data.telefone, texto: data.texto } }),
    });
    if (response?.success !== true || typeof response.message !== 'string' || !response.message.trim()) {
      throw new Error('Resposta inválida do envio público de Relatos.');
    }
    return response;
  },
};
