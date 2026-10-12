import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getDatabase } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Calendar, User, ArrowLeft, Tag, Share2 } from 'lucide-react';
import NewsViewTracker from '@/components/NewsViewTracker';

interface Props {
  params: Promise<{ id: string }>;
}

export const instant = false;

export async function generateStaticParams() {
  const data = getDatabase();
  return data.news.map((n) => ({ id: n.id }));
}

export default async function NoticiaDetalhePage({ params }: Props) {
  const { id } = await params;
  const data = getDatabase();
  const newsItem = data.news.find((n) => n.id === id || n.slug === id);

  if (!newsItem || newsItem.published === false) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-slate-100 py-4 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-emerald-700">Início</Link>
          <ChevronRight size={14} />
          <Link href="/noticias" className="hover:text-emerald-700">Notícias</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-bold truncate max-w-xs">{newsItem.title}</span>
        </div>
      </div>

      <NewsViewTracker id={newsItem.id} />
      <main className="flex-1 py-10 bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Voltar */}
          <div>
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para todas as notícias</span>
            </Link>
          </div>

          {/* Categoria e Título */}
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
              {newsItem.category}
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              {newsItem.title}
            </h1>

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 py-3 border-y border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={14} className="text-emerald-600" />
                {newsItem.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <User size={14} className="text-emerald-600" />
                {newsItem.author}
              </span>
            </div>
          </div>

          {/* Imagem de Capa */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 h-72 sm:h-96 w-full bg-slate-900">
            <img
              src={newsItem.coverImage}
              alt={newsItem.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Resumo destacado */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 border-l-4 border-emerald-600 text-emerald-950 font-medium text-base sm:text-lg italic leading-relaxed">
            {newsItem.excerpt}
          </div>

          {/* Conteúdo completo */}
          <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-6">
            {newsItem.content}
          </div>

          {/* Tags */}
          {newsItem.tags && newsItem.tags.length > 0 && (
            <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <Tag size={15} className="text-slate-400" />
              {newsItem.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
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
