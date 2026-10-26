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
  ArrowRight,
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
          <p className="mt-1 font-display text-[28px] sm:text-[36px] font-medium leading-tight text-[#E6F4FF]">
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
          <p className="mt-1 font-display text-[28px] sm:text-[36px] font-medium leading-tight text-[#E6F4FF]">
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
          <p className="mt-1 font-display text-[28px] sm:text-[36px] font-medium leading-tight text-[#E6F4FF]">
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
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Unidades Escolares: {municipioAtual} ({pontos.length})
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            Clique para centralizar no mapa
          </span>
        </div>

        {/* Lista com scroll estilizado */}
        <div className="max-h-[560px] overflow-y-auto space-y-3 pr-1">
          {pontos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 text-center text-sm text-slate-500">
              <Satellite className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
              Nenhuma unidade escolar encontrada com os filtros selecionados.
            </div>
          ) : (
            pontos.map((ponto) => {
              const isSelected = selectedId === ponto.id;
              const isHovered = hoveredId === ponto.id;
              const isAtivo = isSelected || isHovered;

              // Cores da tag de modalidade
              let modalidadeBadge = 'border-sky-500/30 bg-sky-950/40 text-sky-300';
              if (ponto.tipo === 'ribeirinha')
                modalidadeBadge = 'border-blue-500/30 bg-blue-950/40 text-blue-300';
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
                  className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
                    isAtivo
                      ? 'border-[#004A99] dark:border-sky-500 bg-sky-50/50 dark:bg-slate-800/80 shadow-xs translate-x-0.5'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Marcador Lateral */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-[#004A99] dark:bg-sky-500 transition-opacity ${
                      isAtivo ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* CABEÇALHO DO CARD (1 Badge no Topo) */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition-colors truncate">
                        {ponto.nome}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span>{ponto.municipio}</span>
                        {ponto.comunidade && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-slate-400 truncate">
                              {ponto.comunidade}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 1 BADGE DA TIPOLOGIA NO TOPO */}
                    <span
                      className={`shrink-0 rounded-md border px-2.5 py-0.5 text-xs font-medium ${modalidadeBadge}`}
                    >
                      {ponto.tipo}
                    </span>
                  </div>

                  {/* DIVISÓRIA */}
                  <div className="my-2.5 border-t border-slate-100 dark:border-slate-800" />

                  {/* LINHA DE MÉTRICAS & LINK VER NO MAPA */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                        {ponto.turmas} turmas
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                        {ponto.alunos} alunos
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-[#004A99] dark:text-sky-400 group-hover:underline inline-flex items-center gap-1 shrink-0">
                      Ver no mapa <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  {/* LINHA DISCRETA DO MEDIADOR */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">
                      Mediador: <strong className="text-slate-700 dark:text-slate-300 font-medium">{ponto.mediador}</strong>
                    </span>
                    {ponto.distanciaKm !== undefined && (
                      <span className="shrink-0 text-[11px] text-slate-400">
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
