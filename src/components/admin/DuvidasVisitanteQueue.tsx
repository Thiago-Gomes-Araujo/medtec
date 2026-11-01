'use client';

import { medtecApi, type DDuvidaVisitante } from '@/lib/api';
import { buttonClass, panelClass, renderFeedback, useAdminAction, useApiList } from './communityAdminUi';
import { notifyDuvidasPendentes } from './useDuvidasPendentes';

const NAO_RESPONDIDAS = { page: 'all', 'q[respondida_false]': 1 };
const readPendentes = (signal: AbortSignal) => medtecApi.duvidasVisitante.list(NAO_RESPONDIDAS, signal);

// Responder só registra o atendimento feito por e-mail ou telefone: a API não recebe nem guarda a resposta.
export default function DuvidasVisitanteQueue() {
  const pendentes = useApiList<DDuvidaVisitante>(readPendentes);
  const action = useAdminAction();

  async function responder(item: DDuvidaVisitante) {
    const done = await action.run(async () => {
      const value = await medtecApi.duvidasVisitante.responder(item.id);
      return value.respondida ? 'Dúvida marcada como respondida.' : 'Registro atualizado. A dúvida permanece não respondida.';
    });
    if (done) { pendentes.reload(); notifyDuvidasPendentes(); }
  }

  return (
    <section aria-label="Dúvidas de visitantes sem resposta" className={panelClass}>
      <header>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Dúvidas de visitantes ({pendentes.items.length})</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Entre em contato por e-mail ou telefone. Responder apenas registra o atendimento; nenhuma mensagem é enviada.</p>
      </header>
      {renderFeedback(action.error, action.success)}

      {pendentes.loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando dúvidas de visitantes...</p>}
      {pendentes.error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{pendentes.error}</p>
        <button type="button" className={buttonClass} aria-label="Recarregar dúvidas de visitantes" onClick={pendentes.reload}>Tentar novamente</button>
      </div>}
      {!pendentes.loading && !pendentes.error && pendentes.items.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">Nenhuma dúvida sem resposta.</p>}
      {!pendentes.loading && !pendentes.error && <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {pendentes.items.map(item => <li key={item.id} className="space-y-2 py-3">
          <p className="text-xs text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">{item.nome}</strong> · {item.email}{item.telefone ? ` · ${item.telefone}` : ''}</p>
          <p className="whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{item.descricao}</p>
          <button type="button" className={buttonClass} disabled={action.busy} aria-label={`Responder ${item.nome}`} onClick={() => void responder(item)}>Responder</button>
        </li>)}
      </ul>}
    </section>
  );
}
