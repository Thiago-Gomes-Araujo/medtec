'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import CategoriasConquistaPanel from '@/components/admin/CategoriasConquistaPanel';
import { CommunitySubrouteLayout } from '@/components/admin/communityAdminUi';

export default function AdminAlunosCategoriasPage() {
  return (
    <AdminShell activeSection="alunosCategorias">
      {() => <CommunitySubrouteLayout active="alunosCategorias"><CategoriasConquistaPanel /></CommunitySubrouteLayout>}
    </AdminShell>
  );
}
