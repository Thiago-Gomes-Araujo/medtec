'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ProfessoresPanel from '@/components/admin/ProfessoresPanel';
import { CommunitySubrouteLayout } from '@/components/admin/communityAdminUi';

export default function AdminProfessoresPage() {
  return (
    <AdminShell activeSection="professores">
      {() => <CommunitySubrouteLayout active="professores"><ProfessoresPanel /></CommunitySubrouteLayout>}
    </AdminShell>
  );
}
