import { NextResponse } from 'next/server';
import { EtapaEditorial } from '@/types';
import { verifyAdminSession, validateCsrfOrigin } from '@/lib/auth';

const ETAPAS: EtapaEditorial[] = ['Rascunho', 'Revisão Jurídica/LGPD', 'Aprovado', 'Publicado'];

export async function GET() {
  return NextResponse.json({
    success: true,
    total: 0,
    etapas: ETAPAS,
    items: [],
    news: [],
    message: 'Endpoints oficiais de notícias (/noticias) em desenvolvimento no backend.',
  });
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
        { success: false, error: 'Apenas usuários com perfil de Gestor podem gerenciar notícias.' },
        { status: 403 }
      );
    }

    // Não simula aprovação/recusa sem suporte real do backend
    return NextResponse.json(
      {
        success: false,
        error:
          'A aprovação e publicação de notícias depende dos endpoints da API Backend (/noticias), que estão em desenvolvimento pela equipe de backend.',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Erro no endpoint /api/editorial:', error);
    return NextResponse.json({ success: false, error: 'Falha interna ao processar decisão editorial' }, { status: 500 });
  }
}
