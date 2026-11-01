'use client';

import { useCallback, useId, useState } from 'react';
import { medtecApi, type ModeracaoStatus, type PRelato } from '@/lib/api';
import {
  buttonClass,
  inputClass,
  panelClass,
  renderFeedback,
  renderModerationButtons,
  renderPagination,
  renderStatusBadge,
  useAdminAction,
  useApiList,
  type ModeracaoAction,
} from './communityAdminUi';

export default function RelatosPanel() {
  const id = useId();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ModeracaoStatus | ''>('aguardando');
  const [deleting, setDeleting] = useState<PRelato | null>(null);
  const read = useCallback((signal: AbortSignal) => medtecApi.relatos.list({
    page, per_page: 10, 'q[n_status_noticia_slug_eq]': status || undefined,
  }, signal), [page, status]);
  const { items, pagination, loading, error, reload } = useApiList<PRelato>(read);
  const action = useAdminAction();
  const blocked = action.busy || deleting !== null;

  async function moderate(item: PRelato, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.relatos[operation](item.id);
      return operation === 'publicar' ? 'Relato publicado.' : operation === 'reprovar' ? 'Relato reprovado.' : 'Relato retirado do site.';
    });
    if (done) reload();
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await medtecApi.relatos.delete(deleting.id);
      return 'Relato excluído.';
    });
    setDeleting(null);
    if (removed) {
      if (items.length === 1 && page > 1) setPage(page - 1);
      else reload();
    }
  }

  return (
    <section aria-labelledby={`${id}-heading`} className={panelClass}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Relatos dos alunos</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Enviados pelo site. E-mail e telefone são visíveis só aqui, nunca no site.</p>
        </div>
        <select name="relato-filtro-status" aria-label="Filtrar por situação" value={status} className={`${inputClass} sm:w-56`} onChange={event => { setStatus(event.target.value as ModeracaoStatus | ''); setPage(1); }}>
          <option value="">Todas as situações</option>
          <option value="aguardando">Aguardando</option>
          <option value="publicada">Publicada</option>
          <option value="reprovada">Reprovada</option>
        </select>
      </header>

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando relatos...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {renderFeedback(action.error, action.success)}

      {deleting && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        <p>Excluir o relato de <strong className="break-words">{deleting.nome}</strong>?</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => setDeleting(null)}>Cancelar exclusão</button>
        </div>
      </div>}

      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhum relato encontrado.</p>}
      {!loading && !error && items.length > 0 && <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-label="Relatos recebidos">
        {items.map(item => <li key={item.id} className="space-y-2 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.nome}</h3>
            {renderStatusBadge(item.status, item.status_nome)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Sobre {item.professor_nome} · {item.email} · {item.telefone}</p>
          <p className="whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{item.texto}</p>
          <div className="flex flex-wrap gap-2">
            {renderModerationButtons(item.status, `relato de ${item.nome}`, blocked, operation => void moderate(item, operation))}
            <button type="button" disabled={blocked} aria-label={`Excluir relato de ${item.nome}`} className={buttonClass} onClick={() => setDeleting(item)}>Excluir</button>
          </div>
        </li>)}
      </ul>}
      {!error && renderPagination('Paginação de relatos', 'relatos', pagination, page, loading || blocked, setPage)}
    </section>
  );
}
