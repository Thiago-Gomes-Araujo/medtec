'use client';

import AdminShell from '@/components/admin/AdminShell';
import UserManager from '@/components/UserManager';
import { useAdminUsers } from '@/components/admin/useAdminUsers';
import { usePermissoes } from '@/components/admin/usePermissoes';

// O shell monta este conteúdo somente após verificar sessão e autorização.
function UsersContent() {
  const { pode } = usePermissoes();
  const management = useAdminUsers({ enabled: pode('usuarios', 'index') });

  return <UserManager management={management} />;
}

export default function AdminUsuariosSubroutePage() {
  return (
    <AdminShell activeSection="usuarios">
      {() => <UsersContent />}
    </AdminShell>
  );
}
