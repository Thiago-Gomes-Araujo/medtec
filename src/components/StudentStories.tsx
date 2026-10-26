'use client';

import React, { useState, useEffect } from 'react';
import { Award, BadgeCheck, Users, Loader2 } from 'lucide-react';
import { Aluno } from '@/types';

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface StudentStoriesProps {
  filterCategory?: string;
}

export default function StudentStories({ filterCategory = 'Todas' }: StudentStoriesProps) {
  const [students, setStudents] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStudents() {
      setLoading(true);
      try {
        const query = filterCategory !== 'Todas' ? `?categoria=${encodeURIComponent(filterCategory)}` : '';
        const res = await fetch(`/api/students${query}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStudents(data.items || []);
          }
        }
      } catch (err) {
        console.error('Falha ao carregar alunos da API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStudents();
    return () => {
      isMounted = false;
    };
  }, [filterCategory]);

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white/60 dark:bg-[#0C1E38]/60 p-5 animate-pulse"
          >
            <div className="flex justify-between">
              <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
            <div className="mt-4 h-6 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-14 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-[#1A365D] p-12 text-center">
        <Users className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
          Nenhuma conquista encontrada
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Não há histórias de estudantes registradas para a categoria selecionada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {students.map((aluno: Aluno) => (
        <article
          key={aluno.id}
          className="flex flex-col rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-5 shadow-xs hover:border-sky-400 dark:hover:border-cyan-400/50 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-100 text-[#05549D] dark:bg-cyan-400/15 dark:text-cyan-300">
              {aluno.categoria}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
              <BadgeCheck className="h-4 w-4" />
              Imagem autorizada
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-600 dark:bg-emerald-500 font-display font-bold text-white shadow-xs">
              {getInitials(aluno.nome)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900 dark:text-white text-base text-balance">{aluno.nome}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {aluno.comunidade} · {aluno.municipio}
              </p>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 font-display font-semibold text-[#05549D] dark:text-[#00D8FF] text-sm text-balance">
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-[#05549D] dark:text-[#00D8FF]" />
            <span>{aluno.conquista}</span>
          </p>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
            {aluno.resumo}
          </p>
        </article>
      ))}
    </div>
  );
}
