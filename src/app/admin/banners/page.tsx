'use client';

import AdminShell from '@/components/admin/AdminShell';
import BannersPanel from '@/components/admin/BannersPanel';

export default function AdminBannersSubroutePage() {
  return (
    <AdminShell activeSection="fotos">
      {() => <BannersPanel />}
    </AdminShell>
  );
}
