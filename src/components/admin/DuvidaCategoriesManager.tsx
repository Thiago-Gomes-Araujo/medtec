'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ApiError, medtecApi, type DCategoriaDuvida, type PaginationMeta } from '@/lib/api';

const buttonClass = 'rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071324] px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-400';

function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 422) {
    return [error.message, ...error.errors.filter(message => !message.startsWith('http_'))].filter(Boolean).join(' · ');
  }
  return ApiError.getFriendlyMessage(error);
}

export default function DuvidaCategoriesManager() {
  const id = useId();
  const [items, setItems] = useState<DCategoriaDuvida[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ id?: number; nome: string; slug: string; ativo: boolean } | null>(null);
  const [deleting, setDeleting] = useState<DCategoriaDuvida | null>(null);
  const lifecycle = useRef(0);
  const readVersion = useRef(0);
  const actionLock = useRef(false);

  const load = useCallback(async (requestedPage: number, signal?: AbortSignal) => {
    const request = ++readVersion.current;
    const generation = lifecycle.current;
    setLoading(true);
    setListError(null);
    try {
      const response = await medtecApi.categoriasDuvida.list({ page: requestedPage, per_page: 10 }, signal);
      if (signal?.aborted || generation !== lifecycle.current || request !== readVersion.current) return;
      // Após excluir o último item de uma página, retorna à última página válida.
      if (requestedPage > Math.max(1, response.data.pagination.total_pages)) {
        setPage(Math.max(1, response.data.pagination.total_pages));
        return;
      }
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) {
        setListError(errorMessage(error));
      }
    } finally {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) void load(page, controller.signal);
    });
    return () => {
      controller.abort();
      lifecycle.current += 1;
      readVersion.current += 1;
    };
  }, [page, load]);

  // A guarda de acesso pertence ao AdminShell. Não há matriz contratual de
  // ações para categorias: os controles são tentativas, autorizadas pelo Rails.
  async function run(operation: () => Promise<void>) {
    if (actionLock.current) return;
    const generation = lifecycle.current;
    actionLock.current = true;
    setBusy(true);
    setActionError(null);
    setSuccess(null);
    try { await operation(); }
    catch (error) { if (generation === lifecycle.current) setActionError(errorMessage(error)); }
    finally { actionLock.current = false; setBusy(false); }
  }

  async function edit(item: DCategoriaDuvida) {
    const generation = lifecycle.current;
    await run(async () => {
      const category = await medtecApi.categoriasDuvida.get(item.id);
      if (generation !== lifecycle.current) return;
      setDeleting(null);
      setForm({ id: category.id, nome: category.nome, slug: category.slug, ativo: category.ativo });
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!form.nome.trim()) { setActionError('Informe o nome da categoria.'); return; }
    const generation = lifecycle.current;
    const data = { nome: form.nome.trim(), slug: form.slug.trim() || undefined, ativo: form.ativo };
    await run(async () => {
      if (form.id) await medtecApi.categoriasDuvida.update(form.id, data);
      else await medtecApi.categoriasDuvida.create(data);
      if (generation !== lifecycle.current) return;
      setForm(null);
      setSuccess('Categoria salva com sucesso.');
      await load(page);
    });
  }

  async function toggle(item: DCategoriaDuvida) {
    const generation = lifecycle.current;
    await run(async () => {
      await medtecApi.categoriasDuvida.update(item.id, { ativo: !item.ativo });
      if (generation !== lifecycle.current) return;
      setSuccess(item.ativo ? 'Categoria desativada.' : 'Categoria ativada.');
      await load(page);
    });
  }

  async function remove() {
    if (!deleting) return;
    const generation = lifecycle.current;
    await run(async () => {
      await medtecApi.categoriasDuvida.delete(deleting.id);
      if (generation !== lifecycle.current) return;
      setDeleting(null);
      setSuccess('Categoria excluída com sucesso.');
      await load(page);
    });
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Categorias de dúvidas</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Organize os assuntos do FAQ. Cada ação exige permissão do seu perfil.</p>
        </div>
        <button type="button" disabled={busy || loading || form !== null || deleting !== null} className={buttonClass} onClick={() => {
          setForm({ nome: '', slug: '', ativo: true }); setDeleting(null); setActionError(null); setSuccess(null);
        }}>Nova categoria</button>
      </header>

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando categorias...</p>}
      {listError && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{listError}</p>
        <button type="button" disabled={busy || loading} className={buttonClass} onClick={() => void load(page)}>Tentar novamente</button>
      </div>}
      {actionError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{actionError}</p>}
      {success && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>}

      {form && <form onSubmit={save} className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4" aria-label={form.id ? 'Editar categoria' : 'Criar categoria'}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{form.id ? 'Editar categoria' : 'Nova categoria'}</h3>
        <fieldset disabled={busy} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-nome`} className="text-xs font-semibold text-slate-700 dark:text-slate-200">Nome (obrigatório)</label>
              <input id={`${id}-nome`} name="nome" required value={form.nome} className={inputClass} onChange={event => setForm({ ...form, nome: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-slug`} className="text-xs font-semibold text-slate-700 dark:text-slate-200">Slug (opcional)</label>
              <input id={`${id}-slug`} name="slug" value={form.slug} className={inputClass} aria-describedby={`${id}-slug-help`} onChange={event => setForm({ ...form, slug: event.target.value })} />
              <p id={`${id}-slug-help`} className="text-xs text-slate-600 dark:text-slate-400">Identificador da categoria. Ao criar, deixe em branco para gerar pelo nome.</p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input name="ativo" type="checkbox" checked={form.ativo} onChange={event => setForm({ ...form, ativo: event.target.checked })} /> Categoria ativa
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClass}>{busy ? 'Salvando...' : 'Salvar categoria'}</button>
            <button type="button" className={buttonClass} onClick={() => { setForm(null); setActionError(null); }}>Cancelar</button>
          </div>
        </fieldset>
      </form>}

      {deleting && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        <p>Excluir a categoria <strong className="break-words">{deleting.nome}</strong>? A exclusão só será permitida se não houver dúvidas vinculadas.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
          <button type="button" disabled={busy} className={buttonClass} onClick={() => { setDeleting(null); setActionError(null); }}>Cancelar exclusão</button>
        </div>
      </div>}

      {!loading && !listError && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhuma categoria cadastrada.</p>}
      {!loading && !listError && items.length > 0 && <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-label="Categorias cadastradas">
        {items.map(item => <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="break-words font-semibold text-sm text-slate-900 dark:text-white">{item.nome}</h3>
            <p className="break-all text-xs text-slate-600 dark:text-slate-400">{item.slug} · {item.ativo ? 'Ativa' : 'Inativa'}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" disabled={busy || form !== null || deleting !== null} aria-label={`Editar ${item.nome}`} className={buttonClass} onClick={() => void edit(item)}>Editar</button>
            <button type="button" disabled={busy || form !== null || deleting !== null} aria-label={`${item.ativo ? 'Desativar' : 'Ativar'} ${item.nome}`} className={buttonClass} onClick={() => void toggle(item)}>{item.ativo ? 'Desativar' : 'Ativar'}</button>
            <button type="button" disabled={busy || form !== null || deleting !== null} aria-label={`Excluir ${item.nome}`} className={buttonClass} onClick={() => {
              setDeleting(item); setForm(null); setActionError(null); setSuccess(null);
            }}>Excluir</button>
          </div>
        </li>)}
      </ul>}
      {pagination && !listError && <nav aria-label="Paginação de categorias" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400">
        <button type="button" disabled={loading || busy || form !== null || deleting !== null || page <= 1} className={buttonClass} onClick={() => setPage(page - 1)}>Anterior</button>
        <span>Página {pagination.current_page} de {Math.max(1, pagination.total_pages)} · {pagination.total_count} categorias</span>
        <button type="button" disabled={loading || busy || form !== null || deleting !== null || page >= pagination.total_pages} className={buttonClass} onClick={() => setPage(page + 1)}>Próxima</button>
      </nav>}
    </section>
  );
}
