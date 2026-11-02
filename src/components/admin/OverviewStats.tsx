'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Newspaper, Lightbulb, Megaphone, Images, UsersRound, HelpCircle, Loader2, AlertCircle, ArrowRight, type LucideIcon } from 'lucide-react';
import type { useAdminOverview } from '@/components/admin/useAdminOverview';
import type { ProjetosResumo } from '@/components/admin/useProjetosResumo';
import { adminCardClass, adminLinkClass } from '@/components/admin/adminTheme';

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

function StatCard({ title, icon: Icon, action, children }: { title: string; icon: LucideIcon; action: ReactNode; children: ReactNode }) {
  return (
    <div className={`${adminCardClass} p-4 flex flex-col justify-between space-y-3`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-admin-muted">{title}</span>
        <Icon className="h-4 w-4 shrink-0 text-admin-muted" aria-hidden="true" />
      </div>
      <div>{children}</div>
      <div className="pt-2 border-t border-admin-border">{action}</div>
    </div>
  );
}

function StatLoading() {
  return (
    <div className="h-9 flex items-center gap-2 text-admin-muted text-xs">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Carregando...</span>
    </div>
  );
}

function StatError({ detail = 'Não foi possível carregar agora.' }: { detail?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-sm font-semibold text-admin-danger flex items-center gap-1.5">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>Indisponível</span>
      </p>
      <p className="text-[11px] text-admin-muted">{detail}</p>
    </div>
  );
}

function StatValue({ value, children }: { value: ReactNode; children?: ReactNode }) {
  return (
    <>
      <p className="text-2xl font-bold text-admin-text leading-none">{value}</p>
      <div className="text-xs text-admin-muted mt-1 space-y-0.5">{children}</div>
    </>
  );
}

function StatLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={adminLinkClass}>
      <span>{children}</span>
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
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
      <StatCard title="Notícias" icon={Newspaper} action={
        <button type="button" onClick={onOpenNews} className={adminLinkClass}>
          <span>Ver notícias</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      }>
        {loadingNews ? <StatLoading /> : errorNews ? <StatError /> : (
          <StatValue value={totalNews}>
            <p>{apiNewsPublishedCount} no ar · {apiNewsDraftCount} aguardando</p>
            {totalNews === 0 && <p>Nenhuma notícia cadastrada</p>}
          </StatValue>
        )}
      </StatCard>

      <StatCard title="Projetos" icon={Lightbulb} action={<StatLink href="/admin/projetos">Ver projetos</StatLink>}>
        {!projetosResumo || projetosResumo.error ? <StatError detail={projetosResumo ? projetosResumo.error ?? undefined : 'Entre com seu CPF para ver este número.'} />
          : projetosResumo.total === null ? <StatLoading /> : (
            <StatValue value={projetosResumo.total}>
              <p>{projetosResumo.published} publicado{projetosResumo.published === 1 ? '' : 's'} · {projetosResumo.pending} aguardando</p>
            </StatValue>
          )}
      </StatCard>

      <StatCard title="Avisos" icon={Megaphone} action={<StatLink href="/admin/avisos">Ver avisos</StatLink>}>
        {loadingAvisos ? <StatLoading /> : errorAvisos ? <StatError /> : (
          <StatValue value={totalAvisos}>
            <p>{apiAvisosAtivosCount} avisos no site</p>
            {apiAvisosUrgentesCount !== null && apiAvisosUrgentesCount > 0
              ? <p className="font-semibold text-admin-danger">{apiAvisosUrgentesCount} urgente{apiAvisosUrgentesCount === 1 ? '' : 's'}</p>
              : <p>Nenhum comunicado urgente ativo</p>}
          </StatValue>
        )}
      </StatCard>

      <StatCard title="Galeria de fotos" icon={Images} action={<StatLink href="/admin/galeria">Ver galeria</StatLink>}>
        {loadingFotos ? <StatLoading /> : errorFotos ? <StatError /> : (
          <StatValue value={totalFotos}>
            <p>{totalCategorias} categoria{totalCategorias === 1 ? '' : 's'}</p>
            {totalFotos === 0 && <p>Nenhuma foto cadastrada</p>}
          </StatValue>
        )}
      </StatCard>

      <StatCard title="Usuários" icon={UsersRound} action={<StatLink href="/admin/usuarios">Ver usuários</StatLink>}>
        <StatValue value={usersCountLabel}>
          <p>Pessoas com acesso ao painel</p>
        </StatValue>
      </StatCard>

      <StatCard title="Perguntas frequentes" icon={HelpCircle} action={<StatLink href="/admin/faq">Ver perguntas</StatLink>}>
        {loadingFaqs ? <StatLoading /> : errorFaqs ? <StatError detail={errorFaqs} /> : (
          <StatValue value={totalFaqs}>
            <p>{apiFaqsPublishedCount} publicada{apiFaqsPublishedCount === 1 ? '' : 's'} · {apiFaqsPendingCount} aguardando</p>
            {totalFaqs === 0 && <p>Nenhuma dúvida cadastrada</p>}
          </StatValue>
        )}
      </StatCard>
    </div>
  );
}
