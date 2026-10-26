import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import ProfessoresView from '@/components/ProfessoresView';

export const metadata: Metadata = {
  title: 'Professores e Mediadores | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Conheça o corpo docente do MEDTEC Rondônia: professores ministrantes nos estúdios da SEDUC e professores mediadores presentes nas salas de aula nos 52 municípios.',
  openGraph: {
    title: 'Professores e Mediadores | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Corpo docente do Ensino Médio com Mediação Tecnológica em Rondônia: professores ministrantes e mediadores presenciais.',
  },
};

export default function ProfessoresPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Quem faz acontecer"
          title="Professores e Mediadores"
          text="Ministrantes produzem e transmitem as aulas a partir do estúdio central da SEDUC; mediadores acompanham presencialmente cada turma nas salas de aula conectadas em todo o estado de Rondônia."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          <ProfessoresView />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
