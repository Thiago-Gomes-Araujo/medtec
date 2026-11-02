import React from 'react';
import type { Metadata } from 'next';
import { Tv, Users, Building2 } from 'lucide-react';
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
  const dualRolePanel = (
    <div className="rounded-xl border border-white/20 bg-white/10 dark:bg-[#0C1E38]/85 backdrop-blur-md p-5 text-white shadow-lg space-y-3.5">
      <div className="flex items-center gap-2 pb-2.5 border-b border-white/15">
        <Building2 className="h-4 w-4 text-sky-300 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
          Painel Duplo de Atuação Docente
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/25 text-sky-300 border border-sky-400/40">
          <Tv className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white">Ministrantes</span>
            <span className="rounded bg-sky-400/20 px-2 py-0.5 text-[10px] font-semibold text-sky-200 border border-sky-400/30">
              Estúdio Central PVH
            </span>
          </div>
          <p className="text-xs text-sky-100/90 mt-0.5 leading-relaxed">
            Produzem o material didático e transmitem as aulas ao vivo.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 pt-2.5 border-t border-white/10">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
          <Users className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white">Mediadores</span>
            <span className="rounded bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 border border-emerald-400/30">
              Salas Conectadas
            </span>
          </div>
          <p className="text-xs text-sky-100/90 mt-0.5 leading-relaxed">
            Acompanham presencialmente os alunos nos 52 municípios.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main id="conteudo-principal" className="flex-1 pb-16">
        <PageHeader
          eyebrow="Quem faz acontecer"
          title="Professores e Mediadores"
          text="Corpo docente de excelência articulando produção pedagógica em estúdio central de alta tecnologia e tutoria presencial diária nas salas de aula conectadas em todo o estado de Rondônia."
          rightContent={dualRolePanel}
        />

        <div className="mx-auto max-w-7xl px-4 pt-8">
          <ProfessoresView />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
