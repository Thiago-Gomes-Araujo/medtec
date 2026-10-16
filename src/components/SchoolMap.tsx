'use client';

import React, { useState, useMemo } from 'react';
import { 
  Satellite, 
  Users, 
  BookOpen, 
  Radio, 
  MapPin, 
  Signal, 
  CheckCircle2, 
  GraduationCap 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { escolasData, Escola, municipiosList } from '@/data/medtecData';

// Definição dos nós cartográficos reais de telemetria no SVG (viewBox: 0 0 760 580)
interface TelemetryNode {
  id: string;
  name: string;
  label: string;
  municipio: string;
  x: number;
  y: number;
  lat: string;
  lon: string;
  distanciaKm: number;
  tipo: 'hub' | 'urbana' | 'rural' | 'ribeirinha' | 'indígena';
  descricao: string;
}

const TELEMETRY_NODES: TelemetryNode[] = [
  {
    id: 'porto-velho',
    name: 'Porto Velho',
    label: 'ESTÚDIO SEDUC',
    municipio: 'Porto Velho',
    x: 325,
    y: 122,
    lat: '-8.76° S',
    lon: '-63.90° W',
    distanciaKm: 0,
    tipo: 'hub',
    descricao: 'HUB EMISSOR CENTRAL // ESTÚDIO SEDUC'
  },
  {
    id: 'calama-nazare',
    name: 'Calama / Nazaré',
    label: 'BAIXO MADEIRA',
    municipio: 'Porto Velho',
    x: 420,
    y: 63,
    lat: '-8.03° S',
    lon: '-62.86° W',
    distanciaKm: 135,
    tipo: 'ribeirinha',
    descricao: 'CALHA DO BAIXO MADEIRA // DISTRITO FLUVIAL'
  },
  {
    id: 'sao-carlos',
    name: 'São Carlos',
    label: 'RIO JAMARI/MADEIRA',
    municipio: 'Porto Velho',
    x: 370,
    y: 90,
    lat: '-8.45° S',
    lon: '-63.50° W',
    distanciaKm: 90,
    tipo: 'ribeirinha',
    descricao: 'EXTENSÃO FLUVIAL SÃO CARLOS'
  },
  {
    id: 'ariquemes',
    name: 'Ariquemes',
    label: 'VALE DO JAMARI',
    municipio: 'Ariquemes',
    x: 404,
    y: 214,
    lat: '-9.91° S',
    lon: '-63.04° W',
    distanciaKm: 200,
    tipo: 'urbana',
    descricao: 'POLO VALE DO JAMARI // EIXO BR-364'
  },
  {
    id: 'ji-parana',
    name: 'Ji-Paraná',
    label: 'POLO CENTRAL',
    municipio: 'Ji-Paraná',
    x: 504,
    y: 292,
    lat: '-10.88° S',
    lon: '-61.94° W',
    distanciaKm: 375,
    tipo: 'urbana',
    descricao: 'CORAÇÃO DE RONDÔNIA // EIXO BR-364'
  },
  {
    id: 'cacoal',
    name: 'Cacoal',
    label: 'POLO DO CAFÉ',
    municipio: 'Cacoal',
    x: 550,
    y: 336,
    lat: '-11.43° S',
    lon: '-61.44° W',
    distanciaKm: 480,
    tipo: 'urbana',
    descricao: 'POLO REGIONAL DO CAFÉ // EIXO BR-364'
  },
  {
    id: 'paiter-surui',
    name: 'Aldeia Paiter Suruí',
    label: 'T.I. SETE DE SETEMBRO',
    municipio: 'Cacoal',
    x: 572,
    y: 309,
    lat: '-11.10° S',
    lon: '-61.20° W',
    distanciaKm: 510,
    tipo: 'indígena',
    descricao: 'ALDEIA INDÍGENA PAITER SURUÍ'
  },
  {
    id: 'vilhena',
    name: 'Vilhena',
    label: 'PORTAL DA AMAZÔNIA',
    municipio: 'Vilhena',
    x: 669,
    y: 440,
    lat: '-12.74° S',
    lon: '-60.14° W',
    distanciaKm: 700,
    tipo: 'urbana',
    descricao: 'POLO CONE SUL // CHAPADA DOS PARECIS'
  },
  {
    id: 'cabixi',
    name: 'Cabixi',
    label: 'BACIA GUAPORÉ',
    municipio: 'Vilhena',
    x: 632,
    y: 501,
    lat: '-13.50° S',
    lon: '-60.55° W',
    distanciaKm: 780,
    tipo: 'ribeirinha',
    descricao: 'EXTREMO SUDESTE // BACIA DO GUAPORÉ'
  },
  {
    id: 'guajara-mirim',
    name: 'Guajará-Mirim',
    label: 'POLO FRONTEIRA',
    municipio: 'Guajará-Mirim',
    x: 194,
    y: 284,
    lat: '-10.78° S',
    lon: '-65.32° W',
    distanciaKm: 330,
    tipo: 'urbana',
    descricao: 'POLO FRONTEIRA // CALHA DO MAMORÉ'
  },
  {
    id: 'surpresa',
    name: 'Distrito de Surpresa',
    label: 'ENCONTRO DOS RIOS',
    municipio: 'Guajará-Mirim',
    x: 192,
    y: 369,
    lat: '-11.85° S',
    lon: '-65.35° W',
    distanciaKm: 210,
    tipo: 'ribeirinha',
    descricao: 'DISTRITO ISOLADO // FOZ DO MAMORÉ/GUAPORÉ'
  },
  {
    id: 'pedras-negras',
    name: 'Quilombo Pedras Negras',
    label: 'VALE DO GUAPORÉ',
    municipio: 'Guajará-Mirim',
    x: 288,
    y: 421,
    lat: '-12.50° S',
    lon: '-64.30° W',
    distanciaKm: 260,
    tipo: 'indígena',
    descricao: 'COMUNIDADE QUILOMBOLA HISTÓRICA'
  }
];

export default function SchoolMap() {
  const [selectedCity, setSelectedCity] = useState<string>('Todos');
  const [selectedType, setSelectedType] = useState<string>('todas');
  const [hoveredSchoolId, setHoveredSchoolId] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Filtragem bidirecional de escolas
  const filteredSchools = useMemo(() => {
    return escolasData.filter((e) => {
      const matchCity = selectedCity === 'Todos' || e.municipio === selectedCity;
      const matchType = selectedType === 'todas' || e.tipo === selectedType;
      return matchCity && matchType;
    });
  }, [selectedCity, selectedType]);

  // Contadores dinâmicos dos KPIs
  const stats = useMemo(() => {
    return filteredSchools.reduce(
      (acc, curr) => ({
        turmas: acc.turmas + curr.turmas,
        alunos: acc.alunos + curr.alunos,
      }),
      { turmas: 0, alunos: 0 }
    );
  }, [filteredSchools]);

  // Identifica a escola com hover para telemetria em tempo real
  const hoveredSchool = useMemo(() => {
    if (!hoveredSchoolId) return null;
    return escolasData.find((e) => e.id === hoveredSchoolId) || null;
  }, [hoveredSchoolId]);

  // Identifica o nó ativo no mapa baseado no hover da escola ou no nó sob mouse
  const activeTargetNode = useMemo(() => {
    if (hoveredSchool?.nodeId) {
      return TELEMETRY_NODES.find((n) => n.id === hoveredSchool.nodeId) || null;
    }
    if (hoveredSchool) {
      return TELEMETRY_NODES.find((n) => n.municipio === hoveredSchool.municipio) || null;
    }
    if (hoveredNodeId) {
      return TELEMETRY_NODES.find((n) => n.id === hoveredNodeId) || null;
    }
    if (selectedCity !== 'Todos') {
      return TELEMETRY_NODES.find((n) => n.municipio === selectedCity && n.tipo === 'urbana') 
        || TELEMETRY_NODES.find((n) => n.municipio === selectedCity) || null;
    }
    return null;
  }, [hoveredSchool, hoveredNodeId, selectedCity]);

  // Nó Hub Central (Porto Velho)
  const hubNode = TELEMETRY_NODES[0];

  return (
    <div className="space-y-6">
      
      {/* ================= GRID PRINCIPAL DE TELEMETRIA ================= */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">

        {/* ========================================================
            COLUNA DA ESQUERDA: RADAR CARTOGRÁFICO DE TELEMETRIA AMAZÔNICA
        ======================================================== */}
        <div className="relative rounded-2xl border border-[#1A365D] bg-[#040B16] p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Cantoneiras Técnicas (Retícula HUD nos 4 cantos) */}
          <div className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 border-l-2 border-t-2 border-[#00D8FF]/70" />
          <div className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 border-r-2 border-t-2 border-[#00D8FF]/70" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-3.5 w-3.5 border-b-2 border-l-2 border-[#00D8FF]/70" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-3.5 w-3.5 border-b-2 border-r-2 border-[#00D8FF]/70" />

          {/* CABEÇALHO DO MAPA: SISTEMA DE FILTROS DUPLOS E TELEMETRIA */}
          <div className="space-y-3.5 relative z-10">
            
            {/* Linha de Status de Conexão Superior */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-[#1A365D] pb-3 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-[#00D8FF]">
                <Radio className="h-3.5 w-3.5 animate-pulse text-[#F43F5E]" />
                <span className="font-bold tracking-wider uppercase">RADAR CARTOGRÁFICO // SINAL ATIVO</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  BANDA KU 100% OPERACIONAL
                </span>
                <span className="text-[#1A365D] hidden sm:inline">|</span>
                <span className="text-[#6482A6] hidden sm:inline">UPLINK SEDUC-PVH</span>
              </div>
            </div>

            {/* FILTRO 1: PÍLULAS DE MUNICÍPIOS */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#6482A6] font-semibold">
                  [ 01 • NÓ GEOGRÁFICO / MUNICÍPIO ]
                </span>
                {selectedCity !== 'Todos' && (
                  <button
                    onClick={() => setSelectedCity('Todos')}
                    className="text-[10px] font-mono text-[#00D8FF] hover:underline cursor-pointer"
                  >
                    Resetar Filtro ×
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedCity('Todos')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                    selectedCity === 'Todos'
                      ? 'border border-[#00D8FF] bg-[#0C1E38] text-[#00D8FF] shadow-[0_0_14px_rgba(0,216,255,0.25)]'
                      : 'border border-[#1A365D] bg-[#061224]/80 text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  Todos (52)
                </button>
                {municipiosList.map((m) => {
                  const isSelected = selectedCity === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedCity(m)}
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

            {/* FILTRO 2: TIPOLOGIA DE COMUNIDADE COM INDICADORES LUMINOSOS */}
            <div>
              <span className="mb-1.5 block text-[10px] font-mono uppercase tracking-[0.18em] text-[#6482A6] font-semibold">
                [ 02 • TIPOLOGIA DE COMUNIDADE ]
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'todas', label: 'TODAS', dotColor: 'bg-white' },
                  { id: 'urbana', label: 'URBANA', dotColor: 'bg-[#00D8FF]' },
                  { id: 'rural', label: 'RURAL', dotColor: 'bg-amber-400' },
                  { id: 'ribeirinha', label: 'RIBEIRINHA', dotColor: 'bg-cyan-300' },
                  { id: 'indígena', label: 'INDÍGENA / QUILOMBOLA', dotColor: 'bg-[#10B981]' }
                ].map((item) => {
                  const isSelected = selectedType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedType(item.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'border border-[#00D8FF] bg-[#0C1E38] text-white font-semibold shadow-[0_0_12px_rgba(0,216,255,0.2)]'
                          : 'border border-[#1A365D] bg-[#061224]/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${item.dotColor} ${isSelected ? 'animate-ping' : ''}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ========================================================
              CANVAS CARTOGRÁFICO INTERATIVO SVG (VIEWBOX 0 0 760 580)
          ======================================================== */}
          <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#1A365D] bg-[#020710] shadow-inner">
            
            {/* RÉGUAS E MARCAÇÕES DE COORDENADAS REAIS NAS BORDAS */}
            <div className="pointer-events-none absolute left-2.5 top-2 z-20 font-mono text-[9px] uppercase tracking-wider text-[#6482A6]/80">
              LAT -8.76° S a -13.69° S
            </div>
            <div className="pointer-events-none absolute right-2.5 top-2 z-20 font-mono text-[9px] uppercase tracking-wider text-[#6482A6]/80">
              LON -66.80° W a -59.77° W
            </div>
            <div className="pointer-events-none absolute left-2.5 bottom-2 z-20 font-mono text-[9px] text-[#6482A6]/60">
              DATUM: SIRGAS 2000 // RONDÔNIA
            </div>

            {/* SVG CARTOGRÁFICO DE 4 CAMADAS */}
            <svg
              viewBox="0 0 760 580"
              className="absolute inset-0 h-full w-full select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Padrão da Matriz de Pontos do Estado */}
                <pattern
                  id="dot-matrix"
                  x="0"
                  y="0"
                  width="14"
                  height="14"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="7" cy="7" r="1.15" fill="#1A365D" />
                </pattern>

                {/* Grid Cartesiano de Fundo */}
                <pattern
                  id="cartesian-grid"
                  x="0"
                  y="0"
                  width="70"
                  height="70"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 70 0 L 0 0 0 70"
                    fill="none"
                    stroke="#1A365D"
                    strokeWidth="0.5"
                    strokeOpacity="0.4"
                  />
                  <circle cx="0" cy="0" r="1" fill="#00D8FF" fillOpacity="0.3" />
                </pattern>

                {/* Gradiente Radial de Profundidade de Rondônia */}
                <radialGradient id="rondonia-grad" cx="48%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="#0B2347" stopOpacity="0.65" />
                  <stop offset="65%" stopColor="#07172F" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#030A17" stopOpacity="0.1" />
                </radialGradient>

                {/* Filtro de Glow para o Ciano Elétrico */}
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Filtro de Glow Intenso para o Rio Madeira */}
                <filter id="glow-river" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* GRADE CARTESIANA DE FUNDO */}
              <rect width="760" height="580" fill="url(#cartesian-grid)" />

              {/* ========================================================
                  CAMADA 1: SILHUETA REAL EM MATRIZ DE PONTOS (RONDÔNIA)
              ======================================================== */}
              <g className="transition-all duration-500">
                {/* 1. Preenchimento Gradiente da Silhueta */}
                <path
                  d="M 87 201 C 130 175, 190 145, 255 130 C 285 125, 305 124, 325 122 C 355 102, 385 75, 420 63 C 460 75, 505 100, 550 115 C 590 135, 620 180, 635 240 C 645 300, 648 350, 660 395 C 670 420, 675 440, 678 455 C 680 475, 660 495, 632 501 C 595 508, 550 490, 480 465 C 420 445, 350 430, 288 421 C 235 410, 205 390, 192 369 C 190 330, 192 305, 194 284 C 170 255, 140 230, 110 215 C 95 210, 87 205, 87 201 Z"
                  fill="url(#rondonia-grad)"
                />

                {/* 2. Matriz de Pontos Recortada sobre o Contorno de Rondônia */}
                <path
                  d="M 87 201 C 130 175, 190 145, 255 130 C 285 125, 305 124, 325 122 C 355 102, 385 75, 420 63 C 460 75, 505 100, 550 115 C 590 135, 620 180, 635 240 C 645 300, 648 350, 660 395 C 670 420, 675 440, 678 455 C 680 475, 660 495, 632 501 C 595 508, 550 490, 480 465 C 420 445, 350 430, 288 421 C 235 410, 205 390, 192 369 C 190 330, 192 305, 194 284 C 170 255, 140 230, 110 215 C 95 210, 87 205, 87 201 Z"
                  fill="url(#dot-matrix)"
                />

                {/* 3. Contorno Vetorial Externo Tecnológico com Borda Suave */}
                <path
                  d="M 87 201 C 130 175, 190 145, 255 130 C 285 125, 305 124, 325 122 C 355 102, 385 75, 420 63 C 460 75, 505 100, 550 115 C 590 135, 620 180, 635 240 C 645 300, 648 350, 660 395 C 670 420, 675 440, 678 455 C 680 475, 660 495, 632 501 C 595 508, 550 490, 480 465 C 420 445, 350 430, 288 421 C 235 410, 205 390, 192 369 C 190 330, 192 305, 194 284 C 170 255, 140 230, 110 215 C 95 210, 87 205, 87 201 Z"
                  fill="none"
                  stroke="#1A365D"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />

                {/* Selo Técnico Discreto de Rondônia */}
                <text
                  x="560"
                  y="460"
                  fill="#1A365D"
                  fontSize="12"
                  fontFamily="monospace"
                  letterSpacing="0.2em"
                  className="select-none font-bold"
                >
                  ESTADO DE RONDÔNIA // 52 MUN
                </text>
              </g>

              {/* ========================================================
                  CAMADA 2: ARTÉRIAS GEOGRÁFICAS (HIDROGRAFIA & BR-364)
              ======================================================== */}
              <g id="arterias-geograficas">
                {/* 1. EIXO RODOVIÁRIO: RODOVIA BR-364 (PORTO VELHO → VILHENA) */}
                <path
                  d="M 325 122 L 404 214 L 455 255 L 504 292 L 550 336 L 595 375 L 669 440"
                  fill="none"
                  stroke="#00D8FF"
                  strokeWidth="1.6"
                  strokeDasharray="4 4"
                  strokeOpacity="0.45"
                />
                {/* Rótulo Técnico no Meio da Rodovia */}
                <text
                  x="475"
                  y="265"
                  fill="#6482A6"
                  fontSize="8"
                  fontFamily="monospace"
                  letterSpacing="0.16em"
                  transform="rotate(38 475 265)"
                  className="select-none font-semibold"
                >
                  CORREDOR BR-364
                </text>

                {/* 2. CALHA HIDROGRÁFICA DO MAMORÉ / GUAPORÉ (FRONTEIRA OESTE/SUL) */}
                <path
                  d="M 288 421 C 240 400, 200 380, 192 369 C 190 330, 192 305, 194 284 C 180 250, 150 210, 130 175"
                  fill="none"
                  stroke={selectedType === 'ribeirinha' ? '#00D8FF' : '#1A4A7A'}
                  strokeWidth={selectedType === 'ribeirinha' ? '2.8' : '1.8'}
                  className={selectedType === 'ribeirinha' ? 'animate-river-glow' : 'transition-colors'}
                  filter={selectedType === 'ribeirinha' ? 'url(#glow-river)' : undefined}
                />

                {/* 3. CALHA DO RIO MADEIRA (PORTO VELHO → BAIXO MADEIRA / CALAMA) */}
                <path
                  d="M 130 175 C 190 150, 260 135, 325 122 C 355 105, 385 80, 420 63"
                  fill="none"
                  stroke={selectedType === 'ribeirinha' ? '#00D8FF' : '#1A4A7A'}
                  strokeWidth={selectedType === 'ribeirinha' ? '3.2' : '2'}
                  className={selectedType === 'ribeirinha' ? 'animate-river-glow' : 'transition-colors'}
                  filter={selectedType === 'ribeirinha' ? 'url(#glow-river)' : undefined}
                />

                {/* Rótulos da Hidrografia Amazônica */}
                <text
                  x="365"
                  y="108"
                  fill={selectedType === 'ribeirinha' ? '#00D8FF' : '#6482A6'}
                  fontSize="8"
                  fontFamily="monospace"
                  letterSpacing="0.14em"
                  className="select-none font-semibold transition-colors"
                >
                  RIO MADEIRA
                </text>
                <text
                  x="140"
                  y="310"
                  fill={selectedType === 'ribeirinha' ? '#00D8FF' : '#6482A6'}
                  fontSize="8"
                  fontFamily="monospace"
                  letterSpacing="0.14em"
                  className="select-none font-semibold transition-colors"
                >
                  RIO MAMORÉ
                </text>
              </g>

              {/* ========================================================
                  CAMADA 3: FEIXES DE UPLINK SATELITAL ANIMADOS (BEAMS)
              ======================================================== */}
              <g id="uplink-signal-beams">
                {TELEMETRY_NODES.map((node) => {
                  if (node.id === 'porto-velho') return null;

                  // Calcula a curvatura parabólica aeroespacial do feixe
                  const midX = (hubNode.x + node.x) / 2 - (node.y - hubNode.y) * 0.12;
                  const midY = (hubNode.y + node.y) / 2 - Math.max(30, Math.abs(node.x - hubNode.x) * 0.18);
                  const pathD = `M ${hubNode.x} ${hubNode.y} Q ${midX} ${midY} ${node.x} ${node.y}`;

                  // Determina se este feixe específico está ativo/destacado
                  const isNodeActive = activeTargetNode?.id === node.id || selectedCity === node.municipio;
                  const isCityActive = selectedCity === 'Todos' || selectedCity === node.municipio;

                  return (
                    <g key={`beam-${node.id}`}>
                      {/* Feixe Passivo/Sutil de Fundo */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#00D8FF"
                        strokeWidth={isNodeActive ? '2.8' : '1'}
                        strokeOpacity={isNodeActive ? '1' : isCityActive ? '0.25' : '0.1'}
                        strokeDasharray={isNodeActive ? '6 6' : '3 6'}
                        className={isNodeActive ? 'animate-beam-dash' : ''}
                        filter={isNodeActive ? 'url(#glow-cyan)' : undefined}
                      />

                      {/* Pulso de Pacote de Dados Viajando ao longo do Feixe Ativo */}
                      {isNodeActive && (
                        <circle r="3.5" fill="#E6F4FF" filter="url(#glow-cyan)">
                          <animateMotion
                            path={pathD}
                            dur="1.8s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* ANÉIS CONCÊNTRICOS DE RADAR EM PORTO VELHO (HUB CENTRAL) */}
                <circle
                  cx={hubNode.x}
                  cy={hubNode.y}
                  r="14"
                  fill="none"
                  stroke="#F43F5E"
                  className="animate-radar-ping"
                />
                <circle
                  cx={hubNode.x}
                  cy={hubNode.y}
                  r="26"
                  fill="none"
                  stroke="#00D8FF"
                  className="animate-radar-ping"
                  style={{ animationDelay: '0.8s' }}
                />
                <circle
                  cx={hubNode.x}
                  cy={hubNode.y}
                  r="38"
                  fill="none"
                  stroke="#00D8FF"
                  className="animate-radar-ping"
                  style={{ animationDelay: '1.6s' }}
                />
              </g>

              {/* ========================================================
                  CAMADA 4: NÓS DE REDE HUD (TELEMETRIA INTERATIVA)
              ======================================================== */}
              <g id="telemetry-nodes">
                {TELEMETRY_NODES.map((node) => {
                  const isSelected = selectedCity === node.municipio || activeTargetNode?.id === node.id;
                  const isHub = node.tipo === 'hub';
                  const isHovered = hoveredNodeId === node.id || hoveredSchool?.nodeId === node.id;

                  // Cores semânticas por tipologia
                  let nodeColor = '#00D8FF'; // Ciano para Polos Urbanos / BR-364
                  if (isHub) nodeColor = '#F43F5E'; // Laranja/Vermelho para Estúdio Emissor
                  if (node.tipo === 'ribeirinha' || node.tipo === 'indígena') nodeColor = '#10B981'; // Verde Esmeralda

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setSelectedCity(node.municipio)}
                    >
                      {/* Retícula/Mira Técnica nos Cantos quando Selecionado/Hover */}
                      {(isSelected || isHovered) && (
                        <g stroke={nodeColor} strokeWidth="1.4" fill="none">
                          <path d={`M ${node.x - 12} ${node.y - 7} L ${node.x - 12} ${node.y - 12} L ${node.x - 7} ${node.y - 12}`} />
                          <path d={`M ${node.x + 7} ${node.y - 12} L ${node.x + 12} ${node.y - 12} L ${node.x + 12} ${node.y - 7}`} />
                          <path d={`M ${node.x - 12} ${node.y + 7} L ${node.x - 12} ${node.y + 12} L ${node.x - 7} ${node.y + 12}`} />
                          <path d={`M ${node.x + 7} ${node.y + 12} L ${node.x + 12} ${node.y + 12} L ${node.x + 12} ${node.y + 7}`} />
                        </g>
                      )}

                      {/* Círculo de Brilho Externo */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isHub ? '9' : isSelected ? '7.5' : '5'}
                        fill={nodeColor}
                        fillOpacity={isSelected || isHovered ? '0.35' : '0.15'}
                        stroke={nodeColor}
                        strokeWidth={isSelected || isHovered ? '1.8' : '1'}
                      />

                      {/* Círculo Central Luminoso */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isHub ? '4' : '2.8'}
                        fill={nodeColor}
                        filter="url(#glow-cyan)"
                      />

                      {/* TAG FLUTUANTE COMPACTA HUD AO LADO DO NÓ */}
                      <g
                        transform={`translate(${node.x + 10}, ${node.y - 7})`}
                        className="pointer-events-none"
                      >
                        <rect
                          x="0"
                          y="0"
                          width={isHub ? 140 : node.name.length * 7.5 + 24}
                          height="18"
                          rx="4"
                          fill="#0C1E38"
                          fillOpacity="0.9"
                          stroke={isSelected ? '#00D8FF' : '#1A365D'}
                          strokeWidth="1"
                        />
                        <text
                          x="6"
                          y="12"
                          fill={isSelected ? '#00D8FF' : '#E6F4FF'}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          className="select-none tracking-tight"
                        >
                          {isHub ? '[ HUB SEDUC • PVH ]' : `[ ${node.name.toUpperCase()} ]`}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* ========================================================
                  TOOLTIP DINÂMICO DE TELEMETRIA EM TEMPO REAL NO MAPA
              ======================================================== */}
              {activeTargetNode && (
                <g
                  transform={`translate(${Math.min(520, Math.max(20, activeTargetNode.x - 110))}, ${
                    activeTargetNode.y > 400 ? activeTargetNode.y - 95 : activeTargetNode.y + 20
                  })`}
                  className="pointer-events-none transition-all duration-300"
                >
                  <rect
                    width="220"
                    height="70"
                    rx="8"
                    fill="#0C1E38"
                    fillOpacity="0.96"
                    stroke="#00D8FF"
                    strokeWidth="1.2"
                    filter="url(#glow-cyan)"
                  />
                  <text x="12" y="18" fill="#00D8FF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    📡 UPLINK ATIVO // BANDA KU
                  </text>
                  <text x="12" y="34" fill="#E6F4FF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    {hoveredSchool ? hoveredSchool.nome.slice(0, 24) : activeTargetNode.name}
                  </text>
                  <text x="12" y="48" fill="#6482A6" fontSize="9" fontFamily="monospace">
                    COORD: {activeTargetNode.lat} • {activeTargetNode.lon}
                  </text>
                  <text x="12" y="60" fill="#10B981" fontSize="9" fontFamily="monospace" fontWeight="semibold">
                    STATUS: 99.8% SÍNCRONO • LATÊNCIA: 18ms
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* ========================================================
              RODAPÉ INTERNO DO MAPA: BARRA DE STATUS DE TELEMETRIA
          ======================================================== */}
          <div className="mt-4 border-t border-dashed border-[#1A365D] pt-3 text-[11px] font-mono text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-medium">
                  TERRITÓRIO DE RONDÔNIA • COBERTURA: 100% (52 MUNICÍPIOS)
                </span>
                <span className="text-[#1A365D] hidden md:inline">{'//'}</span>
                <span className="text-[#00D8FF] hidden md:inline">SINAL: BANDA KU ATIVO</span>
              </div>

              {/* LEGENDA VISUAL DOS NÓS */}
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#F43F5E]" />
                  <span className="text-slate-400">Hub Central</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#00D8FF]" />
                  <span className="text-slate-400">Polo BR-364</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="text-slate-400">Ribeirinha / Indígena</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================
            COLUNA DA DIREITA: SINCRONIZAÇÃO BIDIRECIONAL & ESCOLAS
        ======================================================== */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* ================= 1. PAINEL DE KPIS DINÂMICOS (3 MÓDULOS) ================= */}
          <div className="grid grid-cols-3 gap-3">
            {/* KPI 1: Escolas */}
            <div className="rounded-xl border border-[#1A365D] bg-[#0C1E38] p-3.5 sm:p-4 transition-all hover:border-[#00D8FF]/40">
              <span className="block text-[11px] sm:text-[12px] uppercase font-mono tracking-wider text-[#6482A6]">
                Escolas Conectadas
              </span>
              <p className="mt-1 font-display text-[32px] sm:text-[41px] font-medium leading-[0.9] text-[#E6F4FF]">
                {filteredSchools.length}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>100% ativas</span>
              </div>
            </div>

            {/* KPI 2: Turmas */}
            <div className="rounded-xl border border-[#1A365D] bg-[#0C1E38] p-3.5 sm:p-4 transition-all hover:border-[#00D8FF]/40">
              <span className="block text-[11px] sm:text-[12px] uppercase font-mono tracking-wider text-[#6482A6]">
                Turmas no Ar
              </span>
              <p className="mt-1 font-display text-[32px] sm:text-[41px] font-medium leading-[0.9] text-[#E6F4FF]">
                {stats.turmas}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                <Signal className="h-3 w-3" />
                <span>Síncronas</span>
              </div>
            </div>

            {/* KPI 3: Estudantes */}
            <div className="rounded-xl border border-[#1A365D] bg-[#0C1E38] p-3.5 sm:p-4 transition-all hover:border-[#00D8FF]/40">
              <span className="block text-[11px] sm:text-[12px] uppercase font-mono tracking-wider text-[#6482A6]">
                Alunos Atendidos
              </span>
              <p className="mt-1 font-display text-[32px] sm:text-[41px] font-medium leading-[0.9] text-[#E6F4FF]">
                {stats.alunos}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-sky-400">
                <Users className="h-3 w-3" />
                <span>Matriculados</span>
              </div>
            </div>
          </div>

          {/* ================= 2. CARDS DE UNIDADES ESCOLARES (HOVER & CLICK SYNC) ================= */}
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-mono uppercase tracking-wider text-[#6482A6]">
                UNIDADES ESCOLARES // {selectedCity.toUpperCase()} ({filteredSchools.length})
              </p>
              <span className="text-[10px] font-mono text-slate-500">
                Passe o mouse para ativar o feixe no mapa
              </span>
            </div>

            {/* Lista com Barra de Rolagem Personalizada */}
            <div className="max-h-[580px] space-y-3 overflow-y-auto pr-1">
              {filteredSchools.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#1A365D] bg-[#0C1E38]/50 p-10 text-center text-sm font-mono text-slate-400">
                  <Satellite className="mx-auto h-8 w-8 text-[#1A365D] mb-2" />
                  Nenhuma unidade escolar encontrada para esta combinação de filtros.
                  <button
                    onClick={() => { setSelectedCity('Todos'); setSelectedType('todas'); }}
                    className="mt-3 block mx-auto text-xs text-[#00D8FF] hover:underline"
                  >
                    Restaurar visualização completa
                  </button>
                </div>
              ) : (
                filteredSchools.map((escola: Escola) => {
                  const isHovered = hoveredSchoolId === escola.id;

                  // Indicador de cor da modalidade
                  let modalidadeBadge = 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300';
                  if (escola.tipo === 'ribeirinha') modalidadeBadge = 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300';
                  if (escola.tipo === 'indígena') modalidadeBadge = 'border-teal-500/30 bg-teal-950/40 text-teal-300';
                  if (escola.tipo === 'rural') modalidadeBadge = 'border-amber-500/30 bg-amber-950/40 text-amber-300';

                  return (
                    <motion.div
                      key={escola.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onMouseEnter={() => setHoveredSchoolId(escola.id)}
                      onMouseLeave={() => setHoveredSchoolId(null)}
                      onClick={() => setSelectedCity(escola.municipio)}
                      className={`group relative rounded-[12px] border p-4 sm:p-5 transition-all cursor-pointer ${
                        isHovered
                          ? 'border-[#00D8FF] bg-[#0F2647] shadow-[0_0_20px_rgba(0,216,255,0.18)] translate-x-1'
                          : 'border-[#1A365D] bg-[#0C1E38] hover:border-[#00D8FF]/70'
                      }`}
                    >
                      {/* Marcador Luminoso Lateral no Hover */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[12px] bg-[#00D8FF] transition-opacity ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      />

                      {/* CABEÇALHO DO CARD DA ESCOLA */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-mono text-sm uppercase font-semibold text-[#E6F4FF] leading-snug group-hover:text-[#00D8FF] transition-colors">
                            {escola.nome}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-[#6482A6] font-mono">
                            <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                            <span>{escola.municipio}</span>
                            {escola.comunidade && (
                              <>
                                <span className="text-[#1A365D]">•</span>
                                <span className="text-slate-400 truncate">{escola.comunidade}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* BADGES TÉCNICAS */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold ${modalidadeBadge}`}>
                            {escola.tipo}
                          </span>
                          <span className="rounded-full border border-[#1A365D] bg-[#061224] px-2 py-0.5 text-[10px] font-mono text-cyan-200">
                            {escola.conexao}
                          </span>
                        </div>
                      </div>

                      {/* DIVISÓRIA INTERNA 1PX DASHED */}
                      <div className="my-3 border-t border-dashed border-[#1A365D]" />

                      {/* LINHA DE MÉTRICAS (TURMAS, ALUNOS, SINAL) */}
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-[#00D8FF]" />
                          <span>{escola.turmas} turmas</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-sky-400" />
                          <span>{escola.alunos} alunos</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Signal className="h-3.5 w-3.5" />
                          <span>{escola.statusSinal || 'Sinal 99.8%'}</span>
                        </div>
                      </div>

                      {/* RODAPÉ DO CARD: PROFESSOR MEDIADOR RESPONSÁVEL */}
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-[#061224]/80 px-3 py-2 border border-[#1A365D]/60 text-xs font-mono">
                        <div className="flex items-center gap-2 truncate">
                          <GraduationCap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 truncate">
                            <span className="text-slate-500">Mediador:</span> {escola.mediador}
                          </span>
                        </div>
                        {escola.distanciaKm && (
                          <span className="text-[10px] text-[#6482A6] shrink-0 font-semibold">
                            {escola.distanciaKm} km da SEDUC
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

      </div>

    </div>
  );
}
