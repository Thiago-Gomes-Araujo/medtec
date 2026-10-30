'use client';

import React, { useRef, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Upload, Eye } from 'lucide-react';
import type { BannerItem } from '@/types';
import { prepareLocalBannerPreview, type AdminBannersData } from '@/lib/admin-banners';
import AdminLiveSimulator, { AdminPreviewModal } from '@/components/AdminLiveSimulator';

interface SitePhotosManagerProps extends AdminBannersData {
  saving: boolean;
}

export default function SitePhotosManager({ saving, ...data }: SitePhotosManagerProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<BannerItem | null>(null);
  const [localBanner, setLocalBanner] = useState<BannerItem | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const localSelection = useRef(0);
  const activeBanner = localBanner || data.banners[0] || {
    id: 'banner-default',
    title: 'Ensino Médio com Mediação Tecnológica em Rondônia',
    imageUrl: data.siteInfo.heroImage || '/hero.jpg',
    linkUrl: '',
  };

  // Os controles existentes propõem alterações, mas não há contrato Rails para gravá-las.
  const onSave: (next: AdminBannersData) => void = () => {
    alert('A gravação de banners está desabilitada aguardando a disponibilização do endpoint oficial no backend Rails. A persistência em disco local foi descontinuada.');
  };

  const selectLocalBanner = async (file: File | undefined) => {
    if (!file) return;
    const selection = ++localSelection.current;
    setLocalError(null);
    setBusy('banner-novo');
    try {
      const banner = await prepareLocalBannerPreview(file);
      if (selection === localSelection.current && banner) {
        setLocalBanner(banner);
        setPreviewBanner(banner);
      }
    } catch (error) {
      if (selection === localSelection.current) {
        setLocalError(error instanceof Error ? error.message : 'Falha ao ler a imagem local.');
      }
    } finally {
      if (selection === localSelection.current) setBusy(null);
    }
  };

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

  const replace = async (key: string, file: File | undefined, apply: (url: string) => AdminBannersData) => {
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
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Gerenciador de Banners:</strong> A persistência deste módulo aguarda a disponibilização do endpoint oficial no backend Rails. A gravação em disco local foi desabilitada para cumprir a diretriz de fonte única de dados. As fotos da galeria e as capas de notícias são gerenciadas exclusivamente nas respectivas abas integradas à API.
        </span>
      </div>
      <p role="note" className="text-xs text-amber-800 dark:text-amber-200">
        O envio de banners está indisponível enquanto a gravação estiver bloqueada. Selecionar um banner abre apenas uma prévia local, sem enviar o arquivo.
        {localBanner && ' A imagem local não foi salva nem publicada.'}
      </p>
      {localError && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{localError}</p>}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 min-w-0 space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-900">Fotos do site</h2>
            <p className="mt-1 text-xs text-slate-500">
              Consulte os banners, a foto do estúdio, as capas das notícias e as imagens da galeria. O upload de uma imagem não publica alterações: a gravação deste módulo está bloqueada.
            </p>
          </div>

          <BannerCarousel
            banners={data.banners || []}
            busy={busy}
            saving={saving}
            onPreview={setPreviewBanner}
            onChange={(banners) => onSave({ ...data, banners })}
            onSelectFile={selectLocalBanner}
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
        <div className="xl:col-span-5 min-w-0">
          <AdminLiveSimulator
            type="banner"
            data={activeBanner}
            onOpenFullscreen={() => setPreviewBanner(activeBanner)}
          />
        </div>
      </div>
      <AdminPreviewModal
        isOpen={previewBanner !== null}
        onClose={() => setPreviewBanner(null)}
        type="banner"
        data={previewBanner || activeBanner}
      />
    </div>
  );
}

function BannerCarousel({
  banners,
  busy,
  saving,
  onChange,
  onSelectFile,
  onPreview,
}: {
  banners: BannerItem[];
  busy: string | null;
  saving: boolean;
  onChange: (banners: BannerItem[]) => void;
  onSelectFile: (file: File | undefined) => void;
  onPreview?: (banner: BannerItem) => void;
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
                {onPreview && (
                  <button
                    type="button"
                    aria-label="Ver prévia no site"
                    onClick={() => onPreview(banner)}
                    className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-2 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition cursor-pointer"
                    title="Ver como fica no Hero da Home"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
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
          label={busy === 'banner-novo' ? 'Lendo imagem...' : 'Selecionar banner para prévia local'}
          onFile={onSelectFile}
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
  const [prevSrc, setPrevSrc] = useState(src);
  const [link, setLink] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setLink(src);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-52 bg-slate-900">
        <img src={src} alt={label} className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-white">
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
