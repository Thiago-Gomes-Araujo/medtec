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
  ArrowRight
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

// Silhueta Geográfica Oficial de Rondônia (vetorizada fielmente a partir do contorno territorial)
const RONDONIA_CONTOUR_PATH =
  "M 385.6 30.0 L 404.9 31.6 L 411.3 38.0 L 419.3 36.4 L 428.9 39.6 L 438.5 57.3 L 441.7 60.5 L 457.8 63.7 L 465.8 71.7 L 464.2 82.9 L 469.0 86.1 L 478.6 86.1 L 488.3 102.2 L 496.3 107.0 L 510.7 92.5 L 528.3 99.0 L 534.8 116.6 L 534.8 121.4 L 528.3 131.0 L 538.0 142.3 L 530.0 158.3 L 533.2 166.3 L 542.8 174.3 L 536.4 196.8 L 544.4 208.0 L 542.8 220.8 L 536.4 225.7 L 534.8 235.3 L 542.8 243.3 L 547.6 257.7 L 547.6 264.2 L 538.0 286.6 L 549.2 302.6 L 562.0 305.8 L 573.3 299.4 L 629.4 301.0 L 635.8 302.6 L 640.6 309.1 L 661.5 309.1 L 671.1 312.3 L 680.7 321.9 L 680.7 336.3 L 661.5 352.4 L 661.5 363.6 L 685.5 403.7 L 685.5 430.9 L 671.1 443.8 L 666.3 458.2 L 642.2 496.7 L 639.0 511.1 L 606.9 540.0 L 595.7 535.2 L 586.1 524.0 L 581.3 522.4 L 574.9 530.4 L 566.8 530.4 L 558.8 524.0 L 552.4 532.0 L 544.4 532.0 L 534.8 524.0 L 526.7 533.6 L 520.3 533.6 L 513.9 527.2 L 513.9 520.8 L 509.1 515.9 L 504.3 515.9 L 493.1 507.9 L 493.1 496.7 L 486.7 488.7 L 478.6 493.5 L 477.0 499.9 L 469.0 498.3 L 462.6 491.9 L 449.8 493.5 L 443.3 482.3 L 438.5 488.7 L 428.9 488.7 L 424.1 485.5 L 425.7 477.5 L 422.5 474.2 L 417.7 475.8 L 408.1 469.4 L 406.5 455.0 L 395.2 455.0 L 384.0 463.0 L 366.4 451.8 L 361.6 442.2 L 353.5 435.8 L 348.7 435.8 L 337.5 447.0 L 318.3 447.0 L 305.4 439.0 L 299.0 445.4 L 291.0 443.8 L 291.0 437.4 L 283.0 422.9 L 270.1 418.1 L 254.1 402.1 L 239.7 400.5 L 236.5 386.0 L 231.7 381.2 L 222.0 382.8 L 220.4 363.6 L 215.6 362.0 L 201.2 344.3 L 199.6 331.5 L 202.8 318.7 L 210.8 309.1 L 214.0 299.4 L 210.8 289.8 L 194.8 277.0 L 194.8 265.8 L 209.2 244.9 L 209.2 238.5 L 202.8 232.1 L 202.8 206.4 L 206.0 201.6 L 190.0 192.0 L 162.7 206.4 L 132.2 206.4 L 116.2 216.0 L 101.7 216.0 L 92.1 222.5 L 74.5 216.0 L 103.3 193.6 L 105.0 184.0 L 122.6 174.3 L 154.7 171.1 L 161.1 182.4 L 172.3 184.0 L 196.4 172.7 L 202.8 159.9 L 212.4 158.3 L 222.0 172.7 L 228.4 175.9 L 234.9 169.5 L 234.9 155.1 L 241.3 132.6 L 250.9 126.2 L 257.3 127.8 L 260.5 135.8 L 266.9 134.2 L 271.7 126.2 L 276.6 126.2 L 279.8 131.0 L 284.6 131.0 L 292.6 124.6 L 302.2 126.2 L 307.0 121.4 L 313.4 102.2 L 326.3 90.9 L 315.0 84.5 L 316.7 68.5 L 339.1 60.5 L 345.5 55.7 L 347.1 49.2 L 358.3 41.2 L 369.6 41.2 L 374.4 36.4 L 382.4 36.4 L 385.6 30.0 Z";

