'use client';

import React from 'react';
import Link from 'next/link';
import initialData from '@/data/initialData.json';
import { SocialLinks } from '@/types';
import { 
  Radio, 
  Satellite, 
  Signal, 
  Tv, 
  Clock, 
  ExternalLink,
  Globe,
  CheckCircle2,
  Bell,
  Newspaper,
  ArrowRight,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { 
  InstagramIcon, 
  YoutubeIcon, 
  FacebookIcon, 
  WhatsAppIcon 
} from '@/components/SocialIcons';

interface LiveBroadcastSectionProps {
  socials?: SocialLinks;
}

export default function LiveBroadcastSection({ socials = initialData.socials as SocialLinks }: LiveBroadcastSectionProps) {
  const schedules = [
    {
      shift: 'Turno Matutino',
      hours: '07h30 às 11h45',
      desc: 'Formação Geral Básica (BNCC) — Linguagens, Matemática, Ciências da Natureza e Humanas.',
      badge: 'Sinal Regular'
    },
    {
      shift: 'Turno Vespertino',
      hours: '13h30 às 17h45',
      desc: 'Itinerários Formativos, Projeto de Vida e Componente NBAZ (Agroecologia e Zootecnia).',
      badge: 'Sinal Regular'
    },
    {
      shift: 'Plantão Pedagógico',
      hours: 'Em tempo real',
      desc: 'Canal síncrono de retorno e interação direta entre professores ministrantes e mediadores presenciais.',
      badge: 'Interação Ao Vivo'
    },
  ];

  // Dados reais para o feed ao vivo da coluna direita
  const urgentAnnouncement = initialData.announcements?.[0] || {
    id: 'aviso-1',
    title: 'Início do Calendário Letivo 2026 e Transmissões ao Vivo',
    content: 'Grade de aulas síncronas via satélite ativa a partir das 07h30 para o turno matutino.',
    date: '10/10/2026',
    type: 'urgente'
  };

  const recentNews = (initialData.news || []).slice(0, 2);

  return (
    <section id="ao-vivo" className="relative scroll-mt-20 bg-white dark:bg-[#061224] text-slate-800 dark:text-white py-20 sm:py-28 overflow-hidden transition-colors duration-200">
      
      {/* Âncoras alternativas para links de navegação */}
      <div id="transmissoes" className="absolute -top-20" />
      <div id="redes" className="absolute -top-20" />

      {/* Grid Tecnológico em Perspectiva de fundo */}
      <div className="hero-grid absolute inset-0 opacity-20 dark:opacity-40 pointer-events-none" />

      {/* Focos de Luz Radial */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-rose-500/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ================= 1. CABEÇALHO DA SEÇÃO ================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-400/30 text-[#004A99] dark:text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-[0.2em] shadow-xs dark:shadow-[0_0_15px_rgba(0,216,255,0.15)]">
            <Radio className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 animate-pulse" />
            <span>SINAL SÍNCRONO &amp; COMUNICAÇÃO // SEDUC RONDÔNIA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-display">
            Pulso do MEDTEC em <span className="gradient-text">Tempo Real</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Acompanhe o sinal das aulas nos 52 municípios, consulte os turnos de transmissão e acesse comunicados oficiais e reportagens do programa.
          </p>
        </div>

        {/* ================= 2. GRID ASSIMÉTRICO DE 2 COLUNAS (7 cols + 5 cols) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* COLUNA ESQUERDA (7 cols): GRADE DIÁRIA & ESTÚDIO AO VIVO */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-cyan-500/25 bg-white dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden">
            
            {/* Cantoneiras Técnicas (Viewfinder Brackets) */}
            <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[#004A99] dark:border-cyan-400" />
            <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[#004A99] dark:border-cyan-400" />
            <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#004A99] dark:border-cyan-400" />
            <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#004A99] dark:border-cyan-400" />

            <div className="space-y-6">
              {/* Header do Estúdio */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                    <Radio className="h-3 w-3 animate-pulse" />
                    ((•)) Sinal no Ar • Estúdio PVH
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-300 dark:border-cyan-400/30 bg-sky-50 dark:bg-cyan-400/10 px-2.5 py-1 font-mono text-[10px] text-[#004A99] dark:text-cyan-200 font-semibold">
                    <Satellite className="h-3 w-3" />
                    Banda Ku &amp; IP
                  </span>
                </div>

                <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Uplink 99.8%
                </span>
              </div>

              {/* Título & Ações Rápidas */}
              <div className="space-y-3">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  Estúdio Central de Gravação &amp; Transmissão SEDUC
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Aulas ao vivo simultâneas geradas diretamente da capital para 129 unidades escolares em aldeias, assentamentos e comunidades ribeirinhas.
                </p>

                {/* Botões de Ação do Estúdio */}
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <a
                    href={socials.youtube || 'https://www.youtube.com/@SeducRondonia'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                  >
                    <Tv className="h-3.5 w-3.5" />
                    <span>Assistir Aulas no YouTube</span>
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>

                  <a
                    href={socials.whatsapp || 'https://wa.me/5569999999999'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <WhatsAppIcon size={14} />
                    <span>Suporte Técnico da Sala</span>
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>
                </div>
              </div>

              {/* Grade Diária de Transmissão (3 turnos) */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/5">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-900 dark:text-cyan-300 flex items-center gap-1.5 font-bold">
                    <Clock className="h-3.5 w-3.5 text-[#004A99] dark:text-cyan-400" />
                    Grade Diária de Transmissão Síncrona
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Segunda a Sexta</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {schedules.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-3.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {item.shift}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                        </div>
                        <p className="font-mono text-[11px] font-bold text-[#004A99] dark:text-cyan-300">
                          {item.hours}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-2 line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Telemetria de Coordenadas */}
            <div className="mt-6 pt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-500 dark:text-cyan-200/70 border-t border-slate-100 dark:border-white/10">
              <span>LAT -8.7619° S • LON -63.9039° W</span>
              <span className="text-[#004A99] dark:text-[#00D8FF] font-semibold">Hub Emissor Porto Velho</span>
            </div>

          </div>

          {/* COLUNA DIREITA (5 cols): ÚLTIMOS AVISOS & NOTÍCIAS OFICIAIS */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-6 sm:p-8 shadow-xl">
            
            <div className="space-y-5">
              
              {/* Header do Feed */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A365D]">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Mural &amp; Publicações Recentes
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 dark:bg-cyan-950/60 text-[#004A99] dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/30">
                  Feed Oficial
                </span>
              </div>

              {/* 1. Card de Aviso Urgente do Mural */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                    <AlertCircle className="h-3 w-3" />
                    Aviso Mural
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {urgentAnnouncement.date}
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                  {urgentAnnouncement.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {urgentAnnouncement.content}
                </p>
              </div>

              {/* 2. Duas Notícias Recentes */}
              <div className="space-y-3">
                {recentNews.map((news) => (
                  <Link
                    key={news.id}
                    href={`/noticias`}
                    className="group block p-3.5 rounded-2xl bg-slate-50 dark:bg-[#061224] border border-slate-200/80 dark:border-[#1A365D] hover:border-[#004A99]/50 dark:hover:border-cyan-400/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#004A99] dark:text-[#00D8FF]">
                        <Newspaper className="h-3 w-3" />
                        {news.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {news.publishedAt}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs sm:text-[13px] text-slate-900 dark:text-white group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors leading-snug line-clamp-2">
                      {news.title}
                    </h5>
                  </Link>
                ))}
              </div>

            </div>

            {/* Links Rápidos do Rodapé */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#1A365D] flex items-center justify-between text-xs font-bold">
              <Link
                href="/avisos"
                className="text-slate-600 dark:text-slate-300 hover:text-[#004A99] dark:hover:text-[#00D8FF] flex items-center gap-1 transition-colors"
              >
                <span>Mural de Avisos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/noticias"
                className="text-[#004A99] dark:text-[#00D8FF] hover:underline flex items-center gap-1 transition-colors"
              >
                <span>Portal de Notícias</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>

        </div>

        {/* ================= 3. BARRA HORIZONTAL EXECUTIVA DE REDES & PORTAL SEDUC ================= */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-md">
          
          {/* Lado Esquerdo: Selo e Link do Portal Oficial SEDUC */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-cyan-950/80 border border-sky-300 dark:border-cyan-400/30 text-[#004A99] dark:text-cyan-300 flex items-center justify-center shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                Portal Oficial da Secretaria de Estado da Educação
              </p>
              <a
                href="https://rondonia.ro.gov.br/seduc/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-[#004A99] dark:text-[#00D8FF] hover:underline flex items-center gap-1"
              >
                <span>rondonia.ro.gov.br/seduc</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Lado Direito: 4 Pílulas Horizontais Executivas e Discretas */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            
            {/* Pílula YouTube */}
            <a
              href={socials.youtube || 'https://www.youtube.com/@SeducRondonia'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061224] hover:bg-slate-100 dark:hover:bg-[#091E3A] border border-slate-200 dark:border-[#1A365D] hover:border-red-400 dark:hover:border-red-500/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              <YoutubeIcon size={16} className="text-red-600" />
              <span>YouTube Ao Vivo</span>
            </a>

            {/* Pílula Instagram */}
            <a
              href={socials.instagram || 'https://www.instagram.com/governoro/'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061224] hover:bg-slate-100 dark:hover:bg-[#091E3A] border border-slate-200 dark:border-[#1A365D] hover:border-pink-400 dark:hover:border-pink-500/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              <InstagramIcon size={16} className="text-pink-600" />
              <span>@governoro</span>
            </a>

            {/* Pílula Facebook */}
            <a
              href={socials.facebook || 'https://www.facebook.com/governoderondonia'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061224] hover:bg-slate-100 dark:hover:bg-[#091E3A] border border-slate-200 dark:border-[#1A365D] hover:border-blue-400 dark:hover:border-blue-500/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              <FacebookIcon size={16} className="text-blue-600" />
              <span>Comunidade FB</span>
            </a>

            {/* Pílula WhatsApp */}
            <a
              href={socials.whatsapp || 'https://wa.me/5569999999999'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061224] hover:bg-slate-100 dark:hover:bg-[#091E3A] border border-slate-200 dark:border-[#1A365D] hover:border-emerald-400 dark:hover:border-emerald-500/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              <WhatsAppIcon size={16} className="text-emerald-600" />
              <span>Suporte WhatsApp</span>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}
