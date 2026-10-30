'use client';

import React, { useRef, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Upload, Eye } from 'lucide-react';
import type { BannerItem } from '@/types';
import { prepareLocalBannerPreview, type AdminBannersData, type BannerCollection,
  type BannerGalleryPhoto, type BannerNewsCover, type BannerResource } from '@/lib/admin-banners';
import AdminLiveSimulator, { AdminPreviewModal } from '@/components/AdminLiveSimulator';

interface SitePhotosManagerProps {
  local: BannerResource<AdminBannersData>;
  news: BannerResource<BannerCollection<BannerNewsCover>>;
  gallery: BannerResource<BannerCollection<BannerGalleryPhoto>>;
  saving: boolean;
}

export default function SitePhotosManager(data: SitePhotosManagerProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<BannerItem | null>(null);
  const [localBanner, setLocalBanner] = useState<BannerItem | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, string>>({});
  const localSelection = useRef(0);
  const localData = !data.local.loading && !data.local.error ? data.local.data : null;
  const news = !data.news.loading && !data.news.error ? data.news.data : null;
  const gallery = !data.gallery.loading && !data.gallery.error ? data.gallery.data : null;
  const activeBanner = localBanner || (localData ? localData.banners[0] || {
    id: 'banner-default',
    title: 'Ensino Médio com Mediação Tecnológica em Rondônia',
    imageUrl: localData.siteInfo.heroImage || '/hero.jpg',
    linkUrl: '',
  } : null);
  const currentPreview = previewBanner === localBanner ? localBanner :
    (localData?.banners.find((banner) => banner.id === previewBanner?.id) ||
      (previewBanner?.id === 'banner-default' && localData ? activeBanner : null));

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
              Consulte os banners, a foto do estúdio, as capas das notícias e as imagens da galeria. A edição está indisponível: a gravação deste módulo está bloqueada.
            </p>
          </div>

          <ResourceFeedback label="Banners e imagens institucionais" resource={data.local} />
          {localData && <BannerCarousel
            banners={localData.banners}
            busy={busy}
            onPreview={setPreviewBanner}
            onSelectFile={selectLocalBanner}
          />}

          <div className="grid gap-6 lg:grid-cols-2">
            {localData && <PhotoSlot
              label="Foto do estúdio"
              hint="Imagem do painel ao vivo, ao lado do título."
              src={localData.siteInfo.studioImage || localData.siteInfo.heroImage || '/hero.jpg'}
            />}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-black text-slate-900">Capas das notícias</h3>
            <p role="note" className="mt-1 text-xs text-slate-500">Edição indisponível neste gerenciador. Use o módulo Notícias para editar capas.</p>
            <ResourceFeedback label="Notícias" resource={data.news} />
            {news?.items.length === 0 && <p className="mt-4 text-xs text-slate-500">Nenhuma notícia encontrada no acervo oficial.</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news?.items.map((item) => (
                <article key={`noticia:${item.id}`} data-resource-id={`noticia:${item.id}`} className="overflow-hidden rounded-xl border border-slate-200">
                  {item.coverImage && failedImages[`noticia:${item.id}`] !== item.coverImage ?
                    <img src={item.coverImage} alt={item.title} className="h-36 w-full object-cover"
                      onError={() => setFailedImages((previous) => ({ ...previous, [`noticia:${item.id}`]: item.coverImage! }))} /> :
                    <p className="h-36 flex items-center justify-center p-3 text-xs text-slate-500">{item.coverImage ? 'Capa indisponível.' : 'Capa não informada.'}</p>}
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">ID oficial: {item.id}</p>
                    <p className="text-xs text-slate-500">Situação editorial: {item.statusName || item.status || 'Não informada'}</p>
                    {item.publicationDate && <p className="text-xs text-slate-500">Data de publicação: {item.publicationDate}</p>}
                    <FileButton
                      disabled
                      label="Trocar capa"
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-black text-slate-900">Galeria</h3>
            <p role="note" className="mt-1 text-xs text-slate-500">Edição indisponível neste gerenciador. Use o módulo Galeria para editar fotos.</p>
            <ResourceFeedback label="Galeria" resource={data.gallery} />
            {gallery?.items.length === 0 && <p className="mt-4 text-xs text-slate-500">Nenhuma foto encontrada no acervo oficial.</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery?.items.map((photo) => (
                <article key={`galeria:${photo.id}`} data-resource-id={`galeria:${photo.id}`} className="overflow-hidden rounded-xl border border-slate-200">
                  {photo.imageUrl && failedImages[`galeria:${photo.id}`] !== photo.imageUrl ?
                    <img src={photo.imageUrl} alt={photo.title} className="h-36 w-full object-cover"
                      onError={() => setFailedImages((previous) => ({ ...previous, [`galeria:${photo.id}`]: photo.imageUrl! }))} /> :
                    <p className="h-36 flex items-center justify-center p-3 text-xs text-slate-500">{photo.imageUrl ? 'Imagem indisponível.' : 'Imagem não informada.'}</p>}
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 text-xs font-bold text-slate-900">{photo.title}</p>
                    <p className="text-xs text-slate-500">ID oficial: {photo.id}</p>
                    {photo.category && <p className="text-xs text-slate-500">Categoria: {photo.category.name} (ID {photo.category.id}){!photo.category.active && ' — inativa'}</p>}
                    <FileButton
                      disabled
                      label="Trocar foto"
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
        <div className="xl:col-span-5 min-w-0">
          {activeBanner ? <AdminLiveSimulator
            type="banner"
            data={activeBanner}
            onOpenFullscreen={() => setPreviewBanner(activeBanner)}
          /> : <p className="text-xs text-slate-500">Prévia indisponível até a leitura dos banners locais.</p>}
        </div>
      </div>
      {currentPreview && <AdminPreviewModal
        isOpen
        onClose={() => setPreviewBanner(null)}
        type="banner"
        data={currentPreview}
      />}
    </div>
  );
}

function ResourceFeedback({ label, resource }: {
  label: string;
  resource: Pick<BannerResource<unknown>, 'loading' | 'error' | 'status' | 'retry'>;
}) {
  if (resource.loading) return <p role="status" className="mt-3 text-xs text-slate-500">Carregando {label}...</p>;
  if (!resource.error) return null;
  return (
    <div role="alert" className="mt-3 rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 space-y-2">
      <p>{resource.status === 403 ? `Sem permissão para consultar ${label}.` :
        resource.status === 401 ? `Sessão inválida ou expirada ao consultar ${label}. Faça login novamente.` :
          `Não foi possível carregar ${label}.`}</p>
      <p>{resource.error}</p>
      {resource.status === 401 && <a href="/admin/login?redirect=%2Fadmin%2Fbanners" className="block font-bold underline">Entrar novamente</a>}
      <button type="button" onClick={resource.retry} aria-label={`Tentar novamente: ${label}`} className="font-bold underline cursor-pointer">Tentar novamente</button>
    </div>
  );
}

function BannerCarousel({
  banners,
  busy,
  onSelectFile,
  onPreview,
}: {
  banners: BannerItem[];
  busy: string | null;
  onSelectFile: (file: File | undefined) => void;
  onPreview?: (banner: BannerItem) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-black text-slate-900">Carrossel de banners</h3>
      <p className="mt-1 text-xs text-slate-500">
        Consulte os banners existentes e abra suas prévias. Adicionar, salvar links, reordenar e remover estão indisponíveis enquanto não houver persistência oficial.
      </p>

      <div className="mt-5 space-y-4">
        {banners.map((banner) => (
          <article key={banner.id} className="overflow-hidden rounded-xl border border-slate-200">
            <img src={banner.imageUrl} alt={banner.title || 'Banner'} className="h-40 w-full object-cover sm:h-52" />
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
              <form
                className="flex min-w-0 flex-1 gap-2"
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  name="destino"
                  defaultValue={banner.linkUrl || ''}
                  disabled
                  placeholder="Link ao clicar: /noticias ou https://..."
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled
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
                  disabled
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Descer banner"
                  disabled
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remover banner"
                  disabled
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
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="text"
            disabled
            placeholder="Ou cole o link da imagem"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            disabled
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
}: {
  label: string;
  hint: string;
  src: string;
}) {
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
        <p role="note" className="text-xs text-slate-500">Edição indisponível enquanto não houver persistência oficial.</p>
        <FileButton disabled label="Enviar do computador" />
        <form
          className="flex gap-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="text"
            value={src}
            disabled
            placeholder="/uploads/banner.jpg ou https://..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            disabled
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
  busy = false,
  disabled = false,
  onFile,
}: {
  label: string;
  busy?: boolean;
  disabled?: boolean;
  onFile?: (file: File | undefined) => void;
}) {
  const unavailable = disabled || busy || !onFile;
  return (
    <label className={`inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 ${unavailable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-primary hover:text-primary'}`}>
      <Upload className="h-3.5 w-3.5" />
      {label}
      <input
        type="file"
        aria-label={label}
        accept="image/*"
        className="hidden"
        disabled={unavailable}
        onChange={unavailable ? undefined : (event) => {
          onFile?.(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </label>
  );
}
