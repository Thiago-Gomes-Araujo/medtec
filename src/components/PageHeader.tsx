import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  text: string;
}

export default function PageHeader({ eyebrow, title, text }: PageHeaderProps) {
  return (
    <section className="border-b border-slate-200 bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-success">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary-deep sm:text-4xl tracking-tight">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">
          {text}
        </p>
      </div>
    </section>
  );
}
