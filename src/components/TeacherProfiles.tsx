'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Building2, MapPin, Users } from 'lucide-react';
import { medtecApi, type PaginationMeta, type ProfessorPublico } from '@/lib/api';
import CommunityComingSoon from '@/components/CommunityComingSoon';
import { COMMUNITY_COMING_SOON, getNameInitials } from '@/lib/community-content';

interface TeacherProfilesProps {
  disciplina?: string;
  busca?: string;
  onUnavailable?: () => void;
}

export default function TeacherProfiles({ disciplina = '', busca = '', onUnavailable }: TeacherProfilesProps) {
  const [teachers, setTeachers] = useState<ProfessorPublico[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadTeachers() {
      setLoading(true);
      try {
        const response = await medtecApi.professoresPublicos.list({
          disciplina: disciplina || undefined, busca: busca || undefined, page, per_page: 12,
        }, controller.signal);
        if (controller.signal.aborted) return;
        setTeachers(response.data.items);
        setPagination(response.data.pagination);
      } catch {
        if (!controller.signal.aborted) {
          setUnavailable(true);
          onUnavailable?.();
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadTeachers();
    return () => controller.abort();
  }, [disciplina, busca, page, onUnavailable]);

  if (loading) {
    return (
      <div role="status" aria-label="Carregando professores" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white/70 dark:bg-[#0C1E38]/70 p-5 animate-pulse">
            <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="mt-4 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  if (unavailable) {
    return <CommunityComingSoon icon={Users} message={COMMUNITY_COMING_SOON.professores} />;
  }

  if (teachers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#1A365D] p-12 text-center bg-white/50 dark:bg-[#0C1E38]/50">
        <Users className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Nenhum professor encontrado</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ajuste a busca ou escolha outra disciplina.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((prof) => (
          <article key={prof.id} className="flex flex-col rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#004A99] text-white font-bold grid place-items-center shrink-0">{getNameInitials(prof.nome)}</div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white break-words">{prof.nome}</h3>
            </div>
            {prof.disciplinas.length > 0 && (
              <p className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <BookOpen className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
                <span>{prof.disciplinas.map((item) => item.nome).join(', ')}</span>
              </p>
            )}
            <div className="mt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Prática pedagógica</span>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-4">{prof.pratica_pedagogica}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A365D] space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{prof.escola_nome}</span></p>
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{prof.cidade_nome}</span></p>
            </div>
            <Link href={`/professores/${prof.id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#004A99] dark:text-[#38BDF8] hover:underline">
              <span>Ver página e relatos de {prof.nome}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </article>
        ))}
      </div>

      {pagination && pagination.total_pages > 1 && (
        <nav aria-label="Paginação de professores" className="mt-8 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border border-slate-200 dark:border-[#1A365D] px-3 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Anterior</button>
          <span>Página {pagination.current_page} de {pagination.total_pages}</span>
          <button type="button" disabled={page >= pagination.total_pages} onClick={() => setPage(page + 1)} className="rounded-md border border-slate-200 dark:border-[#1A365D] px-3 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Próxima</button>
        </nav>
      )}
    </>
  );
}
