import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { verifyAdminSession, hashPassword, validateCsrfOrigin } from '@/lib/auth';
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

// GET: Lista todos os usuários cadastrados e perfis disponíveis via API Rails v1
export async function GET() {
  const auth = await verifyAdminSession();
  if (!auth.valid) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
  }

  if (!auth.isGestor) {
    return NextResponse.json({ error: 'Apenas o Gestor Geral pode visualizar os usuários cadastrados' }, { status: 403 });
  }

  // 1. Tenta buscar da API Rails v1
  try {
    const [resUsers, resPerfis] = await Promise.all([
      railsApiFetch<{ success: boolean; data: { items: any[] } }>('/usuarios?page=all'),
      railsApiFetch<{ success: boolean; data: { items: any[] } }>('/perfis?page=all'),
    ]);

    if (resUsers.ok && resUsers.data?.data?.items) {
      const users: UserAccount[] = resUsers.data.data.items.map((u: any) => ({
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

      return NextResponse.json({ success: true, users, perfis, source: 'rails' });
    }
  } catch (err) {
    console.warn('API Rails indisponível para listagem de usuários, recorrendo ao banco local:', err);
  }

  // Fallback para banco local
  const db = getDatabase();
  const users = (db.users || []).map((u) => ({
    id: u.id,
    name: u.name,
    cpf: u.cpf,
    profileType: u.profileType,
    profileId: u.profileId,
    role: u.role,
    active: u.active !== false,
    createdAt: u.createdAt,
  }));

  return NextResponse.json({ success: true, users, perfis: [], source: 'local' });
}

// POST: Cadastra novo usuário na API Rails v1
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
    const rawCpf = typeof body?.cpf === 'string' ? body.cpf.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    let profileId = Number(body?.profileId || body?.perfil_id);

    if (!name || name.length < 3) {
      return NextResponse.json({ error: 'Informe o nome completo do usuário' }, { status: 400 });
    }

    const cleanCpf = rawCpf.replace(/\D/g, '');
    if (!isValidCpfFormat(cleanCpf)) {
      return NextResponse.json({ error: 'CPF inválido. Certifique-se de digitar os 11 dígitos' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'A senha de acesso deve conter pelo menos 6 caracteres' }, { status: 400 });
    }

    // Se profileId não veio, busca padrão (Jornalista id 1 ou primeiro perfil)
    if (!profileId || isNaN(profileId)) {
      profileId = 1;
    }

    // 1. Tenta criar na API Rails v1
    const railsRes = await railsApiFetch<any>('/usuarios', {
      method: 'POST',
      body: JSON.stringify({
        nome: name,
        cpf: cleanCpf,
        password,
        perfil_id: profileId,
        ativo: true,
      }),
    });

    if (railsRes.ok && railsRes.data) {
      const u = railsRes.data;
      return NextResponse.json({
        success: true,
        message: 'Usuário cadastrado com sucesso na API Rails!',
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

    if (!railsRes.ok && railsRes.errors && railsRes.errors.length > 0) {
      return NextResponse.json(
        { error: railsRes.errors.join(', ') || railsRes.message || 'Erro ao cadastrar na API Rails' },
        { status: railsRes.status || 422 }
      );
    }

    // Fallback para banco local se a API Rails estiver offline
    const db = getDatabase();
    const existingUsers = db.users || [];
    const duplicate = existingUsers.some((u) => u.cpf.replace(/\D/g, '') === cleanCpf);
    if (duplicate) {
      return NextResponse.json({ error: 'Já existe um operador cadastrado com este CPF' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const formattedCpf = formatCpf(cleanCpf);

    const newUser: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      cpf: formattedCpf,
      profileType: body?.profileType || 'Operador de Conteúdo',
      profileId,
      role: 'operador',
      active: true,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      passwordHash,
    };

    saveDatabase({ ...db, users: [...existingUsers, newUser] });

    return NextResponse.json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      user: newUser,
    });
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

    const isNumericId = /^\d+$/.test(id);

    // Se é ID numérico do Rails, executa PATCH no Rails
    if (isNumericId) {
      const patchData: Record<string, any> = {};
      if (typeof body.active === 'boolean') {
        patchData.ativo = body.active;
      }
      if (typeof body.newPassword === 'string' && body.newPassword.length >= 6) {
        patchData.password = body.newPassword;
      }
      if (body.profileId) {
        patchData.perfil_id = Number(body.profileId);
      }

      const railsRes = await railsApiFetch(`/usuarios/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patchData),
      });

      if (railsRes.ok) {
        return NextResponse.json({
          success: true,
          message: 'Usuário atualizado com sucesso na API Rails!',
          user: railsRes.data,
        });
      }

      return NextResponse.json(
        { error: railsRes.errors?.join(', ') || railsRes.message || 'Erro ao atualizar no Rails' },
        { status: railsRes.status || 422 }
      );
    }

    // Fallback para banco local
    const db = getDatabase();
    const users = db.users || [];
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const targetUser = { ...users[index] };
    if (typeof body.active === 'boolean') targetUser.active = body.active;
    if (body.profileType) targetUser.profileType = body.profileType;
    if (typeof body.newPassword === 'string' && body.newPassword.length >= 6) {
      targetUser.passwordHash = hashPassword(body.newPassword);
    }

    users[index] = targetUser;
    saveDatabase({ ...db, users });

    return NextResponse.json({
      success: true,
      message: 'Usuário atualizado com sucesso!',
      user: targetUser,
    });
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

    const isNumericId = /^\d+$/.test(id);

    // Se é ID numérico do Rails, executa DELETE no Rails
    if (isNumericId) {
      const railsRes = await railsApiFetch(`/usuarios/${id}`, { method: 'DELETE' });
      if (railsRes.ok || railsRes.status === 204) {
        return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso da API Rails' });
      }

      return NextResponse.json(
        { error: railsRes.errors?.join(', ') || railsRes.message || 'Erro ao excluir usuário na API Rails' },
        { status: railsRes.status || 422 }
      );
    }

    // Fallback para banco local
    const db = getDatabase();
    const users = db.users || [];
    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    saveDatabase({ ...db, users: filtered });
    return NextResponse.json({ success: true, message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro no DELETE /api/admin/users:', error);
    return NextResponse.json({ error: 'Erro ao remover usuário' }, { status: 500 });
  }
}
