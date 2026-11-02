'use client';

import { useEffect, useState } from 'react';
import { ApiError, medtecApi } from '@/lib/api';

export interface ProjetosResumo {
  total: number | null;
  pending: number | null;
  published: number | null;
  error: string | null;
}

// Só os totais importam: per_page=1 evita trazer os projetos para contar.
export function useProjetosResumo(enabled: boolean) {
  const [state, setState] = useState<ProjetosResumo>({ total: null, pending: null, published: null, error: null });

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const count = (status?: string) => medtecApi.projetos.list({ page: 1, per_page: 1, 'q[n_status_noticia_slug_eq]': status }, controller.signal)
      .then(response => response.data.pagination.total_count);
    Promise.all([count(), count('aguardando'), count('publicada')]).then(([total, pending, published]) => {
      if (!controller.signal.aborted) setState({ total, pending, published, error: null });
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setState({ total: null, pending: null, published: null, error: ApiError.getFriendlyMessage(cause) });
    });
    return () => controller.abort();
  }, [enabled]);

  return state;
}
