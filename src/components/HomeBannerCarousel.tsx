'use client';

import { useEffect, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { medtecApi, type BannerPublico } from '@/lib/api';

const AUTOPLAY_MS = 6000;
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

const controlClass = 'grid h-9 w-9 place-items-center rounded-full bg-slate-950/70 text-white hover:bg-slate-950/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer';

// Sem banners ou com a API fora do ar, nada é mostrado: o topo institucional da home continua igual.
export default function HomeBannerCarousel() {
  const [banners, setBanners] = useState<BannerPublico[]>([]);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const total = banners.length;
  const autoplay = total > 1 && !paused && !reducedMotion;
  const running = autoplay && !hovering && !focused;

  useEffect(() => {
    const controller = new AbortController();
    medtecApi.bannersPublicos.list(controller.signal).then(response => {
      if (!controller.signal.aborted) setBanners(response.data);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) console.warn('Banners indisponíveis; mantendo o topo da home:', cause);
    });
    return () => controller.abort();
  }, []);

  // `active` nas dependências reinicia o tempo depois de uma troca manual.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setActive(current => (current + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [running, total, active]);

  if (total === 0) return null;

  const previous = (active - 1 + total) % total;
  const next = (active + 1) % total;

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); setActive(previous); }
    if (event.key === 'ArrowRight') { event.preventDefault(); setActive(next); }
  }

  return (
    <section aria-roledescription="carrossel" aria-label="Banners" onKeyDown={total > 1 ? onKeyDown : undefined}
      onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      className="relative w-full bg-slate-950">
      {/* A arte traz o próprio texto: `contain` mostra a imagem inteira, sem cortes. */}
      <div aria-live={running ? 'off' : 'polite'} className="relative aspect-[16/5] w-full overflow-hidden">
        {banners.map((banner, index) => {
          const label = `Banner ${index + 1} de ${total}`;
          const isActive = index === active;
          return (
            <div key={banner.id} role="group" aria-roledescription="slide" aria-label={label} aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${isActive ? 'opacity-100' : 'invisible opacity-0'}`}>
              {/* Só a imagem atual e as vizinhas são montadas: as demais não são baixadas antes da hora. */}
              {(isActive || index === next || index === previous) && (
                <Image unoptimized fill src={banner.imagem} alt={label} sizes="100vw" className="object-contain"
                  {...(index === 0 ? { loading: 'eager' as const, fetchPriority: 'high' as const } : { loading: 'lazy' as const })} />
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && <>
        <button type="button" aria-label="Banner anterior" onClick={() => setActive(previous)} className={`absolute left-2 top-1/2 -translate-y-1/2 sm:left-4 ${controlClass}`}>
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Próximo banner" onClick={() => setActive(next)} className={`absolute right-2 top-1/2 -translate-y-1/2 sm:right-4 ${controlClass}`}>
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex items-center justify-center gap-2 py-2">
          {!reducedMotion && (
            <button type="button" aria-label={paused ? 'Retomar troca automática' : 'Pausar troca automática'} onClick={() => setPaused(!paused)}
              className="grid h-6 w-6 place-items-center rounded-full text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer">
              {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          )}
          {banners.map((banner, index) => (
            <button key={banner.id} type="button" aria-label={`Ir para o banner ${index + 1} de ${total}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)}
              className="group grid h-6 w-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer">
              <span className={`block h-2 w-2 rounded-full ${index === active ? 'bg-white' : 'bg-white/40 group-hover:bg-white/70'}`} />
            </button>
          ))}
        </div>
      </>}
    </section>
  );
}
