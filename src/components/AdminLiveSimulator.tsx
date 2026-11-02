'use client';

import React, { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Maximize2, 
  X, 
  Eye, 
  Calendar, 
  User, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ArrowUpRight, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Sparkles,
  Lock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AnnouncementType } from '@/types';

export type PreviewContentType = 'noticia' | 'aviso' | 'galeria' | 'siteInfo';

export interface PreviewNewsData {
  title?: string;
  category?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  author?: string;
  publishedAt?: string;
  published?: boolean;
}

export interface PreviewAnnouncementData {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  date?: string;
  linkText?: string;
  linkUrl?: string;
  active?: boolean;
  cor?: string;
  typeColor?: string;
  typeName?: string;
}

export interface PreviewGalleryData {
  title?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  date?: string;
}

export interface PreviewSiteInfoData {
  stats?: {
    studentsCount?: string;
    schoolsCount?: string;
    citiesCount?: string;
    liveHoursCount?: string;
  };
  siteInfo?: {
    heroTitle?: string;
    heroDescription?: string;
    studentsCount?: string;
    schoolsCount?: string;
    citiesCount?: string;
  };
  studentsCount?: string;
  schoolsCount?: string;
  citiesCount?: string;
  liveHoursCount?: string;
  heroTitle?: string;
  heroDescription?: string;
}

export type PreviewItemData =
  | PreviewNewsData
  | PreviewAnnouncementData
  | PreviewGalleryData
  | PreviewSiteInfoData;

export interface AdminLiveSimulatorProps {
  type: PreviewContentType;
  data: PreviewItemData;
  hasUnsavedChanges?: boolean;
  onOpenFullscreen?: () => void;
  className?: string;
}

