import { NextResponse } from 'next/server';

/**
 * Endpoint de projetos escolares e práticas de campo.
 * AVISO: As rotas oficiais de projetos ainda não foram disponibilizadas no backend da API v1.
 * O endpoint preserva a compatibilidade estrutural retornando lista vazia, sem dados fictícios.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    total: 0,
    tracks: [],
    items: [],
    message: 'Endpoints de projetos pedagógicos pendentes no backend.',
  });
}
