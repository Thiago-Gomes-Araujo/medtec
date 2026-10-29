'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { NewsItem } from '@/types';

interface NewsGridProps {
  news: NewsItem[];
  limit?: number;
  filter?: boolean;
}

export default function NewsGrid({ news = [], limit, filter = false }: NewsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Extrai categorias dinâmicas presentes nas notícias ativas
  const categories = [
    'Todas',
    ...Array.from(new Set(news.map((n) => n.category))).filter(Boolean),
  ];

  const filteredNews = news.filter((item) => {
    if (item.published === false) return false;
    if (selectedCategory === 'Todas') return true;
    return item.category === selectedCategory;
  });

  const displayedNews = limit ? filteredNews.slice(0, limit) : filteredNews;

  return (
    <div>
      {/* Filtro por Categoria */}
      {filter && categories.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                selectedCategory === cat
                  ? 'bg-[#004A99] text-white shadow-xs dark:bg-[#00D8FF] dark:text-slate-950 font-bold'
                  : 'border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid de Artigos */}
      {displayedNews.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-[#0C1E38]/60 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Nenhuma notícia encontrada nesta categoria.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedNews.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-sm hover:border-[#004A99]/50 dark:hover:border-cyan-400/50 hover:shadow-lg transition-all duration-200 ease-out flex flex-col justify-between active:scale-[0.99] touch-manipulation select-none"
            >
              <Link
                href={`/noticias/${item.slug || item.id}`}
                className="flex-1 flex flex-col justify-between h-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] rounded-2xl"
              >
                <div>
                  <div className="relative overflow-hidden aspect-16/9 w-full bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.coverImage || '/hero.jpg'}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-opacity duration-300"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-[#004A99] dark:text-[#00D8FF] border border-sky-200 dark:border-cyan-500/20">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        {item.publishedAt}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors duration-150 line-clamp-2 text-balance">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed text-pretty">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#004A99] dark:text-[#00D8FF] group-hover:underline">
                    Ler comunicado completo <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
