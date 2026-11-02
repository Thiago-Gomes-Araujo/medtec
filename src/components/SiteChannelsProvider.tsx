'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { CANAIS_PADRAO } from '@/lib/site-channels';
import type { SocialLinks } from '@/types';

const SiteChannelsContext = createContext<SocialLinks>(CANAIS_PADRAO);

// A lista vem pronta do layout raiz: rodapé e botões de redes não consultam a API no navegador.
export function SiteChannelsProvider({ value, children }: { value: SocialLinks; children: ReactNode }) {
  return <SiteChannelsContext.Provider value={value}>{children}</SiteChannelsContext.Provider>;
}

export function useSiteChannels(): SocialLinks {
  return useContext(SiteChannelsContext);
}
