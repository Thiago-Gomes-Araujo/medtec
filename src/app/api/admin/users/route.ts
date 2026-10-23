import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { verifyAdminSession, hashPassword, validateCsrfOrigin } from '@/lib/auth';
import { UserAccount, UserProfileType } from '@/types';

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

// GET: Lista todos os usuários operadores cadastrados
export async function GET() {
  const auth = await verifyAdminSession();
  if (!auth.valid) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
  }

  if (!auth.isGestor) {
    return NextResponse.json({ error: 'Apenas o Gestor Geral pode visualizar os usuários cadastrados' }, { status: 403 });
  }

  const db = getDatabase();
  const users = (db.users || []).map((u) => ({
    id: u.id,
    name: u.name,
    cpf: u.cpf,
    profileType: u.profileType,
    role: u.role,
    active: u.active !== false,
    createdAt: u.createdAt,
  }));

  return NextResponse.json({ success: true, users });
}

// POST: Cadastra novo operador
export async function POST(request: Request) {
  try {
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: 'Origem da requisição inválida' }, { status: 403 });
    }

    const auth = await verifyAdminSession();
    if (!auth.valid) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    if (!auth.isGestor) {
      return NextResponse.json({ error: 'Apenas o Gestor Geral pode cadastrar novos usuários' }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const rawCpf = typeof body?.cpf === 'string' ? body.cpf.trim() : '';
    const profileType = (body?.profileType as UserProfileType) || 'Operador de Conteúdo';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!name || name.length < 3) {
      return NextResponse.json({ error: 'Informe o nome completo do operador' }, { status: 400 });
    }

    const cleanCpf = rawCpf.replace(/\D/g, '');
    if (!isValidCpfFormat(cleanCpf)) {
      return NextResponse.json({ error: 'CPF inválido. Certifique-se de digitar os 11 dígitos' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'A senha de acesso deve conter pelo menos 6 caracteres' }, { status: 400 });
    }

    const db = getDatabase();
    const existingUsers = db.users || [];

    // Checa duplicação de CPF
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
      profileType,
      role: 'operador',
      active: true,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      passwordHash,
    };

    const updatedUsers = [...existingUsers, newUser];
    const saved = saveDatabase({ ...db, users: updatedUsers });

    if (!saved) {
      return NextResponse.json({ error: 'Erro ao salvar operador no banco de dados' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Operador cadastrado com sucesso!',
      user: {
        id: newUser.id,
        name: newUser.name,
        cpf: newUser.cpf,
        profileType: newUser.profileType,
        role: newUser.role,
        active: newUser.active,
        createdAt: newUser.createdAt,
      },
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
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    const db = getDatabase();
    const users = db.users || [];
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const targetUser = { ...users[index] };

    // Atualiza status se fornecido
    if (typeof body.active === 'boolean') {
      targetUser.active = body.active;
    }

    // Atualiza tipo de perfil se fornecido
    if (body.profileType) {
      targetUser.profileType = body.profileType;
    }

    // Redefine senha se fornecida
    if (typeof body.newPassword === 'string' && body.newPassword.length >= 6) {
      targetUser.passwordHash = hashPassword(body.newPassword);
    }

    users[index] = targetUser;
    const saved = saveDatabase({ ...db, users });

    if (!saved) {
      return NextResponse.json({ error: 'Falha ao atualizar dados do usuário' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário atualizado com sucesso!',
      user: {
        id: targetUser.id,
        name: targetUser.name,
        cpf: targetUser.cpf,
        profileType: targetUser.profileType,
        role: targetUser.role,
        active: targetUser.active,
        createdAt: targetUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Erro no PATCH /api/admin/users:', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// DELETE: Remove um operador
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

    const db = getDatabase();
    const users = db.users || [];
    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const saved = saveDatabase({ ...db, users: filtered });
    if (!saved) {
      return NextResponse.json({ error: 'Falha ao remover usuário do banco' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro no DELETE /api/admin/users:', error);
    return NextResponse.json({ error: 'Erro ao remover usuário' }, { status: 500 });
  }
}
