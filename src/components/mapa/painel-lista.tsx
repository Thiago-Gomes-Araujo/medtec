'use client';

import React from 'react';
import { PontoMapa, EstatisticasMapa } from './types';
import {
  Satellite,
  Users,
  BookOpen,
  MapPin,
  Signal,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PainelListaProps {
  pontos: PontoMapa[];
  estatisticas: EstatisticasMapa;
  selectedId: string | number | null;
  hoveredId: string | number | null;
  onSelect: (id: string | number) => void;
  onHover: (id: string | number | null) => void;
  municipioAtual: string;
}

export function PainelLista({
  pontos,
  estatisticas,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  municipioAtual,
}: PainelListaProps) {
  return (
    <div className="space-y-4 flex flex-col justify-between h-full">
      {/* ================= 1. PAINEL DE KPIS DINÂMICOS (3 MÓDULOS) ================= */}
      <div className="grid grid-cols-3 gap-3">
        {/* KPI 1: Escolas */}
        <div className="rounded-xl border border-[#1A365D] bg-[#0C1E38] p-3.5 sm:p-4 transition-all hover:border-[#00D8FF]/40">
          <span className="block text-[11px] sm:text-[12px] uppercase font-mono tracking-wider text-[#6482A6]">
            Escolas
          </span>
          <p className="mt-1 font-display text-[28px] sm:text-[36px] font-medium leading-[0.9] text-[#E6F4FF]">
            {estatisticas.totalEscolas}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>100% ativas</span>
          </div>
        </div>

        {/* KPI 2: Turmas */}
        <div className="rounded-xl border border-[#1A365D] bg-[#0C1E38] p-3.5 sm:p-4 transition-all hover:border-[#00D8FF]/40">
          <span className="block text-[11px] sm:text-[12px] uppercase font-mono tracking-wider text-[#6482A6]">
            Turmas
          </span>
          <p className="mt-1 font-display text-[28px] sm:text-[36px] font-medium leading-[0.9] text-[#E6F4FF]">
            {estatisticas.turmas}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-cyan-400">
            <Signal className="h-3 w-3" />
            <span>Síncronas</span>
          </div>
        </div>

        {/* KPI 3: Estudantes */}
        <div className="rounded-xl border border-[#1A365D] bg-[#0C1E38] p-3.5 sm:p-4 transition-all hover:border-[#00D8FF]/40">
          <span className="block text-[11px] sm:text-[12px] uppercase font-mono tracking-wider text-[#6482A6]">
            Alunos
          </span>
          <p className="mt-1 font-display text-[28px] sm:text-[36px] font-medium leading-[0.9] text-[#E6F4FF]">
            {estatisticas.alunos}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-sky-400">
            <Users className="h-3 w-3" />
            <span>Matriculados</span>
          </div>
        </div>
      </div>

      {/* ================= 2. CARDS DE UNIDADES ESCOLARES (HOVER & CLICK SYNC) ================= */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-mono uppercase tracking-wider text-[#6482A6]">
            UNIDADES ESCOLARES // {municipioAtual.toUpperCase()} ({pontos.length})
          </p>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            Clique para centralizar no mapa
          </span>
        </div>

        {/* Lista com scroll estilizado */}
        <div className="max-h-[560px] overflow-y-auto space-y-3 pr-1">
          {pontos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1A365D] bg-[#0C1E38]/50 p-8 text-center text-sm font-mono text-slate-400">
              <Satellite className="mx-auto h-8 w-8 text-[#1A365D] mb-2" />
              Nenhuma unidade escolar encontrada com os filtros selecionados.
            </div>
          ) : (
            pontos.map((ponto) => {
              const isSelected = selectedId === ponto.id;
              const isHovered = hoveredId === ponto.id;
              const isAtivo = isSelected || isHovered;

              // Cores da tag de modalidade
              let modalidadeBadge = 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300';
              if (ponto.tipo === 'ribeirinha')
                modalidadeBadge = 'border-sky-500/30 bg-sky-950/40 text-sky-300';
              if (ponto.tipo === 'indígena')
                modalidadeBadge = 'border-teal-500/30 bg-teal-950/40 text-teal-300';
              if (ponto.tipo === 'rural')
                modalidadeBadge = 'border-amber-500/30 bg-amber-950/40 text-amber-300';

              return (
                <motion.div
                  key={ponto.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  onMouseEnter={() => onHover(ponto.id)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelect(ponto.id)}
                  className={`group relative rounded-[12px] border p-4 transition-all cursor-pointer ${
                    isAtivo
                      ? 'border-[#00D8FF] bg-[#0F2647] shadow-[0_0_20px_rgba(0,216,255,0.18)] translate-x-0.5'
                      : 'border-[#1A365D] bg-[#0C1E38] hover:border-[#00D8FF]/70'
                  }`}
                >
                  {/* Marcador Luminoso Lateral */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[12px] bg-[#00D8FF] transition-opacity ${
                      isAtivo ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* CABEÇALHO DO CARD */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-mono text-sm uppercase font-semibold text-[#E6F4FF] leading-snug group-hover:text-[#00D8FF] transition-colors truncate">
                        {ponto.nome}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[#6482A6] font-mono">
                        <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                        <span>{ponto.municipio}</span>
                        {ponto.comunidade && (
                          <>
                            <span className="text-[#1A365D]">•</span>
                            <span className="text-slate-400 truncate">
                              {ponto.comunidade}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* BADGES */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold ${modalidadeBadge}`}
                      >
                        {ponto.tipo}
                      </span>
                      <span className="rounded-full border border-[#1A365D] bg-[#061224] px-2 py-0.5 text-[10px] font-mono text-cyan-200">
                        {ponto.conexao}
                      </span>
                    </div>
                  </div>

                  {/* DIVISÓRIA 1PX DASHED */}
                  <div className="my-2.5 border-t border-dashed border-[#1A365D]" />

                  {/* MÉTRICAS */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-[#00D8FF]" />
                      <span>{ponto.turmas} turmas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-sky-400" />
                      <span>{ponto.alunos} alunos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Signal className="h-3.5 w-3.5" />
                      <span>{ponto.statusSinal || 'Sinal 99.8%'}</span>
                    </div>
                  </div>

                  {/* RODAPÉ DO CARD */}
                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-[#061224]/80 px-2.5 py-1.5 border border-[#1A365D]/60 text-xs font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-300 truncate">
                        <span className="text-slate-500">Mediador:</span>{' '}
                        {ponto.mediador}
                      </span>
                    </div>
                    {ponto.distanciaKm !== undefined && (
                      <span className="text-[10px] text-[#6482A6] shrink-0 font-semibold pl-2">
                        {ponto.distanciaKm} km
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
