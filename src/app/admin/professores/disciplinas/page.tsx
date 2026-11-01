'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import DisciplinasPanel from '@/components/admin/DisciplinasPanel';
import { CommunitySubrouteLayout } from '@/components/admin/communityAdminUi';

export default function AdminProfessoresDisciplinasPage() {
  return (
    <AdminShell activeSection="professoresDisciplinas">
      {() => <CommunitySubrouteLayout active="professoresDisciplinas"><DisciplinasPanel /></CommunitySubrouteLayout>}
    </AdminShell>
  );
}
