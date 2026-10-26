import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { DatabaseSchema } from '@/types';
import { verifyAdminSession, validateCsrfOrigin } from '@/lib/auth';
import { railsApiFetch } from '@/lib/rails-backend';

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

  if (candidate.users !== undefined && !Array.isArray(candidate.users)) {
    return false;
  }

  return true;
}

export async function GET() {
  // 1. Validação rigorosa de autenticação de sessão administrativa
  const auth = await verifyAdminSession();
  if (!auth.valid) {
    return NextResponse.json(
      { error: 'Acesso não autorizado. Autentique-se para acessar os dados administrativos.' },
      { status: 401 }
    );
  }

  const data = getDatabase();

  // 2. Se for Gestor Geral, busca os usuários reais da API Rails v1
  let sanitizedUsers: any[] = [];
  if (auth.isGestor) {
    try {
      const railsRes = await railsApiFetch<{ success: boolean; data: { items: any[] } }>('/usuarios?page=all');
      if (railsRes.ok && railsRes.data?.data?.items) {
        sanitizedUsers = railsRes.data.data.items.map((u: any) => {
          const clean = (u.cpf || '').replace(/\D/g, '').slice(0, 11);
          const formattedCpf = clean.length === 11
            ? `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
            : u.cpf;
          return {
            id: String(u.id),
            name: u.nome,
            cpf: formattedCpf,
            profileType: u.perfil_nome || 'Operador',
            profileId: u.perfil_id,
            role: u.perfil_nome === 'Administrador' ? 'gestor' : 'operador',
            active: u.ativo !== false,
            createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '',
          };
        });
      }
    } catch {
      // fallback
    }

    // Se o Rails não retornou usuários, recorre ao banco local
    if (sanitizedUsers.length === 0 && data.users) {
      sanitizedUsers = (data.users || []).map((user) => ({
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        profileType: user.profileType,
        profileId: user.profileId,
        role: user.role,
        active: user.active !== false,
        createdAt: user.createdAt,
      }));
    }
  }

  const responseData: DatabaseSchema = {
    ...data,
    users: sanitizedUsers as unknown as DatabaseSchema['users'],
  };

  return NextResponse.json(responseData);
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
        { error: 'Acesso não autorizado. Autentique-se para realizar alterações.' },
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

    // Preserva SEMPRE os usuários existentes no servidor a partir do banco atual,
    // garantindo que nenhum passwordHash seja sobrescrito ou apagado por dados vindos da requisição.
    // O gerenciamento de operadores é exclusivo do endpoint dedicado /api/admin/users.
    body.users = current.users;

    // Se o usuário autenticado não for Gestor Geral, preserva configurações críticas e restringe ao escopo do seu perfil
    if (!auth.isGestor) {
      body.siteInfo = current.siteInfo;
      body.stats = current.stats;
      body.socials = current.socials;

      const profile = auth.profileType;
      if (profile === 'Editor de Notícias') {
        // Operador de notícias só altera o array de notícias
        body.gallery = current.gallery;
        body.banners = current.banners;
        body.announcements = current.announcements;
      } else if (profile === 'Curador de Fotos') {
        // Curador de fotos só altera fotos e galeria
        body.news = current.news;
        body.announcements = current.announcements;
      } else if (profile === 'Publicador de Avisos') {
        // Publicador de avisos só altera avisos
        body.news = current.news;
        body.gallery = current.gallery;
        body.banners = current.banners;
      }
    }

    const success = saveDatabase(body);
    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar os dados no disco' }, { status: 500 });
    }

    // Prepara payload de resposta sem expor passwordHash ao cliente
    const responseUsers = auth.isGestor
      ? (current.users || []).map((user) => ({
          id: user.id,
          name: user.name,
          cpf: user.cpf,
          profileType: user.profileType,
          role: user.role,
          active: user.active !== false,
          createdAt: user.createdAt,
        }))
      : [];

    const responsePayload: DatabaseSchema = {
      ...body,
      users: responseUsers as unknown as DatabaseSchema['users'],
    };

    return NextResponse.json({ message: 'Dados salvos com sucesso', data: responsePayload });
  } catch (error) {
    console.error('Erro no endpoint PUT /api/data:', error);
    return NextResponse.json({ error: 'Falha ao processar requisição' }, { status: 400 });
  }
}

