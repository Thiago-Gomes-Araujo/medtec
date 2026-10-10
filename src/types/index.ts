export type AnnouncementType = 'urgente' | 'aviso' | 'informativo';

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  publishedAt: string;
  featured: boolean;
  tags?: string[];
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  date: string;
  linkText?: string;
  linkUrl?: string;
  active: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
}

export interface SocialLinks {
  instagram: string;
  youtube: string;
  facebook: string;
  whatsapp: string;
  tiktok: string;
  email: string;
  phone: string;
  address: string;
}

export interface Stats {
  studentsCount: string;
  schoolsCount: string;
  citiesCount: string;
  liveHoursCount: string;
}

export interface SiteInfo {
  title: string;
  shortName: string;
  slogan: string;
  aboutTitle: string;
  aboutText: string;
  lawText: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  videoUrl?: string;
}

export interface DatabaseSchema {
  siteInfo: SiteInfo;
  stats: Stats;
  socials: SocialLinks;
  announcements: AnnouncementItem[];
  news: NewsItem[];
  gallery: GalleryItem[];
}

