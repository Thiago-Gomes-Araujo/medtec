import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import AvisosView from '@/components/AvisosView';
import { getDatabase } from '@/lib/db';
import initialData from '@/data/initialData.json';
import { AnnouncementItem } from '@/types';

export default async function AvisosPage() {
  const db = getDatabase();
  const announcements = (db.announcements && db.announcements.length > 0)
    ? db.announcements
    : (initialData.announcements as AnnouncementItem[]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
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
