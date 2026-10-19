'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { NewsItem } from '@/types';
import {
  Newspaper,
  LayoutGrid,
  List,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Radio,
  Search,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsEditorialSectionProps {
  news: NewsItem[];
}

interface NewsMetadata {
  regCode: string;
  polo: string;
  bentoClass: string;
  aspectRatio: string;
}

// Fallback de imagem de tecnologia e educação de alta resolução
const FALLBACK_NEWS_COVER =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

export default function NewsEditorialSection({ news = [] }: NewsEditorialSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'bento' | 'list'>('bento');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Filtra itens despublicados
  const publishedNews = useMemo(() => {
    return news.filter((item) => item.published !== false);
  }, [news]);

  // Contagem dinâmica por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todas: publishedNews.length,
    };
    publishedNews.forEach((item) => {
      const cat = item.category || 'Geral';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [publishedNews]);

  // Lista única de categorias
  const categoriesList = useMemo(() => {
    const base = ['Todas'];
    publishedNews.forEach((item) => {
      const cat = item.category || 'Geral';
      if (!base.includes(cat)) {
        base.push(cat);
      }
    });
    return base;
  }, [publishedNews]);

  // Filtro ativo de categoria e busca textual
  const filteredNews = useMemo(() => {
    return publishedNews.filter((item) => {
      const matchCat =
        selectedCategory === 'Todas' ||
        (item.category || 'Geral') === selectedCategory;

      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(term)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(term)));

      return matchCat && matchSearch;
    });
  }, [publishedNews, selectedCategory, searchTerm]);

  // Calcula classes de layout Bento proporcionais para formar linhas harmoniosas de 12 colunas
  const getBentoMeta = useCallback((index: number, total: number): NewsMetadata => {
    const regCode = `NOT_${String(index + 1).padStart(2, '0')} // RO`;
    const polos = [
      'Estúdios SEDUC • Porto Velho',
      'Calha Fluvial • Baixo Madeira',
      'Polo Central • Ji-Paraná',
      'Terras Indígenas • Cacoal',
      'Polo Fronteira • Vale do Guaporé',
      'Vale do Jamari • Ariquemes',
      'Cone Sul • Vilhena'
    ];
    const polo = polos[index % polos.length];

    if (total <= 2) {
      return {
        regCode,
        polo,
        bentoClass: 'md:col-span-6',
        aspectRatio: 'min-h-[380px]',
      };
    }

    // Padrão editorial: 1º destaque grande (8 cols), 2º complemento (4 cols), 3º (5 cols), 4º (7 cols), demais (6 cols)
    const pattern = index % 6;
    if (pattern === 0) {
      return {
        regCode,
        polo,
        bentoClass: 'md:col-span-8 md:row-span-2',
        aspectRatio: 'min-h-[460px] md:min-h-[520px]',
      };
    } else if (pattern === 1) {
      return {
        regCode,
        polo,
        bentoClass: 'md:col-span-4 md:row-span-2',
        aspectRatio: 'min-h-[460px] md:min-h-[520px]',
      };
    } else if (pattern === 2) {
      return {
        regCode,
        polo,
        bentoClass: 'md:col-span-5',
        aspectRatio: 'min-h-[350px]',
      };
    } else if (pattern === 3) {
      return {
        regCode,
        polo,
        bentoClass: 'md:col-span-7',
        aspectRatio: 'min-h-[350px]',
      };
    } else {
      return {
        regCode,
        polo,
        bentoClass: 'md:col-span-6',
        aspectRatio: 'min-h-[350px]',
      };
    }
  }, []);

  // Notícia ativa inspecionada no Lightbox
  const activeNews = useMemo(() => {
    if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= filteredNews.length) {
      return null;
    }
    return filteredNews[selectedIndex];
  }, [selectedIndex, filteredNews]);

  const activeMeta = useMemo(() => {
    if (selectedIndex === null || !activeNews) return null;
    return getBentoMeta(selectedIndex, filteredNews.length);
  }, [selectedIndex, activeNews, filteredNews.length, getBentoMeta]);

  // Navegação no Lightbox
  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : filteredNews.length - 1));
  }, [selectedIndex, filteredNews.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < filteredNews.length - 1 ? prev! + 1 : 0));
  }, [selectedIndex, filteredNews.length]);

  // Atalhos de teclado
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
      
      {/* Grade Cartesiana Sutil de Fundo */}
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* Glow Sutil de Horizonte Ciano */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-3/4 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-24 space-y-8">

        {/* ========================================================
            1. HEADER ÚNICO IMERSIVO (DARKROOM EDITORIAL)
        ======================================================== */}
        <div className="space-y-4">
          {/* Tag Técnica Monoespaçada */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-[#0C1E38]/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#00D8FF] shadow-[0_0_16px_rgba(0,216,255,0.15)]">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span>{'//'} COBERTURA & JORNALISMO OFICIAL • SEDUC-RO</span>
          </div>

          {/* Título Display Escultural (Estilo Oryzo / Editorial) */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[51px] uppercase font-medium leading-[0.9] tracking-tight text-[#E6F4FF]">
            Notícias e Coberturas do MEDTEC.
          </h1>

          {/* Subtítulo Conversacional */}
          <p className="max-w-3xl text-base sm:text-[21px] font-normal leading-relaxed text-[#E6F4FF]/80">
            Acompanhe as ações pedagógicas síncronas, entregas de infraestrutura de satélite e conectividade nos 52 municípios de Rondônia e as histórias reais dos nossos estudantes e professores.
          </p>
        </div>

        {/* ========================================================
            2. BARRA DE FERRAMENTAS TÉCNICA (FILTROS + BUSCA + MODO DE EXIBIÇÃO)
        ======================================================== */}
        <div className="border-y border-dashed border-[#1A365D] py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
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

          {/* Direita: Busca Textual Rápida + Alternador de Exibição */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Campo de Busca Rápida */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6482A6]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar reportagem..."
                className="w-full rounded-xl border border-[#1A365D] bg-[#061224] pl-9 pr-8 py-1.5 text-xs font-mono text-[#E6F4FF] placeholder-[#6482A6] focus:border-[#00D8FF] focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Alternador de Modo de Visualização */}
            <div className="flex items-center gap-1.5 shrink-0 bg-[#061224] p-1 rounded-xl border border-[#1A365D]">
              <button
                onClick={() => setViewMode('bento')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  viewMode === 'bento'
                    ? 'bg-[#0C1E38] text-[#00D8FF] border border-[#00D8FF]/70 shadow-sm font-semibold'
                    : 'text-[#6482A6] hover:text-white'
                }`}
                title="Visualizar em mosaico editorial Bento Grid"
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
                title="Visualizar como índice e arquivo técnico"
              >
                <List className="h-3.5 w-3.5" />
                <span>☰ ÍNDICE TÉCNICO</span>
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================
            3. CONTEÚDO PRINCIPAL: BENTO GRID ASSIMÉTRICO OU ÍNDICE
        ======================================================== */}
        <AnimatePresence mode="wait">
          {filteredNews.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-dashed border-[#1A365D] bg-[#0C1E38]/40 p-12 text-center"
            >
              <Newspaper className="mx-auto h-10 w-10 text-slate-500 mb-3" />
              <p className="text-sm font-mono text-slate-300">
                Nenhuma reportagem encontrada com os termos ou categoria selecionados.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Todas');
                  setSearchTerm('');
                }}
                className="mt-3 text-xs font-mono text-[#00D8FF] hover:underline cursor-pointer"
              >
                Restaurar visualização completa
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
              {filteredNews.map((item, index) => {
                const meta = getBentoMeta(index, filteredNews.length);
                const cover = item.coverImage || FALLBACK_NEWS_COVER;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    onClick={() => setSelectedIndex(index)}
                    className={`group relative overflow-hidden rounded-[12px] border border-[#1A365D] bg-[#0C1E38] hover:border-[#00D8FF] transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between ${meta.bentoClass} ${meta.aspectRatio}`}
                  >
                    {/* Imagem de Capa com Zoom Suave no Hover */}
                    <img
                      src={cover}
                      alt={item.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_NEWS_COVER;
                      }}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradiente Escuro de Proteção e Contraste Tipográfico */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040B16] via-[#040B16]/40 to-[#040B16]/45 group-hover:from-[#040B16]/95 group-hover:via-[#040B16]/55 transition-all duration-300" />

                    {/* Cantoneiras de Viewfinder HUD nos 4 cantos */}
                    <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[#00D8FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[#00D8FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#00D8FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#00D8FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* TOPO DO CARD: BADGE TÉCNICA E CÓDIGO EDITORIAL */}
                    <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
                      <span className="backdrop-blur-md bg-[#040B16]/85 border border-[#1A365D] text-[#00D8FF] text-[11px] uppercase font-mono px-3 py-1 rounded-full font-semibold shadow-sm">
                        {item.category || 'Geral'}
                      </span>

                      <span className="backdrop-blur-md bg-[#040B16]/85 border border-[#1A365D] text-[#6482A6] group-hover:text-[#E6F4FF] text-[11px] font-mono px-2.5 py-1 rounded-full transition-colors">
                        {meta.regCode}
                      </span>
                    </div>

                    {/* BASE DO CARD: DATA, POLO, TÍTULO E DESLIZAMENTO DO RESUMO NO HOVER */}
                    <div className="relative z-10 p-5 sm:p-6 space-y-2">
                      {/* Linha de Data e Polo Regional */}
                      <p className="text-[11px] font-mono uppercase tracking-wider text-[#6482A6]">
                        {item.publishedAt} • 📍 {meta.polo}
                      </p>

                      {/* Título da Notícia em Destaque */}
                      <h3 className="font-display text-lg sm:text-xl font-medium uppercase leading-snug text-[#E6F4FF] group-hover:text-[#00D8FF] transition-colors">
                        {item.title}
                      </h3>

                      {/* Excerpt completo e botão que desliza no hover */}
                      <div className="max-h-0 opacity-0 group-hover:max-h-56 group-hover:opacity-100 transition-all duration-400 ease-out overflow-hidden">
                        <p className="text-xs text-slate-300 leading-relaxed font-normal pt-1.5 line-clamp-3">
                          {item.excerpt}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-dashed border-[#1A365D] flex items-center justify-between text-xs font-mono text-[#00D8FF]">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Maximize2 className="h-3.5 w-3.5" />
                            <span>[ ⊕ ABRIR COBERTURA COMPLETA ]</span>
                          </span>
                          <span className="text-[10px] text-[#6482A6] hidden sm:inline">
                            {item.author || 'Equipe SEDUC'}
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
              {filteredNews.map((item, index) => {
                const meta = getBentoMeta(index, filteredNews.length);
                const cover = item.coverImage || FALLBACK_NEWS_COVER;

                return (
                  <div
                    key={item.id}
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
                          src={cover}
                          alt={item.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_NEWS_COVER;
                          }}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Título e Descrição */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-mono uppercase text-[#00D8FF] font-semibold">
                          {item.category || 'Geral'}
                        </span>
                        <span className="text-xs font-mono text-[#6482A6]">
                          {item.publishedAt} • {meta.polo}
                        </span>
                      </div>
                      <h3 className="font-mono text-sm sm:text-base uppercase font-semibold text-[#E6F4FF] group-hover:text-[#00D8FF] transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                        {item.excerpt}
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
          4. MODAL LIGHTBOX SPLIT-SCREEN (INSPEÇÃO DE REPORTAGEM)
      ======================================================== */}
      <AnimatePresence>
        {activeNews && activeMeta && (
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
              
              {/* Botão Fechar Mobile */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="lg:hidden absolute top-3 right-3 z-30 rounded-full border border-white/20 bg-black/70 p-2 text-white hover:bg-white hover:text-black transition-colors"
                aria-label="Fechar leitor"
              >
                <X className="h-5 w-5" />
              </button>

              {/* ================= COLUNA DA ESQUERDA: VISUALIZADOR HUD (64%) ================= */}
              <div className="relative lg:w-[64%] bg-[#020710] flex flex-col justify-between p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#1A365D]">
                
                {/* HUD Superior */}
                <div className="mb-3 flex items-center justify-between text-xs font-mono text-[#6482A6] border-b border-dashed border-[#1A365D] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[#E6F4FF] font-semibold">
                      COBERTURA {String(selectedIndex! + 1).padStart(2, '0')} DE {String(filteredNews.length).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-[#00D8FF]">
                    SINAL ATIVO // ARQUIVO DE REPORTAGENS SEDUC-RO
                  </span>
                </div>

                {/* Área da Imagem de Capa com Viewfinder */}
                <div className="relative flex-1 flex items-center justify-center my-auto min-h-[280px] max-h-[55vh] lg:max-h-[64vh] overflow-hidden rounded-xl bg-black/60 p-2 border border-white/5">
                  {/* Cantoneiras Técnicas */}
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
                    src={activeNews.coverImage || FALLBACK_NEWS_COVER}
                    alt={activeNews.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_NEWS_COVER;
                    }}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                  />
                </div>

                {/* HUD Inferior: Controles de Navegação */}
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-dashed border-[#1A365D] text-xs font-mono">
                  <button
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1A365D] bg-[#0C1E38] px-3.5 py-2 text-[#E6F4FF] hover:border-[#00D8FF] hover:text-[#00D8FF] transition-all cursor-pointer font-semibold"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>← ANTERIOR</span>
                  </button>

                  <span className="hidden sm:inline text-[11px] text-[#6482A6]">
                    NAVEGUE PELO TECLADO [ ← ] [ → ]
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

              {/* ================= COLUNA DA DIREITA: FICHA EDITORIAL E CONTEÚDO (36%) ================= */}
              <div className="lg:w-[36%] bg-[#0C1E38] p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto max-h-[45vh] lg:max-h-[92vh]">
                
                <div className="space-y-4">
                  {/* Cabeçalho da Ficha */}
                  <div className="border-b border-dashed border-[#1A365D] pb-3">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00D8FF] font-semibold">
                      {'//'} COBERTURA OFICIAL • MEDTEC-RO
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#6482A6]">
                      REGISTRO: {activeMeta.regCode}
                    </p>
                  </div>

                  {/* Título e Lead */}
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl uppercase font-medium leading-[1.1] text-[#E6F4FF]">
                      {activeNews.title}
                    </h2>
                    {activeNews.excerpt && (
                      <p className="mt-3 text-sm leading-relaxed text-cyan-200/90 font-mono italic bg-[#061224]/70 p-3 rounded-lg border-l-2 border-[#00D8FF]">
                        &ldquo;{activeNews.excerpt}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* TABELA TÉCNICA 1PX DASHED */}
                  <div className="rounded-xl border border-[#1A365D] bg-[#061224]/80 p-3.5 space-y-2.5 font-mono text-xs">
                    
                    <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A365D] pb-2">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">CATEGORIA:</span>
                      <span className="text-[#00D8FF] font-semibold uppercase text-right">
                        {activeNews.category || 'Geral'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A365D] pb-2">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">DATA DE VEICULAÇÃO:</span>
                      <span className="text-[#E6F4FF] font-semibold text-right">
                        {activeNews.publishedAt}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A365D] pb-2">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">POLO / COBERTURA:</span>
                      <span className="text-[#E6F4FF] text-right">
                        {activeMeta.polo}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A365D] pb-2">
                      <span className="text-[#6482A6] uppercase text-[10px] font-bold">AUTOR / REDAÇÃO:</span>
                      <span className="text-slate-300 text-right">
                        {activeNews.author || 'Assessoria de Comunicação SEDUC-RO'}
                      </span>
                    </div>

                    {activeNews.tags && activeNews.tags.length > 0 && (
                      <div className="flex items-start justify-between gap-2 pt-0.5">
                        <span className="text-[#6482A6] uppercase text-[10px] font-bold">TAGS:</span>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                          {activeNews.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* CONTEÚDO INTEGRAL DA NOTÍCIA */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-[#6482A6] font-semibold">
                      [ TEXTO DA REPORTAGEM ]
                    </h4>
                    <div className="text-sm leading-relaxed text-slate-300 font-normal whitespace-pre-line space-y-3">
                      {activeNews.content || activeNews.excerpt}
                    </div>
                  </div>

                </div>

                {/* BOTÕES DE AÇÃO NO RODAPÉ */}
                <div className="mt-6 pt-4 border-t border-dashed border-[#1A365D] space-y-2">
                  <Link
                    href={`/noticias/${activeNews.id}`}
                    className="w-full rounded-xl border border-[#00D8FF] bg-[#0C1E38] hover:bg-[#00D8FF] text-[#00D8FF] hover:text-slate-950 py-2.5 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,216,255,0.15)]"
                  >
                    <span>ABRIR PÁGINA PERMANENTE</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="w-full rounded-xl border border-[#1A365D] bg-[#040B16] py-2.5 text-xs font-mono font-semibold text-[#6482A6] hover:border-slate-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>[ ESC // FECHAR LEITOR ]</span>
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
