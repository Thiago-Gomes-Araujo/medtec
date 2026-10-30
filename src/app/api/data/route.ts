import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { DatabaseSchema, UserAccount } from '@/types';
import { verifyAdminSession, validateCsrfOrigin } from '@/lib/auth';
import { railsApiFetch } from '@/lib/rails-backend';

interface RailsUserApiItem {
  id: string | number;
  nome: string;
  cpf?: string;
  perfil_nome?: string;
  perfil_id?: number;
  ativo?: boolean;
  created_at?: string;
}

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

  if (candidate.projects !== undefined && !Array.isArray(candidate.projects)) {
    return false;
  }

  if (candidate.faqs !== undefined && !Array.isArray(candidate.faqs)) {
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
  let sanitizedUsers: UserAccount[] = [];
  if (auth.isGestor) {
    try {
      const railsRes = await railsApiFetch<{ success: boolean; data: { items: RailsUserApiItem[] } }>('/usuarios?page=all');
      if (railsRes.ok && railsRes.data?.data?.items) {
        sanitizedUsers = railsRes.data.data.items.map((u: RailsUserApiItem) => {
          const clean = (u.cpf || '').replace(/\D/g, '').slice(0, 11);
          const formattedCpf = clean.length === 11
            ? `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
            : u.cpf || '';
          return {
            id: String(u.id),
            name: u.nome,
            cpf: formattedCpf,
            profileType: u.perfil_nome || 'Operador',
            profileId: u.perfil_id,
            role: (u.perfil_nome === 'Administrador' ? 'gestor' : 'operador') as 'gestor' | 'operador',
            active: u.ativo !== false,
            createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '',
          };
        });
      }
    } catch {
      // fallback
    }

    }

  const responseData: DatabaseSchema = {
    ...data,
    users: sanitizedUsers,
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

    // Entidades de negócio não são persistidas em db.json.
    // Usuários, avisos, galeria e canais são de responsabilidade da API Backend v1.
    body.users = [];
    body.announcements = [];
    body.gallery = [];
    body.news = [];
    body.projects = [];
    body.faqs = [];

    // Se o usuário autenticado não for Gestor Geral, preserva configurações institucionais
    if (!auth.isGestor) {
      const current = getDatabase();
      body.siteInfo = current.siteInfo;
      body.stats = current.stats;
      body.socials = current.socials;
      body.banners = current.banners;
    }

    const success = saveDatabase(body);
    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar os dados no disco' }, { status: 500 });
    }

    const responsePayload: DatabaseSchema = {
      ...body,
      users: [],
    };

    return NextResponse.json({ message: 'Dados salvos com sucesso', data: responsePayload });
  } catch (error) {
    console.error('Erro no endpoint PUT /api/data:', error);
    return NextResponse.json({ error: 'Falha ao processar requisição' }, { status: 400 });
  }
}

