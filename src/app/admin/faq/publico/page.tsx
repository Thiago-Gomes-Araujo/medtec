'use client';

import AdminShell from '@/components/admin/AdminShell';
import DuvidasVisitanteModule from '@/components/admin/DuvidasVisitanteModule';

export default function AdminFaqPublicoPage() {
  return (
    <AdminShell activeSection="duvidasPublico">
      {() => <DuvidasVisitanteModule />}
    </AdminShell>
  );
}
