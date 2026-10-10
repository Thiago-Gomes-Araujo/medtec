'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import StudentStories from '@/components/StudentStories';
import { ShieldCheck } from 'lucide-react';

export default function AlunosPage() {
  const [filterCategory, setFilterCategory] = useState<string>('Todas');

  const categories = ['Todas', 'Vestibular', 'Olimpíada', 'Robótica', 'Feira de Ciências'];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Protagonismo estudantil"
          title="Alunos que Inspiram"
          text="Histórias de jovens das comunidades ribeirinhas, rurais e terras indígenas transformadas pela mediação tecnológica. Histórias publicadas com termo de autorização de imagem registrado, em conformidade com a LGPD e o ECA."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          {/* LGPD Banner */}
          <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50/80 p-3.5 flex items-center justify-between gap-3 text-xs text-sky-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0" />
              <span>
                <strong>Garantia de Proteção de Dados:</strong> Todos os perfis possuem termo de consentimento livre e esclarecido assinado pelos responsáveis legais.
              </span>
            </div>
            <span className="hidden sm:inline font-semibold text-sky-800">
              Conformidade Lei nº 13.709/2018 (LGPD)
            </span>
          </div>

          {/* Categories */}
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filterCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat === 'Todas' ? 'Todas as Conquistas' : cat}
              </button>
            ))}
          </div>

          <StudentStories filterCategory={filterCategory} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
