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

export interface StatItem {
  valor: string;
  rotulo: string;
}

export interface Professor {
  id: number;
  nome: string;
  funcao: 'Ministrante' | 'Mediador' | 'Mediadora';
  disciplina: string;
  municipio: string;
  escola: string;
  resumo: string;
  entrevista: string;
}

export interface Aluno {
  id: number;
  nome: string;
  idade: number;
  comunidade: string;
  municipio: string;
  conquista: string;
  categoria: 'Vestibular' | 'Olimpíada' | 'Robótica' | 'Feira de Ciências';
  resumo: string;
}

export interface Escola {
  id: number;
  nome: string;
  municipio: string;
  tipo: 'ribeirinha' | 'rural' | 'indígena' | 'urbana';
  turmas: number;
  alunos: number;
  mediador: string;
  conexao: 'Satélite' | 'Fibra rural' | 'Rádio' | 'Fibra' | string;
  comunidade?: string;
  distanciaKm?: number;
  statusSinal?: string;
  nodeId?: string;
  lat?: string;
  lon?: string;
}

export interface FonteOficial {
  nome: string;
  url: string;
}

export interface Indicador {
  metrica: string;
  valor: string;
  ano: number;
  data: string;
  fonte: FonteOficial;
}

export interface Contrato {
  item: string;
  valor: string;
  ano: number;
  data: string;
  fonte: FonteOficial;
  status: 'Em execução' | 'Concluído' | 'Executado';
}

export interface Noticia {
  id: number;
  categoria: 'Infraestrutura' | 'Eventos' | 'Pedagógico';
  data: string;
  titulo: string;
  resumo: string;
  img: string;
  conteudo?: string;
}

export type EtapaEditorial = 'Rascunho' | 'Revisão Jurídica/LGPD' | 'Aprovado' | 'Publicado';

export interface ItemEditorial {
  id: number;
  titulo: string;
  tipo: string;
  autor: string;
  etapa: EtapaEditorial;
  anexos: string[];
  atualizado: string;
}

export interface ReplicationWeek {
  week: number;
  title: string;
  studioAction: string;
  fieldAction: string;
}

export interface ProjectMission {
  id: string;
  number: string;
  missionCode: string;
  title: string;
  shortTitle: string;
  track: 'Agroecologia & NBAZ' | 'Ciência na Amazônia' | 'Saberes Indígenas & História' | 'Tecnologia Solar & Robótica';
  territory: string;
  typology: string;
  municipality: string;
  school: string;
  mediatorName: string;
  mediatorRole: string;
  mediatorInitials: string;
  studentCohort: string;
  seal: string;
  image: string;
  initialApplause: number;
  desafioLocal: {
    title: string;
    description: string;
  };
  praticaMedtec: {
    title: string;
    description: string;
  };
  impactoGerado: {
    title: string;
    metric: string;
    description: string;
  };
  competencias: string[];
  quote: string;
  replicationGuide: {
    materials: string[];
    timeline: ReplicationWeek[];
    pedagogicalTip: string;
  };
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
  schools?: Escola[];
  teachers?: Professor[];
  students?: Aluno[];
  projects?: ProjectMission[];
  transparency?: {
    indicadores: Indicador[];
    contratos: Contrato[];
  };
}


