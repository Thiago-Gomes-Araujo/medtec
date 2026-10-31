'use client';

import React, { useState, useId } from 'react';
import type { AvisoPublico, PaginationMeta } from '@/lib/api/types';
import Link from 'next/link';
import { useDialogFocus } from './useDialogFocus';
import { sanitizeSearchInput } from '@/lib/security';
import { 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  Search, 
  Megaphone, 
  X, 
  FileText
} from 'lucide-react';

interface AvisosViewProps {
  announcements: AvisoPublico[];
  pagination?: PaginationMeta;
  tipo?: string;
  loading?: boolean;
  error?: string | null;
}

export default function AvisosView({ announcements, pagination, tipo = '', loading = false, error = null }: AvisosViewProps) {
  const searchId = useId();
  const [searchTerm, setSearchTerm] = useState('');
  const selectedType = tipo;
  const [selectedAviso, setSelectedAviso] = useState<AvisoPublico | null>(null);

  const { dialogRef, overlayRef } = useDialogFocus(!!selectedAviso, () => setSelectedAviso(null));

  const hrefFor = (page: number, type = tipo) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(pagination?.per_page || 10) });
    if (type) params.set('tipo', type);
    return '/avisos?' + params.toString();
  };
  const dateLabel = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Data não informada'
      : date.toLocaleDateString('pt-BR', { timeZone: 'America/Porto_Velho' });
  };
  if (loading) return <p role="status" className="py-8 text-sm text-slate-500">Carregando avisos...</p>;
  if (error) return <div role="alert" className="py-8 space-y-3 text-sm text-slate-600 dark:text-slate-300">
    <p>{error}</p>
    <button type="button" onClick={() => window.location.reload()} className="font-semibold underline cursor-pointer">
      Tentar novamente
    </button>
  </div>;

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'urgente':
        return {
          icon: <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />,
          label: 'Urgente',
          badge: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300',
          dot: 'bg-rose-500',
          cardBorder: 'hover:border-rose-400 dark:hover:border-rose-500/50'
        };
      case 'aviso':
        return {
          icon: <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />,
          label: 'Aviso Importante',
          badge: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300',
          dot: 'bg-amber-500',
          cardBorder: 'hover:border-amber-400 dark:hover:border-amber-500/50'
        };
      default:
        return {
          icon: <Info size={15} className="text-blue-600 dark:text-sky-400 shrink-0" />,
          label: 'Informativo',
          badge: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-sky-950/40 dark:border-sky-800/50 dark:text-sky-300',
          dot: 'bg-blue-500 dark:bg-cyan-400',
          cardBorder: 'hover:border-blue-400 dark:hover:border-cyan-500/50'
        };
    }
  };

  const getAnnouncementStyle = (item: AvisoPublico) => {
    const base = getTypeStyle(item.tipo_slug);
    const hexColor = item.tipo_cor;
    const label = item.tipo_nome || base.label;

    if (hexColor && /^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
      return {
        ...base,
        label,
        badgeClass: 'border',
        badgeInlineStyle: {
          backgroundColor: `${hexColor}18`,
          borderColor: `${hexColor}40`,
          color: hexColor,
        },
        dotInlineStyle: {
          backgroundColor: hexColor,
        },
        cardInlineStyle: {
          borderLeftColor: hexColor,
          borderLeftWidth: '4px',
        },
      };
    }

    return {
      ...base,
      label,
      badgeClass: `border ${base.badge}`,
      badgeInlineStyle: undefined,
      dotInlineStyle: undefined,
      cardInlineStyle: undefined,
    };
  };

  const categories = [
    { key: '', label: 'Todos os Avisos' },
    { key: 'urgente', label: 'Urgentes' },
    { key: 'aviso', label: 'Avisos Importantes' },
    { key: 'informativo', label: 'Informativos' },
  ];

  // Tipos adicionais vêm dos dados oficiais, sem consultar o catálogo protegido.
  for (const item of announcements) {
    if (!categories.some(category => category.key === item.tipo_slug)) {
      categories.push({ key: item.tipo_slug, label: item.tipo_nome });
    }
  }
  if (tipo && !categories.some(category => category.key === tipo)) categories.push({ key: tipo, label: tipo });
  const filteredItems = announcements.filter(item =>
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.conteudo.toLowerCase().includes(searchTerm.toLowerCase()));
  // Chaves de apresentação, nunca IDs: conteúdo canônico + ocorrência apenas
  // entre duplicatas idênticas. Inserções/reordenações de outros avisos não mudam a chave.
  const occurrences = new Map<string, number>();

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1A365D] transition-colors">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const count = selectedType === cat.key ? pagination?.total_count : undefined;
            const isSelected = selectedType === cat.key;
            return (
              <Link
                key={cat.key}
                href={hrefFor(1, cat.key)}
                aria-current={selectedType === cat.key ? 'page' : undefined}
                className={`inline-flex min-h-11 lg:min-h-0 max-w-full items-center gap-1.5 px-3 py-2 lg:py-1.5 rounded-lg text-sm lg:text-xs [overflow-wrap:anywhere] font-semibold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                  isSelected
                    ? 'bg-[#004A99] text-white dark:bg-[#00D8FF] dark:text-slate-950 font-bold shadow-xs'
                    : 'bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F2647]'
                }`}
              >
                <span>{cat.label}</span>
                {count !== undefined && <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                    isSelected 
                      ? 'bg-sky-200 text-slate-950 dark:bg-slate-950 dark:text-[#00D8FF]' 
                      : 'bg-slate-100 dark:bg-[#061224] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>}
              </Link>
            );
          })}
        </div>

        <div className="w-full min-w-0 md:w-72 md:shrink-0 space-y-1.5">
          <label htmlFor={searchId} className="block text-sm font-semibold text-slate-800 dark:text-slate-100">Buscar avisos nesta página</label>
          <div className="relative">
            <input
              id={searchId}
              name="busca"
              type="search"
              placeholder="Buscar nesta página..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
              maxLength={100}
              className="min-h-11 lg:min-h-0 w-full pl-9 pr-3 py-2 lg:py-1.5 text-base lg:text-xs rounded-lg border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-slate-800 dark:text-[#E6F4FF] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#004A99]/20 dark:focus:ring-cyan-500/20 focus:border-[#004A99] dark:focus:border-[#00D8FF] transition-all duration-150"
            />
            <Search aria-hidden="true" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          </div>
        </div>
      </div>

      {/* Lista de Cards Compactos */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#0C1E38] rounded-xl border border-dashed border-slate-200 dark:border-[#1A365D] p-6 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#061224] flex items-center justify-center mx-auto mb-2 text-slate-400 dark:text-slate-500">
            <Megaphone size={18} />
          </div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-white font-display">Nenhum aviso encontrado</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto text-pretty">
            {searchTerm ? 'Nenhum comunicado nesta página corresponde à busca.' : 'Não há comunicados para o filtro selecionado nesta página.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const style = getAnnouncementStyle(item);
            const signature = JSON.stringify([item.created_at, item.tipo_slug, item.titulo, item.conteudo,
              item.link_texto, item.link_url, item.tipo_nome, item.tipo_cor]);
            const occurrence = occurrences.get(signature) || 0;
            occurrences.set(signature, occurrence + 1);
            return (
              <article
                key={JSON.stringify([signature, occurrence])}
                onClick={(event) => {
                  event.currentTarget.querySelector('button')?.focus();
                  setSelectedAviso(item);
                }}
                style={style.cardInlineStyle}
                className={`bg-white dark:bg-[#0C1E38] rounded-xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#1A365D] shadow-xs hover:shadow-md transition-all duration-200 ease-out flex flex-col justify-between group active:scale-[0.99] touch-manipulation select-none cursor-pointer ${style.cardBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      style={style.badgeInlineStyle}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${style.badgeClass}`}
                    >
                      <span
                        style={style.dotInlineStyle}
                        className={`h-1.5 w-1.5 rounded-full ${style.dotInlineStyle ? '' : style.dot}`}
                      />
                      {style.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      <Calendar size={12} />
                      {dateLabel(item.created_at)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors duration-150 mb-1.5 text-balance">
                    {item.titulo}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 text-pretty">
                    {item.conteudo}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1A365D]/60 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAviso(item);
                    }}
                    className="min-h-11 lg:min-h-0 text-sm lg:text-xs font-semibold text-[#004A99] dark:text-[#00D8FF] hover:underline flex items-center gap-1 group/link transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] rounded-md px-1.5 py-0.5 cursor-pointer"
                  >
                    <span>{item.link_texto || 'Ler comunicado completo'}</span>
                    <ArrowUpRight size={13} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {pagination && pagination.total_pages > 0 && (
        <nav aria-label="Paginação de avisos" className="flex flex-wrap items-center justify-between gap-3 text-sm">
          {pagination.current_page > 1
            ? <Link href={hrefFor(pagination.current_page - 1)} className="inline-flex min-h-11 lg:min-h-0 items-center px-2 font-semibold underline">Anterior</Link>
            : <span aria-disabled="true" className="text-slate-400">Anterior</span>}
          <span>Página {pagination.current_page} de {pagination.total_pages}</span>
          {pagination.current_page < pagination.total_pages
            ? <Link href={hrefFor(pagination.current_page + 1)} className="inline-flex min-h-11 lg:min-h-0 items-center px-2 font-semibold underline">Próxima</Link>
            : <span aria-disabled="true" className="text-slate-400">Próxima</span>}
        </nav>
      )}

      {/* Modal de Leitura Completa de Aviso */}
      {selectedAviso && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedAviso(null)}
        >
          <div
            ref={dialogRef}
            role="dialog" aria-modal="true" aria-label={`Comunicado: ${selectedAviso.titulo}`} tabIndex={-1}
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="space-y-1">
                {(() => {
                  const modalStyle = getAnnouncementStyle(selectedAviso);
                  return (
                    <span
                      style={modalStyle.badgeInlineStyle}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${modalStyle.badgeClass}`}
                    >
                      <span
                        style={modalStyle.dotInlineStyle}
                        className={`h-1.5 w-1.5 rounded-full ${modalStyle.dotInlineStyle ? '' : modalStyle.dot}`}
                      />
                      {modalStyle.label}
                    </span>
                  );
                })()}
                <span className="block text-xs font-mono text-slate-500 dark:text-slate-400">
                  Publicado em: {dateLabel(selectedAviso.created_at)} • SEDUC-RO
                </span>
              </div>
              <button
                onClick={() => setSelectedAviso(null)}
                aria-label="Fechar comunicado"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white leading-tight">
                {selectedAviso.titulo}
              </h2>

              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedAviso.conteudo}
              </p>
            </div>

            <div className="rounded-xl border border-sky-200/80 dark:border-cyan-500/20 bg-sky-50/60 dark:bg-[#07162C] p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#004A99] dark:text-cyan-300 font-semibold">
                <FileText size={14} />
                <span>Orientações da Coordenadoria de Mídias Educacionais</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Este comunicado possui caráter oficial para todas as salas conectadas, polos e professores mediadores de Rondônia conforme a Portaria SEDUC nº 928/2025.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-white/10">
              {selectedAviso.link_texto && selectedAviso.link_url &&
                (/^https?:\/\//i.test(selectedAviso.link_url) ||
                  (selectedAviso.link_url.startsWith('/') && !selectedAviso.link_url.startsWith('//'))) && (
                <a href={selectedAviso.link_url} className="text-xs font-semibold underline">{selectedAviso.link_texto}</a>
              )}
              <button
                type="button"
                onClick={() => setSelectedAviso(null)}
                className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
              >
                Ciente e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
