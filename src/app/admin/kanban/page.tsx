'use client';

import { useEffect } from 'react';
import AdminShell, { type AdminSession } from '@/components/admin/AdminShell';
import EditorialKanban from '@/components/EditorialKanban';
import { useEditorialNews } from '@/components/admin/useEditorialNews';
import CommunityApprovalQueue from '@/components/admin/CommunityApprovalQueue';

// Montado pelo shell somente depois da verificação da sessão e da autorização.
function KanbanContent({ session }: { session: AdminSession }) {
  const canModerate = session.isGestor && session.apiUser?.perfil_nome === 'Administrador';
  const {
    effectiveNews, loadingNews, errorNews, reload, approveNews, rejectNews,
  } = useEditorialNews({ canApprove: canModerate, canReject: canModerate });

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
        canApprove={canModerate}
        canReject={canModerate}
      />
      <CommunityApprovalQueue />
    </div>
  );
}

export default function AdminKanbanSubroutePage() {
  return (
    <AdminShell activeSection="kanban">
      {(session) => <KanbanContent session={session} />}
    </AdminShell>
  );
}
