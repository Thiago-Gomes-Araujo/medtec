/**
 * MEDTEC — Mapeamento Puro de Aliases Administrativos (Etapa 12D-4A)
 *
 * Módulo determinístico e puro para resolução de aliases estáticos de navegação
 * administrativa. Não executa navegação, não acessa navegador/DOM, não utiliza
 * hooks e não acessa sessão ou serviços externos.
 */

/**
 * Tabela de aliases estáticos para os parâmetros legados ?tab= e ?section=.
 * Criada sem protótipo (Object.create(null)) para imunidade contra propriedades herdadas
 * como toString, constructor, valueOf e __proto__.
 */
export const ADMIN_STATIC_TAB_ALIASES: Readonly<Record<string, string>> = Object.freeze(
  Object.assign(Object.create(null), {
    fotos: '/admin/banners',
    banners: '/admin/banners',
    duvidas: '/admin/faq',
    faq: '/admin/faq',
    usuarios: '/admin/usuarios',
    kanban: '/admin/kanban',
    avisos: '/admin/avisos',
    galeria: '/admin/galeria',
    estadosCidades: '/admin/estados-cidades',
    siteInfo: '/admin/institucional',
    redes: '/admin/redes',
  })
);

/**
 * Tabela de aliases estáticos de caminhos de rota legados do portal/administração.
 */
export const ADMIN_STATIC_ROUTE_ALIASES: Readonly<Record<string, string>> = Object.freeze(
  Object.assign(Object.create(null), {
    '/auth/login': '/admin/login',
    '/painel-gestor': '/admin',
  })
);

/**
 * Resolve um valor de alias estático (vindo de ?tab= ou ?section=) para sua rota canônica.
 *
 * Retorna a rota correspondente (ex: '/admin/banners') ou `null` caso o valor seja
 * desconhecido, vazio, contenha maiúsculas divergentes, seja uma propriedade herdada
 * ou pertença a módulos com lógica dependente de outros parâmetros (como noticias ou projetos).
 */
export function getAdminStaticAlias(alias: string | null | undefined): string | null {
  if (typeof alias !== 'string' || alias.length === 0) {
    return null;
  }
  if (!Object.prototype.hasOwnProperty.call(ADMIN_STATIC_TAB_ALIASES, alias)) {
    return null;
  }
  return ADMIN_STATIC_TAB_ALIASES[alias] ?? null;
}

/**
 * Alias semântico para getAdminStaticAlias.
 */
export const resolveAdminStaticAlias = getAdminStaticAlias;

/**
 * Extrai o parâmetro ?tab= ou ?section= de uma instância de URLSearchParams
 * e resolve o alias estático correspondente, se houver.
 *
 * Segue a convenção existente no MEDTEC de priorizar ?tab= sobre ?section=.
 */
export function getAdminStaticAliasFromParams(params: URLSearchParams): string | null {
  const value = params.get('tab') || params.get('section');
  return getAdminStaticAlias(value);
}

/**
 * Resolve rotas históricas puramente estáticas (ex: '/auth/login', '/painel-gestor')
 * para sua rota canônica atual, ou retorna `null` para rotas desconhecidas.
 */
export function getAdminRouteAlias(pathname: string | null | undefined): string | null {
  if (typeof pathname !== 'string' || pathname.length === 0) {
    return null;
  }
  if (!Object.prototype.hasOwnProperty.call(ADMIN_STATIC_ROUTE_ALIASES, pathname)) {
    return null;
  }
  return ADMIN_STATIC_ROUTE_ALIASES[pathname] ?? null;
}
