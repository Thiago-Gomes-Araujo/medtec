import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import SocialSection from '@/components/SocialSection';
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
  const defaultSocials: SocialLinks = {
    instagram: 'https://www.instagram.com/governoro/',
    youtube: 'https://www.youtube.com/@SeducRondonia',
    facebook: 'https://www.facebook.com/governoderondonia',
    whatsapp: '',
    email: 'mediacaotecnologica@seduc.ro.gov.br',
    phone: '(69) 3216-5300',
    address: 'Palácio Rio Madeira, Porto Velho - RO',
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1528] text-slate-800 dark:text-slate-100 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Transmissões & Comunidade"
          title="Acompanhe o MEDTEC nas Redes Sociais"
          text="Conecte-se com a transmissão ao vivo das aulas nos estúdios da SEDUC, acompanhe bastidores no Instagram e tenha suporte pedagógico e técnico direto com nossa equipe via WhatsApp."
        />

        <div className="mx-auto max-w-7xl px-4 pt-4">
          <SocialSection socials={defaultSocials} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
