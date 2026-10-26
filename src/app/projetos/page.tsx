import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ProjectsInteractiveStage from '@/components/ProjectsInteractiveStage';

export const metadata: Metadata = {
  title: 'Projetos Pedagógicos e Práticas Escolares | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Projetos pedagógicos e práticas de campo desenvolvidas nas salas de aula do Ensino Médio com Mediação Tecnológica da SEDUC-RO nos 52 municípios de Rondônia.',
  openGraph: {
    title: 'Projetos Pedagógicos e Práticas Escolares | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Projetos pedagógicos e práticas de campo desenvolvidas nas salas de aula do MEDTEC Rondônia.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projetos Pedagógicos e Práticas Escolares | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Projetos pedagógicos e práticas de campo desenvolvidas nas salas de aula do MEDTEC Rondônia.',
  },
};

export default function ProjetosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#040B16] text-[#0A2540] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pt-28 md:pt-32 pb-16">
        <ProjectsInteractiveStage />
      </main>

      <SiteFooter />
    </div>
  );
}
