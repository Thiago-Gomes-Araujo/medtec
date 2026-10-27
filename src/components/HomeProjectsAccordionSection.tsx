'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProjectMission } from '@/types';
import { MapPin, ArrowUpRight, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function HomeProjectsAccordionSection() {
  const [projects, setProjects] = useState<ProjectMission[]>([]);
  const [hoveredId, setHoveredId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      setLoading(true);
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const list: ProjectMission[] = data.items || [];
            setProjects(list);
            if (list.length > 0) {
              setHoveredId(list[list.length - 1]?.id || list[0]?.id || '');
            }
          }
        }
      } catch (err) {
        console.error('Falha ao carregar projetos da API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="projetos-ecossistemas" className="relative scroll-mt-20 py-20 sm:py-28 bg-[#F0F4F8] dark:bg-[#040B16] transition-colors duration-200 border-t border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Cabeçalho Editorial da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#004A99] dark:text-sky-400">
              Projetos Pedagógicos nas Escolas de Rondônia
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight text-balance">
              Panorama das Atividades Pedagógicas por Município
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
        {loading ? (
          <div className="flex flex-col lg:flex-row gap-2.5 min-h-[390px] w-full animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex-1 min-h-[80px] lg:min-h-0 rounded-xl bg-slate-200 dark:bg-slate-800/80 p-5"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-[#1A365D] p-12 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              Nenhum projeto pedagógico cadastrado
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Os projetos pedagógicos serão exibidos aqui assim que registrados na API oficial.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-2.5 min-h-[400px] lg:h-[390px] w-full">
            {projects.map((proj) => {
              const isHovered = hoveredId === proj.id;

              return (
                <div
                  key={proj.id}
                  onMouseEnter={() => setHoveredId(proj.id)}
                  onClick={() => setHoveredId(proj.id)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ease-out flex flex-col justify-between p-4 sm:p-5 touch-manipulation select-none ${
                    isHovered
                      ? 'lg:flex-[3.5] min-h-[320px] lg:min-h-0 ring-2 ring-[#004A99] dark:ring-[#00D8FF] shadow-xl'
                      : 'lg:flex-[0.8] min-h-[80px] lg:min-h-0 bg-slate-900/90 hover:brightness-110 active:scale-[0.99]'
                  }`}
                >
                {/* Imagem de Fundo em Alta Resolução */}
                <img
                  src={proj.image}
                  alt={proj.title}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 pointer-events-none ${
                    isHovered ? 'opacity-100 filter-none' : 'opacity-80 brightness-75'
                  }`}
                />

                {/* Gradiente de Contraste Fixo para Garantir Texto 100% Branco */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/20 pointer-events-none" />

                {/* Conteúdo da Lâmina Expandida */}
                {isHovered ? (
                  <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                    
                    {/* Topo da Lâmina */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {proj.typology}
                      </span>
                    </div>

                    {/* Meio / Rodapé da Lâmina */}
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-300 flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3 text-sky-400" />
                          {proj.territory}
                        </span>
                        <h3 className="font-display text-base sm:text-lg font-bold text-white leading-snug text-balance">
                          {proj.title}
                        </h3>
                      </div>

                      {/* Orientação Pedagógica */}
                      <p className="text-xs text-slate-200 leading-relaxed bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/10 line-clamp-2">
                        {proj.quote}
                      </p>

                      {/* Ações e Identificação */}
                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-300 truncate">
                          {proj.school} • {proj.mediatorName}
                        </span>

                        <Link
                          href="/projetos"
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-950 hover:bg-[#00D8FF] transition-all duration-150 ease-out text-xs font-bold cursor-pointer shadow-sm shrink-0 whitespace-nowrap touch-manipulation select-none active:scale-[0.97]"
                        >
                          <span>Ver detalhes</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Conteúdo da Lâmina Recolhida */
                  <div className="relative z-10 flex lg:flex-col justify-between items-center h-full w-full">
                    
                    {/* Número Compacto Vertical */}
                    <span className="text-xl lg:text-2xl font-black text-white/50 tabular-nums">
                      {proj.number}
                    </span>

                    {/* Título Vertical Compacto (Desktop) / Linha Horizontal (Mobile) */}
                    <div className="lg:[writing-mode:vertical-lr] lg:rotate-180 flex items-center gap-2">
                      <span className="text-[10px] tracking-wider text-sky-300 font-bold uppercase">
                        {proj.municipality}
                      </span>
                      <span className="text-xs font-semibold text-white truncate max-w-[140px] lg:max-w-[180px]">
                        {proj.shortTitle}
                      </span>
                    </div>

                    <span className="text-[10px] text-white/40 hidden lg:block">
                      +
                    </span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
        )}

      </div>
    </section>
  );
}
