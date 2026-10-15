import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { DatabaseSchema } from '@/types';
import { verifyAdminSession, validateCsrfOrigin } from '@/lib/auth';

function isValidDatabaseSchema(body: unknown): body is DatabaseSchema {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }

  const candidate = body as Partial<DatabaseSchema>;

  if (!candidate.siteInfo || typeof candidate.siteInfo !== 'object' || Array.isArray(candidate.siteInfo)) {
    return false;
  }

  if (!candidate.stats || typeof candidate.stats !== 'object' || Array.isArray(candidate.stats)) {
    return false;
  }

  if (!candidate.socials || typeof candidate.socials !== 'object' || Array.isArray(candidate.socials)) {
    return false;
  }

  if (!Array.isArray(candidate.announcements)) {
    return false;
  }

  if (!Array.isArray(candidate.news)) {
    return false;
  }

  if (!Array.isArray(candidate.gallery)) {
    return false;
  }

  if (!Array.isArray(candidate.banners)) {
    return false;
  }

  return true;
}

export async function GET() {
  const data = getDatabase();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  try {
    // 1. Defesa em profundidade contra CSRF
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: 'Origem da requisição inválida' }, { status: 403 });
    }

    // 2. Validação rigorosa de autenticação no servidor
    const auth = await verifyAdminSession();
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Autentique-se como gestor para realizar alterações.' },
        { status: 401 }
      );
    }

    // 3. Validação do payload
    const body: unknown = await request.json();
    if (!isValidDatabaseSchema(body)) {
      return NextResponse.json(
        { error: 'Payload inválido: a estrutura dos dados fornecidos não atende ao esquema esperado.' },
        { status: 400 }
      );
    }

    const current = getDatabase();
    const viewsById = new Map(current.news.map((item) => [item.id, item.views || 0]));
    body.news = body.news.map((item) => ({
      ...item,
      views: viewsById.get(item.id) ?? item.views ?? 0,
    }));

    const success = saveDatabase(body);
    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar os dados no disco' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Dados salvos com sucesso', data: body });
  } catch (error) {
    console.error('Erro no endpoint PUT /api/data:', error);
    return NextResponse.json({ error: 'Falha ao processar requisição' }, { status: 400 });
  }
}

