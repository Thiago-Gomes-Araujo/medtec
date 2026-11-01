'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import TeachersAdminModule from '@/components/admin/TeachersAdminModule';

export default function AdminProfessoresPage() {
  return (
    <AdminShell activeSection="professores">
      {() => <TeachersAdminModule />}
    </AdminShell>
  );
}
