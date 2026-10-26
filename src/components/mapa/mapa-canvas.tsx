'use client';

import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';

import { PontoMapa, Coordenada, RotaResposta } from './types';
import { getPontoIcone, criarClusterIcone } from './icones';
import { Radio, Signal, Users, BookOpen, MapPin, GraduationCap } from 'lucide-react';

interface MapaCanvasProps {
  pontos: PontoMapa[];
  hubCoordenadas: Coordenada;
  selectedId: string | number | null;
  hoveredId: string | number | null;
  pontoSelecionado: PontoMapa | null;
  rotaAtiva: RotaResposta | null;
  onSelect: (id: string | number) => void;
  onHover: (id: string | number | null) => void;
}

/**
 * Controlador de Câmera e Zoom reativo via hook useMap() do Leaflet
 */
function MapViewController({
  pontoSelecionado,
  pontos,
}: {
  pontoSelecionado: PontoMapa | null;
  pontos: PontoMapa[];
}) {
  const map = useMap();
  const prevPontoIdRef = useRef<string | number | null>(null);

  // Invalida tamanho ao carregar para evitar tiles cinzas
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  // Voo suave até o ponto selecionado
  useEffect(() => {
    if (pontoSelecionado && pontoSelecionado.id !== prevPontoIdRef.current) {
      prevPontoIdRef.current = pontoSelecionado.id;
      map.flyTo(
        [pontoSelecionado.latitude, pontoSelecionado.longitude],
        Math.max(map.getZoom(), 11),
        {
          duration: 1.2,
          easeLinearity: 0.25,
        }
      );
    }
  }, [map, pontoSelecionado]);

  // Ajusta visão geral (flyToBounds) caso a lista mude drasticamente e não haja seleção individual
  useEffect(() => {
    if (pontos.length > 0 && !pontoSelecionado) {
      const bounds = L.latLngBounds(
        pontos.map((p) => [p.latitude, p.longitude] as [number, number])
      );
      map.flyToBounds(bounds, {
        padding: [40, 40],
        maxZoom: 10,
        duration: 1.0,
      });
    }
  }, [map, pontos, pontoSelecionado]);

  return null;
}

