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
            className="flex flex-col rounded-2xl border border-slate-200 bg-card p-5 shadow-card hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground shadow-sm">
                {getInitials(p.nome)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-900 text-base">{p.nome}</h3>
                <p className="text-sm text-slate-500 font-medium">{p.disciplina}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  p.funcao === 'Ministrante'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {p.funcao}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 bg-slate-50">
                <MapPin className="h-3 w-3 text-slate-400" />
                {p.municipio}
              </span>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
              <School className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{p.escola}</span>
            </p>

            <p className="mt-3 flex-1 text-sm text-slate-700 leading-relaxed">
              {p.resumo}
            </p>

            <button
              onClick={() => setSelectedProf(p)}
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
            >
              Ler entrevista completa
            </button>
          </article>
        ))}
      </div>

      {/* Teacher Interview Modal */}
      {selectedProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProf(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {getInitials(selectedProf.nome)}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {selectedProf.nome}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedProf.funcao} · {selectedProf.disciplina} · {selectedProf.escola}, {selectedProf.municipio}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 bg-sky-50 rounded-lg px-2.5 py-1 mb-4 w-fit">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                Relato Direto do Cotidiano com Mediação Tecnológica
              </div>

              <div className="relative bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                <Quote className="h-6 w-6 text-slate-300 absolute -top-3 left-3 bg-slate-50 px-0.5" />
                <p className="text-sm leading-relaxed text-slate-700 italic pt-1">
                  “{selectedProf.entrevista}”
                </p>
              </div>

              <div className="mt-4 text-xs text-slate-500 space-y-1">
                <p><span className="font-semibold text-slate-700">Atuação pedagógica:</span> {selectedProf.resumo}</p>
                <p><span className="font-semibold text-slate-700">Polos atendidos:</span> Rede Estadual SEDUC-RO, modalidade presencial conectada via satélite.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProf(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
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
