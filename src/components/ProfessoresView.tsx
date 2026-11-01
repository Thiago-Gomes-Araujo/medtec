'use client';

import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import TeacherProfiles from '@/components/TeacherProfiles';
import { medtecApi, type DisciplinaPublica } from '@/lib/api';

export default function ProfessoresView() {
  const [disciplinas, setDisciplinas] = useState<DisciplinaPublica[]>([]);
  const [disciplina, setDisciplina] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function loadDisciplinas() {
      try {
        const response = await medtecApi.professoresPublicos.listDisciplinas(controller.signal);
        if (!controller.signal.aborted) setDisciplinas(response.data);
      } catch (err) {
        // A lista de professores continua disponível sem o filtro.
        if (!controller.signal.aborted) console.warn('Falha ao carregar disciplinas do portfólio:', err);
      }
    }
    void loadDisciplinas();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setBusca(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs">
        <select
          name="professores-disciplina"
          aria-label="Filtrar por disciplina"
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
          className="w-full md:w-72 rounded-md border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-[#00D8FF]"
        >
          <option value="">Todas as disciplinas</option>
          {disciplinas.map((item) => <option key={item.slug} value={item.slug}>{item.nome}</option>)}
        </select>

        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            name="professores-busca"
            aria-label="Buscar professores"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, disciplina, escola ou município..."
            className="w-full rounded-md border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-[#00D8FF] focus:bg-white dark:focus:bg-[#0C1E38] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* A chave volta à primeira página sempre que um filtro muda. */}
      <TeacherProfiles key={`${disciplina}|${busca}`} disciplina={disciplina} busca={busca} />
    </div>
  );
}
