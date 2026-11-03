'use client';

import { useEffect, useState } from 'react';
import { medtecApi, type ApiResponse, type PaginatedData } from '@/lib/api';
import type { MODULOS_APROVACAO } from '@/lib/admin-navigation';

const listeners = new Set<() => void>();

// O menu fica fora das telas que moderam: elas avisam quando o total muda.
export function notifyAprovacoesPendentes() {
  listeners.forEach(listener => listener());
}

// Só o total importa: per_page=1 evita trazer os registros para contar.
const QUERY = { page: 1, per_page: 1, 'q[n_status_noticia_slug_eq]': 'aguardando' };

type ModuloAprovacao = (typeof MODULOS_APROVACAO)[number];
const CONTAGENS: Record<ModuloAprovacao, (signal: AbortSignal) => Promise<ApiResponse<PaginatedData<unknown>>>> = {
  n_noticias: signal => medtecApi.noticias.list(QUERY, signal),
  d_duvidas: signal => medtecApi.duvidas.list(QUERY, signal),
  c_conquistas_aluno: signal => medtecApi.conquistas.list(QUERY, signal),
  p_relatos: signal => medtecApi.relatos.list(QUERY, signal),
  pj_projetos: signal => medtecApi.projetos.list(QUERY, signal),
};

// Soma o que a Fila de Aprovação modera, só nos módulos recebidos (os que a pessoa publica).
// Dúvidas do público têm contador próprio no menu.
export function useAprovacoesPendentes(modulos: readonly ModuloAprovacao[]) {
  const [state, setState] = useState<{ count: number | null; error: string | null }>({ count: null, error: null });
  const [version, setVersion] = useState(0);
  const chave = modulos.join(',');
  const enabled = chave !== '';

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => setVersion(current => current + 1);
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, [enabled]);

  useEffect(() => {
    if (!chave) return;
    const controller = new AbortController();
    Promise.allSettled((chave.split(',') as ModuloAprovacao[]).map(modulo => CONTAGENS[modulo](controller.signal))).then(results => {
      if (controller.signal.aborted) return;
      const totals = results.flatMap(result => result.status === 'fulfilled' ? [result.value.data.pagination.total_count] : []);
      // A parte recusada fica de fora; sem nenhuma resposta, não há total a mostrar.
      setState(totals.length > 0
        ? { count: totals.reduce((sum, value) => sum + value, 0), error: null }
        : { count: null, error: 'Não foi possível carregar as aprovações.' });
    });
    return () => controller.abort();
  }, [chave, version]);

  return state;
}
