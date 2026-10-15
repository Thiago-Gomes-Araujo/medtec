import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyAdminSession,
  verifyCredentials,
  validateCsrfOrigin,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origem da requisição inválida' }, { status: 403 });
    }

    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Informe usuário e senha' }, { status: 400 });
    }

    if (verifyCredentials(username, password)) {
      const token = createSessionToken(username);
      const response = NextResponse.json({ success: true, message: 'Autenticado com sucesso!' });

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Usuário ou senha inválidos' }, { status: 401 });
  } catch (error) {
    console.error('Erro no endpoint de autenticação POST /api/auth:', error);
    return NextResponse.json({ success: false, error: 'Erro ao processar login' }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ success: true, message: 'Logout realizado com sucesso' });
}

export async function GET() {
  const auth = await verifyAdminSession();

  if (auth.valid) {
    return NextResponse.json({ authenticated: true, user: auth.username });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

