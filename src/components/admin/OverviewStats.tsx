'use client';

import type { useAdminOverview } from '@/components/admin/useAdminOverview';
import type { ProjetosResumo } from '@/components/admin/useProjetosResumo';
import { adminCardClass } from '@/components/admin/adminTheme';

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
  bannersTotal?: { count: number | null; error: string | null };
}

// Número sem confirmação não vira zero: carregando mostra reticências, e a falha, um traço com nome acessível.
function resumoValue(loading: boolean, failed: boolean, value: number | null | undefined) {
  if (failed) return <span title="Indisponível" aria-label="Indisponível">—</span>;
  if (loading || value === null || value === undefined) return <span title="Carregando" aria-label="Carregando">…</span>;
  return value;
}

export default function OverviewStats({ indicators, projetosResumo, bannersTotal }: OverviewStatsProps) {
  const { loadingNews, errorNews, totalNews, loadingAvisos, errorAvisos, totalAvisos, loadingFotos, errorFotos, totalFotos, loadingFaqs, errorFaqs, totalFaqs } = indicators;
  const items = [
    { label: 'Notícias', value: resumoValue(loadingNews, !!errorNews, totalNews) },
    { label: 'Projetos', value: resumoValue(false, !projetosResumo || !!projetosResumo.error, projetosResumo?.total) },
    { label: 'Avisos', value: resumoValue(loadingAvisos, !!errorAvisos, totalAvisos) },
    { label: 'Banners', value: resumoValue(false, !bannersTotal || !!bannersTotal.error, bannersTotal?.count) },
    { label: 'Fotos', value: resumoValue(loadingFotos, !!errorFotos, totalFotos) },
    { label: 'Perguntas', value: resumoValue(loadingFaqs, !!errorFaqs, totalFaqs) },
  ];

  return (
    <dl className={`${adminCardClass} grid grid-cols-2 gap-x-4 gap-y-3 p-4 sm:grid-cols-3 lg:grid-cols-6`}>
      {items.map(item => (
        <div key={item.label} className="flex flex-col-reverse">
          <dt className="text-xs text-admin-muted">{item.label}</dt>
          <dd className="text-xl font-bold leading-tight text-admin-text">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