const TELEMETRY_NODES: TelemetryNode[] = [
  {
    id: 'porto-velho',
    name: 'Porto Velho',
    label: 'ESTÚDIO SEDUC',
    municipio: 'Porto Velho',
    x: 317,
    y: 105,
    lat: '-8.76° S',
    lon: '-63.90° W',
    distanciaKm: 0,
    tipo: 'hub',
    descricao: 'HUB Emissor Central • Estúdio SEDUC'
  },
  {
    id: 'calama-nazare',
    name: 'Calama / Nazaré',
    label: 'BAIXO MADEIRA',
    municipio: 'Porto Velho',
    x: 415,
    y: 60,
    lat: '-8.03° S',
    lon: '-62.86° W',
    distanciaKm: 135,
    tipo: 'ribeirinha',
    descricao: 'Calha do Baixo Madeira • Distrito Fluvial'
  },
  {
    id: 'sao-carlos',
    name: 'São Carlos',
    label: 'RIO JAMARI/MADEIRA',
    municipio: 'Porto Velho',
    x: 365,
    y: 85,
    lat: '-8.45° S',
    lon: '-63.50° W',
    distanciaKm: 90,
    tipo: 'ribeirinha',
    descricao: 'Extensão Fluvial São Carlos'
  },
  {
    id: 'ariquemes',
    name: 'Ariquemes',
    label: 'VALE DO JAMARI',
    municipio: 'Ariquemes',
    x: 394,
    y: 200,
    lat: '-9.91° S',
    lon: '-63.04° W',
    distanciaKm: 200,
    tipo: 'urbana',
    descricao: 'Polo Vale do Jamari • Eixo BR-364'
  },
  {
    id: 'ji-parana',
    name: 'Ji-Paraná',
    label: 'POLO CENTRAL',
    municipio: 'Ji-Paraná',
    x: 492,
    y: 287,
    lat: '-10.88° S',
    lon: '-61.94° W',
    distanciaKm: 375,
    tipo: 'urbana',
    descricao: 'Coração de Rondônia • Eixo BR-364'
  },
  {
    id: 'cacoal',
    name: 'Cacoal',
    label: 'POLO DO CAFÉ',
    municipio: 'Cacoal',
    x: 536,
    y: 337,
    lat: '-11.43° S',
    lon: '-61.44° W',
    distanciaKm: 480,
    tipo: 'urbana',
    descricao: 'Polo Regional do Café • Eixo BR-364'
  },
  {
    id: 'paiter-surui',
    name: 'Aldeia Paiter Suruí',
    label: 'T.I. SETE DE SETEMBRO',
    municipio: 'Cacoal',
    x: 555,
    y: 315,
    lat: '-11.10° S',
    lon: '-61.20° W',
    distanciaKm: 510,
    tipo: 'indígena',
    descricao: 'Aldeia Indígena Paiter Suruí'
  },
  {
    id: 'vilhena',
    name: 'Vilhena',
    label: 'PORTAL DA AMAZÔNIA',
    municipio: 'Vilhena',
    x: 645,
    y: 450,
    lat: '-12.74° S',
    lon: '-60.14° W',
    distanciaKm: 700,
    tipo: 'urbana',
    descricao: 'Polo Cone Sul • Chapada dos Parecis'
  },
  {
    id: 'cabixi',
    name: 'Cabixi',
    label: 'BACIA GUAPORÉ',
    municipio: 'Vilhena',
    x: 605,
    y: 500,
    lat: '-13.50° S',
    lon: '-60.55° W',
    distanciaKm: 780,
    tipo: 'ribeirinha',
    descricao: 'Extremo Sudeste • Bacia do Guaporé'
  },
  {
    id: 'guajara-mirim',
    name: 'Guajará-Mirim',
    label: 'POLO FRONTEIRA',
    municipio: 'Guajará-Mirim',
    x: 205,
    y: 270,
    lat: '-10.78° S',
    lon: '-65.32° W',
    distanciaKm: 330,
    tipo: 'urbana',
    descricao: 'Polo Fronteira • Calha do Mamoré'
  },
  {
    id: 'surpresa',
    name: 'Distrito de Surpresa',
    label: 'ENCONTRO DOS RIOS',
    municipio: 'Guajará-Mirim',
    x: 225,
    y: 355,
    lat: '-11.85° S',
    lon: '-65.35° W',
    distanciaKm: 210,
    tipo: 'ribeirinha',
    descricao: 'Distrito Isolado • Foz do Mamoré/Guaporé'
  },
  {
    id: 'pedras-negras',
    name: 'Quilombo Pedras Negras',
    label: 'VALE DO GUAPORÉ',
    municipio: 'Guajará-Mirim',
    x: 300,
    y: 410,
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

  // Estatísticas agregadas por município para nós HUD de telemetria
  const municipalityStats = useMemo(() => {
    const map: Record<string, { alunos: number; escolas: number; turmas: number }> = {};
    escolasData.forEach((e) => {
      if (!map[e.municipio]) {
        map[e.municipio] = { alunos: 0, escolas: 0, turmas: 0 };
      }
      map[e.municipio].alunos += e.alunos;
      map[e.municipio].escolas += 1;
      map[e.municipio].turmas += e.turmas;
    });
    return map;
  }, []);

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
                <span className="font-bold tracking-wider uppercase">Radar Cartográfico • Estado de Rondônia</span>
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
              DATUM: SIRGAS 2000 • RONDÔNIA
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

                {/* ClipPath Oficial do Contorno Territorial de Rondônia */}
                <clipPath id="rondonia-contour-clip">
                  <path d={RONDONIA_CONTOUR_PATH} />
                </clipPath>

                {/* Gradiente do Terreno Cartográfico de Rondônia */}
                <linearGradient id="rondonia-terrain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D274D" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#081A36" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#040D1D" stopOpacity="0.96" />
                </linearGradient>

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
                  CAMADA 1: SILHUETA REAL CARTOGRÁFICA DE RONDÔNIA (MATRIZ DE PONTOS)
              ======================================================== */}
              <g id="territorio-rondonia" className="transition-all duration-500">
                {/* 1. Silhueta Territorial de Rondônia com Fundo Cartográfico Profundo */}
                <path
                  d={RONDONIA_CONTOUR_PATH}
                  fill="url(#rondonia-terrain-grad)"
                  stroke="#00D8FF"
                  strokeWidth="2"
                  filter="url(#glow-cyan)"
                  strokeOpacity="0.85"
                />

                {/* 2. Malha Territorial em Matriz de Micropontos (100% dos 52 municípios) */}
                <path
                  d={RONDONIA_CONTOUR_PATH}
                  fill="url(#dot-matrix)"
                  opacity="0.5"
                />

                {/* 3. Contorno Técnico Interno de Precisão Tracejado */}
                <path
                  d={RONDONIA_CONTOUR_PATH}
                  fill="none"
                  stroke="#E6F4FF"
                  strokeWidth="0.8"
                  strokeDasharray="6 3"
                  strokeOpacity="0.4"
                />

                {/* 4. Marca Cartográfica Sutil do Estado */}
                <text
                  x="480"
                  y="450"
                  fill="#00D8FF"
                  fillOpacity="0.25"
                  fontSize="11"
                  fontFamily="monospace"
                  letterSpacing="0.2em"
                  className="select-none font-bold"
                >
                  ESTADO DE RONDÔNIA • SEDUC
                </text>
              </g>

              {/* ========================================================
                  CAMADA 2: ARTÉRIAS GEOGRÁFICAS (HIDROGRAFIA & BR-364)
              ======================================================== */}
              <g id="arterias-geograficas">
                {/* 1. EIXO RODOVIÁRIO: RODOVIA BR-364 (PORTO VELHO - VILHENA) */}
                <path
                  d="M 317 105 L 394 200 L 492 287 L 536 337 L 645 450"
                  fill="none"
                  stroke="#00D8FF"
                  strokeWidth="1.6"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                />
                {/* Rótulo Técnico no Meio da Rodovia */}
                <text
                  x="440"
                  y="250"
                  fill="#6482A6"
                  fontSize="8"
                  fontFamily="monospace"
                  letterSpacing="0.16em"
                  transform="rotate(38 440 250)"
                  className="select-none font-semibold"
                >
                  CORREDOR BR-364
                </text>

                {/* 2. CALHA HIDROGRÁFICA DO MAMORÉ / GUAPORÉ (FRONTEIRA OESTE/SUL) */}
                <path
                  d="M 605 500 C 500 525, 380 470, 300 410 C 255 385, 235 365, 225 355 C 210 325, 205 295, 205 270 C 205 240, 185 215, 160 200"
                  fill="none"
                  stroke={selectedType === 'ribeirinha' ? '#00D8FF' : '#1A4A7A'}
                  strokeWidth={selectedType === 'ribeirinha' ? '2.8' : '1.8'}
                  className={selectedType === 'ribeirinha' ? 'animate-river-glow' : 'transition-colors'}
                  filter={selectedType === 'ribeirinha' ? 'url(#glow-river)' : undefined}
                />

                {/* 3. CALHA DO RIO MADEIRA (PORTO VELHO - BAIXO MADEIRA / CALAMA) */}
                <path
                  d="M 160 200 C 220 180, 260 145, 317 105 C 350 85, 385 70, 415 60"
                  fill="none"
                  stroke={selectedType === 'ribeirinha' ? '#00D8FF' : '#1A4A7A'}
                  strokeWidth={selectedType === 'ribeirinha' ? '3.2' : '2'}
                  className={selectedType === 'ribeirinha' ? 'animate-river-glow' : 'transition-colors'}
                  filter={selectedType === 'ribeirinha' ? 'url(#glow-river)' : undefined}
                />

                {/* Rótulos da Hidrografia Amazônica */}
                <text
                  x="355"
                  y="78"
                  fill={selectedType === 'ribeirinha' ? '#00D8FF' : '#6482A6'}
                  fontSize="8"
                  fontFamily="monospace"
                  letterSpacing="0.14em"
                  className="select-none font-semibold transition-colors"
                >
                  RIO MADEIRA
                </text>
                <text
                  x="145"
                  y="300"
                  fill={selectedType === 'ribeirinha' ? '#00D8FF' : '#6482A6'}
                  fontSize="8"
                  fontFamily="monospace"
                  letterSpacing="0.14em"
                  className="select-none font-semibold transition-colors"
                >
                  RIO MAMORÉ / GUAPORÉ
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
                      {(() => {
                        const count = municipalityStats[node.municipio]?.alunos;
                        const tagText = isHub
                          ? isSelected || isHovered
                            ? `[ HUB SEDUC • ${count || 132} ALUNOS ]`
                            : '[ PORTO VELHO • 132 ALUNOS ]'
                          : isSelected || isHovered
                          ? count
                            ? `[ ${node.name.toUpperCase()} • ${count} ALUNOS ]`
                            : `[ ${node.name.toUpperCase()} ]`
                          : `[ ${node.name.toUpperCase()} ]`;

                        const tagWidth = tagText.length * 6.6 + 14;
                        const isRightSide = node.x > 480;
                        const tagX = isRightSide ? node.x - tagWidth - 10 : node.x + 10;
                        const tagY = node.y - 9;

                        return (
                          <g
                            transform={`translate(${tagX}, ${tagY})`}
                            className="pointer-events-none transition-all duration-200"
                          >
                            <rect
                              x="0"
                              y="0"
                              width={tagWidth}
                              height="18"
                              rx="4"
                              fill="#0C1E38"
                              fillOpacity="0.94"
                              stroke={isSelected || isHovered ? nodeColor : '#1A365D'}
                              strokeWidth="1"
                            />
                            <text
                              x="7"
                              y="12.5"
                              fill={isSelected || isHovered ? nodeColor : '#E6F4FF'}
                              fontSize="9"
                              fontFamily="monospace"
                              fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                              className="select-none tracking-tight"
                            >
                              {tagText}
                            </text>
                          </g>
                        );
                      })()}
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
                  <circle cx="16" cy="15" r="3" fill="#00D8FF" />
                  <text x="25" y="18" fill="#00D8FF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    TRANSMISSÃO SATELITAL • BANDA KU
                  </text>
                  <text x="12" y="34" fill="#E6F4FF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    {hoveredSchool ? hoveredSchool.nome.slice(0, 24) : activeTargetNode.name}
                  </text>
                  <text x="12" y="48" fill="#6482A6" fontSize="9" fontFamily="monospace">
                    COORD: {activeTargetNode.lat} • {activeTargetNode.lon}
                  </text>
                  <text x="12" y="60" fill="#10B981" fontSize="9" fontFamily="monospace" fontWeight="semibold">
                    STATUS: SINAL SATELITAL ATIVO // SEDUC-RO
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
                <span className="text-white/20 hidden md:inline">•</span>
                <span className="text-[#00D8FF] hidden md:inline">SINAL: BANDA KU ATIVO</span>
              </div>

              {/* LEGENDA TÉCNICA DE TELEMETRIA */}
              <div className="flex flex-wrap items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1.5" title="Polos Urbanos ao longo da BR-364">
                  <span className="h-2 w-2 rounded-full bg-[#00D8FF]" />
                  <span className="text-slate-300 font-medium">Polos Urbanos (BR-364)</span>
                </div>
                <div className="flex items-center gap-1.5" title="Comunidades Ribeirinhas, Indígenas e Quilombolas">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="text-slate-300 font-medium">Ribeirinha / Indígena</span>
                </div>
                <div className="flex items-center gap-1.5" title="Calhas dos Rios Madeira, Mamoré e Guaporé">
                  <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
                  <span className="text-slate-300 font-medium">Calha Fluvial</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-[#1A365D] pl-2.5" title="Estúdio Emissor Central SEDUC Porto Velho">
                  <span className="h-2 w-2 rounded-full bg-[#F43F5E] animate-pulse" />
                  <span className="text-rose-300 font-semibold">Hub Emissor SEDUC</span>
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
            <div className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-3.5 sm:p-4 transition-all hover:border-slate-300 dark:hover:border-[#00D8FF]/40 shadow-sm dark:shadow-none">
              <span className="block text-[11px] sm:text-[12px] uppercase font-mono tracking-wider text-slate-500 dark:text-[#6482A6]">
                Escolas Conectadas
              </span>
              <p className="mt-1 font-display text-[32px] sm:text-[41px] font-medium leading-tight text-slate-900 dark:text-[#E6F4FF]">
                {filteredSchools.length}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>100% ativas</span>
              </div>
            </div>

            {/* KPI 2: Turmas */}
            <div className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-3.5 sm:p-4 transition-all hover:border-slate-300 dark:hover:border-[#00D8FF]/40 shadow-sm dark:shadow-none">
              <span className="block text-[11px] sm:text-[12px] uppercase font-mono tracking-wider text-slate-500 dark:text-[#6482A6]">
                Turmas no Ar
              </span>
              <p className="mt-1 font-display text-[32px] sm:text-[41px] font-medium leading-tight text-slate-900 dark:text-[#E6F4FF]">
                {stats.turmas}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-cyan-700 dark:text-cyan-400">
                <Signal className="h-3 w-3" />
                <span>Síncronas</span>
              </div>
            </div>

            {/* KPI 3: Estudantes */}
            <div className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-3.5 sm:p-4 transition-all hover:border-slate-300 dark:hover:border-[#00D8FF]/40 shadow-sm dark:shadow-none">
              <span className="block text-[11px] sm:text-[12px] uppercase font-mono tracking-wider text-slate-500 dark:text-[#6482A6]">
                Alunos Atendidos
              </span>
              <p className="mt-1 font-display text-[32px] sm:text-[41px] font-medium leading-tight text-slate-900 dark:text-[#E6F4FF]">
                {stats.alunos}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-sky-700 dark:text-sky-400">
                <Users className="h-3 w-3" />
                <span>Matriculados</span>
              </div>
            </div>
          </div>

          {/* ================= 2. CARDS DE UNIDADES ESCOLARES (HOVER & CLICK SYNC) ================= */}
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-[#6482A6]">
                UNIDADES ESCOLARES • {selectedCity.toUpperCase()} ({filteredSchools.length})
              </p>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                Passe o mouse para ativar o feixe no mapa
              </span>
            </div>

            {/* Lista com Barra de Rolagem Personalizada */}
            <div className="max-h-[580px] space-y-3 overflow-y-auto pr-1">
              {filteredSchools.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38]/50 p-10 text-center text-sm font-mono text-slate-500 dark:text-slate-400 shadow-sm">
                  <Satellite className="mx-auto h-8 w-8 text-slate-400 dark:text-[#1A365D] mb-2" />
                  Nenhuma unidade escolar encontrada para esta combinação de filtros.
                  <button
                    onClick={() => { setSelectedCity('Todos'); setSelectedType('todas'); }}
                    className="mt-3 block mx-auto text-xs text-[#05549D] dark:text-[#00D8FF] hover:underline cursor-pointer"
                  >
                    Restaurar visualização completa
                  </button>
                </div>
              ) : (
                filteredSchools.map((escola: Escola) => {
                  const isHovered = hoveredSchoolId === escola.id;

                  // Indicador de cor da modalidade
                  let modalidadeBadge = 'border-cyan-500/30 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300';
                  if (escola.tipo === 'ribeirinha') modalidadeBadge = 'border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
                  if (escola.tipo === 'indígena') modalidadeBadge = 'border-teal-500/30 bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300';
                  if (escola.tipo === 'rural') modalidadeBadge = 'border-amber-500/30 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';

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
                      className={`group relative rounded-xl border p-4 transition-all cursor-pointer shadow-xs dark:shadow-none ${
                        isHovered
                          ? 'border-[#00D8FF] bg-sky-50/50 dark:bg-[#0F2647] shadow-md dark:shadow-[0_0_16px_rgba(0,216,255,0.15)] translate-x-1'
                          : 'border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] hover:border-sky-400 dark:hover:border-[#00D8FF]/70'
                      }`}
                    >
                      {/* Marcador Luminoso Lateral no Hover */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-[#00D8FF] transition-opacity ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      />

                      {/* CABEÇALHO DO CARD DA ESCOLA (1 Badge no Topo) */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-mono text-sm uppercase font-semibold text-slate-900 dark:text-[#E6F4FF] leading-snug group-hover:text-sky-700 dark:group-hover:text-[#00D8FF] transition-colors truncate">
                            {escola.nome}
                          </h3>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#6482A6] font-mono">
                            <MapPin className="h-3 w-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            <span>{escola.municipio}</span>
                            {escola.comunidade && (
                              <>
                                <span className="text-slate-300 dark:text-[#1A365D]">•</span>
                                <span className="text-slate-500 dark:text-slate-400 truncate">{escola.comunidade}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 1 BADGE DA TIPOLOGIA NO TOPO */}
                        <span className={`shrink-0 rounded-md border px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold ${modalidadeBadge}`}>
                          {escola.tipo}
                        </span>
                      </div>

                      {/* DIVISÓRIA INTERNA 1PX DASHED */}
                      <div className="my-2.5 border-t border-dashed border-slate-200 dark:border-[#1A365D]" />

                      {/* LINHA DE MÉTRICAS & LINK FOCAR NO RADAR */}
                      <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5 text-[#05549D] dark:text-[#00D8FF]" />
                            {escola.turmas} turmas
                          </span>
                          <span className="text-slate-300 dark:text-white/20">•</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                            {escola.alunos} alunos
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-[#05549D] dark:text-[#00D8FF] group-hover:underline inline-flex items-center gap-1 shrink-0">
                          Focar no Radar <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>

                      {/* LINHA DISCRETA DO MEDIADOR RESPONSÁVEL */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="truncate">
                          Mediador: <strong className="text-slate-700 dark:text-slate-300 font-medium">{escola.mediador}</strong>
                        </span>
                        {escola.distanciaKm && (
                          <span className="shrink-0 text-[10px]">
                            {escola.distanciaKm} km SEDUC
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
