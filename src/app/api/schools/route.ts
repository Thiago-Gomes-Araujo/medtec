import { NextResponse } from 'next/server';

/**
 * Endpoint de unidades escolares e dados de georreferenciamento.
 * AVISO: As rotas oficiais de escolas/polos ainda não foram disponibilizadas no backend da API v1.
 * O endpoint preserva a compatibilidade estrutural retornando lista vazia, sem dados fictícios.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    total: 0,
    items: [],
    message: 'Endpoints de escolas e mapa pendentes no backend.',
  });
}
