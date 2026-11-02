import React, { cache } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Download, Lightbulb, MapPin, Users } from 'lucide-react';
import CommunityComingSoon from '@/components/CommunityComingSoon';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { ApiError, getMediaUrl, medtecApi, type ProjetoPublicoDetalhe } from '@/lib/api';
import { COMMUNITY_COMING_SOON } from '@/lib/community-content';
import { formatFileSize, getProjetoImageSrc } from '@/lib/projetos-content';

interface Props {
  params: Promise<{ id: string }>;
}

export const instant = false;

type FetchProjetoResult =
  | { status: 'ok'; item: ProjetoPublicoDetalhe }
  | { status: 'not_found' }
  | { status: 'unavailable' };

// fetch com signal não é memoizado: cache evita consultar a API de novo entre metadados e página.
const fetchProjeto = cache(async (id: string): Promise<FetchProjetoResult> => {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return { status: 'not_found' };
  try {
    const response = await medtecApi.projetosPublicos.get(Number(id));
    return { status: 'ok', item: response.data };
  } catch (error) {
    // Projeto não publicado ou excluído responde 404; qualquer outra falha é da API.
    return { status: error instanceof ApiError && error.isNotFound() ? 'not_found' : 'unavailable' };
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchProjeto(id);
  if (result.status !== 'ok') return { title: 'Projeto | MEDTEC Rondônia', robots: { index: false } };
  return {
    title: `${result.item.titulo} | MEDTEC Rondônia - SEDUC-RO`,
    description: result.item.relato,
  };
}

export default async function ProjetoDetalhePage({ params }: Props) {
  const { id } = await params;
  const result = await fetchProjeto(id);
  if (result.status === 'not_found') notFound();
  const image = result.status === 'ok' ? getProjetoImageSrc(result.item) : '';

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pt-28 md:pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <Link href="/projetos" className="inline-flex items-center gap-2 text-xs font-semibold text-[#05549D] dark:text-[#00D8FF] hover:underline">
            <ArrowLeft size={16} />
            <span>Voltar para os projetos</span>
          </Link>

          {result.status === 'unavailable' ? (
            <CommunityComingSoon icon={Lightbulb} message={COMMUNITY_COMING_SOON.projetos} />
          ) : (
            <>
              <article className="overflow-hidden rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38]">
                {image && <Image unoptimized src={image} alt={`Capa do projeto ${result.item.titulo}`} width={1200} height={630} className="h-56 sm:h-80 w-full object-cover" />}
                <div className="p-5 sm:p-8 space-y-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#004A99] dark:text-sky-400">{result.item.tema_nome}</p>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white break-words">{result.item.titulo}</h1>
                  </div>
                  <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400 shrink-0" /><span>{result.item.escola_nome}</span></p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400 shrink-0" /><span>{result.item.cidade_nome}</span></p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line break-words">{result.item.relato}</p>
                </div>
              </article>

              {result.item.membros.length > 0 && (
                <section aria-labelledby="membros-heading" className="space-y-3">
                  <h2 id="membros-heading" className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-400" />
                    <span>Quem participou</span>
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {result.item.membros.map((membro, index) => (
                      <li key={`${membro.nome}-${index}`} className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white break-words">{membro.nome}</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 break-words">{membro.funcao}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.item.anexos.length > 0 && (
                <section aria-labelledby="anexos-heading" className="space-y-3">
                  <h2 id="anexos-heading" className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Download className="h-5 w-5 text-slate-400" />
                    <span>Anexos</span>
                  </h2>
                  <ul className="divide-y divide-slate-200 dark:divide-[#1A365D] rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38]">
                    {result.item.anexos.map((anexo) => (
                      <li key={anexo.id}>
                        <a href={getMediaUrl(anexo.url)} download={anexo.nome} target="_blank" rel="noopener noreferrer" aria-label={`Baixar ${anexo.nome}`} className="flex items-center justify-between gap-3 p-4 text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#10284A]">
                          <span className="min-w-0 break-all font-medium">{anexo.nome}</span>
                          <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{formatFileSize(anexo.tamanho)}</span>
                            <Download className="h-4 w-4" />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
