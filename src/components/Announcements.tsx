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
          icon: <AlertCircle size={15} className="text-rose-600 dark:text-rose-400" />,
          label: 'Urgente',
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300',
          dot: 'bg-rose-500'
        };
      case 'aviso':
        return {
          icon: <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400" />,
          label: 'Aviso Importante',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300',
          dot: 'bg-amber-500'
        };
      default:
        return {
          icon: <Info size={15} className="text-blue-600 dark:text-cyan-400" />,
          label: 'Comunicado',
          bg: 'bg-blue-50 dark:bg-sky-950/40 border-blue-200 dark:border-sky-800/50 text-blue-800 dark:text-sky-300',
          dot: 'bg-blue-500'
        };
    }
  };

  return (
    <section id="avisos" className="border-y border-slate-200/80 dark:border-white/5 py-16 bg-[#F0F4F8] dark:bg-[#040B16] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-mono">
              <Megaphone size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Mural Oficial de Recados</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
              Avisos e Comunicados Importantes
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl text-pretty">
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
                className="bg-white dark:bg-[#0C1E38] rounded-2xl p-6 border border-slate-200/90 dark:border-[#1A365D] shadow-xs hover:shadow-md transition-all duration-200 ease-out flex flex-col justify-between group active:scale-[0.99] touch-manipulation select-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${style.bg}`}>
                      {style.icon}
                      {style.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums font-mono">
                      <Calendar size={13} />
                      {item.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors duration-150 mb-2 text-balance">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
                    {item.content}
                  </p>
                </div>

                {item.linkText && item.linkUrl && (
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1A365D]/60 flex items-center justify-end">
                    <a
                      href={item.linkUrl}
                      className="text-xs font-semibold text-[#004A99] dark:text-[#00D8FF] hover:underline flex items-center gap-1 group/link transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] rounded-lg px-2 py-1"
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

