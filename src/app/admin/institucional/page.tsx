'use client';

import React from 'react';
import HomePillarsModule from '@/components/admin/HomePillarsModule';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminInstitucionalSubroutePage() {
  return (
    <AdminShell activeSection="siteInfo">
      {() => <HomePillarsModule active />}
    </AdminShell>
  );
}
