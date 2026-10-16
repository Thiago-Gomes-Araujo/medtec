'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GalleryItem } from '@/types';
import { 
  Camera, 
  LayoutGrid, 
  List, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Radio 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

interface PhotoMetadata {
  regCode: string;
  location: string;
  municipio: string;
  coords: string;
  infra: string;
  origem: string;
  bentoClass: string;
  aspectRatio: string;
}

// Metadados catalográficos detalhados para cada registro histórico do MEDTEC
const CATALOG_INFO: Record<string, PhotoMetadata> = {
  'gal-1': {
    regCode: 'REG_01 // RO',
    location: 'Porto Velho, RO — Estúdios SEDUC',
    municipio: 'Porto Velho',
    coords: 'LAT -8.76° S • LON -63.90° W',
    infra: 'Estúdio Central SEDUC • 4K UHD Broadcast • Fibra Óptica',
    origem: 'Coordenadoria de Mídias Educacionais (SEDUC-RO)',
    bentoClass: 'md:col-span-8 md:row-span-2',
    aspectRatio: 'min-h-[440px] md:min-h-[500px]'
  },
  'gal-3': {
    regCode: 'REG_02 // RO',
    location: 'Cacoal, RO — Terra Indígena Paiter Suruí',
    municipio: 'Cacoal',
    coords: 'LAT -11.10° S • LON -61.20° W',
    infra: 'Transmissão Satelital Banda Ku • Painel Solar Fotovoltaico',
    origem: 'EEEFM Indígena Paiter Suruí (CRE Cacoal)',
    bentoClass: 'md:col-span-4 md:row-span-2',
    aspectRatio: 'min-h-[440px] md:min-h-[500px]'
  },
  'gal-2': {
    regCode: 'REG_03 // RO',
    location: 'Ji-Paraná, RO — Zona Rural (Setor Riachuelo)',
    municipio: 'Ji-Paraná',
    coords: 'LAT -10.88° S • LON -61.94° W',
    infra: 'Receptor Satelital Ku • Smart TV 65" Interativa',
    origem: 'EEEFM Juscelino Kubitschek (Extensão Rural)',
    bentoClass: 'md:col-span-5',
    aspectRatio: 'min-h-[340px]'
  },
  'gal-4': {
    regCode: 'REG_04 // RO',
    location: 'Porto Velho, RO — Palácio Rio Madeira',
    municipio: 'Porto Velho',
    coords: 'LAT -8.74° S • LON -63.89° W',
    infra: 'Auditório Multimídia • Transmissão Síncrona IP',
    origem: 'Gerência de Capacitação Pedagógica (SEDUC-RO)',
    bentoClass: 'md:col-span-7',
    aspectRatio: 'min-h-[340px]'
  },
  'gal-5': {
    regCode: 'REG_05 // RO',
    location: 'Ariquemes, RO — Vale do Jamari',
    municipio: 'Ariquemes',
    coords: 'LAT -9.91° S • LON -63.04° W',
    infra: 'Estande Tecnológico • Conexão Redundante Satélite/Rádio',
    origem: 'Feira Estadual de Ciência e Tecnologia MEDTEC',
    bentoClass: 'md:col-span-6',
    aspectRatio: 'min-h-[340px]'
  },
  'gal-6': {
    regCode: 'REG_06 // RO',
    location: 'Porto Velho, RO — Complexo de Mídias',
    municipio: 'Porto Velho',
    coords: 'LAT -8.76° S • LON -63.90° W',
    infra: 'Switch de Produção Blackmagic • Teleprompter e Iluminação LED',
    origem: 'Estúdios de Transmissão da Coordenadoria de Mídias',
    bentoClass: 'md:col-span-6',
    aspectRatio: 'min-h-[340px]'
  }
};

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'bento' | 'list'>('bento');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Ordenação prioritária para harmonia máxima no Bento Grid (8+4=12, 5+7=12, 6+6=12)
  const orderedGallery = useMemo(() => {
    const priority = ['gal-1', 'gal-3', 'gal-2', 'gal-4', 'gal-5', 'gal-6'];
    const sorted = [...gallery].sort((a, b) => {
      const idxA = priority.indexOf(a.id);
      const idxB = priority.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
    return sorted;
  }, [gallery]);

  // Contagem dinâmica por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todas: gallery.length
    };
    gallery.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [gallery]);

  // Filtro ativo
  const filteredGallery = useMemo(() => {
    if (selectedCategory === 'Todas') return orderedGallery;
    return orderedGallery.filter((item) => item.category === selectedCategory);
  }, [orderedGallery, selectedCategory]);

  // Categorias disponíveis padronizadas
  const categoriesList = useMemo(() => {
    const all = ['Todas', 'Estúdios', 'Salas de Aula', 'Comunidades', 'Eventos'];
    // Adiciona quaisquer categorias extras presentes no CMS
    gallery.forEach((g) => {
      if (!all.includes(g.category)) all.push(g.category);
    });
    return all;
  }, [gallery]);

  // Foto atualmente inspecionada no Lightbox
  const activePhoto = useMemo(() => {
    if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= filteredGallery.length) {
      return null;
    }
    return filteredGallery[selectedIndex];
  }, [selectedIndex, filteredGallery]);

  const activeMeta = useMemo(() => {
    if (!activePhoto) return null;
    return CATALOG_INFO[activePhoto.id] || {
      regCode: `REG_${String(selectedIndex! + 1).padStart(2, '0')} // RO`,
      location: 'Rondônia, Brasil',
      municipio: 'Rondônia',
      coords: 'LAT -8.76° S • LON -63.90° W',
      infra: 'Transmissão Satelital Banda Ku • 4K UHD',
      origem: 'Coordenadoria de Mídias Educacionais (SEDUC-RO)',
      bentoClass: 'md:col-span-6',
      aspectRatio: 'min-h-[340px]'
    };
  }, [activePhoto, selectedIndex]);

  // Navegação no Lightbox
  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : filteredGallery.length - 1));
  }, [selectedIndex, filteredGallery.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < filteredGallery.length - 1 ? prev! + 1 : 0));
  }, [selectedIndex, filteredGallery.length]);

  // Atalhos de Teclado (ESC, ←, →)
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedIndex, handlePrev, handleNext]);

  return (
    <div className="relative w-full bg-[#040B16] text-[#E6F4FF]">
      
      {/* Grade Cartesiana Sutil de Fundo (Hero Grid) */}
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* Glow Sutil de Horizonte Ciano */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-3/4 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-24 space-y-8">

        {/* ========================================================
            1. HEADER ÚNICO IMERSIVO (FIM DA DUPLICAÇÃO)
        ======================================================== */}
        <div className="space-y-4">
          {/* Tag Técnica Monoespaçada */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-[#0C1E38]/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#00D8FF] shadow-[0_0_16px_rgba(0,216,255,0.15)]">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span>{'//'} ACERVO & MEMÓRIA OFICIAL • SEDUC-RO</span>
          </div>

          {/* Título Display Escultural (Estilo Oryzo / Editorial) */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[51px] uppercase font-medium leading-[0.9] tracking-tight text-[#E6F4FF]">
            Acervo Fotográfico do MEDTEC.
          </h1>

          {/* Subtítulo Conversacional */}
          <p className="max-w-3xl text-base sm:text-[21px] font-normal leading-relaxed text-[#E6F4FF]/80">
            Registros das salas de aula conectadas no interior de Rondônia, dos estúdios televisivos da SEDUC em Porto Velho e dos momentos de aprendizagem prática dos nossos alunos e professores mediadores.
          </p>
        </div>

        {/* ========================================================
            2. BARRA DE FERRAMENTAS TÉCNICA (FILTROS + MODO DE EXIBIÇÃO)
        ======================================================== */}
        <div className="border-y border-dashed border-[#1A365D] py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Esquerda: Filtros de Categoria com Contador */}
          <div className="flex flex-wrap items-center gap-2">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              const formattedCount = String(count).padStart(2, '0');

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'border border-[#00D8FF] bg-[#0C1E38] text-[#E6F4FF] font-semibold shadow-[0_0_14px_rgba(0,216,255,0.22)]'
                      : 'border border-[#1A365D] bg-[#061224]/50 text-[#6482A6] hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-[#00D8FF]' : 'text-slate-500'}`}>
                    [{formattedCount}]
                  </span>
                </button>
              );
            })}
          </div>

          {/* Direita: Alternador de Modo de Visualização (Bento Mosaico vs Índice Técnico) */}
          <div className="flex items-center gap-1.5 self-start md:self-auto shrink-0 bg-[#061224] p-1 rounded-xl border border-[#1A365D]">
            <button
              onClick={() => setViewMode('bento')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                viewMode === 'bento'
                  ? 'bg-[#0C1E38] text-[#00D8FF] border border-[#00D8FF]/70 shadow-sm font-semibold'
                  : 'text-[#6482A6] hover:text-white'
              }`}
              title="Visualizar em mosaico assimétrico Bento Grid"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>⊞ BENTO MOSAICO</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#0C1E38] text-[#00D8FF] border border-[#00D8FF]/70 shadow-sm font-semibold'
                  : 'text-[#6482A6] hover:text-white'
              }`}
              title="Visualizar como catálogo e índice técnico"
            >
              <List className="h-3.5 w-3.5" />
              <span>☰ ÍNDICE TÉCNICO</span>
            </button>
          </div>

        </div>

        {/* ========================================================
            3. CONTEÚDO PRINCIPAL: BENTO GRID ASSIMÉTRICO OU ÍNDICE
        ======================================================== */}
        <AnimatePresence mode="wait">
          {filteredGallery.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-dashed border-[#1A365D] bg-[#0C1E38]/40 p-12 text-center"
            >
              <Camera className="mx-auto h-10 w-10 text-slate-500 mb-3" />
              <p className="text-sm font-mono text-slate-300">
                Nenhum registro fotográfico catalogado para a categoria selecionada.
              </p>
              <button
                onClick={() => setSelectedCategory('Todas')}
                className="mt-3 text-xs font-mono text-[#00D8FF] hover:underline cursor-pointer"
              >
                Ver todos os registros fotográficos
              </button>
            </motion.div>
          ) : viewMode === 'bento' ? (
            /* ================= MODO 1: BENTO MOSAICO ASSIMÉTRICO ================= */
            <motion.div
              key="bento-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-5"
            >
              {filteredGallery.map((photo, index) => {
                const meta = CATALOG_INFO[photo.id] || {
                  regCode: `REG_${String(index + 1).padStart(2, '0')} // RO`,
                  location: 'Rondônia, Brasil',
                  municipio: 'Rondônia',
                  coords: 'LAT -8.76° S • LON -63.90° W',
                  infra: 'Transmissão Satelital Banda Ku • 4K UHD',
                  origem: 'Coordenadoria de Mídias Educacionais (SEDUC-RO)',
                  bentoClass: 'md:col-span-6',
                  aspectRatio: 'min-h-[340px]'
                };

                // Se o filtro reduziu a menos de 4 fotos, equilibra a grade
                const gridSpanClass = filteredGallery.length < 4 ? 'md:col-span-6' : meta.bentoClass;

                return (
                  <motion.div
                    key={photo.id}
                    layout
                    onClick={() => setSelectedIndex(index)}
                    className={`group relative overflow-hidden rounded-[12px] border border-[#1A365D] bg-[#0C1E38] hover:border-[#00D8FF] transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between ${gridSpanClass} ${meta.aspectRatio}`}
                  >
                    {/* Imagem de Fundo com Zoom Suave no Hover */}
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradiente Escuro de Proteção e Contraste Tipográfico */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040B16] via-[#040B16]/35 to-[#040B16]/40 group-hover:from-[#040B16]/95 group-hover:via-[#040B16]/50 transition-all duration-300" />

                    {/* ================= CANTONEIRAS DE VIEWFINDER (CÂMERA HUD) ================= */}
                    <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[#00D8FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[#00D8FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#00D8FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#00D8FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* TOPO DO CARD: BADGE TÉCNICA E CÓDIGO CATALOGRÁFICO */}
                    <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
                      <span className="backdrop-blur-md bg-[#040B16]/80 border border-[#1A365D] text-[#00D8FF] text-[11px] uppercase font-mono px-3 py-1 rounded-full font-semibold shadow-sm">
                        {photo.category}
                      </span>

                      <span className="backdrop-blur-md bg-[#040B16]/80 border border-[#1A365D] text-[#6482A6] group-hover:text-[#E6F4FF] text-[11px] font-mono px-2.5 py-1 rounded-full transition-colors">
                        {meta.regCode}
                      </span>
                    </div>

                    {/* BASE DO CARD: DATA, LOCALIZAÇÃO, TÍTULO E DESLIZAMENTO DO HOVER */}
                    <div className="relative z-10 p-5 sm:p-6 space-y-2">
                      {/* Linha de Data e Localização */}
                      <p className="text-[11px] font-mono uppercase tracking-wider text-[#6482A6]">
                        {photo.date} • 📍 {meta.location}
                      </p>

                      {/* Título em Destaque */}
                      <h3 className="font-display text-lg sm:text-xl font-medium uppercase leading-snug text-[#E6F4FF] group-hover:text-[#00D8FF] transition-colors">
                        {photo.title}
                      </h3>

                      {/* Descrição Completa e Botão de Inspeção (Desliza e Revela no Hover) */}
                      <div className="max-h-0 opacity-0 group-hover:max-h-48 group-hover:opacity-100 transition-all duration-400 ease-out overflow-hidden">
                        <p className="text-xs text-slate-300 leading-relaxed font-normal pt-1.5">
                          {photo.description}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-dashed border-[#1A365D] flex items-center justify-between text-xs font-mono text-[#00D8FF]">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Maximize2 className="h-3.5 w-3.5" />
                            <span>[ ⊕ INSPECIONAR REGISTRO ]</span>
                          </span>
                          <span className="text-[10px] text-[#6482A6] hidden sm:inline">
                            {meta.coords}
                          </span>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* ================= MODO 2: ÍNDICE TÉCNICO EDITORIAL ================= */
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-[#1A365D] bg-[#0C1E38] divide-y divide-dashed divide-[#1A365D] overflow-hidden shadow-xl"
            >
              {filteredGallery.map((photo, index) => {
                const meta = CATALOG_INFO[photo.id] || {
                  regCode: `REG_${String(index + 1).padStart(2, '0')} // RO`,
                  location: 'Rondônia, Brasil',
                  municipio: 'Rondônia',
                  coords: 'LAT -8.76° S • LON -63.90° W',
                  infra: 'Transmissão Satelital Banda Ku • 4K UHD',
                  origem: 'Coordenadoria de Mídias Educacionais (SEDUC-RO)',
                  bentoClass: 'md:col-span-6',
                  aspectRatio: 'min-h-[340px]'
                };

                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedIndex(index)}
                    className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-[#0F2647] transition-all cursor-pointer"
                  >
                    {/* Código e Miniatura */}
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="w-20 font-mono text-xs text-[#6482A6] font-semibold">
                        {meta.regCode}
                      </span>

                      <div className="relative h-16 w-24 sm:h-18 sm:w-28 overflow-hidden rounded-lg border border-[#1A365D] bg-black">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Título e Descrição */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-mono uppercase text-[#00D8FF] font-semibold">
                          {photo.category}
                        </span>
                        <span className="text-xs font-mono text-[#6482A6]">
                          {photo.date} • {meta.location}
                        </span>
                      </div>
                      <h3 className="font-mono text-sm sm:text-base uppercase font-semibold text-[#E6F4FF] group-hover:text-[#00D8FF] transition-colors truncate">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                        {photo.description}
                      </p>
                    </div>

                    {/* Botão de Inspeção */}
                    <div className="shrink-0 self-end md:self-center">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1A365D] bg-[#061224] px-3.5 py-1.5 text-xs font-mono text-[#00D8FF] group-hover:border-[#00D8FF] group-hover:bg-[#00D8FF] group-hover:text-slate-950 transition-all font-semibold">
                        <Maximize2 className="h-3 w-3" />
                        <span>INSPECIONAR</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ========================================================
          4. MODAL LIGHTBOX SPLIT-SCREEN (INSPEÇÃO DE DOCUMENTO)
      ======================================================== */}
      <AnimatePresence>
        {activePhoto && activeMeta && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 bg-[#040B16]/95 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-7xl max-h-[92vh] rounded-2xl border border-[#1A365D] bg-[#071326] shadow-2xl overflow-hidden flex flex-col lg:flex-row"
            >
              
              {/* Botão Fechar no Canto Superior Direito (Mobile) */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="lg:hidden absolute top-3 right-3 z-30 rounded-full border border-white/20 bg-black/70 p-2 text-white hover:bg-white hover:text-black transition-colors"
                aria-label="Fechar inspetor"
              >
                <X className="h-5 w-5" />
              </button>

              {/* ================= COLUNA DA ESQUERDA: VISUALIZADOR HUD (68%) ================= */}
              <div className="relative lg:w-[68%] bg-[#020710] flex flex-col justify-between p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#1A365D]">
                
                {/* HUD Superior: Contador e Calibração Óptica */}
                <div className="mb-3 flex items-center justify-between text-xs font-mono text-[#6482A6] border-b border-dashed border-[#1A365D] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[#E6F4FF] font-semibold">
                      REGISTRO {String(selectedIndex! + 1).padStart(2, '0')} DE {String(filteredGallery.length).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-[#00D8FF]">
                    RESOLUÇÃO 4K UHD // ARQUIVO MEDTEC-RO
                  </span>
                </div>

                {/* Área da Fotografia com Cantoneiras Viewfinder */}
                <div className="relative flex-1 flex items-center justify-center my-auto min-h-[300px] max-h-[58vh] lg:max-h-[66vh] overflow-hidden rounded-xl bg-black/60 p-2 border border-white/5">
                  {/* Cantoneiras Técnicas do Viewfinder */}
                  <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-[#00D8FF]" />
                  <div className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-[#00D8FF]" />
                  <div className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-[#00D8FF]" />
                  <div className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-[#00D8FF]" />

                  {/* Mira Central */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="h-6 w-px bg-[#00D8FF]" />
                    <div className="w-6 h-px bg-[#00D8FF]" />
                  </div>

                  <img
                    src={activePhoto.imageUrl}
                    alt={activePhoto.title}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                  />
                </div>

                {/* HUD Inferior: Controles de Navegação Rápida */}
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-dashed border-[#1A365D] text-xs font-mono">
                  <button
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1A365D] bg-[#0C1E38] px-3.5 py-2 text-[#E6F4FF] hover:border-[#00D8FF] hover:text-[#00D8FF] transition-all cursor-pointer font-semibold"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>← ANTERIOR</span>
                  </button>

                  <span className="hidden sm:inline text-[11px] text-[#6482A6]">
                    USE AS SETAS DO TECLADO [ ← ] [ → ]
                  </span>

                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1A365D] bg-[#0C1E38] px-3.5 py-2 text-[#E6F4FF] hover:border-[#00D8FF] hover:text-[#00D8FF] transition-all cursor-pointer font-semibold"
                  >
                    <span>PRÓXIMA →</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

              </div>

              {/* ================= COLUNA DA DIREITA: FICHA TÉCNICA CATALOGRÁFICA (32%) ================= */}
              <div className="lg:w-[32%] bg-[#0C1E38] p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto max-h-[45vh] lg:max-h-[92vh]">
                
                <div className="space-y-4">
                  {/* Cabeçalho da Ficha */}
                  <div className="border-b border-dashed border-[#1A365D] pb-3">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00D8FF] font-semibold">
                      {'//'} FICHA CATALOGRÁFICA • MEDTEC-RO
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#6482A6]">
                      CÓDIGO: {activeMeta.regCode}
                    </p>
                  </div>

                  {/* Título e Descrição */}
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl uppercase font-medium leading-[1.05] text-[#E6F4FF]">
                      {activePhoto.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300 font-normal">
                      {activePhoto.description}
                    </p>
                  </div>

                  {/* TABELA TÉCNICA SEPARADA POR LINHAS 1PX DASHED */}
                  <div className="rounded-xl border border-[#1A365D] bg-[#061224]/80 p-3.5 space-y-2.5 font-mono text-xs">
                    
                    <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A365D] pb-2">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">CATEGORIA:</span>
                      <span className="text-[#00D8FF] font-semibold uppercase text-right">
                        {activePhoto.category}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A365D] pb-2">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">LOCALIDADE:</span>
                      <span className="text-[#E6F4FF] text-right">
                        {activeMeta.location}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A365D] pb-2">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">COORDENADAS:</span>
                      <span className="text-slate-300 text-right text-[11px]">
                        {activeMeta.coords}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A365D] pb-2">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">DATA REGISTRO:</span>
                      <span className="text-[#E6F4FF] font-semibold text-right">
                        {activePhoto.date}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A365D] pb-2">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">INFRAESTRUTURA:</span>
                      <span className="text-emerald-400 font-medium text-right text-[11px]">
                        {activeMeta.infra}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 pt-0.5">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">UNIDADE / ORIGEM:</span>
                      <span className="text-slate-300 text-right text-[11px]">
                        {activeMeta.origem}
                      </span>
                    </div>

                  </div>
                </div>

                {/* BOTÃO DE FECHAMENTO */}
                <div className="mt-6 pt-4 border-t border-dashed border-[#1A365D]">
                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="w-full rounded-xl border border-[#1A365D] bg-[#040B16] py-3 text-xs font-mono font-semibold text-[#E6F4FF] hover:border-[#00D8FF] hover:text-[#00D8FF] hover:bg-[#071326] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <X className="h-4 w-4" />
                    <span>[ ESC // FECHAR INSPETOR ]</span>
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
