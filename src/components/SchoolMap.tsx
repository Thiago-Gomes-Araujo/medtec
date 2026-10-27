'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { Escola } from '@/types';

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
  const [schools, setSchools] = useState<Escola[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadSchools() {
      try {
        const res = await fetch('/api/schools');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setSchools(data.items || []);
          }
        }
      } catch (err) {
        console.error('Falha ao carregar escolas da API:', err);
      }
    }
    loadSchools();
    return () => {
      isMounted = false;
    };
  }, []);

  const dynamicMunicipios = useMemo(() => {
    const set = new Set<string>();
    schools.forEach((s) => {
      if (s.municipio) set.add(s.municipio);
    });
    return Array.from(set).sort();
  }, [schools]);

  // Filtragem bidirecional de escolas
  const filteredSchools = useMemo(() => {
    return schools.filter((e) => {
      const matchCity = selectedCity === 'Todos' || e.municipio === selectedCity;
      const matchType = selectedType === 'todas' || e.tipo === selectedType;
      return matchCity && matchType;
    });
  }, [schools, selectedCity, selectedType]);

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
    schools.forEach((e) => {
      if (!map[e.municipio]) {
        map[e.municipio] = { alunos: 0, escolas: 0, turmas: 0 };
      }
      map[e.municipio].alunos += e.alunos;
      map[e.municipio].escolas += 1;
      map[e.municipio].turmas += e.turmas;
    });
    return map;
  }, [schools]);

  // Identifica a escola com hover para telemetria em tempo real
  const hoveredSchool = useMemo(() => {
    if (!hoveredSchoolId) return null;
    return schools.find((e) => e.id === hoveredSchoolId) || null;
  }, [schools, hoveredSchoolId]);

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
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm flex flex-col justify-between overflow-hidden">
          {/* CABEÇALHO DO MAPA */}
          <div className="space-y-4 relative z-10">
            {/* Linha de Status de Conexão Superior */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
              <div className="flex items-center gap-2 text-[#004A99] dark:text-sky-400">
                <Radio className="h-4 w-4" />
                <span className="font-semibold">Mapa Territorial • Estado de Rondônia</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Conexão Satelital Operacional
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                <span className="hidden sm:inline">SEDUC Porto Velho</span>
              </div>
            </div>

            {/* FILTRO 1: MUNICÍPIOS */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Município ou Polo Regional
                </span>
                {selectedCity !== 'Todos' && (
                  <button
                    onClick={() => setSelectedCity('Todos')}
                    className="text-xs text-[#004A99] dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Limpar filtro
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedCity('Todos')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    selectedCity === 'Todos'
                      ? 'border border-[#004A99] dark:border-sky-500 bg-[#004A99] dark:bg-sky-600 text-white font-semibold shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Todos ({dynamicMunicipios.length > 0 ? dynamicMunicipios.length : 52})
                </button>
                {dynamicMunicipios.map((m) => {
                  const isSelected = selectedCity === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedCity(m)}
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
                  { id: 'indígena', label: 'Indígena / Quilombola', dotColor: 'bg-emerald-500' }
                ].map((item) => {
                  const isSelected = selectedType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedType(item.id)}
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

          {/* ========================================================
              CANVAS CARTOGRÁFICO INTERATIVO SVG (VIEWBOX 0 0 760 580)
          ======================================================== */}
          <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-inner">

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

                      {/* TAG FLUTUANTE AO LADO DO NÓ */}
                      {(() => {
                        const count = municipalityStats[node.municipio]?.alunos;
                        const tagText = isHub
                          ? isSelected || isHovered
                            ? `Hub SEDUC • ${count || 132} alunos`
                            : 'Porto Velho • 132 alunos'
                          : isSelected || isHovered
                          ? count
                            ? `${node.name} • ${count} alunos`
                            : node.name
                          : node.name;

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

              {/* TOOLTIP DE UNIDADE NO MAPA */}
              {activeTargetNode && (
                <g
                  transform={`translate(${Math.min(520, Math.max(20, activeTargetNode.x - 110))}, ${
                    activeTargetNode.y > 400 ? activeTargetNode.y - 95 : activeTargetNode.y + 20
                  })`}
                  className="pointer-events-none transition-all duration-300"
                >
                  <rect
                    width="220"
                    height="60"
                    rx="8"
                    fill="#0C1E38"
                    fillOpacity="0.96"
                    stroke="#00D8FF"
                    strokeWidth="1.2"
                    filter="url(#glow-cyan)"
                  />
                  <circle cx="16" cy="15" r="3" fill="#00D8FF" />
                  <text x="25" y="18" fill="#00D8FF" fontSize="10" fontWeight="bold">
                    Transmissão Satelital • SEDUC-RO
                  </text>
                  <text x="12" y="34" fill="#E6F4FF" fontSize="11" fontWeight="bold">
                    {hoveredSchool ? hoveredSchool.nome.slice(0, 24) : activeTargetNode.name}
                  </text>
                  <text x="12" y="48" fill="#10B981" fontSize="9" fontWeight="semibold">
                    Status: Conexão regular ativa
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* RODAPÉ DO MAPA */}
          <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  Cobertura estadual nos 52 municípios
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
                <span className="text-sky-600 dark:text-sky-400 hidden md:inline">Transmissão via satélite regular</span>
              </div>

              {/* LEGENDA */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5" title="Polos Urbanos ao longo da BR-364">
                  <span className="h-2 w-2 rounded-full bg-[#00D8FF]" />
                  <span className="text-slate-600 dark:text-slate-400">Polos Urbanos</span>
                </div>
                <div className="flex items-center gap-1.5" title="Comunidades Ribeirinhas, Indígenas e Quilombolas">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="text-slate-600 dark:text-slate-400">Ribeirinha / Indígena</span>
                </div>
                <div className="flex items-center gap-1.5" title="Calhas Fluviais">
                  <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
                  <span className="text-slate-600 dark:text-slate-400">Calha Fluvial</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-2.5" title="Estúdio Central SEDUC Porto Velho">
                  <span className="h-2 w-2 rounded-full bg-[#F43F5E]" />
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">Hub SEDUC</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DA DIREITA: ESCOLAS */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* PAINEL DE INDICADORES */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-xs">
              <span className="block text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
                Escolas Conectadas
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold leading-tight text-slate-900 dark:text-white">
                {filteredSchools.length}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>100% ativas</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-xs">
              <span className="block text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
                Turmas Ativas
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold leading-tight text-slate-900 dark:text-white">
                {stats.turmas}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
                <Signal className="h-3 w-3" />
                <span>Em mediação</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-xs">
              <span className="block text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
                Alunos Atendidos
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold leading-tight text-slate-900 dark:text-white">
                {stats.alunos}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
                <Users className="h-3 w-3" />
                <span>Matriculados</span>
              </div>
            </div>
          </div>

          {/* LISTA DE ESCOLAS */}
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold">
                Unidades Escolares: {selectedCity} ({filteredSchools.length})
              </p>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Selecione uma escola para focar
              </span>
            </div>

            <div className="max-h-[580px] space-y-3 overflow-y-auto pr-1">
              {filteredSchools.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-10 text-center text-sm text-slate-500">
                  <Satellite className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                  Nenhuma unidade escolar encontrada para esta combinação de filtros.
                  <button
                    onClick={() => { setSelectedCity('Todos'); setSelectedType('todas'); }}
                    className="mt-3 block mx-auto text-xs text-[#004A99] dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Restaurar visualização completa
                  </button>
                </div>
              ) : (
                filteredSchools.map((escola: Escola) => {
                  const isHovered = hoveredSchoolId === escola.id;

                  let modalidadeBadge = 'border-sky-500/30 bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300';
                  if (escola.tipo === 'ribeirinha') modalidadeBadge = 'border-blue-500/30 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
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
                      className={`group relative rounded-xl border p-4 transition-all cursor-pointer shadow-xs ${
                        isHovered
                          ? 'border-[#004A99] dark:border-sky-500 bg-sky-50/50 dark:bg-slate-800/80'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-[#004A99] dark:bg-sky-500 transition-opacity ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      />

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition-colors truncate">
                            {escola.nome}
                          </h3>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3 w-3 text-sky-600 dark:text-sky-400 shrink-0" />
                            <span>{escola.municipio}</span>
                            {escola.comunidade && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <span className="text-slate-400 truncate">{escola.comunidade}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <span className={`shrink-0 rounded-md border px-2.5 py-0.5 text-xs font-medium ${modalidadeBadge}`}>
                          {escola.tipo}
                        </span>
                      </div>

                      <div className="my-2.5 border-t border-slate-100 dark:border-slate-800" />

                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                            {escola.turmas} turmas
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                            {escola.alunos} alunos
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-[#004A99] dark:text-sky-400 group-hover:underline inline-flex items-center gap-1 shrink-0">
                          Ver no mapa <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="truncate">
                          Mediador: <strong className="text-slate-700 dark:text-slate-300 font-medium">{escola.mediador}</strong>
                        </span>
                        {escola.distanciaKm && (
                          <span className="shrink-0 text-[11px] text-slate-400">
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
