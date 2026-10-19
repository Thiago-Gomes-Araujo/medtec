'use client';

import React, { useState } from 'react';
import { MapPin, School, X, Quote, Sparkles } from 'lucide-react';
import { Professor, professoresData } from '@/data/medtecData';

function getInitials(name: string) {
  const parts = name.replace(/^(Prof\.|Profa\.)\s*/i, '').trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface TeacherProfilesProps {
  filterRole?: 'Todas' | 'Ministrante' | 'Mediador';
}

export default function TeacherProfiles({ filterRole = 'Todas' }: TeacherProfilesProps) {
  const [selectedProf, setSelectedProf] = useState<Professor | null>(null);

  const displayedProfs = professoresData.filter((p) => {
    if (filterRole === 'Todas') return true;
    if (filterRole === 'Mediador') return p.funcao === 'Mediador' || p.funcao === 'Mediadora';
    return p.funcao === filterRole;
  });

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {displayedProfs.map((p) => (
          <article
            key={p.id}
            className="flex flex-col rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-5 shadow-xs hover:border-sky-400 dark:hover:border-cyan-400/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground shadow-sm">
                {getInitials(p.nome)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-900 dark:text-white text-base">{p.nome}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{p.disciplina}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  p.funcao === 'Ministrante'
                    ? 'bg-sky-100 text-[#05549D] dark:bg-cyan-400/15 dark:text-cyan-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-[#061224] dark:text-slate-300'
                }`}
              >
                {p.funcao}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-[#1A365D] px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#061224]">
                <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                {p.municipio}
              </span>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <School className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="truncate">{p.escola}</span>
            </p>

            <p className="mt-3 flex-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {p.resumo}
            </p>

            <button
              onClick={() => setSelectedProf(p)}
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F2647] hover:text-[#05549D] dark:hover:text-[#00D8FF] transition-colors cursor-pointer"
            >
              Ler entrevista completa
            </button>
          </article>
        ))}
      </div>

      {/* Teacher Interview Modal */}
      {selectedProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0C1E38] p-6 shadow-2xl border border-slate-200 dark:border-[#1A365D] max-h-[90vh] overflow-y-auto transition-colors">
            <button
              onClick={() => setSelectedProf(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {getInitials(selectedProf.nome)}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {selectedProf.nome}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedProf.funcao} · {selectedProf.disciplina} · {selectedProf.escola}, {selectedProf.municipio}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 dark:border-[#1A365D]/60 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-cyan-300 bg-sky-50 dark:bg-cyan-950/30 border border-sky-200 dark:border-cyan-800/40 rounded-lg px-2.5 py-1 mb-4 w-fit">
                <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />
                Relato Direto do Cotidiano com Mediação Tecnológica
              </div>

              <div className="relative bg-slate-50 dark:bg-[#061224] rounded-xl p-4 border border-slate-200/80 dark:border-[#1A365D]">
                <Quote className="h-6 w-6 text-slate-300 dark:text-slate-600 absolute -top-3 left-3 bg-slate-50 dark:bg-[#061224] px-0.5" />
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic pt-1">
                  “{selectedProf.entrevista}”
                </p>
              </div>

              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p><span className="font-semibold text-slate-700 dark:text-slate-200">Atuação pedagógica:</span> {selectedProf.resumo}</p>
                <p><span className="font-semibold text-slate-700 dark:text-slate-200">Polos atendidos:</span> Rede Estadual SEDUC-RO, modalidade presencial conectada via satélite.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProf(null)}
                className="rounded-lg bg-slate-900 dark:bg-[#00D8FF] px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:brightness-110 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
