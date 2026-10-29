import { NextResponse } from 'next/server';

/**
 * Endpoint de histórias de alunos e conquistas.
 * AVISO: As rotas de protagonismo estudantil ainda não foram disponibilizadas no backend da API v1.
 * O endpoint preserva a compatibilidade estrutural retornando lista vazia, sem dados fictícios.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    total: 0,
    items: [],
    message: 'Endpoints de histórias de alunos pendentes no backend.',
  });
}
