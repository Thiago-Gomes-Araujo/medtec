import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  text: string;
}

export default function PageHeader({ eyebrow, title, text }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/10 bg-[#004A99] dark:bg-[#07162C] text-white transition-colors duration-200">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-12 sm:pb-16">
        <p className="text-sm font-semibold text-sky-200 dark:text-sky-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 max-w-4xl font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance [overflow-wrap:anywhere]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base sm:text-lg leading-relaxed text-sky-100/90 dark:text-slate-200 text-pretty [overflow-wrap:anywhere]">
          {text}
        </p>
      </div>
    </section>
  );
}
