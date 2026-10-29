import { NextResponse } from 'next/server';
import { verifyAdminSession, validateCsrfOrigin } from '@/lib/auth';
import { UserAccount } from '@/types';
import { railsApiFetch } from '@/lib/rails-backend';

function formatCpf(digits: string): string {
  const clean = digits.replace(/\D/g, '').slice(0, 11);
  if (clean.length !== 11) return clean;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

function isValidCpfFormat(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  return true;
}

interface RailsUserApiItem {
  id: string | number;
  nome: string;
  cpf: string;
  perfil_nome?: string;
  perfil_id?: number;
  ativo?: boolean;
  created_at?: string;
}

interface RailsPerfilApiItem {
  id: number;
  nome: string;
  descricao?: string;
}

// GET: Lista todos os usuários cadastrados e perfis disponíveis via API Backend v1
export async function GET() {
  const auth = await verifyAdminSession();
  if (!auth.valid) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
  }

  if (!auth.isGestor) {
    return NextResponse.json({ error: 'Apenas o Gestor Geral pode visualizar os usuários cadastrados' }, { status: 403 });
  }

  try {
    const [resUsers, resPerfis] = await Promise.all([
      railsApiFetch<{ success: boolean; data: { items: RailsUserApiItem[] } }>('/usuarios?page=all'),
      railsApiFetch<{ success: boolean; data: { items: RailsPerfilApiItem[] } }>('/perfis?page=all'),
    ]);

    if (resUsers.ok && resUsers.data?.data?.items) {
      const users: UserAccount[] = resUsers.data.data.items.map((u: RailsUserApiItem) => ({
        id: String(u.id),
        name: u.nome,
        cpf: formatCpf(u.cpf),
        profileType: u.perfil_nome || 'Operador',
        profileId: u.perfil_id,
        role: u.perfil_nome === 'Administrador' ? 'gestor' : 'operador',
        active: u.ativo !== false,
        createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '',
      }));

      const perfis = resPerfis.ok && resPerfis.data?.data?.items ? resPerfis.data.data.items : [];

      return NextResponse.json({ success: true, users, perfis, source: 'backend' });
    }

    return NextResponse.json(
      { error: resUsers.errors?.join(', ') || resUsers.message || 'Falha ao buscar usuários do backend' },
      { status: resUsers.status || 502 }
    );
  } catch (err) {
    console.error('API Backend indisponível para listagem de usuários:', err);
    return NextResponse.json(
      { error: 'Não foi possível conectar ao backend para listar os usuários' },
      { status: 502 }
    );
  }
}

// POST: Cadastra novo usuário na API Backend v1
export async function POST(request: Request) {
  try {
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: 'Origem da requisição inválida' }, { status: 403 });
    }

    const auth = await verifyAdminSession();
    if (!auth.valid || !auth.isGestor) {
      return NextResponse.json({ error: 'Acesso restrito ao Gestor Geral' }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const cpf = typeof body?.cpf === 'string' ? body.cpf.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const profileId = typeof body?.profileId === 'number' ? body.profileId : Number(body?.profileId) || 1;

    if (!name || name.length < 3) {
      return NextResponse.json({ error: 'Nome completo deve ter pelo menos 3 caracteres' }, { status: 400 });
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (!isValidCpfFormat(cleanCpf)) {
      return NextResponse.json({ error: 'CPF inválido. Forneça 11 dígitos válidos.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'A senha deve conter no mínimo 6 caracteres' }, { status: 400 });
    }

    const railsRes = await railsApiFetch<{ success: boolean; data: RailsUserApiItem }>('/usuarios', {
      method: 'POST',
      body: JSON.stringify({
        usuario: {
          nome: name,
          cpf: cleanCpf,
          password,
          password_confirmation: password,
          perfil_id: profileId,
          ativo: true,
        },
      }),
    });

    if (railsRes.ok && railsRes.data?.data) {
      const u = railsRes.data.data;
      return NextResponse.json({
        success: true,
        message: 'Usuário cadastrado com sucesso no backend!',
        user: {
          id: String(u.id),
          name: u.nome,
          cpf: formatCpf(u.cpf),
          profileType: u.perfil_nome || 'Operador',
          profileId: u.perfil_id,
          role: u.perfil_nome === 'Administrador' ? 'gestor' : 'operador',
          active: u.ativo !== false,
          createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '',
        },
      });
    }

    return NextResponse.json(
      { error: railsRes.errors?.join(', ') || railsRes.message || 'Erro ao cadastrar na API Backend' },
      { status: railsRes.status || 422 }
    );
  } catch (error) {
    console.error('Erro no POST /api/admin/users:', error);
    return NextResponse.json({ error: 'Erro ao processar cadastro de usuário' }, { status: 500 });
  }
}

// PATCH: Atualiza status (ativo/inativo) ou redefine senha
export async function PATCH(request: Request) {
  try {
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
    }

    const auth = await verifyAdminSession();
    if (!auth.valid || !auth.isGestor) {
      return NextResponse.json({ error: 'Acesso restrito ao Gestor Geral' }, { status: 403 });
    }

    const body = await request.json();
    const id = body?.id ? String(body.id) : '';
    if (!id) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    const patchData: Record<string, string | number | boolean> = {};
    if (typeof body.active === 'boolean') {
      patchData.ativo = body.active;
    }
    if (typeof body.newPassword === 'string' && body.newPassword.length >= 6) {
      patchData.password = body.newPassword;
      patchData.password_confirmation = body.newPassword;
    }
    if (body.profileId) {
      patchData.perfil_id = Number(body.profileId);
    }

    const railsRes = await railsApiFetch(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ usuario: patchData }),
    });

    if (railsRes.ok) {
      return NextResponse.json({
        success: true,
        message: 'Usuário atualizado com sucesso na API Backend!',
        user: railsRes.data,
      });
    }

    return NextResponse.json(
      { error: railsRes.errors?.join(', ') || railsRes.message || 'Erro ao atualizar no Backend' },
      { status: railsRes.status || 422 }
    );
  } catch (error) {
    console.error('Erro no PATCH /api/admin/users:', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// DELETE: Remove um usuário
export async function DELETE(request: Request) {
  try {
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
    }

    const auth = await verifyAdminSession();
    if (!auth.valid || !auth.isGestor) {
      return NextResponse.json({ error: 'Acesso restrito ao Gestor Geral' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    const railsRes = await railsApiFetch(`/usuarios/${id}`, { method: 'DELETE' });
    if (railsRes.ok || railsRes.status === 204) {
      return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso da API Backend' });
    }

    return NextResponse.json(
      { error: railsRes.errors?.join(', ') || railsRes.message || 'Erro ao excluir usuário na API Backend' },
      { status: railsRes.status || 422 }
    );
  } catch (error) {
    console.error('Erro no DELETE /api/admin/users:', error);
    return NextResponse.json({ error: 'Erro ao remover usuário' }, { status: 500 });
  }
}
