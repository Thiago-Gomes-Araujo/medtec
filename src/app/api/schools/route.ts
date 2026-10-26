import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { escolasData } from '@/data/medtecData';
import { normalizarEscolas, filtrarPontosMapa } from '@/components/mapa/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const municipio = searchParams.get('municipio') || '';
    const tipo = searchParams.get('tipo') || '';
    const busca = searchParams.get('busca') || '';

    const db = getDatabase();
    const sourceSchools = (db.schools && db.schools.length > 0) ? db.schools : escolasData;

    // Normaliza os pontos
    const pontos = normalizarEscolas(sourceSchools);

    // Aplica filtros se fornecidos
    const filtrados = filtrarPontosMapa(pontos, {
      municipio,
      tipo,
      busca,
    });

    return NextResponse.json({
      success: true,
      total: filtrados.length,
      items: filtrados,
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'digest' in error && (error as { digest?: string }).digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('Erro na rota /api/schools:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar escolas' }, { status: 500 });
  }
}
