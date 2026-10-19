'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import TeacherProfiles from '@/components/TeacherProfiles';

export default function ProfessoresPage() {
  const [filterRole, setFilterRole] = useState<'Todas' | 'Ministrante' | 'Mediador'>('Todas');

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] transition-colors duration-200">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Quem faz acontecer"
          title="Professores e Mediadores"
          text="Ministrantes produzem e transmitem as aulas a partir do estúdio central da SEDUC; mediadores acompanham presencialmente cada turma nas salas de aula conectadas em todo o estado de Rondônia."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          {/* Quick Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(['Todas', 'Ministrante', 'Mediador'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  filterRole === role
                    ? 'bg-slate-900 text-white dark:bg-[#00D8FF] dark:text-slate-950 shadow-xs'
                    : 'border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F2647]'
                }`}
              >
                {role === 'Todas' ? 'Todos os Docentes' : `Professores ${role}s`}
              </button>
            ))}
          </div>

          <TeacherProfiles filterRole={filterRole} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
