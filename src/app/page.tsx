'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  Tv, 
  Radio, 
  Satellite,
  Signal,
  Megaphone
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TechAdvantages from '@/components/TechAdvantages';
import Methodology from '@/components/Methodology';
import PresentationPitchModal from '@/components/PresentationPitchModal';
import { statsData } from '@/data/medtecData';

export default function HomePage() {
  const [pitchModalOpen, setPitchModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* CABEÇALHO OFICIAL */}
      <SiteHeader onOpenPitchModal={() => setPitchModalOpen(true)} />

      <main className="flex-1 pb-16">
        {/* ================= HERO SECTION (O INÍCIO) ================= */}
        <section className="relative overflow-hidden bg-[#050b16] text-white">
          <img
            src="/hero.jpg"
            alt="Estudantes em sala do MEDTEC assistindo aula transmitida"
            width={1600}
            height={912}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-hero-overlay" />
          <div className="hero-grid absolute inset-0" />
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-600/30 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-12 lg:py-20">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
                    <span className="relative h-2 w-2 rounded-full bg-cyan-300" />
                  </span>
                  Beacon · 52 municípios
                </span>
                <p className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-200 backdrop-blur-sm">
                  Lei 3.846/2016
                </p>
                <button
                  onClick={() => setPitchModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-white/5 px-3.5 py-1 text-xs font-semibold text-cyan-100 backdrop-blur-sm transition-colors hover:bg-cyan-400/15"
                >
                  <Sparkles className="h-3 w-3 text-cyan-300" />
                  Dossiê do projeto
                </button>
              </div>

              <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                A educação do futuro chega a{' '}
                <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-white bg-clip-text text-transparent">
                  todo canto de Rondônia
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Aulas ao vivo diretamente dos estúdios televisivos da Coordenadoria de Mídias Educacionais em Porto Velho para centenas de salas conectadas em todo o estado de Rondônia, acompanhadas diariamente por professores mediadores presenciais.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                {['Ribeirinhos & Indígenas', 'Quilombolas & Rurais', 'Portaria SEDUC nº 928/2025'].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-200 backdrop-blur-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#como-funciona"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-sky-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.35)] transition-all hover:brightness-110"
                >
                  Como funciona o MEDTEC
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <Link
                  href="/avisos"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  <Megaphone className="h-4 w-4 text-cyan-300" />
                  Mural de avisos
                </Link>
                <Link
                  href="/ao-vivo"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300/40 px-5 py-3 text-sm font-semibold text-cyan-100 backdrop-blur-sm transition-colors hover:bg-cyan-400/15"
                >
                  <Tv className="h-4 w-4" />
                  Canal ao vivo
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="hud-frame relative overflow-hidden rounded-3xl p-4 backdrop-blur-xl sm:p-5">
                <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-cyan-300/80" />
                <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-cyan-300/80" />
                <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-cyan-300/80" />
                <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-cyan-300/80" />

                <div className="mb-4 flex items-center justify-between gap-3 px-2 pt-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                      Console de sinal
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">Estúdio Porto Velho</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                    <Radio className="h-3 w-3 animate-pulse" />
                    Ao vivo
                  </span>
                </div>

                <div className="relative mb-4 h-44 overflow-hidden rounded-2xl sm:h-52">
                  <img
                    src="/hero.jpg"
                    alt="Transmissão do estúdio MEDTEC"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050b16] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-cyan-100">
                    <span className="inline-flex items-center gap-1.5">
                      <Satellite className="h-3.5 w-3.5" />
                      Sat · IP
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Signal className="h-3.5 w-3.5" />
                      4K
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {statsData.map((stat, index) => (
                    <div
                      key={stat.rotulo}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <p className="font-mono text-[10px] text-cyan-300/80">0{index + 1}</p>
                      <p className="mt-1 font-display text-2xl font-bold text-white">{stat.valor}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-300">{stat.rotulo}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TECNOLOGIA: VANTAGENS TECNOLÓGICAS DO MEDTEC ================= */}
        <TechAdvantages />

        {/* ================= COMO FUNCIONA: METODOLOGIA EM 5 PASSOS ================= */}
        <Methodology />
      </main>

      {/* RODAPÉ DO SISTEMA */}
      <SiteFooter />

      {/* MODAL DOSSIÊ DE APRESENTAÇÃO / PITCH */}
      <PresentationPitchModal
        isOpen={pitchModalOpen}
        onClose={() => setPitchModalOpen(false)}
      />
    </div>
  );
}
