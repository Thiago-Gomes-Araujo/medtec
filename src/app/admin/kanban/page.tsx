'use client';

import { useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { usePermissoes } from '@/components/admin/usePermissoes';
import EditorialKanban from '@/components/EditorialKanban';
import { useEditorialNews } from '@/components/admin/useEditorialNews';
import CommunityApprovalQueue from '@/components/admin/CommunityApprovalQueue';
import DuvidasVisitanteQueue from '@/components/admin/DuvidasVisitanteQueue';
import ProjetosApprovalQueue from '@/components/admin/ProjetosApprovalQueue';

// Montado pelo shell somente depois da verificação da sessão e da autorização.
function KanbanContent() {
  const { pode } = usePermissoes();
  const canApprove = pode('n_noticias', 'publicar');
  const canReject = pode('n_noticias', 'reprovar');
  const canModerate = canApprove || canReject;
  const {
    effectiveNews, loadingNews, errorNews, reload, approveNews, rejectNews,
  } = useEditorialNews({ canApprove, canReject });

  useEffect(() => {
    let active = true;
    async function load() {
      await Promise.resolve();
      if (active && canModerate) await reload();
    }
    void load();
    return () => { active = false; };
  }, [canModerate, reload]);

  return (
    <div className="space-y-6">
      <EditorialKanban
        news={effectiveNews}
        loading={loadingNews}
        error={errorNews}
        onApproveNews={approveNews}
        onRejectNews={rejectNews}
        canApprove={canApprove}
        canReject={canReject}
      />
      <CommunityApprovalQueue />
      <ProjetosApprovalQueue />
      <DuvidasVisitanteQueue />
    </div>
  );
}

export default function AdminKanbanSubroutePage() {
  return (
    <AdminShell activeSection="kanban">
      {() => <KanbanContent />}
    </AdminShell>
  );
}
