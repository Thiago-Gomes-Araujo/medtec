'use client';

import React from 'react';
import { AnnouncementItem } from '@/types';
import { 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  Megaphone 
} from 'lucide-react';

interface AnnouncementsProps {
  announcements: AnnouncementItem[];
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  const activeItems = announcements.filter(a => a.active);

  if (activeItems.length === 0) {
    return null;
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'urgente':
        return {
          icon: <AlertCircle size={15} className="text-rose-600" />,
          label: 'Urgente',
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500'
        };
      case 'aviso':
        return {
          icon: <AlertTriangle size={15} className="text-amber-600" />,
          label: 'Aviso Importante',
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500'
        };
      default:
        return {
          icon: <Info size={15} className="text-blue-600" />,
          label: 'Comunicado',
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          dot: 'bg-blue-500'
        };
    }
  };

  return (
    <section id="avisos" className="py-12 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Megaphone size={14} className="text-amber-600" />
              <span>Mural Oficial de Recados</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Avisos e Comunicados Importantes
            </h2>
            <p className="text-sm text-slate-500 max-w-xl">
              Fique por dentro das datas de transmissões, orientações para professores mediadores e informes pedagógicos.
            </p>
          </div>
        </div>

        {/* Grid de Avisos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeItems.map((item) => {
            const style = getTypeBadge(item.type);
            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg}`}>
                      {style.icon}
                      {style.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Calendar size={13} />
                      {item.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {item.linkText && item.linkUrl && (
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
                    <a
                      href={item.linkUrl}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 group/link"
                    >
                      <span>{item.linkText}</span>
                      <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

