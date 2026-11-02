'use client';

import { useEffect, useState } from 'react';
import { ApiError, medtecApi } from '@/lib/api';

const listeners = new Set<() => void>();

// Menu e Início ficam fora das telas que respondem: elas avisam quando o total muda.
export function notifyDuvidasPendentes() {
  listeners.forEach(listener => listener());
}

// Só o total importa: per_page=1 evita trazer os envios para contar.
export function useDuvidasPendentes(enabled: boolean) {
  const [state, setState] = useState<{ count: number | null; error: string | null }>({ count: null, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => setVersion(current => current + 1);
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    medtecApi.duvidasVisitante.list({ 'q[respondida_false]': 1, page: 1, per_page: 1 }, controller.signal).then(response => {
      if (!controller.signal.aborted) setState({ count: response.data.pagination.total_count, error: null });
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setState({ count: null, error: ApiError.getFriendlyMessage(cause) });
    });
    return () => controller.abort();
  }, [enabled, version]);

  return state;
}
