'use client';

import React from 'react';
import initialData from '@/data/initialData.json';
import { SocialLinks } from '@/types';
import { 
  Radio, 
  Satellite, 
  Signal, 
  Tv, 
  Clock, 
  ExternalLink,
  Share2,
  Globe,
  CheckCircle2
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
      desc: 'Canal de retorno e interação síncrona entre professores ministrantes e mediadores presenciais.',
      badge: 'Interação Ao Vivo'
    },
  ];

  return (
    <section id="ao-vivo" className="relative scroll-mt-20 bg-slate-100/90 dark:bg-gradient-to-b dark:from-[#040D1A] dark:via-[#07162C] dark:to-[#040D1A] text-slate-800 dark:text-white py-24 overflow-hidden transition-colors duration-200">
      {/* Âncora alternativa para compatibilidade */}
      <div id="transmissoes" className="absolute -top-20" />
      <div id="redes" className="absolute -top-20" />

      {/* Grid Tecnológico em Perspectiva de fundo */}
      <div className="hero-grid absolute inset-0 opacity-20 dark:opacity-40 pointer-events-none" />

      {/* Focos de Luz Radial */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-rose-500/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ================= CABEÇALHO DA SEÇÃO ================= */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-400/30 text-[#05549D] dark:text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-[0.2em] shadow-sm dark:shadow-[0_0_15px_rgba(0,216,255,0.15)]">
            <Radio className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 animate-pulse" />
            <span>SINAL SÍNCRONO &amp; REDES OFICIAIS // SEDUC-RO</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-display">
            Transmissões Ao Vivo &amp; <span className="bg-gradient-to-r from-[#0284C7] to-[#00D8FF] dark:from-cyan-300 dark:via-sky-300 dark:to-white bg-clip-text text-transparent">Redes Oficiais</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Aulas diárias transmitidas via satélite diretamente dos estúdios televisivos em Porto Velho para centenas de salas conectadas em todo o estado de Rondônia.
          </p>
        </div>

        {/* ================= CONSOLE HUD DE TRANSMISSÃO ================= */}
        <div className="hud-frame relative overflow-hidden rounded-3xl border border-slate-200 dark:border-cyan-500/25 bg-white dark:bg-slate-900/80 p-6 sm:p-10 backdrop-blur-xl shadow-lg dark:shadow-2xl mb-14">
          
          {/* Cantoneiras Técnicas (Viewfinder Brackets) */}
          <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-[#0284C7] dark:border-cyan-400" />
          <div className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-[#0284C7] dark:border-cyan-400" />
          <div className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-[#0284C7] dark:border-cyan-400" />
          <div className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-[#0284C7] dark:border-cyan-400" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
            
            {/* Coluna da Esquerda: Estúdio Central e Controles */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  ((•)) Sinal no Ar · Estúdio Central
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 dark:border-cyan-400/30 bg-sky-50 dark:bg-cyan-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#05549D] dark:text-cyan-200">
                  <Satellite className="h-3 w-3 text-[#0284C7] dark:text-cyan-300" />
                  Satélite Banda Ku &amp; IP
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Signal className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                  4K Ultra HD
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Estúdio de Gravação e Transmissão Televisiva SEDUC
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                A Coordenadoria de Mídias Educacionais opera estúdios televisivos profissionais em Porto Velho, gerando sinal educacional de alta disponibilidade para jovens das comunidades ribeirinhas, indígenas, quilombolas e agrícolas dos 52 municípios.
              </p>

              {/* Botões de Ação Rápida */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <a
                  href={socials.youtube || 'https://www.youtube.com/@SeducRondonia'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-950/30 dark:shadow-red-950/60 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Tv className="h-4 w-4" />
                  <span>Assistir Aulas no YouTube</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>

                <a
                  href={socials.whatsapp || 'https://wa.me/5569999999999'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-5 py-3 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                >
                  <WhatsAppIcon size={16} />
                  <span>Suporte Técnico da Sala</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>
              </div>

              {/* Indicadores de Telemetria */}
              <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-slate-600 dark:text-cyan-200/80 border-t border-slate-200 dark:border-white/10">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  Transmissão Síncrona Ativa
                </span>
                <span>•</span>
                <span>LAT -8.7619° S • LON -63.9039° W</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Uplink 99.8%</span>
              </div>

            </div>

            {/* Coluna da Direita: Grade Diária de Transmissão */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-700 dark:text-cyan-300 flex items-center gap-2 font-bold">
                  <Clock className="h-4 w-4 text-[#0284C7] dark:text-cyan-400" />
                  Grade Diária de Transmissão
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Segunda a Sexta</span>
              </div>

              {schedules.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-[#0284C7] dark:hover:border-cyan-400/40 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{item.shift}</span>
                    <span className="font-mono text-xs font-semibold text-[#05549D] dark:text-cyan-300 bg-sky-100 dark:bg-cyan-400/10 px-2 py-0.5 rounded-md border border-sky-200 dark:border-cyan-400/20">
                      {item.hours}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{item.desc}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    <span>{item.badge}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ================= REDES SOCIAIS OFICIAIS ================= */}
        <div className="space-y-6">
          
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#0284C7] dark:text-cyan-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Canais Oficiais nas Redes Sociais
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
              Comunidade &amp; Bastidores SEDUC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card YouTube */}
            <div className="rounded-2xl border border-slate-200 dark:border-red-500/20 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-xl transition-all hover:border-red-400 dark:hover:border-red-500/40 hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <YoutubeIcon size={22} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-mono font-bold">
                    Ao Vivo
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Canal no YouTube</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Aulas ao vivo, revisões do ENEM e conteúdos produzidos nos estúdios da SEDUC.
                </p>
              </div>
              <a
                href={socials.youtube || 'https://www.youtube.com/@SeducRondonia'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Inscrever-se no Canal</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Card Instagram */}
            <div className="rounded-2xl border border-slate-200 dark:border-pink-500/20 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-xl transition-all hover:border-pink-400 dark:hover:border-pink-500/40 hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-pink-100 dark:bg-gradient-to-tr dark:from-amber-500/20 dark:via-rose-500/20 dark:to-purple-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <InstagramIcon size={22} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-600 dark:text-pink-400 text-[10px] font-mono font-bold">
                    @governoro
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Instagram Oficial</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Bastidores dos estúdios, fotos do cotidiano dos alunos e avisos pedagógicos rápidos.
                </p>
              </div>
              <a
                href={socials.instagram || 'https://www.instagram.com/governoro/'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Seguir no Instagram</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Card Facebook */}
            <div className="rounded-2xl border border-slate-200 dark:border-blue-500/20 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-xl transition-all hover:border-blue-400 dark:hover:border-blue-500/40 hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FacebookIcon size={22} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
                    Comunidade
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Página no Facebook</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Notícias institucionais, eventos estaduais e conexão com famílias de Rondônia.
                </p>
              </div>
              <a
                href={socials.facebook || 'https://www.facebook.com/governoderondonia'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Acompanhar no Facebook</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Card WhatsApp */}
            <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/20 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-xl transition-all hover:border-emerald-400 dark:hover:border-emerald-500/40 hover:-translate-y-1 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <WhatsAppIcon size={22} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                    Suporte
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Canal do WhatsApp</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Suporte pedagógico e técnico direto aos professores mediadores e polos escolares.
                </p>
              </div>
              <a
                href={socials.whatsapp || 'https://wa.me/5569999999999'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Falar no WhatsApp</span>
                <ExternalLink size={13} />
              </a>
            </div>

          </div>

          {/* Banner do Portal Oficial do Governo de Rondônia */}
          <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-gradient-to-r dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-950 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-sky-100 dark:bg-cyan-500/20 border border-sky-300 dark:border-cyan-400/30 rounded-xl text-[#05549D] dark:text-cyan-300 shrink-0">
                <Globe size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Portal Oficial da Secretaria de Estado da Educação de Rondônia
                </h4>
                <p className="text-xs text-slate-600 dark:text-cyan-200/80 mt-0.5">
                  Acesse informações institucionais detalhadas em rondonia.ro.gov.br/seduc
                </p>
              </div>
            </div>

            <a
              href="https://rondonia.ro.gov.br/seduc/programas-e-projetos/projetos/conheca-o-projeto/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#05549D] dark:bg-white hover:bg-[#0284C7] dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-md cursor-pointer"
            >
              <span>Ver no Portal SEDUC</span>
              <ExternalLink size={14} />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
