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
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GallerySectionProps {
  gallery?: GalleryItem[];
  loading?: boolean;
  unavailable?: boolean;
  error?: string | null;
}

interface PhotoMetadata {
  location: string;
  municipio: string;
  infra: string;
  origem: string;
  bentoClass: string;
  aspectRatio: string;
}

// Informações institucionais de cada registro do MEDTEC
const CATALOG_INFO: Record<string, PhotoMetadata> = {
  'gal-1': {
    location: 'Porto Velho, RO, Estúdios SEDUC',
    municipio: 'Porto Velho',
    infra: 'Estúdio Central SEDUC, Transmissão via satélite e fibra óptica',
    origem: 'Coordenadoria de Mídias Educacionais (SEDUC-RO)',
    bentoClass: 'md:col-span-8',
    aspectRatio: 'h-[250px] sm:h-[270px]'
  },
  'gal-3': {
    location: 'Cacoal, RO, Terra Indígena Paiter Suruí',
    municipio: 'Cacoal',
    infra: 'Recepção satelital com alimentação solar fotovoltaica',
    origem: 'EEEFM Indígena Paiter Suruí (CRE Cacoal)',
    bentoClass: 'md:col-span-4',
    aspectRatio: 'h-[250px] sm:h-[270px]'
  },
  'gal-2': {
    location: 'Ji-Paraná, RO, Zona Rural (Setor Riachuelo)',
    municipio: 'Ji-Paraná',
    infra: 'Receptor satelital e tela interativa de 65 polegadas',
    origem: 'EEEFM Juscelino Kubitschek (Extensão Rural)',
    bentoClass: 'md:col-span-5',
    aspectRatio: 'h-[240px] sm:h-[260px]'
  },
  'gal-4': {
    location: 'Porto Velho, RO, Palácio Rio Madeira',
    municipio: 'Porto Velho',
    infra: 'Auditório multimídia com transmissão integrada',
    origem: 'Gerência de Capacitação Pedagógica (SEDUC-RO)',
    bentoClass: 'md:col-span-7',
    aspectRatio: 'h-[240px] sm:h-[260px]'
  },
  'gal-5': {
    location: 'Ariquemes, RO, Vale do Jamari',
    municipio: 'Ariquemes',
    infra: 'Estande tecnológico com conexão de apoio',
    origem: 'Mostra Estadual de Inovação Pedagógica MEDTEC',
    bentoClass: 'md:col-span-6',
    aspectRatio: 'h-[240px] sm:h-[260px]'
  },
  'gal-6': {
    location: 'Porto Velho, RO, Complexo de Mídias',
    municipio: 'Porto Velho',
    infra: 'Mesa de corte profissional, teleprompter e iluminação LED',
    origem: 'Estúdios de Transmissão da Coordenadoria de Mídias',
    bentoClass: 'md:col-span-6',
    aspectRatio: 'h-[240px] sm:h-[260px]'
  }
};

const EMPTY_GALLERY: GalleryItem[] = [];

