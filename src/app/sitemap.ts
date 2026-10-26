import type { MetadataRoute } from 'next';

/**
 * Geração Dinâmica de Sitemap Seguro (Next.js Metadata Route)
 * Lista as rotas institucionais públicas do MEDTEC Rondônia (SEDUC).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medtec.seduc.ro.gov.br';
  const currentDate = new Date().toISOString();

  const publicRoutes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/noticias', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/projetos', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/mapa', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/avisos', changeFrequency: 'daily' as const, priority: 0.8 },
    { path: '/galeria', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/duvidas', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/faq', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/transparencia', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/comunidades', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/ao-vivo', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/acervo', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/alunos', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/professores', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/redes', changeFrequency: 'monthly' as const, priority: 0.6 },
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
