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
    <div className="space-y-8">
      {/* Banner Oficial SEDUC */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-amber-950 dark:text-amber-200">
              Mural Oficial de Comunicação Escolar — SEDUC-RO
            </h2>
            <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
              Os informes publicados nesta central possuem validade oficial para todas as escolas, turmas conectadas e professores mediadores de Rondônia.
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[11px] font-mono uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700/50">
          Portaria SEDUC nº 928/2025
        </span>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-6 border-b border-slate-200 dark:border-[#1A365D] transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const count = getCount(cat.key);
            const isSelected = selectedType === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedType(cat.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-[#00D8FF] dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F2647]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected 
                      ? 'bg-sky-400 text-slate-950 dark:bg-slate-950 dark:text-[#00D8FF]' 
                      : 'bg-slate-100 dark:bg-[#061224] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por palavra-chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-slate-800 dark:text-[#E6F4FF] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-cyan-500/20 focus:border-sky-500 dark:focus:border-[#00D8FF] transition-colors"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      {/* Lista de Cards */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#0C1E38] rounded-3xl border border-dashed border-slate-200 dark:border-[#1A365D] p-8 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#061224] flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-slate-500">
            <Megaphone size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Nenhum aviso encontrado</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Não há comunicados correspondentes ao filtro ou busca selecionada no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const style = getTypeStyle(item.type);
            return (
              <article
                key={item.id}
                className={`glow-card bg-white dark:bg-[#0C1E38] rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-[#1A365D] shadow-xs hover:shadow-lg dark:hover:border-cyan-400/50 transition-all duration-300 flex flex-col justify-between group ${style.cardBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400 font-medium font-mono">
                      <Calendar size={13} />
                      {item.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-sky-600 dark:group-hover:text-[#00D8FF] transition-colors mb-3">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {item.linkText && item.linkUrl && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1A365D]/60 flex items-center justify-end">
                    <a
                      href={item.linkUrl}
                      className="text-xs font-bold text-sky-600 dark:text-[#00D8FF] hover:text-sky-800 dark:hover:underline flex items-center gap-1.5 group/link transition-colors"
                    >
                      <span>{item.linkText}</span>
                      <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
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
