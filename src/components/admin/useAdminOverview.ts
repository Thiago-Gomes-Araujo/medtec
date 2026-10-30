'use client';

import { useCallback, useRef, useState } from 'react';
import { applyOverviewSnapshot, createAdminOverviewLoader, createInitialOverviewState,
  getOverviewHighlights, getOverviewMetrics, startOverviewLoading } from '@/lib/admin-overview';

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

  return {
    ...getOverviewMetrics(state),
    ...getOverviewHighlights(state),
    apiNews: state.news.loading || state.news.error ? [] : (state.news.data?.items || []),
    loadingNews: state.news.loading, errorNews: state.news.error,
    apiAvisos: state.avisos.loading || state.avisos.error ? [] : (state.avisos.data?.items || []),
    loadingAvisos: state.avisos.loading, errorAvisos: state.avisos.error,
    loadingFotos: state.gallery.loading, errorFotos: state.gallery.error,
    errorUsers: state.users.error, loadingUsers: state.users.loading,
    reload,
  };
}
