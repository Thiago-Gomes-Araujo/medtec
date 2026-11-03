'use client';

import { useEffect } from 'react';
import EditorialKanban from '@/components/EditorialKanban';
import { usePermissoes } from './usePermissoes';
import { useEditorialNews } from './useEditorialNews';
import CommunityApprovalQueue from './CommunityApprovalQueue';
import DuvidasApprovalQueue from './DuvidasApprovalQueue';
import DuvidasVisitanteQueue from './DuvidasVisitanteQueue';
import ProjetosApprovalQueue from './ProjetosApprovalQueue';

function NewsQueue() {
  const { pode } = usePermissoes();
  const canApprove = pode('n_noticias', 'publicar');
  const canReject = pode('n_noticias', 'reprovar');
  const {
    effectiveNews, loadingNews, errorNews, reload, approveNews, rejectNews,
  } = useEditorialNews({ canApprove, canReject });

  useEffect(() => {
    let active = true;
    async function load() {
      await Promise.resolve();
      if (active) await reload();
    }
    void load();
    return () => { active = false; };
  }, [reload]);

  return (
    <EditorialKanban
      news={effectiveNews}
      loading={loadingNews}
      error={errorNews}
      onApproveNews={approveNews}
      onRejectNews={rejectNews}
      canApprove={canApprove}
      canReject={canReject}
    />
  );
}

// Montada pelo shell somente depois da verificação da sessão e da autorização.
// Cada bloco só aparece (e só consulta a API) para quem publica no módulo dele.
export default function FilaAprovacao() {
  const { pode } = usePermissoes();
  return (
    <div className="space-y-6">
      {pode('n_noticias', 'publicar') && <NewsQueue />}
      {pode('d_duvidas', 'publicar') && <DuvidasApprovalQueue />}
      <CommunityApprovalQueue />
      {pode('pj_projetos', 'publicar') && <ProjetosApprovalQueue />}
      {pode('d_duvidas_visitante', 'responder') && <DuvidasVisitanteQueue />}
    </div>
  );
}
