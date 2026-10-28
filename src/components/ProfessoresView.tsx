'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import TeacherProfiles from '@/components/TeacherProfiles';

export default function ProfessoresView() {
  const [filterRole, setFilterRole] = useState<'Todas' | 'Ministrante' | 'Mediador'>('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      {/* Toolbar: Filters + Instant Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Todas', 'Ministrante', 'Mediador'] as const).map((role) => {
            const label =
              role === 'Todas'
                ? 'Todos os Docentes'
                : role === 'Ministrante'
                ? 'Professores Ministrantes'
                : 'Professores Mediadores';

            return (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  filterRole === role
                    ? 'bg-[#004A99] text-white dark:bg-[#00D8FF] dark:text-slate-950 shadow-xs'
                    : 'border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F2647]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Instant Search Bar */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, disciplina, escola ou município..."
            className="w-full rounded-md border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-[#00D8FF] focus:bg-white dark:focus:bg-[#0C1E38] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <TeacherProfiles filterRole={filterRole} searchQuery={searchQuery} />
    </div>
  );
}
