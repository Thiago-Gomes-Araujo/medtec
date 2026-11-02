'use client';

import Link from 'next/link';
import { Newspaper, Lightbulb, Megaphone, Images, UsersRound, HelpCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import type { useAdminOverview } from '@/components/admin/useAdminOverview';
import type { ProjetosResumo } from '@/components/admin/useProjetosResumo';

export type OverviewStatsIndicators = Pick<ReturnType<typeof useAdminOverview>,
  'loadingNews' | 'errorNews' | 'totalNews' | 'apiNewsPublishedCount' |
  'apiNewsDraftCount' | 'loadingAvisos' |
  'errorAvisos' | 'totalAvisos' | 'apiAvisosAtivosCount' | 'apiAvisosUrgentesCount' |
  'loadingFotos' | 'errorFotos' | 'totalFotos' | 'totalCategorias' |
  'loadingFaqs' | 'errorFaqs' | 'totalFaqs' | 'apiFaqsPendingCount' | 'apiFaqsPublishedCount' |
  'usersCountLabel'>;

interface OverviewStatsProps {
  indicators: OverviewStatsIndicators;
  projetosResumo?: ProjetosResumo;
  onOpenNews: () => void;
}

export default function OverviewStats({ indicators, projetosResumo, onOpenNews }: OverviewStatsProps) {
  const {
    loadingNews, errorNews, totalNews, apiNewsPublishedCount, apiNewsDraftCount,
    loadingAvisos, errorAvisos, totalAvisos,
    apiAvisosAtivosCount, apiAvisosUrgentesCount, loadingFotos, errorFotos,
    totalFotos, totalCategorias,
    loadingFaqs, errorFaqs, totalFaqs, apiFaqsPendingCount, apiFaqsPublishedCount,
    usersCountLabel,
  } = indicators;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

      {/* KPI 1: Notícias */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Notícias e Matérias
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 flex items-center justify-center">
            <Newspaper className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          {loadingNews ? (
            <div className="h-9 flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
              <span>Carregando API...</span>
            </div>
          ) : errorNews ? (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Indisponível</span>
              </p>
              <p className="text-[10px] text-slate-400">Falha ao consultar /n_noticias</p>
            </div>
          ) : (
            <>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {totalNews}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {apiNewsPublishedCount} no ar · {apiNewsDraftCount} rascunhos
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {totalNews === 0 ? 'Nenhuma matéria cadastrada' : 'Registros sincronizados com a API Rails'}
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onOpenNews}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
        >
          <span>Gerenciar Notícias</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* KPI: Projetos Pedagógicos */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Projetos Escolares
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40 flex items-center justify-center">
            <Lightbulb className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          {!projetosResumo || projetosResumo.error ? (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Indisponível</span>
              </p>
              <p className="text-[10px] text-slate-400">
                {projetosResumo ? `Falha ao consultar /pj_projetos · ${projetosResumo.error}` : 'Entre com CPF para consultar a API.'}
              </p>
            </div>
          ) : projetosResumo.total === null ? (
            <div className="h-9 flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              <span>Carregando API...</span>
            </div>
          ) : (
            <>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {projetosResumo.total}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {projetosResumo.published} publicado{projetosResumo.published === 1 ? '' : 's'} · {projetosResumo.pending} aguardando
              </p>
            </>
          )}
        </div>
        <Link
          href="/admin/projetos"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
        >
          <span>Gerenciar Projetos</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* KPI 2: Avisos */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Avisos e Comunicados
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
            <Megaphone className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          {loadingAvisos ? (
            <div className="h-9 flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
              <span>Carregando API...</span>
            </div>
          ) : errorAvisos ? (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Indisponível</span>
              </p>
              <p className="text-[10px] text-slate-400">Falha ao consultar /a_avisos</p>
            </div>
          ) : (
            <>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {totalAvisos}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {apiAvisosAtivosCount} avisos ativos no mural da Home
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {apiAvisosUrgentesCount !== null && apiAvisosUrgentesCount > 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                    {apiAvisosUrgentesCount} classificado{apiAvisosUrgentesCount === 1 ? '' : 's'} urgente
                  </span>
                ) : (
                  'Nenhum comunicado urgente ativo'
                )}
              </p>
            </>
          )}
        </div>
        <Link
          href="/admin/avisos"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
        >
          <span>Gerenciar Avisos</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* KPI: Galeria de Fotos */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Galeria de Fotos
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
            <Images className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          {loadingFotos ? (
            <div className="h-9 flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
              <span>Carregando API...</span>
            </div>
          ) : errorFotos ? (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Galeria Indisponível</span>
              </p>
              <p className="text-[10px] text-slate-400">Falha ao consultar /fotos_galeria</p>
            </div>
          ) : (
            <>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {totalFotos}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {totalCategorias} categoria{totalCategorias === 1 ? '' : 's'} de acervo escolar
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {totalFotos === 0 ? 'Nenhuma fotografia catalogada' : 'Acervo oficial sincronizado com a API Rails'}
              </p>
            </>
          )}
        </div>
        <Link
          href="/admin/galeria"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
        >
          <span>Gerenciar Galeria de Fotos</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* KPI 4: Equipe e Operadores */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Gerenciar Equipe e Senhas
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
            <UsersRound className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
            {usersCountLabel}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Operadores cadastrados com acesso por CPF
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Controle seguro de perfis e senhas
          </p>
        </div>
        <Link
          href="/admin/usuarios"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
        >
          <span>Gerenciar Operadores</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* KPI: Dúvidas Frequentes (FAQ) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Dúvidas Frequentes (FAQ)
          </span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-[#004A99] dark:text-sky-400 border border-sky-100/60 dark:border-sky-900/40 flex items-center justify-center">
            <HelpCircle className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          {loadingFaqs ? (
            <div className="h-9 flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
              <span>Carregando API...</span>
            </div>
          ) : errorFaqs ? (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Indisponível</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Falha ao consultar /d_duvidas · {errorFaqs}
              </p>
            </div>
          ) : (
            <>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {totalFaqs}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {apiFaqsPublishedCount} publicada{apiFaqsPublishedCount === 1 ? '' : 's'} · {apiFaqsPendingCount} aguardando
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {totalFaqs === 0 ? 'Nenhuma dúvida cadastrada' : 'Registros sincronizados com a API Rails'}
              </p>
            </>
          )}
        </div>
        <Link
          href="/admin/faq"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
        >
          <span>Gerenciar Dúvidas</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

    </div>
  );
}
