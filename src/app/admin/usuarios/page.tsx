'use client';

import AdminShell, { canAccessAdminUsers, type AdminSession } from '@/components/admin/AdminShell';
import UserManager from '@/components/UserManager';
import { useAdminUsers } from '@/components/admin/useAdminUsers';

// O shell monta este conteúdo somente após verificar sessão e autorização.
function UsersContent({ session }: { session: AdminSession }) {
  const management = useAdminUsers({ enabled: canAccessAdminUsers(session) });

  return <UserManager management={management} />;
}

export default function AdminUsuariosSubroutePage() {
  return (
    <AdminShell activeSection="usuarios">
      {(session) => <UsersContent session={session} />}
    </AdminShell>
  );
}
