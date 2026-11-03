export type AdminEditorialDestination = {
  method: 'push' | 'replace';
  href: string;
};

// Define somente o destino editorial. A página mantém a coordenação de aliases,
// a validade da execução e a decisão de quando efetuar a navegação.
// Todo usuário logado tem o Início; o atalho de nova notícia só vale com a permissão
// create de n_noticias, que o chamador confere com pode().
export function getAdminEditorialDestination(
  canCreateNews: boolean,
  params: URLSearchParams,
): AdminEditorialDestination | null {
  const createNews = params.get('action') === 'new' || ['editor', 'new', 'nova'].includes(params.get('mode') || '');
  return createNews && canCreateNews
    ? { method: 'replace', href: '/admin/noticias?action=new' }
    : null;
}

// Recebe o primeiro redirect já extraído da query do login. Não decodifica
// novamente o destino nem usa sua aceitação como autorização do módulo.
export function getSafeAdminReturnTarget(raw: string | null | undefined): string {
  if (typeof raw !== 'string' || !raw) return '/admin';
  const hashIndex = raw.indexOf('#');
  const destination = hashIndex < 0 ? raw : raw.slice(0, hashIndex);
  const hash = hashIndex < 0 ? '' : raw.slice(hashIndex);
  // Fragmentos inválidos são descartados separadamente, sem perder o retorno.
  if (destination !== destination.trim() || Array.from(destination).some(char => {
    const code = char.charCodeAt(0);
    return code < 32 || (code >= 127 && code <= 159);
  })) return '/admin';

  const queryIndex = destination.indexOf('?');
  const pathname = queryIndex < 0 ? destination : destination.slice(0, queryIndex);
  const search = queryIndex < 0 ? '' : destination.slice(queryIndex + 1);
  const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/');

  // Inspeciona o caminho bruto antes de URL normalizar barras ou segmentos.
  if (!isAdminPath(pathname) || pathname.includes('//') || pathname.includes('\\') ||
      pathname.includes('%') || pathname.split('/').some(part => part === '.' || part === '..') ||
      pathname === '/admin/login' || pathname.startsWith('/admin/login/')) return '/admin';

  try {
    const parsed = new URL(destination, 'https://admin-return.invalid');
    if (!isAdminPath(parsed.pathname) || parsed.pathname !== pathname) return '/admin';
    // Detecta texto Unicode malformado antes da codificação externa no login.
    encodeURIComponent(destination);
  } catch {
    return '/admin';
  }

  // Decodifica somente as chaves pela semântica URLSearchParams. Conserva cada
  // par restante literalmente, inclusive ordem, repetições, %20, + e %2f.
  const query = search.split('&').filter(part => !new URLSearchParams(part).has('redirect')).join('&');
  // Âncora simples: um ou mais caracteres de [A-Za-z0-9_-] após #.
  const fragment = hash.length > 1 && !/[^A-Za-z0-9_-]/.test(hash.slice(1)) ? hash : '';
  return pathname + (query ? '?' + query : '') + fragment;
}

export function getAdminLoginHref(pathname: string, search: string): string {
  const target = search && !search.startsWith('?') ? '/admin' : getSafeAdminReturnTarget(pathname + search);
  return '/admin/login?redirect=' + encodeURIComponent(target);
}
