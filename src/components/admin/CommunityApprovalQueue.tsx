'use client';

import { medtecApi, type ApiResponse, type CConquistaAluno, type PaginatedData, type PRelato } from '@/lib/api';
import { buttonClass, panelClass, renderFeedback, renderModerationButtons, useAdminAction, useApiList, type ModeracaoAction } from './communityAdminUi';
import { notifyAprovacoesPendentes } from './useAprovacoesPendentes';
import { notifyRelatosPendentes } from './useRelatosPendentes';
import { usePermissoes } from './usePermissoes';

const AGUARDANDO = { page: 'all', 'q[n_status_noticia_slug_eq]': 'aguardando' };
const readConquistas = (signal: AbortSignal) => medtecApi.conquistas.list(AGUARDANDO, signal);
const readRelatos = (signal: AbortSignal) => medtecApi.relatos.list(AGUARDANDO, signal);
// Coluna de quem não publica no módulo: nada é consultado na API.
const semLeitura = <T,>(): Promise<ApiResponse<PaginatedData<T>>> => Promise.resolve({
  success: true, message: '', data: { items: [], pagination: { current_page: 1, total_pages: 0, total_count: 0, per_page: 1 } },
});

// Conquistas e relatos aguardando; independente do fluxo de Notícias do Kanban.
// Cada coluna só aparece (e só consulta a API) para quem publica no módulo dela.
export default function CommunityApprovalQueue() {
  const { pode } = usePermissoes();
  const podeConquistas = pode('c_conquistas_aluno', 'publicar');
  const podeRelatos = pode('p_relatos', 'publicar');
  const conquistas = useApiList<CConquistaAluno>(podeConquistas ? readConquistas : semLeitura);
  const relatos = useApiList<PRelato>(podeRelatos ? readRelatos : semLeitura);
  const action = useAdminAction();

  async function moderateConquista(item: CConquistaAluno, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.conquistas[operation](item.id);
      return operation === 'publicar' ? 'Conquista publicada.' : 'Conquista reprovada.';
    });
    if (done) { conquistas.reload(); notifyAprovacoesPendentes(); }
  }

  async function moderateRelato(item: PRelato, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.relatos[operation](item.id);
      return operation === 'publicar' ? 'Relato publicado.' : 'Relato reprovado.';
    });
    if (done) { relatos.reload(); notifyRelatosPendentes(); }
  }

  if (!podeConquistas && !podeRelatos) return null;
  const titulo = podeConquistas && podeRelatos ? 'Conquistas e relatos aguardando' : podeConquistas ? 'Conquistas aguardando' : 'Relatos aguardando';

  return (
    <section aria-label={`${titulo} aprovação`} className={panelClass}>
      <header>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{titulo}</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Só aparecem no site depois de publicados.</p>
      </header>
      {renderFeedback(action.error, action.success)}

      <div className={podeConquistas && podeRelatos ? 'grid gap-6 lg:grid-cols-2' : ''}>
        {podeConquistas && <div className="space-y-3">
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
              <div className="flex flex-wrap gap-2">{renderModerationButtons(item.status, item.titulo, action.busy, operation => void moderateConquista(item, operation), acao => pode('c_conquistas_aluno', acao))}</div>
            </li>)}
          </ul>}
        </div>}

        {podeRelatos && <div className="space-y-3">
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
              <div className="flex flex-wrap gap-2">{renderModerationButtons(item.status, `relato de ${item.nome}`, action.busy, operation => void moderateRelato(item, operation), acao => pode('p_relatos', acao))}</div>
            </li>)}
          </ul>}
        </div>}
      </div>
    </section>
  );
}
