import { cacheLife } from 'next/cache';
import { medtecApi, type BannerPublico } from '@/lib/api';

const API_TIMEOUT_MS = 2500;

// Falha vira lista vazia: a home nunca espera nem quebra por causa dos banners.
export async function readHomeBanners(): Promise<{ banners: BannerPublico[]; failed: boolean }> {
  try {
    const response = await medtecApi.bannersPublicos.list(AbortSignal.timeout(API_TIMEOUT_MS));
    return { banners: response.data, failed: false };
  } catch (cause) {
    console.warn('Banners indisponíveis; a home segue com a foto padrão:', cause);
    return { banners: [], failed: true };
  }
}

export async function getHomeBanners(): Promise<BannerPublico[]> {
  'use cache';
  const { banners, failed } = await readHomeBanners();
  // Depois de uma falha, tenta de novo logo; com a API respondendo, atualiza a cada 5 minutos.
  cacheLife({ stale: 300, revalidate: failed ? 30 : 300 });
  return banners;
}
