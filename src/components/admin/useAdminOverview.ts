'use client';

import { useCallback, useRef, useState, type SetStateAction } from 'react';
import type { AAviso } from '@/lib/api';
import type { DatabaseSchema } from '@/types';
import { applyOverviewSnapshot, createAdminOverviewLoader, createInitialOverviewState,
  getOverviewMetrics, startOverviewLoading } from '@/lib/admin-overview';

// Sem efeitos de leitura: a página inicia a carga somente após sua autorização existente.
export function useAdminOverview() {
  const [state, setState] = useState(createInitialOverviewState);
  const [read] = useState(createAdminOverviewLoader);
  const pending = useRef<Promise<void> | null>(null);

  const reload = useCallback((authorized: boolean): Promise<void> => {
    if (!authorized) return Promise.resolve();
    if (pending.current) return pending.current;
    setState(startOverviewLoading);
    const request = read(true).then((snapshot) => {
      if (snapshot) setState((previous) => applyOverviewSnapshot(previous, snapshot));
    }).finally(() => { pending.current = null; });
    pending.current = request;
    return request;
  }, [read]);

  // Compatibilidade com os blocos antigos que ainda compartilham estes dados.
  const setData = useCallback((action: SetStateAction<DatabaseSchema | null>) => {
    setState((previous) => ({ ...previous, legacy: { ...previous.legacy,
      data: typeof action === 'function' ? action(previous.legacy.data) : action } }));
  }, []);
  const setApiAvisos = useCallback((action: SetStateAction<AAviso[]>) => {
    setState((previous) => {
      if (!previous.avisos.data) return previous;
      const items = typeof action === 'function' ? action(previous.avisos.data.items) : action;
      return { ...previous, avisos: { ...previous.avisos, data: { ...previous.avisos.data, items } } };
    });
  }, []);

  return {
    ...getOverviewMetrics(state),
    data: state.legacy.data, errorData: state.legacy.error, loadingData: state.legacy.loading, setData,
    apiNews: state.news.data?.items || [], loadingNews: state.news.loading, errorNews: state.news.error,
    apiAvisos: state.avisos.data?.items || [], loadingAvisos: state.avisos.loading, errorAvisos: state.avisos.error, setApiAvisos,
    loadingFotos: state.gallery.loading, errorFotos: state.gallery.error,
    errorUsers: state.users.error, loadingUsers: state.users.loading,
    reload,
  };
}
