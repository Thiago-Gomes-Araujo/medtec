import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import AvisosView from '@/components/AvisosView';
import { ApiError, medtecApi, type AvisoPublico, type PaginatedData } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Mural de Avisos Oficiais | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Orientações pedagógicas, alertas urgentes, datas de início de transmissões satelitais e informes emitidos pela Coordenadoria de Mídias Educacionais da SEDUC-RO.',
  openGraph: {
    title: 'Mural de Avisos Oficiais | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Orientações pedagógicas, alertas e informes da Coordenadoria de Mídias Educacionais da SEDUC-RO.',
  },
};

type AvisosSearchParams = Promise<Record<string, string | string[] | undefined>>;

async function PublicAvisosContent({ searchParams }: { searchParams?: AvisosSearchParams }) {
  const params = await searchParams || {};
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const positiveInteger = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    return value && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(parsed) ? parsed : fallback;
  };
  const page = positiveInteger(first(params.page), 1);
  const perPage = Math.min(positiveInteger(first(params.per_page), 10), 100);
  const tipo = first(params.tipo)?.trim() || undefined;
  let data: PaginatedData<AvisoPublico> | undefined;
  let loadError: string | null = null;
  try {
    const response = await medtecApi.avisos.listPublico({ page, per_page: perPage, tipo });
    data = response.data;
  } catch (error) {
    const message = ApiError.getFriendlyMessage(error);
    const status = error instanceof ApiError && error.status > 0 ? ' (HTTP ' + error.status + ')' : '';
    loadError = message + status;
  }
  return <AvisosView key={JSON.stringify([page, perPage, tipo])}
    announcements={data?.items || []} pagination={data?.pagination} tipo={tipo} error={loadError} />;
}

export default function AvisosPage({ searchParams }: { searchParams?: AvisosSearchParams }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F9] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main id="conteudo-principal" className="flex-1 pb-16">
        <PageHeader
          eyebrow="Mural Oficial de Comunicação"
          title="Avisos e Comunicados Oficiais"
          text="Acompanhe as orientações pedagógicas, alertas urgentes, datas de início de transmissões satelitais e informes emitidos pela Coordenadoria de Mídias Educacionais (SEDUC-RO)."
        />

        <div className="mx-auto max-w-7xl px-4 pt-8">
          <Suspense fallback={<AvisosView announcements={[]} loading />}>
            <PublicAvisosContent searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
