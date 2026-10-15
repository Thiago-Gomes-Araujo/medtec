import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import NewsGrid from '@/components/NewsGrid';
import { getDatabase } from '@/lib/db';

export default async function NoticiasPage() {
  const data = getDatabase();
  const publishedNews = (data.news || []).filter((item) => item.published !== false);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Comunicação"
          title="Notícias e Comunicados"
          text="Acompanhe as atualizações das ações pedagógicas, melhorias de infraestrutura de transmissão via satélite e eventos das escolas MEDTEC de Rondônia."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          <NewsGrid news={publishedNews} filter={true} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
