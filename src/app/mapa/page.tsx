'use client';

import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import SchoolMap from '@/components/SchoolMap';

export default function MapaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
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
