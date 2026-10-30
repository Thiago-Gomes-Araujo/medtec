import { NextResponse } from 'next/server';

/**
 * Endpoint de dúvidas frequentes (FAQ).
 * AVISO: As rotas de FAQ ainda não foram disponibilizadas no backend da API v1.
 * O endpoint preserva a compatibilidade estrutural retornando lista vazia, sem dados fictícios.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    total: 0,
    items: [],
    message: 'Endpoints de dúvidas frequentes pendentes no backend.',
  });
}
