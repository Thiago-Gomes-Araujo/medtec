import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import GallerySection from '@/components/GallerySection';
import { getDatabase } from '@/lib/db';
import initialData from '@/data/initialData.json';
import { GalleryItem } from '@/types';

export default async function GaleriaPage() {
  const db = getDatabase();
  const gallery = (db.gallery && db.gallery.length > 0) 
    ? db.gallery 
    : (initialData.gallery as GalleryItem[]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF]">
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
