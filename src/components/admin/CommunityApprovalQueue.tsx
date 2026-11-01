'use client';

import { medtecApi, type CConquistaAluno, type PRelato } from '@/lib/api';
import { buttonClass, panelClass, renderFeedback, renderModerationButtons, useAdminAction, useApiList, type ModeracaoAction } from './communityAdminUi';

const AGUARDANDO = { page: 'all', 'q[n_status_noticia_slug_eq]': 'aguardando' };
const readConquistas = (signal: AbortSignal) => medtecApi.conquistas.list(AGUARDANDO, signal);
const readRelatos = (signal: AbortSignal) => medtecApi.relatos.list(AGUARDANDO, signal);

// Conquistas e relatos aguardando; independente do fluxo de Notícias do Kanban.
export default function CommunityApprovalQueue() {
  const conquistas = useApiList<CConquistaAluno>(readConquistas);
  const relatos = useApiList<PRelato>(readRelatos);
  const action = useAdminAction();

  async function moderateConquista(item: CConquistaAluno, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.conquistas[operation](item.id);
      return operation === 'publicar' ? 'Conquista publicada.' : 'Conquista reprovada.';
    });
    if (done) conquistas.reload();
  }

  async function moderateRelato(item: PRelato, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.relatos[operation](item.id);
      return operation === 'publicar' ? 'Relato publicado.' : 'Relato reprovado.';
    });
    if (done) relatos.reload();
  }

  return (
    <section aria-label="Conquistas e relatos aguardando aprovação" className={panelClass}>
      <header>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Conquistas e relatos aguardando</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Só aparecem no site depois de publicados.</p>
      </header>
      {renderFeedback(action.error, action.success)}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Conquistas ({conquistas.items.length})</h3>
          {conquistas.loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando conquistas...</p>}
          {conquistas.error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
            <p>{conquistas.error}</p>
            <button type="button" className={buttonClass} aria-label="Recarregar conquistas" onClick={conquistas.reload}>Tentar novamente</button>
          </div>}
          {!conquistas.loading && !conquistas.error && conquistas.items.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">Nenhuma conquista aguardando.</p>}
          {!conquistas.loading && !conquistas.error && <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {conquistas.items.map(item => <li key={item.id} className="space-y-2 py-3">
              <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.titulo}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{item.nome_aluno} · {item.categoria_nome} · {item.escola_nome}</p>
              <div className="flex flex-wrap gap-2">{renderModerationButtons(item.status, item.titulo, action.busy, operation => void moderateConquista(item, operation))}</div>
            </li>)}
          </ul>}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Relatos ({relatos.items.length})</h3>
          {relatos.loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando relatos...</p>}
          {relatos.error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
            <p>{relatos.error}</p>
            <button type="button" className={buttonClass} aria-label="Recarregar relatos" onClick={relatos.reload}>Tentar novamente</button>
          </div>}
          {!relatos.loading && !relatos.error && relatos.items.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum relato aguardando.</p>}
          {!relatos.loading && !relatos.error && <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {relatos.items.map(item => <li key={item.id} className="space-y-2 py-3">
              <p className="text-xs text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">{item.nome}</strong> sobre {item.professor_nome} · {item.email} · {item.telefone}</p>
              <p className="whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{item.texto}</p>
              <div className="flex flex-wrap gap-2">{renderModerationButtons(item.status, `relato de ${item.nome}`, action.busy, operation => void moderateRelato(item, operation))}</div>
            </li>)}
          </ul>}
        </div>
      </div>
    </section>
  );
}
