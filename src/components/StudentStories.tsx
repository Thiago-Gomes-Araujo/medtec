'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Award, Building2, MapPin, Quote, Users, X } from 'lucide-react';
import { useDialogFocus } from './useDialogFocus';
import type { ConquistaPublica } from '@/lib/api';
import { getConquistaImageSrc } from '@/lib/community-content';

export default function StudentStories({ conquistas }: { conquistas: ConquistaPublica[] }) {
  const [selected, setSelected] = useState<ConquistaPublica | null>(null);
  const { dialogRef, overlayRef } = useDialogFocus(!!selected, () => setSelected(null));

  if (conquistas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#1A365D] p-12 text-center bg-white/50 dark:bg-[#0C1E38]/50">
        <Users className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Nenhuma conquista encontrada</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ajuste os filtros ou tente outra busca.</p>
      </div>
    );
  }

  const selectedImage = selected ? getConquistaImageSrc(selected) : '';

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conquistas.map((item) => {
          const image = getConquistaImageSrc(item);
          return (
            <article key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs hover:shadow-md transition-shadow">
              {image && <Image unoptimized src={image} alt={`Imagem da conquista de ${item.nome_aluno}`} width={640} height={360} className="h-40 w-full object-cover" />}
              <div className="flex flex-1 flex-col p-5">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  <Award className="h-3.5 w-3.5" />
                  {item.categoria_nome}
                </span>
                <h3 className="mt-3 font-display font-bold text-base text-slate-900 dark:text-white break-words">{item.titulo}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{item.nome_aluno}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">{item.relato}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A365D] space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{item.escola_nome}</span></p>
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{item.cidade_nome}</span></p>
                </div>
                <button type="button" aria-haspopup="dialog" aria-label={`Ler a conquista de ${item.nome_aluno}`} onClick={() => setSelected(item)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#004A99] dark:text-[#38BDF8] hover:underline cursor-pointer">
                  <span>Ler a história completa</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`Conquista de ${selected.nome_aluno}`} tabIndex={-1} className="relative w-full max-w-xl rounded-xl bg-white dark:bg-[#0C1E38] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setSelected(null)} aria-label="Fechar modal" className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <p className="pr-8 text-xs font-semibold text-slate-500 dark:text-slate-400">{selected.categoria_nome}</p>
            <h3 className="pr-8 mt-1 font-display text-xl font-bold text-slate-900 dark:text-white leading-tight break-words">{selected.titulo}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{selected.nome_aluno}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{selected.escola_nome} • {selected.cidade_nome}</p>
            {selectedImage && <Image unoptimized src={selectedImage} alt={`Imagem da conquista de ${selected.nome_aluno}`} width={640} height={360} className="mt-4 w-full rounded-lg object-cover" />}
            <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#061224] p-4">
              <Quote className="h-5 w-5 text-slate-300 dark:text-slate-600 mb-1" />
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line break-words">{selected.relato}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
