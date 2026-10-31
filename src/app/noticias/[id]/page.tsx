import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { ApiError, medtecApi, getMediaUrl, type NoticiaPublica } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Calendar, User, ArrowLeft, Radio, AlertCircle } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export const instant = false;

type FetchNewsDetailResult =
  | { status: 'ok'; item: NoticiaPublica }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

async function fetchNewsDetail(idOrSlug: string): Promise<FetchNewsDetailResult> {
  const clean = (idOrSlug || '').trim();
  if (!clean) return { status: 'not_found' };

  try {
    const res = await medtecApi.noticias.getPublicoBySlug(clean);
    if (!res?.data) return { status: 'not_found' };
    return { status: 'ok', item: res.data };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { status: 'not_found' };
    }
    const message =
      err instanceof ApiError && err.status === 0
        ? 'Não foi possível conectar ao serviço oficial de notícias. Verifique sua conexão e tente novamente.'
        : 'Não foi possível carregar os detalhes desta notícia no momento. Tente novamente em instantes.';
    return { status: 'error', message };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchNewsDetail(id);

  if (result.status !== 'ok') {
    return {
      title: 'Notícia | MEDTEC Rondônia',
    };
  }

  const newsItem = result.item;
  const coverImage = getMediaUrl(newsItem.imagem_capa);

  return {
    title: `${newsItem.titulo} | MEDTEC Rondônia - SEDUC-RO`,
    description: newsItem.resumo || 'Notícia oficial do Ensino Médio com Mediação Tecnológica da SEDUC-RO.',
    openGraph: {
      title: newsItem.titulo,
      description: newsItem.resumo || undefined,
      images: coverImage ? [coverImage] : [],
      type: 'article',
    },
  };
}

export default async function NoticiaDetalhePage({ params }: Props) {
  const { id } = await params;
  const result = await fetchNewsDetail(id);

  if (result.status === 'not_found') {
    notFound();
  }

  if (result.status === 'error') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
        <SiteHeader />

        <main className="flex-1 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <div>
              <Link
                href="/noticias"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#05549D] dark:text-[#00D8FF] hover:underline group"
              >
                <ArrowLeft size={16} />
                <span>Voltar para todas as notícias</span>
              </Link>
            </div>

            <div
              role="alert"
              className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-4"
            >
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h1 className="text-base font-bold mb-1">Indisponibilidade do Serviço de Notícias</h1>
                <p className="text-sm opacity-90">{result.message}</p>
              </div>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
  }

  const newsItem = result.item;
  const coverImage = getMediaUrl(newsItem.imagem_capa);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      {/* Breadcrumb Técnico */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#05549D] via-[#072F5E] to-[#0A3D73] dark:from-[#040D1A] dark:via-[#07162C] dark:to-[#040D1A] py-3.5 border-b border-sky-400/30 dark:border-[#1A365D] text-white">
        <div className="hero-grid absolute inset-0 opacity-30 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs font-medium text-sky-100 dark:text-slate-300">
          <Link href="/" className="hover:text-white hover:underline transition-colors">
            Início
          </Link>
          <ChevronRight size={14} className="text-cyan-300" />
          <Link href="/noticias" className="hover:text-white hover:underline transition-colors">
            Notícias
          </Link>
          <ChevronRight size={14} className="text-cyan-300" />
          <span className="text-cyan-200 font-semibold truncate max-w-sm">
            {newsItem.titulo}
          </span>
        </div>
      </div>

      <main className="flex-1 py-12">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Voltar para todas as notícias */}
          <div>
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#05549D] dark:text-[#00D8FF] hover:underline group cursor-pointer active:scale-[0.97] transition-all duration-150 ease-out touch-manipulation select-none"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para todas as notícias</span>
            </Link>
          </div>

          {/* Categoria e Título */}
          <div className="space-y-4">
            {newsItem.categoria_nome && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-sky-300 dark:border-cyan-400/30 bg-sky-50 dark:bg-[#0C1E38] text-[#05549D] dark:text-[#00D8FF] text-xs font-semibold uppercase tracking-wider">
                  <Radio className="h-3 w-3 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                  {newsItem.categoria_nome}
                </span>
              </div>
            )}

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-[#E6F4FF] leading-tight tracking-tight text-balance">
              {newsItem.titulo}
            </h1>

            {/* Metadados Oficiais */}
            {(newsItem.data_publicacao || newsItem.autor_nome) && (
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-[#6482A6] py-3 border-y border-dashed border-slate-200 dark:border-[#1A365D]">
                {newsItem.data_publicacao && (
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Calendar size={14} className="text-[#05549D] dark:text-[#00D8FF]" />
                    {newsItem.data_publicacao}
                  </span>
                )}
                {newsItem.data_publicacao && newsItem.autor_nome && (
                  <span className="text-slate-300 dark:text-[#1A365D]">•</span>
                )}
                {newsItem.autor_nome && (
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <User size={14} className="text-[#05549D] dark:text-[#00D8FF]" />
                    {newsItem.autor_nome}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Imagem de Capa Oficial (omitida se ausente) */}
          {coverImage && (
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-[#1A365D] h-72 sm:h-96 md:h-[440px] w-full bg-slate-900">
              <img
                src={coverImage}
                alt={newsItem.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Resumo destacado (Lead) */}
          {newsItem.resumo && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C1E38] border-l-4 border-[#05549D] dark:border-[#00D8FF] border-y border-r border-slate-200/90 dark:border-[#1A365D] text-slate-800 dark:text-[#E6F4FF] font-sans text-sm sm:text-base leading-relaxed shadow-xs text-pretty">
              &ldquo;{newsItem.resumo}&rdquo;
            </div>
          )}

          {/* Conteúdo completo */}
          {newsItem.conteudo && (
            <div className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-6 font-normal">
              {newsItem.conteudo}
            </div>
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
