import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import GallerySection from '@/components/GallerySection';

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
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Registros Visuais da Mediação"
          title="Galeria de Fotos & Acervo"
          text="Registros das salas de aula conectadas no interior de Rondônia, dos estúdios televisivos da SEDUC em Porto Velho e dos momentos de aprendizagem prática dos nossos alunos e professores mediadores."
        />

        <GallerySection gallery={[]} unavailable />
      </main>

      <SiteFooter />
    </div>
  );
}
