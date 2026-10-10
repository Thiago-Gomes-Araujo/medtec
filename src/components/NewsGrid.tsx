'use client';

import React, { useState } from 'react';
import { Calendar, X, ArrowRight } from 'lucide-react';
import { noticiasData, Noticia } from '@/data/medtecData';

interface NewsGridProps {
  limit?: number;
  filter?: boolean;
}

export default function NewsGrid({ limit, filter = false }: NewsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [activeArticle, setActiveArticle] = useState<Noticia | null>(null);

  const categories = ['Todas', 'Pedagógico', 'Infraestrutura', 'Eventos'];

  const filteredNews = noticiasData.filter((n) => {
    if (selectedCategory === 'Todas') return true;
    return n.categoria === selectedCategory;
  });

  const displayedNews = limit ? filteredNews.slice(0, limit) : filteredNews;

  return (
    <div>
      {/* Category Filter Pills (if enabled) */}
      {filter && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {displayedNews.map((noticia: Noticia) => (
          <article
            key={noticia.id}
            onClick={() => setActiveArticle(noticia)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-card hover:border-slate-300 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative overflow-hidden aspect-[16/9] w-full bg-slate-100">
                <img
                  src={noticia.img}
                  alt={noticia.titulo}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                    {noticia.categoria}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {noticia.data}
                  </span>
                </div>

                <h3 className="mt-3 font-display font-semibold text-base text-slate-900 leading-snug group-hover:text-primary transition-colors">
                  {noticia.titulo}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {noticia.resumo}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-0">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                Ler comunicado completo <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Full Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-10"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="overflow-hidden rounded-xl aspect-[16/9] w-full bg-slate-100 mb-4">
              <img
                src={activeArticle.img}
                alt={activeArticle.titulo}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                {activeArticle.categoria}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Calendar className="h-3.5 w-3.5" />
                Publicado em {activeArticle.data}
              </span>
            </div>

            <h2 className="font-display text-xl font-bold text-slate-900 leading-tight">
              {activeArticle.titulo}
            </h2>

            <p className="mt-3 text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {activeArticle.resumo}
            </p>

            <div className="mt-4 text-sm text-slate-600 leading-relaxed space-y-3">
              <p>{activeArticle.conteudo || activeArticle.resumo}</p>
              <p>
                A SEDUC-RO reafirma seu compromisso com a melhoria contínua das instalações e do suporte pedagógico a todos os estudantes e profissionais do MEDTEC.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Fechar Notícia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
