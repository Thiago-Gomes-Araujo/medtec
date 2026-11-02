/** Projetos pedagógicos, temas e membros. Contrato: docs/ROTAS_PROJETOS.md. */
import { apiFetch } from '../client';
import { ensurePaginated } from './escolas.service';
import type {
  ApiResponse,
  PaginatedData,
  PjAnexo,
  PjMembro,
  PjMembroInput,
  PjProjeto,
  PjProjetoInput,
  PjTema,
  PjTemaInput,
  ProjetoPublico,
  ProjetoPublicoDetalhe,
  PublicoProjetosParams,
  QueryParams,
  TemaProjetoPublico,
} from '../types';

export const temasProjetoService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<PjTema>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<PjTema>>>('/pj_temas', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Temas de Projeto');
  },
  async get(id: number, signal?: AbortSignal): Promise<PjTema> {
    return apiFetch<PjTema>(`/pj_temas/${id}`, { method: 'GET', signal, cache: 'no-store' });
  },
  async create(data: PjTemaInput): Promise<PjTema> {
    return apiFetch<PjTema>('/pj_temas', { method: 'POST', body: JSON.stringify({ pj_tema: data }) });
  },
  async update(id: number, data: Partial<PjTemaInput>): Promise<PjTema> {
    return apiFetch<PjTema>(`/pj_temas/${id}`, { method: 'PATCH', body: JSON.stringify({ pj_tema: data }) });
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/pj_temas/${id}`, { method: 'DELETE' });
  },
};

export const membrosProjetoService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<PjMembro>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<PjMembro>>>('/pj_membros', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Membros de Projeto');
  },
  async get(id: number, signal?: AbortSignal): Promise<PjMembro> {
    return apiFetch<PjMembro>(`/pj_membros/${id}`, { method: 'GET', signal, cache: 'no-store' });
  },
  async create(data: PjMembroInput): Promise<PjMembro> {
    return apiFetch<PjMembro>('/pj_membros', { method: 'POST', body: JSON.stringify({ pj_membro: data }) });
  },
  async update(id: number, data: PjMembroInput): Promise<PjMembro> {
    return apiFetch<PjMembro>(`/pj_membros/${id}`, { method: 'PATCH', body: JSON.stringify({ pj_membro: data }) });
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/pj_membros/${id}`, { method: 'DELETE' });
  },
};

// Autor e situação nunca são enviados. Com arquivo vai multipart; sem arquivo, JSON.
function projetoBody(data: PjProjetoInput): FormData | string {
  const fields = { titulo: data.titulo, pj_tema_id: data.pj_tema_id, relato: data.relato, escola_id: data.escola_id };
  const membros = data.pj_projeto_membros_attributes ?? [];
  const anexos = data.anexos ?? [];
  if (!data.imagem && anexos.length === 0) {
    return JSON.stringify({ pj_projeto: {
      ...fields, imagem_url: data.imagem_url,
      ...(membros.length > 0 ? { pj_projeto_membros_attributes: membros } : {}),
    } });
  }
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(`pj_projeto[${key}]`, String(value));
  if (data.imagem_url !== undefined) form.append('pj_projeto[imagem_url]', data.imagem_url);
  if (data.imagem) form.append('pj_projeto[imagem]', data.imagem);
  for (const anexo of anexos) form.append('pj_projeto[anexos][]', anexo);
  membros.forEach((membro, index) => {
    for (const [key, value] of Object.entries(membro)) {
      form.append(`pj_projeto[pj_projeto_membros_attributes][${index}][${key}]`, String(value));
    }
  });
  return form;
}

