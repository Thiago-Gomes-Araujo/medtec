'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import StudentsAdminModule from '@/components/admin/StudentsAdminModule';

export default function AdminAlunosPage() {
  return (
    <AdminShell activeSection="alunos">
      {() => <StudentsAdminModule />}
    </AdminShell>
  );
}
