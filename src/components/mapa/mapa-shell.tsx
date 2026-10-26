'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useBuscaMapa } from './use-busca-mapa';
import { PainelFiltros } from './painel-filtros';
import { PainelLista } from './painel-lista';
import { Radio, Satellite } from 'lucide-react';

// Carregamento dinâmico estritamente sem SSR para evitar erro com window do Leaflet (Regra 4 do guia)
const MapaCanvas = dynamic(
  () => import('./mapa-canvas').then((m) => m.MapaCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex h-full min-h-[520px] w-full flex-col items-center justify-center rounded-xl border border-[#1A365D] bg-[#020710] p-8 text-center font-mono">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#00D8FF] bg-[#0C1E38] shadow-[0_0_24px_rgba(0,216,255,0.3)]">
          <Satellite className="h-6 w-6 animate-spin text-[#00D8FF]" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#00D8FF]">
          Inicializando Canvas Leaflet...
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Carregando malha cartográfica e coordenadas de Rondônia
        </p>
      </div>
    ),
  }
);

export function MapaShell() {
  const {
    filtros,
    setFiltros,
    pontos,
    selectedId,
    setSelectedId,
    hoveredId,
    setHoveredId,
    pontoSelecionado,
    rotaAtiva,
    estatisticas,
    hubCoordenadas,
  } = useBuscaMapa();

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DO MAPA */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
          <div className="flex items-center gap-2 text-[#004A99] dark:text-sky-400">
            <Radio className="h-4 w-4" />
            <span className="font-semibold">
              Mapa das Comunidades Atendidas
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Conexão Satelital Operacional
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              Rede Estadual de Ensino de Rondônia
            </span>
          </div>
        </div>

        {/* FILTROS DUPLOS E PESQUISA */}
        <PainelFiltros
          filtros={filtros}
          onFiltrosChange={setFiltros}
          totalResultados={pontos.length}
        />
      </div>

      {/* ========================================================
          GRID SPLIT: CANVAS LEAFLET (ESQUERDA) + LISTA SINCRONIZADA (DIREITA)
      ======================================================== */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] items-start">
        {/* COLUNA ESQUERDA: CANVAS LEAFLET */}
        <div className="h-[580px] sm:h-[640px] w-full sticky top-4">
          <MapaCanvas
            pontos={pontos}
            hubCoordenadas={hubCoordenadas}
            selectedId={selectedId}
            hoveredId={hoveredId}
            pontoSelecionado={pontoSelecionado}
            rotaAtiva={rotaAtiva}
            onSelect={setSelectedId}
            onHover={setHoveredId}
          />
        </div>

        {/* COLUNA DIREITA: KPIS + CARDS DE ESCOLAS SINCRONIZADOS */}
        <div className="w-full">
          <PainelLista
            pontos={pontos}
            estatisticas={estatisticas}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={setSelectedId}
            onHover={setHoveredId}
            municipioAtual={filtros.municipio}
          />
        </div>
      </div>
    </div>
  );
}
