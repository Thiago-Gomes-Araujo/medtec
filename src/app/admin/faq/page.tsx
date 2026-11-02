'use client';

import { Suspense, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import FaqModule from '@/components/admin/FaqModule';
import DuvidaCategoriesManager from '@/components/admin/DuvidaCategoriesManager';
import VisitanteFaqDraftLoader from '@/components/admin/VisitanteFaqDraftLoader';
import { SECTION_CONFIG } from '@/lib/admin-navigation';
import type { DDuvidaVisitante } from '@/lib/api';

type FaqSection = 'duvidas' | 'categorias';
type FaqDraft = { pergunta: string };

function VisitanteDraftFromUrl({ setDraft, setSection }: { setDraft: (draft: FaqDraft) => void; setSection: (section: FaqSection) => void }) {
  const params = useSearchParams();
  const onLoaded = useCallback((item: DDuvidaVisitante) => {
    setDraft({ pergunta: item.descricao });
    setSection('duvidas');
    // Sem o id na URL, recarregar a página não reabre o formulário.
    window.history.replaceState(null, '', SECTION_CONFIG.duvidas.href);
  }, [setDraft, setSection]);
  return <VisitanteFaqDraftLoader visitanteId={Number(params?.get('visitante'))} onLoaded={onLoaded} />;
}

function FaqWorkspace() {
  const [section, setSection] = useState<FaqSection>('duvidas');
  const [draft, setDraft] = useState<FaqDraft | null>(null);
  return <div className="space-y-6">
    <Suspense fallback={null}><VisitanteDraftFromUrl setDraft={setDraft} setSection={setSection} /></Suspense>
    <nav aria-label="Seções do FAQ" className="flex flex-wrap gap-2">
      {(['duvidas', 'categorias'] as const).map(key => <button key={key} type="button"
        aria-pressed={section === key} onClick={() => setSection(key)}
        className={`rounded-xl px-4 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer ${section === key
          ? 'bg-[#004A99] text-white' : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
        {key === 'duvidas' ? 'Dúvidas' : 'Categorias'}
      </button>)}
    </nav>
    {/* O editor permanece montado para preservar o rascunho ao abrir Categorias. */}
    <div hidden={section !== 'duvidas'}><FaqModule active={section === 'duvidas'} prefill={draft} /></div>
    {section === 'categorias' && <DuvidaCategoriesManager />}
  </div>;
}

export default function AdminFaqSubroutePage() {
  return (
    <AdminShell activeSection="duvidas">
      {() => <FaqWorkspace />}
    </AdminShell>
  );
}
