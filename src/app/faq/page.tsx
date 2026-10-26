import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import FaqCentralSection from '@/components/FaqCentralSection';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes (FAQ) | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Base de conhecimento e respostas para dúvidas frequentes sobre a Mediação Tecnológica da SEDUC-RO, conectividade e rotina de aulas.',
  openGraph: {
    title: 'Perguntas Frequentes (FAQ) | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Tire dúvidas sobre aulas ao vivo via satélite, professores mediadores e suporte técnico do MEDTEC Rondônia.',
  },
};

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Base de Conhecimento & Suporte Técnico • SEDUC-RO"
          title="Central de Dúvidas Frequentes (FAQ)"
          text="Respostas rápidas sobre o funcionamento das aulas ao vivo via satélite, atuação dos professores mediadores, certificação do Ensino Médio e suporte técnico para as escolas conectadas nos 52 municípios de Rondônia."
        />

        <FaqCentralSection />
      </main>

      <SiteFooter />
    </div>
  );
}
