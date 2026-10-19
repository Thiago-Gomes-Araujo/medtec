import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  text: string;
}

export default function PageHeader({ eyebrow, title, text }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-sky-400/30 dark:border-cyan-500/20 bg-gradient-to-r from-[#05549D] via-[#072F5E] to-[#0A3D73] dark:from-[#040B16] dark:via-[#07162C] dark:to-[#040B16] text-white transition-colors duration-200">
      <div className="hero-grid absolute inset-0 opacity-40 dark:opacity-40" />
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-sky-400/20 dark:bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-1/2 bg-gradient-to-r from-transparent via-cyan-300/70 dark:via-cyan-400/40 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-200 dark:text-cyan-300">
          {`// ${eyebrow}`}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight text-white dark:text-[#E6F4FF] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-sky-100/90 dark:text-slate-300">
          {text}
        </p>
      </div>
    </section>
  );
}
