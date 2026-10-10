'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NewsItem } from '@/types';
import { 
  Newspaper, 
  Calendar, 
  User, 
  Search, 
  ArrowRight, 
  Tag,
  Eye
} from 'lucide-react';
import NewsModal from './NewsModal';

interface NewsSectionProps {
  news: NewsItem[];
}

export default function NewsSection({ news }: NewsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [activeNewsModal, setActiveNewsModal] = useState<NewsItem | null>(null);

  // Categorias únicas
  const categories = ['Todas', ...Array.from(new Set(news.map(n => n.category)))];

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="noticias" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
              <Newspaper size={15} />
              <span>Informativo Oficial SEDUC</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Últimas Notícias e Acontecimentos
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Acompanhe as ações pedagógicas, investimentos em conectividade e conquistas dos estudantes do MEDTEC em Rondônia.
            </p>
          </div>

          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-deep group"
          >
            <span>Ver arquivo completo</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 pb-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat 
                    ? 'bg-primary text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar notícia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Grid de Notícias */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Nenhuma notícia encontrada para essa pesquisa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Imagem de Capa */}
                <div 
                  className="relative h-48 overflow-hidden bg-slate-100 cursor-pointer"
                  onClick={() => setActiveNewsModal(item)}
                >
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-primary/90 text-white text-[11px] font-bold backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>
                  {item.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-[11px] font-extrabold shadow-sm">
                        Destaque
                      </span>
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Metadados */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar size={13} />
                        {item.publishedAt}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium truncate max-w-[130px]">
                        <User size={13} />
                        {item.author}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 
                      onClick={() => setActiveNewsModal(item)}
                      className="font-bold text-slate-900 text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 cursor-pointer mb-2.5"
                    >
                      {item.title}
                    </h3>

                    {/* Resumo */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {item.excerpt}
                    </p>
                  </div>

                  {/* Rodapé do Card */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveNewsModal(item)}
                      className="text-xs font-bold text-primary hover:text-primary-deep flex items-center gap-1 group/btn cursor-pointer"
                    >
                      <span>Ler notícia completa</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    <Link
                      href={`/noticias/${item.id}`}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                      title="Abrir página dedicada"
                    >
                      <Eye size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>

      {/* Modal de Leitura de Notícia */}
      {activeNewsModal && (
        <NewsModal news={activeNewsModal} onClose={() => setActiveNewsModal(null)} />
      )}
    </section>
  );
}

