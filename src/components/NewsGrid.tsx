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
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid de Artigos */}
      {displayedNews.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Nenhuma notícia encontrada nesta categoria.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedNews.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-card hover:border-slate-300 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <Link
                href={`/noticias/${item.id}`}
                className="flex-1 flex flex-col justify-between h-full"
              >
                <div>
                  <div className="relative overflow-hidden aspect-16/9 w-full bg-slate-100">
                    <img
                      src={item.coverImage || '/hero.jpg'}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {item.publishedAt}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display font-semibold text-base text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                    Ler comunicado completo <ArrowRight className="h-3 w-3" />
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
