import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import AvisosView from '@/components/AvisosView';
import { getDatabase } from '@/lib/db';
import { AnnouncementItem } from '@/types';

export const metadata: Metadata = {
  title: 'Mural de Avisos Oficiais | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Orientações pedagógicas, alertas urgentes, datas de início de transmissões satelitais e informes emitidos pela Coordenadoria de Mídias Educacionais da SEDUC-RO.',
  openGraph: {
    title: 'Mural de Avisos Oficiais | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Orientações pedagógicas, alertas e informes da Coordenadoria de Mídias Educacionais da SEDUC-RO.',
  },
};

export default async function AvisosPage() {
  const db = getDatabase();
  const announcements: AnnouncementItem[] = db.announcements || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F9] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Mural Oficial de Comunicação"
          title="Avisos e Comunicados Oficiais"
          text="Acompanhe as orientações pedagógicas, alertas urgentes, datas de início de transmissões satelitais e informes emitidos pela Coordenadoria de Mídias Educacionais (SEDUC-RO)."
        />

        <div className="mx-auto max-w-7xl px-4 pt-8">
          <AvisosView announcements={announcements} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
