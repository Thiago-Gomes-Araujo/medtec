'use client';

import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import FaqSection from '@/components/FaqSection';

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Esclarecimento de Dúvidas"
          title="Perguntas Frequentes (FAQ)"
          text="Tire suas dúvidas sobre a validade do diploma expedido pelo Governo de Rondônia, atuação diária do professor mediador, conexão via satélite nas comunidades remotas e o componente curricular NBAZ."
        />

        <div className="mx-auto max-w-7xl px-4 pt-4">
          <FaqSection />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
