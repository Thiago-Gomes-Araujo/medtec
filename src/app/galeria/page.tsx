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
  const gallery = (db.gallery && db.gallery.length > 0) ? db.gallery : (initialData.gallery as GalleryItem[]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Acervo & Memória"
          title="Galeria Fotográfica do MEDTEC"
          text="Registros das salas de aula no interior de Rondônia, dos estúdios televisivos da SEDUC em Porto Velho e dos momentos de aprendizagem prática dos nossos alunos e professores mediadores."
        />

        <div className="mx-auto max-w-7xl px-4 pt-4">
          <GallerySection gallery={gallery} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
