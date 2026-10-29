import { NextResponse } from 'next/server';

/**
 * Registro de visualizações de notícias.
 * Como os endpoints de notícias do backend estão em desenvolvimento,
 * a rota responde com sucesso seguro sem alterar persistência local.
 */
export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Notícia inválida' }, { status: 400 });
    }

    return NextResponse.json({ views: 0 });
  } catch {
    return NextResponse.json({ error: 'Falha ao registrar visualização' }, { status: 400 });
  }
}
