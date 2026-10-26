import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import SchoolMap from '@/components/SchoolMap';

export const metadata: Metadata = {
  title: 'Mapa de Escolas Conectadas | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Radar interativo com geolocalização das escolas estaduais conectadas via satélite nos 52 municípios de Rondônia, turmas ativas e professores mediadores.',
  openGraph: {
    title: 'Mapa de Escolas Conectadas | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Geolocalização das escolas estaduais atendidas pelo MEDTEC nos 52 municípios de Rondônia.',
  },
};

export default function MapaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="O MEDTEC nas comunidades"
          title="Mapa de Escolas Conectadas"
          text="Selecione um município ou tipo de localidade para ver turmas, alunos matriculados, tipo de infraestrutura de conectividade e professores mediadores responsáveis em Rondônia."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          <SchoolMap />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
