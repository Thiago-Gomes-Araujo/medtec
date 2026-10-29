import { NextResponse } from 'next/server';

/**
 * Endpoint de transparência, indicadores e contratos.
 * AVISO: As rotas oficiais de transparência ainda não foram disponibilizadas no backend da API v1.
 * O endpoint preserva a compatibilidade estrutural retornando listas vazias, sem dados fictícios.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');

  if (tipo === 'indicadores') {
    return NextResponse.json({ success: true, indicadores: [] });
  }

  if (tipo === 'contratos') {
    return NextResponse.json({ success: true, contratos: [] });
  }

  return NextResponse.json({
    success: true,
    indicadores: [],
    contratos: [],
    message: 'Endpoints de transparência pendentes no backend.',
  });
}
