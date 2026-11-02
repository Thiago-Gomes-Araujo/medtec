'use client';

import { medtecApi, type PjProjeto } from '@/lib/api';
import { buttonClass, panelClass, renderFeedback, renderModerationButtons, useAdminAction, useApiList, type ModeracaoAction } from './communityAdminUi';

const AGUARDANDO = { page: 'all', 'q[n_status_noticia_slug_eq]': 'aguardando' };
const readProjetos = (signal: AbortSignal) => medtecApi.projetos.list(AGUARDANDO, signal);

export default function ProjetosApprovalQueue() {
  const projetos = useApiList<PjProjeto>(readProjetos);
  const action = useAdminAction();

  async function moderate(item: PjProjeto, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.projetos[operation](item.id);
      return operation === 'publicar' ? 'Projeto publicado.' : 'Projeto reprovado.';
    });
    if (done) projetos.reload();
  }

  return (
    <section aria-label="Projetos aguardando aprovação" className={panelClass}>
      <header>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Projetos aguardando ({projetos.items.length})</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Só aparecem no site depois de publicados.</p>
      </header>
      {renderFeedback(action.error, action.success)}

      {projetos.loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando projetos...</p>}
      {projetos.error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{projetos.error}</p>
        <button type="button" className={buttonClass} aria-label="Recarregar projetos" onClick={projetos.reload}>Tentar novamente</button>
      </div>}
      {!projetos.loading && !projetos.error && projetos.items.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum projeto aguardando.</p>}
      {!projetos.loading && !projetos.error && <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {projetos.items.map(item => <li key={item.id} className="space-y-2 py-3">
          <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.titulo}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{item.tema_nome} · {item.escola_nome} · {item.cidade_nome}</p>
          <p className="line-clamp-3 whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{item.relato}</p>
          <div className="flex flex-wrap gap-2">{renderModerationButtons(item.status, item.titulo, action.busy, operation => void moderate(item, operation))}</div>
        </li>)}
      </ul>}
    </section>
  );
}
