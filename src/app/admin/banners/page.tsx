'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import SitePhotosManager from '@/components/SitePhotosManager';
import { readAdminBanners, type AdminBannersData } from '@/lib/admin-banners';
import { ApiError } from '@/lib/api';

// O shell só monta este conteúdo após confirmar o acesso existente à seção fotos.
function BannersContent() {
  const [data, setData] = useState<AdminBannersData | null>(null);
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
        const result = await readAdminBanners(controller.signal);
        if (!controller.signal.aborted) setData(result);
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
      {loading && <p role="status" className="text-xs text-slate-500">Carregando banners...</p>}
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 space-y-2">
          <p>{error}</p>
          <button type="button" disabled={loading} onClick={() => setReadVersion((version) => version + 1)} className="font-bold underline cursor-pointer disabled:opacity-60">
            Tentar novamente
          </button>
        </div>
      )}
      <p role="note" className="text-xs text-slate-500 dark:text-slate-400">
        Os campos e a prévia local ficam apenas em memória e podem ser perdidos ao sair desta rota ou atualizar a página.
      </p>
      {/* Uma falha posterior preserva a última leitura válida e a prévia local. */}
      {data !== null && <SitePhotosManager {...data} saving={false} />}
    </div>
  );
}

export default function AdminBannersSubroutePage() {
  return (
    <AdminShell activeSection="fotos">
      {() => <BannersContent />}
    </AdminShell>
  );
}
