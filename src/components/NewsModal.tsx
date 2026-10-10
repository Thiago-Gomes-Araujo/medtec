'use client';

import React, { useEffect } from 'react';
import { NewsItem } from '@/types';
import { X, Calendar, User, Tag, Share2 } from 'lucide-react';

interface NewsModalProps {
  news: NewsItem;
  onClose: () => void;
}

export default function NewsModal({ news, onClose }: NewsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
          aria-label="Fechar notícia"
        >
          <X size={18} />
        </button>

        {/* Imagem de Capa */}
        <div className="relative h-64 sm:h-80 w-full shrink-0 bg-slate-900">
          <img
            src={news.coverImage}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
            <span className="px-3 py-1 rounded-md bg-primary text-white text-xs font-bold shadow-sm">
              {news.category}
            </span>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={14} className="text-primary" />
              Publicado em: {news.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <User size={14} className="text-primary" />
              {news.author}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
            {news.title}
          </h2>

          <div className="p-4 bg-blue-50/70 border-l-4 border-primary rounded-r-xl">
            <p className="text-sm font-medium text-primary-deep italic">
              {news.excerpt}
            </p>
          </div>

          {/* Texto Completo */}
          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line space-y-4">
            {news.content}
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-slate-400 mr-1" />
              {news.tags.map((t, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

