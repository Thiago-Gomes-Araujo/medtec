import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import NewsEditorialSection from '@/components/NewsEditorialSection';
import { medtecApi, getMediaUrl } from '@/lib/api';
import { NewsItem } from '@/types';
import { AlertCircle } from 'lucide-react';

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

export const instant = false;

export default async function NoticiasPage() {
  let newsList: NewsItem[] = [];
  let errorMessage: string | null = null;

  try {
    const res = await medtecApi.noticias.listPublico({ page: 1, per_page: 50 });
    if (res.success && Array.isArray(res.data?.items)) {
      newsList = res.data.items.map((item) => ({
        id: item.slug,
        title: item.titulo,
        slug: item.slug,
        excerpt: item.resumo || '',
        content: item.conteudo,
        coverImage: getMediaUrl(item.imagem_capa),
        author: item.autor_nome || 'SEDUC-RO',
        category: item.categoria_nome || 'Geral',
        publishedAt: item.data_publicacao || '',
        featured: false,
        urgent: false,
        published: true,
        views: 0,
        tags: [],
      }));
    }
  } catch (err: unknown) {
    const error = err as { message?: string };
    errorMessage = error?.message || 'Falha ao conectar com o serviço oficial de notícias da API MEDTEC.';
    newsList = [];
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Cobertura & Jornalismo Oficial • SEDUC-RO"
          title="Notícias e Coberturas do MEDTEC"
          text="Acompanhe as ações pedagógicas síncronas, entregas de infraestrutura de satélite e conectividade nos 52 municípios de Rondônia e as histórias reais dos nossos estudantes e professores."
        />

        {errorMessage ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 my-10">
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold mb-1">Indisponibilidade do Serviço de Notícias</h3>
                <p className="text-sm opacity-90">{errorMessage}</p>
              </div>
            </div>
          </div>
        ) : (
          <NewsEditorialSection news={newsList} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
