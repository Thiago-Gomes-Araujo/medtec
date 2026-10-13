import React from 'react';
import { Calendar, User } from 'lucide-react';

interface NewsPublicationPreviewProps {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  publishedAt: string;
  featured: boolean;
  urgent: boolean;
  published: boolean;
}

export default function NewsPublicationPreview({
  title,
  excerpt,
  content,
  coverImage,
  author,
  category,
  publishedAt,
  featured,
  urgent,
  published,
}: NewsPublicationPreviewProps) {
  const displayTitle = title.trim() || 'Título da notícia';
  const displayExcerpt = excerpt.trim() || 'O resumo curto aparece aqui, no card da home.';
  const displayContent = content.trim() || 'O texto completo da publicação aparece nesta área quando o leitor abre a notícia.';
  const displayAuthor = author.trim() || 'Equipe MEDTEC / SEDUC';
  const displayDate = publishedAt.trim() || 'Data da publicação';

  return (
    <aside className="xl:sticky xl:top-24">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
        Prévia no site
      </p>
      <article
        className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
          urgent ? 'border-rose-300 ring-1 ring-rose-200' : featured ? 'border-amber-300' : 'border-slate-200'
        }`}
      >
        <div className="relative h-40 bg-slate-100">
          {coverImage ? (
            <img src={coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              Sem foto de capa
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-md bg-[#05549d] px-2.5 py-1 text-[11px] font-bold text-white">
            {category || 'Categoria'}
          </span>
          <span className="absolute right-3 top-3 flex gap-1.5">
            {urgent && (
              <span className="rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold text-white">
                Urgente
              </span>
            )}
            {featured && (
              <span className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-extrabold text-slate-950">
                Destaque
              </span>
            )}
          </span>
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {displayDate}
            </span>
            <span className="flex min-w-0 items-center gap-1 truncate">
              <User size={13} />
              {displayAuthor}
            </span>
          </div>
          <h3 className="text-lg font-bold leading-snug text-slate-900">{displayTitle}</h3>
          <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">{displayExcerpt}</p>
          <p className="border-t border-slate-100 pt-3 text-xs font-bold text-primary">Ler notícia completa</p>
        </div>
      </article>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ao abrir a notícia</p>
        <h4 className="mt-2 text-base font-black leading-snug text-slate-900">{displayTitle}</h4>
        <p className="mt-2 line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-slate-600">
          {displayContent}
        </p>
        <p className={`mt-3 text-[11px] font-bold ${published ? 'text-emerald-700' : 'text-slate-500'}`}>
          {published ? 'Vai aparecer no site' : 'Rascunho: não aparece no site'}
        </p>
      </div>
    </aside>
  );
}
