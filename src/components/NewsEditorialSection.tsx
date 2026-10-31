'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback, useId, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ApiError,
  getMediaUrl,
  medtecApi,
  type CategoriaPublica,
  type NoticiaPublica,
  type PaginationMeta,
} from '@/lib/api';
import { sanitizeSearchInput } from '@/lib/security';
import {
  Newspaper,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Radio,
  Search,
  ArrowRight,
  ArrowUpRight,
  Share2,
  Check,
  BookOpen,
} from 'lucide-react';

type NoticiasQuery = {
  page: number;
  per_page: number;
  categoria: string;
  busca: string;
};

function readNewsError(cause: unknown, subject: string): string {
  return cause instanceof ApiError && cause.status === 0
    ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
    : `${subject} indisponíveis no momento. Tente novamente em instantes.`;
}

export default function NewsEditorialSection() {
  const id = useId();
  const [items, setItems] = useState<NoticiaPublica[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<CategoriaPublica[]>([]);
  const [query, setQuery] = useState<NoticiasQuery>({
    page: 1,
    per_page: 9,
    categoria: '',
    busca: '',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'magazine' | 'list'>('magazine');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const lifecycle = useRef(0);
  const readVersion = useRef(0);
  const categoryVersion = useRef(0);

  // Estado do Carrossel Editorial Discreto (até 4 destaques da página atual)
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Conforto visual no Leitor Imersivo: tamanho da fonte ('sm' | 'base' | 'lg' | 'xl')
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const articleScrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (requested: NoticiasQuery, signal?: AbortSignal) => {
    const request = ++readVersion.current;
    const generation = lifecycle.current;
    setLoading(true);
    setError(null);
    try {
      const response = await medtecApi.noticias.listPublico(
        {
          page: requested.page,
          per_page: requested.per_page,
          categoria: requested.categoria || undefined,
          busca: requested.busca || undefined,
        },
        signal
      );
      if (signal?.aborted || generation !== lifecycle.current || request !== readVersion.current) return;
      const lastPage = Math.max(1, response.data.pagination.total_pages);
      if (requested.page > lastPage) {
        setQuery((previous) => ({ ...previous, page: lastPage }));
        return;
      }
      setItems(response.data.items);
      setPagination(response.data.pagination);
      setActiveSlide(0);
      setActiveArticleSlug(null);
    } catch (cause) {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) {
        setError(readNewsError(cause, 'Notícias'));
      }
    } finally {
      if (!signal?.aborted && generation === lifecycle.current && request === readVersion.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadCategories = useCallback(async (signal?: AbortSignal) => {
    const request = ++categoryVersion.current;
    const generation = lifecycle.current;
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const response = await medtecApi.noticias.listCategoriasPublico(signal);
      if (!signal?.aborted && generation === lifecycle.current && request === categoryVersion.current) {
        setCategories(response.data);
      }
    } catch (cause) {
      if (!signal?.aborted && generation === lifecycle.current && request === categoryVersion.current) {
        setCategoriesError(readNewsError(cause, 'Categorias'));
      }
    } finally {
      if (!signal?.aborted && generation === lifecycle.current && request === categoryVersion.current) {
        setCategoriesLoading(false);
      }
    }
  }, []);

  useEffect(() => () => {
    lifecycle.current += 1;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) void load(query, controller.signal);
    });
    return () => {
      controller.abort();
      readVersion.current += 1;
    };
  }, [query, load]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) void loadCategories(controller.signal);
    });
    return () => {
      controller.abort();
      categoryVersion.current += 1;
    };
  }, [loadCategories]);

  function updateQuery(next: NoticiasQuery) {
    setLoading(true);
    setActiveArticleSlug(null);
    setActiveSlide(0);
    setQuery(next);
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    updateQuery({
      ...query,
      page: 1,
      busca: sanitizeSearchInput(searchTerm).trim(),
    });
  }

  function resetFilters() {
    setSearchTerm('');
    updateQuery({
      ...query,
      page: 1,
      busca: '',
      categoria: '',
    });
  }

  // Até 4 notícias da página atual para o destaque do Modo Revista
  const carouselArticles = useMemo(() => {
    return items.slice(0, 4);
  }, [items]);

  // Autoplay de 5 segundos com pausa ao passar o mouse ou focar
  useEffect(() => {
    if (isPaused || carouselArticles.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselArticles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, carouselArticles.length]);

  const handlePrevSlide = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveSlide((prev) => (prev > 0 ? prev - 1 : carouselArticles.length - 1));
    },
    [carouselArticles.length]
  );

  const handleNextSlide = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveSlide((prev) => (prev + 1) % carouselArticles.length);
    },
    [carouselArticles.length]
  );

  // Artigo ativo aberto no Leitor Imersivo
  const activeNews = useMemo(() => {
    if (!activeArticleSlug) return null;
    return items.find((item) => item.slug === activeArticleSlug) || null;
  }, [activeArticleSlug, items]);

  // Notícias da página atual para "Leia Também"
  const relatedNews = useMemo(() => {
    if (!activeNews) return [];
    return items.filter((n) => n.slug !== activeNews.slug).slice(0, 2);
  }, [activeNews, items]);

  const handlePrev = useCallback(() => {
    if (!activeArticleSlug || items.length === 0) return;
    const currentIndex = items.findIndex((item) => item.slug === activeArticleSlug);
    if (currentIndex === -1) return;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    setActiveArticleSlug(items[prevIndex].slug);
  }, [activeArticleSlug, items]);

  const handleNext = useCallback(() => {
    if (!activeArticleSlug || items.length === 0) return;
    const currentIndex = items.findIndex((item) => item.slug === activeArticleSlug);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    setActiveArticleSlug(items[nextIndex].slug);
  }, [activeArticleSlug, items]);

  const handleArticleScroll = useCallback(() => {
    if (!articleScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = articleScrollRef.current;
    const scrollableDist = scrollHeight - clientHeight;
    if (scrollableDist <= 0) {
      setReadingProgress(100);
    } else {
      const pct = Math.min(100, Math.max(0, (scrollTop / scrollableDist) * 100));
      setReadingProgress(pct);
    }
  }, []);

  useEffect(() => {
    if (!activeArticleSlug) return;

    queueMicrotask(() => {
      setReadingProgress(0);
    });
    if (articleScrollRef.current && typeof articleScrollRef.current.scrollTo === 'function') {
      articleScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveArticleSlug(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', handleKeyDown);
    }
    if (typeof document !== 'undefined' && document.body?.style) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('keydown', handleKeyDown);
      }
      if (typeof document !== 'undefined' && document.body?.style) {
        document.body.style.overflow = 'auto';
      }
    };
  }, [activeArticleSlug, handlePrev, handleNext]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && activeNews) {
      const detailUrl = `${window.location.origin}/noticias/${encodeURIComponent(activeNews.slug)}`;
      navigator.clipboard.writeText(detailUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const currentSlideArticle = carouselArticles[activeSlide] || carouselArticles[0] || null;
  const currentSlideCover = currentSlideArticle ? getMediaUrl(currentSlideArticle.imagem_capa) : '';

  return (
    <div className="relative w-full bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-10">
        {/* ========================================================
            BARRA DE CONTROLE EDITORIAL (CATEGORIAS OFICIAIS + BUSCA + MODOS)
        ======================================================== */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white/95 dark:bg-[#0C1E38]/90 p-4 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Esquerda: Filtros de Categoria Oficial */}
            <div
              role="group"
              aria-label="Filtrar por categoria"
              className="flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap pb-1 sm:pb-0"
            >
              <button
                type="button"
                aria-pressed={query.categoria === ''}
                onClick={() => updateQuery({ ...query, categoria: '', page: 1 })}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                  query.categoria === ''
                    ? 'border border-[#004A99] dark:border-[#00D8FF] bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 font-bold shadow-sm'
                    : 'border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224]/60 text-slate-600 dark:text-[#6482A6] hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas as categorias
              </button>

              {categoriesLoading && (
                <p role="status" className="text-xs text-slate-600 dark:text-slate-400 px-2">
                  Carregando categorias...
                </p>
              )}

              {!categoriesLoading &&
                !categoriesError &&
                categories.map((cat) => {
                  const isSelected = query.categoria === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => updateQuery({ ...query, categoria: cat.slug, page: 1 })}
                      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                        isSelected
                          ? 'border border-[#004A99] dark:border-[#00D8FF] bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 font-bold shadow-sm'
                          : 'border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224]/60 text-slate-600 dark:text-[#6482A6] hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat.nome}
                    </button>
                  );
                })}

              {!categoriesLoading && !categoriesError && categories.length === 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400 px-2">
                  Nenhuma categoria disponível.
                </p>
              )}
            </div>

            {/* Direita: Busca Oficial por Título + Modos Jornalísticos */}
            <div className="flex flex-wrap items-center gap-3">
              <form
                aria-label="Buscar notícias"
                onSubmit={handleSearch}
                className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial"
              >
                <label htmlFor={`${id}-busca`} className="sr-only">
                  Buscar por título da notícia
                </label>
                <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-[#6482A6]"
                  />
                  <input
                    id={`${id}-busca`}
                    name="busca"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
                    maxLength={100}
                    placeholder="Pesquisar reportagem..."
                    className="w-full rounded-lg border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-[#E6F4FF] placeholder-slate-400 dark:placeholder-[#6482A6] focus:border-[#004A99] dark:focus:border-[#00D8FF] focus:outline-hidden focus:ring-1 focus:ring-[#004A99] dark:focus:ring-[#00D8FF] transition-all duration-150"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 dark:border-[#1A365D] bg-white dark:bg-[#061224] px-3 py-2 text-xs font-semibold text-[#004A99] dark:text-[#00D8FF] hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg border border-slate-300 dark:border-[#1A365D] bg-white dark:bg-[#061224] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Limpar filtros
                </button>
              </form>

              {/* Alternador de Modos: Revista vs Lista */}
              <div className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-[#061224] p-1 rounded-lg border border-slate-200 dark:border-[#1A365D]">
                <button
                  type="button"
                  onClick={() => setViewMode('magazine')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                    viewMode === 'magazine'
                      ? 'bg-white dark:bg-[#0C1E38] text-[#004A99] dark:text-[#00D8FF] shadow-xs border border-slate-200 dark:border-cyan-400/30 font-bold'
                      : 'text-slate-500 dark:text-[#6482A6] hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Modo Revista: Visualização ampla em cards"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Revista</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#0C1E38] text-[#004A99] dark:text-[#00D8FF] shadow-xs border border-slate-200 dark:border-cyan-400/30 font-bold'
                      : 'text-slate-500 dark:text-[#6482A6] hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Lista de Leitura: Visualização compacta contínua"
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
              </div>
            </div>
          </div>

          {categoriesError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 px-3.5 py-2.5 text-xs text-red-700 dark:text-red-300"
            >
              <span>{categoriesError}</span>
              <button
                type="button"
                disabled={categoriesLoading}
                onClick={() => void loadCategories()}
                className="rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 px-3 py-1 font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 cursor-pointer disabled:opacity-50"
              >
                Recarregar categorias
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            ESTADOS DE CARREGAMENTO, ERRO E VAZIO DA LISTAGEM
        ======================================================== */}
        {query.busca && (
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Busca por título: “{query.busca}”
          </p>
        )}

        {loading && (
          <div
            role="status"
            className="rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38]/50 p-12 text-center space-y-3"
          >
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Carregando notícias...
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#0C1E38] p-6 space-y-3 text-sm text-red-700 dark:text-red-300"
          >
            <p>{error}</p>
            <button
              type="button"
              disabled={loading}
              onClick={() => void load(query)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-[#004A99] dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && pagination && items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38]/50 p-12 text-center space-y-3">
            <Newspaper className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-display">
              Nenhuma reportagem encontrada
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Não encontramos notícias publicadas para os termos ou filtros selecionados.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 text-xs font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Restaurar todas as notícias
            </button>
          </div>
        )}

        {!loading && !error && items.length > 0 && viewMode === 'magazine' && (
          /* ========================================================
              MODO REVISTA (MANCHETE EM DESTAQUE + GRADE DE CARDS)
          ======================================================== */
          <div className="space-y-10">
            {currentSlideArticle && (
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                className="group relative overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs hover:shadow-md transition-all duration-200 max-h-[340px] lg:h-[320px]"
              >
                <div
                  key={currentSlideArticle.slug}
                  className="grid grid-cols-1 lg:grid-cols-12 items-stretch h-full transition-opacity duration-200"
                >
                    {/* Coluna da Imagem (5 colunas no desktop) */}
                    <div
                      onClick={() => setActiveArticleSlug(currentSlideArticle.slug)}
                      className="relative lg:col-span-5 h-44 sm:h-52 lg:h-full overflow-hidden bg-slate-900 cursor-pointer flex items-center justify-center"
                    >
                      {currentSlideCover ? (
                        <img
                          src={currentSlideCover}
                          alt={currentSlideArticle.titulo}
                          className="h-full w-full object-cover transition-opacity duration-300"
                          loading="eager"
                          decoding="async"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <Newspaper className="h-12 w-12 text-slate-600" aria-hidden="true" />
                      )}
                    </div>

                    {/* Coluna Editorial (7 colunas no desktop) */}
                    <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between h-full bg-white dark:bg-[#0C1E38]">
                      <div className="space-y-2">
                        {/* Kicker Oficial: Categoria • Data + Indicador Numérico */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-[#004A99] dark:text-[#00D8FF] font-semibold text-xs truncate">
                            {currentSlideArticle.categoria_nome && (
                              <span className="truncate shrink-0 font-bold">
                                {currentSlideArticle.categoria_nome}
                              </span>
                            )}
                            {currentSlideArticle.categoria_nome && currentSlideArticle.data_publicacao && (
                              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
                            )}
                            {currentSlideArticle.data_publicacao && (
                              <span className="tabular-nums font-medium text-slate-500 dark:text-slate-400 shrink-0">
                                {currentSlideArticle.data_publicacao}
                              </span>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums bg-slate-100 dark:bg-[#061224] px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#1A365D]">
                            <span className="text-[#004A99] dark:text-[#00D8FF]">
                              {String(activeSlide + 1).padStart(2, '0')}
                            </span>
                            <span className="text-slate-400 dark:text-slate-600">/</span>
                            <span>{String(carouselArticles.length).padStart(2, '0')}</span>
                          </div>
                        </div>

                        {/* Título */}
                        <h3 className="font-display text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white hover:text-[#004A99] dark:hover:text-[#00D8FF] transition-colors leading-snug line-clamp-2 text-balance pt-0.5">
                          <Link href={`/noticias/${encodeURIComponent(currentSlideArticle.slug)}`}>
                            {currentSlideArticle.titulo}
                          </Link>
                        </h3>

                        {/* Resumo Oficial */}
                        {currentSlideArticle.resumo && (
                          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2 font-sans text-pretty">
                            {currentSlideArticle.resumo}
                          </p>
                        )}
                      </div>

                      {/* Rodapé do Card: Autor Oficial + Navegação + Link Detalhes */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs truncate">
                          {currentSlideArticle.autor_nome && (
                            <span className="truncate">
                              Por{' '}
                              <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                                {currentSlideArticle.autor_nome}
                              </strong>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                          <div className="flex items-center gap-1" role="tablist" aria-label="Navegação dos destaques">
                            {carouselArticles.map((slideItem, idx) => {
                              const isActive = idx === activeSlide;
                              return (
                                <button
                                  key={slideItem.slug}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSlide(idx);
                                  }}
                                  role="tab"
                                  aria-selected={isActive}
                                  aria-label={`Ir para destaque ${idx + 1}`}
                                  className={`h-1.5 rounded-full transition-all duration-300 ease-out touch-manipulation select-none active:scale-[0.95] cursor-pointer ${
                                    isActive
                                      ? 'w-5 bg-[#004A99] dark:bg-[#00D8FF]'
                                      : 'w-2 bg-slate-200 dark:bg-[#1A365D] hover:bg-slate-300 dark:hover:bg-slate-600'
                                  }`}
                                />
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={handlePrevSlide}
                              aria-label="Destaque anterior"
                              className="p-1 rounded-lg border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] text-slate-600 dark:text-slate-300 hover:text-[#004A99] dark:hover:text-[#00D8FF] hover:border-slate-300 dark:hover:border-cyan-500/40 transition-all duration-150 ease-out active:scale-[0.95] touch-manipulation select-none cursor-pointer"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleNextSlide}
                              aria-label="Próximo destaque"
                              className="p-1 rounded-lg border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] text-slate-600 dark:text-slate-300 hover:text-[#004A99] dark:hover:text-[#00D8FF] hover:border-slate-300 dark:hover:border-cyan-500/40 transition-all duration-150 ease-out active:scale-[0.95] touch-manipulation select-none cursor-pointer"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <Link
                            href={`/noticias/${encodeURIComponent(currentSlideArticle.slug)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004A99] hover:bg-[#003875] dark:bg-[#00D8FF] dark:hover:bg-cyan-300 text-white dark:text-slate-950 text-xs font-bold transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none cursor-pointer shadow-xs shrink-0"
                          >
                            <span>Ler Matéria</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            )}

            {/* 2. GRADE DE REPORTAGENS (3 COLUNAS) */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1A365D] pb-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#E6F4FF] flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
                  <span>Reportagens e Coberturas Publicadas</span>
                </h2>
                {pagination && (
                  <span className="text-xs text-slate-500 dark:text-[#6482A6] tabular-nums font-medium">
                    {pagination.total_count} {pagination.total_count === 1 ? 'resultado' : 'resultados'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => {
                  const cover = getMediaUrl(item.imagem_capa);

                  return (
                    <article
                      key={item.slug}
                      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs hover:shadow-md transition-all duration-200 ease-out"
                    >
                      <div
                        onClick={() => setActiveArticleSlug(item.slug)}
                        className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0 cursor-pointer flex items-center justify-center"
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt={item.titulo}
                            className="h-full w-full object-cover transition-opacity duration-300"
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <Newspaper className="h-10 w-10 text-slate-600" aria-hidden="true" />
                        )}
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-[#004A99] dark:text-[#00D8FF] flex items-center gap-1.5 flex-wrap">
                            {item.categoria_nome && (
                              <span className="bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded text-[11px] font-bold border border-sky-200 dark:border-sky-500/30">
                                {item.categoria_nome}
                              </span>
                            )}
                            {item.categoria_nome && item.data_publicacao && <span>•</span>}
                            {item.data_publicacao && (
                              <span className="text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                                {item.data_publicacao}
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-[#E6F4FF] group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors leading-snug line-clamp-2 text-balance">
                            <Link href={`/noticias/${encodeURIComponent(item.slug)}`}>
                              {item.titulo}
                            </Link>
                          </h3>

                          {item.resumo && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-sans text-pretty">
                              {item.resumo}
                            </p>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[55%]">
                            {item.autor_nome}
                          </span>

                          <Link
                            href={`/noticias/${encodeURIComponent(item.slug)}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-[#00D8FF] hover:underline shrink-0"
                          >
                            <span>Continuar lendo</span>
                            <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && items.length > 0 && viewMode === 'list' && (
          /* ========================================================
              MODO LISTA DE LEITURA
          ======================================================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-[#1A365D] pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#004A99] dark:text-[#00D8FF]">
                ÍNDICE DE LEITURA EM SEQUÊNCIA
              </span>
              {pagination && (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {pagination.total_count} {pagination.total_count === 1 ? 'resultado' : 'resultados'}
                </span>
              )}
            </div>

            {items.map((item) => {
              const cover = getMediaUrl(item.imagem_capa);

              return (
                <article
                  key={item.slug}
                  className="group rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-3.5 sm:p-4 flex flex-col sm:flex-row gap-4 items-stretch hover:shadow-md transition-all duration-200"
                >
                  <div
                    onClick={() => setActiveArticleSlug(item.slug)}
                    className="relative w-full sm:w-52 h-36 sm:h-auto aspect-[16/10] sm:aspect-auto rounded-lg overflow-hidden shrink-0 bg-slate-900 cursor-pointer flex items-center justify-center"
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt={item.titulo}
                        className="h-full w-full object-cover transition-opacity duration-300"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <Newspaper className="h-8 w-8 text-slate-600" aria-hidden="true" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#004A99] dark:text-[#00D8FF] font-semibold mb-1">
                        {item.categoria_nome && (
                          <span className="bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded text-[11px] font-bold border border-sky-200 dark:border-sky-500/30">
                            {item.categoria_nome}
                          </span>
                        )}
                        {item.categoria_nome && item.data_publicacao && <span>•</span>}
                        {item.data_publicacao && (
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {item.data_publicacao}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-[#E6F4FF] group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors leading-snug line-clamp-2">
                        <Link href={`/noticias/${encodeURIComponent(item.slug)}`}>
                          {item.titulo}
                        </Link>
                      </h3>

                      {item.resumo && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                          {item.resumo}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        {item.autor_nome}
                      </span>

                      <Link
                        href={`/noticias/${encodeURIComponent(item.slug)}`}
                        className="font-bold text-[#004A99] dark:text-[#00D8FF] hover:underline flex items-center gap-1"
                      >
                        <span>Ler matéria completa</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ========================================================
            PAGINAÇÃO OFICIAL DA API
        ======================================================== */}
        {pagination && !error && (
          <nav
            aria-label="Paginação de notícias"
            className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-[#1A365D] text-sm text-slate-600 dark:text-slate-400"
          >
            <button
              type="button"
              disabled={loading || query.page <= 1}
              onClick={() => updateQuery({ ...query, page: query.page - 1 })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C1E38] px-3.5 py-2 text-xs font-semibold text-[#004A99] dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-xs font-semibold tabular-nums">
              Página {pagination.current_page} de {Math.max(1, pagination.total_pages)}
            </span>
            <button
              type="button"
              disabled={loading || query.page >= pagination.total_pages}
              onClick={() => updateQuery({ ...query, page: query.page + 1 })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C1E38] px-3.5 py-2 text-xs font-semibold text-[#004A99] dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Próxima
            </button>
          </nav>
        )}
      </div>

      {/* ========================================================
          MODAL / DRAWER "LEITOR EDITORIAL IMERSIVO" (DADOS OFICIAIS)
      ======================================================== */}
      {activeNews && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActiveArticleSlug(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#071326] shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-[#E6F4FF]"
            >
              {/* 1. BARRA DE PROGRESSO DE LEITURA */}
              <div className="h-1 w-full bg-slate-100 dark:bg-[#061224] shrink-0 overflow-hidden">
                <div
                  className="h-full bg-[#004A99] dark:bg-[#00D8FF] transition-all duration-75"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>

              {/* 2. BARRA DE CONTROLE SUPERIOR */}
              <div className="border-b border-slate-200 dark:border-[#1A365D] px-5 py-3.5 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-[#0C1E38]/80 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-500/30 text-[#004A99] dark:text-sky-300 font-bold uppercase text-[10px]">
                    Notícia Oficial
                  </span>
                  {activeNews.categoria_nome && (
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {activeNews.categoria_nome}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white dark:bg-[#061224] border border-slate-200 dark:border-[#1A365D] rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setFontSize('sm')}
                      className={`px-2 py-1 rounded transition-all duration-150 ease-out touch-manipulation select-none active:scale-[0.92] ${
                        fontSize === 'sm'
                          ? 'bg-[#004A99] text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                      title="Fonte Menor"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('base')}
                      className={`px-2 py-1 rounded transition-all duration-150 ease-out touch-manipulation select-none active:scale-[0.92] ${
                        fontSize === 'base'
                          ? 'bg-[#004A99] text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                      title="Fonte Padrão"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('lg')}
                      className={`px-2 py-1 rounded transition-all duration-150 ease-out touch-manipulation select-none active:scale-[0.92] ${
                        fontSize === 'lg'
                          ? 'bg-[#004A99] text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                      title="Fonte Grande"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/noticias/${encodeURIComponent(activeNews.slug)}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] px-2.5 py-1.5 text-xs text-[#004A99] dark:text-[#00D8FF] hover:underline font-semibold"
                  >
                    <span>Página da notícia</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] text-slate-600 dark:text-slate-300 hover:text-[#004A99] dark:hover:text-[#00D8FF] transition-all duration-150 ease-out active:scale-[0.92] touch-manipulation select-none cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99]"
                    title="Copiar link da reportagem"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveArticleSlug(null)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all duration-150 ease-out active:scale-[0.92] touch-manipulation select-none cursor-pointer font-semibold"
                  >
                    <span>Fechar</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* 3. CONTEÚDO ROLÁVEL DA REPORTAGEM COMPLETA */}
              <div
                ref={articleScrollRef}
                onScroll={handleArticleScroll}
                className="overflow-y-auto p-6 sm:p-8 md:p-10 space-y-8 flex-1"
              >
                <div className="space-y-4 max-w-3xl">
                  {activeNews.data_publicacao && (
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#004A99] dark:text-[#00D8FF] uppercase tracking-wider tabular-nums">
                      <span>{activeNews.data_publicacao}</span>
                    </div>
                  )}

                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight text-balance">
                    {activeNews.titulo}
                  </h1>

                  {activeNews.autor_nome && (
                    <div className="pt-2 flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-[#1A365D]">
                      <p className="font-bold text-slate-800 dark:text-white">
                        {activeNews.autor_nome}
                      </p>
                    </div>
                  )}
                </div>

                {activeNews.imagem_capa && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-slate-950">
                    <img
                      src={getMediaUrl(activeNews.imagem_capa)}
                      alt={activeNews.titulo}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`space-y-6 text-slate-700 dark:text-slate-200 font-sans leading-relaxed ${
                    fontSize === 'sm'
                      ? 'text-sm'
                      : fontSize === 'lg'
                      ? 'text-lg'
                      : fontSize === 'xl'
                      ? 'text-xl leading-loose'
                      : 'text-base'
                  }`}
                >
                  {activeNews.resumo && (
                    <>
                      <p className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white leading-relaxed">
                        {activeNews.resumo}
                      </p>
                      <div className="h-px bg-slate-200 dark:bg-[#1A365D] my-4" />
                    </>
                  )}

                  {activeNews.conteudo &&
                    activeNews.conteudo.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex}>{paragraph}</p>
                    ))}
                </div>

                {relatedNews.length > 0 && (
                  <div className="pt-8 border-t border-slate-200 dark:border-[#1A365D] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
                        <span>Leia Também no Portal MEDTEC</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {relatedNews.map((relItem) => {
                        const relCover = getMediaUrl(relItem.imagem_capa);
                        return (
                          <Link
                            key={relItem.slug}
                            href={`/noticias/${encodeURIComponent(relItem.slug)}`}
                            className="group/rel rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] p-3.5 flex gap-3.5 items-center hover:border-[#004A99] dark:hover:border-[#00D8FF] transition-all cursor-pointer"
                          >
                            {relCover && (
                              <img
                                src={relCover}
                                alt={relItem.titulo}
                                loading="lazy"
                                decoding="async"
                                className="h-16 w-20 rounded-lg object-cover shrink-0 bg-slate-900"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              {relItem.categoria_nome && (
                                <span className="font-mono text-[9px] uppercase font-bold text-[#004A99] dark:text-[#00D8FF]">
                                  {relItem.categoria_nome}
                                </span>
                              )}
                              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover/rel:text-[#004A99] dark:group-hover/rel:text-[#00D8FF] transition-colors line-clamp-2 leading-snug mt-0.5">
                                {relItem.titulo}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
