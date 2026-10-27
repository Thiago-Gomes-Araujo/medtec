import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { FAQS_DATA } from '@/data/faqsData';
import { FaqItem, FaqPersona } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria') || '';
    const busca = searchParams.get('busca') || '';
    const persona = searchParams.get('persona') || '';

    const db = getDatabase();
    const sourceFaqs: FaqItem[] = (db.faqs && db.faqs.length > 0) ? db.faqs : FAQS_DATA;

    let items = sourceFaqs;

    if (categoria && categoria !== 'Todas as Dúvidas' && categoria !== 'todas') {
      items = items.filter((f) => f.category.toLowerCase() === categoria.toLowerCase());
    }

    if (persona && persona !== 'todos') {
      items = items.filter((f) => f.personas.includes(persona as Exclude<FaqPersona, 'todos'>));
    }

    if (busca) {
      const q = busca.toLowerCase().trim();
      items = items.filter((f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      total: items.length,
      items,
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      (error as { digest?: string }).digest === 'NEXT_PRERENDER_INTERRUPTED'
    ) {
      throw error;
    }
    console.error('Erro na rota /api/faqs:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar dúvidas frequentes' }, { status: 500 });
  }
}
