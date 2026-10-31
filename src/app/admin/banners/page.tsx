'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import SitePhotosManager from '@/components/SitePhotosManager';
import { readAdminBanners, readBannerGallery, readBannerNews, type BannerResource } from '@/lib/admin-banners';
import { ApiError } from '@/lib/api';

function useBannerResource<T>(read: (signal: AbortSignal) => Promise<T>): BannerResource<T> {
  const [state, setState] = useState<Omit<BannerResource<T>, 'retry'>>({
    data: null, loading: true, error: null, status: null,
  });
  const [readVersion, setReadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setState((previous) => ({ ...previous, loading: true, error: null, status: null }));
      try {
        const result = await read(controller.signal);
        if (!controller.signal.aborted) setState({ data: result, loading: false, error: null, status: null });
      } catch (err) {
        if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false,
          error: ApiError.getFriendlyMessage(err), status: err instanceof ApiError ? err.status : null }));
      }
    }
    void load();
    return () => controller.abort();
  }, [read, readVersion]);

  const retry = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: null, status: null }));
    setReadVersion((version) => version + 1);
  }, []);
  return { ...state, retry };
}

// O shell só monta este conteúdo após confirmar o acesso existente à seção fotos.
function BannersContent() {
  const local = useBannerResource(readAdminBanners);
  // Os serviços não expõem cancelamento; o sinal também impede atualizações após desmontagem.
  const news = useBannerResource(readBannerNews);
  const gallery = useBannerResource(readBannerGallery);

  return (
    <div className="space-y-6">
      <p role="note" className="text-xs text-slate-500 dark:text-slate-400">
        Os campos e a prévia local ficam apenas em memória e podem ser perdidos ao sair desta rota ou atualizar a página.
      </p>
      <SitePhotosManager local={local} news={news} gallery={gallery} saving={false} />
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