export default function GallerySection({
  gallery = EMPTY_GALLERY,
  loading = false,
  unavailable = false,
  error = null,
}: GallerySectionProps) {
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
      location: 'Rondônia, Brasil',
      municipio: 'Rondônia',
      infra: 'Transmissão via satélite e rede estadual de ensino',
      origem: 'Coordenadoria de Mídias Educacionais (SEDUC-RO)',
      bentoClass: 'md:col-span-6',
      aspectRatio: 'min-h-[340px]'
    };
  }, [activePhoto]);

  // Navegação no Lightbox
  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : filteredGallery.length - 1));
  }, [selectedIndex, filteredGallery.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < filteredGallery.length - 1 ? prev! + 1 : 0));
  }, [selectedIndex, filteredGallery.length]);

  // Atalhos de Teclado (ESC, Setas Esquerda/Direita)
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
    <div className="relative w-full bg-[#F8FAFC] dark:bg-[#0B1528] text-slate-800 dark:text-slate-100 transition-colors">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-8">

        {/* BARRA DE FERRAMENTAS INSTITUCIONAL (exibida apenas quando há itens carregados) */}
        {!loading && !unavailable && !error && gallery.length > 0 && (
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Filtros de Categoria */}
            <div className="flex flex-wrap items-center gap-2">
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'border border-[#004A99] dark:border-sky-500 bg-[#004A99] dark:bg-sky-600 text-white font-semibold shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[11px] font-semibold tabular-nums ${isSelected ? 'text-sky-100' : 'text-slate-400 dark:text-slate-500'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Alternador de Modo de Visualização */}
            <div className="flex items-center gap-1.5 self-start md:self-auto shrink-0 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('bento')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer ${
                  viewMode === 'bento'
                    ? 'bg-white dark:bg-slate-800 text-[#004A99] dark:text-sky-400 border border-slate-200 dark:border-slate-700 shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Visualizar em grade"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Grade</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-800 text-[#004A99] dark:text-sky-400 border border-slate-200 dark:border-slate-700 shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Visualizar em lista"
              >
                <List className="h-3.5 w-3.5" />
                <span>Lista</span>
              </button>
            </div>

          </div>
        )}

        {/* CONTEÚDO */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center"
            >
              <Camera className="mx-auto h-10 w-10 text-[#004A99] dark:text-sky-400 mb-3 animate-pulse" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Carregando acervo fotográfico...
              </p>
            </motion.div>
          ) : unavailable || error ? (
            <motion.div
              key="unavailable"
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-900/60 p-12 text-center space-y-2"
            >
              <Camera className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400 mb-3" aria-hidden="true" />
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                Acervo fotográfico indisponível no momento
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                {error || 'A consulta pública de fotografias ainda não está disponível para visitantes. Tente novamente mais tarde.'}
              </p>
            </motion.div>
          ) : gallery.length === 0 ? (
            <motion.div
              key="empty-gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center"
            >
              <Camera className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" aria-hidden="true" />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Nenhum registro fotográfico publicado até o momento.
              </p>
            </motion.div>
          ) : filteredGallery.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center"
            >
              <Camera className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Nenhum registro fotográfico encontrado para a categoria selecionada.
              </p>
              <button
                onClick={() => setSelectedCategory('Todas')}
                className="mt-3 text-xs text-[#004A99] dark:text-sky-400 hover:underline cursor-pointer"
              >
                Ver todos os registros
              </button>
            </motion.div>
          ) : viewMode === 'bento' ? (
            <motion.div
              key="bento-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-5"
            >
              {filteredGallery.map((photo, index) => {
                const meta = CATALOG_INFO[photo.id] || {
                  location: 'Rondônia, Brasil',
                  municipio: 'Rondônia',
                  infra: 'Transmissão via satélite e rede estadual',
                  origem: 'Coordenadoria de Mídias Educacionais (SEDUC-RO)',
                  bentoClass: 'md:col-span-6',
                  aspectRatio: 'min-h-[340px]'
                };

                const gridSpanClass = filteredGallery.length < 4 ? 'md:col-span-6' : meta.bentoClass;

                return (
                  <motion.div
                    key={photo.id}
                    layout
                    onClick={() => setSelectedIndex(index)}
                    className={`group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 hover:border-[#004A99] dark:hover:border-sky-500 transition-all duration-200 ease-out cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-end active:scale-[0.99] ${gridSpanClass} ${meta.aspectRatio}`}
                  >
                    {/* Imagem Limpa de Fundo */}
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Gradiente Suave de Leitura */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent group-hover:from-slate-950/95 transition-all duration-200" />

                    {/* BASE DO CARD: Informações institucionais limpas */}
                    <div className="relative z-10 p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-sky-200 font-medium">
                        <span className="bg-black/60 px-2 py-0.5 rounded text-[11px] font-semibold text-white">
                          {photo.category}
                        </span>
                        <span>•</span>
                        <span>{photo.date}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-sky-300 shrink-0" />
                          {meta.location}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-semibold leading-snug text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                        {photo.title}
                      </h3>

                      <div className="max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-200 ease-out overflow-hidden pt-0.5">
                        <p className="text-xs text-slate-200 line-clamp-2">
                          {photo.description}
                        </p>

                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-sky-300">
                          <span className="flex items-center gap-1 font-semibold text-xs">
                            <Maximize2 className="h-3.5 w-3.5" />
                            <span>Ampliar imagem</span>
                          </span>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs"
            >
              {filteredGallery.map((photo, index) => {
                const meta = CATALOG_INFO[photo.id] || {
                  location: 'Rondônia, Brasil',
                  municipio: 'Rondônia',
                  infra: 'Transmissão via satélite e rede estadual',
                  origem: 'Coordenadoria de Mídias Educacionais (SEDUC-RO)',
                  bentoClass: 'md:col-span-6',
                  aspectRatio: 'min-h-[340px]'
                };

                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedIndex(index)}
                    className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="relative h-16 w-24 sm:h-18 sm:w-28 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2 py-0.5 text-xs text-[#004A99] dark:text-sky-300 font-semibold">
                          {photo.category}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {photo.date} • {meta.location}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition-colors truncate">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                        {photo.description}
                      </p>
                    </div>

                    <div className="shrink-0 self-end md:self-center">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 text-xs text-[#004A99] dark:text-sky-400 group-hover:bg-[#004A99] group-hover:text-white dark:group-hover:bg-sky-600 dark:group-hover:text-white transition-all font-semibold">
                        <Maximize2 className="h-3 w-3" />
                        <span>Ampliar</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* MODAL LIGHTBOX INSTITUCIONAL */}
      <AnimatePresence>
        {activePhoto && activeMeta && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-[92vh] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col lg:flex-row"
            >
              {/* Botão Fechar Mobile */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="lg:hidden absolute top-3 right-3 z-30 rounded-lg border border-white/20 bg-black/70 p-2 text-white hover:bg-white hover:text-black transition-colors"
                aria-label="Fechar visualização"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Coluna da Imagem */}
              <div className="relative lg:w-[68%] bg-black flex flex-col justify-between p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-800">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                  <span className="text-white font-medium">
                    Registro {selectedIndex! + 1} de {filteredGallery.length}
                  </span>
                  <span className="hidden sm:inline text-sky-400 font-medium">
                    Acervo Institucional MEDTEC-RO
                  </span>
                </div>

                <div className="relative flex-1 flex items-center justify-center my-auto min-h-[300px] max-h-[58vh] lg:max-h-[66vh] overflow-hidden rounded-lg bg-black/60 p-2">
                  <img
                    src={activePhoto.imageUrl}
                    alt={activePhoto.title}
                    className="max-h-full max-w-full object-contain rounded-md select-none"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <button
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-white hover:border-sky-500 hover:text-sky-400 transition-all cursor-pointer font-medium"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </button>

                  <span className="hidden sm:inline text-xs text-slate-400">
                    Navegue pelas setas do teclado
                  </span>

                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-white hover:border-sky-500 hover:text-sky-400 transition-all cursor-pointer font-medium"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Coluna de Informações */}
              <div className="lg:w-[32%] bg-slate-900 p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto max-h-[45vh] lg:max-h-[92vh]">
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
                      Registro de Imagem
                    </p>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-snug text-white">
                      {activePhoto.title}
                    </h2>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                      {activePhoto.description}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="text-slate-400 uppercase text-[11px] font-semibold">Categoria:</span>
                      <span className="text-sky-300 font-semibold text-right">
                        {activePhoto.category}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="text-slate-400 uppercase text-[11px] font-semibold">Localidade:</span>
                      <span className="text-slate-200 text-right">
                        {activeMeta.location}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="text-slate-400 uppercase text-[11px] font-semibold">Data do registro:</span>
                      <span className="text-slate-200 font-medium text-right tabular-nums">
                        {activePhoto.date}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="text-slate-400 uppercase text-[11px] font-semibold">Infraestrutura:</span>
                      <span className="text-slate-200 font-medium text-right">
                        {activeMeta.infra}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 pt-0.5">
                      <span className="text-slate-400 uppercase text-[11px] font-semibold">Origem:</span>
                      <span className="text-slate-300 text-right">
                        {activeMeta.origem}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:border-sky-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span>Fechar visualização</span>
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
