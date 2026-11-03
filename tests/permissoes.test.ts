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
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildAdminMenu, podeAcessarSecao, SECTION_CONFIG, type AdminSection } from '../src/lib/admin-navigation';
import { getAdminEditorialDestination } from '../src/lib/admin-auth-navigation';
import { createAdminOverviewLoader } from '../src/lib/admin-overview';
import AdminOverview from '../src/components/admin/AdminOverview';
import type { OverviewStatsIndicators } from '../src/components/admin/OverviewStats';
import { CommunitySubrouteLayout, renderModerationButtons } from '../src/components/admin/communityAdminUi';
import ProjetosPanel from '../src/components/admin/ProjetosPanel';
import BannersPanel from '../src/components/admin/BannersPanel';
import DisciplinasPanel from '../src/components/admin/DisciplinasPanel';

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

const sessaoDe = (perfil: keyof typeof PERFIS) => lerPermissoes(PERFIS[perfil]);
const menuVisivel = (perfil: keyof typeof PERFIS | null) =>
  buildAdminMenu(perfil ? sessaoDe(perfil) : SEM_PERMISSOES).flatMap(folder => folder.items.filter(item => item.visible).map(item => item.section)).sort();
const render = (element: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(element);

describe('Fonte única: menu, guardas, Início e botões por pode()', () => {
  afterEach(() => { globalThis.fetch = originalFetch; limparPermissoes(); });

  it('menu mostra só os módulos com index de cada perfil', () => {
    assert.deepEqual(menuVisivel('Jornalista'), ['avisos', 'galeria']);
    assert.deepEqual(menuVisivel('Gestor'), ['duvidas', 'duvidasPublico', 'fotos', 'noticias', 'projetos', 'projetosAprovacao', 'usuarios']);
    assert.deepEqual(menuVisivel('Administrador'), ['alunos', 'avisos', 'duvidas', 'duvidasPublico', 'estadosCidades', 'fotos', 'galeria', 'kanban', 'noticias', 'professores', 'projetos', 'redes', 'usuarios']);
    assert.deepEqual(menuVisivel(null), [], 'login local não vê nenhum módulo');
  });

  it('guardas usam a mesma regra do menu, inclusive nas subrotas', () => {
    const secoes = Object.keys(SECTION_CONFIG) as AdminSection[];
    const liberadas = (perfil: keyof typeof PERFIS | null) => secoes.filter(secao => podeAcessarSecao(secao, perfil ? sessaoDe(perfil) : SEM_PERMISSOES)).sort();
    assert.deepEqual(liberadas(null), ['visaoGeral']);
    assert.deepEqual(liberadas('Jornalista'), ['avisos', 'galeria', 'visaoGeral']);
    assert.deepEqual(liberadas('Gestor'), ['duvidas', 'duvidasPublico', 'fotos', 'noticias', 'professoresRelatos', 'projetos', 'projetosAprovacao', 'projetosMembros', 'projetosTemas', 'usuarios', 'visaoGeral']);
    assert.equal(liberadas('Administrador').length, secoes.length);
  });

  it('abas das subrotas escondem as telas sem index', () => {
    definirPermissoes(PERFIS.Gestor);
    const html = render(createElement(CommunitySubrouteLayout, { active: 'professoresRelatos', children: 'conteúdo' }));
    assert.doesNotMatch(html, /Seções de professores/, 'só sobra a aba atual: a navegação some');
    definirPermissoes(PERFIS.Administrador);
    const admin = render(createElement(CommunitySubrouteLayout, { active: 'professoresRelatos', children: 'conteúdo' }));
    for (const aba of ['Professores', 'Disciplinas', 'Relatos dos alunos']) assert.match(admin, new RegExp(`>${aba}<`));
  });

  it('Início: atalhos exigem create e o resumo só traz módulos com index', () => {
    const html = (perfil: keyof typeof PERFIS) => render(createElement(AdminOverview, {
      indicators: { usersCountLabel: '3' } as OverviewStatsIndicators, menu: buildAdminMenu(sessaoDe(perfil)),
      canCreateNews: pode('n_noticias', 'create', sessaoDe(perfil)), canCreateProject: pode('pj_projetos', 'create', sessaoDe(perfil)),
      onCreateNews() {},
    }));
    const jornalista = html('Jornalista');
    assert.doesNotMatch(jornalista, /Nova notícia|Novo projeto|Abrir Notícias|Abrir Usuários/);
    assert.match(jornalista, /Abrir Avisos/);
    assert.match(jornalista, /<dt[^>]*>Avisos<\/dt>/);
    assert.doesNotMatch(jornalista, /<dt[^>]*>(Notícias|Projetos|Banners|Perguntas)<\/dt>/);
    const gestor = html('Gestor');
    assert.match(gestor, /Nova notícia/);
    assert.match(gestor, /Novo projeto/);
    assert.match(gestor, /Abrir Usuários/);
  });

  it('Início não chama a API de módulos sem index (sem 403 nos contadores)', async () => {
    const urls: string[] = [];
    globalThis.fetch = async (input) => {
      urls.push(String(input).replace(/^.*\/api\/v1/, '').replace(/\?.*$/, ''));
      return json({ success: true, data: { items: [], pagination: { current_page: 1, total_pages: 1, total_count: 0, per_page: 1 } } });
    };
    await createAdminOverviewLoader()(sessaoDe('Jornalista'));
    assert.deepEqual([...new Set(urls)].sort(), ['/a_avisos', '/categorias_galeria', '/fotos_galeria']);
    urls.length = 0;
    await createAdminOverviewLoader()(SEM_PERMISSOES);
    assert.deepEqual(urls, []);
  });

  it('redirecionamento de "nova notícia" exige create', () => {
    const params = new URLSearchParams('action=new');
    assert.equal(getAdminEditorialDestination(sessaoDe('Jornalista'), params), null);
    assert.deepEqual(getAdminEditorialDestination(sessaoDe('Gestor'), params), { method: 'replace', href: '/admin/noticias?action=new' });
    assert.equal(getAdminEditorialDestination(sessaoDe('Administrador'), new URLSearchParams()), null);
  });

  it('botões de criar seguem a ação create do módulo', () => {
    definirPermissoes(PERFIS.Jornalista);
    assert.doesNotMatch(render(createElement(ProjetosPanel)), /Novo projeto/);
    assert.doesNotMatch(render(createElement(BannersPanel)), /Novo banner/);
    assert.doesNotMatch(render(createElement(DisciplinasPanel)), /Nova disciplina/);
    definirPermissoes(PERFIS.Gestor);
    assert.match(render(createElement(ProjetosPanel)), /Novo projeto/);
    assert.match(render(createElement(BannersPanel)), /Novo banner/);
    assert.doesNotMatch(render(createElement(DisciplinasPanel)), /Nova disciplina/, 'Gestor não tem p_disciplinas');
    definirPermissoes(PERFIS.Administrador);
    assert.match(render(createElement(DisciplinasPanel)), /Nova disciplina/);
  });

  it('Publicar, Reprovar e Despublicar seguem a ação de cada um', () => {
    const botoes = (status: 'aguardando' | 'publicada', acoes: string[]) =>
      render(createElement('div', null, renderModerationButtons(status, 'Projeto X', false, () => {}, acao => acoes.includes(acao))));
    assert.equal(botoes('aguardando', []), '<div></div>');
    assert.match(botoes('aguardando', ['publicar']), /Publicar Projeto X/);
    assert.doesNotMatch(botoes('aguardando', ['publicar']), /Reprovar/);
    assert.match(botoes('aguardando', ['publicar', 'reprovar']), /Reprovar Projeto X/);
    assert.doesNotMatch(botoes('publicada', ['publicar', 'reprovar']), /Despublicar/);
    assert.match(botoes('publicada', ['despublicar']), /Despublicar Projeto X/);
  });
});
