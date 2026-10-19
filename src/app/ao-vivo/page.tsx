import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import LiveBroadcastSection from '@/components/LiveBroadcastSection';
import { getDatabase } from '@/lib/db';
import initialData from '@/data/initialData.json';
import { SocialLinks } from '@/types';

export default async function AoVivoPage() {
  const db = getDatabase();
  const socials = db.socials || (initialData.socials as SocialLinks);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040D1A] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200">
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
