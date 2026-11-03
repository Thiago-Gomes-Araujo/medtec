'use client';

import AdminShell from '@/components/admin/AdminShell';
import FilaAprovacao from '@/components/admin/FilaAprovacao';

export default function AdminKanbanSubroutePage() {
  return (
    <AdminShell activeSection="kanban">
      {() => <FilaAprovacao />}
    </AdminShell>
  );
}