export const projetosService = {
  async list(params?: QueryParams | Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<PjProjeto>>> {
    return ensurePaginated(await apiFetch<ApiResponse<PaginatedData<PjProjeto>>>('/pj_projetos', {
      method: 'GET', params, signal, cache: 'no-store',
    }), 'Projetos');
  },
  async get(id: number, signal?: AbortSignal): Promise<PjProjeto> {
    return apiFetch<PjProjeto>(`/pj_projetos/${id}`, { method: 'GET', signal, cache: 'no-store' });
  },
  async create(data: PjProjetoInput): Promise<PjProjeto> {
    return apiFetch<PjProjeto>('/pj_projetos', { method: 'POST', body: projetoBody(data) });
  },
  async update(id: number, data: PjProjetoInput): Promise<PjProjeto> {
    return apiFetch<PjProjeto>(`/pj_projetos/${id}`, { method: 'PATCH', body: projetoBody(data) });
  },
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/pj_projetos/${id}`, { method: 'DELETE' });
  },
  async publicar(id: number): Promise<PjProjeto> {
    return apiFetch<PjProjeto>(`/pj_projetos/${id}/publicar`, { method: 'PATCH' });
  },
  async reprovar(id: number): Promise<PjProjeto> {
    return apiFetch<PjProjeto>(`/pj_projetos/${id}/reprovar`, { method: 'PATCH' });
  },
  async despublicar(id: number): Promise<PjProjeto> {
    return apiFetch<PjProjeto>(`/pj_projetos/${id}/despublicar`, { method: 'PATCH' });
  },
  async removerAnexo(id: number, anexoId: number): Promise<void> {
    await apiFetch<void>(`/pj_projetos/${id}/anexos/${anexoId}`, { method: 'DELETE' });
  },
};

// Projeção explícita: autor, avaliador, auditoria e CPF nunca chegam ao site.
function toProjetoPublico(value: ProjetoPublico): ProjetoPublico {
  if (!value || !Number.isSafeInteger(value.id) || value.id < 1 || typeof value.titulo !== 'string') {
    throw new Error('Resposta inválida da API pública de Projetos.');
  }
  return {
    id: value.id,
    titulo: value.titulo,
    relato: value.relato,
    tema_nome: value.tema_nome,
    tema_slug: value.tema_slug,
    escola_nome: value.escola_nome,
    cidade_nome: value.cidade_nome,
    imagem: value.imagem,
    imagem_url: value.imagem_url,
    created_at: value.created_at,
  };
}

function toAnexoPublico({ id, nome, tipo, tamanho, url }: PjAnexo): PjAnexo {
  return { id, nome, tipo, tamanho, url };
}

// Site público: nenhum Bearer, cookie ou refresh da sessão administrativa.
export const projetosPublicosService = {
  async list(params?: PublicoProjetosParams, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<ProjetoPublico>>> {
    const response = ensurePaginated(await apiFetch<ApiResponse<PaginatedData<ProjetoPublico>>>('/publico/pj_projetos', {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
      params: { tema: params?.tema, cidade: params?.cidade, busca: params?.busca, page: params?.page, per_page: params?.per_page },
    }), 'Projetos');
    return { ...response, data: { ...response.data, items: response.data.items.map(toProjetoPublico) } };
  },

  async get(id: number, signal?: AbortSignal): Promise<ApiResponse<ProjetoPublicoDetalhe>> {
    const response = await apiFetch<ApiResponse<ProjetoPublicoDetalhe>>(`/publico/pj_projetos/${id}`, {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
    });
    if (response?.success !== true || !Array.isArray(response.data?.membros) || !Array.isArray(response.data?.anexos)) {
      throw new Error('Resposta inválida da API pública de Projetos.');
    }
    return { ...response, data: {
      ...toProjetoPublico(response.data),
      membros: response.data.membros.map(({ nome, funcao }) => ({ nome, funcao })),
      anexos: response.data.anexos.map(toAnexoPublico),
    } };
  },

  async listTemas(signal?: AbortSignal): Promise<ApiResponse<TemaProjetoPublico[]>> {
    const response = await apiFetch<ApiResponse<TemaProjetoPublico[]>>('/publico/pj_temas', {
      method: 'GET', skipAuth: true, credentials: 'omit', cache: 'no-store', signal,
    });
    if (response?.success !== true || !Array.isArray(response.data) ||
        response.data.some(item => !item || typeof item.nome !== 'string' || typeof item.slug !== 'string')) {
      throw new Error('Resposta inválida da API pública de Temas de Projeto.');
    }
    return response;
  },
};
