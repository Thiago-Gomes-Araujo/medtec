import type { MetadataRoute } from 'next';

/**
 * Configuração Segura de Robots.txt (Next.js Metadata Route)
 * Permite a indexação das páginas públicas institucionais e bloqueia rotas administrativas e de API.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medtec.seduc.ro.gov.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/noticias',
          '/noticias/',
          '/projetos',
          '/avisos',
          '/galeria',
          '/mapa',
          '/duvidas',
          '/faq',
          '/transparencia',
          '/comunidades',
          '/ao-vivo',
          '/acervo',
          '/alunos',
          '/professores',
          '/redes',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/painel-gestor/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
