import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medtec.seduc.ro.gov.br';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
    '/noticias',
    '/projetos',
    '/avisos',
    '/galeria',
    '/mapa',
    '/duvidas',
    '/faq',
    '/transparencia',
    '/redes',
    '/ao-vivo',
    '/professores',
    '/alunos',
    '/comunidades',
    '/acervo',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
