'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Radio, 
  Satellite,
  Signal,
  Users,
  Building2,
  Activity,
  MapPin,
  CheckCircle2,
  Play
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TechAdvantages from '@/components/TechAdvantages';
import Methodology from '@/components/Methodology';
import PresentationPitchModal from '@/components/PresentationPitchModal';

export default function HomePage() {
  const [pitchModalOpen, setPitchModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#040D1A]">
      {/* CABEÇALHO FLUTUANTE EM GLASSMORPHISM */}
      <SiteHeader onOpenPitchModal={() => setPitchModalOpen(true)} />

      <main className="flex-1">
        {/* ================= HERO SECTION: AMAZÔNIA AEROESPACIAL / TELEMETRIA ================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#040D1A] via-[#07162C] to-[#0b1e38] text-white pt-6 pb-24 lg:pt-12 lg:pb-32">
          
          {/* Fundo Fotográfico com Overlay e Blend Mode */}
          <img
            src="/hero.jpg"
            alt="Transmissão das aulas do MEDTEC Rondônia"
            width={1600}
            height={912}
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity pointer-events-none"
          />

          {/* Grid Tecnológico em Perspectiva */}
          <div className="hero-grid absolute inset-0 opacity-60 pointer-events-none" />

          {/* Focos de Luz Radial (Glows Aeroespaciais) */}
          <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="pointer-events-none absolute right-0 top-1/4 h-[450px] w-[450px] rounded-full bg-sky-600/20 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />

          {/* ================= SVG: REDE DE NÓS LUMINOSOS / CONSTELAÇÃO RONDÔNIA ================= */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
            <svg 
              className="h-full w-full" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 1440 800" 
              fill="none"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D8FF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Linhas de Conexão Satélite / Geodésicas */}
              <path d="M720 120 L300 320 M720 120 L520 480 M720 120 L960 280 M720 120 L1150 420 M720 120 L780 620" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M300 320 L520 480 L780 620 L1150 420 L960 280 Z" stroke="rgba(0, 216, 255, 0.15)" strokeWidth="1" />
              <path d="M300 320 Q 550 200 960 280" stroke="rgba(2, 132, 199, 0.25)" strokeWidth="1.5" />

              {/* Nós Municipais Conectados (Polos) */}
              {/* Polo Central: Porto Velho (Hub) */}
              <circle cx="720" cy="120" r="7" fill="#00D8FF" filter="url(#glow)" />
              <circle cx="720" cy="120" r="14" stroke="#00D8FF" strokeWidth="1" opacity="0.4" />
              
              {/* Nós Interiores */}
              <circle cx="300" cy="320" r="4.5" fill="#38BDF8" />
              <circle cx="520" cy="480" r="4" fill="#34D399" />
              <circle cx="960" cy="280" r="4.5" fill="#38BDF8" />
              <circle cx="1150" cy="420" r="4" fill="#38BDF8" />
              <circle cx="780" cy="620" r="4" fill="#34D399" />
              <circle cx="410" cy="240" r="3" fill="#00D8FF" opacity="0.6" />
              <circle cx="880" cy="480" r="3" fill="#00D8FF" opacity="0.6" />
            </svg>
          </div>

          {/* ================= CONTEÚDO PRINCIPAL (GRID 12 COLS) ================= */}
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
            
            {/* ================= COLUNA DA ESQUERDA: TEXTO & CTAs ================= */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. LINHA DE STATUS TERMINAL TÉCNICO (SUBSTITUI PILLS ANTIGAS) */}
              <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 rounded-full border border-cyan-400/25 bg-[#07162C]/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-200/90 backdrop-blur-md shadow-[0_0_20px_rgba(0,216,255,0.15)]">
                <span className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  [ BEACON ATIVO • 52 MUNICÍPIOS ]
                </span>
                <span className="text-cyan-500/40 hidden sm:inline">{'//'}</span>
                <span className="text-slate-300 hidden sm:inline">LEI ESTADUAL 3.846/2016</span>
                <span className="text-cyan-500/40 hidden md:inline">{'//'}</span>
                <span className="text-slate-400 hidden md:inline">PORTARIA SEDUC 928/2025</span>
              </div>

              {/* 2. TÍTULO PRINCIPAL (H1) COM CONTRASTE & GRADIENTE */}
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]">
                A educação do futuro chega a{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-white bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.35)]">
                  todo canto de Rondônia
                </span>
              </h1>

              {/* 3. SUBTÍTULO DESCRITIVO */}
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Aulas ao vivo diretamente dos estúdios televisivos da Coordenadoria de Mídias Educacionais em Porto Velho para centenas de salas conectadas em todo o estado, acompanhadas diariamente por professores mediadores presenciais.
              </p>

              {/* 4. FAIXA INTEGRADA DE INDICADORES DE PÚBLICO */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 border-y border-white/10 py-3.5 text-xs font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1.5 text-cyan-200">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Ribeirinhos & Indígenas
                </span>
                <span className="text-white/20 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1.5 text-cyan-200">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Quilombolas & Rurais
                </span>
                <span className="text-white/20 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  100% de Cobertura Estadual
                </span>
              </div>

              {/* 5. GRUPO DE CTAs (APENAS BOTÕES COM FORMATO ARREDONDADO) */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                {/* Botão Primário */}
                <a
                  href="#como-funciona"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-400 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_0_28px_rgba(0,216,255,0.45)] transition-all hover:brightness-110 hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(0,216,255,0.65)] cursor-pointer"
                >
                  <span>Como funciona o MEDTEC</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>

                {/* Botão Secundário */}
                <Link
                  href="/ao-vivo"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-[#07162C]/70 px-5 py-3.5 text-sm font-semibold text-cyan-100 backdrop-blur-md transition-all hover:border-cyan-400/60 hover:bg-cyan-500/10 hover:text-white cursor-pointer shadow-sm"
                >
                  <Play className="h-4 w-4 text-rose-400 fill-rose-400/40" />
                  <span>Canal ao vivo</span>
                </Link>

                {/* Link Terciário Discreto */}
                <Link
                  href="/avisos"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer group"
                >
                  <span>Avisos e notícias</span>
                  <span className="transition-transform group-hover:translate-x-1 text-cyan-400">→</span>
                </Link>
              </div>

            </div>

            {/* ================= COLUNA DA DIREITA: CONSOLE DE SINAL HUD ================= */}
            <div className="lg:col-span-5">
              <div className="hud-frame relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-900/80 p-4 sm:p-5 backdrop-blur-xl shadow-2xl">
                
                {/* Cantoneiras Técnicas (Viewfinder Brackets nos 4 cantos) */}
                <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-cyan-400" />
                <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-cyan-400" />
                <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-cyan-400" />

                {/* Header Técnico do Card HUD */}
                <div className="mb-3.5 flex items-center justify-between gap-3 px-2 pt-1">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300 font-semibold">
                      CONSOLE DE SINAL // ESTÚDIO PORTO VELHO
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-white">Transmissão Síncrona SEDUC</p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]">
                    <Radio className="h-3 w-3 animate-pulse" />
                    ((•)) AO VIVO
                  </span>
                </div>

                {/* Área de Imagem do Estúdio / Sala Conectada */}
                <div className="relative mb-3 h-48 sm:h-52 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                  <img
                    src="/hero.jpg"
                    alt="Transmissão das aulas ao vivo no estúdio MEDTEC Porto Velho"
                    className="h-full w-full object-cover"
                  />
                  
                  {/* Gradiente sutil para garantir legibilidade dos dados do HUD */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040D1A] via-transparent to-black/20" />

                  {/* Barra de HUD Sobreposta na Base da Imagem */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between rounded-xl bg-slate-950/70 border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan-100 backdrop-blur-md">
                    <span className="inline-flex items-center gap-1.5 text-cyan-200">
                      <Satellite className="h-3.5 w-3.5 text-cyan-300" />
                      SAT - TP 04
                    </span>

                    <span className="inline-flex items-center gap-1.5 font-bold text-white">
                      <Signal className="h-3.5 w-3.5 text-cyan-300" />
                      4K UHD
                    </span>

                    {/* Mini Gráfico de Barras de Sinal em Verde */}
                    <div className="flex items-end gap-1 h-3.5" title="Qualidade de Sinal: Excelente">
                      <span className="w-1 h-1.5 bg-emerald-400 rounded-xs animate-signal-1" />
                      <span className="w-1 h-2.5 bg-emerald-400 rounded-xs animate-signal-2" />
                      <span className="w-1 h-3 bg-emerald-400 rounded-xs animate-signal-3" />
                      <span className="w-1 h-3.5 bg-emerald-400 rounded-xs animate-signal-4" />
                    </div>
                  </div>
                </div>

                {/* BARRA DE TELEMETRIA: DADOS REAIS DE PORTO VELHO & ONDA DE SINAL */}
                <div className="mb-3.5 flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-950/30 px-3 py-2 font-mono text-[10px] text-cyan-200">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span className="truncate">LAT -8.7619° S • LON -63.9039° W</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-emerald-400 font-semibold">UPLINK: 99.8%</span>
                    {/* Animação simulando onda de áudio/sinal */}
                    <div className="flex items-center gap-0.5 h-3" title="Sinal síncrono">
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-1" />
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-2" />
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-3" />
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-4" />
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-5" />
                    </div>
                  </div>
                </div>

                {/* GRID DE MÉTRICAS (2x2 REMODELADO COM ÍCONES E INDICADORES CONTEXTUAIS) */}
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* Métrica 1: Estudantes */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-cyan-400/30 transition-colors">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <Users className="h-4 w-4 text-cyan-400" />
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        +Ativo
                      </span>
                    </div>
                    <p className="font-display text-2xl font-black text-white">6.000+</p>
                    <p className="text-[11px] leading-snug text-slate-300 mt-0.5">Estudantes atendidos</p>
                  </div>

                  {/* Métrica 2: Unidades Escolares */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-cyan-400/30 transition-colors">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <Building2 className="h-4 w-4 text-sky-400" />
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        Pólos
                      </span>
                    </div>
                    <p className="font-display text-2xl font-black text-white">129</p>
                    <p className="text-[11px] leading-snug text-slate-300 mt-0.5">Unidades escolares</p>
                  </div>

                  {/* Métrica 3: Turmas Ativas */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-cyan-400/30 transition-colors">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    </div>
                    <p className="font-display text-2xl font-black text-white">330</p>
                    <p className="text-[11px] leading-snug text-slate-300 mt-0.5">Turmas ativas no ar</p>
                  </div>

                  {/* Métrica 4: Cobertura Municipal (100%) */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-cyan-400/30 transition-colors">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <MapPin className="h-4 w-4 text-cyan-400" />
                      <span className="text-[10px] font-mono font-bold text-cyan-300">100%</span>
                    </div>
                    <p className="font-display text-2xl font-black text-white">52</p>
                    <p className="text-[11px] leading-snug text-slate-300 mt-0.5 mb-1.5">Municípios cobertos</p>
                    
                    {/* Mini Barra de Progresso 100% preenchida */}
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-full rounded-full shadow-[0_0_8px_rgba(0,216,255,0.6)]" />
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* Gradiente de Transição Suave na Base do Hero */}
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
        </section>

        {/* ================= SEGUNDA SEÇÃO: BENTO GRID DE PILARES ================= */}
        <TechAdvantages />

        {/* ================= TERCEIRA SEÇÃO: METODOLOGIA EM 5 PASSOS ================= */}
        <Methodology />
      </main>

      {/* RODAPÉ DO SISTEMA */}
      <SiteFooter />

      {/* MODAL DOSSIÊ DE APRESENTAÇÃO */}
      <PresentationPitchModal
        isOpen={pitchModalOpen}
        onClose={() => setPitchModalOpen(false)}
      />
    </div>
  );
}
