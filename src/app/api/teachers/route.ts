import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { professoresData } from '@/data/medtecData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const funcao = searchParams.get('funcao');
    const municipio = searchParams.get('municipio');

    const db = getDatabase();
    let items = (db.teachers && db.teachers.length > 0) ? db.teachers : professoresData;

    if (funcao && funcao !== 'todos' && funcao !== 'Todas') {
      items = items.filter((p) => {
        if (funcao === 'Mediador') return p.funcao === 'Mediador' || p.funcao === 'Mediadora';
        return p.funcao.toLowerCase() === funcao.toLowerCase();
      });
    }

    if (municipio && municipio !== 'todos') {
      items = items.filter((p) => p.municipio.toLowerCase() === municipio.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      total: items.length,
      items,
    });
  } catch (error) {
    console.error('Erro na rota /api/teachers:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar professores' }, { status: 500 });
  }
}
