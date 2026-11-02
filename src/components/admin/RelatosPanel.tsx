'use client';

import { useCallback, useId, useState } from 'react';
import { medtecApi, type ModeracaoStatus, type PProfessor, type PRelato } from '@/lib/api';
import { dateLabel, formatTelefone, mailtoHref, telHref } from '@/lib/community-content';
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
import { notifyRelatosPendentes } from './useRelatosPendentes';

const readProfessores = (signal: AbortSignal) => medtecApi.professores.list({ page: 'all' }, signal);

// Relatos chegam só pelo site: o painel apenas modera.
export default function RelatosPanel() {
  const id = useId();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ModeracaoStatus | ''>('aguardando');
  const [professorId, setProfessorId] = useState('');
  const [deleting, setDeleting] = useState<PRelato | null>(null);
  const read = useCallback((signal: AbortSignal) => medtecApi.relatos.list({
    page, per_page: 10, 'q[n_status_noticia_slug_eq]': status || undefined, 'q[p_professor_id_eq]': professorId || undefined,
  }, signal), [page, status, professorId]);
  const { items, pagination, loading, error, reload } = useApiList<PRelato>(read);
  const professores = useApiList<PProfessor>(readProfessores);
  const action = useAdminAction();
  const blocked = action.busy || deleting !== null;

  async function moderate(item: PRelato, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.relatos[operation](item.id);
      return operation === 'publicar' ? 'Relato publicado.' : operation === 'reprovar' ? 'Relato reprovado.' : 'Relato retirado do site.';
    });
    if (done) { reload(); notifyRelatosPendentes(); }
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await medtecApi.relatos.delete(deleting.id);
      return 'Relato excluído.';
    });
    setDeleting(null);
    if (removed) {
      notifyRelatosPendentes();
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
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <select name="relato-filtro-status" aria-label="Filtrar por situação" value={status} className={inputClass} onChange={event => { setStatus(event.target.value as ModeracaoStatus | ''); setPage(1); }}>
          <option value="">Todas as situações</option>
          <option value="aguardando">Aguardando</option>
          <option value="publicada">Publicada</option>
          <option value="reprovada">Reprovada</option>
        </select>
        <select name="relato-filtro-professor" aria-label="Filtrar por professor" value={professorId} className={inputClass} onChange={event => { setProfessorId(event.target.value); setPage(1); }}>
          <option value="">Todos os professores</option>
          {professores.items.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
      </div>
      {professores.error && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{professores.error}</p>}

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando relatos...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {renderFeedback(action.error, action.success)}

      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhum relato encontrado.</p>}
      {!loading && !error && items.length > 0 && <ul className="space-y-3" aria-label="Relatos recebidos">
        {items.map(item => <li key={item.id} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{`Aluno: ${item.nome}`}</h3>
            {renderStatusBadge(item.status, item.status_nome)}
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a href={mailtoHref(item.email)} className="break-all text-[#004A99] underline dark:text-sky-400">{item.email}</a>
            <a href={telHref(item.telefone)} className="text-[#004A99] underline dark:text-sky-400">{formatTelefone(item.telefone)}</a>
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{`Professor: ${item.professor_nome} · Enviado em ${dateLabel(item.created_at)}`}</p>
          <p className="whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{item.texto}</p>
          <div className="flex flex-wrap gap-2">
            {renderModerationButtons(item.status, `relato de ${item.nome}`, blocked, operation => void moderate(item, operation))}
            <button type="button" disabled={blocked} aria-label={`Excluir relato de ${item.nome}`} className={buttonClass} onClick={() => setDeleting(item)}>Excluir</button>
          </div>
          {deleting?.id === item.id && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
            <p>Excluir o relato de <strong className="break-words">{item.nome}</strong>?</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
              <button type="button" disabled={action.busy} className={buttonClass} onClick={() => setDeleting(null)}>Cancelar exclusão</button>
            </div>
          </div>}
        </li>)}
      </ul>}
      {!error && renderPagination('Paginação de relatos', 'relatos', pagination, page, loading || blocked, setPage)}
    </section>
  );
}
