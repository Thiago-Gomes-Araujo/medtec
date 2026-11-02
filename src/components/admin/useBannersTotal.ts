'use client';

import { useEffect, useState } from 'react';
import { ApiError, medtecApi } from '@/lib/api';

// Só o total importa: per_page=1 evita trazer os banners para contar.
export function useBannersTotal(enabled: boolean) {
  const [state, setState] = useState<{ count: number | null; error: string | null }>({ count: null, error: null });

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    medtecApi.banners.list({ page: 1, per_page: 1 }, controller.signal).then(response => {
      if (!controller.signal.aborted) setState({ count: response.data.pagination.total_count, error: null });
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setState({ count: null, error: ApiError.getFriendlyMessage(cause) });
    });
    return () => controller.abort();
  }, [enabled]);

  return state;
}
