'use client';

import React, { useState } from 'react';
import { AnnouncementItem, AnnouncementType } from '@/types';
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
  announcements: AnnouncementItem[];
}

export default function AvisosView({ announcements }: AvisosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todas');
  const [selectedAviso, setSelectedAviso] = useState<AnnouncementItem | null>(null);

  const activeItems = announcements.filter((a) => a.active !== false);

  const getTypeStyle = (type: AnnouncementType | string) => {
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

  const getAnnouncementStyle = (item: AnnouncementItem) => {
    const base = getTypeStyle(item.type);
    const hexColor = item.a_tipo_aviso?.cor || item.typeColor;
    const label = item.a_tipo_aviso?.nome || item.typeName || base.label;

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
    { key: 'Todas', label: 'Todos os Avisos' },
    { key: 'urgente', label: 'Urgentes' },
    { key: 'aviso', label: 'Avisos Importantes' },
    { key: 'informativo', label: 'Informativos' },
  ];

  const filteredItems = activeItems.filter((item) => {
    const matchesType = selectedType === 'Todas' || item.type === selectedType;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getCount = (type: string) => {
    if (type === 'Todas') return activeItems.length;
    return activeItems.filter((item) => item.type === type).length;
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1A365D] transition-colors">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const count = getCount(cat.key);
            const isSelected = selectedType === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedType(cat.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                  isSelected
                    ? 'bg-[#004A99] text-white dark:bg-[#00D8FF] dark:text-slate-950 font-bold shadow-xs'
                    : 'bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F2647]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                    isSelected 
                      ? 'bg-sky-200 text-slate-950 dark:bg-slate-950 dark:text-[#00D8FF]' 
                      : 'bg-slate-100 dark:bg-[#061224] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar avisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
            maxLength={100}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-slate-800 dark:text-[#E6F4FF] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#004A99]/20 dark:focus:ring-cyan-500/20 focus:border-[#004A99] dark:focus:border-[#00D8FF] transition-all duration-150"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-slate-400 dark:text-slate-500" />
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
            Não há comunicados correspondentes ao filtro ou busca selecionada no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const style = getAnnouncementStyle(item);
            return (
              <article
                key={item.id}
                onClick={() => setSelectedAviso(item)}
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
                      {item.date}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors duration-150 mb-1.5 text-balance">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 text-pretty">
                    {item.content}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1A365D]/60 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAviso(item);
                    }}
                    className="text-xs font-semibold text-[#004A99] dark:text-[#00D8FF] hover:underline flex items-center gap-1 group/link transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] rounded-md px-1.5 py-0.5 cursor-pointer"
                  >
                    <span>{item.linkText || 'Ler comunicado completo'}</span>
                    <ArrowUpRight size={13} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Leitura Completa de Aviso */}
      {selectedAviso && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedAviso(null)}
        >
          <div
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
                  Publicado em: {selectedAviso.date} • SEDUC-RO
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
                {selectedAviso.title}
              </h2>

              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedAviso.content}
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
