'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SECTION_CONFIG } from '@/lib/admin-navigation';
import { medtecApi, type DDuvidaVisitante } from '@/lib/api';
import { buttonClass, panelClass, renderFeedback, useAdminAction, useApiList } from './communityAdminUi';
import { notifyDuvidasPendentes } from './useDuvidasPendentes';

const NAO_RESPONDIDAS = { page: 'all', 'q[respondida_false]': 1 };
const readPendentes = (signal: AbortSignal) => medtecApi.duvidasVisitante.list(NAO_RESPONDIDAS, signal);

// Marcar como respondida só registra o atendimento feito por e-mail ou telefone: a API não recebe nem guarda a resposta.
export default function DuvidasVisitanteQueue() {
  const pendentes = useApiList<DDuvidaVisitante>(readPendentes);
  const action = useAdminAction();
  const [respondidas, setRespondidas] = useState<DDuvidaVisitante[]>([]);
  const [confirming, setConfirming] = useState<number | null>(null);

  async function responder(item: DDuvidaVisitante) {
    const done = await action.run(async () => {
      const value = await medtecApi.duvidasVisitante.responder(item.id);
      if (value.respondida) setRespondidas(previous => [value, ...previous]);
      return value.respondida ? 'Dúvida marcada como respondida.' : 'Registro atualizado. A dúvida permanece não respondida.';
    });
    if (done) { setConfirming(null); pendentes.reload(); notifyDuvidasPendentes(); }
  }

  return (
    <section aria-label="Dúvidas de visitantes sem resposta" className={panelClass}>
      <header>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Dúvidas de visitantes ({pendentes.items.length})</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Entre em contato por e-mail ou telefone. Marcar como respondida apenas registra o atendimento; nenhuma mensagem é enviada.</p>
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
          <button type="button" className={buttonClass} disabled={action.busy || confirming !== null} aria-label={`Marcar como respondida: ${item.nome}`} onClick={() => { setConfirming(item.id); action.setError(null); action.setSuccess(null); }}>Marcar como respondida</button>
          {confirming === item.id && <div role="group" aria-label="Confirmar atendimento" className="space-y-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <p>Marcar a dúvida de <strong className="break-words">{item.nome}</strong> como respondida? Nenhuma mensagem é enviada: confirme só depois de responder por e-mail ou telefone.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void responder(item)}>Confirmar resposta</button>
              <button type="button" disabled={action.busy} className={buttonClass} onClick={() => { setConfirming(null); action.setError(null); }}>Cancelar</button>
            </div>
          </div>}
        </li>)}
      </ul>}

      {respondidas.length > 0 && <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Respondidas agora</h3>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {respondidas.map(item => <li key={item.id} className="space-y-2 py-3">
            <p className="line-clamp-2 whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{item.descricao}</p>
            <Link href={`${SECTION_CONFIG.duvidas.href}?visitante=${item.id}`} className={`inline-block ${buttonClass}`} aria-label={`Transformar em FAQ: ${item.nome}`}>Transformar em FAQ</Link>
          </li>)}
        </ul>
      </div>}
    </section>
  );
}
