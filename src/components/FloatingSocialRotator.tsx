'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from '@/components/SocialIcons';
import { useSiteChannels } from '@/components/SiteChannelsProvider';

interface SocialItem {
  id: 'instagram' | 'facebook' | 'youtube';
  name: string;
  actionLabel: string;
  bgColor: string;
  hoverColor: string;
  ariaLabel: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SOCIAL_NETWORKS: SocialItem[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    actionLabel: 'Seguir no Instagram',
    bgColor: 'bg-[#E1306C]',
    hoverColor: 'hover:bg-[#c9255b]',
    ariaLabel: 'Seguir o perfil oficial do Governo de Rondônia no Instagram (abre em nova aba)',
    Icon: InstagramIcon,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    actionLabel: 'Página no Facebook',
    bgColor: 'bg-[#1877F2]',
    hoverColor: 'hover:bg-[#1565c0]',
    ariaLabel: 'Acessar a página oficial no Facebook do Governo de Rondônia (abre em nova aba)',
    Icon: FacebookIcon,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    actionLabel: 'Canal no YouTube',
    bgColor: 'bg-[#FF0000]',
    hoverColor: 'hover:bg-[#d90000]',
    ariaLabel: 'Acessar as transmissões no canal do YouTube da SEDUC Rondônia (abre em nova aba)',
    Icon: YoutubeIcon,
  },
];

export default function FloatingSocialRotator() {
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const channels = useSiteChannels();
  const socialNetworks = useMemo(
    () => SOCIAL_NETWORKS.filter((net) => channels[net.id]).map((net) => ({ ...net, url: channels[net.id] })),
    [channels],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Rotação automática a cada 4 segundos (4000ms)
  // Quando o mouse estiver sobre o botão (isHovered === true), o cronômetro pausa imediatamente
  useEffect(() => {
    if (isHovered || socialNetworks.length < 2) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % socialNetworks.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, socialNetworks.length]);

  // Não renderiza nas rotas administrativas do painel (/admin)
  if (pathname?.startsWith('/admin') || socialNetworks.length === 0) {
    return null;
  }

  const activeNetwork = socialNetworks[currentIndex] || socialNetworks[0];
  const otherNetworks = socialNetworks.filter((_, idx) => idx !== currentIndex);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5 select-none"
    >
      {/* ========================================================
          MENU RÁPIDO NO HOVER: 3 OUTRAS REDES SOCIAIS
      ======================================================== */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col items-end gap-2 mb-1"
          >
            {otherNetworks.map((net) => {
              const NetIcon = net.Icon;
              return (
                <div key={net.id} className="flex items-center gap-2">
                  {/* Etiqueta discreta da mini-rede */}
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 bg-white/95 dark:bg-[#0B1528]/95 px-2.5 py-1 rounded-lg shadow-md border border-slate-200/80 dark:border-slate-800 whitespace-nowrap backdrop-blur-xs">
                    {net.name}
                  </span>

                  {/* Mini-bolinha clicável */}
                  <a
                    href={net.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={net.ariaLabel}
                    className={`w-9 h-9 rounded-full ${net.bgColor} ${net.hoverColor} text-white shadow-md flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer`}
                  >
                    <NetIcon size={18} className="text-white drop-shadow-xs" />
                  </a>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          BOTÃO PRINCIPAL ROTATIVO COM ETIQUETA LATERAL
      ======================================================== */}
      <div className="flex items-center gap-2.5">
        {/* Tooltip / Etiqueta da rede ativa ao passar o mouse */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 6, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 dark:bg-slate-950/95 text-white text-xs font-bold shadow-xl border border-white/10 backdrop-blur-md whitespace-nowrap pointer-events-none flex items-center gap-1.5"
            >
              <span>{activeNetwork.actionLabel}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão Flutuante Circular Principal (w-14 h-14) */}
        <a
          href={activeNetwork.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={activeNetwork.ariaLabel}
          className={`w-14 h-14 rounded-full ${activeNetwork.bgColor} ${activeNetwork.hoverColor} text-white shadow-xl shadow-black/25 flex items-center justify-center cursor-pointer transition-colors duration-300 relative focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-sky-400/50 active:scale-95 group`}
        >
          {/* Animação Suave com Framer Motion (GPU-Only) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNetwork.id}
              initial={{ opacity: 0, scale: 0.75, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.75, rotate: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full h-full flex items-center justify-center text-white"
            >
              <activeNetwork.Icon size={28} className="text-white drop-shadow-md" />
            </motion.div>
          </AnimatePresence>
        </a>
      </div>
    </div>
  );
}
