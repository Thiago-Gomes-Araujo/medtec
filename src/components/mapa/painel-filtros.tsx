'use client';

import React from 'react';
import { FiltrosMapa } from './types';
import { Search, X } from 'lucide-react';
import { sanitizeSearchInput } from '@/lib/security';

interface PainelFiltrosProps {
  filtros: FiltrosMapa;
  onFiltrosChange: (novosFiltros: FiltrosMapa) => void;
  totalResultados: number;
  municipios?: string[];
}

export function PainelFiltros({
  filtros,
  onFiltrosChange,
  totalResultados,
  municipios = [],
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filtros.busca || ''}
            onChange={(e) => setBusca(sanitizeSearchInput(e.target.value))}
            maxLength={100}
            placeholder="Buscar por escola, comunidade ou polo..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-[#004A99] dark:focus:border-sky-500 focus:outline-hidden transition-colors"
          />
          {filtros.busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Mostrando <strong className="text-slate-900 dark:text-white">{totalResultados}</strong> unidades
          </span>
          {isFiltrado && (
            <button
              onClick={resetarFiltros}
              className="inline-flex items-center gap-1 text-xs text-[#004A99] dark:text-sky-400 hover:underline cursor-pointer"
            >
              <span>Limpar filtros</span>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* FILTRO 1: MUNICÍPIOS */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Município ou Polo Regional
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setMunicipio('Todos')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              filtros.municipio === 'Todos'
                ? 'border border-[#004A99] dark:border-sky-500 bg-[#004A99] dark:bg-sky-600 text-white font-semibold shadow-xs'
                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos ({municipios.length > 0 ? municipios.length : 52})
          </button>
          {municipios.map((m) => {
            const isSelected = filtros.municipio === m;
            return (
              <button
                key={m}
                onClick={() => setMunicipio(m)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border border-[#004A99] dark:border-sky-500 bg-[#004A99] dark:bg-sky-600 text-white font-semibold shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m}
              </button>
            );
          })}
          <span className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            +46 municípios
          </span>
        </div>
      </div>

      {/* FILTRO 2: TIPOLOGIA DE COMUNIDADE */}
      <div>
        <span className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Tipologia de Comunidade
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'todas', label: 'Todas', dotColor: 'bg-slate-400' },
            { id: 'urbana', label: 'Urbana', dotColor: 'bg-sky-500' },
            { id: 'rural', label: 'Rural', dotColor: 'bg-amber-500' },
            { id: 'ribeirinha', label: 'Ribeirinha', dotColor: 'bg-blue-500' },
            { id: 'indígena', label: 'Indígena / Quilombola', dotColor: 'bg-emerald-500' },
          ].map((item) => {
            const isSelected = filtros.tipo === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTipo(item.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border border-[#004A99] dark:border-sky-500 bg-[#004A99] dark:bg-sky-600 text-white font-semibold shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${item.dotColor}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
