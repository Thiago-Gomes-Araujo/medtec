'use client';

import { useEffect, useState } from 'react';
import { medtecApi } from '@/lib/api';

const listeners = new Set<() => void>();

// O menu fica fora das telas que moderam projetos: elas avisam quando o total muda.
export function notifyProjetosPendentes() {
  listeners.forEach(listener => listener());
}

// Só o total importa: per_page=1 evita trazer os projetos para contar. Sem permissão, o menu fica sem contador.
export function useProjetosPendentes(enabled: boolean) {
  const [count, setCount] = useState<number | null>(null);
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
    medtecApi.projetos.list({ page: 1, per_page: 1, 'q[n_status_noticia_slug_eq]': 'aguardando' }, controller.signal).then(response => {
      if (!controller.signal.aborted) setCount(response.data.pagination.total_count);
    }).catch(() => {
      if (!controller.signal.aborted) setCount(null);
    });
    return () => controller.abort();
  }, [enabled, version]);

  return count;
}
