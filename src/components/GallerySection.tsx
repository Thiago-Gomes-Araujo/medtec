'use client';

import React, { useState } from 'react';
import { GalleryItem } from '@/types';
import { Image as ImageIcon, ZoomIn, Calendar } from 'lucide-react';
import ImageModal from './ImageModal';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const categories = ['Todas', ...Array.from(new Set(gallery.map(g => g.category)))];

  const filteredGallery = gallery.filter(item => {
    return selectedCategory === 'Todas' || item.category === selectedCategory;
  });

  return (
    <section id="galeria" className="py-20 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
              <ImageIcon size={15} />
              <span>Acervo Fotográfico Oficial</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Galeria do MEDTEC Rondônia
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Registros das salas de aula conectadas, dos estúdios televisivos em Porto Velho e dos momentos de aprendizagem no campo.
            </p>
          </div>

          {/* Filtro por categoria */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Fotos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative h-72 rounded-2xl overflow-hidden bg-slate-800 cursor-pointer border border-slate-800 hover:border-sky-500/50 shadow-lg transition-all"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-sky-950/80 border border-sky-500/40 text-sky-300 text-[11px] font-bold">
                    {photo.category}
                  </span>
                  <div className="p-2 rounded-full bg-slate-900/80 text-white group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                    <ZoomIn size={16} />
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1 mb-1">
                    <Calendar size={12} />
                    {photo.date}
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-sky-300 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                    {photo.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {selectedPhoto && (
        <ImageModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </section>
  );
}

