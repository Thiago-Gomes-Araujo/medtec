/**
 * Testes Unitários Automatizados da Camada Central de Integração MEDTEC
 * Executado pelo test runner nativo do Node.js: npx tsx --test tests/api-client.test.ts
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import EditorialKanban from '../src/components/EditorialKanban';
import UserManager from '../src/components/UserManager';
import type { AdminUsersData } from '../src/components/admin/useAdminUsers';
import { canAccessAdminUsers, getFolderIdForSection, SECTION_CONFIG, type AdminSession } from '../src/components/admin/AdminShell';
import type { NewsItem } from '../src/types';

import {
  buildQueryString,
  getMediaUrl,
  apiFetch,
} from '../src/lib/api/client';
import { ApiError } from '../src/lib/api/errors';
import {
  setStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  clearStoredTokens,
  decodeAccessToken,
  isAccessTokenExpired,
} from '../src/lib/api/tokens';
import { medtecApi } from '../src/lib/api/index';

describe('Autorização da subrota de usuários', () => {
  const adminSession: AdminSession = {
    isGestor: true,
    apiUser: { id: 100, nome: '', cpf: '', ativo: true, perfil_id: 10, perfil_nome: 'Administrador' },
  };

  it('nega sessão local mesmo quando ela se identifica como gestora ou administradora', () => {
    assert.equal(canAccessAdminUsers({ isGestor: true }), false);
    assert.equal(canAccessAdminUsers({ isGestor: false }), false);
  });

  it('não autoriza operador por IDs legados de usuário ou perfil', () => {
    assert.equal(canAccessAdminUsers({
      isGestor: true,
      apiUser: { ...adminSession.apiUser!, id: 1, perfil_id: 3, perfil_nome: 'Operador de Conteúdo' },
    }), false);
  });

  it('exige Administrador ativo confirmado pelo Rails e preserva a restrição administrativa', () => {
    assert.equal(canAccessAdminUsers(adminSession), true);
    assert.equal(canAccessAdminUsers({ ...adminSession, isGestor: false }), false);
    assert.equal(canAccessAdminUsers({
      ...adminSession, apiUser: { ...adminSession.apiUser!, ativo: false },
    }), false);
  });

  it('direciona usuários para a subrota e mantém seu agrupamento no shell', () => {
    assert.equal(SECTION_CONFIG.usuarios.href, '/admin/usuarios');
    assert.equal(getFolderIdForSection('usuarios'), 'usuarios');
  });
});

describe('Usuários desacoplados dos dados locais do painel', () => {
  function renderUsers(overrides: Partial<AdminUsersData> = {}) {
    const management: AdminUsersData = {
      apiUsers: [], profiles: [], totalUsers: 0,
      loadingUsers: false, loadingProfiles: false,
      errorUsers: null, errorProfiles: null,
      reloadUsers: async () => {}, reloadProfiles: async () => {},
      ...overrides,
    };
    return renderToStaticMarkup(createElement(UserManager, { management }));
  }

  it('distingue lista vazia confirmada de falha de leitura e de carregamento', () => {
    const empty = renderUsers();
    assert.ok(empty.includes('Nenhum usuário encontrado.'));
    assert.ok(!empty.includes('role="alert"'));

    const failed = renderUsers({ errorUsers: 'Você não possui permissão para executar esta operação.' });
    assert.ok(failed.includes('role="alert"'));
    assert.ok(failed.includes('Não foi possível carregar os usuários.'));
    assert.ok(!failed.includes('Nenhum usuário encontrado.'));

    const loading = renderUsers({ loadingUsers: true });
    assert.ok(loading.includes('Carregando usuários da API...'));
    assert.ok(!loading.includes('Nenhum usuário encontrado.'));
  });

  it('mantém a última leitura válida visível quando uma atualização falha', () => {
    const html = renderUsers({
      apiUsers: [{
        id: 100, nome: 'Conta de teste', cpf: '', ativo: true, perfil_id: 1,
        perfil_nome: 'Perfil de teste', created_at: '', updated_at: '',
      }],
      totalUsers: 1,
      errorUsers: 'Falha de conexão com a API.',
    });
    assert.ok(html.includes('Conta de teste'));
    assert.ok(html.includes('Falha de conexão com a API.'));
    assert.ok(html.includes('Tentar novamente'));
  });

  it('bloqueia cadastro enquanto os perfis não puderem ser carregados', () => {
    const profiles = [{ id: 1, nome: 'Perfil de teste', ativo: true }];
    const submitDisabled = (html: string) => /<button[^>]*type="submit"[^>]*disabled=""/.test(html);
    assert.equal(submitDisabled(renderUsers({ profiles })), false);
    assert.equal(submitDisabled(renderUsers({ profiles, loadingProfiles: true })), true);
    assert.equal(submitDisabled(renderUsers({ profiles, errorProfiles: 'Sem permissão' })), true);
    assert.equal(submitDisabled(renderUsers()), true);
  });
});

describe('1. Montagem de Query String e Filtros', () => {
  it('deve formatar paginação numérica e per_page', () => {
    const qs = buildQueryString({ page: 2, per_page: 20 });
    assert.equal(qs, '?page=2&per_page=20');
  });

  it('deve suportar page=all sem per_page', () => {
    const qs = buildQueryString({ page: 'all' });
    assert.equal(qs, '?page=all');
  });

  it('deve serializar filtros predicados q[campo_predicado]', () => {
    const qs = buildQueryString({
      q: {
        nome_cont: 'maria',
        ativo_true: 1,
      },
      page: 1,
    });
    assert.ok(qs.includes('q%5Bnome_cont%5D=maria') || qs.includes('q[nome_cont]=maria'));
    assert.ok(qs.includes('q%5Bativo_true%5D=1') || qs.includes('q[ativo_true]=1'));
  });

  it('deve serializar arrays com predicado _in (ex: q[id_in][]=1&q[id_in][]=2)', () => {
    const qs = buildQueryString({
      q: {
        id_in: [1, 2],
      },
    });
    assert.ok(qs.includes('q%5Bid_in%5D%5B%5D=1') || qs.includes('q[id_in][]=1'));
    assert.ok(qs.includes('q%5Bid_in%5D%5B%5D=2') || qs.includes('q[id_in][]=2'));
  });

  it('deve ignorar valores nulos, vazios ou indefinidos', () => {
    const qs = buildQueryString({
      page: 1,
      vazio: '',
      nulo: null,
      indefinido: undefined,
    });
    assert.equal(qs, '?page=1');
  });
});

describe('2. Construção de URLs de Mídia (Active Storage / URLs Externas)', () => {
  it('deve preservar URLs externas completas (http / https)', () => {
    const external = 'https://images.unsplash.com/photo-12345';
    assert.equal(getMediaUrl(external), external);
  });

  it('deve prefixar caminhos relativos com a origem do servidor (sem /api/v1)', () => {
    const relative = '/rails/active_storage/blobs/redirect/123/foto.jpg';
    const mediaUrl = getMediaUrl(relative);
    assert.ok(mediaUrl.includes('/rails/active_storage/blobs/redirect/123/foto.jpg'));
    assert.ok(!mediaUrl.includes('/api/v1/rails/active_storage'));
  });

  it('deve retornar string vazia para valores nulos ou vazios', () => {
    assert.equal(getMediaUrl(null), '');
    assert.equal(getMediaUrl(''), '');
    assert.equal(getMediaUrl(undefined), '');
  });
});

describe('3. Tratamento Padronizado de Erros (ApiError)', () => {
  it('deve identificar token expirado (401 com token_expirado)', () => {
    const err = new ApiError('Sessão expirada', 401, ['token_expirado']);
    assert.equal(err.isTokenExpired(), true);
    assert.equal(err.isUnauthorized(), true);
    assert.equal(err.isForbidden(), false);
  });

  it('deve identificar erro 403 sem_permissao sem deslogar o usuário', () => {
    const err = new ApiError('Sem permissão', 403, ['sem_permissao']);
    assert.equal(err.isForbidden(), true);
    assert.equal(err.isUnauthorized(), false);
  });

  it('deve traduzir códigos para mensagens amigáveis em português', () => {
    const errCred = new ApiError('Auth failed', 401, ['credenciais_invalidas']);
    assert.equal(
      ApiError.getFriendlyMessage(errCred),
      'CPF ou senha incorretos. Verifique suas credenciais.'
    );

    const errInativo = new ApiError('Inativo', 401, ['usuario_inativo']);
    assert.equal(
      ApiError.getFriendlyMessage(errInativo),
      'Este usuário está inativo no sistema. Contate a administração da SEDUC.'
    );

    const errRateLimit = new ApiError('Muitas tentativas', 429, ['muitas_tentativas']);
    assert.equal(
      ApiError.getFriendlyMessage(errRateLimit),
      'Muitas tentativas em pouco tempo. Aguarde 1 minuto e tente novamente.'
    );
  });

  it('deve mapear erros de validação 422 para campos específicos', () => {
    const errors = ['Cpf inválido', 'Nome não pode ficar em branco', 'Senha deve ter no mínimo 8 caracteres'];
    const fieldMap = ApiError.mapFieldErrors(errors);
    assert.equal(fieldMap.cpf, 'Cpf inválido');
    assert.equal(fieldMap.nome, 'Nome não pode ficar em branco');
    assert.equal(fieldMap.password, 'Senha deve ter no mínimo 8 caracteres');
  });
});

describe('4. Gerenciamento Seguro de Tokens e JWT', () => {
  beforeEach(() => {
    clearStoredTokens();
  });

  it('deve armazenar e recuperar access_token e refresh_token', () => {
    setStoredTokens({ access_token: 'fake-access', refresh_token: 'fake-refresh' });
    assert.equal(getStoredAccessToken(), 'fake-access');
    assert.equal(getStoredRefreshToken(), 'fake-refresh');
  });

  it('deve limpar tokens no logout', () => {
    setStoredTokens({ access_token: 'fake-access', refresh_token: 'fake-refresh' });
    clearStoredTokens();
    assert.equal(getStoredAccessToken(), null);
    assert.equal(getStoredRefreshToken(), null);
  });

  it('deve decodificar o payload de JWT válido sem chave secreta', () => {
    const fakePayload = {
      user_id: 1,
      perfil_id: 3,
      perfil_nome: 'Administrador',
      usuario_ativo: true,
      exp: 9999999999,
      iat: 1700000000,
      jti: 'test-jti',
    };
    const b64 = Buffer.from(JSON.stringify(fakePayload)).toString('base64url');
    const fakeJwt = `eyJhbGciOiJIUzI1NiJ9.${b64}.fake-sig`;

    const decoded = decodeAccessToken(fakeJwt);
    assert.ok(decoded);
    assert.equal(decoded.user_id, 1);
    assert.equal(decoded.perfil_nome, 'Administrador');
    assert.equal(isAccessTokenExpired(fakeJwt), false);
  });

  it('deve identificar token expirado quando exp < now', () => {
    const expiredPayload = { user_id: 1, exp: 1000 };
    const b64 = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const fakeJwt = `header.${b64}.sig`;

    assert.equal(isAccessTokenExpired(fakeJwt), true);
  });
});

describe('5. Cliente HTTP apiFetch (Respostas, 204 e Renovação de Token)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    clearStoredTokens();
  });

  it('deve tratar resposta com envelope padrão { success, data }', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'OK',
          data: { id: 10, nome: 'Teste' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const result = await apiFetch<{ success: boolean; data: { id: number; nome: string } }>('/teste');
      assert.equal(result.success, true);
      assert.equal(result.data.nome, 'Teste');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve tratar resposta com objeto direto (sem envelope)', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({ id: 1, sigla_uf: 'RO', nome: 'Rondônia' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const result = await apiFetch<{ id: number; sigla_uf: string }>('/g_estados/1');
      assert.equal(result.id, 1);
      assert.equal(result.sigla_uf, 'RO');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve tratar resposta 204 No Content retornando null sem erro de JSON', async () => {
    globalThis.fetch = async () => {
      return new Response(null, { status: 204 });
    };

    try {
      const result = await apiFetch<void>('/g_estados/1', { method: 'DELETE' });
      assert.equal(result, null);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve lançar ApiError em respostas de erro (404, 422, 500)', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Registro não encontrado',
          errors: ['nao_encontrado'],
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      await assert.rejects(
        async () => {
          await apiFetch('/usuarios/999');
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 404);
          assert.equal(err.isNotFound(), true);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve realizar renovação com mutex em caso de 401 token_expirado e repetir a requisição', async () => {
    setStoredTokens({ access_token: 'old-access', refresh_token: 'valid-refresh' });

    let callCount = 0;
    let refreshCalls = 0;

    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);

      if (urlStr.includes('/auth/refresh_token')) {
        refreshCalls++;
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Token renovado',
            data: { access_token: 'new-access-token', refresh_token: 'new-refresh-token' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      callCount++;
      if (callCount === 1) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Token expirado',
            errors: ['token_expirado'],
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const headers = new Headers(options?.headers);
      assert.equal(headers.get('Authorization'), 'Bearer new-access-token');

      return new Response(
        JSON.stringify({ success: true, data: { status: 'sucesso_apos_refresh' } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await apiFetch<{ success: boolean; data: { status: string } }>('/dados-protegidos');
      assert.equal(res.data.status, 'sucesso_apos_refresh');
      assert.equal(refreshCalls, 1, 'Deve disparar exatamente uma chamada de refresh');
      assert.equal(getStoredAccessToken(), 'new-access-token');
      assert.equal(getStoredRefreshToken(), 'new-refresh-token');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve evitar refreshes concorrentes: se 3 requisições receberem 401 ao mesmo tempo, faz apenas 1 refresh', async () => {
    setStoredTokens({ access_token: 'old-access', refresh_token: 'valid-refresh' });

    let refreshCalls = 0;

    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);

      if (urlStr.includes('/auth/refresh_token')) {
        refreshCalls++;
        await new Promise((resolve) => setTimeout(resolve, 20));
        return new Response(
          JSON.stringify({
            success: true,
            data: { access_token: 'renewed-access', refresh_token: 'renewed-refresh' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const headers = new Headers(options?.headers);
      const authHeader = headers.get('Authorization');

      if (authHeader === 'Bearer old-access') {
        return new Response(
          JSON.stringify({ success: false, errors: ['token_expirado'] }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, url: urlStr }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const [res1, res2, res3] = await Promise.all([
        apiFetch<{ success: boolean }>('/req-1'),
        apiFetch<{ success: boolean }>('/req-2'),
        apiFetch<{ success: boolean }>('/req-3'),
      ]);

      assert.equal(res1.success, true);
      assert.equal(res2.success, true);
      assert.equal(res3.success, true);
      assert.equal(refreshCalls, 1, 'Mutex de refresh deve garantir exatamente 1 chamada de refresh');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('6. Operações de Autenticação (medtecApi.auth)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    clearStoredTokens();
  });

  it('deve executar login, salvar tokens e retornar ApiResponse', async () => {
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(String(options?.body));
      assert.equal(body.cpf, '111.444.777-35');
      assert.equal(body.password, 'SenhaAdmin123');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Login efetuado com sucesso.',
          data: {
            access_token: 'login-access-token',
            refresh_token: 'login-refresh-token',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await medtecApi.auth.login(' 111.444.777-35 ', 'SenhaAdmin123');
      assert.equal(res.success, true);
      assert.equal(res.data.access_token, 'login-access-token');
      assert.equal(getStoredAccessToken(), 'login-access-token');
      assert.equal(getStoredRefreshToken(), 'login-refresh-token');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve executar logout no backend e limpar tokens', async () => {
    setStoredTokens({ access_token: 'token-logout', refresh_token: 'refresh-logout' });

    let logoutCalled = false;
    globalThis.fetch = async (url, options) => {
      if (options?.method === 'DELETE' && String(url).includes('/auth/logout')) {
        logoutCalled = true;
        return new Response(
          JSON.stringify({ success: true, message: 'Sessão encerrada com sucesso.', data: null }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(null, { status: 404 });
    };

    try {
      await medtecApi.auth.logout();
      assert.equal(logoutCalled, true);
      assert.equal(getStoredAccessToken(), null);
      assert.equal(getStoredRefreshToken(), null);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('7. CMS de Notícias (/n_noticias, /n_categorias_noticia, /n_status_noticias)', () => {
  const originalFetch = globalThis.fetch;

  it('deve listar notícias com filtros e paginação no CMS', async () => {
    let calledUrl = '';
    globalThis.fetch = async (url) => {
      calledUrl = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            items: [
              {
                id: 1,
                titulo: 'Notícia de Teste',
                slug: 'noticia-de-teste',
                status: 'aguardando',
                autor: { id: 10, nome: 'Editor' },
              },
            ],
            pagination: { current_page: 1, total_pages: 1, total_count: 1 },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await medtecApi.noticias.list({
        'q[n_status_noticia_slug_eq]': 'aguardando',
        page: 1,
        per_page: 10,
      });
      assert.equal(res.success, true);
      assert.ok(calledUrl.includes('/n_noticias'));
      assert.ok(calledUrl.includes('q%5Bn_status_noticia_slug_eq%5D=aguardando') || calledUrl.includes('q[n_status_noticia_slug_eq]=aguardando'));
      assert.equal(res.data.items.length, 1);
      assert.equal(res.data.items[0].titulo, 'Notícia de Teste');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve aprovar e publicar notícia via PATCH /n_noticias/:id/publicar sem corpo inventado', async () => {
    let patchUrl = '';
    let patchMethod = '';
    let patchBody: unknown = undefined;

    globalThis.fetch = async (url, options) => {
      patchUrl = String(url);
      patchMethod = options?.method || 'GET';
      patchBody = options?.body;

      return new Response(
        JSON.stringify({
          id: 42,
          titulo: 'Notícia Aprovada',
          status: 'publicada',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const noticia = await medtecApi.noticias.publicar(42);
      assert.ok(patchUrl.includes('/n_noticias/42/publicar'));
      assert.equal(patchMethod, 'PATCH');
      assert.equal(patchBody, undefined, 'A rota de publicar não deve enviar corpo de requisição');
      assert.equal(noticia.status, 'publicada');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve reprovar notícia via PATCH /n_noticias/:id/reprovar com motivo obrigatório', async () => {
    let patchUrl = '';
    let patchBody = '';

    globalThis.fetch = async (url, options) => {
      patchUrl = String(url);
      patchBody = String(options?.body);

      return new Response(
        JSON.stringify({
          id: 42,
          titulo: 'Notícia Reprovada',
          status: 'reprovada',
          motivo_reprovacao: 'Falta fonte oficial.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const noticia = await medtecApi.noticias.reprovar(42, 'Falta fonte oficial.');
      assert.ok(patchUrl.includes('/n_noticias/42/reprovar'));
      assert.deepEqual(JSON.parse(patchBody), { motivo: 'Falta fonte oficial.' });
      assert.equal(noticia.status, 'reprovada');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve validar localmente e rejeitar reprovação se o motivo for vazio', async () => {
    await assert.rejects(
      async () => {
        await medtecApi.noticias.reprovar(42, '   ');
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 422);
        assert.ok(err.message.includes('motivo'));
        return true;
      }
    );
  });

  it('deve despublicar notícia via PATCH /n_noticias/:id/despublicar', async () => {
    let patchUrl = '';
    globalThis.fetch = async (url, options) => {
      patchUrl = String(url);
      assert.equal(options?.method, 'PATCH');
      return new Response(
        JSON.stringify({ id: 42, status: 'despublicada' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await medtecApi.noticias.despublicar(42);
      assert.ok(patchUrl.includes('/n_noticias/42/despublicar'));
      assert.equal(res.status, 'despublicada');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('8. Site Público de Notícias (/publico/n_noticias)', () => {
  const originalFetch = globalThis.fetch;

  it('deve listar notícias públicas sem enviar cabeçalho de autenticação Bearer', async () => {
    setStoredTokens({ access_token: 'admin-token', refresh_token: 'refresh-token' });
    let authHeader: string | null = null;
    let requestUrl = '';

    globalThis.fetch = async (url, options) => {
      requestUrl = String(url);
      const headers = new Headers(options?.headers);
      authHeader = headers.get('Authorization');

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            items: [
              {
                id: 1,
                slug: 'aula-inaugural',
                titulo: 'Aula Inaugural 2026',
                resumo: 'Início das aulas síncronas',
                categoria_nome: 'Institucional',
              },
            ],
            pagination: { current_page: 1, total_pages: 1, total_count: 1 },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await medtecApi.noticias.listPublico({ categoria: 'institucional', busca: 'aula' });
      assert.equal(res.success, true);
      assert.ok(requestUrl.includes('/publico/n_noticias'));
      assert.ok(requestUrl.includes('categoria=institucional'));
      assert.ok(requestUrl.includes('busca=aula'));
      assert.equal(authHeader, null, 'Rota pública não deve enviar Bearer token');
      assert.equal(res.data.items[0].slug, 'aula-inaugural');
    } finally {
      globalThis.fetch = originalFetch;
      clearStoredTokens();
    }
  });

  it('deve buscar notícia pública por slug via GET /publico/n_noticias/:slug', async () => {
    let requestUrl = '';
    globalThis.fetch = async (url) => {
      requestUrl = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 5,
            slug: 'projeto-agroecologia-ro',
            titulo: 'Projeto Agroecologia RO',
            conteudo: 'Detalhes pedagógicos completos...',
            categoria_nome: 'Agroecologia',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await medtecApi.noticias.getPublicoBySlug('projeto-agroecologia-ro');
      assert.ok(requestUrl.includes('/publico/n_noticias/projeto-agroecologia-ro'));
      assert.equal(res.data.slug, 'projeto-agroecologia-ro');
      assert.equal(res.data.categoria_nome, 'Agroecologia');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve buscar categorias públicas via GET /publico/n_categorias_noticia', async () => {
    let requestUrl = '';
    globalThis.fetch = async (url) => {
      requestUrl = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: [
            { id: 1, nome: 'Institucional', slug: 'institucional' },
            { id: 2, nome: 'Tecnologia', slug: 'tecnologia' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await medtecApi.noticias.listCategoriasPublico();
      assert.ok(requestUrl.includes('/publico/n_categorias_noticia'));
      assert.equal(res.data.length, 2);
      assert.equal(res.data[0].nome, 'Institucional');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('9. Upload Multipart e Atualização em Lote de Canais', () => {
  const originalFetch = globalThis.fetch;

  it('deve enviar FormData sem definir manualmente Content-Type em criação com arquivo', async () => {
    let sentContentType: string | null = null;
    let receivedBody: unknown = null;

    globalThis.fetch = async (url, options) => {
      const headers = new Headers(options?.headers);
      sentContentType = headers.get('Content-Type');
      receivedBody = options?.body;

      return new Response(
        JSON.stringify({
          id: 10,
          titulo: 'Notícia com Foto',
          imagem_capa: '/rails/active_storage/blobs/redirect/foto.png',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const formData = new FormData();
      formData.append('n_noticia[titulo]', 'Notícia com Foto');
      formData.append('n_noticia[conteudo]', 'Conteúdo');
      formData.append('n_noticia[n_categoria_noticia_id]', '1');

      const res = await medtecApi.noticias.create(formData);
      assert.equal(res.id, 10);
      assert.equal(sentContentType, null, 'O Content-Type deve ser omitido para que o browser gere o boundary');
      assert.ok(receivedBody instanceof FormData);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve atualizar canais de contato em lote via PUT /canais_contato', async () => {
    let method = '';
    let putBody = '';

    globalThis.fetch = async (url, options) => {
      method = options?.method || '';
      putBody = String(options?.body);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Canais de contato atualizados com sucesso.',
          data: [
            { id: 1, rede: 'youtube', valor: 'https://youtube.com/seduc', ativo: true, ordem: 1 },
            { id: 2, rede: 'instagram', valor: 'https://instagram.com/seduc', ativo: true, ordem: 2 },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const res = await medtecApi.canaisContato.updateBatch([
        { id: 1, rede: 'youtube', valor: 'https://youtube.com/seduc', ativo: true, ordem: 1 },
        { id: 2, rede: 'instagram', valor: 'https://instagram.com/seduc', ativo: true, ordem: 2 },
      ]);
      assert.equal(method, 'PUT');
      assert.equal(res.success, true);
      const parsed = JSON.parse(putBody);
      assert.ok(Array.isArray(parsed.canais_contato), 'Deve envelopar lista em canais_contato');
      assert.equal(parsed.canais_contato.length, 2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('10. Tratamento Rigoroso de Erros de Protocolo e Ausência de Mocks', () => {
  const originalFetch = globalThis.fetch;

  it('deve mapear erro 400 Bad Request para ApiError', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({ success: false, message: 'Requisição inválida', errors: ['bad_request'] }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      await assert.rejects(
        async () => {
          await apiFetch('/rota-invalida');
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 400);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve mapear erro 429 Muitas Requisições para ApiError', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({ success: false, message: 'Limite de requisições excedido' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      await assert.rejects(
        async () => {
          await apiFetch('/usuarios');
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 429);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve mapear erro 500 Internal Server Error para ApiError', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({ success: false, message: 'Falha interna no servidor Rails' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      await assert.rejects(
        async () => {
          await apiFetch('/n_noticias');
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 500);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve limpar tokens e rejeitar requisição caso o refresh token seja recusado (401)', async () => {
    setStoredTokens({ access_token: 'old-access', refresh_token: 'invalid-refresh' });

    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/auth/refresh_token')) {
        return new Response(
          JSON.stringify({ success: false, message: 'Refresh token revogado', errors: ['token_revogado'] }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ success: false, errors: ['token_expirado'] }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      await assert.rejects(
        async () => {
          await apiFetch('/dados-sensíveis');
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          return true;
        }
      );
      assert.equal(getStoredAccessToken(), null, 'Tokens devem ser limpos após falha no refresh');
      assert.equal(getStoredRefreshToken(), null);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve diferenciar listagem vazia legítima de erro de conexão/API', async () => {
    // 1. Resposta válida com lista vazia
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          success: true,
          data: { items: [], pagination: { current_page: 1, total_pages: 0, total_count: 0 } },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      const resVazia = await medtecApi.noticias.list();
      assert.equal(resVazia.data.items.length, 0, 'Lista vazia legítima deve retornar array vazio');
    } finally {
      globalThis.fetch = originalFetch;
    }

    // 2. Erro de API não pode ser tratado silenciosamente como lista vazia
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({ success: false, message: 'Não autorizado', errors: ['nao_autenticado'] }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    };

    try {
      await assert.rejects(
        async () => {
          await medtecApi.noticias.list();
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 401);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

// Contrato visual da integração controlada; nenhuma decisão editorial é executada.
describe('11. Kanban controlado e permissões editoriais', () => {
  const pendingNews: NewsItem = {
    id: '7', title: 'Materia pendente', slug: 'materia-pendente', excerpt: '',
    content: 'Conteudo', coverImage: '', author: 'Equipe', category: 'Pedagogico',
    publishedAt: '2026-10-30', featured: false, published: false, rejected: false,
  };
  const callbacks = {
    onApproveNews: async () => { throw new Error('A renderização não deve publicar.'); },
    onRejectNews: async () => { throw new Error('A renderização não deve reprovar.'); },
  };
  const actionButton = (html: string, label: string) => {
    const button = html.match(/<button\b[\s\S]*?<\/button>/g)?.find((item) => item.includes(label));
    assert.ok(button, `Ação ausente: ${label}`);
    return button;
  };

  it('não concede aprovação ou reprovação quando permissões são omitidas', () => {
    const html = renderToStaticMarkup(createElement(EditorialKanban, { news: [pendingNews], ...callbacks }));
    assert.match(actionButton(html, 'Aprovar notícia'), /disabled=""/);
    assert.match(actionButton(html, 'Recusar'), /disabled=""/);
  });

  it('mantém publicação e reprovação como permissões independentes', () => {
    const html = renderToStaticMarkup(createElement(EditorialKanban, {
      news: [pendingNews], ...callbacks, canApprove: true, canReject: false,
    }));
    assert.doesNotMatch(actionButton(html, 'Aprovar notícia'), /disabled=""/);
    assert.match(actionButton(html, 'Recusar'), /disabled=""/);
  });

  it('distingue coleção vazia válida de falha da API e de carregamento', () => {
    const props = { news: [], ...callbacks };
    const empty = renderToStaticMarkup(createElement(EditorialKanban, props));
    assert.match(empty, /Fila editorial aguardando matérias/);
    const error = renderToStaticMarkup(createElement(EditorialKanban, { ...props, error: 'Sem permissão na API' }));
    assert.match(error, /role="alert"/);
    assert.match(error, /Sem permissão na API/);
    assert.doesNotMatch(error, /Fila editorial aguardando matérias/);
    const loading = renderToStaticMarkup(createElement(EditorialKanban, { ...props, loading: true }));
    assert.match(loading, /role="status"/);
    assert.doesNotMatch(loading, /Fila editorial aguardando matérias/);
  });
});
