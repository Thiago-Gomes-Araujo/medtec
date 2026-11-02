import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import ProjetosView from '@/components/ProjetosView';

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
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main id="conteudo-principal" className="flex-1 pb-16">
        <PageHeader
          eyebrow="SEDUC-RO • Coordenadoria de Mídias Educacionais"
          title="Projetos Escolares e Práticas Pedagógicas"
          text="Iniciativas de pesquisa, sustentabilidade e tecnologia desenvolvidas por turmas do Ensino Médio com Mediação Tecnológica em Rondônia."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          <ProjetosView />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
