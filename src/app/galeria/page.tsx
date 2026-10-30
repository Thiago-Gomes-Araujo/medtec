import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import GallerySection from '@/components/GallerySection';
import { medtecApi, getMediaUrl } from '@/lib/api';
import { GalleryItem } from '@/types';

export const metadata: Metadata = {
  title: 'Galeria de Fotos e Acervo | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Registros visuais das salas de aula conectadas no interior de Rondônia, estúdios de transmissão em Porto Velho e práticas pedagógicas nas comunidades.',
  openGraph: {
    title: 'Galeria de Fotos e Acervo | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Registros visuais das salas de aula conectadas e dos estúdios do MEDTEC Rondônia.',
  },
};

export default async function GaleriaPage() {
  let gallery: GalleryItem[] = [];

  try {
    const res = await medtecApi.fotosGaleria.list({ page: 'all' });
    if (res.success && res.data?.items) {
      gallery = res.data.items.map((f) => ({
        id: String(f.id),
        title: f.titulo,
        description: f.descricao || '',
        imageUrl: getMediaUrl(f.imagem || f.imagem_url),
        category: f.categoria_galeria?.nome || 'Geral',
        date: f.created_at ? new Date(f.created_at).toLocaleDateString('pt-BR') : '',
        categoria_galeria_id: f.categoria_galeria_id,
        imagem: f.imagem,
        imagem_url: f.imagem_url,
        categoria_galeria: f.categoria_galeria,
      }));
    }
  } catch (err) {
    console.warn('[GaleriaPage] Erro ao carregar fotos da API oficial:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Registros Visuais da Mediação"
          title="Galeria de Fotos & Acervo"
          text="Registros das salas de aula conectadas no interior de Rondônia, dos estúdios televisivos da SEDUC em Porto Velho e dos momentos de aprendizagem prática dos nossos alunos e professores mediadores."
        />

        <GallerySection gallery={gallery} />
      </main>

      <SiteFooter />
    </div>
  );
}
