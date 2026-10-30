import type { BannerItem, SiteInfo } from '@/types';
import { ApiError, getMediaUrl, medtecApi, type ApiResponse, type PaginatedData } from '@/lib/api';

export interface AdminBannersData {
  banners: BannerItem[];
  siteInfo: Pick<SiteInfo, 'heroImage' | 'studioImage'>;
}

export interface BannerNewsCover {
  id: number;
  title: string;
  coverImage: string | null;
  status: string | null;
  statusName: string | null;
  publicationDate: string | null;
}

export interface BannerGalleryPhoto {
  id: number;
  title: string;
  imageUrl: string | null;
  category: { id: number; name: string; active: boolean } | null;
}

export interface BannerCollection<T> { items: T[]; total: number }
export interface BannerResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
  retry: () => void;
}

export function getLegacyBannersHref(params: URLSearchParams): string | null {
  const section = params.get('tab') || params.get('section');
  return section === 'fotos' || section === 'banners' ? '/admin/banners' : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isBanner(value: unknown): value is BannerItem {
  return isRecord(value) && typeof value.id === 'string' && typeof value.imageUrl === 'string' &&
    (value.title === undefined || typeof value.title === 'string') &&
    (value.linkUrl === undefined || typeof value.linkUrl === 'string');
}

// A resposta legada é ampla; somente os campos usados pelo gerenciador são retidos.
export async function readAdminBanners(signal?: AbortSignal): Promise<AdminBannersData> {
  const response = await fetch('/api/data', { method: 'GET', cache: 'no-store', signal });
  if (!response.ok) throw new ApiError(`Não foi possível carregar os banners (HTTP ${response.status}).`, response.status);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Resposta inválida da leitura administrativa de Banners.');
  }
  if (!isRecord(payload) || !isRecord(payload.siteInfo) ||
      typeof payload.siteInfo.heroImage !== 'string' || typeof payload.siteInfo.studioImage !== 'string' ||
      !Array.isArray(payload.banners) || !payload.banners.every(isBanner)) {
    throw new Error('Resposta inválida da leitura administrativa de Banners.');
  }

  return {
    banners: payload.banners.map(({ id, title, imageUrl, linkUrl }) => ({ id, title, imageUrl, linkUrl })),
    siteInfo: { heroImage: payload.siteInfo.heroImage, studioImage: payload.siteInfo.studioImage },
  };
}

function optionalText(value: unknown): boolean {
  return value === undefined || value === null || typeof value === 'string';
}

function officialId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function completeCollection<T>(response: ApiResponse<PaginatedData<T>>): T[] {
  if (!response?.success || !Array.isArray(response.data?.items) ||
      !Number.isSafeInteger(response.data.pagination?.total_count) ||
      response.data.pagination.total_count !== response.data.items.length) {
    throw new Error('Resposta inválida ou incompleta do acervo oficial.');
  }
  const ids = response.data.items.map((item) => isRecord(item) ? item.id : undefined);
  if (!ids.every(officialId) || new Set(ids).size !== ids.length) {
    throw new Error('Identificadores inválidos ou duplicados no acervo oficial.');
  }
  return response.data.items;
}

export async function readBannerNews(): Promise<BannerCollection<BannerNewsCover>> {
  const items = completeCollection(await medtecApi.noticias.list({ page: 'all' })).map((item) => {
    if (!isRecord(item) || typeof item.titulo !== 'string' || !optionalText(item.imagem_capa) ||
        !optionalText(item.status) || !optionalText(item.status_nome) || !optionalText(item.data_publicacao)) {
      throw new Error('Resposta inválida do acervo oficial de Notícias.');
    }
    return { id: item.id, title: item.titulo, coverImage: getMediaUrl(item.imagem_capa) || null,
      status: item.status ?? null, statusName: item.status_nome ?? null, publicationDate: item.data_publicacao ?? null };
  });
  return { items, total: items.length };
}

export async function readBannerGallery(): Promise<BannerCollection<BannerGalleryPhoto>> {
  const items = completeCollection(await medtecApi.fotosGaleria.list({ page: 'all' })).map((item) => {
    const category = item?.categoria_galeria;
    if (!isRecord(item) || typeof item.titulo !== 'string' || !optionalText(item.imagem) || !optionalText(item.imagem_url) ||
        (category != null && (!isRecord(category) || !officialId(category.id) ||
          typeof category.nome !== 'string' || typeof category.ativo !== 'boolean'))) {
      throw new Error('Resposta inválida do acervo oficial de Galeria.');
    }
    return { id: item.id, title: item.titulo, imageUrl: getMediaUrl(item.imagem || item.imagem_url) || null,
      category: category ? { id: category.id, name: category.nome, active: category.ativo } : null };
  });
  return { items, total: items.length };
}

// Seleção de Banners é exclusivamente local enquanto não houver persistência oficial.
// Data URLs dispensam arquivos no servidor e URLs de objeto que precisariam de revogação.
export async function prepareLocalBannerPreview(file: File | undefined): Promise<BannerItem | null> {
  if (!file) return null;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type.toLowerCase())) {
    throw new Error('Selecione uma imagem JPEG, PNG, WEBP ou AVIF para a prévia local.');
  }
  if (file.size === 0 || file.size > 5 * 1024 * 1024) {
    throw new Error('Selecione uma imagem de até 5 MB, com conteúdo, para a prévia local.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result.startsWith('data:')) {
        reject(new Error('Não foi possível ler a imagem para a prévia local.'));
        return;
      }
      resolve({ id: 'banner-local', title: file.name, imageUrl: reader.result, linkUrl: '' });
    };
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem para a prévia local.'));
    reader.onabort = () => reject(new Error('Leitura da imagem local cancelada.'));
    reader.readAsDataURL(file);
  });
}
