import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'medtec2025';
const AUTH_COOKIE = 'medtec_admin_session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const response = NextResponse.json({ success: true, message: 'Autenticado com sucesso!' });
      
      response.cookies.set({
        name: AUTH_COOKIE,
        value: 'authenticated_medtec_admin_token_secure',
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Usuário ou senha inválidos' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao processar login' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout realizado' });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE);

  if (token && token.value === 'authenticated_medtec_admin_token_secure') {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
