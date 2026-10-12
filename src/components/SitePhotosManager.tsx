'use client';

import React, { useEffect, useState } from 'react';
import { DatabaseSchema } from '@/types';
import { ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { BannerItem } from '@/types';

interface SitePhotosManagerProps {
  data: DatabaseSchema;
  saving: boolean;
  onSave: (next: DatabaseSchema) => void;
}

export default function SitePhotosManager({ data, saving, onSave }: SitePhotosManagerProps) {
  const [busy, setBusy] = useState<string | null>(null);

  const upload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok || !json.url) {
      throw new Error(json.error || 'Não foi possível enviar a imagem.');
    }
    return json.url as string;
  };

  const replace = async (key: string, file: File | undefined, apply: (url: string) => DatabaseSchema) => {
    if (!file) return;
    setBusy(key);
    try {
      const url = await upload(file);
      onSave(apply(url));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Falha no upload da foto.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-black text-slate-900">Fotos do site</h2>
        <p className="mt-1 text-xs text-slate-500">
          Monte o carrossel da home, troque a foto do estúdio, as capas das notícias e as imagens da galeria. O envio vale na hora para o site público.
        </p>
      </div>

      <BannerCarousel
        banners={data.banners || []}
        busy={busy}
        saving={saving}
        onChange={(banners) => onSave({ ...data, banners })}
        onUpload={(file) =>
          replace('banner-novo', file, (url) => ({
            ...data,
            banners: [
              ...(data.banners || []),
              { id: `banner-${Date.now()}`, title: 'Novo banner', imageUrl: url, linkUrl: '' },
            ],
          }))
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PhotoSlot
          label="Foto do estúdio"
          hint="Imagem do painel ao vivo, ao lado do título."
          src={data.siteInfo.studioImage || data.siteInfo.heroImage || '/hero.jpg'}
          busy={busy === 'studio'}
          saving={saving}
          onFile={(file) =>
            replace('studio', file, (url) => ({
              ...data,
              siteInfo: { ...data.siteInfo, studioImage: url },
            }))
          }
          onUrl={(url) => onSave({ ...data, siteInfo: { ...data.siteInfo, studioImage: url } })}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-black text-slate-900">Capas das notícias</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.news.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200">
              <img src={item.coverImage} alt="" className="h-36 w-full object-cover" />
              <div className="space-y-2 p-3">
                <p className="line-clamp-2 text-xs font-bold text-slate-900">{item.title}</p>
                <FileButton
                  busy={busy === item.id}
                  label="Trocar capa"
                  onFile={(file) =>
                    replace(item.id, file, (url) => ({
                      ...data,
                      news: data.news.map((news) =>
                        news.id === item.id ? { ...news, coverImage: url } : news
                      ),
                    }))
                  }
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-black text-slate-900">Galeria</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.gallery.map((photo) => (
            <article key={photo.id} className="overflow-hidden rounded-xl border border-slate-200">
              <img src={photo.imageUrl} alt="" className="h-36 w-full object-cover" />
              <div className="space-y-2 p-3">
                <p className="line-clamp-2 text-xs font-bold text-slate-900">{photo.title}</p>
                <FileButton
                  busy={busy === photo.id}
                  label="Trocar foto"
                  onFile={(file) =>
                    replace(photo.id, file, (url) => ({
                      ...data,
                      gallery: data.gallery.map((item) =>
                        item.id === photo.id ? { ...item, imageUrl: url } : item
                      ),
                    }))
                  }
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function BannerCarousel({
  banners,
  busy,
  saving,
  onChange,
  onUpload,
}: {
  banners: BannerItem[];
  busy: string | null;
  saving: boolean;
  onChange: (banners: BannerItem[]) => void;
  onUpload: (file: File | undefined) => void;
}) {
  const [link, setLink] = useState('');

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= banners.length) return;
    const copy = [...banners];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    onChange(copy);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-black text-slate-900">Carrossel de banners</h3>
      <p className="mt-1 text-xs text-slate-500">
        Cada imagem vira um slide da home, no formato dos banners da matrícula da SEDUC. Use artes largas. O link é opcional.
      </p>

      <div className="mt-5 space-y-4">
        {banners.map((banner, index) => (
          <article key={banner.id} className="overflow-hidden rounded-xl border border-slate-200">
            <img src={banner.imageUrl} alt={banner.title || 'Banner'} className="h-40 w-full object-cover sm:h-52" />
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
              <form
                className="flex min-w-0 flex-1 gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const input = event.currentTarget.elements.namedItem('destino') as HTMLInputElement;
                  onChange(banners.map((item) => (
                    item.id === banner.id ? { ...item, linkUrl: input.value.trim() } : item
                  )));
                }}
              >
                <input
                  name="destino"
                  defaultValue={banner.linkUrl || ''}
                  placeholder="Link ao clicar: /noticias ou https://..."
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  Salvar link
                </button>
              </form>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Subir banner"
                  disabled={index === 0 || saving}
                  onClick={() => move(index, -1)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Descer banner"
                  disabled={index === banners.length - 1 || saving}
                  onClick={() => move(index, 1)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remover banner"
                  disabled={saving}
                  onClick={() => onChange(banners.filter((item) => item.id !== banner.id))}
                  className="rounded-lg border border-rose-200 p-2 text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
        <FileButton
          busy={busy === 'banner-novo'}
          label={busy === 'banner-novo' ? 'Enviando...' : 'Enviar banner do computador'}
          onFile={onUpload}
        />
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const url = link.trim();
            if (!url) return;
            onChange([
              ...banners,
              { id: `banner-${Date.now()}`, title: 'Novo banner', imageUrl: url, linkUrl: '' },
            ]);
            setLink('');
          }}
        >
          <input
            type="text"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="Ou cole o link da imagem"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            disabled={saving || !link.trim()}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            Adicionar
          </button>
        </form>
      </div>
    </section>
  );
}

function PhotoSlot({
  label,
  hint,
  src,
  busy,
  saving,
  onFile,
  onUrl,
}: {
  label: string;
  hint: string;
  src: string;
  busy: boolean;
  saving: boolean;
  onFile: (file: File | undefined) => void;
  onUrl: (url: string) => void;
}) {
  const [link, setLink] = useState(src);

  useEffect(() => {
    setLink(src);
  }, [src]);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-52 bg-slate-900">
        <img src={src} alt={label} className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-white">
          <ImageIcon className="h-3.5 w-3.5" />
          {label}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-xs text-slate-500">{hint}</p>
        <FileButton busy={busy} label={busy ? 'Enviando...' : 'Enviar do computador'} onFile={onFile} />
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (link.trim()) onUrl(link.trim());
          }}
        >
          <input
            type="text"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="/uploads/banner.jpg ou https://..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            disabled={saving || busy}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            Usar link
          </button>
        </form>
      </div>
    </article>
  );
}

function FileButton({
  label,
  busy,
  onFile,
}: {
  label: string;
  busy: boolean;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary">
      <Upload className="h-3.5 w-3.5" />
      {label}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </label>
  );
}
