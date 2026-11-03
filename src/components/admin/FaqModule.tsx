'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ApiError, medtecApi, type DCategoriaDuvida, type DDuvida, type DDuvidaInput, type PaginationMeta } from '@/lib/api';
import { usePermissoes } from './usePermissoes';

const buttonClass = 'rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071324] px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-400';
const EMPTY_FILTERS = { pergunta: '', categoria: '', situacao: '' };
type FaqQuery = typeof EMPTY_FILTERS & { page: number; per_page: number };
type DuvidaForm = DDuvidaInput & { id?: number; categoria_nome?: string; fromVisitante?: boolean };
type EditorialAction = 'publicar' | 'reprovar' | 'despublicar';

function friendlyError(error: unknown): string {
  if (error instanceof ApiError && error.status === 422) {
    return [error.message, ...error.errors.filter(message => !message.startsWith('http_'))].filter(Boolean).join(' · ');
  }
  return ApiError.getFriendlyMessage(error);
}

export default function FaqModule({ active = true, prefill = null }: { active?: boolean; prefill?: { pergunta: string } | null } = {}) {
  const id = useId();
  const [items, setItems] = useState<DDuvida[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [query, setQuery] = useState<FaqQuery>({ ...EMPTY_FILTERS, page: 1, per_page: 10 });
  const [categories, setCategories] = useState<DCategoriaDuvida[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { pode } = usePermissoes();
  const [form, setForm] = useState<DuvidaForm | null>(null);
  const [deleting, setDeleting] = useState<DDuvida | null>(null);
  const lifecycle = useRef(0);
  const mounted = useRef(false);
  const readVersion = useRef(0);
  const categoryVersion = useRef(0);
  const actionLock = useRef(false);

  // A dúvida do visitante só traz a pergunta: a API não guarda a resposta dada a ele nem uma categoria.
  const [seenPrefill, setSeenPrefill] = useState(prefill);
  if (prefill !== seenPrefill) {
    setSeenPrefill(prefill);
    if (prefill && form) {
      setActionError('Conclua ou cancele o rascunho aberto antes de transformar outra dúvida em FAQ.');
    } else if (prefill) {
      setForm({ d_categoria_duvida_id: 0, pergunta: prefill.pergunta, resposta: '', fromVisitante: true });
      setActionError(null); setSuccess(null);
    }
  }

  const load = useCallback(async (requested: FaqQuery, signal?: AbortSignal) => {
    const request = ++readVersion.current;
    const generation = lifecycle.current;
    setLoading(true);
    setError(null);
    try {
      const response = await medtecApi.duvidas.list({
        page: requested.page, per_page: requested.per_page,
        'q[pergunta_cont]': requested.pergunta || undefined,
        'q[d_categoria_duvida_id_eq]': requested.categoria || undefined,
        'q[n_status_noticia_slug_eq]': requested.situacao || undefined,
      }, signal);
      if (signal?.aborted || generation !== lifecycle.current || request !== readVersion.current) return;
      const lastPage = Math.max(1, response.data.pagination.total_pages);
      if (requested.page > lastPage) { setQuery(previous => ({ ...previous, page: lastPage })); return; }
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (cause) {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) setError(friendlyError(cause));
    } finally {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async (signal?: AbortSignal) => {
    const request = ++categoryVersion.current;
    const generation = lifecycle.current;
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const response = await medtecApi.categoriasDuvida.list({ page: 'all' }, signal);
      if (!signal?.aborted && generation === lifecycle.current && request === categoryVersion.current) setCategories(response.data.items);
    } catch (cause) {
      if (!signal?.aborted && generation === lifecycle.current && request === categoryVersion.current) setCategoriesError(friendlyError(cause));
    } finally {
      if (!signal?.aborted && generation === lifecycle.current && request === categoryVersion.current) setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; lifecycle.current += 1; };
  }, []);

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => { if (!controller.signal.aborted) void load(query, controller.signal); });
    return () => { controller.abort(); readVersion.current += 1; };
  }, [active, query, load]);

  // Reutiliza o catálogo C1 e o atualiza ao retornar da aba de categorias.
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => { if (!controller.signal.aborted) void loadCategories(controller.signal); });
    return () => { controller.abort(); categoryVersion.current += 1; };
  }, [active, loadCategories]);

  // Sem IDs oficiais das regras de Dúvidas, não se deduz uma matriz pelo nome
  // do perfil. A guarda permanece no Shell e cada tentativa é autorizada no Rails.
  async function run(operation: (isCurrent: () => boolean) => Promise<void>) {
    if (actionLock.current || !mounted.current) return;
    const generation = lifecycle.current;
    const isCurrent = () => mounted.current && lifecycle.current === generation;
    actionLock.current = true;
    setBusy(true); setActionError(null); setSuccess(null);
    try { await operation(isCurrent); }
    catch (cause) { if (isCurrent()) setActionError(friendlyError(cause)); }
    finally { actionLock.current = false; if (isCurrent()) setBusy(false); }
  }

  async function edit(item: DDuvida) {
    await run(async isCurrent => {
      const value = await medtecApi.duvidas.get(item.id);
      if (!isCurrent()) return;
      setForm({ id: value.id, d_categoria_duvida_id: value.d_categoria_duvida_id,
        categoria_nome: value.categoria_nome, pergunta: value.pergunta, resposta: value.resposta });
      setDeleting(null);
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!Number.isSafeInteger(form.d_categoria_duvida_id) || form.d_categoria_duvida_id < 1 ||
        !form.pergunta.trim() || !form.resposta.trim()) {
      setActionError('Selecione a categoria e preencha a pergunta e a resposta.'); return;
    }
    if (categoriesLoading || categoriesError || categories.length === 0) {
      setActionError('Carregue as categorias antes de salvar a dúvida.'); return;
    }
    const data: DDuvidaInput = { d_categoria_duvida_id: form.d_categoria_duvida_id,
      pergunta: form.pergunta.trim(), resposta: form.resposta.trim() };
    await run(async isCurrent => {
      const value = form.id ? await medtecApi.duvidas.update(form.id, data) : await medtecApi.duvidas.create(data);
      if (!isCurrent()) return;
      setItems(previous => previous.map(item => item.id === value.id ? value : item));
      setSuccess(`Dúvida ${form.id ? 'salva' : 'cadastrada'}. Situação: ${value.status_nome}.`);
      setForm(null);
      await load(query);
    });
  }

  async function decide(item: DDuvida, action: EditorialAction) {
    await run(async isCurrent => {
      const value = await medtecApi.duvidas[action](item.id);
      if (!isCurrent()) return;
      setItems(previous => previous.map(entry => entry.id === value.id ? value : entry));
      setSuccess(`Dúvida atualizada. Situação: ${value.status_nome}.`);
      await load(query);
    });
  }

  async function remove() {
    if (!deleting) return;
    await run(async isCurrent => {
      await medtecApi.duvidas.delete(deleting.id);
      if (!isCurrent()) return;
      setDeleting(null); setSuccess('Dúvida excluída com sucesso.');
      await load(query);
    });
  }

  const editing = form !== null || deleting !== null;
  const blocked = busy || editing;
  const categoryOptions = categories.map(category => <option key={category.id} value={category.id}>
    {category.nome}{category.ativo ? '' : ' (inativa)'}
  </option>);

  return <section aria-labelledby={`${id}-heading`} className="space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Dúvidas recorrentes</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Gerencie perguntas, respostas e aprovação. Cada ação exige permissão do seu perfil.</p>
      </div>
      {pode('d_duvidas', 'create') && <button type="button" className={buttonClass} disabled={blocked || loading || categoriesLoading || !!categoriesError || categories.length === 0}
        onClick={() => { setForm({ d_categoria_duvida_id: 0, pergunta: '', resposta: '' }); setActionError(null); setSuccess(null); }}>Nova dúvida</button>}
    </header>

    {categoriesLoading && <p role="status" className="text-xs text-slate-600 dark:text-slate-400">Carregando categorias...</p>}
    {categoriesError && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
      <p>Não foi possível carregar as categorias: {categoriesError}</p>
      <button type="button" className={buttonClass} disabled={busy || categoriesLoading} onClick={() => void loadCategories()}>Recarregar categorias</button>
    </div>}
    {!categoriesLoading && !categoriesError && categories.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">Cadastre uma categoria na aba Categorias antes de criar uma dúvida.</p>}

    <form aria-label="Filtros de dúvidas" onSubmit={event => { event.preventDefault(); if (!blocked) setQuery({ ...filters, pergunta: filters.pergunta.trim(), page: 1, per_page: query.per_page }); }}>
      <fieldset disabled={blocked} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor={`${id}-busca`} className="text-xs font-semibold text-slate-700 dark:text-slate-200">Buscar por pergunta</label>
          <input id={`${id}-busca`} name="busca" type="search" value={filters.pergunta} className={inputClass} onChange={event => setFilters({ ...filters, pergunta: event.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-categoria-filtro`} className="text-xs font-semibold text-slate-700 dark:text-slate-200">Categoria</label>
          <select id={`${id}-categoria-filtro`} name="categoriaFiltro" className={inputClass} value={filters.categoria} disabled={blocked || categoriesLoading || !!categoriesError}
            onChange={event => setFilters({ ...filters, categoria: event.target.value })}><option value="">Todas as categorias</option>{categoryOptions}</select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-situacao`} className="text-xs font-semibold text-slate-700 dark:text-slate-200">Situação</label>
          <select id={`${id}-situacao`} name="situacaoFiltro" className={inputClass} value={filters.situacao} onChange={event => setFilters({ ...filters, situacao: event.target.value })}>
            <option value="">Todas as situações</option><option value="aguardando">Aguardando</option><option value="reprovada">Reprovada</option><option value="publicada">Publicada</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className={buttonClass}>Aplicar filtros</button>
          <button type="button" className={buttonClass} onClick={() => { setFilters(EMPTY_FILTERS); setQuery({ ...EMPTY_FILTERS, page: 1, per_page: query.per_page }); }}>Limpar filtros</button>
        </div>
      </fieldset>
    </form>

    {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando dúvidas...</p>}
    {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300"><p>{error}</p>
      <button type="button" className={buttonClass} disabled={busy || loading} onClick={() => void load(query)}>Tentar novamente</button>
    </div>}
    {actionError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{actionError}</p>}
    {success && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>}

    {form && <form aria-label={form.id ? 'Editar dúvida' : 'Criar dúvida'} onSubmit={save} className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{form.id ? 'Editar dúvida' : form.fromVisitante ? 'Transformar dúvida de visitante em FAQ' : 'Nova dúvida'}</h3>
      {form.fromVisitante && <div role="note" className="space-y-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200">
        <p>A resposta dada ao visitante não fica registrada: escreva a resposta pública e escolha a categoria. Revise a pergunta e retire dados pessoais.</p>
        <p className="font-bold">Pelo contrato da API, Gestor e Administrador publicam no site ao salvar, sem passar pela aprovação.</p>
      </div>}
      <fieldset disabled={busy} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor={`${id}-categoria`} className="text-xs font-semibold text-slate-700 dark:text-slate-200">Categoria (obrigatória)</label>
          <select id={`${id}-categoria`} name="d_categoria_duvida_id" required className={inputClass} value={form.d_categoria_duvida_id || ''} disabled={categoriesLoading || !!categoriesError}
            onChange={event => setForm({ ...form, d_categoria_duvida_id: Number(event.target.value) })}>
            <option value="">Selecione uma categoria</option>{categoryOptions}
            {form.d_categoria_duvida_id > 0 && !categories.some(category => category.id === form.d_categoria_duvida_id) &&
              <option value={form.d_categoria_duvida_id}>{form.categoria_nome} (fora do catálogo atual)</option>}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-pergunta`} className="text-xs font-semibold text-slate-700 dark:text-slate-200">Pergunta (obrigatória)</label>
          <textarea id={`${id}-pergunta`} name="pergunta" required rows={2} className={inputClass} value={form.pergunta} onChange={event => setForm({ ...form, pergunta: event.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-resposta`} className="text-xs font-semibold text-slate-700 dark:text-slate-200">Resposta (obrigatória)</label>
          <textarea id={`${id}-resposta`} name="resposta" required rows={6} className={inputClass} value={form.resposta} onChange={event => setForm({ ...form, resposta: event.target.value })} />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">A situação será definida ao salvar, conforme suas permissões. O rascunho permanece em memória até salvar ou cancelar.</p>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={buttonClass} disabled={categoriesLoading || !!categoriesError || categories.length === 0}>{busy ? 'Salvando...' : 'Salvar dúvida'}</button>
          <button type="button" className={buttonClass} onClick={() => { setForm(null); setActionError(null); }}>Cancelar edição</button>
        </div>
      </fieldset>
    </form>}

    {deleting && <div role="group" aria-label="Confirmar exclusão de dúvida" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
      <p>Excluir a dúvida <strong className="break-words">{deleting.pergunta}</strong>?</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} disabled={busy} onClick={() => void remove()}>Confirmar exclusão</button>
        <button type="button" className={buttonClass} disabled={busy} onClick={() => { setDeleting(null); setActionError(null); }}>Cancelar exclusão</button>
      </div>
    </div>}

    {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhuma dúvida encontrada para os filtros selecionados.</p>}
    {!loading && !error && items.length > 0 && <ul aria-label="Dúvidas cadastradas" className="divide-y divide-slate-200 dark:divide-slate-800">
      {items.map(item => <li key={item.id} className="space-y-3 py-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 font-semibold text-slate-800 dark:text-slate-200">{item.status_nome}</span>
          <span className="break-words">{item.categoria_nome}</span><span className="break-words">Autor: {item.autor_nome}</span>
          {item.avaliado_por_nome && <span className="break-words">Avaliado por: {item.avaliado_por_nome}</span>}
        </div>
        <h3 className="break-words text-sm font-bold text-slate-900 dark:text-white">{item.pergunta}</h3>
        <p className="whitespace-pre-line break-words text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{item.resposta}</p>
        <div className="flex flex-wrap gap-2">
          {pode('d_duvidas', 'update') && <button type="button" className={buttonClass} disabled={blocked || categoriesLoading || !!categoriesError} aria-label={`Editar ${item.pergunta}`} onClick={() => void edit(item)}>Editar</button>}
          {pode('d_duvidas', 'destroy') && <button type="button" className={buttonClass} disabled={blocked} aria-label={`Excluir ${item.pergunta}`} onClick={() => { setDeleting(item); setActionError(null); setSuccess(null); }}>Excluir</button>}
          {item.status !== 'publicada' && pode('d_duvidas', 'publicar') && <button type="button" className={buttonClass} disabled={blocked} aria-label={`Publicar ${item.pergunta}`} onClick={() => void decide(item, 'publicar')}>Publicar</button>}
          {item.status === 'aguardando' && pode('d_duvidas', 'reprovar') && <button type="button" className={buttonClass} disabled={blocked} aria-label={`Reprovar ${item.pergunta}`} onClick={() => void decide(item, 'reprovar')}>Reprovar</button>}
          {item.status === 'publicada' && pode('d_duvidas', 'despublicar') && <button type="button" className={buttonClass} disabled={blocked} aria-label={`Despublicar ${item.pergunta}`} onClick={() => void decide(item, 'despublicar')}>Despublicar</button>}
        </div>
      </li>)}
    </ul>}
    {pagination && !error && <nav aria-label="Paginação de dúvidas" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400">
      <button type="button" className={buttonClass} disabled={blocked || loading || query.page <= 1} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Anterior</button>
      <span>Página {pagination.current_page} de {Math.max(1, pagination.total_pages)} · {pagination.total_count} dúvidas</span>
      <button type="button" className={buttonClass} disabled={blocked || loading || query.page >= pagination.total_pages} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Próxima</button>
    </nav>}
  </section>;
}
