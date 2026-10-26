'use client';

import React from 'react';
import Link from 'next/link';
import { SocialLinks, AnnouncementItem, NewsItem } from '@/types';
import { 
  Radio, 
  Satellite, 
  Clock, 
  ExternalLink,
  Globe,
  CheckCircle2,
  Bell,
  Newspaper,
  ArrowRight,
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  InstagramIcon, 
  YoutubeIcon, 
  FacebookIcon, 
  WhatsAppIcon 
} from '@/components/SocialIcons';

interface LiveBroadcastSectionProps {
  socials?: SocialLinks;
  announcements?: AnnouncementItem[];
  news?: NewsItem[];
}

export default function LiveBroadcastSection({ 
  socials: propSocials,
  announcements: propAnnouncements = [],
  news: propNews = [],
}: LiveBroadcastSectionProps) {
  const [dynamicData, setDynamicData] = React.useState<{
    socials?: SocialLinks;
    announcements: AnnouncementItem[];
    news: NewsItem[];
  }>({
    socials: propSocials,
    announcements: propAnnouncements,
    news: propNews,
  });

  React.useEffect(() => {
    if (!propSocials || propAnnouncements.length === 0 || propNews.length === 0) {
      fetch('/api/data')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setDynamicData({
              socials: propSocials || data.socials,
              announcements: propAnnouncements.length > 0 ? propAnnouncements : data.announcements || [],
              news: propNews.length > 0 ? propNews : data.news || [],
            });
          }
        })
        .catch(() => {});
    }
  }, [propSocials, propAnnouncements, propNews]);

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
  const urgentAnnouncement: AnnouncementItem | undefined = 
    dynamicData.announcements.find((a) => a.active && a.type === 'urgente') || dynamicData.announcements[0];

  const recentNews: NewsItem[] = dynamicData.news.slice(0, 2);

  const socials = dynamicData.socials;

  const youtubeUrl = socials?.youtube?.trim() || 'https://www.youtube.com/@SeducRondonia';
  const whatsappUrl = socials?.whatsapp?.trim() || 'https://wa.me/5569999999999';
  const instagramUrl = socials?.instagram?.trim() || 'https://www.instagram.com/governoro/';
  const facebookUrl = socials?.facebook?.trim() || 'https://www.facebook.com/governoderondonia';

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

      {/* Grid de Fundo Técnico */}
      <div className="hero-grid absolute inset-0 opacity-15 dark:opacity-35 pointer-events-none" aria-hidden="true" />

      {/* Luz Radial Ambiência Discreta */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[130px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[130px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* ================= 1. CABEÇALHO DA SEÇÃO (TYPESET & DISTILL) ================= */}
        <header className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-cyan-950/60 border border-slate-200 dark:border-cyan-500/30 text-[#004A99] dark:text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wide shadow-2xs">
            <Radio className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 animate-pulse shrink-0" aria-hidden="true" />
            <span>Sinal Síncrono &amp; Comunicação • SEDUC Rondônia</span>
          </div>

          <h2 
            id="live-section-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display text-balance leading-tight"
          >
            Pulso do MEDTEC em <span className="text-[#004A99] dark:text-[#00D8FF]">Tempo Real</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed text-pretty max-w-2xl mx-auto">
            Acompanhe o sinal das aulas nos 52 municípios de Rondônia, consulte os turnos de transmissão e acesse comunicados do programa.
          </p>
        </header>

        {/* ================= 2. GRID PRINCIPAL DE 2 COLUNAS (LAYOUT & DISTILL) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* COLUNA ESQUERDA (7 cols): ESTÚDIO CENTRAL & GRADE HORÁRIA */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0B1B30] p-6 sm:p-8 shadow-sm dark:shadow-lg transition-colors">
            
            <div className="space-y-6">
              
              {/* Barra de Status do Estúdio */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-2xs">
                    <Radio className="h-3 w-3 animate-pulse shrink-0" aria-hidden="true" />
                    Sinal no Ar • PVH
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 dark:border-cyan-500/30 bg-sky-50 dark:bg-cyan-950/40 px-2.5 py-1 font-mono text-[11px] text-[#004A99] dark:text-cyan-200 font-semibold">
                    <Satellite className="h-3 w-3 shrink-0" aria-hidden="true" />
                    Banda Ku &amp; IP
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Transmissão Satelital Ativa</span>
                </div>
              </div>

              {/* Informações Centrais do Estúdio */}
              <div className="space-y-3">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-balance leading-snug">
                  Estúdio Central de Gravação &amp; Transmissão SEDUC
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
                  Aulas ao vivo simultâneas geradas diretamente da capital para 129 unidades escolares em aldeias, assentamentos agrícolas e comunidades ribeirinhas.
                </p>

                {/* Ações de Transmissão (Touch target min 44px + Feedback tátil active:scale-[0.97] + Focus rings) */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Assistir transmissão ao vivo no canal da SEDUC no YouTube (abre em nova aba)"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 active:scale-[0.97] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:shadow-md hover:shadow-red-600/20 active:shadow-none transition-all duration-150 ease-out touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B1B30] cursor-pointer"
                  >
                    <YoutubeIcon size={16} className="text-white shrink-0" />
                    <span>Assistir no YouTube</span>
                    <ExternalLink className="h-3 w-3 opacity-80 shrink-0" aria-hidden="true" />
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contatar suporte técnico das salas conectadas via WhatsApp (abre em nova aba)"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-emerald-500/40 bg-emerald-50/90 dark:bg-emerald-500/10 hover:bg-emerald-100/90 dark:hover:bg-emerald-500/20 hover:border-emerald-500/60 active:bg-emerald-200/80 dark:active:bg-emerald-500/30 active:scale-[0.97] px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:shadow-xs active:shadow-none transition-all duration-150 ease-out touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B1B30] cursor-pointer"
                  >
                    <WhatsAppIcon size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Suporte Técnico da Sala</span>
                    <ExternalLink className="h-3 w-3 opacity-75 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Grade Diária de Transmissão (Sem aninhamento de cards - Layout Distill & Break-UI Resiliente) */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF] shrink-0" aria-hidden="true" />
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Grade Diária de Transmissão Síncrona
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    Segunda a Sexta
                  </span>
                </div>

                {/* Grade em Linha Contínua com Divisores Elegantes (elimina box-in-a-box) */}
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
                          className="font-mono tabular-nums text-xs font-bold text-[#004A99] dark:text-cyan-300 truncate"
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

            {/* Metadados & Telemetria do Hub */}
            <footer className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/10">
              <span className="truncate tabular-nums">Coordenadas: LAT -8.7619° S • LON -63.9039° W</span>
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
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-sky-50 dark:bg-cyan-950/60 text-[#004A99] dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/30 shrink-0">
                  Feed Oficial
                </span>
              </div>

              {/* 1. Aviso Urgente do Mural (Layout Distill: Banner integrado com acento de borda, sem caixa aninhada duplicada) */}
              {urgentAnnouncement ? (
                <article className="border-l-4 border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 rounded-r-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500 text-slate-950 uppercase tracking-wider shrink-0">
                      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                      Aviso Mural
                    </span>
                    <time className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                      {urgentAnnouncement.date}
                    </time>
                  </div>
                  
                  <h4 
                    title={urgentAnnouncement.title}
                    className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 [overflow-wrap:anywhere] break-words"
                  >
                    {urgentAnnouncement.title}
                  </h4>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 [overflow-wrap:anywhere] break-words">
                    {urgentAnnouncement.content}
                  </p>
                </article>
              ) : (
                /* Estado Vazio Seguro para Avisos (Harden) */
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/15 bg-slate-50/50 dark:bg-white/5 flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Nenhum comunicado urgente no momento
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      As transmissões e salas operam regularmente conforme a grade horária.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Feed de Notícias Recentes (Layout Distill: Lista dividida limpa, sem cards isolados dentro de card) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 pb-1">
                  <Newspaper className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF] shrink-0" aria-hidden="true" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
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
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#004A99] dark:text-cyan-300 min-w-0 max-w-[65%] truncate">
                              <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span className="truncate">{news.category || 'Geral'}</span>
                            </span>
                            <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
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
                  /* Estado Vazio Seguro para Notícias (Harden) */
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

        {/* ================= 3. BARRA HORIZONTAL INSTITUCIONAL & REDES (LAYOUT & HARDEN) ================= */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0B1B30] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-md transition-colors">
          
          {/* Lado Esquerdo: Selo Oficial SEDUC */}
          <div className="flex items-center gap-3.5 min-w-0 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-cyan-950/80 border border-sky-200 dark:border-cyan-500/30 text-[#004A99] dark:text-cyan-300 flex items-center justify-center shrink-0">
              <Globe className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p 
                title="Portal Oficial da Secretaria de Estado da Educação"
                className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate"
              >
                Portal Oficial da Secretaria de Estado da Educação
              </p>
              <a
                href="https://rondonia.ro.gov.br/seduc/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Acessar o portal oficial da SEDUC Rondônia (abre em nova aba)"
                className="font-mono text-xs text-[#004A99] dark:text-[#00D8FF] hover:underline inline-flex items-center gap-1 truncate touch-manipulation"
              >
                <span className="truncate">rondonia.ro.gov.br/seduc</span>
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Lado Direito: Pílulas Executivas de Mídias com min-h 44px, feedback ativo e acessibilidade */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full md:w-auto">
            
            {/* Pílula YouTube */}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Canal YouTube da SEDUC Rondônia (abre em nova aba)"
              className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100/90 dark:hover:bg-red-950/30 active:bg-slate-200/80 dark:active:bg-red-950/50 active:scale-[0.96] border border-slate-200 dark:border-white/10 hover:border-red-400/80 dark:hover:border-red-500/40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:shadow-xs active:shadow-none transition-all duration-150 ease-out touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer shadow-2xs"
            >
              <YoutubeIcon size={16} className="text-red-600 shrink-0" />
              <span>YouTube</span>
            </a>

            {/* Pílula Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Oficial do Governo de Rondônia (abre em nova aba)"
              className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100/90 dark:hover:bg-sky-950/30 active:bg-slate-200/80 dark:active:bg-sky-950/50 active:scale-[0.96] border border-slate-200 dark:border-white/10 hover:border-sky-400/80 dark:hover:border-cyan-500/40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:shadow-xs active:shadow-none transition-all duration-150 ease-out touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer shadow-2xs"
            >
              <InstagramIcon size={16} className="text-sky-600 dark:text-cyan-400 shrink-0" />
              <span>Instagram</span>
            </a>

            {/* Pílula Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Página do Governo de Rondônia no Facebook (abre em nova aba)"
              className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100/90 dark:hover:bg-blue-950/30 active:bg-slate-200/80 dark:active:bg-blue-950/50 active:scale-[0.96] border border-slate-200 dark:border-white/10 hover:border-blue-400/80 dark:hover:border-blue-500/40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:shadow-xs active:shadow-none transition-all duration-150 ease-out touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer shadow-2xs"
            >
              <FacebookIcon size={16} className="text-blue-600 shrink-0" />
              <span>Facebook</span>
            </a>

            {/* Pílula WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Canal de Suporte WhatsApp (abre em nova aba)"
              className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100/90 dark:hover:bg-emerald-950/30 active:bg-slate-200/80 dark:active:bg-emerald-950/50 active:scale-[0.96] border border-slate-200 dark:border-white/10 hover:border-emerald-400/80 dark:hover:border-emerald-500/40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:shadow-xs active:shadow-none transition-all duration-150 ease-out touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              <WhatsAppIcon size={16} className="text-emerald-600 shrink-0" />
              <span>WhatsApp</span>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}


