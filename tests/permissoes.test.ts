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
import type { AuthUser, Perfil, Permissoes, Usuario } from '../src/lib/api/types';
import { PERFIS, usuarioMe } from './fixtures/permissoes';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildAdminMenu, getModulosAprovacaoContaveis, podeAcessarSecao, podeAprovarAlgo, SECTION_CONFIG, type AdminSection } from '../src/lib/admin-navigation';
import { getAdminEditorialDestination } from '../src/lib/admin-auth-navigation';
import { createAdminOverviewLoader } from '../src/lib/admin-overview';
import AdminOverview from '../src/components/admin/AdminOverview';
import type { OverviewStatsIndicators } from '../src/components/admin/OverviewStats';
import { CommunitySubrouteLayout, renderModerationButtons } from '../src/components/admin/communityAdminUi';
import ProjetosPanel from '../src/components/admin/ProjetosPanel';
import FilaAprovacao from '../src/components/admin/FilaAprovacao';
import UserManager from '../src/components/UserManager';
import type { AdminUsersData } from '../src/components/admin/useAdminUsers';
import { getChaveDoModulo, podeConcederRegra } from '../src/lib/admin-usuarios';
import { ApiError, listaVaziaSeSemPermissao } from '../src/lib/api/errors';
import { POST as authRoutePost } from '../src/app/api/auth/route';
import BannersPanel from '../src/components/admin/BannersPanel';
import DisciplinasPanel from '../src/components/admin/DisciplinasPanel';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const originalFetch = globalThis.fetch;

