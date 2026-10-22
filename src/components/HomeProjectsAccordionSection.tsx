'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PROJECTS_DATA } from '@/data/projectsData';
import { MapPin, ArrowUpRight, ArrowRight } from 'lucide-react';

export default function HomeProjectsAccordionSection() {
  // Inicializa com a Missão #06 expandida (como demonstrado na prévia)
  const [hoveredId, setHoveredId] = useState<string>(
    PROJECTS_DATA[PROJECTS_DATA.length - 1]?.id || PROJECTS_DATA[0].id
  );

  return (
    <section id="projetos-ecossistemas" className="relative scroll-mt-20 py-20 sm:py-28 bg-[#F0F4F8] dark:bg-[#040B16] transition-colors duration-200 border-t border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Cabeçalho Editorial da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#004A99] dark:text-[#00D8FF]">
              Exploração Panorâmica por Território
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
              Panorama dos 6 Ecossistemas Pedagógicos
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-pretty">
              Passe o mouse ou toque nas lâminas para expandir o panorama de cada território.
            </p>
            <Link
              href="/projetos"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004A99] dark:text-[#00D8FF] hover:underline whitespace-nowrap self-start sm:self-auto touch-manipulation select-none active:scale-[0.97] transition-transform duration-150 ease-out"
            >
              <span>Ver painel de projetos completo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* LÂMINAS EXPANSÍVEIS HORIZONTAIS (ACCORDION DECK) */}
        <div className="flex flex-col lg:flex-row gap-3 min-h-[460px] lg:h-[440px] w-full">
          {PROJECTS_DATA.map((proj) => {
            const isHovered = hoveredId === proj.id;

            return (
              <div
                key={proj.id}
                onMouseEnter={() => setHoveredId(proj.id)}
                onClick={() => setHoveredId(proj.id)}
                className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out flex flex-col justify-between p-6 touch-manipulation select-none ${
                  isHovered
                    ? 'lg:flex-[3.5] min-h-[340px] lg:min-h-0 ring-2 ring-[#004A99] dark:ring-[#00D8FF] shadow-2xl'
                    : 'lg:flex-[0.8] min-h-[90px] lg:min-h-0 bg-slate-900/90 hover:brightness-110 active:scale-[0.99]'
                }`}
              >
                {/* Imagem de Fundo em Alta Resolução */}
                <img
                  src={proj.image}
                  alt={proj.title}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out pointer-events-none ${
                    isHovered ? 'scale-105 filter-none' : 'scale-100 brightness-60'
                  }`}
                />

                {/* Gradiente de Contraste Fixo para Garantir Texto 100% Branco */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/20 pointer-events-none" />

                {/* Conteúdo da Lâmina Expandida */}
                {isHovered ? (
                  <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                    
                    {/* Topo da Lâmina */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#00D8FF] border border-[#00D8FF]/40 tabular-nums">
                        {proj.missionCode} • {proj.typology}
                      </span>
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black">
                        PROJETO ATIVO
                      </span>
                    </div>

                    {/* Meio / Rodapé da Lâmina */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#00D8FF]" />
                          {proj.territory}
                        </span>
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight text-balance">
                          {proj.title}
                        </h3>
                      </div>

                      {/* Citação do Professor Mediador */}
                      <p className="text-xs sm:text-[13px] italic text-slate-100 leading-relaxed bg-black/50 backdrop-blur-md p-3.5 rounded-xl border border-white/15 text-pretty">
                        &ldquo;{proj.quote}&rdquo;
                      </p>

                      {/* Ações e Identificação */}
                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-[11px] font-mono text-slate-300">
                          {proj.school} • {proj.mediatorName}
                        </span>

                        <Link
                          href="/projetos"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-[#00D8FF] transition-all duration-150 ease-out text-xs font-bold cursor-pointer shadow-md shrink-0 whitespace-nowrap touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-300"
                        >
                          <span>Inspecionar no Palco</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Conteúdo da Lâmina Recolhida */
                  <div className="relative z-10 flex lg:flex-col justify-between items-center h-full w-full">
                    
                    {/* Número Gigante Vertical */}
                    <span className="font-mono text-2xl lg:text-3xl font-black text-white/50 tabular-nums">
                      {proj.number}
                    </span>

                    {/* Título Vertical Compacto (Desktop) / Linha Horizontal (Mobile) */}
                    <div className="lg:[writing-mode:vertical-lr] lg:rotate-180 flex items-center gap-2">
                      <span className="font-mono text-[10px] tracking-widest text-[#00D8FF] font-bold">
                        {proj.municipality.toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-white truncate max-w-[140px] lg:max-w-[200px]">
                        {proj.shortTitle}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-white/40 hidden lg:block">
                      EXPANDIR +
                    </span>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
