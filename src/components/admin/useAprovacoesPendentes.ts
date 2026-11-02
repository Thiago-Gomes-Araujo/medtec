'use client';

import { useEffect, useState } from 'react';
import { medtecApi } from '@/lib/api';

const listeners = new Set<() => void>();

// O menu fica fora das telas que moderam: elas avisam quando o total muda.
export function notifyAprovacoesPendentes() {
  listeners.forEach(listener => listener());
}

// Só o total importa: per_page=1 evita trazer os registros para contar.
const QUERY = { page: 1, per_page: 1, 'q[n_status_noticia_slug_eq]': 'aguardando' };

// Soma o que a Fila de Aprovação modera. Dúvidas do público têm contador próprio no menu.
export function useAprovacoesPendentes(enabled: boolean) {
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
    Promise.allSettled([
      medtecApi.noticias.list(QUERY, controller.signal),
      medtecApi.conquistas.list(QUERY, controller.signal),
      medtecApi.relatos.list(QUERY, controller.signal),
      medtecApi.projetos.list(QUERY, controller.signal),
    ]).then(results => {
      if (controller.signal.aborted) return;
      const totals = results.flatMap(result => result.status === 'fulfilled' ? [result.value.data.pagination.total_count] : []);
      // A parte recusada fica de fora; sem nenhuma resposta, não há total a mostrar.
      setState(totals.length > 0
        ? { count: totals.reduce((sum, value) => sum + value, 0), error: null }
        : { count: null, error: 'Não foi possível carregar as aprovações.' });
    });
    return () => controller.abort();
  }, [enabled, version]);

  return state;
}
