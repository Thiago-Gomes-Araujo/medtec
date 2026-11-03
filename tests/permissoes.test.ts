/**
 * Permissões do painel lidas do GET /auth/me (ROTAS_FRONT.md, seções 1, 3, 5, 6 e 9).
 * Executado pelo test runner nativo do Node.js: npx tsx --test tests/permissoes.test.ts
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiFetch } from '../src/lib/api/client';
import { clearStoredTokens, getStoredAccessToken, setStoredTokens } from '../src/lib/api/tokens';
import { medtecApi } from '../src/lib/api/index';
import {
  SEM_PERMISSOES, definirPermissoes, lerPermissoes, limparPermissoes, obterPermissoes, pode,
} from '../src/lib/api/permissoes';
import type { AuthUser, Permissoes } from '../src/lib/api/types';

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

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const originalFetch = globalThis.fetch;

describe('Sessão: permissões do /auth/me', () => {
  beforeEach(() => { clearStoredTokens(); });
  afterEach(() => { globalThis.fetch = originalFetch; clearStoredTokens(); });

  it('pode(modulo, acao) só libera as ações listadas', () => {
    definirPermissoes(usuarioMe('Gestor'));
    assert.equal(pode('n_noticias', 'index'), true);
    assert.equal(pode('n_noticias', 'publicar'), false);
    assert.equal(pode('usuarios', 'destroy'), true);
    assert.equal(pode('modulo_inexistente', 'index'), false);
    assert.equal(obterPermissoes().admin, false);
    definirPermissoes(usuarioMe('Administrador'));
    assert.equal(pode('n_noticias', 'publicar'), true);
    assert.equal(obterPermissoes().admin, true);
  });

  it('formato inesperado ou ausente vira "sem permissão"', () => {
    assert.deepEqual(lerPermissoes(undefined), { admin: false, permissoes: {} });
    assert.deepEqual(lerPermissoes({ admin: 'true' as unknown as boolean, permissoes: ['index'] as unknown as Permissoes }), { admin: false, permissoes: {} });
    assert.deepEqual(lerPermissoes({ permissoes: { n_noticias: 'index' as unknown as string[], a_avisos: ['index', 3 as unknown as string] } }), { admin: false, permissoes: { a_avisos: ['index'] } });
    definirPermissoes({ id: 1, nome: 'Sem campos novos', cpf: '0', ativo: true, perfil_id: 3, perfil_nome: 'Administrador' });
    assert.equal(pode('n_noticias', 'index'), false, 'o nome do perfil não libera nada');
  });

  it('GET /auth/me guarda admin e permissoes', async () => {
    setStoredTokens({ access_token: 'a', refresh_token: 'r' });
    globalThis.fetch = async () => json({ success: true, message: 'Usuário autenticado', data: usuarioMe('Gestor') });
    await medtecApi.auth.me();
    assert.equal(pode('pj_projetos', 'remover_anexo'), true);
    assert.equal(pode('n_noticias', 'reprovar'), false);
  });

  it('login chama o /auth/me com o token novo', async () => {
    const urls: string[] = [];
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      urls.push(url);
      if (url.endsWith('/auth/login')) return json({ success: true, data: { access_token: 'novo', refresh_token: 'r' } });
      assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer novo');
      return json({ success: true, data: usuarioMe('Administrador') });
    };
    await medtecApi.auth.login('000.000.000-00', 'senha-ficticia');
    assert.deepEqual(urls.map(url => url.replace(/^.*\/api\/v1/, '')), ['/auth/login', '/auth/me']);
    assert.equal(obterPermissoes().admin, true);
  });

  it('cada refresh relê o /auth/me e troca as permissões', async () => {
    definirPermissoes(usuarioMe('Administrador'));
    setStoredTokens({ access_token: 'velho', refresh_token: 'r1' });
    const urls: string[] = [];
    globalThis.fetch = async (input, init) => {
      const url = String(input).replace(/^.*\/api\/v1/, '');
      urls.push(url);
      const token = new Headers(init?.headers).get('Authorization');
      if (url === '/auth/refresh_token') return json({ success: true, data: { access_token: 'novo', refresh_token: 'r2' } });
      if (url === '/auth/me') return json({ success: true, data: usuarioMe('Jornalista') });
      if (token === 'Bearer velho') return json({ success: false, message: 'Token expirado', errors: ['token_expirado'] }, 401);
      return json({ success: true, data: { items: [] } });
    };
    await apiFetch('/a_avisos');
    assert.deepEqual(urls, ['/a_avisos', '/auth/refresh_token', '/auth/me', '/a_avisos']);
    assert.equal(obterPermissoes().admin, false);
    assert.equal(pode('a_avisos', 'create'), true);
    assert.equal(pode('n_noticias', 'index'), false);
  });

  it('falha do /auth/me depois do refresh mantém as permissões já confirmadas', async () => {
    definirPermissoes(usuarioMe('Gestor'));
    setStoredTokens({ access_token: 'velho', refresh_token: 'r1' });
    globalThis.fetch = async (input, init) => {
      const url = String(input).replace(/^.*\/api\/v1/, '');
      if (url === '/auth/refresh_token') return json({ success: true, data: { access_token: 'novo', refresh_token: 'r2' } });
      if (url === '/auth/me') throw new TypeError('Failed to fetch');
      if (new Headers(init?.headers).get('Authorization') === 'Bearer velho') return json({ success: false, errors: ['token_expirado'] }, 401);
      return json({ success: true, data: null });
    };
    await apiFetch('/usuarios');
    assert.equal(getStoredAccessToken(), 'novo');
    assert.equal(pode('usuarios', 'index'), true);
  });

  it('sem tokens (logout ou login local) não há nenhuma permissão', () => {
    definirPermissoes(usuarioMe('Administrador'));
    clearStoredTokens();
    assert.equal(obterPermissoes(), SEM_PERMISSOES);
    definirPermissoes(usuarioMe('Gestor'));
    limparPermissoes();
    assert.equal(pode('usuarios', 'index'), false);
  });
});
