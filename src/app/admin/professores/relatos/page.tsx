'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import RelatosPanel from '@/components/admin/RelatosPanel';
import { CommunitySubrouteLayout } from '@/components/admin/communityAdminUi';

export default function AdminProfessoresRelatosPage() {
  return (
    <AdminShell activeSection="professoresRelatos">
      {() => <CommunitySubrouteLayout active="professoresRelatos"><RelatosPanel /></CommunitySubrouteLayout>}
    </AdminShell>
  );
}
