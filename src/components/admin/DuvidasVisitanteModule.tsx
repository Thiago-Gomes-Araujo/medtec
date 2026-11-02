'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { SECTION_CONFIG } from '@/lib/admin-navigation';
import { ApiError, medtecApi, type DDuvidaVisitante, type PaginationMeta } from '@/lib/api';
import { notifyDuvidasPendentes } from './useDuvidasPendentes';

const buttonClass = 'rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
type VisitanteSituacao = 'pendentes' | 'respondidas';
type VisitanteQuery = { page: number; per_page: number; situacao: VisitanteSituacao };

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

// O e-mail vem do formulário público: a codificação impede que ele acrescente cabeçalhos ao mailto.
const mailtoHref = (email: string) => `mailto:${encodeURIComponent(email).replace('%40', '@')}`;
const telHref = (telefone: string) => `tel:${telefone.replace(/[^\d+]/g, '')}`;

const FILTROS: { situacao: VisitanteSituacao; label: string }[] = [
  { situacao: 'pendentes', label: 'Não respondidas' },
  { situacao: 'respondidas', label: 'Respondidas' },
];

export default function DuvidasVisitanteModule() {
  const id = useId();
  const [items, setItems] = useState<DDuvidaVisitante[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [query, setQuery] = useState<VisitanteQuery>({ page: 1, per_page: 10, situacao: 'pendentes' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<DDuvidaVisitante | null>(null);
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

  async function markAnswered(item: DDuvidaVisitante) {
    if (item.respondida) return;
    await run(async isCurrent => {
      const value = await medtecApi.duvidasVisitante.responder(item.id);
      if (!isCurrent()) return;
      setItems(previous => previous.map(entry => entry.id === value.id ? value : entry));
      setConfirming(null);
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
      setDeleting(null); setSuccess('Envio excluído com sucesso.');
      notifyDuvidasPendentes();
      await load(query);
    });
  }

  const blocked = busy || confirming !== null || deleting !== null;
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
      <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Dúvidas do público</h2>
      <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">O contato com o visitante é feito externamente, por e-mail ou telefone. Marcar como respondida apenas registra o atendimento; nenhuma mensagem é enviada.</p>
      <p className="text-xs text-slate-600 dark:text-slate-400">Cada ação exige permissão do seu perfil.</p>
    </header>

    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Situação do atendimento" className="flex flex-wrap gap-2">
        {FILTROS.map(({ situacao, label }) => <button key={situacao} type="button" aria-pressed={query.situacao === situacao} disabled={blocked}
          className={query.situacao === situacao ? `${buttonClass} bg-[#004A99] text-white hover:bg-[#004A99] dark:bg-[#004A99] dark:text-white dark:hover:bg-[#004A99]` : buttonClass}
          onClick={() => setQuery({ ...query, page: 1, situacao })}>{label}</button>)}
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

    {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhuma dúvida de visitante encontrada para este filtro.</p>}
    {!loading && !error && items.length > 0 && <ul aria-label="Envios de visitantes" className="space-y-3">
      {items.map(item => <li key={item.id} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="min-w-0 break-words text-sm font-bold text-slate-900 dark:text-white">{item.nome}</h3>
          <span className="text-xs text-slate-600 dark:text-slate-400">Enviada em {dateLabel(item.created_at)}</span>
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a href={mailtoHref(item.email)} className="break-all text-[#004A99] underline dark:text-sky-400">{item.email}</a>
          {item.telefone && <a href={telHref(item.telefone)} className="break-words text-[#004A99] underline dark:text-sky-400">{item.telefone}</a>}
        </p>
        <p className="whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{item.descricao}</p>
        {item.respondida && <p className="break-words text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Respondida{item.respondida_por_nome ? ` por ${item.respondida_por_nome}` : ''} em {dateLabel(item.respondida_em)}
        </p>}
        <div className="flex flex-wrap gap-2">
          {!item.respondida && <button type="button" disabled={blocked} className={buttonClass} aria-label={`Marcar como respondida: ${item.nome}`} onClick={() => { setConfirming(item); setActionError(null); setSuccess(null); }}>Marcar como respondida</button>}
          {item.respondida && <Link href={`${SECTION_CONFIG.duvidas.href}?visitante=${item.id}`} className={`inline-block ${buttonClass}`} aria-label={`Transformar em FAQ: ${item.nome}`}>Transformar em FAQ</Link>}
          <button type="button" disabled={blocked} className={buttonClass} aria-label={`Excluir envio de ${item.nome}`} onClick={() => { setDeleting(item); setActionError(null); setSuccess(null); }}>Excluir</button>
        </div>
        {confirming?.id === item.id && <div role="group" aria-label="Confirmar atendimento" className="space-y-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <p>Marcar a dúvida de <strong className="break-words">{item.nome}</strong> como respondida? Nenhuma mensagem é enviada: confirme só depois de responder por e-mail ou telefone.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} className={buttonClass} onClick={() => void markAnswered(item)}>Confirmar resposta</button>
            <button type="button" disabled={busy} className={buttonClass} onClick={() => { setConfirming(null); setActionError(null); }}>Cancelar</button>
          </div>
        </div>}
        {deleting?.id === item.id && <div role="group" aria-label="Confirmar exclusão do envio" className="space-y-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
          <p>Excluir o envio de <strong className="break-words">{item.nome}</strong>?</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
            <button type="button" disabled={busy} className={buttonClass} onClick={() => { setDeleting(null); setActionError(null); }}>Cancelar exclusão</button>
          </div>
        </div>}
      </li>)}
    </ul>}
    {pagination && !error && <nav aria-label="Paginação de visitantes" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400">
      <button type="button" disabled={blocked || loading || query.page <= 1} className={buttonClass} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Anterior</button>
      <span>Página {pagination.current_page} de {Math.max(1, pagination.total_pages)} · {pagination.total_count} envios</span>
      <button type="button" disabled={blocked || loading || query.page >= pagination.total_pages} className={buttonClass} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Próxima</button>
    </nav>}
  </section>;
}
