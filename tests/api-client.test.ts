/**
 * Testes Unitários Automatizados da Camada Central de Integração MEDTEC
 * Executado pelo test runner nativo do Node.js: npx tsx --test tests/api-client.test.ts
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import AdminFaqSubroutePage from '../src/app/admin/faq/page';
import AdminProjetosSubroutePage from '../src/app/admin/projetos/page';
import AdminBannersSubroutePage from '../src/app/admin/banners/page';
import AdminDashboardPage from '../src/app/admin/page';
import EditorialKanban from '../src/components/EditorialKanban';
import UserManager from '../src/components/UserManager';
import SitePhotosManager from '../src/components/SitePhotosManager';
import FaqModule, { type FaqViewMode } from '../src/components/admin/FaqModule';
import ProjectsModule, { type ProjectViewMode } from '../src/components/admin/ProjectsModule';
import type { AdminUsersData } from '../src/components/admin/useAdminUsers';
import { canAccessAdminUsers, getFolderIdForSection, SECTION_CONFIG, type AdminSession } from '../src/components/admin/AdminShell';
import type { BannerItem, FaqItem, NewsItem, ProjectMission } from '../src/types';

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
import { getLegacyFaqHref, readAdminFaqs } from '../src/lib/admin-faq';
import { getLegacyProjectsHref, readAdminProjects } from '../src/lib/admin-projects';
import { getLegacyBannersHref, readAdminBanners, prepareLocalBannerPreview } from '../src/lib/admin-banners';
import AdminLiveSimulator from '../src/components/AdminLiveSimulator';
import { applyOverviewSnapshot, createAdminOverviewLoader, createInitialOverviewState, getOverviewMetrics, startOverviewLoading } from '../src/lib/admin-overview';

describe('Dados e KPIs isolados da Visão Geral', () => {
  const legacy = {
    siteInfo: {}, stats: {}, socials: {}, banners: [{ id: 'banner-teste', imageUrl: '/banner.jpg' }],
    news: [], gallery: [], announcements: [], users: [{ id: 'não usar no KPI' }],
    projects: [{ municipality: 'Porto Velho' }, { municipality: 'Porto Velho' }, { municipality: 'Ji-Paraná' }],
    faqs: [{ id: 'faq-teste' }],
  };
  const items: Record<string, object[]> = {
    n_noticias: [{ id: 1, titulo: 'Recebida', status: 'publicada' }, { id: 2, status: 'aguardando' }, { id: 3, status: 'reprovada' }],
    a_avisos: [{ id: 1, ativo: true, a_tipo_aviso: { slug: 'urgente' } },
      { id: 2, ativo: true, a_tipo_aviso: { nome: 'Comunicado Urgente' } }, { id: 3, ativo: false }],
    fotos_galeria: [{ id: 1 }], categorias_galeria: [{ id: 1 }], g_estados: [{ id: 1 }],
    usuarios: Array.from({ length: 50 }, (_, index) => ({ id: index + 1 })),
  };
  const totals: Record<string, number> = {
    n_noticias: 80, a_avisos: 90, fotos_galeria: 280, categorias_galeria: 12, g_estados: 27, usuarios: 120,
  };
  function json(value: unknown, status = 200) {
    return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
  }
  function serve(url: string, empty = false) {
    const endpoint = new URL(url, 'http://test').pathname.split('/').pop()!;
    if (endpoint === 'data') return json(legacy);
    assert.ok(endpoint in items, `Endpoint inesperado: ${endpoint}`);
    return json({ success: true, data: {
      items: empty ? [] : items[endpoint],
      pagination: { total_count: empty ? 0 : totals[endpoint], current_page: 1, total_pages: 1, per_page: 1 },
    } });
  }

  it('não consulta dados antes da autorização e mantém carregamento distinto de zero', async () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => { requests += 1; throw new Error('Leitura não autorizada.'); };
    try {
      assert.equal(await createAdminOverviewLoader()(false), null);
      const state = createInitialOverviewState();
      assert.equal(state.users.loading, true);
      assert.equal(state.users.data, null);
      assert.equal(getOverviewMetrics(state).usersCountLabel, '...');
      const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: 'overview-test' };
      const html = renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(AdminDashboardPage)));
      assert.ok(html.includes('Autenticando e carregando painel de gestão...'));
      assert.ok(!html.includes('Painel do Gestor • Central Executiva CMS'));
      assert.equal(requests, 0);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('preserva os totais oficiais mesmo quando apenas parte dos registros foi recebida', async () => {
    const originalFetch = globalThis.fetch;
    const queries: URL[] = [];
    globalThis.fetch = async (input, options) => {
      assert.equal(options?.method, 'GET');
      queries.push(new URL(String(input), 'http://test'));
      return serve(String(input));
    };
    try {
      const snapshot = await createAdminOverviewLoader()(true);
      assert.ok(snapshot);
      const state = applyOverviewSnapshot(createInitialOverviewState(), snapshot);
      const metrics = getOverviewMetrics(state);
      assert.equal(metrics.totalUsers, 120);
      assert.equal(metrics.usersCountLabel, 120);
      assert.equal(metrics.totalNews, 80);
      assert.equal(metrics.totalAvisos, 90);
      assert.equal(metrics.totalFotos, 280);
      assert.equal(metrics.totalCategorias, 12);
      assert.equal(metrics.totalEstados, 27);
      assert.equal(metrics.apiNewsPublishedCount, 1);
      assert.equal(metrics.apiNewsDraftCount, 1);
      assert.equal(metrics.apiAvisosAtivosCount, 2);
      assert.equal(metrics.apiAvisosUrgentesCount, 2);
      assert.equal(metrics.projectsCount, 3);
      assert.equal(metrics.projectMunicipalities, 2);
      assert.equal(metrics.bannersCount, 1);
      assert.equal(metrics.faqsCount, 1);
      for (const endpoint of ['usuarios', 'fotos_galeria', 'categorias_galeria', 'g_estados']) {
        const query = queries.find((url) => url.pathname.endsWith('/' + endpoint));
        assert.equal(query?.searchParams.get('page'), '1');
        assert.equal(query?.searchParams.get('per_page'), '1');
      }
      assert.equal(queries.find((url) => url.pathname.endsWith('/n_noticias'))?.searchParams.get('page'), 'all');
      assert.equal(queries.find((url) => url.pathname.endsWith('/a_avisos'))?.searchParams.get('page'), 'all');
      assert.equal(state.news.loading, false);
      assert.equal(state.news.error, null);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('distingue zero confirmado de ausência de leitura e não converte zero em fallback', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input) => serve(String(input), true);
    try {
      const snapshot = await createAdminOverviewLoader()(true);
      assert.ok(snapshot);
      const state = applyOverviewSnapshot(createInitialOverviewState(), snapshot);
      const metrics = getOverviewMetrics(state);
      for (const value of [metrics.totalUsers, metrics.totalNews, metrics.totalAvisos, metrics.totalFotos, metrics.totalCategorias, metrics.totalEstados]) {
        assert.equal(value, 0);
      }
      assert.equal(metrics.usersCountLabel, 0);
      assert.equal(state.users.loading, false);
      assert.equal(state.users.error, null);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('compartilha leituras concorrentes sem consultas de formulários ou perfis', async () => {
    const originalFetch = globalThis.fetch;
    const requests: string[] = [];
    globalThis.fetch = async (input) => { requests.push(String(input)); return serve(String(input)); };
    try {
      const read = createAdminOverviewLoader();
      const first = read(true);
      assert.equal(read(true), first);
      assert.equal(await read(false), null);
      assert.ok(await first);
      assert.equal(requests.length, 7);
      assert.equal(new Set(requests).size, 7);
      assert.ok(!requests.some((url) => /perfis|a_tipos_aviso|canais_contato/.test(url)));
      await read(true);
      assert.equal(requests.length, 14);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('isola falhas e preserva a última leitura válida, exibindo erro em vez de zero', async () => {
    const originalFetch = globalThis.fetch;
    try {
      const read = createAdminOverviewLoader();
      globalThis.fetch = async (input) => serve(String(input));
      const success = await read(true);
      assert.ok(success);
      const previous = applyOverviewSnapshot(createInitialOverviewState(), success);
      const loading = startOverviewLoading(previous);
      assert.equal(loading.users.loading, true);
      assert.equal(loading.users.data, 120);
      assert.equal(getOverviewMetrics(loading).usersCountLabel, '...');
      globalThis.fetch = async (input) => {
        if (String(input).includes('/usuarios')) return json({ success: false, message: 'Sem permissão', errors: ['sem_permissao'] }, 403);
        if (String(input).includes('/n_noticias')) throw new Error('Rede indisponível');
        return serve(String(input));
      };
      const failure = await read(true);
      assert.ok(failure);
      const after = applyOverviewSnapshot(loading, failure);
      assert.equal(after.users.loading, false);
      assert.ok(after.users.error);
      assert.equal(after.users.data, 120);
      assert.equal(getOverviewMetrics(after).usersCountLabel, 'Indisponível');
      assert.equal(after.news.data, previous.news.data);
      assert.ok(after.news.error?.includes('Falha de conexão com a API'));
      assert.equal(after.gallery.error, null);
      const initialFailure = applyOverviewSnapshot(createInitialOverviewState(), failure);
      assert.equal(initialFailure.users.data, null);
      assert.equal(initialFailure.news.data, null);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('recusa metadados inválidos sem substituir o total por array.length', async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const total of [undefined, -1, '120', 1.5]) {
        globalThis.fetch = async (input) => String(input).includes('/usuarios')
          ? json({ success: true, data: { items: items.usuarios, pagination: { total_count: total } } })
          : serve(String(input));
        const snapshot = await createAdminOverviewLoader()(true);
        assert.ok(snapshot);
        assert.ok(snapshot.users.error);
        assert.equal(snapshot.users.data, null);
      }
    } finally { globalThis.fetch = originalFetch; }
  });

  it('expõe falha da leitura legada sem impedir os indicadores oficiais válidos', async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const response of [new Response('', { status: 503 }), new Response('{}'), new Response('JSON inválido')]) {
        globalThis.fetch = async (input) => String(input) === '/api/data' ? response : serve(String(input));
        const snapshot = await createAdminOverviewLoader()(true);
        assert.ok(snapshot);
        assert.ok(snapshot.legacy.error);
        assert.equal(snapshot.legacy.data, null);
        assert.equal(snapshot.users.data, 120);
      }
    } finally { globalThis.fetch = originalFetch; }
  });
});

describe('Rota independente de Banners e seleção local protegida', () => {
  const source = {
    banners: [{ id: 'b1', imageUrl: '/banner.jpg', title: 'Banner recebido', linkUrl: '/noticias' }],
    siteInfo: { heroImage: '/hero.jpg', studioImage: '/studio.jpg', title: 'Não necessário' },
    news: [{ id: 'n1', title: 'Notícia recebida', coverImage: '/cover.jpg', content: 'Não necessário' }],
    gallery: [{ id: 'g1', title: 'Foto recebida', imageUrl: '/photo.jpg', description: 'Não necessário' }],
    users: [{ id: 'não necessário' }],
    projects: [],
  };

  it('aguarda autorização no shell sem consultar dados ou iniciar upload', () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => { requests += 1; throw new Error('Acesso ainda não autorizado.'); };
    try {
      const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: 'banners-test' };
      const html = renderToStaticMarkup(createElement(
        AppRouterContext.Provider, { value: router },
        createElement(PathnameContext.Provider, { value: '/admin/banners' }, createElement(AdminBannersSubroutePage)),
      ));
      assert.ok(html.includes('Autenticando e carregando painel de gestão...'));
      assert.ok(!html.includes('Carrossel de banners'));
      assert.equal(requests, 0);
      assert.equal(SECTION_CONFIG.fotos.href, '/admin/banners');
      assert.equal(getFolderIdForSection('fotos'), 'publicacoes');
      assert.equal(SECTION_CONFIG.galeria.href, '/admin/galeria');
    } finally { globalThis.fetch = originalFetch; }
  });

  it('encaminha fotos e variantes banners sem capturar as dez subrotas anteriores', () => {
    for (const key of ['tab', 'section']) {
      for (const id of ['fotos', 'banners']) {
        assert.equal(getLegacyBannersHref(new URLSearchParams({ [key]: id })), '/admin/banners');
      }
    }
    for (const id of ['noticias', 'kanban', 'usuarios', 'duvidas', 'projetos', 'avisos', 'galeria', 'redes', 'siteInfo', 'estadosCidades']) {
      assert.equal(getLegacyBannersHref(new URLSearchParams({ tab: id })), null);
    }
    assert.equal(getLegacyBannersHref(new URLSearchParams()), null);
    assert.equal(getLegacyBannersHref(new URLSearchParams('tab=galeria&section=fotos')), null);
  });

  it('faz somente GET cancelável da fonte legada e retém apenas os campos necessários', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    let requests = 0;
    globalThis.fetch = async (url, options) => {
      requests += 1;
      assert.equal(url, '/api/data');
      assert.equal(options?.method, 'GET');
      assert.equal(options?.cache, 'no-store');
      assert.equal(options?.signal, controller.signal);
      return new Response(JSON.stringify(source));
    };
    try {
      const result = await readAdminBanners(controller.signal);
      assert.deepEqual(result, {
        banners: source.banners,
        siteInfo: { heroImage: '/hero.jpg', studioImage: '/studio.jpg' },
        news: [{ id: 'n1', title: 'Notícia recebida', coverImage: '/cover.jpg' }],
        gallery: [{ id: 'g1', title: 'Foto recebida', imageUrl: '/photo.jpg' }],
      });
      assert.equal(requests, 1);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('preserva uma coleção vazia confirmada sem gerar banner substituto', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ ...source, banners: [], news: [], gallery: [] }));
    try {
      assert.deepEqual((await readAdminBanners()).banners, []);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('expõe falhas HTTP, rede, cancelamento, JSON e dados inválidos sem fallback', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => new Response('', { status: 403 });
      await assert.rejects(readAdminBanners(), /HTTP 403/);
      globalThis.fetch = async () => { throw new Error('Rede indisponível'); };
      await assert.rejects(readAdminBanners(), /Rede indisponível/);
      globalThis.fetch = async () => { throw new DOMException('Cancelado', 'AbortError'); };
      await assert.rejects(readAdminBanners(), { name: 'AbortError' });
      for (const payload of ['inválido', '{}', JSON.stringify({ ...source, banners: null }),
        JSON.stringify({ ...source, banners: [{ id: 'inválido' }] }),
        JSON.stringify({ ...source, siteInfo: {} }), JSON.stringify({ ...source, news: [{}] }),
        JSON.stringify({ ...source, gallery: [{}] })]) {
        globalThis.fetch = async () => new Response(payload);
        await assert.rejects(readAdminBanners(), /Resposta inválida/);
      }
    } finally { globalThis.fetch = originalFetch; }
  });

  it('a seleção usada por Banners prepara prévia local sem disparar upload ou gravação', async () => {
    const originalFetch = globalThis.fetch;
    const originalReader = Object.getOwnPropertyDescriptor(globalThis, 'FileReader');
    const file = new File(['imagem sintética apenas para teste'], 'banner.png', { type: 'image/png' });
    let requests = 0;
    let reads = 0;
    class LocalReader {
      result = 'data:image/png;base64,aW1hZ2Vt';
      onload: (() => void) | null = null;
      readAsDataURL(blob: Blob) {
        assert.equal(blob, file);
        reads += 1;
        queueMicrotask(() => this.onload?.());
      }
    }
    Object.defineProperty(globalThis, 'FileReader', { configurable: true, value: LocalReader });
    globalThis.fetch = async () => { requests += 1; throw new Error('Upload ou gravação proibidos.'); };
    try {
      const preview = await prepareLocalBannerPreview(file);
      assert.equal(preview?.imageUrl, 'data:image/png;base64,aW1hZ2Vt');
      assert.equal(preview?.title, 'banner.png');
      assert.equal(reads, 1);
      assert.equal(requests, 0);
      const html = renderToStaticMarkup(createElement(AdminLiveSimulator, { type: 'banner', data: preview! }));
      assert.ok(html.includes('data:image/png;base64,aW1hZ2Vt'));
      assert.ok(html.includes('banner.png'));
      assert.equal(requests, 0);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalReader) Object.defineProperty(globalThis, 'FileReader', originalReader);
      else Reflect.deleteProperty(globalThis, 'FileReader');
    }
  });

  it('trata cancelamento e arquivos inválidos antes de iniciar a leitura local', async () => {
    assert.equal(await prepareLocalBannerPreview(undefined), null);
    await assert.rejects(prepareLocalBannerPreview(new File(['texto'], 'banner.svg', { type: 'image/svg+xml' })), /JPEG, PNG, WEBP ou AVIF/);
    await assert.rejects(prepareLocalBannerPreview(new File([], 'vazio.png', { type: 'image/png' })), /até 5 MB/);
    await assert.rejects(prepareLocalBannerPreview(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' })), /até 5 MB/);
  });

  it('expõe falha de leitura da imagem sem retornar sucesso de upload', async () => {
    const originalReader = Object.getOwnPropertyDescriptor(globalThis, 'FileReader');
    class FailedReader {
      onerror: (() => void) | null = null;
      readAsDataURL() { queueMicrotask(() => this.onerror?.()); }
    }
    Object.defineProperty(globalThis, 'FileReader', { configurable: true, value: FailedReader });
    try {
      await assert.rejects(prepareLocalBannerPreview(new File(['imagem'], 'banner.png', { type: 'image/png' })), /Não foi possível ler a imagem/);
    } finally {
      if (originalReader) Object.defineProperty(globalThis, 'FileReader', originalReader);
      else Reflect.deleteProperty(globalThis, 'FileReader');
    }
  });
});

describe('Banners no gerenciador de fotos existente', () => {
  function renderBanners(banners: BannerItem[] = [], saving = false) {
    return renderToStaticMarkup(createElement(SitePhotosManager, {
      banners,
      siteInfo: { heroImage: '/hero-recebido.jpg', studioImage: '/estudio-recebido.jpg' },
      news: [{ id: 'capa-teste', title: 'Capa recebida', coverImage: '/capa-recebida.jpg' }],
      gallery: [{ id: 'foto-teste', title: 'Foto recebida', imageUrl: '/foto-recebida.jpg' }],
      saving,
    }));
  }

  it('renderiza somente a coleção recebida, preservando links e controles do carrossel', () => {
    const html = renderBanners([
      { id: 'banner-teste', title: 'Banner recebido', imageUrl: '/banner-recebido.jpg', linkUrl: '/destino-recebido' },
      { id: 'outro-banner', title: 'Outro banner', imageUrl: '/outro-banner.jpg' },
    ]);
    for (const text of ['Banner recebido', 'Outro banner', '/destino-recebido', 'Salvar link', 'Subir banner', 'Descer banner', 'Remover banner', 'Ver prévia no site']) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(html.includes('Capa recebida'));
    assert.ok(html.includes('Foto recebida'));
    assert.ok(html.includes('/estudio-recebido.jpg'));
    assert.ok(html.includes('Simulador do Site Oficial'));
    assert.equal((html.match(/aria-label="Remover banner"/g) || []).length, 2);
    assert.ok(!html.includes('role="dialog"'));
  });

  it('mantém a lista vazia e usa a imagem de referência apenas no simulador', () => {
    const html = renderBanners();
    assert.ok(html.includes('Carrossel de banners'));
    assert.ok(html.includes('/hero-recebido.jpg'));
    assert.ok(!html.includes('aria-label="Remover banner"'));
    assert.ok(!html.includes('name="destino"'));
    assert.ok(html.includes('Ou cole o link da imagem'));
    assert.ok(html.includes('Selecionar banner para prévia local'));
  });

  it('mostra o bloqueio e preserva seletores sem iniciar requisições ao renderizar', () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => {
      requests += 1;
      throw new Error('Renderizar Banners não deve iniciar leitura, upload ou gravação.');
    };
    try {
      const html = renderBanners([{ id: 'banner-teste', imageUrl: '/banner-recebido.jpg' }], true);
      assert.ok(html.includes('aguarda a disponibilização do endpoint oficial no backend Rails'));
      assert.ok(html.includes('a gravação deste módulo está bloqueada'));
      assert.ok(!html.includes('O envio vale na hora'));
      assert.ok(/<button[^>]*type="submit"[^>]*disabled=""[^>]*>Salvar link<\/button>/.test(html));
      assert.ok(html.includes('type="file"'));
      assert.ok(html.includes('accept="image/*"'));
      assert.equal(requests, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('Subrota administrativa de Projetos', () => {
  it('monta o shell e aguarda autorização sem iniciar leitura ou upload', () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => {
      requests += 1;
      throw new Error('Não deve iniciar requisições antes da autorização.');
    };
    try {
      const router = {
        back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: 'test',
      };
      const html = renderToStaticMarkup(createElement(
        AppRouterContext.Provider,
        { value: router },
        createElement(PathnameContext.Provider, { value: '/admin/projetos' }, createElement(AdminProjetosSubroutePage)),
      ));
      assert.ok(html.includes('Autenticando e carregando painel de gestão...'));
      assert.ok(!html.includes('Projetos Cadastrados'));
      assert.equal(requests, 0);
      assert.equal(SECTION_CONFIG.projetos.href, '/admin/projetos');
      assert.equal(getFolderIdForSection('projetos'), 'publicacoes');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('encaminha os links legados e preserva o atalho Novo sem capturar outros módulos', () => {
    for (const key of ['tab', 'section']) {
      assert.equal(getLegacyProjectsHref(new URLSearchParams({ [key]: 'projetos' })), '/admin/projetos');
      assert.equal(getLegacyProjectsHref(new URLSearchParams({ [key]: 'projetos', action: 'new' })), '/admin/projetos?action=new');
    }
    for (const id of ['noticias', 'kanban', 'usuarios', 'duvidas', 'faq', 'avisos', 'galeria', 'redes', 'siteInfo', 'estadosCidades']) {
      assert.equal(getLegacyProjectsHref(new URLSearchParams({ tab: id })), null);
    }
    assert.equal(getLegacyProjectsHref(new URLSearchParams()), null);
    assert.equal(getLegacyProjectsHref(new URLSearchParams('tab=noticias&section=projetos')), null);
  });

  it('extrai somente projetos da fonte administrativa com um GET cancelável', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    // Sem reconstruir o contrato de registro: a coleção deve ser preservada pela leitura.
    const records = [{ id: 'project-test', title: 'Projeto recebido' }];
    let requests = 0;
    globalThis.fetch = async (url, options) => {
      requests += 1;
      assert.equal(url, '/api/data');
      assert.equal(options?.method, 'GET');
      assert.equal(options?.signal, controller.signal);
      return new Response(JSON.stringify({ projects: records, faqs: [], siteInfo: {} }), { status: 200 });
    };
    try {
      assert.deepEqual(await readAdminProjects(controller.signal), records);
      assert.equal(requests, 1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('aceita uma lista vazia confirmada sem usar a coleção pública como fallback', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ projects: [] }), { status: 200 });
    try {
      assert.deepEqual(await readAdminProjects(), []);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('não transforma erros HTTP ou de rede em sucesso vazio', async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const status of [401, 403, 500]) {
        globalThis.fetch = async () => new Response(null, { status });
        await assert.rejects(readAdminProjects(), new RegExp(`HTTP ${status}`));
      }
      globalThis.fetch = async () => { throw new Error('Failed to fetch'); };
      await assert.rejects(readAdminProjects(), /Failed to fetch/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('rejeita JSON inválido ou coleção ausente, sem fallback silencioso', async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const payload of ['não é JSON', '{}', '{"items":[]}', '{"projects":null}']) {
        globalThis.fetch = async () => new Response(payload, { status: 200 });
        await assert.rejects(readAdminProjects(), /Resposta inválida/);
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('Módulo administrativo de Projetos', () => {
  function renderProjects(projects: ProjectMission[] = [], viewMode: ProjectViewMode = 'lista') {
    return renderToStaticMarkup(createElement(ProjectsModule, {
      projects, viewMode, onViewModeChange: () => {},
    }));
  }

  it('exibe lista vazia e bloqueio de persistência sem inserir projetos substitutos', () => {
    const html = renderProjects();
    assert.ok(html.includes('Projetos Cadastrados (0)'));
    assert.ok(html.includes('Nenhum projeto encontrado com os filtros atuais'));
    assert.ok(html.includes('criação, edição e exclusão de projetos pedagógicos'));
    assert.ok(html.includes('desabilitadas aguardando suporte oficial do backend Rails'));
  });

  it('renderiza os projetos recebidos com identificação, escola e ações existentes', () => {
    const project: ProjectMission = {
      id: 'project-test', number: '09', missionCode: 'Projeto 09', title: 'Projeto recebido',
      shortTitle: 'Título curto recebido', track: 'Ciência na Amazônia',
      territory: 'Território de teste', typology: 'Tipologia de teste', municipality: 'Município de teste',
      school: 'Escola de teste', mediatorName: 'Docente de teste', mediatorRole: 'Docente',
      mediatorInitials: 'DT', studentCohort: 'Turma de teste', seal: 'Selo de teste',
      image: '/hero.jpg', initialApplause: 0,
      desafioLocal: { title: 'Desafio de teste', description: '' },
      praticaMedtec: { title: 'Prática de teste', description: '' },
      impactoGerado: { title: '', metric: '', description: '' },
      competencias: ['Competência de teste'], quote: '',
      replicationGuide: { materials: [], timeline: [], pedagogicalTip: '' },
    };
    const html = renderProjects([project]);
    for (const text of ['Projetos Cadastrados (1)', 'Projeto recebido', 'Escola de teste', 'Município de teste', 'Docente de teste', 'Competência de teste']) {
      assert.ok(html.includes(text));
    }
    assert.ok(html.includes('Editar dados da missão'));
    assert.ok(html.includes('Excluir projeto'));
    assert.ok(html.includes('href="/projetos"'));
    assert.ok(!html.includes('Nenhum projeto encontrado'));
  });

  it('mantém formulário, upload e prévia sem habilitar a gravação de projetos', () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => {
      requests += 1;
      throw new Error('Renderizar o editor não deve iniciar uploads ou gravações.');
    };
    try {
      const html = renderProjects([], 'editor');
      assert.ok(/<button[^>]*type="submit"[^>]*disabled=""/.test(html));
      assert.ok(html.includes('Aguardando Endpoint da API'));
      assert.ok(html.includes('type="file"'));
      assert.ok(html.includes('Simulação no Portal Público'));
      assert.ok(html.includes('Integração com Backend Pendente'));
      assert.equal(requests, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('Subrota administrativa de FAQ', () => {
  it('monta o shell e aguarda autenticação sem iniciar a leitura restrita', () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => {
      requests += 1;
      throw new Error('A leitura não deve iniciar durante a montagem não autenticada.');
    };
    try {
      const router = {
        back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: 'test',
      };
      const html = renderToStaticMarkup(createElement(
        AppRouterContext.Provider,
        { value: router },
        createElement(PathnameContext.Provider, { value: '/admin/faq' }, createElement(AdminFaqSubroutePage)),
      ));
      assert.ok(html.includes('Autenticando e carregando painel de gestão...'));
      assert.ok(!html.includes('Dúvidas Cadastradas'));
      assert.equal(requests, 0);
      assert.equal(SECTION_CONFIG.duvidas.href, '/admin/faq');
      assert.equal(getFolderIdForSection('duvidas'), 'publicacoes');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('encaminha os quatro links legados de FAQ sem capturar as outras seções', () => {
    for (const key of ['tab', 'section']) {
      for (const id of ['faq', 'duvidas']) {
        assert.equal(getLegacyFaqHref(new URLSearchParams({ [key]: id })), '/admin/faq');
      }
    }
    for (const id of ['noticias', 'kanban', 'usuarios', 'avisos', 'galeria', 'redes', 'siteInfo', 'estadosCidades']) {
      assert.equal(getLegacyFaqHref(new URLSearchParams({ tab: id })), null);
    }
    assert.equal(getLegacyFaqHref(new URLSearchParams()), null);
    assert.equal(getLegacyFaqHref(new URLSearchParams('tab=noticias&section=faq')), null);
  });

  it('lê somente a coleção FAQ da fonte administrativa existente, com GET cancelável', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const item: FaqItem = {
      id: 'faq-test', index: '01', question: 'Pergunta recebida', answer: 'Resposta recebida',
      category: 'Metodologia & Aulas ao Vivo', personas: ['estudantes'], tags: [],
    };
    let requests = 0;
    globalThis.fetch = async (url, options) => {
      requests += 1;
      assert.equal(url, '/api/data');
      assert.equal(options?.method, 'GET');
      assert.equal(options?.signal, controller.signal);
      return new Response(JSON.stringify({ faqs: [item], siteInfo: { title: 'Não utilizado' } }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    };
    try {
      assert.deepEqual(await readAdminFaqs(controller.signal), [item]);
      assert.equal(requests, 1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('aceita lista vazia confirmada como resultado válido', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ faqs: [] }), { status: 200 });
    try {
      assert.deepEqual(await readAdminFaqs(), []);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('propaga falhas de sessão, permissão, servidor e rede sem substituir por lista vazia', async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const status of [401, 403, 500]) {
        globalThis.fetch = async () => new Response(null, { status });
        await assert.rejects(readAdminFaqs(), new RegExp(`HTTP ${status}`));
      }
      globalThis.fetch = async () => { throw new Error('Failed to fetch'); };
      await assert.rejects(readAdminFaqs(), /Failed to fetch/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('rejeita resposta inválida em vez de aceitar o handler público vazio como fallback', async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const payload of ['não é JSON', '{}', '{"items":[]}', '{"faqs":null}']) {
        globalThis.fetch = async () => new Response(payload, { status: 200 });
        await assert.rejects(readAdminFaqs(), /Resposta inválida/);
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('FAQ administrativo extraído', () => {
  function renderFaq(faqs: FaqItem[] = [], viewMode: FaqViewMode = 'lista') {
    return renderToStaticMarkup(createElement(FaqModule, {
      faqs, viewMode, onViewModeChange: () => {},
    }));
  }

  it('exibe estado vazio e explica o bloqueio de gravação sem dados substitutos', () => {
    const html = renderFaq();
    assert.ok(html.includes('Dúvidas Cadastradas (0)'));
    assert.ok(html.includes('Nenhuma dúvida encontrada'));
    assert.ok(html.includes('criação, edição e exclusão'));
    assert.ok(html.includes('desabilitadas aguardando suporte oficial do backend Rails'));
  });

  it('renderiza a coleção recebida com categoria, público, tags e link', () => {
    const html = renderFaq([{
      id: 'faq-test', index: '07', question: 'Pergunta recebida', answer: 'Resposta recebida',
      category: 'Legislação & Diretrizes', personas: ['gestores'], tags: ['normas'],
      actionLink: { label: 'Consultar orientações', href: '/transparencia' },
    }]);
    for (const text of ['Pergunta recebida', 'Resposta recebida', 'gestores', '#normas', 'Consultar orientações']) {
      assert.ok(html.includes(text));
    }
    assert.ok(html.includes('Dúvidas Cadastradas (1)'));
    assert.ok(!html.includes('Nenhuma dúvida encontrada'));
  });

  it('mantém envio desabilitado e a prévia sem promessa de publicação', () => {
    const html = renderFaq([], 'editor');
    assert.ok(/<button[^>]*type="submit"[^>]*disabled=""/.test(html));
    assert.ok(html.includes('Aguardando Endpoint da API'));
    assert.ok(html.includes('Prévia sem publicação'));
    assert.ok(html.includes('Esta prévia não altera o portal.'));
    assert.ok(!html.includes('Disponibilidade Imediata'));
  });
});

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
