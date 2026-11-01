'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ConquistasPanel from '@/components/admin/ConquistasPanel';
import { CommunitySubrouteLayout } from '@/components/admin/communityAdminUi';

export default function AdminAlunosPage() {
  return (
    <AdminShell activeSection="alunos">
      {() => <CommunitySubrouteLayout active="alunos"><ConquistasPanel /></CommunitySubrouteLayout>}
    </AdminShell>
  );
}
