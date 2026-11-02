'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { CommunitySubrouteLayout } from '@/components/admin/communityAdminUi';
import type { AdminSection } from '@/lib/admin-navigation';

const SECTION_BY_PATH: Record<string, AdminSection> = {
  '/admin/projetos/temas': 'projetosTemas',
  '/admin/projetos/membros': 'projetosMembros',
  '/admin/projetos/aprovacao': 'projetosAprovacao',
};

// O shell e as abas persistem entre as subrotas; a guarda do shell só libera a página depois da sessão.
export default function AdminProjetosLayout({ children }: { children: ReactNode }) {
  const section = SECTION_BY_PATH[usePathname()] ?? 'projetos';
  return (
    <AdminShell activeSection={section}>
      {() => <CommunitySubrouteLayout active={section}>{children}</CommunitySubrouteLayout>}
    </AdminShell>
  );
}
