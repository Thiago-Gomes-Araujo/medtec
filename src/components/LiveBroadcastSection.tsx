'use client';

import React from 'react';
import Link from 'next/link';
import { SocialLinks, NewsItem } from '@/types';
import { useSiteChannels } from '@/components/SiteChannelsProvider';
import type { AvisoPublico } from '@/lib/api/types';
import { 
  Satellite, 
  Clock, 
  ExternalLink,
  Phone,
  CheckCircle2,
  Bell,
  Newspaper,
  ArrowRight,
  AlertCircle,
  Calendar,
  Sparkles,
  Video
} from 'lucide-react';
import { 
  YoutubeIcon, 
  WhatsAppIcon 
} from '@/components/SocialIcons';

interface LiveBroadcastSectionProps {
  socials?: SocialLinks;
  announcements?: AvisoPublico[];
  announcementsLoading?: boolean;
  announcementsError?: string | null;
  news?: NewsItem[];
}

const EMPTY_ANNOUNCEMENTS: AvisoPublico[] = [];
const EMPTY_NEWS: NewsItem[] = [];

export default function LiveBroadcastSection({ 
  socials: propSocials,
  announcements: propAnnouncements = EMPTY_ANNOUNCEMENTS,
  news: propNews = EMPTY_NEWS,
  announcementsLoading = false,
  announcementsError = null,
}: LiveBroadcastSectionProps) {
  // Derivação de dados: utiliza diretamente as props passadas
  const channels = useSiteChannels();
  const socials = propSocials ?? channels;
  const effectiveAnnouncements = propAnnouncements.length > 0 
    ? propAnnouncements 
    : EMPTY_ANNOUNCEMENTS;
  const effectiveNews = propNews.length > 0 
    ? propNews 
    : EMPTY_NEWS;

  const schedules = [
    {
      shift: 'Turno Matutino',
      hours: '07h30 às 11h45',
      desc: 'Formação Geral Básica (BNCC), Linguagens, Matemática, Ciências da Natureza e Humanas.',
      status: 'Sinal Regular'
    },
    {
      shift: 'Turno Vespertino',
      hours: '13h30 às 17h45',
      desc: 'Itinerários Formativos, Projeto de Vida e Componente NBAZ (Agroecologia e Zootecnia).',
      status: 'Sinal Regular'
    },
    {
      shift: 'Plantão Pedagógico',
      hours: 'Em tempo real',
      desc: 'Canal síncrono de retorno e interação contínua entre ministrantes e mediadores locais.',
      status: 'Ao Vivo'
    },
  ];

  // Dados com tratamento defensivo e resiliência vindos da API
  const urgentAnnouncement: AvisoPublico | undefined =
    effectiveAnnouncements.find((a) => a.tipo_slug === 'urgente') || effectiveAnnouncements[0];

  const recentNews: NewsItem[] = effectiveNews.slice(0, 2);

  const youtubeUrl = socials.youtube?.trim() || '';
  const whatsappUrl = socials.whatsapp?.trim() || '';

  return (
    <section 
      id="ao-vivo" 
      aria-labelledby="live-section-heading"
      className="relative scroll-mt-20 bg-slate-50/60 dark:bg-[#061224] text-slate-800 dark:text-slate-100 py-20 sm:py-28 overflow-hidden transition-colors duration-200"
    >
      {/* Âncoras para links de navegação profunda */}
      <div id="transmissoes" className="absolute -top-20" aria-hidden="true" />
      <div id="transmissao" className="absolute -top-20" aria-hidden="true" />
      <div id="redes" className="absolute -top-20" aria-hidden="true" />

      {/* Luz Radial Ambiência Discreta */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[130px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[130px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* ================= 1. CABEÇALHO DA SEÇÃO ================= */}
        <header className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-sm font-semibold text-[#004A99] dark:text-sky-400">
            Aulas &amp; Comunicação Oficial • SEDUC Rondônia
          </p>

          <h2 
            id="live-section-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white font-display text-balance leading-tight"
          >
            Vídeo-Aulas e <span className="text-[#004A99] dark:text-[#00D8FF]">Comunicação Oficial</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed text-pretty max-w-2xl mx-auto">
            Acompanhe o acervo de aulas e conteúdos pedagógicos nos 52 municípios de Rondônia, consulte a grade e acesse os canais oficiais da SEDUC.
          </p>
        </header>

        {/* ================= 2. GRID PRINCIPAL DE 2 COLUNAS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* COLUNA ESQUERDA (7 cols): ESTÚDIO CENTRAL & GRADE HORÁRIA */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0B1B30] p-6 sm:p-8 shadow-sm dark:shadow-lg transition-colors">
            
            <div className="space-y-6">
              
              {/* Barra de Status do Estúdio */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#004A99] dark:bg-sky-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-2xs">
                    <Video className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Aulas Gravadas • Estúdio PVH
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 dark:border-cyan-500/30 bg-sky-50 dark:bg-cyan-950/40 px-2.5 py-1 text-xs text-[#004A99] dark:text-cyan-200 font-semibold">
                    <Satellite className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Satelital &amp; IP
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Sinal Satelital Ativo</span>
                </div>
              </div>

              {/* Informações Centrais do Estúdio */}
              <div className="space-y-3">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-balance leading-snug">
                  Estúdio Central de Gravação &amp; Produção SEDUC
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
                  Aulas gravadas e conteúdos pedagógicos produzidos diretamente da capital para 129 unidades escolares em aldeias, assentamentos agrícolas e comunidades ribeirinhas.
                </p>

                {/* Ações de Transmissão */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Assistir transmissão ao vivo no canal da SEDUC no YouTube (abre em nova aba)"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 active:scale-[0.97] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 ease-out touch-manipulation select-none cursor-pointer"
                  >
                    <YoutubeIcon size={16} className="text-white shrink-0" />
                    <span>Assistir no YouTube</span>
                    <ExternalLink className="h-3 w-3 opacity-80 shrink-0" aria-hidden="true" />
                  </a>
                  )}

                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Contatar suporte técnico das salas conectadas via WhatsApp (abre em nova aba)"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-lg border border-emerald-500/40 bg-emerald-50/90 dark:bg-emerald-500/10 hover:bg-emerald-100/90 dark:hover:bg-emerald-500/20 active:scale-[0.97] px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs transition-all duration-150 ease-out touch-manipulation select-none cursor-pointer"
                    >
                      <WhatsAppIcon size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Suporte Técnico da Sala</span>
                      <ExternalLink className="h-3 w-3 opacity-75 shrink-0" aria-hidden="true" />
                    </a>
                  ) : socials.phone && (
                    <span
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <Phone size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Suporte SEDUC: {socials.phone}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Grade Diária de Transmissão */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF] shrink-0" aria-hidden="true" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Grade Diária de Aulas
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    Segunda a Sexta
                  </span>
                </div>

                {/* Grade em Linha Contínua */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-white/10 rounded-xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                  {schedules.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-4 flex flex-col justify-between space-y-2.5 min-w-0"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <span 
                            title={item.shift}
                            className="font-bold text-xs text-slate-900 dark:text-white truncate"
                          >
                            {item.shift}
                          </span>
                          <span 
                            className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" 
                            title={item.status} 
                            aria-hidden="true" 
                          />
                        </div>
                        <p 
                          title={item.hours}
                          className="tabular-nums text-xs font-bold text-[#004A99] dark:text-cyan-300 truncate"
                        >
                          {item.hours}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 [overflow-wrap:anywhere] break-words">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Metadados Institucionais do Hub */}
            <footer className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/10">
              <span className="truncate">Estúdios de TV SEDUC • Porto Velho/RO</span>
              <span className="text-[#004A99] dark:text-[#00D8FF] font-semibold shrink-0">
                Hub Emissor Porto Velho
              </span>
            </footer>

          </div>

          {/* COLUNA DIREITA (5 cols): MURAL DE AVISOS & NOTÍCIAS */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0B1B30] p-6 sm:p-8 shadow-sm dark:shadow-lg transition-colors">
            
            <div className="space-y-5">
              
              {/* Header da Coluna */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF] shrink-0" aria-hidden="true" />
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                    Mural &amp; Publicações Recentes
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-cyan-950/60 text-[#004A99] dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/30 shrink-0">
                  Feed Oficial
                </span>
              </div>

              {/* 1. Aviso Urgente do Mural */}
              {announcementsLoading ? (
                <p role="status" className="py-4 text-sm text-slate-500">Carregando avisos...</p>
              ) : announcementsError ? (
                <div role="alert" className="py-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>{announcementsError}</p>
                  <button type="button" onClick={() => window.location.reload()} className="font-semibold underline cursor-pointer">
                    Tentar novamente
                  </button>
                </div>
              ) : urgentAnnouncement ? (
                <article className="border-l-4 border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 rounded-r-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider shrink-0">
                      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                      Aviso Mural
                    </span>
                    <time className="text-[11px] tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                      {Number.isNaN(new Date(urgentAnnouncement.created_at).getTime()) ? 'Data não informada'
                        : new Date(urgentAnnouncement.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Porto_Velho' })}
                    </time>
                  </div>
                  
                  <h4 
                    title={urgentAnnouncement.titulo}
                    className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 [overflow-wrap:anywhere] break-words"
                  >
                    {urgentAnnouncement.titulo}
                  </h4>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 [overflow-wrap:anywhere] break-words">
                    {urgentAnnouncement.conteudo}
                  </p>
                </article>
              ) : (
                /* Estado Vazio Seguro para Avisos */
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/15 bg-slate-50/50 dark:bg-white/5 flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Nenhum comunicado no momento
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Consulte o mural para acompanhar novas publicações.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Feed de Notícias Recentes */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 pb-1">
                  <Newspaper className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    Últimas Reportagens
                  </span>
                </div>

                {recentNews.length > 0 ? (
                  <ul className="divide-y divide-slate-100 dark:divide-white/10 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 overflow-hidden">
                    {recentNews.map((news) => (
                      <li key={news.id}>
                        <Link
                          href={`/noticias`}
                          className="group block p-3.5 hover:bg-white dark:hover:bg-white/10 active:bg-slate-100/80 dark:active:bg-white/15 active:scale-[0.99] transition-[transform,background-color] duration-150 ease-out touch-manipulation focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] focus-visible:ring-inset"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5 min-w-0">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#004A99] dark:text-cyan-300 min-w-0 max-w-[65%] truncate">
                              <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span className="truncate">{news.category || 'Geral'}</span>
                            </span>
                            <span className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                              <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span>{news.publishedAt || 'Recente'}</span>
                            </span>
                          </div>

                          <h5 
                            title={news.title}
                            className="font-semibold text-xs sm:text-[13px] text-slate-900 dark:text-white group-hover:text-[#004A99] dark:group-hover:text-cyan-300 transition-colors duration-150 ease-out leading-snug line-clamp-2 [overflow-wrap:anywhere] break-words"
                          >
                            {news.title}
                          </h5>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  /* Estado Vazio Seguro para Notícias */
                  <div className="py-6 text-center space-y-2 rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-4">
                    <Newspaper className="h-5 w-5 text-slate-400 mx-auto" aria-hidden="true" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Nenhuma matéria recente disponível no feed.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Rodapé com Links Rápidos de Navegação */}
            <footer className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
              <Link
                href="/avisos"
                className="text-slate-600 dark:text-slate-300 hover:text-[#004A99] dark:hover:text-[#00D8FF] active:scale-[0.98] flex items-center gap-1.5 transition-all duration-150 ease-out touch-manipulation focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] rounded-md px-1 py-0.5"
              >
                <span>Mural Completo</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </Link>

              <Link
                href="/noticias"
                className="text-[#004A99] dark:text-[#00D8FF] hover:underline active:scale-[0.98] flex items-center gap-1.5 transition-all duration-150 ease-out touch-manipulation focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] rounded-md px-1 py-0.5"
              >
                <span>Portal de Notícias</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </Link>
            </footer>

          </div>

        </div>
      </div>
    </section>
  );
}