export function MapaCanvas({
  pontos,
  hubCoordenadas,
  selectedId,
  hoveredId,
  pontoSelecionado,
  rotaAtiva,
  onSelect,
  onHover,
}: MapaCanvasProps) {
  // Centro inicial de Rondônia
  const centroInicial: Coordenada = [-10.8, -62.8];
  const zoomInicial = 7;

  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const tileAttribution =
    process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-[#1A365D] bg-[#020710] shadow-inner select-none">
      
      {/* Retículas HUD nos quatro cantos */}
      <div className="pointer-events-none absolute left-3 top-3 z-[400] h-3.5 w-3.5 border-l-2 border-t-2 border-[#00D8FF]/70" />
      <div className="pointer-events-none absolute right-3 top-3 z-[400] h-3.5 w-3.5 border-r-2 border-t-2 border-[#00D8FF]/70" />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] h-3.5 w-3.5 border-b-2 border-l-2 border-[#00D8FF]/70" />
      <div className="pointer-events-none absolute bottom-3 right-3 z-[400] h-3.5 w-3.5 border-b-2 border-r-2 border-[#00D8FF]/70" />

      {/* Régua e Telemetria Superior Flutuante */}
      <div className="pointer-events-none absolute left-3 top-2.5 z-[400] flex items-center gap-2 font-mono text-[10px] text-[#00D8FF] bg-[#0C1E38]/85 px-2.5 py-1 rounded border border-[#1A365D] backdrop-blur-sm">
        <Radio className="h-3 w-3 animate-pulse text-[#F43F5E]" />
        <span className="font-bold tracking-wider">Canvas Cartográfico • Sinal Ativo</span>
        <span className="text-[#1A365D]">|</span>
        <span className="text-slate-300">RONDÔNIA</span>
      </div>

      <div className="pointer-events-none absolute right-3 top-2.5 z-[400] hidden sm:flex items-center gap-2 font-mono text-[9px] text-[#6482A6] bg-[#0C1E38]/85 px-2.5 py-1 rounded border border-[#1A365D] backdrop-blur-sm">
        <span>DATUM: SIRGAS 2000</span>
        <span className="text-[#1A365D]">•</span>
        <span className="text-emerald-400">100% SÍNCRONO</span>
      </div>

      {/* CONTAINER PRINCIPAL DO LEAFLET */}
      <MapContainer
        center={centroInicial}
        zoom={zoomInicial}
        minZoom={6}
        maxZoom={16}
        scrollWheelZoom={true}
        className="h-full w-full z-10 font-sans"
        style={{ minHeight: '520px', background: '#020710' }}
      >
        <TileLayer
          url={tileUrl}
          attribution={tileAttribution}
          maxZoom={19}
          subdomains={['a', 'b', 'c', 'd']}
        />

        {/* Gerenciador de eventos de câmera */}
        <MapViewController
          pontoSelecionado={pontoSelecionado}
          pontos={pontos}
        />

        {/* ========================================================
            TRAÇADO DE ROTA / UPLINK SATELITAL EMITIDO DO HUB
        ======================================================== */}
        {rotaAtiva && rotaAtiva.coordenadas.length > 0 && (
          <Polyline
            positions={rotaAtiva.coordenadas}
            pathOptions={{
              color: '#00D8FF',
              weight: 3.5,
              opacity: 0.9,
              dashArray: rotaAtiva.modo === 'direto' ? '8, 8' : undefined,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* ========================================================
            PIN DO HUB CENTRAL: ESTÚDIO EMISSOR SEDUC EM PORTO VELHO
        ======================================================== */}
        <Marker
          position={hubCoordenadas}
          icon={getPontoIcone({ tipo: 'hub', isSelected: false })}
        >
          <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
            <span className="font-mono text-xs font-bold text-[#F43F5E]">
              Hub SEDUC • Estúdio Central PVH
            </span>
          </Tooltip>
          <Popup className="medtec-popup">
            <div className="p-2 space-y-2 font-mono text-xs text-[#E6F4FF]">
              <div className="flex items-center gap-1.5 text-[#F43F5E] font-bold border-b border-[#1A365D] pb-1">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>Hub Emissor Central • SEDUC</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Estúdio Principal de Transmissão de Aulas ao Vivo via Satélite (Banda Ku).
              </p>
              <div className="text-[10px] text-[#6482A6]">
                Porto Velho, Rondônia • Lat: -8.7619, Lon: -63.9039
              </div>
            </div>
          </Popup>
        </Marker>

        {/* ========================================================
            AGRUPAMENTO DE MARCADORES (MARKER CLUSTER GROUP)
        ======================================================== */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={criarClusterIcone}
          maxClusterRadius={45}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {pontos.map((ponto) => {
            const isSelected = selectedId === ponto.id;
            const isHovered = hoveredId === ponto.id;
            const icone = getPontoIcone({
              tipo: ponto.tipo,
              isSelected,
              isHovered,
            });

            return (
              <Marker
                key={ponto.id}
                position={[ponto.latitude, ponto.longitude]}
                icon={icone}
                eventHandlers={{
                  click: () => onSelect(ponto.id),
                  mouseover: () => onHover(ponto.id),
                  mouseout: () => onHover(null),
                }}
              >
                <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                  <div className="font-mono text-xs">
                    <span className="font-bold text-[#00D8FF]">{ponto.nome}</span>
                    <span className="block text-[10px] text-slate-400">
                      {ponto.municipio} {ponto.comunidade ? `• ${ponto.comunidade}` : ''}
                    </span>
                  </div>
                </Tooltip>

                <Popup className="medtec-popup">
                  <div className="p-3 space-y-2.5 font-mono text-xs text-[#E6F4FF] min-w-[240px]">
                    {/* Cabeçalho do Popup */}
                    <div className="border-b border-[#1A365D] pb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-[#00D8FF] font-bold">
                        [ {ponto.tipo.toUpperCase()} • {ponto.conexao} ]
                      </span>
                      <h4 className="font-bold text-sm text-white mt-0.5 leading-snug">
                        {ponto.nome}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6482A6] mt-0.5">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        <span>{ponto.municipio}</span>
                        {ponto.comunidade && <span>• {ponto.comunidade}</span>}
                      </div>
                    </div>

                    {/* Métricas rápidas */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#061224]/80 p-2 rounded border border-[#1A365D]/60">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <BookOpen className="h-3 w-3 text-[#00D8FF]" />
                        <span>{ponto.turmas} turmas</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Users className="h-3 w-3 text-sky-400" />
                        <span>{ponto.alunos} alunos</span>
                      </div>
                    </div>

                    {/* Mediador e Sinal */}
                    <div className="text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Signal className="h-3 w-3" />
                        <span>{ponto.statusSinal || 'Sinal Síncrono Ativo'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 truncate">
                        <GraduationCap className="h-3 w-3 text-[#6482A6]" />
                        <span>Mediador: {ponto.mediador}</span>
                      </div>
                    </div>

                    {/* Botão de Centralizar / Foco */}
                    <button
                      onClick={() => onSelect(ponto.id)}
                      className="w-full mt-2 rounded bg-[#0F2647] hover:bg-[#1A365D] py-1 text-center text-[10px] text-[#00D8FF] font-bold uppercase tracking-wider border border-[#00D8FF]/40 cursor-pointer"
                    >
                      Selecionar Unidade
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* RODAPÉ TÉCNICO INTERNO DO MAPA */}
      <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[#1A365D] bg-[#040B16]/90 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-medium">BANDA KU OPERACIONAL</span>
          <span className="text-[#1A365D] hidden md:inline">|</span>
          <span className="text-[#6482A6] hidden md:inline">
            {pontos.length} PONTOS RASTERIZADOS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#F43F5E]" />
            <span>Hub</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#00D8FF]" />
            <span>Urbana</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
            <span>Ribeirinha</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span>Indígena</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            <span>Rural</span>
          </div>
        </div>
      </div>
    </div>
  );
}
