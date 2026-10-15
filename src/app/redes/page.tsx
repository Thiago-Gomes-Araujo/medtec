import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import SocialSection from '@/components/SocialSection';
import { getDatabase } from '@/lib/db';
import initialData from '@/data/initialData.json';
import { SocialLinks } from '@/types';

export default async function RedesPage() {
  const db = getDatabase();
  const socials = db.socials || (initialData.socials as SocialLinks);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
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
