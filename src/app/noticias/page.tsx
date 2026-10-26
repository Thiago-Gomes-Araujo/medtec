import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import NewsEditorialSection from '@/components/NewsEditorialSection';
import { getDatabase } from '@/lib/db';
import { NewsItem } from '@/types';

export const metadata: Metadata = {
  title: 'Notícias e Coberturas | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Acompanhe as reportagens oficiais, entregas de infraestrutura satelital e ações pedagógicas do Ensino Médio com Mediação Tecnológica nos 52 municípios de Rondônia.',
  openGraph: {
    title: 'Notícias e Coberturas | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Acompanhe as reportagens oficiais, entregas de infraestrutura satelital e ações pedagógicas do MEDTEC Rondônia.',
  },
};

export default async function NoticiasPage() {
  const data = getDatabase();
  const newsList: NewsItem[] = data.news || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Cobertura & Jornalismo Oficial • SEDUC-RO"
          title="Notícias e Coberturas do MEDTEC"
          text="Acompanhe as ações pedagógicas síncronas, entregas de infraestrutura de satélite e conectividade nos 52 municípios de Rondônia e as histórias reais dos nossos estudantes e professores."
        />

        <NewsEditorialSection news={newsList} />
      </main>

      <SiteFooter />
    </div>
  );
}
