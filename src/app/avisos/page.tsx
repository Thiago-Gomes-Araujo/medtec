import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import AvisosView from '@/components/AvisosView';
import { medtecApi } from '@/lib/api';
import { AnnouncementItem, AnnouncementType } from '@/types';

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
  let announcements: AnnouncementItem[] = [];

  try {
    const res = await medtecApi.avisos.list({ 'q[ativo_true]': 1, page: 'all' });
    if (res.success && res.data?.items) {
      announcements = res.data.items.map((a) => ({
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
    console.warn('[AvisosPage] Erro ao carregar avisos da API oficial:', err);
  }

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
