'use client';

import React, { useState } from 'react';
import { AnnouncementItem, AnnouncementType } from '@/types';
import { 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  Search,
  ShieldAlert,
  Megaphone
} from 'lucide-react';

interface AvisosViewProps {
  announcements: AnnouncementItem[];
}

export default function AvisosView({ announcements }: AvisosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todas');

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
      {/* Barra Informativa SEDUC Compacta */}
      <div className="rounded-xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-amber-900/90 dark:text-amber-300 font-medium">
            Informes oficiais com validade jurídica para escolas, polos e turmas conectadas de Rondônia.
          </span>
        </div>
        <span className="shrink-0 self-start sm:self-auto font-mono text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-700/50">
          Portaria SEDUC nº 928/2025
        </span>
      </div>

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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                  isSelected
                    ? 'bg-[#004A99] text-white dark:bg-[#00D8FF] dark:text-slate-950 font-bold shadow-xs'
                    : 'bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F2647]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-slate-800 dark:text-[#E6F4FF] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#004A99]/20 dark:focus:ring-cyan-500/20 focus:border-[#004A99] dark:focus:border-[#00D8FF] transition-all duration-150"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      {/* Lista de Cards Compactos */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#0C1E38] rounded-xl border border-dashed border-slate-200 dark:border-[#1A365D] p-6 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#061224] flex items-center justify-center mx-auto mb-2 text-slate-400 dark:text-slate-500">
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
            const style = getTypeStyle(item.type);
            return (
              <article
                key={item.id}
                className={`glow-card bg-white dark:bg-[#0C1E38] rounded-xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#1A365D] shadow-xs hover:shadow-md dark:hover:border-cyan-400/50 transition-all duration-200 ease-out flex flex-col justify-between group active:scale-[0.99] touch-manipulation select-none ${style.cardBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
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

                {item.linkText && item.linkUrl && (
                  <div className="mt-3 pt-3 border-t border-dashed border-slate-200/80 dark:border-[#1A365D]/60 flex items-center justify-end">
                    <a
                      href={item.linkUrl}
                      className="text-xs font-semibold text-[#004A99] dark:text-[#00D8FF] hover:underline flex items-center gap-1 group/link transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] rounded-md px-1.5 py-0.5"
                    >
                      <span>{item.linkText}</span>
                      <ArrowUpRight size={13} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
