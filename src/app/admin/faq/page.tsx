'use client';

import { useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import FaqModule from '@/components/admin/FaqModule';
import DuvidaCategoriesManager from '@/components/admin/DuvidaCategoriesManager';

function FaqWorkspace() {
  const [section, setSection] = useState<'duvidas' | 'categorias'>('duvidas');
  return <div className="space-y-6">
    <nav aria-label="Seções do FAQ" className="flex flex-wrap gap-2">
      {(['duvidas', 'categorias'] as const).map(key => <button key={key} type="button"
        aria-pressed={section === key} onClick={() => setSection(key)}
        className={`rounded-xl px-4 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer ${section === key
          ? 'bg-[#004A99] text-white' : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
        {key === 'duvidas' ? 'Dúvidas' : 'Categorias'}
      </button>)}
    </nav>
    {/* O editor permanece montado para preservar o rascunho ao abrir Categorias. */}
    <div hidden={section !== 'duvidas'}><FaqModule active={section === 'duvidas'} /></div>
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
