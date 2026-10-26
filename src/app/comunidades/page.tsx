import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import SchoolMap from '@/components/SchoolMap';

export const metadata: Metadata = {
  title: 'O MEDTEC nas Comunidades | SEDUC-RO',
  description:
    'Presença e cobertura do Ensino Médio com Mediação Tecnológica em terras indígenas, comunidades ribeirinhas, quilombolas e assentamentos rurais de Rondônia.',
  openGraph: {
    title: 'O MEDTEC nas Comunidades | SEDUC-RO',
    description:
      'Explore as salas conectadas nas comunidades ribeirinhas, indígenas e rurais de Rondônia.',
  },
};

export default function ComunidadesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Território & Presença"
          title="O MEDTEC nas Comunidades"
          text="Explore os pontos conectados em terras indígenas, comunidades ribeirinhas, assentamentos e polos rurais em todos os 52 municípios de Rondônia."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          <SchoolMap />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
