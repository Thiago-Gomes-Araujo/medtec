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
  urgent?: boolean;
  folder?: string;
  published?: boolean;
  views?: number;
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

export interface BannerItem {
  id: string;
  imageUrl: string;
  title?: string;
  linkUrl?: string;
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
  heroImage: string;
  studioImage: string;
  videoUrl?: string;
}

export type UserProfileType = 
  | 'Editor de Notícias' 
  | 'Curador de Fotos' 
  | 'Publicador de Avisos' 
  | 'Operador de Conteúdo';

export interface UserAccount {
  id: string;
  name: string;
  cpf: string; // formato 000.000.000-00
  profileType: UserProfileType;
  role: 'operador';
  active: boolean;
  createdAt: string;
  passwordHash: string; // Hash seguro com sal
}

export interface DatabaseSchema {
  siteInfo: SiteInfo;
  stats: Stats;
  socials: SocialLinks;
  announcements: AnnouncementItem[];
  news: NewsItem[];
  gallery: GalleryItem[];
  banners: BannerItem[];
  users?: UserAccount[];
}


