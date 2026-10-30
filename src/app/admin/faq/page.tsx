'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import FaqModule, { type FaqViewMode } from '@/components/admin/FaqModule';
import { readAdminFaqs } from '@/lib/admin-faq';
import { ApiError } from '@/lib/api';
import type { FaqItem } from '@/types';

// Montado pelo shell somente depois da autorização existente para "duvidas".
function FaqContent() {
  const [faqs, setFaqs] = useState<FaqItem[] | null>(null);
  const [viewMode, setViewMode] = useState<FaqViewMode>('lista');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readVersion, setReadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setLoading(true);
      setError(null);
      try {
        const items = await readAdminFaqs(controller.signal);
        if (!controller.signal.aborted) setFaqs(items);
      } catch (err) {
        if (!controller.signal.aborted) setError(ApiError.getFriendlyMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [readVersion]);

  return (
    <div className="space-y-6">
      {loading && <p role="status" className="text-xs text-slate-500">Carregando dúvidas frequentes...</p>}
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 space-y-2">
          <p>{error}</p>
          <button type="button" disabled={loading} onClick={() => setReadVersion((version) => version + 1)} className="font-bold underline cursor-pointer disabled:opacity-60">
            Tentar novamente
          </button>
        </div>
      )}
      {viewMode === 'editor' && (
        <p role="note" className="text-xs text-slate-500 dark:text-slate-400">
          O rascunho fica apenas em memória e pode ser perdido ao sair desta rota ou atualizar a página.
        </p>
      )}
      {/* Recargas e falhas posteriores não desmontam o editor nem apagam o rascunho. */}
      {faqs !== null && <FaqModule faqs={faqs} viewMode={viewMode} onViewModeChange={setViewMode} />}
    </div>
  );
}

export default function AdminFaqSubroutePage() {
  return (
    <AdminShell activeSection="duvidas">
      {() => <FaqContent />}
    </AdminShell>
  );
}
