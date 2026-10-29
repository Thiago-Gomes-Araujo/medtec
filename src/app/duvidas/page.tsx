import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import FaqCentralSection from '@/components/FaqCentralSection';
import { FaqItem } from '@/types';

export const metadata: Metadata = {
  title: 'Dúvidas Frequentes (FAQ) | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Respostas para dúvidas sobre aulas síncronas via satélite, professores mediadores, matriz curricular e certificação do Ensino Médio pela SEDUC-RO.',
  openGraph: {
    title: 'Dúvidas Frequentes (FAQ) | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Perguntas e respostas sobre o funcionamento do Ensino Médio com Mediação Tecnológica em Rondônia.',
  },
};

export default function DuvidasPage() {
  const faqs: FaqItem[] = [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1528] text-slate-800 dark:text-slate-100 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Perguntas Frequentes"
          title="Central de Dúvidas Frequentes (FAQ)"
          text="Respostas sobre o funcionamento das aulas ao vivo via satélite, atuação dos professores mediadores, certificação do Ensino Médio e suporte pedagógico para as escolas conectadas nos 52 municípios de Rondônia."
        />

        <FaqCentralSection initialFaqs={faqs} />
      </main>

      <SiteFooter />
    </div>
  );
}
