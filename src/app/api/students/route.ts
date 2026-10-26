import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { alunosData } from '@/data/medtecData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');

    const db = getDatabase();
    let items = (db.students && db.students.length > 0) ? db.students : alunosData;

    if (categoria && categoria !== 'todos' && categoria !== 'Todas') {
      items = items.filter((a) => a.categoria.toLowerCase() === categoria.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      total: items.length,
      items,
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'digest' in error && (error as { digest?: string }).digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('Erro na rota /api/students:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar histórias de alunos' }, { status: 500 });
  }
}
