'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { NewsItem } from '@/types';
import {
  Newspaper,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Radio,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowUpRight,
  User,
  Share2,
  Bookmark,
  Check,
  Eye,
  Calendar,
  Sparkles,
  MapPin,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsEditorialSectionProps {
  news: NewsItem[];
}

interface EditorialDetails {
  polo: string;
  readingTime: number;
  tldrPoints: string[];
  quote: {
    text: string;
    author: string;
    role: string;
  };
  impactStats: {
    label: string;
    value: string;
  }[];
}

const FALLBACK_NEWS_COVER =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

// Helper de enriquecimento editorial jornalístico para a experiência de leitura
function getEditorialDetails(item: NewsItem, index: number): EditorialDetails {
  const polos = [
    'Calha Fluvial • Baixo Madeira & Rio Guaporé',
    'Polo Central • Ji-Paraná & Região Central',
    'Estúdios Centrais SEDUC • Porto Velho',
    'Terras Indígenas • Cacoal & Vale do Jamari',
    'Cone Sul • Vilhena & Fronteira Sul',
    'Vale do Jamari • Ariquemes & Médio Madeira',
  ];
  const polo = polos[index % polos.length];

  const words = ((item.content || '') + ' ' + (item.excerpt || '')).split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(3, Math.ceil(words / 130));

  const tldrPoints = [
    item.excerpt || 'Modernização estruturante das ferramentas pedagógicas e da rede de transmissão satelital.',
    `Transmissões diárias em tempo real a partir de Porto Velho cobrindo escolas e comunidades em ${polo}.`,
    'Mediação pedagógica presencial diária assegurando equidade educacional conforme Lei Estadual nº 3.846/2016.',
  ];

  const quotes = [
    {
      text: 'Nossos alunos agora debatem os conteúdos com especialistas da capital em tempo real, sem precisar se afastar de suas famílias e de suas raízes comunitárias.',
      author: 'Prof. Carlos Eduardo Mendonça',
      role: 'Professor Mediador Presencial • Polo Fluvial'
    },
    {
      text: 'A mediação tecnológica quebrou o isolamento geográfico da nossa aldeia. Hoje temos aulões interativos, simulados digitais e preparação real para o vestibular.',
      author: 'Mayara Suruí',
      role: 'Estudante do 3º Ano do Ensino Médio • MEDTEC Rondônia'
    },
    {
      text: 'Cada antena Banda Ku instalada representa a garantia constitucional de que nenhum jovem do campo ou das florestas ficará para trás na educação.',
      author: 'Profa. Maria Helena Ribeiro',
      role: 'Coordenadoria de Mídias Educacionais (SEDUC-RO)'
    },
    {
      text: 'A união entre a aula transmitida pelo estúdio de TV e a orientação prática do mediador na sala de aula transforma o aprendizado em algo vivo e aplicável à nossa comunidade.',
      author: 'Prof. José Arnaldo Silva',
      role: 'Professor Mediador de Agroecologia • Polo Ji-Paraná'
    }
  ];
  const quote = quotes[index % quotes.length];

  const impactStats = [
    { label: 'Salas Conectadas', value: `${12 + (index % 8)} Unidades` },
    { label: 'Estudantes Atendidos', value: `${380 + (index * 45)} Jovens` },
    { label: 'Municípios Cobertos', value: '52 Cidades' },
    { label: 'Disponibilidade Satélite', value: '99.8% Sinal Ativo' },
  ];

  return {
    polo,
    readingTime,
    tldrPoints,
    quote,
    impactStats
  };
}

export default function NewsEditorialSection({ news = [] }: NewsEditorialSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'magazine' | 'list'>('magazine');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Conforto visual no Leitor Imersivo: tamanho da fonte ('sm' | 'base' | 'lg' | 'xl')
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const articleScrollRef = useRef<HTMLDivElement>(null);

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

  // Lista organizada de categorias (com as 4 principais no início)
  const categoriesList = useMemo(() => {
    const primary = ['Todas', 'Pedagógico', 'Infraestrutura', 'Tecnologia', 'Eventos'];
    const dynamicCats = new Set<string>();
    publishedNews.forEach((item) => {
      if (item.category) dynamicCats.add(item.category);
    });

    const result = [...primary];
    dynamicCats.forEach((cat) => {
      if (!result.includes(cat)) {
        result.push(cat);
      }
    });

    // Mantém apenas categorias que possuam pelo menos 1 notícia ou sejam "Todas"
    return result.filter((cat) => cat === 'Todas' || (categoryCounts[cat] || 0) > 0);
  }, [publishedNews, categoryCounts]);

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
        (item.content && item.content.toLowerCase().includes(term)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(term)));

      return matchCat && matchSearch;
    });
  }, [publishedNews, selectedCategory, searchTerm]);

  // Artigo ativo aberto no Leitor Imersivo
  const activeNews = useMemo(() => {
    if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= filteredNews.length) {
      return null;
    }
    return filteredNews[selectedIndex];
  }, [selectedIndex, filteredNews]);

  const activeEditorial = useMemo(() => {
    if (selectedIndex === null || !activeNews) return null;
    return getEditorialDetails(activeNews, selectedIndex);
  }, [selectedIndex, activeNews]);

  // Notícias recomendadas para a seção "Leia Também" ao final da matéria
  const relatedNews = useMemo(() => {
    if (!activeNews) return [];
    return publishedNews
      .filter((n) => n.id !== activeNews.id)
      .slice(0, 2);
  }, [activeNews, publishedNews]);

  // Navegação no Leitor
  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : filteredNews.length - 1));
  }, [selectedIndex, filteredNews.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < filteredNews.length - 1 ? prev! + 1 : 0));
  }, [selectedIndex, filteredNews.length]);

  // Monitoramento do progresso de leitura
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

  // Atalhos de teclado no Leitor
  useEffect(() => {
    if (selectedIndex === null) return;

    // Reseta barra de progresso e scroll ao trocar de notícia
    setReadingProgress(0);
    if (articleScrollRef.current) {
      articleScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }

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

  // Compartilhar link da matéria
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Separação entre a Manchete de Capa (50/50) e os demais artigos na visualização Revista
  const featuredArticle = filteredNews.length > 0 ? filteredNews[0] : null;
  const featuredEditorial = featuredArticle ? getEditorialDetails(featuredArticle, 0) : null;
  const secondaryArticles = filteredNews.slice(1);

  return (
    <div className="relative w-full bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors">
      
      {/* Grade Cartesiana Sutil de Fundo */}
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40 dark:opacity-40" />

      {/* Glow Sutil de Horizonte Ciano */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-3/4 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-10">

        {/* ========================================================
            BARRA DE CONTROLE EDITORIAL (FILTROS + BUSCA + MODOS)
        ======================================================== */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white/95 dark:bg-[#0C1E38]/90 p-4 shadow-sm dark:shadow-xl backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
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
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'border border-[#004A99] dark:border-[#00D8FF] bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 font-bold shadow-sm'
                      : 'border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224]/60 text-slate-600 dark:text-[#6482A6] hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-sky-200 dark:text-slate-950' : 'text-slate-400 dark:text-slate-500'}`}>
                    [{formattedCount}]
                  </span>
                </button>
              );
            })}
          </div>

          {/* Direita: Busca Textual Rápida + Modos Jornalísticos */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Campo de Busca Rápida */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-[#6482A6]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar reportagem..."
                className="w-full rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] pl-9 pr-8 py-2 text-xs font-mono text-slate-900 dark:text-[#E6F4FF] placeholder-slate-400 dark:placeholder-[#6482A6] focus:border-[#004A99] dark:focus:border-[#00D8FF] focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Alternador de Modos: MODO REVISTA vs LISTA DE LEITURA */}
            <div className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-[#061224] p-1 rounded-xl border border-slate-200 dark:border-[#1A365D]">
              <button
                onClick={() => setViewMode('magazine')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  viewMode === 'magazine'
                    ? 'bg-white dark:bg-[#0C1E38] text-[#004A99] dark:text-[#00D8FF] shadow-xs border border-slate-200 dark:border-cyan-400/30'
                    : 'text-slate-500 dark:text-[#6482A6] hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Modo Revista: Manchete de Capa + Cards Editoriais"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">MODO REVISTA</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#0C1E38] text-[#004A99] dark:text-[#00D8FF] shadow-xs border border-slate-200 dark:border-cyan-400/30'
                    : 'text-slate-500 dark:text-[#6482A6] hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Lista de Leitura: Visualização compacta contínua"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">LISTA DE LEITURA</span>
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================
            ESTADO VAZIO (NENHUMA MATÉRIA ENCONTRADA)
        ======================================================== */}
        {filteredNews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38]/50 p-12 text-center space-y-3">
            <Newspaper className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-display">
              Nenhuma reportagem encontrada
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Não encontramos resultados para os termos ou filtros selecionados. Tente buscar por palavras-chave como &quot;satélite&quot;, &quot;ENEM&quot; ou &quot;agroecologia&quot;.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Todas');
                setSearchTerm('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 text-xs font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Restaurar todas as notícias
            </button>
          </div>
        ) : viewMode === 'magazine' ? (
          /* ========================================================
              MODO REVISTA (MANCHETE 50/50 + GRADE DE CARDS COM RESUMO)
          ======================================================== */
          <div className="space-y-12">
            
            {/* 1. MANCHETE DE CAPA 50/50 (TEXTO FORA DA FOTO!) */}
            {featuredArticle && featuredEditorial && (
              <div
                onClick={() => setSelectedIndex(0)}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  
                  {/* Coluna da Imagem (lg:col-span-7) */}
                  <div className="relative lg:col-span-7 min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] overflow-hidden bg-slate-950">
                    <img
                      src={featuredArticle.coverImage || FALLBACK_NEWS_COVER}
                      alt={featuredArticle.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_NEWS_COVER;
                      }}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="eager"
                    />
                    
                    {/* Gradiente sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Badge de Destaque no Topo da Imagem */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/85 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
                        <Sparkles className="h-3 w-3 text-cyan-300" />
                        <span>★ REPORTAGEM DE CAPA // {featuredArticle.category?.toUpperCase() || 'INFRAESTRUTURA'}</span>
                      </span>
                    </div>

                    {/* Indicador de Tempo no Rodapé da Imagem */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-black/75 px-2.5 py-1 font-mono text-[11px] text-cyan-200 backdrop-blur-sm">
                        <Clock className="h-3 w-3 text-cyan-300" />
                        <span>⏱ {featuredEditorial.readingTime} MIN DE LEITURA</span>
                      </span>
                    </div>
                  </div>

                  {/* Coluna Editorial (lg:col-span-5 — Fundo Branco no Claro / Marinho no Escuro) */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-9 flex flex-col justify-between space-y-5 bg-white dark:bg-[#0C1E38]">
                    
                    <div className="space-y-3">
                      {/* Metadados: Localidade + Tempo de Leitura */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#004A99] dark:text-[#00D8FF] tracking-wider uppercase">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{featuredEditorial.polo}</span>
                        </span>
                        <span>•</span>
                        <span>{featuredArticle.publishedAt}</span>
                      </div>

                      {/* Título Jornalístico Forte (Fora da foto!) */}
                      <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#E6F4FF] group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors leading-tight">
                        {featuredArticle.title}
                      </h2>

                      {/* Lead / Resumo Atrativo */}
                      <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-4 font-sans">
                        {featuredArticle.excerpt}
                      </p>

                      {/* Box de Prévia: "O que você vai ler nesta matéria" */}
                      <div className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] p-3.5 space-y-2 mt-4">
                        <p className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#004A99] dark:text-[#00D8FF] flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>DESTAQUES DA REPORTAGEM:</span>
                        </p>
                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-sans">
                          <li className="flex items-start gap-2">
                            <span className="text-[#004A99] dark:text-[#00D8FF] font-bold">✓</span>
                            <span>{featuredEditorial.tldrPoints[0]}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#004A99] dark:text-[#00D8FF] font-bold">✓</span>
                            <span>{featuredEditorial.tldrPoints[1]}</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Rodapé da Capa: Assinatura + Botão de Leitura Completa */}
                    <div className="pt-4 border-t border-dashed border-slate-200 dark:border-[#1A365D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        <span>Por <strong>{featuredArticle.author || 'Assessoria SEDUC-RO'}</strong></span>
                      </div>

                      <span className="inline-flex items-center gap-2 rounded-xl bg-[#004A99] hover:bg-[#003875] dark:bg-[#00D8FF] dark:hover:bg-cyan-300 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white dark:text-slate-950 transition-colors shadow-sm shrink-0">
                        <span>Ler reportagem completa</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* 2. GRADE DE REPORTAGENS COM ESTRUTURA DE REVISTA (3 COLUNAS) */}
            {secondaryArticles.length > 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-[#1A365D] pb-3">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-slate-900 dark:text-[#E6F4FF] flex items-center gap-2">
                    <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                    <span>{'//'} REPORTAGENS &amp; COBERTURAS NOS POLOS</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-[#6482A6]">
                    {secondaryArticles.length} {secondaryArticles.length === 1 ? 'matéria disponível' : 'matérias disponíveis'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {secondaryArticles.map((item, idx) => {
                    const actualIndex = idx + 1;
                    const editorial = getEditorialDetails(item, actualIndex);
                    const cover = item.coverImage || FALLBACK_NEWS_COVER;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedIndex(actualIndex)}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        {/* PARTE SUPERIOR: FOTO LIMPA 16:9 (SEM TÍTULO EM CIMA DA FOTO!) */}
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                          <img
                            src={cover}
                            alt={item.title}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = FALLBACK_NEWS_COVER;
                            }}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Tag de Categoria no Topo Esquerdo */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                              {item.category || 'Geral'}
                            </span>
                          </div>

                          {/* Tempo de Leitura no Canto Inferior Direito */}
                          <div className="absolute bottom-2.5 right-2.5 z-10">
                            <span className="inline-flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 font-mono text-[10px] text-cyan-200 backdrop-blur-sm">
                              <Clock className="h-2.5 w-2.5 text-cyan-300" />
                              <span>⏱ {editorial.readingTime} min</span>
                            </span>
                          </div>
                        </div>

                        {/* PARTE INFERIOR: CORPO DE LEITURA EDITORIAL */}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                          
                          <div className="space-y-2">
                            {/* Localidade e Data em Azul Institucional */}
                            <div className="text-xs font-mono font-bold tracking-wider text-[#004A99] dark:text-[#00D8FF] flex items-center gap-1.5">
                              <span>{item.publishedAt}</span>
                              <span>•</span>
                              <span className="truncate">📍 {editorial.polo}</span>
                            </div>

                            {/* Título da Notícia */}
                            <h4 className="font-display text-lg font-bold text-slate-900 dark:text-[#E6F4FF] group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors leading-snug line-clamp-2">
                              {item.title}
                            </h4>

                            {/* Resumo (Lead de 3 linhas que convida à leitura) */}
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-sans">
                              {item.excerpt}
                            </p>
                          </div>

                          {/* Rodapé do Card: Linha Tracejada + Autor + Link */}
                          <div className="pt-3.5 border-t border-dashed border-slate-200 dark:border-[#1A365D] flex items-center justify-between text-xs">
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[55%]">
                              {item.author || 'Coord. de Mídias'}
                            </span>

                            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#004A99] dark:text-[#00D8FF] group-hover:underline shrink-0">
                              <span>Continuar lendo</span>
                              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </span>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* ========================================================
              MODO LISTA DE LEITURA (COMPACTO PARA LEITURA RÁPIDA)
          ======================================================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-[#1A365D] pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#004A99] dark:text-[#00D8FF]">
                [ ÍNDICE DE LEITURA EM SEQUÊNCIA ]
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {filteredNews.length} matérias cadastradas
              </span>
            </div>

            {filteredNews.map((item, index) => {
              const editorial = getEditorialDetails(item, index);
              const cover = item.coverImage || FALLBACK_NEWS_COVER;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(index)}
                  className="group rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-stretch hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  {/* Miniatura 16:10 */}
                  <div className="relative w-full sm:w-64 aspect-[16/10] sm:aspect-auto rounded-xl overflow-hidden shrink-0 bg-slate-950">
                    <img
                      src={cover}
                      alt={item.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_NEWS_COVER;
                      }}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-full bg-slate-950/80 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white backdrop-blur-sm">
                        {item.category || 'Geral'}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo da Linha */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#004A99] dark:text-[#00D8FF] font-semibold mb-1">
                        <span>{item.publishedAt}</span>
                        <span>•</span>
                        <span>📍 {editorial.polo}</span>
                        <span>•</span>
                        <span className="text-slate-500 dark:text-slate-400">⏱ {editorial.readingTime} min</span>
                      </div>

                      <h4 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-[#E6F4FF] group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-dashed border-slate-200 dark:border-[#1A365D] flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.author || 'Equipe SEDUC-RO'}
                      </span>

                      <span className="font-bold text-[#004A99] dark:text-[#00D8FF] group-hover:underline flex items-center gap-1">
                        <span>Ler matéria completa</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================
          MODAL / DRAWER "LEITOR EDITORIAL IMERSIVO"
      ======================================================== */}
      <AnimatePresence>
        {activeNews && activeEditorial && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#071326] shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-[#E6F4FF]"
            >
              
              {/* 1. BARRA DE PROGRESSO DE LEITURA (0% a 100%) */}
              <div className="h-1.5 w-full bg-slate-100 dark:bg-[#061224] shrink-0 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#004A99] via-sky-400 to-[#00D8FF] transition-all duration-75"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>

              {/* 2. BARRA DE CONTROLE SUPERIOR (CONFORTO VISUAL + ATALHOS) */}
              <div className="border-b border-slate-200 dark:border-[#1A365D] px-5 py-3.5 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-[#0C1E38]/80 backdrop-blur-sm shrink-0">
                
                {/* Esquerda: Identificação Editorial e Categoria */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold uppercase text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SINAL ATIVO
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-cyan-300">
                    {activeNews.category || 'Geral'}
                  </span>
                </div>

                {/* Centro: Conforto Visual (Tamanho da Fonte A- / A+) + Tempo de Leitura */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white dark:bg-[#061224] border border-slate-200 dark:border-[#1A365D] rounded-lg p-0.5 text-xs font-mono">
                    <button
                      onClick={() => setFontSize('sm')}
                      className={`px-2 py-1 rounded ${fontSize === 'sm' ? 'bg-[#004A99] text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                      title="Fonte Menor"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontSize('base')}
                      className={`px-2 py-1 rounded ${fontSize === 'base' ? 'bg-[#004A99] text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                      title="Fonte Padrão"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('lg')}
                      className={`px-2 py-1 rounded ${fontSize === 'lg' ? 'bg-[#004A99] text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                      title="Fonte Grande"
                    >
                      A+
                    </button>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#061224] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1A365D]">
                    <Clock className="h-3 w-3 text-[#004A99] dark:text-[#00D8FF]" />
                    <span>⏱ {activeEditorial.readingTime} min</span>
                  </span>
                </div>

                {/* Direita: Compartilhar + Fechar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] text-slate-600 dark:text-slate-300 hover:text-[#004A99] dark:hover:text-[#00D8FF] transition-colors cursor-pointer"
                    title="Copiar link da reportagem"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] px-2.5 py-1.5 font-mono text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-bold"
                  >
                    <span>ESC</span>
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
                
                {/* Cabeçalho do Artigo */}
                <div className="space-y-4 max-w-3xl">
                  {/* Polo & Data */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#004A99] dark:text-[#00D8FF] uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{activeEditorial.polo}</span>
                    </span>
                    <span>•</span>
                    <span>{activeNews.publishedAt}</span>
                  </div>

                  {/* Título Display Escultural */}
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    {activeNews.title}
                  </h1>

                  {/* Autor e Órgão Oficial */}
                  <div className="pt-2 flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-[#1A365D]">
                    <div className="h-8 w-8 rounded-full bg-[#004A99] text-white flex items-center justify-center font-bold text-xs">
                      RO
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {activeNews.author || 'Assessoria de Comunicação SEDUC-RO'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Governo do Estado de Rondônia • Mediação Tecnológica
                      </p>
                    </div>
                  </div>
                </div>

                {/* Imagem de Capa Panorâmica com Legenda */}
                <div className="space-y-2">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-slate-950">
                    <img
                      src={activeNews.coverImage || FALLBACK_NEWS_COVER}
                      alt={activeNews.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 text-right">
                    Registro oficial: Coordenadoria de Mídias Educacionais / SEDUC Rondônia
                  </p>
                </div>

                {/* Bloco "⚡ RESUMO EM 3 PONTOS (TL;DR)" */}
                <div className="rounded-2xl border-l-4 border-[#004A99] dark:border-[#00D8FF] bg-sky-50/80 dark:bg-[#061224] p-5 sm:p-6 space-y-3">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#004A99] dark:text-[#00D8FF] flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>⚡ RESUMO EM 3 PONTOS (TL;DR)</span>
                  </h4>
                  <ul className="space-y-2 font-sans text-sm text-slate-700 dark:text-slate-200">
                    {activeEditorial.tldrPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Corpo do Texto Completo e Rico (com ajuste de tamanho de fonte) */}
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
                  {/* Lead Inicial em Destaque */}
                  <p className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white leading-relaxed">
                    {activeNews.excerpt}
                  </p>

                  <div className="h-px bg-slate-200 dark:bg-[#1A365D] my-4" />

                  {/* Parágrafos da Matéria */}
                  {activeNews.content ? (
                    activeNews.content.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex}>
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <>
                      <p>
                        A iniciativa consolida a política de universalização da educação em Rondônia sob as diretrizes da Lei Estadual nº 3.846/2016. Por meio de estúdios equipados com tecnologia 4K em Porto Velho, professores especialistas transmitem diariamente aulas dinâmicas síncronas que chegam simultaneamente às salas conectadas por satélite.
                      </p>
                      <p>
                        Em cada localidade, a atuação do professor mediador presencial é a âncora pedagógica que assegura o esclarecimento imediato de dúvidas, a condução de dinâmicas práticas e a conexão direta com as realidades culturais, agrícolas e sociais da comunidade.
                      </p>
                    </>
                  )}

                  {/* Citação em Destaque (Blockquote) */}
                  <blockquote className="my-8 rounded-r-2xl border-l-4 border-cyan-500 bg-sky-50/60 dark:bg-[#0C1E38]/80 p-5 sm:p-6 italic text-slate-800 dark:text-cyan-100">
                    <p className="text-base sm:text-lg leading-relaxed font-serif">
                      &ldquo;{activeEditorial.quote.text}&rdquo;
                    </p>
                    <footer className="mt-3 font-mono text-xs not-italic text-[#004A99] dark:text-cyan-300 font-bold">
                      — {activeEditorial.quote.author}, <span className="font-normal opacity-80">{activeEditorial.quote.role}</span>
                    </footer>
                  </blockquote>

                  {/* Subtítulo Interno */}
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-2">
                    Impacto Direto na Juventude e no Território Rondoniense
                  </h3>

                  <p>
                    Com o sinal ativo de alta disponibilidade e material pedagógico distribuído antecipadamente, os índices de permanência escolar e aprovação em vestibulares crescem ano a ano, demonstrando a potência transformadora da tecnologia quando colocada a serviço da educação pública e cidadã.
                  </p>

                  {/* Ficha de Impacto Territorial (Infobox com 4 Métricas) */}
                  <div className="my-8 rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] p-5 sm:p-6">
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#004A99] dark:text-[#00D8FF] mb-4">
                      📊 FICHA DE IMPACTO TERRITORIAL // SEDUC-RO
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
                      {activeEditorial.impactStats.map((stat, sIdx) => (
                        <div key={sIdx} className="p-3 rounded-xl bg-white dark:bg-[#0C1E38] border border-slate-200/80 dark:border-[#1A365D]">
                          <p className="text-base sm:text-lg font-bold text-[#004A99] dark:text-[#00D8FF]">
                            {stat.value}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags do Artigo */}
                  {activeNews.tags && activeNews.tags.length > 0 && (
                    <div className="pt-6 border-t border-dashed border-slate-200 dark:border-[#1A365D] flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">Tags:</span>
                      {activeNews.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#061224] border border-slate-200 dark:border-[#1A365D] font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                </div>

                {/* 4. SEÇÃO "LEIA TAMBÉM" NO RODAPÉ DO ARTIGO */}
                {relatedNews.length > 0 && (
                  <div className="pt-8 border-t border-slate-200 dark:border-[#1A365D] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
                        <span>📰 LEIA TAMBÉM NO PORTAL MEDTEC</span>
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">Sugestões de leitura</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {relatedNews.map((relItem) => {
                        const relIndex = publishedNews.findIndex((n) => n.id === relItem.id);
                        return (
                          <div
                            key={relItem.id}
                            onClick={() => {
                              if (relIndex !== -1) {
                                setSelectedIndex(relIndex);
                              }
                            }}
                            className="group/rel rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] p-3.5 flex gap-3.5 items-center hover:border-[#004A99] dark:hover:border-[#00D8FF] transition-all cursor-pointer"
                          >
                            <img
                              src={relItem.coverImage || FALLBACK_NEWS_COVER}
                              alt={relItem.title}
                              className="h-16 w-20 rounded-lg object-cover shrink-0 bg-slate-900"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-mono text-[9px] uppercase font-bold text-[#004A99] dark:text-[#00D8FF]">
                                {relItem.category || 'Geral'}
                              </span>
                              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover/rel:text-[#004A99] dark:group-hover/rel:text-[#00D8FF] transition-colors line-clamp-2 leading-snug mt-0.5">
                                {relItem.title}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
