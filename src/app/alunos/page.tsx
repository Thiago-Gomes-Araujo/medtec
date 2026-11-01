import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import AlunosView from '@/components/AlunosView';

export const metadata: Metadata = {
  title: 'Alunos que Inspiram | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Histórias reais de sucesso, aprovações e olimpíadas científicas conquistadas por estudantes do Ensino Médio com Mediação Tecnológica em Rondônia.',
  openGraph: {
    title: 'Alunos que Inspiram | MEDTEC Rondônia - SEDUC-RO',
    description:
      'Histórias inspiradoras dos estudantes das comunidades ribeirinhas, rurais e indígenas de Rondônia.',
  },
};

export default function AlunosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Protagonismo estudantil"
          title="Alunos que Inspiram"
          text="Histórias de jovens das comunidades ribeirinhas, rurais e terras indígenas transformadas pela mediação tecnológica."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          <AlunosView />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
