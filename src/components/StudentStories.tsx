'use client';

import React from 'react';
import { Award, BadgeCheck } from 'lucide-react';
import { alunosData, Aluno } from '@/data/medtecData';

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface StudentStoriesProps {
  filterCategory?: string;
}

export default function StudentStories({ filterCategory = 'Todas' }: StudentStoriesProps) {
  const displayedStudents = alunosData.filter((a) => {
    if (filterCategory === 'Todas') return true;
    return a.categoria === filterCategory;
  });

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {displayedStudents.map((aluno: Aluno) => (
        <article
          key={aluno.id}
          className="flex flex-col rounded-2xl border border-slate-200 bg-card p-5 shadow-card hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-soft text-accent-foreground">
              {aluno.categoria}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <BadgeCheck className="h-4 w-4" />
              Imagem autorizada
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-success font-display font-bold text-success-foreground shadow-sm">
              {getInitials(aluno.nome)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900 text-base">{aluno.nome}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {aluno.comunidade} · {aluno.municipio}
              </p>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 font-display font-semibold text-primary text-sm">
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{aluno.conquista}</span>
          </p>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {aluno.resumo}
          </p>
        </article>
      ))}
    </div>
  );
}
