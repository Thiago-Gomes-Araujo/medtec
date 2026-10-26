'use client';

import React from 'react';
import { municipiosList } from '@/data/medtecData';
import { FiltrosMapa } from './types';
import { Search, X } from 'lucide-react';
import { sanitizeSearchInput } from '@/lib/security';

interface PainelFiltrosProps {
  filtros: FiltrosMapa;
  onFiltrosChange: (novosFiltros: FiltrosMapa) => void;
  totalResultados: number;
}

export function PainelFiltros({
  filtros,
  onFiltrosChange,
  totalResultados,
}: PainelFiltrosProps) {
  const setMunicipio = (municipio: string) => {
    onFiltrosChange({ ...filtros, municipio });
  };

  const setTipo = (tipo: string) => {
    onFiltrosChange({ ...filtros, tipo });
  };

  const setBusca = (busca: string) => {
    onFiltrosChange({ ...filtros, busca });
  };

  const resetarFiltros = () => {
    onFiltrosChange({ municipio: 'Todos', tipo: 'todas', busca: '' });
  };

  const isFiltrado =
    filtros.municipio !== 'Todos' ||
    filtros.tipo !== 'todas' ||
    Boolean(filtros.busca);

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR: BUSCA RÁPIDA & RESET */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6482A6]" />
          <input
            type="text"
            value={filtros.busca || ''}
            onChange={(e) => setBusca(sanitizeSearchInput(e.target.value))}
            maxLength={100}
            placeholder="Buscar por escola, comunidade ou polo..."
            className="w-full rounded-lg border border-[#1A365D] bg-[#061224]/90 pl-9 pr-8 py-1.5 text-xs font-mono text-[#E6F4FF] placeholder-[#6482A6] focus:border-[#00D8FF] focus:outline-none transition-colors"
          />
          {filtros.busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono">
          <span className="text-[#6482A6]">
            Mostrando <strong className="text-[#00D8FF]">{totalResultados}</strong> pontos
          </span>
          {isFiltrado && (
            <button
              onClick={resetarFiltros}
              className="inline-flex items-center gap-1 text-[11px] text-[#00D8FF] hover:underline cursor-pointer active:scale-95 transition-transform"
            >
              <span>Resetar filtros</span>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* FILTRO 1: PÍLULAS DE MUNICÍPIOS */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6482A6] font-semibold">
            01 • Polo Regional
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setMunicipio('Todos')}
            className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
              filtros.municipio === 'Todos'
                ? 'border border-[#00D8FF] bg-[#0C1E38] text-[#00D8FF] shadow-[0_0_14px_rgba(0,216,255,0.25)]'
                : 'border border-[#1A365D] bg-[#061224]/80 text-slate-300 hover:border-slate-500 hover:text-white'
            }`}
          >
            Todos (52)
          </button>
          {municipiosList.map((m) => {
            const isSelected = filtros.municipio === m;
            return (
              <button
                key={m}
                onClick={() => setMunicipio(m)}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border border-[#00D8FF] bg-[#0C1E38] text-[#00D8FF] shadow-[0_0_14px_rgba(0,216,255,0.25)]'
                    : 'border border-[#1A365D] bg-[#061224]/80 text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                {m}
              </button>
            );
          })}
          <span className="rounded-lg border border-dashed border-[#1A365D] px-2 py-1.5 text-[11px] font-mono text-slate-500">
            +46 municípios
          </span>
        </div>
      </div>

      {/* FILTRO 2: TIPOLOGIA DE COMUNIDADE COM CORES SEMÂNTICAS */}
      <div>
        <span className="mb-1.5 block text-[10px] font-mono uppercase tracking-wider text-[#6482A6] font-semibold">
          02 • Tipologia de Comunidade
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'todas', label: 'TODAS', dotColor: 'bg-white' },
            { id: 'urbana', label: 'URBANA', dotColor: 'bg-[#00D8FF]' },
            { id: 'rural', label: 'RURAL', dotColor: 'bg-amber-400' },
            { id: 'ribeirinha', label: 'RIBEIRINHA', dotColor: 'bg-sky-400' },
            { id: 'indígena', label: 'INDÍGENA / QUILOMBOLA', dotColor: 'bg-[#10B981]' },
          ].map((item) => {
            const isSelected = filtros.tipo === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTipo(item.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'border border-[#00D8FF] bg-[#0C1E38] text-white font-semibold shadow-[0_0_12px_rgba(0,216,255,0.2)]'
                    : 'border border-[#1A365D] bg-[#061224]/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${item.dotColor} ${
                    isSelected ? 'animate-ping' : ''
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