describe('Sessão: permissões do /auth/me', () => {
  beforeEach(() => { clearStoredTokens(); limparPermissoes(); });
  afterEach(() => { globalThis.fetch = originalFetch; clearStoredTokens(); limparPermissoes(); });

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
    const semCamposNovos: AuthUser = { id: 1, nome: 'Sem campos novos', cpf: '0', ativo: true, perfil_id: 3, perfil_nome: 'Administrador' };
    definirPermissoes(semCamposNovos);
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

  it('logout e login local não deixam nenhuma permissão', async () => {
    definirPermissoes(usuarioMe('Administrador'));
    setStoredTokens({ access_token: 'a', refresh_token: 'r' });
    globalThis.fetch = async () => json({ success: true, message: 'Sessão encerrada com sucesso.', data: null });
    await medtecApi.auth.logout();
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
    assert.deepEqual(menuVisivel('Gestor'), ['duvidas', 'duvidasPublico', 'fotos', 'kanban', 'noticias', 'projetos', 'usuarios']);
    assert.deepEqual(menuVisivel('Administrador'), ['alunos', 'avisos', 'duvidas', 'duvidasPublico', 'estadosCidades', 'fotos', 'galeria', 'kanban', 'noticias', 'professores', 'projetos', 'redes', 'usuarios']);
    assert.deepEqual(menuVisivel(null), [], 'login local não vê nenhum módulo');
  });

  it('guardas usam a mesma regra do menu, inclusive nas subrotas', () => {
    const secoes = Object.keys(SECTION_CONFIG) as AdminSection[];
    const liberadas = (perfil: keyof typeof PERFIS | null) => secoes.filter(secao => podeAcessarSecao(secao, perfil ? sessaoDe(perfil) : SEM_PERMISSOES)).sort();
    assert.deepEqual(liberadas(null), ['visaoGeral']);
    assert.deepEqual(liberadas('Jornalista'), ['avisos', 'galeria', 'visaoGeral']);
    assert.deepEqual(liberadas('Gestor'), ['duvidas', 'duvidasPublico', 'fotos', 'kanban', 'noticias', 'professoresRelatos', 'projetos', 'projetosAprovacao', 'projetosMembros', 'projetosTemas', 'usuarios', 'visaoGeral']);
    assert.equal(liberadas('Administrador').length, secoes.length);
  });

  it('abas das subrotas escondem as telas sem index', () => {
    definirPermissoes(PERFIS.Gestor);
    const html = render(createElement(CommunitySubrouteLayout, { active: 'professoresRelatos' } as Parameters<typeof CommunitySubrouteLayout>[0], 'conteúdo'));
    assert.doesNotMatch(html, /Seções de professores/, 'só sobra a aba atual: a navegação some');
    definirPermissoes(PERFIS.Administrador);
    const admin = render(createElement(CommunitySubrouteLayout, { active: 'professoresRelatos' } as Parameters<typeof CommunitySubrouteLayout>[0], 'conteúdo'));
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
    const criar = (perfil: keyof typeof PERFIS) => pode('n_noticias', 'create', sessaoDe(perfil));
    assert.equal(getAdminEditorialDestination(criar('Jornalista'), params), null);
    assert.deepEqual(getAdminEditorialDestination(criar('Gestor'), params), { method: 'replace', href: '/admin/noticias?action=new' });
    assert.equal(getAdminEditorialDestination(criar('Administrador'), new URLSearchParams()), null);
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

describe('Aprovações: Fila e blocos por módulo com publicar', () => {
  afterEach(() => { limparPermissoes(); });
  const blocos = (html: string) => [
    ['notícias', /Carregando notícias para aprovação/],
    ['perguntas', /Perguntas frequentes aguardando/],
    ['conquistas', /Conquistas \(/],
    ['relatos', /Relatos \(/],
    ['projetos', /Projetos aguardando/],
    ['dúvidas do público', /Dúvidas de visitantes/],
  ].filter(([, pattern]) => (pattern as RegExp).test(html)).map(([nome]) => nome);

  it('Fila só aparece com publicar em algum módulo', () => {
    assert.equal(podeAprovarAlgo(sessaoDe('Jornalista')), false);
    assert.equal(podeAprovarAlgo(lerPermissoes({ permissoes: { d_duvidas: ['publicar'] } })), true);
    assert.equal(podeAcessarSecao('kanban', sessaoDe('Gestor')), true);
    assert.equal(podeAcessarSecao('projetosAprovacao', lerPermissoes({ permissoes: { pj_projetos: ['index'] } })), false, 'aprovar projetos exige publicar');
  });

  it('cada bloco só aparece para os módulos com publicar', () => {
    definirPermissoes(PERFIS.Gestor);
    assert.deepEqual(blocos(render(createElement(FilaAprovacao))), ['perguntas', 'relatos', 'projetos', 'dúvidas do público']);
    definirPermissoes(PERFIS.Administrador);
    assert.deepEqual(blocos(render(createElement(FilaAprovacao))), ['notícias', 'perguntas', 'conquistas', 'relatos', 'projetos', 'dúvidas do público']);
    definirPermissoes({ permissoes: { c_conquistas_aluno: ['index', 'publicar'] } });
    assert.deepEqual(blocos(render(createElement(FilaAprovacao))), ['conquistas']);
  });

  it('contador de pendências só lista módulos com publicar e index', () => {
    assert.deepEqual(getModulosAprovacaoContaveis(sessaoDe('Jornalista')), []);
    assert.deepEqual(getModulosAprovacaoContaveis(sessaoDe('Gestor')), ['d_duvidas', 'p_relatos', 'pj_projetos']);
    assert.deepEqual(getModulosAprovacaoContaveis(lerPermissoes({ permissoes: { n_noticias: ['publicar'] } })), [], 'sem index, a contagem daria 403');
  });
});

describe('Usuários: administradores e permissões extras', () => {
  afterEach(() => { limparPermissoes(); });
  const perfis: Perfil[] = [
    { id: 1, nome: 'Jornalista', ativo: true }, { id: 2, nome: 'Gestor', ativo: true }, { id: 3, nome: 'Administrador', ativo: true },
  ];
  const usuario = (id: number, perfil: Perfil): Usuario => ({
    id, nome: `Pessoa ${id}`, cpf: `0000000000${id}`, ativo: true, perfil_id: perfil.id, perfil_nome: perfil.nome, created_at: '', updated_at: '',
  });
  const management = (): AdminUsersData => ({
    apiUsers: [usuario(1, perfis[0]), usuario(3, perfis[2])], profiles: perfis, totalUsers: 2,
    loadingUsers: false, loadingProfiles: false, errorUsers: null, errorProfiles: null,
    reloadUsers: async () => {}, reloadProfiles: async () => {},
  });
  const html = () => render(createElement(UserManager, { management: management() }));
  // Cada linha da lista vai do nome ao fim do bloco de ações.
  const linha = (markup: string, nome: string) => markup.slice(markup.indexOf(`>${nome}<`), markup.indexOf(`>${nome}<`) + 4000).split('Perfil:')[1] ?? '';

  it('Gestor não vê o perfil Administrador no select nem editar/excluir de administradores', () => {
    definirPermissoes(PERFIS.Gestor);
    const markup = html();
    assert.doesNotMatch(markup, /<option value="3"/);
    assert.match(markup, /<option value="1"[^>]*>Jornalista/);
    assert.match(linha(markup, 'Pessoa 1'), /title="Excluir Usuário"/);
    assert.match(linha(markup, 'Pessoa 1'), /title="Redefinir Senha"/);
    assert.doesNotMatch(linha(markup, 'Pessoa 3').split('</button>').slice(0, 3).join(''), /title="Excluir Usuário"|title="Redefinir Senha"|Desativar/);
    assert.match(linha(markup, 'Pessoa 3'), /Só o Administrador altera/);
  });

  it('Administrador vê tudo, inclusive o perfil Administrador', () => {
    definirPermissoes(PERFIS.Administrador);
    const markup = html();
    assert.match(markup, /<option value="3"[^>]*>Administrador/);
    assert.equal(markup.match(/title="Excluir Usuário"/g)?.length, 2);
    assert.doesNotMatch(markup, /Só o Administrador altera/);
  });

  it('Jornalista sem usuarios não vê cadastro nem ações', () => {
    definirPermissoes(PERFIS.Jornalista);
    const markup = html();
    assert.doesNotMatch(markup, /Cadastrar Novo Usuário|title="Excluir Usuário"|title="Redefinir Senha"|>Extras<|>Perfis e Permissões</);
  });

  it('permissões extras: só concede as regras que o usuário logado tem', () => {
    assert.equal(getChaveDoModulo('Usuarios Permissoes Extras'), 'usuarios_permissoes_extras');
    assert.equal(getChaveDoModulo('N Notícias'), 'n_noticias');
    const gestor = sessaoDe('Gestor');
    assert.equal(podeConcederRegra(gestor, { nome: 'Usuarios' }, { acao: 'destroy' }), true);
    assert.equal(podeConcederRegra(gestor, { nome: 'N Noticias' }, { acao: 'publicar' }), false);
    assert.equal(podeConcederRegra(gestor, { nome: 'Modulo Desconhecido' }, { acao: 'index' }), false);
    assert.equal(podeConcederRegra(sessaoDe('Administrador'), { nome: 'Modulo Desconhecido' }, { acao: 'index' }), true);
  });

  it('403 usuario_administrador e as mensagens da seção 9 mostram o texto da API', () => {
    const erro = (message: string, errors: string[]) => ApiError.getFriendlyMessage(ApiError.fromResponse(403, { success: false, message, errors }));
    assert.equal(erro('Somente o Administrador pode alterar administradores', ['usuario_administrador']), 'Somente o Administrador pode alterar administradores');
    assert.equal(erro('Você não pode alterar suas próprias permissões', ['alterar_proprias_permissoes']), 'Você não pode alterar suas próprias permissões');
    assert.equal(erro('Você só pode conceder permissões que você tem', []), 'Você só pode conceder permissões que você tem');
    assert.equal(ApiError.getFriendlyMessage(ApiError.fromResponse(403, { errors: ['usuario_administrador'] })), 'Somente o Administrador pode alterar administradores.');
    assert.equal(erro('Sem permissão', ['sem_permissao']), 'Você não possui permissão para executar esta operação.');
  });
});

describe('Erros: 403, motivo da reprovação, refresh único e 429', () => {
  beforeEach(() => { clearStoredTokens(); });
  afterEach(() => { globalThis.fetch = originalFetch; clearStoredTokens(); });

  it('403 sem_permissao vira mensagem clara e lista auxiliar vazia não derruba a tela', async () => {
    globalThis.fetch = async () => json({ success: false, message: 'Sem permissão', errors: ['sem_permissao'] }, 403);
    const erro = await apiFetch('/a_tipos_aviso').catch((cause: unknown) => cause);
    assert.equal(ApiError.getFriendlyMessage(erro), 'Você não possui permissão para executar esta operação.');
    const vazia = listaVaziaSeSemPermissao(erro);
    assert.deepEqual(vazia.data.items, []);
    assert.throws(() => listaVaziaSeSemPermissao(ApiError.fromResponse(500, {})), ApiError);
  });

  it('reprovar notícia sem motivo não chega à API', async () => {
    let chamadas = 0;
    globalThis.fetch = async () => { chamadas++; return json({}); };
    await assert.rejects(medtecApi.noticias.reprovar(1, '   '), /motivo da reprovação é obrigatório/);
    assert.equal(chamadas, 0);
    globalThis.fetch = async (_input, init) => { chamadas++; assert.deepEqual(JSON.parse(String(init?.body)), { motivo: 'Falta a fonte' }); return json({ id: 1 }); };
    await medtecApi.noticias.reprovar(1, ' Falta a fonte ');
    assert.equal(chamadas, 1);
  });

  it('várias requisições expiradas juntas fazem um único refresh', async () => {
    setStoredTokens({ access_token: 'velho', refresh_token: 'r1' });
    let refreshes = 0;
    let liberarRefresh!: () => void;
    const refreshPronto = new Promise<void>(resolve => { liberarRefresh = resolve; });
    globalThis.fetch = async (input, init) => {
      const url = String(input).replace(/^.*\/api\/v1/, '');
      if (url === '/auth/refresh_token') {
        refreshes++;
        assert.deepEqual(JSON.parse(String(init?.body)), { refresh_token: 'r1' });
        await refreshPronto;
        return json({ success: true, data: { access_token: 'novo', refresh_token: 'r2' } });
      }
      if (url === '/auth/me') return json({ success: true, data: usuarioMe('Gestor') });
      if (new Headers(init?.headers).get('Authorization') === 'Bearer velho') return json({ success: false, errors: ['token_expirado'] }, 401);
      return json({ success: true, data: url });
    };
    const juntas = Promise.all(['/a', '/b', '/c'].map(url => apiFetch<{ data: string }>(url)));
    await new Promise(resolve => setTimeout(resolve, 10));
    liberarRefresh();
    assert.deepEqual((await juntas).map(res => res.data), ['/a', '/b', '/c']);
    assert.equal(refreshes, 1);
  });

  it('requisição expirada que chega depois do refresh só repete com o token novo', async () => {
    setStoredTokens({ access_token: 'velho', refresh_token: 'r1' });
    let refreshes = 0;
    let atrasada: (() => void) | null = null;
    globalThis.fetch = async (input, init) => {
      const url = String(input).replace(/^.*\/api\/v1/, '');
      if (url === '/auth/refresh_token') { refreshes++; return json({ success: true, data: { access_token: 'novo', refresh_token: 'r2' } }); }
      if (url === '/auth/me') return json({ success: true, data: usuarioMe('Gestor') });
      if (new Headers(init?.headers).get('Authorization') === 'Bearer velho') {
        // A resposta de /lenta só chega depois que /rapida já renovou os tokens.
        if (url === '/lenta') await new Promise<void>(resolve => { atrasada = resolve; });
        return json({ success: false, errors: ['token_expirado'] }, 401);
      }
      return json({ success: true, data: url });
    };
    const lenta = apiFetch<{ data: string }>('/lenta');
    await apiFetch('/rapida');
    (atrasada as unknown as () => void)();
    assert.equal((await lenta).data, '/lenta');
    assert.equal(refreshes, 1);
  });

  it('429 no login pede para aguardar 1 minuto', async () => {
    globalThis.fetch = async () => json({ success: false, message: 'Muitas tentativas', errors: ['muitas_tentativas'] }, 429);
    const response = await authRoutePost(new Request('http://localhost:3000/api/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: '00000000000', password: 'x' }),
    }));
    assert.equal(response.status, 429);
    assert.match((await response.json()).error, /Aguarde 1 minuto/);
    assert.match(ApiError.getFriendlyMessage(ApiError.fromResponse(429, { errors: ['muitas_tentativas'] })), /Aguarde 1 minuto/);
  });
});
