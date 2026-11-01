'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ApiError, medtecApi, type DDuvidaVisitante, type PaginationMeta } from '@/lib/api';
import { notifyDuvidasPendentes } from './useDuvidasPendentes';

const buttonClass = 'rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
type VisitanteQuery = { page: number; per_page: number; situacao: 'todas' | 'pendentes' | 'respondidas' };

function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 422) {
    return [error.message, ...error.errors.filter(message => !message.startsWith('http_'))].filter(Boolean).join(' · ');
  }
  return ApiError.getFriendlyMessage(error);
}

function dateLabel(value: string | null): string {
  if (!value) return 'Não informado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data não informada'
    : date.toLocaleString('pt-BR', { timeZone: 'America/Porto_Velho' });
}

export default function DuvidasVisitanteModule() {
  const id = useId();
  const [items, setItems] = useState<DDuvidaVisitante[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [query, setQuery] = useState<VisitanteQuery>({ page: 1, per_page: 10, situacao: 'todas' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<DDuvidaVisitante | null>(null);
  const [deleting, setDeleting] = useState<DDuvidaVisitante | null>(null);
  const mounted = useRef(false);
  const lifecycle = useRef(0);
  const readVersion = useRef(0);
  const actionLock = useRef(false);

  const load = useCallback(async (requested: VisitanteQuery, signal?: AbortSignal) => {
    const request = ++readVersion.current;
    const generation = lifecycle.current;
    setLoading(true); setError(null);
    try {
      const response = await medtecApi.duvidasVisitante.list({
        page: requested.page, per_page: requested.per_page,
        'q[respondida_false]': requested.situacao === 'pendentes' ? 1 : undefined,
        'q[respondida_true]': requested.situacao === 'respondidas' ? 1 : undefined,
      }, signal);
      if (signal?.aborted || generation !== lifecycle.current || request !== readVersion.current) return;
      const lastPage = Math.max(1, response.data.pagination.total_pages);
      if (requested.page > lastPage) { setQuery(previous => ({ ...previous, page: lastPage })); return; }
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (cause) {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) setError(errorMessage(cause));
    } finally {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; lifecycle.current += 1; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => { if (!controller.signal.aborted) void load(query, controller.signal); });
    return () => { controller.abort(); readVersion.current += 1; };
  }, [query, load]);

  // A guarda do FAQ não muda. Sem a matriz oficial de ações, os controles
  // não concedem permissão: cada operação depende da autorização do Rails.
  async function run(operation: (isCurrent: () => boolean) => Promise<void>) {
    if (!mounted.current || actionLock.current) return;
    const generation = lifecycle.current;
    const isCurrent = () => mounted.current && generation === lifecycle.current;
    actionLock.current = true;
    setBusy(true); setActionError(null); setSuccess(null);
    try { await operation(isCurrent); }
    catch (cause) { if (isCurrent()) setActionError(errorMessage(cause)); }
    finally { actionLock.current = false; if (isCurrent()) setBusy(false); }
  }

  async function details(item: DDuvidaVisitante) {
    await run(async isCurrent => {
      const value = await medtecApi.duvidasVisitante.get(item.id);
      if (isCurrent()) setSelected(value);
    });
  }

  async function markAnswered(item: DDuvidaVisitante) {
    if (item.respondida) return;
    await run(async isCurrent => {
      const value = await medtecApi.duvidasVisitante.responder(item.id);
      if (!isCurrent()) return;
      setItems(previous => previous.map(entry => entry.id === value.id ? value : entry));
      setSelected(previous => previous?.id === value.id ? value : previous);
      setSuccess(value.respondida ? 'Dúvida marcada como respondida.' : 'Registro atualizado. A dúvida permanece não respondida.');
      notifyDuvidasPendentes();
      await load(query);
    });
  }

  async function remove() {
    if (!deleting) return;
    await run(async isCurrent => {
      await medtecApi.duvidasVisitante.delete(deleting.id);
      if (!isCurrent()) return;
      setSelected(previous => previous?.id === deleting.id ? null : previous);
      setDeleting(null); setSuccess('Envio excluído com sucesso.');
      notifyDuvidasPendentes();
      await load(query);
    });
  }

  const blocked = busy || selected !== null || deleting !== null;
  const refresh = useCallback(() => { setQuery(previous => ({ ...previous })); notifyDuvidasPendentes(); }, []);

  // A API não avisa sobre novos envios: a lista é buscada de novo ao voltar para a aba.
  useEffect(() => {
    if (blocked) return;
    const refreshOnReturn = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', refreshOnReturn);
    return () => document.removeEventListener('visibilitychange', refreshOnReturn);
  }, [blocked, refresh]);

  return <section aria-labelledby={`${id}-heading`} className="space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 sm:p-6">
    <header className="space-y-2">
      <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Dúvidas de visitantes</h2>
      <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">O contato com o visitante é feito externamente, por e-mail ou telefone. Marcar como respondida apenas registra o atendimento; nenhuma mensagem é enviada.</p>
      <p className="text-xs text-slate-600 dark:text-slate-400">Cada ação exige permissão do seu perfil.</p>
    </header>

    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full max-w-sm space-y-1.5">
        <label htmlFor={`${id}-situacao`} className="text-xs font-semibold text-slate-700 dark:text-slate-200">Situação do atendimento</label>
        <select id={`${id}-situacao`} name="situacaoVisitante" value={query.situacao} disabled={blocked}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071324] px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-400 disabled:opacity-50"
          onChange={event => {
            const situacao = event.target.value;
            if (situacao === 'todas' || situacao === 'pendentes' || situacao === 'respondidas') setQuery({ ...query, page: 1, situacao });
          }}>
          <option value="todas">Todas</option><option value="pendentes">Não respondidas</option><option value="respondidas">Respondidas</option>
        </select>
      </div>
      <button type="button" disabled={blocked || loading} className={buttonClass} onClick={refresh}>Atualizar lista</button>
    </div>

    {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando dúvidas de visitantes...</p>}
    {busy && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Processando solicitação...</p>}
    {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300"><p>{error}</p>
      <button type="button" className={buttonClass} disabled={busy || loading} onClick={() => void load(query)}>Tentar novamente</button>
    </div>}
    {actionError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{actionError}</p>}
    {success && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>}

    {selected && <section aria-label="Detalhes do envio" className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="break-words text-sm font-bold text-slate-900 dark:text-white">Envio de {selected.nome}</h3>
        <button type="button" disabled={busy} className={buttonClass} onClick={() => { setSelected(null); setDeleting(null); setActionError(null); }}>Fechar detalhes</button>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-semibold text-slate-700 dark:text-slate-200">E-mail</dt><dd className="break-all text-slate-600 dark:text-slate-300">{selected.email}</dd></div>
        <div><dt className="font-semibold text-slate-700 dark:text-slate-200">Telefone</dt><dd className="break-words text-slate-600 dark:text-slate-300">{selected.telefone || 'Não informado'}</dd></div>
        <div><dt className="font-semibold text-slate-700 dark:text-slate-200">Recebida em</dt><dd className="text-slate-600 dark:text-slate-300">{dateLabel(selected.created_at)}</dd></div>
        <div><dt className="font-semibold text-slate-700 dark:text-slate-200">Situação</dt><dd className="text-slate-600 dark:text-slate-300">{selected.respondida ? 'Respondida' : 'Não respondida'}</dd></div>
        <div><dt className="font-semibold text-slate-700 dark:text-slate-200">Respondida por</dt><dd className="break-words text-slate-600 dark:text-slate-300">{selected.respondida_por_nome || 'Não informado'}</dd></div>
        <div><dt className="font-semibold text-slate-700 dark:text-slate-200">Respondida em</dt><dd className="text-slate-600 dark:text-slate-300">{dateLabel(selected.respondida_em)}</dd></div>
      </dl>
      <p className="whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{selected.descricao}</p>
      <div className="flex flex-wrap gap-2">
        {!selected.respondida && <button type="button" disabled={busy || deleting !== null} aria-label="Marcar detalhe como respondido" className={buttonClass} onClick={() => void markAnswered(selected)}>Marcar como respondida</button>}
        <button type="button" disabled={busy || deleting !== null} className={buttonClass} onClick={() => { setDeleting(selected); setActionError(null); setSuccess(null); }}>Excluir este envio</button>
      </div>
    </section>}

    {deleting && <div role="group" aria-label="Confirmar exclusão do envio" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
      <p>Excluir o envio de <strong className="break-words">{deleting.nome}</strong>?</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
        <button type="button" disabled={busy} className={buttonClass} onClick={() => { setDeleting(null); setActionError(null); }}>Cancelar exclusão</button>
      </div>
    </div>}

    {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhuma dúvida de visitante encontrada para este filtro.</p>}
    {!loading && !error && items.length > 0 && <ul aria-label="Envios de visitantes" className="divide-y divide-slate-200 dark:divide-slate-800">
      {items.map(item => <li key={item.id} className="space-y-3 py-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 font-semibold text-slate-800 dark:text-slate-200">{item.respondida ? 'Respondida' : 'Não respondida'}</span>
          <span>{dateLabel(item.created_at)}</span>
        </div>
        <h3 className="break-words text-sm font-bold text-slate-900 dark:text-white">{item.nome}</h3>
        <p className="break-all text-xs text-slate-600 dark:text-slate-400">{item.email}</p>
        <p className="line-clamp-2 whitespace-pre-line break-words text-sm text-slate-600 dark:text-slate-300">{item.descricao}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={blocked} className={buttonClass} aria-label={`Ver detalhes de ${item.nome}`} onClick={() => void details(item)}>Ver detalhes</button>
          {!item.respondida && <button type="button" disabled={blocked} className={buttonClass} aria-label={`Marcar como respondida: ${item.nome}`} onClick={() => void markAnswered(item)}>Marcar como respondida</button>}
          <button type="button" disabled={blocked} className={buttonClass} aria-label={`Excluir envio de ${item.nome}`} onClick={() => { setDeleting(item); setActionError(null); setSuccess(null); }}>Excluir</button>
        </div>
      </li>)}
    </ul>}
    {pagination && !error && <nav aria-label="Paginação de visitantes" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400">
      <button type="button" disabled={blocked || loading || query.page <= 1} className={buttonClass} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Anterior</button>
      <span>Página {pagination.current_page} de {Math.max(1, pagination.total_pages)} · {pagination.total_count} envios</span>
      <button type="button" disabled={blocked || loading || query.page >= pagination.total_pages} className={buttonClass} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Próxima</button>
    </nav>}
  </section>;
}
