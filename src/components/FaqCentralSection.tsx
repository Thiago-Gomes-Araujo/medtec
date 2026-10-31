'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { ApiError, medtecApi, type CategoriaDuvidaPublica, type DuvidaPublica, type PaginationMeta } from '@/lib/api';
import DuvidaVisitanteForm from '@/components/DuvidaVisitanteForm';

const buttonClass = 'min-h-11 lg:min-h-0 max-w-full [overflow-wrap:anywhere] rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-[#004A99] dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
type FaqQuery = { page: number; per_page: number; categoria: string; busca: string };

function readError(cause: unknown, subject: string): string {
  return cause instanceof ApiError && cause.status === 0
    ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
    : `${subject} indisponíveis no momento. Tente novamente em instantes.`;
}

export default function FaqCentralSection() {
  const id = useId();
  const [items, setItems] = useState<DuvidaPublica[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<CategoriaDuvidaPublica[]>([]);
  const [query, setQuery] = useState<FaqQuery>({ page: 1, per_page: 10, categoria: '', busca: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const lifecycle = useRef(0);
  const readVersion = useRef(0);
  const categoryVersion = useRef(0);

  const load = useCallback(async (requested: FaqQuery, signal?: AbortSignal) => {
    const request = ++readVersion.current;
    const generation = lifecycle.current;
    setLoading(true); setError(null);
    try {
      const response = await medtecApi.duvidasPublicas.list(requested, signal);
      if (signal?.aborted || generation !== lifecycle.current || request !== readVersion.current) return;
      const lastPage = Math.max(1, response.data.pagination.total_pages);
      if (requested.page > lastPage) { setQuery(previous => ({ ...previous, page: lastPage })); return; }
      setItems(response.data.items); setPagination(response.data.pagination); setOpenFaqId(null);
    } catch (cause) {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) setError(readError(cause, 'Perguntas'));
    } finally {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async (signal?: AbortSignal) => {
    const request = ++categoryVersion.current;
    const generation = lifecycle.current;
    setCategoriesLoading(true); setCategoriesError(null);
    try {
      const response = await medtecApi.duvidasPublicas.listCategorias(signal);
      if (!signal?.aborted && generation === lifecycle.current && request === categoryVersion.current) setCategories(response.data);
    } catch (cause) {
      if (!signal?.aborted && generation === lifecycle.current && request === categoryVersion.current) setCategoriesError(readError(cause, 'Categorias'));
    } finally {
      if (!signal?.aborted && generation === lifecycle.current && request === categoryVersion.current) setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => () => { lifecycle.current += 1; }, []);
  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => { if (!controller.signal.aborted) void load(query, controller.signal); });
    return () => { controller.abort(); readVersion.current += 1; };
  }, [query, load]);
  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => { if (!controller.signal.aborted) void loadCategories(controller.signal); });
    return () => { controller.abort(); categoryVersion.current += 1; };
  }, [loadCategories]);

  function updateQuery(next: FaqQuery) { setLoading(true); setOpenFaqId(null); setQuery(next); }
  function search(event: FormEvent) { event.preventDefault(); updateQuery({ ...query, page: 1, busca: searchTerm.trim() }); }
  function resetFilters() { setSearchTerm(''); updateQuery({ ...query, page: 1, busca: '', categoria: '' }); }

  return <div className="relative w-full bg-[#F8FAFC] dark:bg-[#0B1528] text-slate-800 dark:text-slate-100">
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-8">
      <form aria-label="Buscar perguntas" onSubmit={search} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3">
        <label htmlFor={`${id}-busca`} className="block text-sm font-semibold text-slate-800 dark:text-slate-100">Buscar por pergunta</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search aria-hidden="true" className="absolute left-3 top-3 h-5 w-5 text-[#004A99] dark:text-sky-400" />
            <input id={`${id}-busca`} name="busca" type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-2 text-base text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-400" />
          </div>
          <button type="submit" className={buttonClass}>Buscar</button>
          <button type="button" className={buttonClass} onClick={resetFilters}>Limpar filtros</button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">A busca procura palavras no texto das perguntas.</p>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside aria-labelledby={`${id}-categorias`} className="min-w-0 lg:col-span-4 lg:sticky lg:top-28 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          <h2 id={`${id}-categorias`} className="hidden lg:block text-base font-semibold text-slate-900 dark:text-white">Categorias</h2>
          <button type="button" aria-label="Categorias" aria-expanded={categoriesExpanded} aria-controls={`${id}-lista-categorias`}
            className={`${buttonClass} flex w-full items-center justify-between gap-3 text-left lg:hidden`}
            onClick={() => setCategoriesExpanded(previous => !previous)}>
            <span>Categorias</span><ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 ${categoriesExpanded ? 'rotate-180' : ''}`} />
          </button>
          <p className="lg:hidden text-sm text-slate-600 dark:text-slate-300 [overflow-wrap:anywhere]">
            Selecionada: {query.categoria ? categories.find(category => category.slug === query.categoria)?.nome || query.categoria : 'Todas as categorias'}
          </p>
          {categoriesLoading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando categorias...</p>}
          {categoriesError && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
            <p>{categoriesError}</p><button type="button" className={buttonClass} disabled={categoriesLoading} onClick={() => void loadCategories()}>Recarregar categorias</button>
          </div>}
          <div id={`${id}-lista-categorias`} className={`${categoriesExpanded ? 'flex' : 'hidden'} lg:flex max-h-64 lg:max-h-none overflow-y-auto lg:overflow-visible flex-col gap-2 p-1 -m-1`}>
            <button type="button" aria-pressed={query.categoria === ''} className={`${buttonClass} text-left ${!query.categoria ? 'bg-sky-50 dark:bg-slate-800' : ''}`}
              onClick={() => updateQuery({ ...query, categoria: '', page: 1 })}>Todas as categorias</button>
            {!categoriesLoading && !categoriesError && categories.map(category => <button key={category.slug} type="button" aria-pressed={query.categoria === category.slug}
              className={`${buttonClass} text-left break-words ${query.categoria === category.slug ? 'bg-sky-50 dark:bg-slate-800' : ''}`}
              onClick={() => updateQuery({ ...query, categoria: category.slug, page: 1 })}>{category.nome}</button>)}
          </div>
          {!categoriesLoading && !categoriesError && categories.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">Nenhuma categoria disponível.</p>}
        </aside>

        <section aria-label="Perguntas e respostas" className="lg:col-span-8 space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
            <h2 className="font-semibold text-slate-900 dark:text-white">Perguntas e respostas</h2>
            {pagination && !loading && !error && <span>{pagination.total_count} resultados</span>}
          </div>
          {query.busca && <p className="break-words text-sm text-slate-600 dark:text-slate-300">Busca por pergunta: “{query.busca}”</p>}
          {loading && <p role="status" className="py-6 text-sm text-slate-600 dark:text-slate-300">Carregando perguntas...</p>}
          {error && <div role="alert" className="rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-5 space-y-3 text-sm text-red-700 dark:text-red-300">
            <p>{error}</p><button type="button" className={buttonClass} disabled={loading} onClick={() => void load(query)}>Tentar novamente</button>
          </div>}
          {!loading && !error && pagination && items.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-10 text-center space-y-3">
            <HelpCircle aria-hidden="true" className="mx-auto h-8 w-8 text-slate-500 dark:text-slate-400" />
            <p className="text-sm text-slate-600 dark:text-slate-300">Nenhuma pergunta encontrada para os filtros selecionados.</p>
            <button type="button" className={buttonClass} onClick={resetFilters}>Ver todas as perguntas</button>
          </div>}
          {!loading && !error && items.map(item => {
            const open = openFaqId === item.id;
            const answerId = `${id}-resposta-${item.id}`;
            const questionId = `${id}-pergunta-${item.id}`;
            return <article key={item.id} className={`rounded-xl border bg-white dark:bg-slate-900 overflow-hidden ${open ? 'border-[#004A99] dark:border-sky-500' : 'border-slate-200 dark:border-slate-800'}`}>
              <h3><button type="button" id={questionId} aria-expanded={open} aria-controls={answerId}
                className="flex w-full items-start justify-between gap-3 p-4 sm:p-5 text-left text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#004A99] dark:focus-visible:ring-sky-400 cursor-pointer"
                onClick={() => setOpenFaqId(open ? null : item.id)}>
                <span className="min-w-0 space-y-2"><span className="block text-xs font-medium text-[#004A99] dark:text-sky-300 break-words">{item.categoria_nome}</span><span className="block break-words">{item.pergunta}</span></span>
                <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 ${open ? 'rotate-180' : ''}`} />
              </button></h3>
              <div id={answerId} role="region" aria-labelledby={questionId} hidden={!open} className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#071326] p-4 sm:p-5">
                <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200">{item.resposta}</p>
              </div>
            </article>;
          })}
          {pagination && !error && <nav aria-label="Paginação de perguntas" className="flex flex-wrap items-center justify-between gap-3 pt-3 text-sm text-slate-600 dark:text-slate-400">
            <button type="button" className={buttonClass} disabled={loading || query.page <= 1} onClick={() => updateQuery({ ...query, page: query.page - 1 })}>Anterior</button>
            <span>Página {pagination.current_page} de {Math.max(1, pagination.total_pages)}</span>
            <button type="button" className={buttonClass} disabled={loading || query.page >= pagination.total_pages} onClick={() => updateQuery({ ...query, page: query.page + 1 })}>Próxima</button>
          </nav>}
        </section>
      </div>

      <DuvidaVisitanteForm />
      <div className="flex justify-end"><Link href="/avisos" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#004A99] dark:text-sky-300 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">Ver Avisos Oficiais</Link></div>
    </div>
  </div>;
}
