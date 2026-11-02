import React, { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Building2, MapPin, Quote, Users } from 'lucide-react';
import CommunityComingSoon from '@/components/CommunityComingSoon';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import RelatoProfessorForm from '@/components/RelatoProfessorForm';
import { ApiError, medtecApi, type ProfessorPublicoDetalhe } from '@/lib/api';
import { COMMUNITY_COMING_SOON, getNameInitials } from '@/lib/community-content';
import { isValidProfessorId } from '@/lib/professor-publico';

interface Props {
  params: Promise<{ id: string }>;
}

export const instant = false;

type FetchProfessorResult =
  | { status: 'ok'; item: ProfessorPublicoDetalhe }
  | { status: 'not_found' }
  | { status: 'unavailable' };

// fetch com signal não é memoizado: cache evita consultar a API de novo entre metadados e página.
const fetchProfessor = cache(async (id: string): Promise<FetchProfessorResult> => {
  if (!isValidProfessorId(id)) return { status: 'not_found' };
  try {
    const response = await medtecApi.professoresPublicos.get(Number(id));
    return { status: 'ok', item: response.data };
  } catch (error) {
    // Professor não publicado ou excluído responde 404; qualquer outra falha é da API.
    return { status: error instanceof ApiError && error.isNotFound() ? 'not_found' : 'unavailable' };
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchProfessor(id);
  if (result.status !== 'ok') return { title: 'Professor | MEDTEC Rondônia', robots: { index: false } };
  return {
    title: `${result.item.nome} | MEDTEC Rondônia - SEDUC-RO`,
    description: result.item.pratica_pedagogica,
  };
}

export default async function ProfessorDetalhePage({ params }: Props) {
  const { id } = await params;
  const result = await fetchProfessor(id);
  if (result.status === 'not_found') notFound();

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <Link href="/professores" className="inline-flex items-center gap-2 text-xs font-semibold text-[#05549D] dark:text-[#00D8FF] hover:underline">
            <ArrowLeft size={16} />
            <span>Voltar para o portfólio de professores</span>
          </Link>

          {result.status === 'unavailable' ? (
            <CommunityComingSoon icon={Users} message={COMMUNITY_COMING_SOON.professores} />
          ) : (
            <>
              <article className="rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-5 sm:p-8 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#004A99] text-white text-xl font-bold grid place-items-center shrink-0">{getNameInitials(result.item.nome)}</div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white break-words">{result.item.nome}</h1>
                </div>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400 shrink-0" /><span>{result.item.escola_nome}</span></p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400 shrink-0" /><span>{result.item.cidade_nome}</span></p>
                  {result.item.disciplinas.length > 0 && (
                    <p className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-slate-400 shrink-0" /><span>{result.item.disciplinas.map((item) => item.nome).join(', ')}</span></p>
                  )}
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Prática pedagógica</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">{result.item.pratica_pedagogica}</p>
                </div>
              </article>

              <section aria-labelledby="relatos-heading" className="space-y-3">
                <h2 id="relatos-heading" className="font-display text-lg font-bold text-slate-900 dark:text-white">Relatos dos alunos</h2>
                {result.item.relatos.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 dark:border-[#1A365D] p-6 text-center text-sm text-slate-500 dark:text-slate-400">Ainda não há relatos publicados.</p>
                ) : (
                  <ul className="space-y-3">
                    {result.item.relatos.map((relato, index) => (
                      <li key={`${relato.created_at}-${index}`} className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4">
                        <Quote className="h-5 w-5 text-slate-300 dark:text-slate-600 mb-1" />
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line break-words">{relato.texto}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">{`Aluno: ${relato.nome}`}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <RelatoProfessorForm professorId={result.item.id} professorNome={result.item.nome} />
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
