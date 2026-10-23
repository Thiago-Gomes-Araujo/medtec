import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getDatabase } from '@/lib/db';
import initialData from '@/data/initialData.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Calendar, User, ArrowLeft, Tag, Radio } from 'lucide-react';
import NewsViewTracker from '@/components/NewsViewTracker';
import { NewsItem } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export const instant = false;

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

export default async function NoticiaDetalhePage({ params }: Props) {
  const { id } = await params;
  const data = getDatabase();
  const allNews: NewsItem[] = (data.news && data.news.length > 0)
    ? data.news
    : (initialData.news as NewsItem[]);

  const newsItem = allNews.find((n) => n.id === id || n.slug === id);

  // Se não encontrar ou se a notícia estiver despublicada, retorna 404
  if (!newsItem || newsItem.published === false) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF]">
      <SiteHeader />

      {/* Breadcrumb Técnico */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#05549D] via-[#072F5E] to-[#0A3D73] dark:from-[#040D1A] dark:via-[#07162C] dark:to-[#040D1A] py-3.5 border-b border-sky-400/30 dark:border-[#1A365D] text-white">
        <div className="hero-grid absolute inset-0 opacity-30 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs font-mono text-sky-100 dark:text-slate-300">
          <Link href="/" className="hover:text-white hover:underline transition-colors">
            Início
          </Link>
          <ChevronRight size={14} className="text-cyan-300" />
          <Link href="/noticias" className="hover:text-white hover:underline transition-colors">
            Notícias
          </Link>
          <ChevronRight size={14} className="text-cyan-300" />
          <span className="text-cyan-200 font-semibold truncate max-w-sm">
            {newsItem.title}
          </span>
        </div>
      </div>

      <NewsViewTracker id={newsItem.id} />

      <main className="flex-1 py-12">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Voltar para todas as notícias */}
          <div>
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#05549D] dark:text-[#00D8FF] hover:underline group cursor-pointer active:scale-[0.97] transition-all duration-150 ease-out touch-manipulation select-none"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para todas as notícias</span>
            </Link>
          </div>

          {/* Categoria e Título */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-300 dark:border-cyan-400/30 bg-sky-50 dark:bg-[#0C1E38] text-[#05549D] dark:text-[#00D8FF] text-xs font-mono font-semibold uppercase tracking-wider">
                <Radio className="h-3 w-3 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                {newsItem.category || 'Geral'}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-[#6482A6] font-semibold">
                Cobertura Oficial • SEDUC-RO
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-[#E6F4FF] leading-tight tracking-tight text-balance">
              {newsItem.title}
            </h1>

            {/* Metadados Técnicos */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-[#6482A6] py-3 border-y border-dashed border-slate-200 dark:border-[#1A365D]">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <Calendar size={14} className="text-[#05549D] dark:text-[#00D8FF]" />
                {newsItem.publishedAt || 'Recente'}
              </span>
              <span className="text-slate-300 dark:text-[#1A365D]">•</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <User size={14} className="text-[#05549D] dark:text-[#00D8FF]" />
                {newsItem.author || 'Assessoria de Comunicação SEDUC-RO'}
              </span>
            </div>
          </div>

          {/* Imagem de Capa com moldura técnica */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-[#1A365D] h-72 sm:h-96 md:h-[440px] w-full bg-slate-900">
            <img
              src={newsItem.coverImage || FALLBACK_COVER}
              alt={newsItem.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Resumo destacado (Lead) */}
          {newsItem.excerpt && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C1E38] border-l-4 border-[#05549D] dark:border-[#00D8FF] border-y border-r border-slate-200/90 dark:border-[#1A365D] text-slate-800 dark:text-[#E6F4FF] font-sans text-sm sm:text-base leading-relaxed shadow-xs text-pretty">
              &ldquo;{newsItem.excerpt}&rdquo;
            </div>
          )}

          {/* Conteúdo completo */}
          <div className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-6 font-normal">
            {newsItem.content || newsItem.excerpt || 'Conteúdo em elaboração pela equipe pedagógica da SEDUC.'}
          </div>

          {/* Tags temáticas */}
          {newsItem.tags && newsItem.tags.length > 0 && (
            <div className="pt-8 border-t border-dashed border-slate-200 dark:border-[#1A365D] flex flex-wrap items-center gap-2">
              <Tag size={15} className="text-[#05549D] dark:text-[#00D8FF]" />
              {newsItem.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs font-mono font-semibold rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
