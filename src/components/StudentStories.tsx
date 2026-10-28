'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Medal,
  Cpu,
  FlaskConical,
  Award,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowRight,
  X,
  Quote,
  ShieldCheck,
  Users,
  Sparkles
} from 'lucide-react';
import { Aluno } from '@/types';

function CategoryIcon({ categoria, className }: { categoria: string; className?: string }) {
  switch (categoria) {
    case 'Vestibular':
      return <GraduationCap className={className} />;
    case 'Olimpíada':
      return <Medal className={className} />;
    case 'Robótica':
      return <Cpu className={className} />;
    case 'Feira de Ciências':
      return <FlaskConical className={className} />;
    default:
      return <Award className={className} />;
  }
}

function getCategoryTheme(categoria: string) {
  switch (categoria) {
    case 'Vestibular':
      return {
        badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
        badgeText: 'text-[#004A99] dark:text-[#38BDF8]',
        badgeBorder: 'border-sky-200 dark:border-sky-800/50',
        iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-[#004A99] dark:text-[#38BDF8]',
      };
    case 'Olimpíada':
      return {
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
        badgeText: 'text-amber-800 dark:text-amber-300',
        badgeBorder: 'border-amber-200 dark:border-amber-800/50',
        iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
      };
    case 'Robótica':
      return {
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badgeText: 'text-emerald-800 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800/50',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
      };
    case 'Feira de Ciências':
      return {
        badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
        badgeText: 'text-teal-800 dark:text-teal-300',
        badgeBorder: 'border-teal-200 dark:border-teal-800/50',
        iconBg: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
      };
    default:
      return {
        badgeBg: 'bg-slate-50 dark:bg-slate-800/40',
        badgeText: 'text-slate-800 dark:text-slate-200',
        badgeBorder: 'border-slate-200 dark:border-slate-700',
        iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      };
  }
}

interface StudentStoriesProps {
  filterCategory?: string;
}

export default function StudentStories({ filterCategory = 'Todas' }: StudentStoriesProps) {
  const [students, setStudents] = useState<Aluno[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
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

  // Handle escape key to close trajectory modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAluno(null);
    };
    if (selectedAluno) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedAluno]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Panoramic skeleton */}
        <div className="col-span-full rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white/70 dark:bg-[#0C1E38]/70 p-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-6 w-36 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-20 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>

        {/* Regular cards skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white/70 dark:bg-[#0C1E38]/70 overflow-hidden animate-pulse"
          >
            <div className="h-24 bg-slate-200 dark:bg-slate-700" />
            <div className="p-5 space-y-3">
              <div className="h-16 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 rounded bg-slate-200 dark:bg-slate-700 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#1A365D] p-12 text-center bg-white/50 dark:bg-[#0C1E38]/50">
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

  const featured = students[0];
  const remaining = students.slice(1);
  const featuredTheme = getCategoryTheme(featured.categoria);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* FEATURED ACHIEVEMENT CARD (Panoramic Col-Span-Full - Stanford Impact / Apple Stories style) */}
        {featured && (
          <article className="col-span-full rounded-2xl border-2 border-[#004A99]/20 dark:border-[#00D8FF]/30 bg-white dark:bg-[#0C1E38] shadow-md hover:shadow-lg transition-all overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Half: Achievement Seal, Impact Quote and Story */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-slate-50 to-white dark:from-[#061224] dark:to-[#0C1E38] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#1A365D]">
                <div>
                  {/* Category & Featured Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#004A99] text-white dark:bg-[#00D8FF] dark:text-slate-950">
                      Destaque Territorial
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${featuredTheme.badgeBg} ${featuredTheme.badgeText} border ${featuredTheme.badgeBorder}`}
                    >
                      <CategoryIcon categoria={featured.categoria} className="h-3.5 w-3.5" />
                      <span>{featured.categoria}</span>
                    </span>
                  </div>

                  {/* Main Achievement Header */}
                  <div className="mt-5 flex items-start gap-4">
                    <div
                      className={`p-3.5 rounded-xl shrink-0 ${featuredTheme.iconBg} border ${featuredTheme.badgeBorder}`}
                    >
                      <CategoryIcon categoria={featured.categoria} className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                        {featured.conquista}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Conquista de excelência viabilizada pela Mediação Tecnológica SEDUC-RO
                      </p>
                    </div>
                  </div>

                  {/* Narrative Quote */}
                  <div className="mt-5 relative bg-white dark:bg-[#061224] p-4 sm:p-5 rounded-xl border border-slate-200/90 dark:border-[#1A365D] shadow-2xs">
                    <Quote className="h-6 w-6 text-slate-300 dark:text-slate-600 mb-1" />
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed italic">
                      “{featured.resumo}”
                    </p>
                  </div>
                </div>

                {/* Left Bottom: Protagonist Identity */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1A365D]/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {featured.nome}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Estudante MEDTEC • {featured.idade} anos
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Half: Origin Route, School and Action */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-slate-50/60 dark:bg-[#061224]/60">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Origem & Rota Territorial
                  </span>

                  <div className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4 space-y-3">
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                      <MapPin className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-slate-900 dark:text-white">Comunidade de Origem:</strong>
                        <span>{featured.comunidade}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 pt-2.5 border-t border-slate-100 dark:border-[#1A365D]/60">
                      <Building2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-slate-900 dark:text-white">Município Polo:</strong>
                        <span>{featured.municipio}, Rondônia</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 pt-2.5 border-t border-slate-100 dark:border-[#1A365D]/60">
                      <Award className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-slate-900 dark:text-white">Modalidade:</strong>
                        <span>Aulas Diárias transmitidas ao vivo via Satélite Banda Ku</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1A365D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>✓ Termo LGPD Verificado</span>
                  </span>

                  <button
                    onClick={() => setSelectedAluno(featured)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#004A99] hover:bg-[#003875] text-white dark:bg-[#00D8FF] dark:hover:brightness-110 dark:text-slate-950 px-4 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Conhecer trajetória</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* REMAINING CARDS: Inverted Hierarchy (Trophy / Achievement banner on TOP) */}
        {remaining.map((aluno) => {
          const theme = getCategoryTheme(aluno.categoria);

          return (
            <article
              key={aluno.id}
              className="group flex flex-col rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs hover:shadow-md transition-all overflow-hidden"
            >
              {/* Top Banner: Achievement-First (Highlighted Banner with Trophy/Category and Bold Title) */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-[#1A365D] p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}
                  >
                    <CategoryIcon categoria={aluno.categoria} className="h-3.5 w-3.5" />
                    <span>{aluno.categoria}</span>
                  </span>

                  <div className={`p-1.5 rounded-lg ${theme.iconBg}`}>
                    <CategoryIcon categoria={aluno.categoria} className="h-4 w-4" />
                  </div>
                </div>

                {/* Bold Achievement Title */}
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-snug">
                  {aluno.conquista}
                </h3>
              </div>

              {/* Card Body: The Story */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                    História de Superação
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">
                    {aluno.resumo}
                  </p>
                </div>

                {/* Card Base: Protagonist and Territorial Route */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1A365D]/60 space-y-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {aluno.nome}
                    </h4>
                    <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {aluno.comunidade} • {aluno.municipio}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#1A365D]/60">
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>✓ Termo LGPD Verificado</span>
                    </span>

                    <button
                      onClick={() => setSelectedAluno(aluno)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#004A99] dark:text-[#00D8FF] hover:underline cursor-pointer"
                    >
                      <span>Conhecer trajetória</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Trajectory Modal: Detailed Student Journey */}
      {selectedAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0C1E38] shadow-2xl border border-slate-200 dark:border-[#1A365D] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-[#1A365D] flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-[#061224]/50">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-[#004A99] text-white dark:bg-[#00D8FF] dark:text-slate-950">
                    Protagonismo Estudantil
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {selectedAluno.categoria}
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedAluno.conquista}
                </h3>
              </div>

              <button
                onClick={() => setSelectedAluno(null)}
                className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Protagonist Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#061224] border border-slate-200 dark:border-[#1A365D]">
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    {selectedAluno.nome}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Idade: {selectedAluno.idade} anos • Modalidade Mediação Tecnológica
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF] shrink-0" />
                  <span>
                    {selectedAluno.comunidade}, {selectedAluno.municipio}
                  </span>
                </div>
              </div>

              {/* The Narrative Journey */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Relato da Trajetória com o MEDTEC</span>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] p-5 shadow-2xs">
                  <Quote className="h-6 w-6 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 italic">
                    “{selectedAluno.resumo}”
                  </p>
                </div>
              </div>

              {/* Territorial Impact & Inspiration */}
              <div className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] p-4 text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Impacto Comunitário & Inclusão Regional
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Histórias como a de {selectedAluno.nome} comprovam a eficácia da transmissão diária via satélite com tutoria presencial. O conhecimento gerado permanece na comunidade, servindo de inspiração para as novas turmas de estudantes em todo o estado de Rondônia.
                </p>
              </div>

              {/* LGPD and ECA Compliance Box */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Conformidade Legal (LGPD & ECA):</strong>
                  <span>
                    História e imagem publicadas com termo de consentimento livre e esclarecido assinado pelos responsáveis legais, registrado em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e o Estatuto da Criança e do Adolescente.
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-[#1A365D] bg-slate-50/70 dark:bg-[#061224]/70 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                MEDTEC Rondônia • SEDUC-RO
              </span>
              <button
                onClick={() => setSelectedAluno(null)}
                className="rounded-md bg-slate-900 dark:bg-[#00D8FF] px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:brightness-110 transition-colors cursor-pointer"
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
