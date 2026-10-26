import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import LiveBroadcastSection from '@/components/LiveBroadcastSection';
import { getDatabase } from '@/lib/db';
import initialData from '@/data/initialData.json';
import { SocialLinks } from '@/types';

export const metadata: Metadata = {
  title: 'Transmissões Ao Vivo | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Aulas ao vivo transmitidas dos estúdios centrais de TV da SEDUC em Porto Velho para salas conectadas via satélite nos 52 municípios de Rondônia.',
  openGraph: {
    title: 'Transmissões Ao Vivo | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Acompanhe as aulas síncronas ao vivo e a grade diária de transmissões do MEDTEC Rondônia.',
  },
};

export default async function AoVivoPage() {
  const db = getDatabase();
  const socials = db.socials || (initialData.socials as SocialLinks);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040D1A] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Transmissões & Mídias Digitais"
          title="Transmissões Ao Vivo & Redes Oficiais"
          text="Aulas ao vivo transmitidas dos estúdios centrais de TV da SEDUC em Porto Velho para centenas de salas conectadas em todo o estado de Rondônia, acompanhadas diariamente por professores mediadores presenciais."
        />

        <LiveBroadcastSection socials={socials} />
      </main>

      <SiteFooter />
    </div>
  );
}
