import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  text: string;
}

export default function PageHeader({ eyebrow, title, text }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-sky-400/30 dark:border-cyan-500/20 bg-gradient-to-r from-[#05549D] via-[#072F5E] to-[#0A3D73] dark:from-[#040B16] dark:via-[#07162C] dark:to-[#040B16] text-white transition-colors duration-200">
      <div className="hero-grid absolute inset-0 opacity-30 dark:opacity-35 pointer-events-none" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-sky-400/20 dark:bg-cyan-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-1/2 bg-gradient-to-r from-transparent via-cyan-300/70 dark:via-cyan-400/40 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-12 sm:pb-16">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-300 dark:text-cyan-300">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white dark:text-[#E6F4FF] leading-tight text-balance [overflow-wrap:anywhere]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base sm:text-lg leading-relaxed text-sky-100/90 dark:text-slate-300 text-pretty [overflow-wrap:anywhere]">
          {text}
        </p>
      </div>
    </section>
  );
}
