import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Notícia inválida' }, { status: 400 });
    }

    const data = getDatabase();
    const news = data.news.find((item) => item.id === id || item.slug === id);
    if (!news || news.published === false) {
      return NextResponse.json({ error: 'Notícia não publicada' }, { status: 404 });
    }

    news.views = (news.views || 0) + 1;
    const saved = saveDatabase(data);
    if (!saved) {
      return NextResponse.json({ error: 'Não foi possível registrar a visualização' }, { status: 500 });
    }

    return NextResponse.json({ views: news.views });
  } catch {
    return NextResponse.json({ error: 'Falha ao registrar visualização' }, { status: 400 });
  }
}
