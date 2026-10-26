import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ProjectsInteractiveStage from '@/components/ProjectsInteractiveStage';

export const metadata: Metadata = {
  title: 'Missões e Projetos Pedagógicos | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Laboratório Vivo de Inovação Aplicada da Mediação Tecnológica em Rondônia. Conheça as missões agroecológicas, científicas, indígenas e tecnológicas desenvolvidas nas salas conectadas dos 52 municípios.',
};

export default function ProjetosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#040B16] text-[#0A2540] dark:text-[#E6F4FF] transition-colors duration-200">
      <SiteHeader />

      <main className="flex-1 pt-28 md:pt-32 pb-16">
        <ProjectsInteractiveStage />
      </main>

      <SiteFooter />
    </div>
  );
}
