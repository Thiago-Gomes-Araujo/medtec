import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { ItemEditorial, EtapaEditorial } from '@/types';
import { verifyAdminSession, validateCsrfOrigin } from '@/lib/auth';

const ETAPAS: EtapaEditorial[] = ['Rascunho', 'Revisão Jurídica/LGPD', 'Aprovado', 'Publicado'];

export async function GET() {
  try {
    const db = getDatabase();
    const news = db.news || [];

    // Deriva itens editoriais da base dinâmica de notícias do CMS
    const items: ItemEditorial[] = news.map((item, index) => {
      const isPublished = item.published !== false;
      let etapa: EtapaEditorial = isPublished ? 'Publicado' : 'Rascunho';
      if (!isPublished && item.urgent) {
        etapa = 'Revisão Jurídica/LGPD';
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
      news,
    });
  } catch (error) {
    console.error('Erro na rota /api/editorial:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar fluxo editorial' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Validação CSRF de origem
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Origem da requisição inválida' }, { status: 403 });
    }

    // 2. Validação rigorosa de autenticação e permissão de gestor no servidor
    const auth = await verifyAdminSession();
    if (!auth.valid || !auth.isGestor) {
      return NextResponse.json(
        { success: false, error: 'Apenas usuários com perfil de Gestor podem aprovar notícias.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { newsId } = body;

    if (!newsId || typeof newsId !== 'string') {
      return NextResponse.json({ success: false, error: 'ID da notícia não fornecido ou inválido' }, { status: 400 });
    }

    const db = getDatabase();
    const news = db.news || [];
    const index = news.findIndex((n) => n.id === newsId);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Notícia não encontrada' }, { status: 404 });
    }

    // Marca como aprovada/publicada
    news[index] = {
      ...news[index],
      published: true,
      publishedAt: news[index].publishedAt || new Date().toLocaleDateString('pt-BR'),
    };

    const saved = saveDatabase({ ...db, news });
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Falha ao persistir aprovação no disco' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notícia aprovada e publicada com sucesso no portal oficial MEDTEC.',
      item: news[index],
    });
  } catch (error) {
    console.error('Erro ao aprovar notícia no endpoint /api/editorial:', error);
    return NextResponse.json({ success: false, error: 'Falha interna ao processar aprovação' }, { status: 500 });
  }
}

