import fs from 'fs';
import path from 'path';
import { BannerItem, DatabaseSchema } from '@/types';
import initialData from '@/data/initialData.json';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData as DatabaseSchema;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    const defaults = initialData as DatabaseSchema;
    return {
      ...defaults,
      ...parsed,
      siteInfo: { ...defaults.siteInfo, ...(parsed.siteInfo || {}) },
      stats: { ...defaults.stats, ...(parsed.stats || {}) },
      socials: { ...defaults.socials, ...(parsed.socials || {}) },
      announcements: parsed.announcements ?? defaults.announcements,
      news: (parsed.news ?? defaults.news).map((item) => ({
        ...item,
        folder: item.folder?.trim() || item.category || 'Geral',
        published: item.published !== false,
        views: typeof item.views === 'number' && item.views > 0 ? item.views : 0,
      })),
      gallery: parsed.gallery ?? defaults.gallery,
      banners: normalizeBanners(parsed, defaults),
    };
  } catch (error) {
    console.error('Error reading database file:', error);
    return initialData as DatabaseSchema;
  }
}

function normalizeBanners(parsed: Partial<DatabaseSchema>, defaults: DatabaseSchema): BannerItem[] {
  const saved = parsed.banners?.filter((item) => item.imageUrl?.trim());
  if (saved && saved.length > 0) {
    return saved.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl.trim(),
      title: item.title || '',
      linkUrl: item.linkUrl || '',
    }));
  }

  const image = parsed.siteInfo?.heroImage || defaults.siteInfo.heroImage || '/hero.jpg';
  return [{ id: 'banner-inicial', title: 'Banner inicial', imageUrl: image, linkUrl: '#noticias' }];
}

export function saveDatabase(data: DatabaseSchema): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving database file:', error);
    return false;
  }
}

