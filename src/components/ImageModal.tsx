'use client';

import React, { useEffect } from 'react';
import { GalleryItem } from '@/types';
import { X, Calendar } from 'lucide-react';

interface ImageModalProps {
  photo: GalleryItem;
  onClose: () => void;
}

export default function ImageModal({ photo, onClose }: ImageModalProps) {
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md transition-all duration-150 ease-out active:scale-[0.92] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label="Fechar foto"
        >
          <X size={18} />
        </button>

        <div className="relative flex-1 bg-black flex items-center justify-center max-h-[70vh]">
          <img 
            src={photo.imageUrl} 
            alt={photo.title}
            className="max-h-full max-w-full object-contain select-none"
          />
        </div>

        <div className="p-4 sm:p-5 bg-slate-900 text-white space-y-2 border-t border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950">
              {photo.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium font-mono tabular-nums">
              <Calendar size={13} />
              {photo.date}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">{photo.title}</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">{photo.description}</p>
        </div>
      </div>
    </div>
  );
}

