'use client';

import { useEffect, useState } from 'react';
import GallerySection from '@/components/GallerySection';
import { medtecApi, type FotoGaleriaPublica } from '@/lib/api';

export default function GaleriaView() {
  const [fotos, setFotos] = useState<FotoGaleriaPublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadFotos() {
      try {
        const response = await medtecApi.galeriaPublica.list({ page: 'all' }, controller.signal);
        if (!controller.signal.aborted) setFotos(response.data.items);
      } catch {
        if (!controller.signal.aborted) setUnavailable(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadFotos();
    return () => controller.abort();
  }, []);

  return <GallerySection fotos={fotos} loading={loading} unavailable={unavailable} />;
}
