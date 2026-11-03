'use client';

import Image from 'next/image';
import { useCallback, useId, useState } from 'react';
import { getMediaUrl, medtecApi, type PjProjeto } from '@/lib/api';
import { formatFileSize, getProjetoImageSrc } from '@/lib/projetos-content';
import { buttonClass, panelClass, renderFeedback, renderModerationButtons, renderPagination, useAdminAction, useApiList, type ModeracaoAction } from './communityAdminUi';
import { notifyProjetosPendentes } from './useProjetosPendentes';
import { usePermissoes } from './usePermissoes';

function formatarData(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
}

// A API decide a permissão de cada ação: uma recusa 403 aparece como mensagem, sem esconder a fila.
export default function ProjetosAprovacaoPanel() {
  const id = useId();
  const [page, setPage] = useState(1);
  const [detalhe, setDetalhe] = useState<number | null>(null);
  const read = useCallback((signal: AbortSignal) => medtecApi.projetos.list({
    page, per_page: 10, 'q[n_status_noticia_slug_eq]': 'aguardando',
  }, signal), [page]);
  const { items, pagination, loading, error, reload } = useApiList<PjProjeto>(read);
  const action = useAdminAction();
  const { pode } = usePermissoes();

  async function moderate(item: PjProjeto, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.projetos[operation](item.id);
      return `${item.titulo}: projeto ${operation === 'publicar' ? 'publicado' : 'reprovado'}.`;
    });
    if (!done) return;
    notifyProjetosPendentes();
    if (items.length === 1 && page > 1) setPage(page - 1);
    else reload();
  }

  return (
    <section aria-labelledby={`${id}-heading`} className={panelClass}>
      <header>
        <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Projetos aguardando{pagination ? ` (${pagination.total_count})` : ''}</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Só aparecem no site depois de publicados.</p>
      </header>
      {renderFeedback(action.error, action.success)}

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando projetos...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhum projeto aguardando aprovação.</p>}

      {!loading && !error && items.length > 0 && <ul aria-label="Projetos aguardando aprovação" className="divide-y divide-slate-200 dark:divide-slate-800">
        {items.map(item => {
          const capa = getProjetoImageSrc(item);
          const aberto = detalhe === item.id;
          return <li key={item.id} className="space-y-3 py-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              {capa
                ? <Image unoptimized src={capa} alt={`Capa de ${item.titulo}`} width={160} height={90} className="h-[90px] w-40 shrink-0 rounded-lg object-cover" />
                : <div className="flex h-[90px] w-40 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">Sem capa</div>}
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.titulo}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{item.tema_nome} · {item.escola_nome}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Autor: {item.autor_nome || 'não informado'} · {formatarData(item.created_at)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-expanded={aberto} aria-controls={`${id}-detalhe-${item.id}`} aria-label={`${aberto ? 'Ocultar' : 'Ver'} detalhes de ${item.titulo}`} className={buttonClass} onClick={() => setDetalhe(aberto ? null : item.id)}>{aberto ? 'Ocultar detalhes' : 'Ver detalhes'}</button>
              {renderModerationButtons(item.status, item.titulo, action.busy, operation => void moderate(item, operation), acao => pode('pj_projetos', acao))}
            </div>
            {aberto && <div id={`${id}-detalhe-${item.id}`} className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-[#071324] dark:text-slate-200">
              <p className="text-xs text-slate-600 dark:text-slate-400">Município: {item.cidade_nome}</p>
              <p className="whitespace-pre-line break-words">{item.relato}</p>
              {item.membros.length > 0 && <div>
                <h4 className="text-xs font-semibold">Membros</h4>
                <ul className="mt-1 space-y-1 text-xs">{item.membros.map(membro => <li key={membro.id} className="break-words">{membro.nome} · {membro.funcao}</li>)}</ul>
              </div>}
              {item.anexos.length > 0 && <div>
                <h4 className="text-xs font-semibold">Anexos</h4>
                <ul className="mt-1 space-y-1 text-xs">{item.anexos.map(anexo => <li key={anexo.id}><a href={getMediaUrl(anexo.url)} target="_blank" rel="noopener noreferrer" className="break-all underline">{anexo.nome} ({formatFileSize(anexo.tamanho)})</a></li>)}</ul>
              </div>}
            </div>}
          </li>;
        })}
      </ul>}
      {!error && renderPagination('Paginação de projetos aguardando', 'projetos', pagination, page, loading || action.busy, setPage)}
    </section>
  );
}
