import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  text: string;
}

export default function PageHeader({ eyebrow, title, text }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-cyan-400/20 bg-[#050b16] text-white">
      <div className="hero-grid absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-1/2 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-300">
          // {eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
          {text}
        </p>
      </div>
    </section>
  );
}