export default function AdminLiveSimulator({
  type,
  data,
  hasUnsavedChanges = false,
  onOpenFullscreen,
  className = '',
}: AdminLiveSimulatorProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'card' | 'full'>('card');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const galleryData = data as PreviewGalleryData;

  return (
    <div className={`space-y-3 xl:sticky xl:top-24 ${className}`}>
      {/* 1. Barra de Identificação Superior & Selo de Rascunho */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
            <span>Simulador do Site Oficial</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            (Tempo Real)
          </span>
        </div>

        {hasUnsavedChanges && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>● Prévia em tempo real (Não salvo no banco)</span>
          </div>
        )}
      </div>

      {/* 2. Moldura de Navegador com Barra de Ferramentas */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] shadow-md overflow-hidden flex flex-col">
        
        {/* Cabeçalho da Janela de Navegador */}
        <div className="bg-slate-100 dark:bg-[#050D19] border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2.5">
          {/* Bolinhas estilo macOS & URL */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
              <Lock className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">medtec.ro.gov.br</span>
            </div>
          </div>

          {/* Controles de Dispositivo, Modo de Exibição e Tela Cheia */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            
            {/* Alternador de Modo de Exibição (apenas onde faz sentido: Notícias e Avisos) */}
            {(type === 'noticia' || type === 'aviso') && (
              <div className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-800/80 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  className={`px-2 py-1 rounded-md transition cursor-pointer ${
                    viewMode === 'card'
                      ? 'bg-white dark:bg-[#0B1729] text-[#004A99] dark:text-[#00D8FF] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Ver como o card aparece na listagem do site"
                >
                  Card na Lista
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('full')}
                  className={`px-2 py-1 rounded-md transition cursor-pointer ${
                    viewMode === 'full'
                      ? 'bg-white dark:bg-[#0B1729] text-[#004A99] dark:text-[#00D8FF] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Ver como o conteúdo aparece aberto ao leitor"
                >
                  {type === 'noticia' ? 'Matéria Aberta' : 'Modal Completo'}
                </button>
              </div>
            )}

            {/* Alternador de Dispositivo: Computador vs Celular */}
            <div className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-800/80 p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition cursor-pointer ${
                  device === 'desktop'
                    ? 'bg-white dark:bg-[#0B1729] text-[#004A99] dark:text-[#00D8FF] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Simular visualização no computador (Desktop)"
              >
                <Monitor className="h-3 w-3" />
                <span className="hidden sm:inline">Computador</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition cursor-pointer ${
                  device === 'mobile'
                    ? 'bg-white dark:bg-[#0B1729] text-[#004A99] dark:text-[#00D8FF] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Simular visualização no smartphone (360px)"
              >
                <Smartphone className="h-3 w-3" />
                <span className="hidden sm:inline">Celular</span>
              </button>
            </div>

            {/* Botão Expandir em Tela Cheia */}
            {onOpenFullscreen && (
              <button
                type="button"
                onClick={onOpenFullscreen}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1729] text-slate-600 dark:text-slate-300 hover:text-[#004A99] dark:hover:text-[#00D8FF] hover:border-sky-300 transition cursor-pointer shadow-xs"
                title="Expandir simulação em tela cheia com contexto do site"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Área de Renderização Fiel da Prévia */}
        <div className="p-3 sm:p-4 bg-[#F0F4F8] dark:bg-[#030914] min-h-[380px] max-h-[640px] overflow-y-auto transition-all duration-300">
          <div
            className={`transition-all duration-300 ${
              device === 'mobile'
                ? 'max-w-[360px] mx-auto bg-white dark:bg-[#061224] rounded-2xl shadow-xl border border-slate-300 dark:border-slate-700 p-3 overflow-hidden ring-4 ring-slate-800/20 dark:ring-black/50'
                : 'w-full'
            }`}
          >
            {/* Barra simulada de smartphone (Notch / Speaker) */}
            {device === 'mobile' && (
              <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-mono">
                <span>09:41</span>
                <div className="w-16 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />
                <span>5G 100%</span>
              </div>
            )}

            {/* Conteúdo Renderizado por Tipo */}
            {type === 'noticia' && (
              <NewsPreviewRenderer data={data as PreviewNewsData} viewMode={viewMode} />
            )}

            {type === 'aviso' && (
              <AnnouncementPreviewRenderer data={data as PreviewAnnouncementData} />
            )}


            {type === 'galeria' && (
              <GalleryPreviewRenderer
                data={galleryData}
                onOpenLightbox={() => setLightboxOpen(true)}
              />
            )}

            {type === 'siteInfo' && (
              <SiteInfoPreviewRenderer data={data as PreviewSiteInfoData} />
            )}
          </div>
        </div>

        {/* 4. Rodapé da Moldura com Dica de UX */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-[#050D19] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-sky-500" />
            <span>Fidelidade com tipografia e cores oficiais</span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {device === 'mobile' ? 'Visualização Mobile (360px)' : 'Visualização Desktop'}
          </span>
        </div>
      </div>

      {/* Lightbox Simulado para a Galeria */}
      {lightboxOpen && type === 'galeria' && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-xs font-bold text-sky-400">
                Prévia do Zoom na Foto • {galleryData.category || 'Galeria'}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={galleryData.imageUrl || '/hero.jpg'}
                alt={galleryData.title || 'Foto'}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 space-y-1">
              <h4 className="text-sm font-bold text-white">{galleryData.title || 'Título da Fotografia'}</h4>
              <p className="text-xs text-slate-300">{galleryData.description || 'Sem descrição informada.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================
   RENDERIZADOR 1: NOTÍCIAS & REPORTAGENS
======================================================== */
function NewsPreviewRenderer({
  data,
  viewMode,
}: {
  data: PreviewNewsData;
  viewMode: 'card' | 'full';
}) {
  const title = data.title?.trim() || 'Título da reportagem ou notícia do MEDTEC';
  const category = data.category || 'Pedagógico';
  const excerpt = data.excerpt?.trim() || 'O resumo introdutório da matéria aparecerá com destaque neste local, contextualizando o leitor.';
  const content = data.content?.trim() || 'O texto integral da reportagem aparecerá nesta seção com formatação oficial, citações das escolas e detalhes pedagógicos.';
  const coverImage = data.coverImage?.trim();
  const author = data.author?.trim() || 'Equipe MEDTEC / SEDUC-RO';
  const publishedAt = data.publishedAt?.trim() || new Date().toLocaleDateString('pt-BR');

  if (viewMode === 'full') {
    return (
      <article className="space-y-4 bg-white dark:bg-[#0C1E38] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1A365D] text-slate-900 dark:text-slate-100 shadow-xs">
        {/* Breadcrumb simulado */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>Início</span>
          <ChevronRight className="h-3 w-3" />
          <span>Notícias</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#004A99] dark:text-[#00D8FF] font-bold">{category}</span>
        </div>

        {/* Título & Meta */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold font-display leading-snug text-balance">
            {title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3 text-[#004A99] dark:text-[#00D8FF]" />
              <strong>{author}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Calendar className="h-3 w-3" />
              {publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Clock className="h-3 w-3" />
              ~3 min de leitura
            </span>
          </div>
        </div>

        {/* Imagem de Capa Grande */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video max-h-60 border border-slate-200 dark:border-slate-800">
          {coverImage ? (
            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-1">
              <Sparkles className="h-6 w-6 text-slate-500" />
              <p className="text-xs font-semibold">Adicione uma imagem no Passo 2 para visualizar a capa oficial.</p>
            </div>
          )}
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#004A99] text-white text-[10px] font-bold shadow-xs">
            {category}
          </span>
        </div>

        {/* Resumo em Destaque */}
        {excerpt && (
          <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-sky-950/30 border-l-4 border-[#004A99] dark:border-[#00D8FF] text-xs leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
            {excerpt}
          </div>
        )}

        {/* Conteúdo Parágrafos */}
        <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2 whitespace-pre-line font-sans">
          {content}
        </div>

        {/* Box Editorial Oficial */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF] shrink-0" />
          <span>Conteúdo chancelado pela Coordenadoria de Mídias Educacionais (SEDUC-RO).</span>
        </div>
      </article>
    );
  }

  // MODO CARD IDÊNTICO A /noticias
  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs hover:shadow-md transition-all duration-200 ease-out">
      {/* Imagem de Capa do Card */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0">
        {coverImage ? (
          <img src={coverImage} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center text-slate-400 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <Sparkles className="h-4 w-4 text-sky-400" />
            </div>
            <p className="text-[11px] font-semibold text-slate-300">Prévia da Capa</p>
            <p className="text-[10px] text-slate-400 max-w-[220px]">
              Insira o link ou envie a foto no Passo 2 para preencher este espaço.
            </p>
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 text-[10px] font-bold shadow-xs">
          {category}
        </span>
      </div>

      {/* Corpo do Card */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Categoria, Data e Localidade */}
          <div className="text-xs font-semibold text-[#004A99] dark:text-[#00D8FF] flex items-center gap-1.5 flex-wrap">
            <span className="bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded text-[11px] font-bold border border-sky-200 dark:border-sky-500/30">
              {category}
            </span>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium tabular-nums">{publishedAt}</span>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium truncate inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>Estúdios SEDUC • Porto Velho</span>
            </span>
          </div>

          {/* Título com line-clamp-2 */}
          <h4 className="font-display text-base font-semibold text-slate-900 dark:text-[#E6F4FF] leading-snug line-clamp-2 text-balance">
            {title}
          </h4>

          {/* Resumo */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-sans text-pretty">
            {excerpt}
          </p>
        </div>

        {/* Rodapé do Card */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[55%]">
            Por {author}
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-[#00D8FF] shrink-0">
            <span>Ler matéria</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ========================================================
   RENDERIZADOR 2: AVISOS & COMUNICADOS
======================================================== */
function AnnouncementPreviewRenderer({
  data,
}: {
  data: PreviewAnnouncementData;
}) {
  const title = data.title?.trim() || 'Título do comunicado ou aviso oficial';
  const content = data.content?.trim() || 'Orientações oficiais para professores mediadores, escolas e alunos dos 52 municípios.';
  const type: AnnouncementType = data.type || 'aviso';
  const date = data.date || new Date().toLocaleDateString('pt-BR');
  const linkText = data.linkText?.trim();
  const linkUrl = data.linkUrl?.trim();

  const getTypeStyle = (t: AnnouncementType) => {
    switch (t) {
      case 'urgente':
        return {
          icon: <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />,
          label: 'Urgente',
          badge: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300',
          dot: 'bg-rose-500',
          cardBorder: 'border-rose-300 dark:border-rose-500/40'
        };
      case 'aviso':
        return {
          icon: <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />,
          label: 'Aviso Importante',
          badge: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300',
          dot: 'bg-amber-500',
          cardBorder: 'border-amber-300 dark:border-amber-500/40'
        };
      default:
        return {
          icon: <Info size={15} className="text-blue-600 dark:text-sky-400 shrink-0" />,
          label: 'Informativo',
          badge: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-sky-950/40 dark:border-sky-800/50 dark:text-sky-300',
          dot: 'bg-blue-500 dark:bg-cyan-400',
          cardBorder: 'border-blue-300 dark:border-cyan-500/40'
        };
    }
  };

  const style = getTypeStyle(type);
  const hexColor = data.cor || data.typeColor;
  const isHex = hexColor && /^#[0-9A-Fa-f]{6}$/.test(hexColor);
  const displayLabel = data.typeName || style.label;

  return (
    <article
      style={isHex ? { borderLeftColor: hexColor, borderLeftWidth: '4px' } : undefined}
      className={`bg-white dark:bg-[#0C1E38] rounded-xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between ${style.cardBorder}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            style={isHex ? { backgroundColor: `${hexColor}18`, borderColor: `${hexColor}40`, color: hexColor } : undefined}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${isHex ? '' : style.badge}`}
          >
            <span
              style={isHex ? { backgroundColor: hexColor } : undefined}
              className={`h-1.5 w-1.5 rounded-full ${isHex ? '' : style.dot}`}
            />
            {displayLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            <Calendar size={12} />
            {date}
          </span>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug mb-1.5 text-balance">
          {title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-pretty">
          {content}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A365D]/60 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Canal Oficial SEDUC</span>
        <div 
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#004A99] dark:text-[#00D8FF]"
          title={linkUrl ? `Destino: ${linkUrl}` : undefined}
        >
          <span>{linkText || 'Ler comunicado completo'}</span>
          <ArrowUpRight size={13} />
        </div>
      </div>
    </article>
  );
}

/* ========================================================
   RENDERIZADOR 3: GALERIA DE FOTOS
======================================================== */
function GalleryPreviewRenderer({
  data,
  onOpenLightbox,
}: {
  data: PreviewGalleryData;
  onOpenLightbox: () => void;
}) {
  const title = data.title?.trim() || 'Título da fotografia ou atividade escolar';
  const category = data.category || 'Salas de Aula';
  const description = data.description?.trim() || 'Descrição dos estudantes acompanhando as aulas conectadas via antena satelital.';
  const imageUrl = data.imageUrl?.trim() || '/hero.jpg';
  const date = data.date || new Date().toLocaleDateString('pt-BR');

  return (
    <article
      onClick={onOpenLightbox}
      className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#060D1A] flex flex-col justify-between group shadow-sm hover:shadow-md transition cursor-pointer"
      title="Clique para testar o zoom (Lightbox)"
    >
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-bold backdrop-blur-xs">
          {category}
        </span>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-bold backdrop-blur-sm">
            <Maximize2 className="h-3 w-3" />
            <span>Testar Zoom</span>
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
          {title}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>SEDUC Rondônia</span>
          </span>
          <span className="tabular-nums">{date}</span>
        </div>
      </div>
    </article>
  );
}

/* ========================================================
   RENDERIZADOR 4: NÚMEROS E TEXTOS DO SITE (SITE INFO)
======================================================== */
function SiteInfoPreviewRenderer({
  data,
}: {
  data: PreviewSiteInfoData;
}) {
  const stats = data.stats;
  const siteInfo = data.siteInfo;

  const students = stats?.studentsCount || siteInfo?.studentsCount || data.studentsCount || '6.000+';
  const schools = stats?.schoolsCount || siteInfo?.schoolsCount || data.schoolsCount || '129';
  const cities = stats?.citiesCount || siteInfo?.citiesCount || data.citiesCount || '52';
  const hours = stats?.liveHoursCount || data.liveHoursCount || '3.500h+';

  const heroTitle = siteInfo?.heroTitle || data.heroTitle || 'Ensino Médio com Mediação Tecnológica em Rondônia';
  const heroDescription = siteInfo?.heroDescription || data.heroDescription || 'Aulas transmitidas ao vivo dos estúdios da SEDUC em Porto Velho para os 52 municípios.';

  return (
    <div className="space-y-4">
      {/* Miniatura do Título e Descrição */}
      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800">
        <span className="text-[10px] uppercase font-bold text-sky-400">Cabeçalho da Página Inicial</span>
        <h3 className="text-sm sm:text-base font-black leading-snug">{heroTitle}</h3>
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{heroDescription}</p>
      </div>

      {/* 4 Indicadores Oficiais da Home */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
          Quadro Oficial de Indicadores da Home
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1E38] shadow-xs">
            <p className="text-xl sm:text-2xl font-black text-[#004A99] dark:text-[#00D8FF] tabular-nums tracking-tight">
              {students}
            </p>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              Estudantes atendidos
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1E38] shadow-xs">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {schools}
            </p>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              Unidades escolares
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1E38] shadow-xs">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {cities}
            </p>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              Municípios cobertos
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1E38] shadow-xs">
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
              {hours}
            </p>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              Horas de transmissão
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   MODAL DE PRÉ-VISUALIZAÇÃO AMPLA EM TELA CHEIA
======================================================== */
export interface AdminPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: PreviewContentType;
  data: PreviewItemData;
}

export function AdminPreviewModal({
  isOpen,
  onClose,
  type,
  data,
}: AdminPreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'card' | 'full'>('card');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      {/* Barra de Controles Superior do Modal */}
      <div className="bg-[#050E1D] border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#004A99] flex items-center justify-center text-white font-bold text-xs">
            RO
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black tracking-wide">
              Pré-Visualização em Tela Cheia • Portal Oficial MEDTEC
            </h3>
            <p className="text-[11px] text-slate-400">
              Simulação de visualização pública exatamente como os estudantes e a comunidade visualizam.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador de Modo de Exibição */}
          {(type === 'noticia' || type === 'aviso') && (
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'card' ? 'bg-[#004A99] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Card na Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'full' ? 'bg-[#004A99] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'noticia' ? 'Matéria Aberta' : 'Modal Completo'}
              </button>
            </div>
          )}

          {/* Alternador de Dispositivo */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                device === 'desktop' ? 'bg-[#004A99] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Computador</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                device === 'mobile' ? 'bg-[#004A99] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Celular (360px)</span>
            </button>
          </div>

          {/* Fechar */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>Fechar Prévia</span>
          </button>
        </div>
      </div>

      {/* Corpo com Mock do Site */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F0F4F8] dark:bg-[#040B16]">
        <div
          className={`mx-auto transition-all duration-300 ${
            device === 'mobile' ? 'max-w-[360px]' : 'max-w-5xl'
          }`}
        >
          {/* Cabeçalho Fictício do Site */}
          <div className="mb-6 rounded-2xl bg-white dark:bg-[#0B1729] p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-sm text-[#004A99] dark:text-[#00D8FF]">
                MEDTEC Rondônia
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• SEDUC-RO</span>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Portal Público Institucional
            </div>
          </div>

          {/* Renderização do Item */}
          {type === 'noticia' && (
            <NewsPreviewRenderer data={data as PreviewNewsData} viewMode={viewMode} />
          )}

          {type === 'aviso' && (
            <AnnouncementPreviewRenderer data={data as PreviewAnnouncementData} />
          )}


          {type === 'galeria' && (
            <GalleryPreviewRenderer
              data={data as PreviewGalleryData}
              onOpenLightbox={() => {}}
            />
          )}

          {type === 'siteInfo' && (
            <SiteInfoPreviewRenderer data={data as PreviewSiteInfoData} />
          )}
        </div>
      </div>
    </div>
  );
}
