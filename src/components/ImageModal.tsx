'use client';

import React, { useEffect } from 'react';
import { GalleryItem } from '@/types';
import { X, Calendar, Tag } from 'lucide-react';

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
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md transition-colors"
          aria-label="Fechar foto"
        >
          <X size={20} />
        </button>

        <div className="relative flex-1 bg-black flex items-center justify-center max-h-[70vh]">
          <img 
            src={photo.imageUrl} 
            alt={photo.title}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="p-6 bg-slate-900 text-white space-y-2 border-t border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white">
              {photo.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Calendar size={13} />
              {photo.date}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">{photo.title}</h3>
          <p className="text-sm text-slate-300">{photo.description}</p>
        </div>
      </div>
    </div>
  );
}

