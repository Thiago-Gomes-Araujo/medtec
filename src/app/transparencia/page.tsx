import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import TransparencySection from '@/components/TransparencySection';

export const metadata: Metadata = {
  title: 'Transparência e Indicadores | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Prestação de contas pública, dados de atendimento escolar, contratos de satélite e fontes oficiais auditáveis da Mediação Tecnológica em Rondônia.',
  openGraph: {
    title: 'Transparência e Indicadores | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Dados públicos, execução orçamentária e indicadores educacionais auditáveis do MEDTEC Rondônia.',
  },
};

export default function TransparenciaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1528] text-slate-800 dark:text-slate-100 overflow-x-hidden max-w-[100vw]">
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
