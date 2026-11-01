'use client';

import { useEffect, useState } from 'react';
import { ApiError, medtecApi, type DDuvidaVisitante } from '@/lib/api';

// A Fila de Aprovação passa só o id: o texto do visitante não vai para a barra de endereços.
export default function VisitanteFaqDraftLoader({ visitanteId, onLoaded }: { visitanteId: number; onLoaded: (item: DDuvidaVisitante) => void }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isSafeInteger(visitanteId) || visitanteId < 1) return;
    const controller = new AbortController();
    medtecApi.duvidasVisitante.get(visitanteId, controller.signal).then(value => {
      if (controller.signal.aborted) return;
      if (value.respondida) onLoaded(value);
      else setError('Marque a dúvida como respondida antes de transformá-la em FAQ.');
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(ApiError.getFriendlyMessage(cause));
    });
    return () => controller.abort();
  }, [visitanteId, onLoaded]);

  return error ? <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p> : null;
}
