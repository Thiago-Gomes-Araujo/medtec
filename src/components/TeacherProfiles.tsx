'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Tv,
  School,
  X,
  Quote,
  Sparkles,
  Users,
  BookOpen,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { Professor } from '@/types';

function getInitials(name: string) {
  const parts = name.replace(/^(Prof\.|Profa\.)\s*/i, '').trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface TeacherProfilesProps {
  filterRole?: 'Todas' | 'Ministrante' | 'Mediador';
  searchQuery?: string;
}

export default function TeacherProfiles({
  filterRole = 'Todas',
  searchQuery = ''
}: TeacherProfilesProps) {
  const [selectedProf, setSelectedProf] = useState<Professor | null>(null);
  const [teachers, setTeachers] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTeachers() {
      setLoading(true);
      try {
        const query = filterRole !== 'Todas' ? `?funcao=${encodeURIComponent(filterRole)}` : '';
        const res = await fetch(`/api/teachers${query}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setTeachers(data.items || []);
          }
        }
      } catch (err) {
        console.error('Falha ao carregar professores da API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTeachers();
    return () => {
      isMounted = false;
    };
  }, [filterRole]);

  // Handle escape key to close lateral drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProf(null);
    };
    if (selectedProf) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedProf]);

  // Instant client-side search filtering
  const filteredTeachers = teachers.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.nome.toLowerCase().includes(q) ||
      p.disciplina.toLowerCase().includes(q) ||
      p.escola.toLowerCase().includes(q) ||
      p.municipio.toLowerCase().includes(q) ||
      p.resumo.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white/70 dark:bg-[#0C1E38]/70 overflow-hidden animate-pulse"
          >
            <div className="sm:w-56 p-5 bg-slate-50 dark:bg-[#061224] border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-[#1A365D] space-y-3">
              <div className="h-14 w-14 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex-1 p-5 space-y-3">
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-12 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-8 w-28 rounded bg-slate-200 dark:bg-slate-700 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredTeachers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#1A365D] p-12 text-center bg-white/50 dark:bg-[#0C1E38]/50">
        <Users className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
          Nenhum docente encontrado
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          {searchQuery
            ? `Nenhum professor corresponde à busca por "${searchQuery}". Verifique o termo ou redefina o filtro.`
            : 'Não há registros de professores correspondentes ao filtro selecionado na base oficial.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 2-Column Horizontal Cards Grid (Executive Academic Faculty Directory) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeachers.map((p) => {
          const isMinistrante = p.funcao === 'Ministrante';

          return (
            <article
              key={p.id}
              className={`group flex flex-col sm:flex-row rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs hover:shadow-md transition-all overflow-hidden ${
                isMinistrante
                  ? 'border-l-4 border-l-[#004A99] dark:border-l-[#38BDF8]'
                  : 'border-l-4 border-l-[#0F766E] dark:border-l-[#2DD4BF]'
              }`}
            >
              {/* Left Identity Panel */}
              <div className="sm:w-56 shrink-0 p-5 bg-slate-50/70 dark:bg-[#061224]/70 border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-[#1A365D]/80 flex flex-col justify-between">
                <div>
                  {/* Square Avatar with Technical Corners */}
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-lg font-display text-lg font-bold text-white shadow-xs ${
                      isMinistrante ? 'bg-[#004A99]' : 'bg-[#0F766E]'
                    }`}
                  >
                    {getInitials(p.nome)}
                  </div>

                  {/* Teacher Name */}
                  <h3 className="mt-3 font-display font-bold text-slate-900 dark:text-white text-base leading-snug">
                    {p.nome}
                  </h3>

                  {/* Specialty / Discipline Box */}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] text-slate-800 dark:text-slate-200 shadow-2xs">
                    <BookOpen className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{p.disciplina}</span>
                  </div>
                </div>

                {/* Role Technical Badge */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-[#1A365D]/60">
                  {isMinistrante ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/40 text-[#004A99] dark:text-[#38BDF8] border border-sky-200 dark:border-sky-800/50">
                      <Tv className="h-3.5 w-3.5 shrink-0" />
                      <span>Docente Ministrante • Estúdio SEDUC</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#2DD4BF] border border-teal-200 dark:border-teal-800/50">
                      <School className="h-3.5 w-3.5 shrink-0" />
                      <span>Mediação Presencial • Unidade Escolar</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Content Panel */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  {/* Lotação: Escola + Município */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-[#1A365D]/60">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate max-w-[200px]">{p.escola}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{p.municipio}</span>
                    </span>
                  </div>

                  {/* Prática Pedagógica */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                      Prática Pedagógica
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {p.resumo}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A365D]/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    ID: DOC-{String(p.id).padStart(3, '0')}
                  </span>

                  <button
                    onClick={() => setSelectedProf(p)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#004A99] hover:text-white hover:border-[#004A99] dark:hover:bg-[#00D8FF] dark:hover:text-slate-950 dark:hover:border-[#00D8FF] transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Ler entrevista completa</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Lateral Drawer (Right-side slide drawer for Academic Faculty Interview) */}
      {selectedProf && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedProf(null)}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Sliding Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white dark:bg-[#0C1E38] shadow-2xl border-l border-slate-200 dark:border-[#1A365D] flex flex-col transform transition-transform duration-300 ease-out">
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 dark:border-[#1A365D] flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-[#061224]/50">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-lg font-display text-lg font-bold text-white shadow-xs ${
                      selectedProf.funcao === 'Ministrante' ? 'bg-[#004A99]' : 'bg-[#0F766E]'
                    }`}
                  >
                    {getInitials(selectedProf.nome)}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {selectedProf.nome}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {selectedProf.disciplina}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedProf.funcao}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProf(null)}
                  className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Fechar gaveta"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Institutional Role Badge */}
                <div>
                  {selectedProf.funcao === 'Ministrante' ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 text-[#004A99] dark:text-[#38BDF8]">
                      <Tv className="h-4 w-4 shrink-0" />
                      <div className="text-xs">
                        <strong className="block font-semibold">Docente Ministrante • Estúdio Central PVH</strong>
                        <span className="text-sky-900/80 dark:text-sky-200/80 text-[11px]">
                          Produção pedagógica, transmissão ao vivo via satélite e elaboração de roteiros de aula.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 text-[#0F766E] dark:text-[#2DD4BF]">
                      <School className="h-4 w-4 shrink-0" />
                      <div className="text-xs">
                        <strong className="block font-semibold">Mediação Presencial • Unidade Escolar</strong>
                        <span className="text-teal-900/80 dark:text-teal-200/80 text-[11px]">
                          Tutoria diária em sala conectada, dinamização metodológica e suporte individualizado ao estudante.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location & Placement */}
                <div className="rounded-lg border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    <span><strong>Lotação:</strong> {selectedProf.escola}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span><strong>Município:</strong> {selectedProf.municipio}, Rondônia</span>
                  </div>
                </div>

                {/* Interview / Direct Quote */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white mb-2.5">
                    <Sparkles className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
                    <span>Entrevista Completa com o(a) Docente</span>
                  </div>

                  <div className="relative rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] p-5 shadow-2xs">
                    <Quote className="h-6 w-6 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 italic">
                      “{selectedProf.entrevista}”
                    </p>
                  </div>
                </div>

                {/* Pedagogical Methodology */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white mb-2">
                    <GraduationCap className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
                    <span>Metodologia Pedagógica Aplicada</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#061224] p-4 rounded-lg border border-slate-200 dark:border-[#1A365D]">
                    {selectedProf.resumo}
                  </p>
                </div>

                {/* Guidance for Students */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white mb-2">
                    <BookOpen className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
                    <span>Recomendação aos Estudantes do MEDTEC</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    A disciplina de {selectedProf.disciplina} requer participação ativa durante as transmissões ao vivo e resolução colaborativa das listas de atividades sob supervisão do professor mediador na escola.
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-[#1A365D] bg-slate-50/70 dark:bg-[#061224]/70 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  SEDUC-RO • Diretoria Geral de Educação
                </span>
                <button
                  onClick={() => setSelectedProf(null)}
                  className="rounded-md bg-slate-900 dark:bg-[#00D8FF] px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:brightness-110 transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
