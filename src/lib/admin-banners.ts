import type { BannerItem, GalleryItem, NewsItem, SiteInfo } from '@/types';

export interface AdminBannersData {
  banners: BannerItem[];
  siteInfo: Pick<SiteInfo, 'heroImage' | 'studioImage'>;
  news: Pick<NewsItem, 'id' | 'title' | 'coverImage'>[];
  gallery: Pick<GalleryItem, 'id' | 'title' | 'imageUrl'>[];
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

function isNewsCover(value: unknown): value is AdminBannersData['news'][number] {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' &&
    typeof value.coverImage === 'string';
}

function isGalleryPhoto(value: unknown): value is AdminBannersData['gallery'][number] {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' &&
    typeof value.imageUrl === 'string';
}

// A resposta legada é ampla; somente os campos usados pelo gerenciador são retidos.
export async function readAdminBanners(signal?: AbortSignal): Promise<AdminBannersData> {
  const response = await fetch('/api/data', { method: 'GET', cache: 'no-store', signal });
  if (!response.ok) throw new Error(`Não foi possível carregar os banners (HTTP ${response.status}).`);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Resposta inválida da leitura administrativa de Banners.');
  }
  if (!isRecord(payload) || !isRecord(payload.siteInfo) ||
      typeof payload.siteInfo.heroImage !== 'string' || typeof payload.siteInfo.studioImage !== 'string' ||
      !Array.isArray(payload.banners) || !payload.banners.every(isBanner) ||
      !Array.isArray(payload.news) || !payload.news.every(isNewsCover) ||
      !Array.isArray(payload.gallery) || !payload.gallery.every(isGalleryPhoto)) {
    throw new Error('Resposta inválida da leitura administrativa de Banners.');
  }

  return {
    banners: payload.banners.map(({ id, title, imageUrl, linkUrl }) => ({ id, title, imageUrl, linkUrl })),
    siteInfo: { heroImage: payload.siteInfo.heroImage, studioImage: payload.siteInfo.studioImage },
    news: payload.news.map(({ id, title, coverImage }) => ({ id, title, coverImage })),
    gallery: payload.gallery.map(({ id, title, imageUrl }) => ({ id, title, imageUrl })),
  };
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
