'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ArrowDown,
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
import HomeProjectsAccordionSection from '@/components/HomeProjectsAccordionSection';
import LiveBroadcastSection from '@/components/LiveBroadcastSection';
import PresentationPitchModal from '@/components/PresentationPitchModal';

export default function HomePage() {
  const [pitchModalOpen, setPitchModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8] dark:bg-[#040D1A] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      {/* CABEÇALHO FLUTUANTE EM GLASSMORPHISM */}
      <SiteHeader onOpenPitchModal={() => setPitchModalOpen(true)} />

      <main className="flex-1">
        {/* ================= HERO SECTION: AMAZÔNIA AEROESPACIAL / TELEMETRIA ================= */}
        <section id="inicio" className="relative overflow-hidden bg-gradient-to-r from-[#05549D] via-[#072F5E] to-[#0A3D73] dark:from-[#040D1A] dark:via-[#07162C] dark:to-[#040D1A] text-white pt-6 pb-24 lg:pt-12 lg:pb-32 scroll-mt-20">
          
          {/* Fundo Fotográfico com Overlay e Blend Mode */}
          <img
            src="/hero.jpg"
            alt="Transmissão das aulas do MEDTEC Rondônia"
            width={1600}
            height={912}
            decoding="async"
            fetchPriority="high"
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
              
              {/* 1. LINHA DE STATUS INSTITUCIONAL */}
              <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 rounded-md border border-white/15 bg-white/10 dark:bg-slate-900/60 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md select-none">
                <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Sinal Satelital Ativo • 52 Municípios
                </span>
                <span className="text-white/20 hidden sm:inline">•</span>
                <span className="text-slate-300 hidden sm:inline">Lei Estadual nº 3.846/2016</span>
                <span className="text-white/20 hidden md:inline">•</span>
                <span className="text-slate-300/80 hidden md:inline">Portaria SEDUC nº 928/2025</span>
              </div>

              {/* 2. TÍTULO PRINCIPAL INSTITUCIONAL */}
              <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] text-balance">
                Ensino Médio com Mediação Tecnológica{' '}
                <span className="text-[#00D8FF]">
                  na Rede Estadual de Rondônia
                </span>
              </h1>

              {/* 3. SUBTÍTULO DIRETO E INSTITUCIONAL */}
              <p className="max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg text-pretty">
                Aulas transmitidas ao vivo dos estúdios da SEDUC em Porto Velho para estudantes do 1º ao 3º ano em comunidades rurais, ribeirinhas, indígenas e quilombolas nos 52 municípios.
              </p>

              {/* 4. LINHA EDITORIAL DE PÚBLICO INTEGRADA */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 border-y border-white/10 py-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Ribeirinhos &amp; Indígenas
                </span>
                <span className="text-white/20 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Quilombolas &amp; Comunidades Rurais
                </span>
                <span className="text-white/20 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  100% de Cobertura Estadual
                </span>
              </div>

              {/* 5. GRUPO DE CTAs COM BOTÕES TÉCNICOS ROUNDED-LG */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <a
                  href="#como-funciona"
                  className="group inline-flex items-center gap-2 rounded-lg bg-white text-slate-950 hover:bg-slate-100 dark:bg-[#00D8FF] dark:text-slate-950 dark:hover:bg-[#38BDF8] px-5 py-3 text-sm font-extrabold shadow-sm active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none"
                >
                  <span>Como funciona o MEDTEC</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1" />
                </a>

                <a
                  href="#ao-vivo"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 text-white px-5 py-3 text-sm font-semibold backdrop-blur-md active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer shadow-xs touch-manipulation select-none"
                >
                  <Play className="h-4 w-4 text-rose-400 fill-rose-400/40" />
                  <span>Canal ao vivo</span>
                </a>

                <Link
                  href="/avisos"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer group touch-manipulation select-none"
                >
                  <span>Avisos e comunicados</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:translate-x-1 text-cyan-300" />
                </Link>
              </div>

            </div>

            {/* ================= COLUNA DA DIREITA: PAINEL DE TRANSMISSÃO E MÉTRICAS ================= */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 text-white backdrop-blur-xl shadow-xl">
                
                {/* Cabeçalho Institucional do Painel */}
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono">
                      Estúdio Central SEDUC • Porto Velho/RO
                    </p>
                    <p className="mt-0.5 text-xs text-slate-300 font-medium">Transmissão Síncrona Estadual</p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-300">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                    </span>
                    Ao Vivo
                  </span>
                </div>

                {/* Área de Imagem do Estúdio */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                  <img
                    src="/hero.jpg"
                    alt="Transmissão das aulas ao vivo no estúdio MEDTEC Porto Velho"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                    <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-mono text-[11px]">
                      <Satellite className="h-3.5 w-3.5 text-cyan-400" />
                      Sinal Satelital Banda Ku
                    </span>

                    <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-mono text-[11px] font-bold text-white">
                      <Signal className="h-3.5 w-3.5 text-emerald-400" />
                      Alta Definição
                    </span>
                  </div>
                </div>

                {/* GRADE ARQUITETÔNICA CONTÍNUA */}
                <div className="grid grid-cols-2 divide-x divide-y divide-white/10 border-t border-white/10">
                  
                  {/* Métrica 1: Estudantes */}
                  <div className="p-4 sm:p-5">
                    <p className="font-display text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">6.000+</p>
                    <p className="text-xs text-slate-300 mt-1">Estudantes atendidos</p>
                  </div>

                  {/* Métrica 2: Unidades Escolares */}
                  <div className="p-4 sm:p-5">
                    <p className="font-display text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">129</p>
                    <p className="text-xs text-slate-300 mt-1">Unidades escolares</p>
                  </div>

                  {/* Métrica 3: Turmas Ativas */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-baseline gap-2">
                      <p className="font-display text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">330</p>
                      <span className="text-[10px] text-emerald-400 font-semibold font-mono">Síncronas</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Turmas ativas no ar</p>
                  </div>

                  {/* Métrica 4: Cobertura Municipal (100%) */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-baseline gap-2">
                      <p className="font-display text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">52</p>
                      <span className="text-[10px] text-cyan-300 font-semibold font-mono">100% Cobertura</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Municípios de Rondônia</p>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* Botão de Rolagem Suave na Base do Hero */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex justify-center">
            <a 
              href="#tecnologia" 
              className="group flex items-center justify-center cursor-pointer touch-manipulation select-none active:scale-[0.95] transition-transform duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-300 rounded-lg"
              aria-label="Rolar para os pilares e matriz curricular"
            >
              <div className="w-9 h-9 rounded-lg bg-[#07162C]/80 border border-cyan-400/40 shadow-sm flex items-center justify-center backdrop-blur-md transition-colors">
                <ArrowDown className="h-4 w-4 text-cyan-300" />
              </div>
            </a>
          </div>

          {/* Gradiente de Transição Suave na Base do Hero */}
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#F0F4F8] dark:from-[#040B16] to-transparent" />
        </section>

        {/* ================= SEÇÃO 2: ARQUITETURA & MATRIZ CURRICULAR UNIFICADAS ================= */}
        <TechAdvantages />

        {/* ================= SEÇÃO 3: A JORNADA DA AULA & QUEM FAZ ACONTECER ================= */}
        <Methodology />

        {/* ================= SEÇÃO 4: PANORAMA DOS 6 ECOSSISTEMAS PEDAGÓGICOS ================= */}
        <HomeProjectsAccordionSection />

        {/* ================= SEÇÃO 5: PULSO EM TEMPO REAL, GRADE DO DIA & CONEXÃO OFICIAL ================= */}
        <LiveBroadcastSection />
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
