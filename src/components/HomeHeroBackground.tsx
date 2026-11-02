'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import type { BannerPublico } from '@/lib/api';

const TROCA_MS = 6000;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION).matches;
}

// A lista chega pronta do servidor. Sem banners ou com falha na API, o fundo continua sendo a foto padrão.
export default function HomeHeroBackground({ banners }: { banners: BannerPublico[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const total = banners.length;
  const rotating = total > 1 && !reducedMotion;

  useEffect(() => {
    if (!rotating || paused) return;
    const timer = setInterval(() => setActive(current => (current + 1) % total), TROCA_MS);
    return () => clearInterval(timer);
  }, [rotating, paused, total]);

  if (total === 0) {
    return (
      <Image
        src="/hero.jpg"
        alt="Transmissão das aulas do MEDTEC Rondônia"
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover opacity-25 mix-blend-luminosity pointer-events-none"
      />
    );
  }

  const current = rotating ? active : 0;
  const previous = (current - 1 + total) % total;
  const next = (current + 1) % total;

  return (
    <>
      {banners.map((banner, index) => {
        const isCurrent = index === current;
        // Só a imagem atual e as vizinhas são montadas: as demais não são baixadas antes da hora.
        if (!isCurrent && !(rotating && (index === next || index === previous))) return null;
        return (
          <Image key={banner.id} unoptimized fill src={banner.imagem} alt="" aria-hidden sizes="100vw"
            className={`object-cover mix-blend-luminosity pointer-events-none transition-opacity duration-1000 motion-reduce:transition-none ${isCurrent ? 'opacity-25' : 'opacity-0'}`}
            {...(index === 0 ? { loading: 'eager' as const, fetchPriority: 'high' as const } : { loading: 'lazy' as const })} />
        );
      })}
      {rotating && (
        <button type="button" aria-label={paused ? 'Retomar troca das imagens de fundo' : 'Pausar troca das imagens de fundo'} onClick={() => setPaused(!paused)}
          className="absolute bottom-3 left-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-slate-950/50 text-white/80 hover:bg-slate-950/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer">
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      )}
    </>
  );
}
