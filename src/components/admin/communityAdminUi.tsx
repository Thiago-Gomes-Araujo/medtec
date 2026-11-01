'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ADMIN_SUBROUTE_GROUPS, SECTION_CONFIG, type AdminSection } from '@/lib/admin-navigation';
import { medtecApi, type ApiResponse, type Escola, type ModeracaoStatus, type PaginatedData, type PaginationMeta } from '@/lib/api';
import { communityErrorMessage } from '@/lib/community-content';

export const buttonClass = 'rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
export const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071324] px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-400';
export const labelClass = 'text-xs font-semibold text-slate-700 dark:text-slate-200';
export const panelClass = 'space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 sm:p-6';

export type ModeracaoAction = 'publicar' | 'reprovar' | 'despublicar';

// Abas dos módulos de professores e alunos: cada uma é uma subrota, com a ativa destacada.
export function CommunitySubrouteLayout({ active, children }: { active: AdminSection; children: ReactNode }) {
  const group = ADMIN_SUBROUTE_GROUPS.find(item => item.items.some(({ section }) => section === active));
  return (
    <div className="space-y-6">
      {group && <nav aria-label={group.label} className="flex flex-wrap gap-2">
        {group.items.map(({ section, label }) => <Link key={section} href={SECTION_CONFIG[section].href} aria-current={section === active ? 'page' : undefined}
          className={`rounded-xl px-4 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer ${section === active
            ? 'bg-[#004A99] text-white' : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          {label}
        </Link>)}
      </nav>}
      {children}
    </div>
  );
}

// A leitura é abortada ao ocultar a rota e refeita ao reativar; `read` deve ser estável.
export function useApiList<T>(read: (signal: AbortSignal) => Promise<ApiResponse<PaginatedData<T>>>) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await read(controller.signal);
        if (controller.signal.aborted) return;
        setItems(response.data.items);
        setPagination(response.data.pagination);
      } catch (cause) {
        if (!controller.signal.aborted) setError(communityErrorMessage(cause));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [read, version]);

  const reload = useCallback(() => setVersion(current => current + 1), []);
  return { items, pagination, loading, error, reload };
}

// Sem matriz de ações no front: cada operação depende da autorização do Rails.
export function useAdminAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const lock = useRef(false);

  const run = useCallback(async (operation: () => Promise<string | void>): Promise<boolean> => {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const message = await operation();
      if (message) setSuccess(message);
      return true;
    } catch (cause) {
      setError(communityErrorMessage(cause));
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, []);

  return { busy, error, success, setError, setSuccess, run };
}

// A cidade vem da escola: o município só restringe GET /escolas e não é enviado.
export function useEscolaOptions(cidadeId: string) {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [cidades, setCidades] = useState<{ id: number; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await medtecApi.escolas.list({ page: 'all', 'q[g_cidade_id_eq]': cidadeId || undefined }, controller.signal);
        if (controller.signal.aborted) return;
        setEscolas(response.data.items);
        if (!cidadeId) {
          const unique = new Map(response.data.items.map(item => [item.g_cidade_id, item.cidade_nome]));
          setCidades([...unique].map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
        }
      } catch (cause) {
        if (!controller.signal.aborted) setError(communityErrorMessage(cause));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [cidadeId]);

  return { escolas, cidades, loading, error };
}

const STATUS_CLASS: Record<ModeracaoStatus, string> = {
  aguardando: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  publicada: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  reprovada: 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300',
};

export function renderStatusBadge(status: ModeracaoStatus, label: string) {
  return <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[status] ?? ''}`}>{label}</span>;
}

// Os botões seguem o campo `status` devolvido pela API.
export function renderModerationButtons(status: ModeracaoStatus, name: string, disabled: boolean, onAction: (action: ModeracaoAction) => void) {
  return <>
    {status !== 'publicada' && <button type="button" className={buttonClass} disabled={disabled} aria-label={`Publicar ${name}`} onClick={() => onAction('publicar')}>Publicar</button>}
    {status === 'aguardando' && <button type="button" className={buttonClass} disabled={disabled} aria-label={`Reprovar ${name}`} onClick={() => onAction('reprovar')}>Reprovar</button>}
    {status === 'publicada' && <button type="button" className={buttonClass} disabled={disabled} aria-label={`Despublicar ${name}`} onClick={() => onAction('despublicar')}>Despublicar</button>}
  </>;
}

export function renderFeedback(error: string | null, success: string | null) {
  return <>
    {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    {success && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>}
  </>;
}

export function renderPagination(label: string, noun: string, pagination: PaginationMeta | null, page: number, disabled: boolean, onPage: (page: number) => void) {
  if (!pagination) return null;
  return <nav aria-label={label} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400">
    <button type="button" disabled={disabled || page <= 1} className={buttonClass} onClick={() => onPage(page - 1)}>Anterior</button>
    <span>Página {pagination.current_page} de {Math.max(1, pagination.total_pages)} · {pagination.total_count} {noun}</span>
    <button type="button" disabled={disabled || page >= pagination.total_pages} className={buttonClass} onClick={() => onPage(page + 1)}>Próxima</button>
  </nav>;
}
