import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import LiveBroadcastSection from '@/components/LiveBroadcastSection';
import { getDatabase } from '@/lib/db';
import { SocialLinks } from '@/types';

export const metadata: Metadata = {
  title: 'Vídeo-Aulas & Conteúdos | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Acervo de vídeo-aulas gravadas e conteúdos pedagógicos produzidos pela SEDUC em Porto Velho para os 52 municípios de Rondônia.',
  openGraph: {
    title: 'Vídeo-Aulas & Conteúdos | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Acesse as vídeo-aulas gravadas e a programação pedagógica do MEDTEC Rondônia.',
  },
};

export default async function AoVivoPage() {
  const db = getDatabase();
  const socials: SocialLinks = db.socials;

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040D1A] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Vídeo-Aulas &amp; Mídias Digitais"
          title="Vídeo-Aulas &amp; Canais Oficiais"
          text="Aulas gravadas e conteúdos pedagógicos produzidos pela SEDUC em Porto Velho para centenas de salas conectadas em todo o estado de Rondônia, acompanhadas diariamente por professores mediadores presenciais."
        />

        <LiveBroadcastSection
          socials={socials}
          announcements={db.announcements || []}
          news={db.news || []}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
