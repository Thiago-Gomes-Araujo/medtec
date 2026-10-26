import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { ItemEditorial, EtapaEditorial } from '@/types';

const ETAPAS: EtapaEditorial[] = ['Rascunho', 'Revisão Jurídica/LGPD', 'Aprovado', 'Publicado'];

export async function GET() {
  try {
    const db = getDatabase();
    const news = db.news || [];

    // Deriva itens editoriais da base dinâmica de notícias do CMS
    const items: ItemEditorial[] = news.map((item, index) => {
      let etapa: EtapaEditorial = 'Publicado';
      if (!item.published) {
        etapa = index % 2 === 0 ? 'Rascunho' : 'Revisão Jurídica/LGPD';
      } else if (item.urgent) {
        etapa = 'Publicado';
      }

      return {
        id: index + 1,
        titulo: item.title,
        tipo: item.category || 'Notícia',
        autor: item.author || 'Redação SEDUC',
        etapa,
        anexos: item.coverImage ? [item.coverImage] : [],
        atualizado: item.publishedAt || new Date().toLocaleDateString('pt-BR'),
      };
    });

    return NextResponse.json({
      success: true,
      total: items.length,
      etapas: ETAPAS,
      items,
    });
  } catch (error) {
    console.error('Erro na rota /api/editorial:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar fluxo editorial' }, { status: 500 });
  }
}
