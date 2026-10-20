'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Newspaper, 
  ArrowRight, 
  Calendar, 
  User, 
  Sparkles,
  TrendingUp,
  Tag
} from 'lucide-react';
import initialData from '@/data/initialData.json';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: string;
  category: string;
  publishedAt: string;
  tags?: string[];
}

export default function HomeNewsHighlightsSection() {
  // Pega as 3 primeiras notícias de destaque
  const newsList = (initialData.news as NewsItem[]).slice(0, 3);

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'infraestrutura':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-[#004A99] dark:text-[#00D8FF] border-cyan-200 dark:border-cyan-500/30';
      case 'pedagógico':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
      case 'tecnologia':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-500/30';
      default:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30';
    }
  };

  return (
    <section id="noticias-destaque" className="relative scroll-mt-20 py-20 sm:py-28 bg-white dark:bg-[#061224] transition-colors duration-200 border-t border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-400/30 text-[#004A99] dark:text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-[0.2em] shadow-xs">
              <Newspaper className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
              <span>JORNALISMO OFICIAL // SEDUC RONDÔNIA</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-display">
              Últimas Notícias &amp; <span className="gradient-text">Coberturas</span>
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Acompanhe as entregas de equipamentos, expedições fluviais e o protagonismo pedagógico dos estudantes nas salas conectadas de Rondônia.
            </p>
          </div>

          <Link
            href="/noticias"
            className="group inline-flex items-center gap-2 self-start md:self-auto px-5 py-3 rounded-2xl bg-white dark:bg-[#0C1E38] hover:bg-[#004A99] dark:hover:bg-[#00D8FF] text-slate-800 dark:text-slate-100 hover:text-white dark:hover:text-slate-950 border border-slate-200 dark:border-[#1A365D] hover:border-[#004A99] dark:hover:border-[#00D8FF] text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span>Ver todas as reportagens</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grade de 3 Cards de Notícias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {newsList.map((item, index) => (
            <article
              key={item.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white dark:bg-[#0C1E38] border border-slate-200/90 dark:border-[#1A365D] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:hover:border-[#00D8FF]/60 hover:border-[#004A99]/50"
            >
              {/* Imagem de Capa com Badge */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10" />

                {/* Badge de Categoria */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono border backdrop-blur-md shadow-xs ${getCategoryColor(item.category)}`}>
                    <Tag className="h-3 w-3" />
                    {item.category}
                  </span>
                </div>

                {/* Destaque #01 na primeira notícia */}
                {index === 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/90 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs">
                      <Sparkles className="h-3 w-3" />
                      Em Destaque
                    </span>
                  </div>
                )}
              </div>

              {/* Corpo da Notícia */}
              <div className="flex flex-col justify-between flex-1 p-6 sm:p-7 space-y-4">
                <div className="space-y-3">
                  {/* Metadados: Data e Autor */}
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
                      {item.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {item.author.replace('Assessoria de Comunicação', 'Ascom')}
                    </span>
                  </div>

                  {/* Título da Notícia */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Resumo da Notícia */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>

                {/* Rodapé do Card com Link */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#1A365D] flex items-center justify-between text-xs font-bold text-[#004A99] dark:text-[#00D8FF]">
                  <span className="group-hover:underline">Ler reportagem completa</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
