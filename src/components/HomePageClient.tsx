'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowRight, 
  ArrowDown,
  Satellite,
  Signal,
  CheckCircle2
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TechAdvantages from '@/components/TechAdvantages';
import Methodology from '@/components/Methodology';
import HomeBannerCarousel from '@/components/HomeBannerCarousel';
import type { BannerPublico } from '@/lib/api';
import HomeProjectsAccordionSection from '@/components/HomeProjectsAccordionSection';
import CommunityMuralSection from '@/components/CommunityMuralSection';

const PresentationPitchModal = dynamic(
  () => import('@/components/PresentationPitchModal'),
  { ssr: false }
);

export default function HomePageClient({ banners }: { banners: BannerPublico[] }) {
  const [pitchModalOpen, setPitchModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F4F8] dark:bg-[#040D1A] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      {/* CABEÇALHO FLUTUANTE EM GLASSMORPHISM */}
      <SiteHeader onOpenPitchModal={() => setPitchModalOpen(true)} />

      <main className="flex-1">
        <HomeBannerCarousel banners={banners} />

        {/* ================= HERO SECTION: AMAZÔNIA AEROESPACIAL / TELEMETRIA ================= */}
        <section id="inicio" className="relative overflow-hidden bg-gradient-to-r from-[#05549D] via-[#072F5E] to-[#0A3D73] dark:from-[#040D1A] dark:via-[#07162C] dark:to-[#040D1A] text-white pt-6 pb-24 lg:pt-12 lg:pb-32 scroll-mt-20">
          
          {/* Fundo Fotográfico com Overlay e Blend Mode */}
          <Image
            src="/hero.jpg"
            alt="Transmissão das aulas do MEDTEC Rondônia"
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover opacity-25 mix-blend-luminosity pointer-events-none"
          />

          {/* Conteúdo Principal do Hero */}
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
            
            {/* Coluna da Esquerda */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-sky-200">
                <span>SEDUC-RO • 52 Municípios</span>
                <span>•</span>
                <span>Lei Estadual nº 3.846/2016</span>
                <span>•</span>
                <span>Portaria SEDUC nº 928/2025</span>
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] text-balance">
                Ensino Médio com Mediação Tecnológica em Rondônia
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg text-pretty font-normal">
                Educação pública de qualidade conectando estudantes do 1º ao 3º ano do Ensino Médio em comunidades rurais, ribeirinhas, indígenas e quilombolas nos 52 municípios de Rondônia.
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
                  className="group inline-flex items-center gap-2 rounded-lg bg-white text-slate-950 hover:bg-slate-100 dark:bg-[#00D8FF] dark:text-slate-950 dark:hover:bg-[#38BDF8] px-5 py-3 text-sm font-bold shadow-sm active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none"
                >
                  <span>Como funciona o MEDTEC</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1" />
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                      SEDUC-RO • Governo de Rondônia
                    </p>
                    <p className="mt-0.5 text-xs text-slate-300 font-medium">Mediação Tecnológica em Rede</p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    Rede Oficial
                  </span>
                </div>

                {/* Área de Imagem do Estúdio */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                  <Image
                    src="/hero.jpg"
                    alt="Estudantes em sala de aula conectada do MEDTEC Rondônia"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                    <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[11px]">
                      <Satellite className="h-3.5 w-3.5 text-sky-400" />
                      Sinal via Satélite
                    </span>

                    <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[11px] font-bold text-white">
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
                      <span className="text-[10px] text-emerald-400 font-semibold">Turmas</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Turmas ativas no ar</p>
                  </div>

                  {/* Métrica 4: Cobertura Municipal (100%) */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-baseline gap-2">
                      <p className="font-display text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">52</p>
                      <span className="text-[10px] text-sky-300 font-semibold">100% Cobertura</span>
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

        {/* ================= SEÇÃO 5: MURAL LADO A LADO: CORPO DOCENTE & PROTAGONISMO ESTUDANTIL ================= */}
        <CommunityMuralSection />
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
