'use client';

import React, { useEffect } from 'react';
import { NewsItem } from '@/types';
import { X, Calendar, User, Tag } from 'lucide-react';
import { recordNewsView } from '@/components/NewsViewTracker';

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
    recordNewsView(news.id);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [news.id, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0C1E38] rounded-xl shadow-2xl border border-slate-200/90 dark:border-[#1A365D] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer touch-manipulation select-none"
          aria-label="Fechar notícia"
        >
          <X size={18} />
        </button>

        {/* Imagem de Capa */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 bg-slate-900">
          <img
            src={news.coverImage}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
            <span className="px-2.5 py-0.5 rounded-full bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 text-[11px] font-bold font-mono shadow-xs">
              {news.category}
            </span>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-dashed border-slate-200 dark:border-white/10 font-mono">
            <span className="flex items-center gap-1.5 font-medium tabular-nums">
              <Calendar size={13} className="text-[#004A99] dark:text-[#00D8FF]" />
              {news.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <User size={13} className="text-[#004A99] dark:text-[#00D8FF]" />
              {news.author}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug font-display">
            {news.title}
          </h2>

          <div className="p-3 bg-sky-50/70 dark:bg-[#061224] border-l-3 border-[#004A99] dark:border-[#00D8FF] rounded-r-lg">
            <p className="text-xs sm:text-sm font-medium text-[#004A99] dark:text-cyan-200 italic leading-relaxed">
              {news.excerpt}
            </p>
          </div>

          {/* Texto Completo */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line space-y-3">
            {news.content}
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="pt-4 border-t border-dashed border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-1.5">
              <Tag size={13} className="text-slate-400 dark:text-slate-500 mr-1" />
              {news.tags.map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#061224] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-[#1A365D] text-[11px] font-mono">
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

