import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { indicadoresData, contratosData } from '@/data/medtecData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ano = searchParams.get('ano');
    const tipo = searchParams.get('tipo'); // 'indicadores' | 'contratos' | 'todos'

    const db = getDatabase();
    const sourceIndicadores = (db.transparency?.indicadores && db.transparency.indicadores.length > 0)
      ? db.transparency.indicadores
      : indicadoresData;
    const sourceContratos = (db.transparency?.contratos && db.transparency.contratos.length > 0)
      ? db.transparency.contratos
      : contratosData;

    let indicadores = sourceIndicadores;
    let contratos = sourceContratos;

    if (ano && ano !== 'todos') {
      const anoNum = parseInt(ano, 10);
      if (!isNaN(anoNum)) {
        indicadores = indicadores.filter((i) => i.ano === anoNum);
        contratos = contratos.filter((c) => c.ano === anoNum);
      }
    }

    if (tipo === 'indicadores') {
      return NextResponse.json({ success: true, indicadores });
    }

    if (tipo === 'contratos') {
      return NextResponse.json({ success: true, contratos });
    }

    return NextResponse.json({
      success: true,
      indicadores,
      contratos,
    });
  } catch (error) {
    console.error('Erro na rota /api/transparency:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar dados de transparência' }, { status: 500 });
  }
}
