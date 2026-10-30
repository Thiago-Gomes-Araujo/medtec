import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import LiveBroadcastSection from '@/components/LiveBroadcastSection';
import { medtecApi } from '@/lib/api';
import { SocialLinks, AnnouncementItem, AnnouncementType } from '@/types';

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
  const socials: SocialLinks = {
    instagram: '',
    youtube: '',
    facebook: '',
    whatsapp: '',
    email: '',
    phone: '',
    address: '',
  };

  let announcements: AnnouncementItem[] = [];

  try {
    const [canaisRes, avisosRes] = await Promise.all([
      medtecApi.canaisContato.list({ 'q[ativo_true]': 1, page: 'all' }).catch(() => null),
      medtecApi.avisos.list({ 'q[ativo_true]': 1, page: 'all' }).catch(() => null),
    ]);

    if (canaisRes?.success && Array.isArray(canaisRes.data?.items)) {
      for (const item of canaisRes.data.items) {
        if (!item.valor || item.ativo === false) continue;
        const rede = item.rede.toLowerCase();
        if (rede === 'youtube') socials.youtube = item.valor;
        else if (rede === 'instagram') socials.instagram = item.valor;
        else if (rede === 'facebook') socials.facebook = item.valor;
        else if (rede === 'whatsapp') socials.whatsapp = item.valor;
      }
    }

    if (avisosRes?.success && Array.isArray(avisosRes.data?.items)) {
      announcements = avisosRes.data.items.map((a) => ({
        id: String(a.id),
        title: a.titulo,
        content: a.conteudo,
        type: (a.a_tipo_aviso?.slug || 'informativo') as AnnouncementType,
        date: a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : '',
        linkText: a.link_texto || undefined,
        linkUrl: a.link_url || undefined,
        active: a.ativo !== false,
        typeColor: a.a_tipo_aviso?.cor,
        typeName: a.a_tipo_aviso?.nome,
        a_tipo_aviso_id: a.a_tipo_aviso_id,
        a_tipo_aviso: a.a_tipo_aviso,
      }));
    }
  } catch (err) {
    console.warn('[AoVivoPage] Erro ao carregar dados da API:', err);
  }

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
          announcements={announcements}
          news={[]}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
