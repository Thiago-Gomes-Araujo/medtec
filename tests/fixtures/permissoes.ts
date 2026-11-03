/**
 * Permissões simuladas do /auth/me para os perfis do seed (Jornalista, Gestor e Administrador).
 */

import type { AuthUser, Permissoes } from '../../src/lib/api/types';

const TODAS = ['index', 'show', 'create', 'update', 'destroy'];
const MODERACAO = [...TODAS, 'publicar', 'reprovar', 'despublicar'];

// Permissões simuladas no formato do /auth/me: perfil somado às extras.
export const PERFIS: Record<'Jornalista' | 'Gestor' | 'Administrador', Pick<AuthUser, 'perfil_id' | 'perfil_nome' | 'admin' | 'permissoes'>> = {
  Jornalista: {
    perfil_id: 1, perfil_nome: 'Jornalista', admin: false,
    permissoes: {
      a_avisos: ['index', 'show', 'create', 'update'],
      a_tipos_aviso: ['index'],
      fotos_galeria: ['index', 'show', 'create'],
      categorias_galeria: ['index'],
    },
  },
  Gestor: {
    perfil_id: 2, perfil_nome: 'Gestor', admin: false,
    permissoes: {
      n_noticias: ['create', 'destroy', 'index', 'show', 'update'],
      n_categorias_noticia: ['index'],
      pj_projetos: [...MODERACAO, 'remover_anexo'],
      pj_temas: TODAS, pj_membros: TODAS,
      d_duvidas: MODERACAO, d_categorias_duvida: TODAS,
      d_duvidas_visitante: ['index', 'show', 'responder'],
      p_relatos: ['index', 'show', 'publicar', 'reprovar', 'despublicar'],
      b_banners: TODAS,
      g_cidades: ['index'],
      usuarios: TODAS,
      usuarios_permissoes_extras: ['show', 'update'],
      perfis: ['index'],
    },
  },
  Administrador: {
    perfil_id: 3, perfil_nome: 'Administrador', admin: true,
    permissoes: Object.fromEntries([
      'n_noticias', 'd_duvidas', 'p_relatos', 'c_conquistas_aluno', 'pj_projetos',
    ].map(modulo => [modulo, [...MODERACAO, ...(modulo === 'pj_projetos' ? ['remover_anexo'] : [])]]).concat([
      'n_categorias_noticia', 'a_avisos', 'a_tipos_aviso', 'fotos_galeria', 'categorias_galeria', 'b_banners',
      'p_professores', 'p_disciplinas', 'c_categorias_conquista_aluno', 'pj_temas', 'pj_membros',
      'd_categorias_duvida', 'g_estados', 'g_cidades', 'usuarios', 'perfis',
    ].map(modulo => [modulo, TODAS]), [
      ['d_duvidas_visitante', ['index', 'show', 'destroy', 'responder']],
      ['canais_contato', ['index', 'update_all']],
      ['usuarios_permissoes_extras', ['show', 'update']],
      ['perfis_permissoes', ['show', 'update']],
    ])) as Permissoes,
  },
};

export function usuarioMe(perfil: keyof typeof PERFIS, overrides: Partial<AuthUser> = {}): AuthUser {
  return { id: 10 + PERFIS[perfil].perfil_id, nome: `${perfil} de teste`, cpf: '00000000000', ativo: true, ...PERFIS[perfil], ...overrides };
}
