import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { getAdminLoginHref } from '@/lib/admin-auth-navigation';
import { getProfessorPathId, isProfessorMissing } from '@/lib/professor-publico';

/**
 * Padrões de caminhos sensíveis e arquivos de configuração que devem ser bloqueados
 * imediatamente para prevenir ataques de reconhecimento e exploração maliciosa.
 */
const SENSITIVE_PATH_PATTERNS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/\.aws/i,
  /^\/\.ssh/i,
  /^\/\.ds_store/i,
  /^\/wp-(?:admin|login|content|includes)/i,
  /^\/phpmyadmin/i,
  /^\/pma/i,
  /^\/xmlrpc\.php/i,
  /^\/actuator/i,
  /^\/server-status/i,
  /\.(?:sql|bak|old|orig|cfg|ini|env|log)$/i,
];

/**
 * Next.js 16 Proxy / Middleware de Segurança Governamental (OWASP Hardening)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bloqueio preventivo de caminhos sensíveis e scanners de vulnerabilidade
  for (const pattern of SENSITIVE_PATH_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse('Acesso não autorizado.', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
  }

  // 2. Restrição estrita de métodos HTTP em rotas institucionais públicas
  if (!pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
    const method = request.method.toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return new NextResponse('Método não permitido.', {
        status: 405,
        headers: {
          Allow: 'GET, HEAD, OPTIONS',
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
  }

  // 3. Geração e propagação de X-Request-Id para rastreabilidade e auditoria
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  // 4. Proteção de controle de acesso da área administrativa (CMS)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = verifySessionToken(token);

    if (pathname === '/admin/login') {
      if (session) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      response.headers.set('x-request-id', requestId);
      return response;
    }

    if (!session) {
      const loginUrl = new URL(getAdminLoginHref(pathname, request.nextUrl.search), request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Continuação com cabeçalho de rastreabilidade injetado
  const continueRequest = () => {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set('x-request-id', requestId);
    return response;
  };

  // 6. Professor inexistente: a rota é pré-renderizada em parte e o status sai junto com o shell,
  // então o notFound() da página ficaria em 200. Fetch do navegador (navegação interna e prefetch)
  // fica de fora: não abre a página pela URL e não deve gerar uma consulta por link da lista.
  const professorId = getProfessorPathId(pathname);
  if (professorId !== null && request.method !== 'OPTIONS' && request.headers.get('sec-fetch-dest') !== 'empty') {
    return isProfessorMissing(professorId).then((missing) => {
      if (!missing) return continueRequest();
      const response = NextResponse.rewrite(new URL('/_not-found', request.url), {
        request: {
          headers: requestHeaders,
        },
      });
      response.headers.set('x-request-id', requestId);
      return response;
    });
  }

  return continueRequest();
}

// Suporte a compatibilidade para exportação padrão e nomeada de middleware
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Intercepta rotas dinâmicas excluindo recursos estáticos de alta performance
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
};
