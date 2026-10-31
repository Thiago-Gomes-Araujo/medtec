import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import LiveBroadcastSection from '@/components/LiveBroadcastSection';
import { ApiError, medtecApi, type AvisoPublico } from '@/lib/api';
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

async function PublicAoVivoContent() {
  const socials: SocialLinks = {
    instagram: 'https://www.instagram.com/governoro/',
    youtube: 'https://www.youtube.com/@SeducRondonia',
    facebook: 'https://www.facebook.com/governoderondonia',
    whatsapp: '',
    email: 'mediacaotecnologica@seduc.ro.gov.br',
    phone: '(69) 3216-5300',
    address: 'Palácio Rio Madeira, Porto Velho - RO',
  };
  let announcements: AvisoPublico[] = [];
  let announcementsError: string | null = null;
  try {
    const urgent = await medtecApi.avisos.listPublico({ tipo: 'urgente', page: 1, per_page: 1 });
    // O destaque continua preferindo um urgente; sem urgente, usa o mais recente.
    const response = urgent.data.items.length ? urgent
      : await medtecApi.avisos.listPublico({ page: 1, per_page: 1 });
    announcements = response.data.items;
  } catch (error) {
    const message = ApiError.getFriendlyMessage(error);
    const status = error instanceof ApiError && error.status > 0 ? ' (HTTP ' + error.status + ')' : '';
    announcementsError = message + status;
  }
  return <LiveBroadcastSection socials={socials} announcements={announcements}
    announcementsError={announcementsError} news={[]} />;
}

export default function AoVivoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040D1A] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Vídeo-Aulas &amp; Mídias Digitais"
          title="Vídeo-Aulas &amp; Canais Oficiais"
          text="Aulas gravadas e conteúdos pedagógicos produzidos pela SEDUC em Porto Velho para centenas de salas conectadas em todo o estado de Rondônia, acompanhadas diariamente por professores mediadores presenciais."
        />

        <Suspense fallback={<LiveBroadcastSection announcementsLoading news={[]} />}>
          <PublicAoVivoContent />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
