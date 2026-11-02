import { cacheLife } from 'next/cache';
import { medtecApi } from '@/lib/api';
import type { SocialLinks } from '@/types';
import { CANAIS_PADRAO, canaisFromApi } from './site-channels';

const API_TIMEOUT_MS = 2500;

// Falha vira os valores de reserva: rodapé e redes nunca esperam nem quebram por causa da API.
export async function readSiteChannels(): Promise<{ canais: SocialLinks; failed: boolean }> {
  try {
    const response = await medtecApi.canaisPublicos.list(AbortSignal.timeout(API_TIMEOUT_MS));
    return { canais: canaisFromApi(response.data), failed: false };
  } catch (cause) {
    console.warn('Canais de contato indisponíveis; usando os valores de reserva:', cause);
    return { canais: CANAIS_PADRAO, failed: true };
  }
}

export async function getSiteChannels(): Promise<SocialLinks> {
  'use cache';
  const { canais, failed } = await readSiteChannels();
  // Depois de uma falha, tenta de novo logo; com a API respondendo, atualiza a cada 5 minutos.
  cacheLife({ stale: 300, revalidate: failed ? 30 : 300 });
  return canais;
}
