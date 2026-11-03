'use client';

import { medtecApi, type DDuvida } from '@/lib/api';
import { buttonClass, panelClass, renderFeedback, renderModerationButtons, useAdminAction, useApiList, type ModeracaoAction } from './communityAdminUi';
import { notifyAprovacoesPendentes } from './useAprovacoesPendentes';
import { usePermissoes } from './usePermissoes';

const AGUARDANDO = { page: 'all', 'q[n_status_noticia_slug_eq]': 'aguardando' };
const readDuvidas = (signal: AbortSignal) => medtecApi.duvidas.list(AGUARDANDO, signal);

// Perguntas frequentes aguardando: a reprovação das dúvidas não tem motivo.
export default function DuvidasApprovalQueue() {
  const { pode } = usePermissoes();
  const duvidas = useApiList<DDuvida>(readDuvidas);
  const action = useAdminAction();

  async function moderate(item: DDuvida, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.duvidas[operation](item.id);
      return operation === 'publicar' ? 'Pergunta publicada.' : 'Pergunta reprovada.';
    });
    if (done) { duvidas.reload(); notifyAprovacoesPendentes(); }
  }

  return (
    <section aria-label="Perguntas frequentes aguardando aprovação" className={panelClass}>
      <header>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Perguntas frequentes aguardando ({duvidas.items.length})</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Só aparecem na Central de Dúvidas depois de publicadas.</p>
      </header>
      {renderFeedback(action.error, action.success)}

      {duvidas.loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando perguntas...</p>}
      {duvidas.error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{duvidas.error}</p>
        <button type="button" className={buttonClass} aria-label="Recarregar perguntas" onClick={duvidas.reload}>Tentar novamente</button>
      </div>}
      {!duvidas.loading && !duvidas.error && duvidas.items.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">Nenhuma pergunta aguardando.</p>}
      {!duvidas.loading && !duvidas.error && <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {duvidas.items.map(item => <li key={item.id} className="space-y-2 py-3">
          <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.pergunta}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{item.categoria_nome} · Autor: {item.autor_nome}</p>
          <p className="line-clamp-3 whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{item.resposta}</p>
          <div className="flex flex-wrap gap-2">{renderModerationButtons(item.status, item.pergunta, action.busy, operation => void moderate(item, operation), acao => pode('d_duvidas', acao))}</div>
        </li>)}
      </ul>}
    </section>
  );
}
