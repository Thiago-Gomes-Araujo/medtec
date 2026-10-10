import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { DatabaseSchema } from '@/types';

export async function GET() {
  const data = getDatabase();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  try {
    const body: DatabaseSchema = await request.json();
    const success = saveDatabase(body);
    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar os dados no disco' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Dados salvos com sucesso', data: body });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao processar requisição' }, { status: 400 });
  }
}
