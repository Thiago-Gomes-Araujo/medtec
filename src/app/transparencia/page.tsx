'use client';

import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import TransparencySection from '@/components/TransparencySection';

export default function TransparenciaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Dados públicos"
          title="Transparência e Indicadores"
          text="Cada dado traz data de referência e fonte oficial verificável (SEDUC/RO, Diário Oficial, PNCP, Portal da Transparência de Rondônia e Censo Escolar/INEP). Prestação de contas aberta e auditável."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          <TransparencySection />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
