import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

/**
 * Next.js 16 Proxy (substituto oficial do middleware.ts)
 * Intercepta requisições no servidor antes de renderizar páginas.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege a área administrativa
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = verifySessionToken(token);

    // Se estiver na tela de login
    if (pathname === '/admin/login') {
      if (session) {
        // Já está autenticado: redireciona para o painel principal
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Para o painel administrativo ou qualquer subpágina restrita
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
