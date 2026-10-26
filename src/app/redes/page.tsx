import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import SocialSection from '@/components/SocialSection';
import { getDatabase } from '@/lib/db';
import { SocialLinks } from '@/types';

export const metadata: Metadata = {
  title: 'Canais Oficiais e Redes | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Canais oficiais de transmissão das aulas ao vivo, YouTube, WhatsApp de suporte técnico pedagógico e redes sociais do MEDTEC Rondônia.',
  openGraph: {
    title: 'Canais Oficiais e Redes | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Transmissões ao vivo, canais e redes sociais oficiais do Ensino Médio com Mediação Tecnológica em Rondônia.',
  },
};

export default async function RedesPage() {
  const db = getDatabase();
  const socials: SocialLinks = db.socials;

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Transmissões & Comunidade"
          title="Acompanhe o MEDTEC nas Redes Sociais"
          text="Conecte-se com a transmissão ao vivo das aulas nos estúdios da SEDUC, acompanhe bastidores no Instagram e tenha suporte pedagógico e técnico direto com nossa equipe via WhatsApp."
        />

        <div className="mx-auto max-w-7xl px-4 pt-4">
          <SocialSection socials={socials} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
