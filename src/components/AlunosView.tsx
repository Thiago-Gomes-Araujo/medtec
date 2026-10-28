'use client';

import React, { useState } from 'react';
import StudentStories from '@/components/StudentStories';
import { ShieldCheck } from 'lucide-react';

export default function AlunosView() {
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const categories = [
    { id: 'Todas', label: 'Todas as Conquistas' },
    { id: 'Vestibular', label: 'Vestibular' },
    { id: 'Olimpíada', label: 'Olimpíada' },
    { id: 'Robótica', label: 'Robótica' },
    { id: 'Feira de Ciências', label: 'Feira de Ciências' },
  ];

  return (
    <div>
      {/* Header Control Panel: Category Filters + Integrated LGPD & ECA Compliance */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-[#004A99] text-white dark:bg-[#00D8FF] dark:text-slate-950 shadow-xs'
                  : 'border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F2647]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* LGPD & ECA Compliance Seal */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            Conformidade LGPD (Lei nº 13.709/2018) e ECA • Imagens devidamente autorizadas
          </span>
        </div>
      </div>

      <StudentStories filterCategory={filterCategory} />
    </div>
  );
}
