/**
 * Testes Unitários Automatizados da Camada Central de Integração MEDTEC
 * Executado pelo test runner nativo do Node.js: npx tsx --test tests/api-client.test.ts
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { ModuleKind, transpileModule } from 'typescript';
import nextConfig from '../next.config';
import { NextRequest, NextResponse } from 'next/server';
import AdminLoginPage from '../src/app/admin/login/page';
import { POST as authRoutePost } from '../src/app/api/auth/route';
import { railsApiFetch } from '../src/lib/rails-backend';
import PublicAvisosPage from '../src/app/avisos/page';
import PublicAoVivoPage from '../src/app/ao-vivo/page';
import AvisosView from '../src/components/AvisosView';
import { useDialogFocus } from '../src/components/useDialogFocus';
import HomeProjectsAccordionSection from '../src/components/HomeProjectsAccordionSection';
import CommunityMuralSection from '../src/components/CommunityMuralSection';
import ExecutiveDossierModal from '../src/components/ExecutiveDossierModal';
import LiveBroadcastSection from '../src/components/LiveBroadcastSection';
import type { AvisoPublico, PublicoAvisosParams } from '../src/lib/api/types';
import * as adminAuthNavigation from '../src/lib/admin-auth-navigation';
import { Sun, Moon } from 'lucide-react';
import React, { createElement, isValidElement, type ReactNode } from 'react';
import { jsx } from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { PathnameContext, SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import AdminFaqSubroutePage from '../src/app/admin/faq/page';
import AdminProjetosLayout from '../src/app/admin/projetos/layout';
import TemasProjetoPanel from '../src/components/admin/TemasProjetoPanel';
import MembrosProjetoPanel from '../src/components/admin/MembrosProjetoPanel';
import AdminBannersSubroutePage from '../src/app/admin/banners/page';
import AdminDashboardRoute from '../src/app/admin/page';
import DesktopSidebarContainer from '../src/components/admin/DesktopSidebarContainer';
import MobileDrawerFooter, { type MobileDrawerFooterProps } from '../src/components/admin/MobileDrawerFooter';
import NextLink from 'next/link';
import { ExternalLink, LogOut } from 'lucide-react';
import {
  ADMIN_STATIC_TAB_ALIASES,
  ADMIN_STATIC_ROUTE_ALIASES,
  getAdminStaticAlias,
  resolveAdminStaticAlias,
  getAdminStaticAliasFromParams,
  getAdminRouteAlias,
} from '../src/lib/admin-aliases';
import SidebarNavItem, { type SidebarNavItemProps } from '../src/components/admin/SidebarNavItem';
import SidebarFolderAccordion, { type SidebarFolderAccordionProps, type NavFolderDef } from '../src/components/admin/SidebarFolderAccordion';
import AdminOverview, { type AdminOverviewProps } from '../src/components/admin/AdminOverview';
import type { OverviewStatsIndicators } from '../src/components/admin/OverviewStats';
import OverviewStats from '../src/components/admin/OverviewStats';
import EditorialKanban from '../src/components/EditorialKanban';
import UserManager from '../src/components/UserManager';
import SitePhotosManager from '../src/components/SitePhotosManager';
import FaqModule from '../src/components/admin/FaqModule';
import AnnouncementsModule, { type AnnouncementsModuleProps } from '../src/components/admin/AnnouncementsModule';
import GalleryModule, { type GalleryModuleProps } from '../src/components/admin/GalleryModule';
import AdminAvisosPage from '../src/app/admin/avisos/page';
import AdminGaleriaPage from '../src/app/admin/galeria/page';
import EstadosCidadesModule from '../src/components/admin/EstadosCidadesModule';
import type { ATipoAviso, AAviso, FotoGaleria, CategoriaGaleria, Estado } from '../src/lib/api/types';
import DuvidasVisitanteModule from '../src/components/admin/DuvidasVisitanteModule';
import { notifyDuvidasPendentes, useDuvidasPendentes } from '../src/components/admin/useDuvidasPendentes';
import FaqCentralSection from '../src/components/FaqCentralSection';
import DuvidaVisitanteForm from '../src/components/DuvidaVisitanteForm';
import PublicFaqPage from '../src/app/faq/page';
import PublicDuvidasPage from '../src/app/duvidas/page';
import FaqSection from '../src/components/FaqSection';
import DuvidaCategoriesManager from '../src/components/admin/DuvidaCategoriesManager';
import type { DCategoriaDuvida, DDuvida, DDuvidaInput } from '../src/lib/api/types';
import type { DDuvidaVisitante, PjProjetoInput, PjProjetoMembro } from '../src/lib/api/types';
import { diffProjetoMembros, formatCpf, formatFileSize, getProjetoImageSrc, hasMembroDuplicado, isValidCpf, maskCpf, PROJETO_ANEXO_MAX_BYTES, validateProjetoAnexo } from '../src/lib/projetos-content';
import type { DuvidaPublica, CategoriaDuvidaPublica, DuvidaVisitantePublicaInput } from '../src/lib/api/types';
import ProjetosPanel from '../src/components/admin/ProjetosPanel';
import ProjetoMembrosEditor from '../src/components/admin/ProjetoMembrosEditor';
import ProjetosApprovalQueue from '../src/components/admin/ProjetosApprovalQueue';
import type { AdminUsersData } from '../src/components/admin/useAdminUsers';
import AdminShell, { canAccessAdminUsers, getFolderIdForSection, SECTION_CONFIG, type AdminSection as ShellAdminSection, type AdminSession, type AdminShellProps } from '../src/components/admin/AdminShell';
import { ADMIN_SUBROUTE_GROUPS, buildAdminMenu, SECTION_CONFIG as SHARED_SECTION_CONFIG, SECTION_HREFS, type AdminSection } from '../src/lib/admin-navigation';
import { useAdminTheme } from '../src/components/admin/useAdminTheme';
import { filterAdminNavigation } from '../src/lib/admin-navigation-filter';
import type { BannerItem, FaqItem, NewsItem } from '../src/types';

import {
  buildQueryString,
  getMediaUrl,
  apiFetch,
  getApiBaseUrl,
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
import { getLegacyProjectsHref } from '../src/lib/admin-projects';
import { getLegacyBannersHref, readAdminBanners, readBannerNews, readBannerGallery, prepareLocalBannerPreview,
  type AdminBannersData, type BannerNewsCover, type BannerGalleryPhoto } from '../src/lib/admin-banners';
import AdminLiveSimulator from '../src/components/AdminLiveSimulator';
import { applyOverviewSnapshot, createAdminOverviewLoader, createInitialOverviewState, getOverviewHighlights, getOverviewMetrics, startOverviewLoading } from '../src/lib/admin-overview';
import AdminRedesSubroutePage from '../src/app/admin/redes/page';
import SocialChannelsModule, { type SocialChannelsModuleProps } from '../src/components/admin/SocialChannelsModule';
import { ADMIN_CHANNEL_KEYS, getChannelChanges, readAdminChannels, saveAdminChannels } from '../src/lib/admin-channels';
import type { CanalContato } from '../src/lib/api';
import SiteFooter from '../src/components/SiteFooter';
import FloatingSocialRotator from '../src/components/FloatingSocialRotator';
import PublicGaleriaPage from '../src/app/galeria/page';
import PublicAcervoPage from '../src/app/acervo/page';
import PublicRedesPage from '../src/app/redes/page';
import GallerySection from '../src/components/GallerySection';
import SocialSection from '../src/components/SocialSection';
import PublicNoticiasPage from '../src/app/noticias/page';
import PublicNoticiaDetalhePage, { generateMetadata as generateNoticiaMetadata } from '../src/app/noticias/[id]/page';
import NewsEditorialSection from '../src/components/NewsEditorialSection';
import NewsModule from '../src/components/admin/NewsModule';
import NewsViewTracker, { recordNewsView } from '../src/components/NewsViewTracker';
import type { NoticiaPublica, CategoriaPublica } from '../src/lib/api/types';
import AdminInstitucionalSubroutePage from '../src/app/admin/institucional/page';
import HomePillarsModule, { HomePillarsPreviewRenderer } from '../src/components/admin/HomePillarsModule';
import TechAdvantages from '../src/components/TechAdvantages';
import {
  createInitialHomePillarsDraft,
  getInitialHomePillarByKey,
  getBentoColSpanForPosition,
  moveHomePillarItem,
  hasHomePillarItemChanges,
  hasHomePillarsChanges,
  validateHomePillarsDraft,
  HOME_PILLARS_LIMITS,
  PILLAR_ICON_OPTIONS,
  PILLAR_VARIANT_OPTIONS,
} from '../src/lib/admin-home-pillars';
import AdminProfessoresSubroutePage from '../src/app/admin/professores/page';
import AdminDisciplinasSubroutePage from '../src/app/admin/professores/disciplinas/page';
import AdminRelatosSubroutePage from '../src/app/admin/professores/relatos/page';
import AdminAlunosSubroutePage from '../src/app/admin/alunos/page';
import AdminCategoriasConquistaSubroutePage from '../src/app/admin/alunos/categorias/page';
import ProfessoresPanel from '../src/components/admin/ProfessoresPanel';
import RelatosPanel from '../src/components/admin/RelatosPanel';
import ConquistasPanel from '../src/components/admin/ConquistasPanel';
import CommunityApprovalQueue from '../src/components/admin/CommunityApprovalQueue';
import DuvidasVisitanteQueue from '../src/components/admin/DuvidasVisitanteQueue';
import VisitanteFaqDraftLoader from '../src/components/admin/VisitanteFaqDraftLoader';
import RelatoProfessorForm from '../src/components/RelatoProfessorForm';
import AlunosView from '../src/components/AlunosView';
import ProfessoresView from '../src/components/ProfessoresView';
import TeacherProfiles from '../src/components/TeacherProfiles';
import CommunityComingSoon from '../src/components/CommunityComingSoon';
import StudentStories from '../src/components/StudentStories';
import ProfessorDetalhePage from '../src/app/professores/[id]/page';
import type { ConquistaPublica, ProfessorPublico } from '../src/lib/api/types';
import {
  CONQUISTA_IMAGE_MAX_BYTES,
  getConquistaImageSrc,
  getNameInitials,
  isHttpsUrl,
  validateConquistaImage,
} from '../src/lib/community-content';

// Inclui dados fora do contrato Rails para caracterizar as comparações em
// runtime. O helper de produção continuará usando os tipos Rails existentes.
const railsGestorCases: [string, Readonly<Record<string, unknown>>, boolean][] = [
  ['nome Administrador', { id: 100, perfil_id: 2, perfil_nome: 'Administrador' }, true],
  ['perfil_id numérico 3', { id: 100, perfil_id: 3, perfil_nome: 'Editor de Notícias' }, true],
  ['id numérico 1', { id: 1, perfil_id: 2, perfil_nome: 'Editor de Notícias' }, true],
  ['Editor', { id: 100, perfil_id: 2, perfil_nome: 'Editor de Notícias' }, false],
  ['Curador', { id: 100, perfil_id: 2, perfil_nome: 'Curador de Fotos' }, false],
  ['Publicador', { id: 100, perfil_id: 2, perfil_nome: 'Publicador de Avisos' }, false],
  ['Operador', { id: 100, perfil_id: 2, perfil_nome: 'Operador de Conteúdo' }, false],
  ['Gestor literal', { id: 100, perfil_id: 2, perfil_nome: 'Gestor' }, false],
  ['Administrador inativo', { id: 100, perfil_id: 2, perfil_nome: 'Administrador', ativo: false }, true],
  ['campos ausentes', {}, false],
  ['campos nulos', { id: null, perfil_id: null, perfil_nome: null }, false],
  ['nome ausente com id 1', { id: 1 }, true],
  ['nome nulo com perfil_id 3', { id: 100, perfil_id: 3, perfil_nome: null }, true],
  ['IDs em texto', { id: '1', perfil_id: '3', perfil_nome: 'Gestor' }, false],
  ['perfil_id em texto', { id: 100, perfil_id: '3', perfil_nome: 'Editor de Notícias' }, false],
  ['id em texto', { id: '1', perfil_id: 2, perfil_nome: 'Editor de Notícias' }, false],
  ['Administrador com IDs em texto', { id: '100', perfil_id: '2', perfil_nome: 'Administrador' }, true],
  ['nome em minúsculas', { id: 100, perfil_id: 2, perfil_nome: 'administrador' }, false],
  ['nome em maiúsculas', { id: 100, perfil_id: 2, perfil_nome: 'ADMINISTRADOR' }, false],
  ['espaço antes do nome', { id: 100, perfil_id: 2, perfil_nome: ' Administrador' }, false],
  ['espaço depois do nome', { id: 100, perfil_id: 2, perfil_nome: 'Administrador ' }, false],
  ['nome vazio', { id: 100, perfil_id: 2, perfil_nome: '' }, false],
  ['Gestor literal com id 1', { id: 1, perfil_id: 2, perfil_nome: 'Gestor' }, true],
  ['Curador com perfil_id 3', { id: 100, perfil_id: 3, perfil_nome: 'Curador de Fotos' }, true],
  ['id numérico vence perfil_id em texto', { id: 1, perfil_id: '3', perfil_nome: 'Operador de Conteúdo' }, true],
  ['todas as condições', { id: 1, perfil_id: 3, perfil_nome: 'Administrador' }, true],
];

function railsClassificationReply(fields: Readonly<Record<string, unknown>>): Awaited<ReturnType<typeof medtecApi.auth.me>> {
  // Simula a desserialização da resposta HTTP, incluindo campos ausentes ou
  // inválidos, sem ampliar o contrato AuthUser usado em produção.
  return JSON.parse(JSON.stringify({ success: true, message: 'Sessão sintética', data: {
    nome: 'Usuário sintético', cpf: 'identificador-sintetico', ativo: true, ...fields,
  } }));
}

describe('Classificação Rails compartilhada (12D-5 Lote 1)', () => {
  for (const [label, fields, expected] of railsGestorCases) {
    it(label, async () => {
      const { isRailsGestor } = await import('../src/lib/admin-session');
      const input = Object.freeze({ ...fields });
      const before = JSON.stringify(input);
      assert.equal(Reflect.apply(isRailsGestor, undefined, [input]), expected);
      assert.equal(Reflect.apply(isRailsGestor, undefined, [input]), expected);
      assert.equal(JSON.stringify(input), before);
    });
  }

  it('executa isolado sem imports de runtime, React, navegador, sessão ou serviços', () => {
    const source = readFileSync('src/lib/admin-session.ts', 'utf8');
    const { outputText } = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } });
    const isolated: { exports: { isRailsGestor?: (user: unknown) => boolean } } = { exports: {} };
    for (const key of ['require', 'window', 'document', 'localStorage', 'sessionStorage', 'fetch',
      'cookies', 'process', 'React', 'setTimeout', 'setInterval']) {
      Object.defineProperty(isolated, key, { get() { throw new Error(`Acesso indevido: ${key}`); } });
    }
    runInNewContext(outputText, isolated, { timeout: 1000 });
    const classify = isolated.exports.isRailsGestor;
    assert.equal(typeof classify, 'function');
    for (const [, fields, expected] of railsGestorCases) {
      assert.equal(classify?.(Object.freeze({ ...fields })), expected);
    }
  });
});

type CommonSessionSnapshot = { isGestor: boolean; username: unknown; name: unknown; profileType: unknown };
type SessionProjectionCase = { label: string; data: unknown; expected: CommonSessionSnapshot; role?: unknown; pageRenderError?: boolean };
const railsSessionFieldCases: SessionProjectionCase[] = [
  ...railsGestorCases.map(([label, fields, isGestor]) => ({
    label, data: railsClassificationReply(fields).data,
    expected: { isGestor, username: 'identificador-sintetico', name: 'Usuário sintético', profileType: fields.perfil_nome },
  })),
  { label: 'nome e identificação ausentes', data: { id: 100, perfil_id: 2, perfil_nome: 'Editor de Notícias' },
    expected: { isGestor: false, username: undefined, name: undefined, profileType: 'Editor de Notícias' } },
  { label: 'nome e identificação vazios', data: { id: 100, perfil_id: 2, perfil_nome: 'Editor de Notícias', cpf: '', nome: '' },
    expected: { isGestor: false, username: '', name: '', profileType: 'Editor de Notícias' } },
  { label: 'campos comuns nulos', data: { id: null, perfil_id: null, perfil_nome: null, cpf: null, nome: null },
    expected: { isGestor: false, username: null, name: null, profileType: null } },
  { label: 'valores inesperados sem coerção', data: { id: '1', perfil_id: '3', perfil_nome: false, cpf: 42, nome: 17 }, pageRenderError: true,
    expected: { isGestor: false, username: 42, name: 17, profileType: false } },
  { label: 'campos adicionais não substituem origem Rails',
    data: { perfil_nome: 'Administrador', cpf: 'rails-sintetico', nome: 'Nome Rails', role: 'Papel extra', editorialProfile: 'Perfil extra', apiUser: {}, user: 'Usuário extra' },
    expected: { isGestor: true, username: 'rails-sintetico', name: 'Nome Rails', profileType: 'Administrador' } },
  { label: 'data como texto não vazio', data: 'resposta-sintetica',
    expected: { isGestor: false, username: undefined, name: undefined, profileType: undefined } },
  { label: 'data como array', data: [],
    expected: { isGestor: false, username: undefined, name: undefined, profileType: undefined } },
];
const localSessionFieldCases: SessionProjectionCase[] = [
  { label: 'gestora', data: { isGestor: true, user: 'local-sintetico', name: 'Nome local', profileType: 'Gestor Geral', role: 'gestor' }, role: 'gestor',
    expected: { isGestor: true, username: 'local-sintetico', name: 'Nome local', profileType: 'Gestor Geral' } },
  { label: 'isGestor false', data: { isGestor: false, user: 'local-sintetico', name: 'Editor local', profileType: 'Editor de Notícias', role: 'operador' }, role: 'operador',
    expected: { isGestor: false, username: 'local-sintetico', name: 'Editor local', profileType: 'Editor de Notícias' } },
  { label: 'isGestor ausente', data: { user: 'local-sintetico', name: 'Nome local', profileType: 'Gestor' },
    expected: { isGestor: true, username: 'local-sintetico', name: 'Nome local', profileType: 'Gestor' } },
  { label: 'campos ausentes', data: {},
    expected: { isGestor: true, username: undefined, name: undefined, profileType: undefined } },
  { label: 'authenticated false', data: { authenticated: false },
    expected: { isGestor: true, username: undefined, name: undefined, profileType: undefined } },
  { label: 'nome ausente', data: { isGestor: false, user: 'local-sintetico', profileType: 'Curador de Fotos' },
    expected: { isGestor: false, username: 'local-sintetico', name: undefined, profileType: 'Curador de Fotos' } },
  { label: 'nome vazio', data: { isGestor: false, user: '', name: '', profileType: 'Publicador de Avisos' },
    expected: { isGestor: false, username: '', name: '', profileType: 'Publicador de Avisos' } },
  { label: 'campos nulos', data: { isGestor: null, user: null, name: null, profileType: null, role: null }, role: null,
    expected: { isGestor: true, username: null, name: null, profileType: null } },
  { label: 'isGestor em texto', data: { isGestor: 'false', user: 42, name: 17, profileType: false, role: 9 }, role: 9, pageRenderError: true,
    expected: { isGestor: true, username: 42, name: 17, profileType: false } },
  { label: 'isGestor zero', data: { isGestor: 0 },
    expected: { isGestor: true, username: undefined, name: undefined, profileType: undefined } },
  { label: 'campos adicionais não viram apiUser ou editorialProfile',
    data: { isGestor: false, user: 'local-sintetico', name: 'Operador local', profileType: 'Operador de Conteúdo', role: 'Papel local', apiUser: { perfil_nome: 'Administrador', ativo: true }, editorialProfile: 'Administrador' }, role: 'Papel local',
    expected: { isGestor: false, username: 'local-sintetico', name: 'Operador local', profileType: 'Operador de Conteúdo' } },
  { label: 'nomes Rails não são aliases locais', data: { cpf: 'ignorado', nome: 'ignorado', perfil_nome: 'Administrador', username: 'ignorado' },
    expected: { isGestor: true, username: undefined, name: undefined, profileType: undefined } },
  { label: 'resposta em texto', data: 'resposta-sintetica',
    expected: { isGestor: true, username: undefined, name: undefined, profileType: undefined } },
  { label: 'resposta false', data: false,
    expected: { isGestor: true, username: undefined, name: undefined, profileType: undefined } },
  { label: 'resposta zero', data: 0,
    expected: { isGestor: true, username: undefined, name: undefined, profileType: undefined } },
  { label: 'resposta em array', data: [],
    expected: { isGestor: true, username: undefined, name: undefined, profileType: undefined } },
];

describe('Campos comuns de sessão (12D-5 Lote 2)', () => {
  for (const [source, cases] of [['Rails', railsSessionFieldCases], ['local', localSessionFieldCases]] as const) {
    for (const { label, data, expected } of cases) {
      it(`${source}: ${label}`, async () => {
        const helpers = await import('../src/lib/admin-session');
        const project = source === 'Rails' ? helpers.getRailsSessionFields : helpers.getLocalSessionFields;
        const input = Object.freeze(structuredClone(data));
        const before = structuredClone(input);
        const result = Reflect.apply(project, undefined, [input]);
        assert.deepEqual(result, expected);
        assert.deepEqual(Reflect.apply(project, undefined, [input]), expected);
        assert.deepEqual(input, before);
        assert.notEqual(result, input);
        assert.deepEqual(Object.keys(result), ['isGestor', 'username', 'name', 'profileType']);
      });
    }
  }

  it('não converte entrada nula ou indefinida em uma sessão', async () => {
    const helpers = await import('../src/lib/admin-session');
    for (const project of [helpers.getRailsSessionFields, helpers.getLocalSessionFields]) {
      for (const input of [null, undefined]) {
        assert.throws(() => Reflect.apply(project, undefined, [input]), TypeError);
      }
    }
  });

  it('projeta em isolamento sem runtime externo nem mutações', () => {
    const source = readFileSync('src/lib/admin-session.ts', 'utf8');
    const { outputText } = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } });
    const isolated: { exports: Record<string, (input: unknown) => CommonSessionSnapshot> } = { exports: {} };
    for (const key of ['require', 'window', 'document', 'localStorage', 'sessionStorage', 'fetch', 'cookies', 'process', 'React', 'setTimeout']) {
      Object.defineProperty(isolated, key, { get() { throw new Error(`Acesso indevido: ${key}`); } });
    }
    runInNewContext(outputText, isolated, { timeout: 1000 });
    for (const [name, cases] of [['getRailsSessionFields', railsSessionFieldCases], ['getLocalSessionFields', localSessionFieldCases]] as const) {
      for (const { data, expected } of cases) {
        const input = Object.freeze(structuredClone(data));
        const before = structuredClone(input);
        assert.deepEqual({ ...isolated.exports[name](input) }, expected);
        assert.deepEqual(input, before);
      }
    }
  });
});

type EditorialTestDecision = { method: 'push' | 'replace'; href: string } | null;
const editorialProfileCases: {
  label: string; isGestor: boolean; profileType: string | null | undefined;
  expected: EditorialTestDecision; localOnly?: boolean; inactive?: boolean;
}[] = [
  { label: 'Administrador', isGestor: true, profileType: 'Administrador', expected: null },
  { label: 'gestor por heurística com perfil Editor', isGestor: true, profileType: 'Editor de Notícias', expected: null },
  { label: 'gestor sem perfil', isGestor: true, profileType: undefined, expected: null },
  { label: 'Administrador Rails inativo', isGestor: true, profileType: 'Administrador', expected: null, inactive: true },
  { label: 'Editor', isGestor: false, profileType: 'Editor de Notícias', expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'Curador', isGestor: false, profileType: 'Curador de Fotos', expected: { method: 'replace', href: '/admin/banners' } },
  { label: 'Publicador', isGestor: false, profileType: 'Publicador de Avisos', expected: { method: 'push', href: '/admin/avisos' } },
  { label: 'Operador', isGestor: false, profileType: 'Operador de Conteúdo', expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'Gestor literal', isGestor: false, profileType: 'Gestor', expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'perfil desconhecido', isGestor: false, profileType: 'Perfil sintético', expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'perfil ausente', isGestor: false, profileType: undefined, expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'perfil nulo', isGestor: false, profileType: null, expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'perfil vazio', isGestor: false, profileType: '', expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'Curador em minúsculas', isGestor: false, profileType: 'curador de fotos', expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'Publicador em maiúsculas', isGestor: false, profileType: 'PUBLICADOR DE AVISOS', expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'espaço antes de Curador', isGestor: false, profileType: ' Curador de Fotos', expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'espaço depois de Publicador', isGestor: false, profileType: 'Publicador de Avisos ', expected: { method: 'replace', href: '/admin/noticias' } },
  { label: 'Administrador local explicitamente não gestor', isGestor: false, profileType: 'Administrador', expected: { method: 'replace', href: '/admin/noticias' }, localOnly: true },
];
const editorialQueryCases: [string, string][] = [
  ['', '/admin/noticias'],
  ['action=new', '/admin/noticias?action=new'],
  ['mode=editor', '/admin/noticias?action=new'],
  ['mode=new', '/admin/noticias?action=new'],
  ['mode=nova', '/admin/noticias?action=new'],
  ['action=list&mode=editor', '/admin/noticias?action=new'],
  ['action=new&mode=lista', '/admin/noticias?action=new'],
  ['action=NEW&mode=EDITOR', '/admin/noticias'],
  ['action=%20new&mode=editor%20', '/admin/noticias'],
  ['action=list&action=new&mode=lista', '/admin/noticias'],
  ['action=new&action=list', '/admin/noticias?action=new'],
  ['mode=lista&mode=editor', '/admin/noticias'],
  ['mode=nova&mode=lista', '/admin/noticias?action=new'],
  ['action=&action=new', '/admin/noticias'],
  ['mode=&mode=editor', '/admin/noticias'],
  ['edit=42&extra=1&extra=2', '/admin/noticias'],
  ['mode=lista&redirect=https%3A%2F%2Finvalid.example', '/admin/noticias'],
  ['tab=invalido&section=noticias&mode=nova', '/admin/noticias?action=new'],
];

describe('Decisão editorial pura (12D-5 Lote 3)', () => {
  for (const { label, isGestor, profileType, expected } of editorialProfileCases) {
    it(label, async () => {
      const { getAdminEditorialDestination } = await import('../src/lib/admin-auth-navigation');
      const params = new URLSearchParams();
      assert.deepEqual(Reflect.apply(getAdminEditorialDestination, undefined, [isGestor, profileType, params]), expected);
    });
  }
  for (const [query, href] of editorialQueryCases) {
    it(`query ${query || '(ausente)'} mantém destino, método e entrada`, async () => {
      const { getAdminEditorialDestination } = await import('../src/lib/admin-auth-navigation');
      const params = Object.freeze(new URLSearchParams(query));
      const before = params.toString();
      for (const profile of ['Editor de Notícias', 'Operador de Conteúdo', 'Gestor', undefined]) {
        assert.deepEqual(getAdminEditorialDestination(false, profile, params), { method: 'replace', href });
        assert.deepEqual(getAdminEditorialDestination(false, profile, params), { method: 'replace', href });
      }
      assert.deepEqual(getAdminEditorialDestination(false, 'Curador de Fotos', params), { method: 'replace', href: '/admin/banners' });
      assert.deepEqual(getAdminEditorialDestination(false, 'Publicador de Avisos', params), { method: 'push', href: '/admin/avisos' });
      assert.equal(getAdminEditorialDestination(true, 'Administrador', params), null);
      assert.equal(params.toString(), before);
    });
  }
  it('executa sem navegador, router, imports, sessão, serviços ou estado externo', () => {
    const source = readFileSync('src/lib/admin-auth-navigation.ts', 'utf8');
    const { outputText } = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } });
    const isolated: { exports: { getAdminEditorialDestination?: (isGestor: boolean, profile: unknown, params: URLSearchParams) => EditorialTestDecision } } = { exports: {} };
    for (const key of ['require', 'window', 'document', 'localStorage', 'sessionStorage', 'fetch', 'cookies', 'router', 'process', 'React', 'setTimeout']) {
      Object.defineProperty(isolated, key, { get() { throw new Error(`Acesso indevido: ${key}`); } });
    }
    runInNewContext(outputText, isolated, { timeout: 1000 });
    const decide = isolated.exports.getAdminEditorialDestination;
    assert.equal(typeof decide, 'function');
    for (const { isGestor, profileType, expected } of editorialProfileCases) {
      const result = decide?.(isGestor, profileType, new URLSearchParams());
      assert.deepEqual(result ? { ...result } : result, expected);
    }
  });
});

// Os testes SSR fornecem o snapshot da query; os testes de reatividade abaixo
// atualizam esse contexto em uma árvore cliente preservada.
function AdminDashboardPage() {
  const query = typeof window === 'undefined' ? '' : window.location?.search || '';
  return createElement(SearchParamsContext.Provider, { value: new URLSearchParams(query) }, AdminDashboardRoute());
}

function bannerManagerProps(data: AdminBannersData & { news: BannerNewsCover[]; gallery: BannerGalleryPhoto[] }, saving = false): Parameters<typeof SitePhotosManager>[0] {
  const ready = { loading: false, error: null, status: null, retry() {} };
  return {
    saving,
    local: { ...ready, data: { banners: data.banners, siteInfo: data.siteInfo } },
    news: { ...ready, data: { items: data.news, total: data.news.length } },
    gallery: { ...ready, data: { items: data.gallery, total: data.gallery.length } },
  };
}

describe('Contêiner compartilhado da sidebar desktop', () => {
  const baseClasses = 'hidden lg:flex flex-col shrink-0 h-full bg-[#07152B] text-slate-200 border-r border-slate-800 select-none z-30 transition-all duration-300 ease-in-out';
  type ContainerElementProps = { children?: ReactNode; className?: string; isCollapsed?: boolean; title?: string; onClick?: () => void };
  function elements(node: ReactNode): React.ReactElement<ContainerElementProps>[] {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!isValidElement<ContainerElementProps>(node)) return [];
    return [node, ...elements(node.props.children)];
  }

  it('preserva o aside, classes responsivas e larguras expandida e recolhida sem acrescentar elementos', () => {
    const children = createElement('span', null, 'Conteúdo composto');
    for (const isCollapsed of [false, true]) {
      const className = baseClasses + (isCollapsed ? ' w-20' : ' w-64');
      const actual = renderToStaticMarkup(DesktopSidebarContainer({ isCollapsed, children }));
      const expected = renderToStaticMarkup(createElement('aside', { className }, children));
      assert.equal(actual, expected);
    }
  });

  it('preserva identidade, ordem, rolagem e callbacks dos filhos sem assumir sua navegação', () => {
    let clicks = 0;
    const onClick = () => { clicks++; };
    const children = [
      createElement('header', { key: 'header' }, 'Identidade'),
      createElement('div', { key: 'body', className: 'flex-1 min-h-0 overflow-y-auto py-3 px-3 space-y-3 scrollbar-thin' },
        createElement('button', { type: 'button', onClick }, 'Ação do consumidor')),
      createElement('footer', { key: 'footer' }, 'Rodapé'),
    ];
    const tree = DesktopSidebarContainer({ isCollapsed: false, children });
    const nodes = elements(tree);
    assert.equal(nodes[0].type, 'aside');
    assert.strictEqual(nodes[0].props.children, children);
    assert.deepEqual(nodes.filter(node => ['header', 'div', 'footer'].includes(String(node.type))).map(node => node.type),
      ['header', 'div', 'footer']);
    assert.equal(nodes.find(node => node.type === 'div')?.props.className,
      'flex-1 min-h-0 overflow-y-auto py-3 px-3 space-y-3 scrollbar-thin');
    const button = nodes.find(node => node.type === 'button');
    assert.ok(button);
    assert.strictEqual(button.props.onClick, onClick);
    button.props.onClick!();
    assert.equal(clicks, 1);
  });

  it('é usado somente no desktop da página e do shell, preservando conteúdo e controle local de largura', () => {
    const originalState = React.useState;
    for (const kind of ['page', 'shell']) for (const isCollapsed of [false, true]) {
      let stateIndex = 0;
      const changes: boolean[] = [];
      const stateMock = mock.method(React, 'useState', (initial: unknown) => {
        const index = stateIndex++;
        if (index === (kind === 'page' ? 2 : 0)) {
          return [originalState(isCollapsed)[0], (value: boolean) => changes.push(value)];
        }
        if (index === (kind === 'page' ? 3 : 1)) return originalState(true);
        if (index === (kind === 'page' ? 1 : 4)) return originalState(true);
        if (kind === 'shell' && index === 5) return originalState(false);
        if (initial && typeof initial === 'object' && 'isGestor' in initial) return originalState({ isGestor: true });
        return originalState(initial);
      });
      const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: 'desktop-container-test' };
      let tree: ReactNode;
      function Capture() { tree = kind === 'page' ? AdminDashboardPage() : AdminShell({ children: null }); return tree; }
      try {
        const html = renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router },
          createElement(PathnameContext.Provider, { value: '/admin' }, createElement(Capture))));
        const nodes = elements(tree);
        const containers = nodes.filter(node => node.type === DesktopSidebarContainer);
        assert.equal(containers.length, 1);
        assert.equal(containers[0].props.isCollapsed, isCollapsed);
        assert.equal((html.match(/<aside\b/g) || []).length, 1);
        assert.ok(html.includes('<aside class="' + baseClasses + (isCollapsed ? ' w-20' : ' w-64') + '">'));
        const content = elements(containers[0].props.children);
        assert.ok(content.some(node => node.props.className === 'flex-1 min-h-0 overflow-y-auto py-3 px-3 space-y-3 scrollbar-thin'));
        assert.ok(content.some(node => node.props.className === 'shrink-0 border-t border-slate-800/80 p-3 space-y-2 bg-[#051021]'));
        assert.ok(nodes.some(node => typeof node.props.className === 'string' && node.props.className.includes('fixed inset-0') && node.props.className.includes('lg:hidden')));
        const toggle = content.find(node => node.props.title === (isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'));
        assert.ok(toggle?.props.onClick);
        toggle.props.onClick();
        assert.deepEqual(changes, [!isCollapsed]);
      } finally { stateMock.mock.restore(); }
    }
  });
});

describe('Rodapé compartilhado da gaveta mobile', () => {
  type FooterElementProps = { children?: ReactNode; className?: string; title?: string; onClick?: () => void } & Partial<MobileDrawerFooterProps>;
  function elements(node: ReactNode): React.ReactElement<FooterElementProps>[] {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!isValidElement<FooterElementProps>(node)) return [];
    return [node, ...elements(node.props.children)];
  }
  const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: 'mobile-footer-test' };
  const withRouter = (node: ReactNode) => createElement(AppRouterContext.Provider, { value: router },
    createElement(PathnameContext.Provider, { value: '/admin' }, node));
  // Marcação idêntica à que existia inline nos dois consumidores antes da extração.
  function originalFooter(userName: string | undefined, roleLabel: string, onLogout: () => void) {
    return createElement('div', { className: 'shrink-0 border-t border-slate-800 p-3 space-y-2 bg-[#051021]' },
      createElement(NextLink, { href: '/', target: '_blank', rel: 'noopener noreferrer',
        className: 'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs' },
        createElement(ExternalLink, { className: 'h-3.5 w-3.5 text-sky-400' }),
        createElement('span', null, 'Ver Portal Público')),
      createElement('div', { className: 'pt-2 border-t border-slate-800 flex items-center justify-between' },
        createElement('div', { className: 'min-w-0' },
          createElement('p', { className: 'text-xs font-semibold text-white truncate' }, userName),
          createElement('p', { className: 'text-[10px] text-slate-400' }, roleLabel)),
        createElement('button', { type: 'button', onClick: onLogout, className: 'text-rose-400 p-1.5 cursor-pointer' },
          createElement(LogOut, { className: 'h-4 w-4' }))));
  }

  it('renderiza a mesma marcação, classes e textos do rodapé mobile original', () => {
    const onLogout = () => {};
    for (const [userName, roleLabel] of [['Ana Gestora', 'Gestor Geral'], ['12345678900', 'Operador'], [undefined, 'Curador de Fotos']] as const) {
      const actual = renderToStaticMarkup(withRouter(createElement(MobileDrawerFooter, { userName, roleLabel, onLogout })));
      const expected = renderToStaticMarkup(withRouter(originalFooter(userName, roleLabel, onLogout)));
      assert.equal(actual, expected);
    }
  });

  it('repassa o callback de logout sem navegar por conta própria', () => {
    let logouts = 0;
    const onLogout = () => { logouts++; };
    const nodes = elements(MobileDrawerFooter({ userName: 'Ana', roleLabel: 'Gestor Geral', onLogout }));
    const button = nodes.find(node => node.type === 'button');
    assert.ok(button);
    assert.strictEqual(button.props.onClick, onLogout);
    button.props.onClick!();
    assert.equal(logouts, 1);
    const links = nodes.filter(node => node.type === NextLink);
    assert.equal(links.length, 1);
    assert.equal((links[0].props as { href?: string }).href, '/');
  });

  it('é usado na gaveta mobile da página e do shell com os rótulos de perfil e o logout de cada consumidor', () => {
    const originalState = React.useState;
    const sessions = [
      { session: { isGestor: true, name: 'Ana Gestora', username: '111' }, userName: 'Ana Gestora', roleLabel: 'Gestor Geral' },
      { session: { isGestor: false, username: '222', profileType: 'Operador de Conteúdo' }, userName: '222', roleLabel: 'Operador de Conteúdo' },
      { session: { isGestor: false, name: 'Sem Perfil' }, userName: 'Sem Perfil', roleLabel: 'Operador' },
    ];
    for (const kind of ['page', 'shell'] as const) for (const expected of sessions) {
      // Abre a gaveta e conclui a autenticação invertendo apenas os estados booleanos iniciais,
      // sem depender da posição dos hooks; a sessão é identificada pelo formato do estado.
      const stateMock = mock.method(React, 'useState', (initial: unknown) => {
        if (typeof initial === 'boolean') return originalState(!initial);
        if (initial && typeof initial === 'object' && 'isGestor' in initial) return originalState(expected.session);
        return originalState(initial);
      });
      let tree: ReactNode;
      function Capture() { tree = kind === 'page' ? AdminDashboardPage() : AdminShell({ children: null }); return tree; }
      try {
        const html = renderToStaticMarkup(withRouter(createElement(Capture)));
        const nodes = elements(tree);
        const drawer = nodes.find(node => node.props.className?.includes('fixed inset-0 z-50 lg:hidden'));
        assert.ok(drawer, 'gaveta mobile aberta');
        const footers = elements(drawer.props.children).filter(node => node.type === MobileDrawerFooter);
        assert.equal(footers.length, 1);
        assert.equal(nodes.filter(node => node.type === MobileDrawerFooter).length, 1);
        assert.equal(footers[0].props.userName, expected.userName);
        assert.equal(footers[0].props.roleLabel, expected.roleLabel);
        const desktopLogout = nodes.find(node => node.props.title === (kind === 'page' ? 'Encerrar Sessão' : 'Sair do Sistema'));
        assert.ok(desktopLogout?.props.onClick);
        assert.strictEqual(footers[0].props.onLogout, desktopLogout.props.onClick);
        assert.equal((html.match(/shrink-0 border-t border-slate-800 p-3 space-y-2 bg-\[#051021\]/g) || []).length, 1);
        assert.equal((html.match(/shrink-0 border-t border-slate-800\/80 p-3 space-y-2 bg-\[#051021\]/g) || []).length, 1);
        assert.equal(nodes.filter(node => node.type === DesktopSidebarContainer).length, 1);
      } finally { stateMock.mock.restore(); }
    }
  });
});

describe('Mapeamento puro de aliases administrativos estáticos (12D-4A)', () => {
  it('resolve todos os 11 aliases válidos de tab/section para seus destinos canônicos exatos', () => {
    const expected = {
      fotos: '/admin/banners',
      banners: '/admin/banners',
      duvidas: '/admin/faq',
      faq: '/admin/faq',
      usuarios: '/admin/usuarios',
      kanban: '/admin/kanban',
      avisos: '/admin/avisos',
      galeria: '/admin/galeria',
      estadosCidades: '/admin/estados-cidades',
      siteInfo: '/admin/institucional',
      redes: '/admin/redes',
    };
    for (const [alias, destination] of Object.entries(expected)) {
      assert.equal(getAdminStaticAlias(alias), destination);
      assert.equal(resolveAdminStaticAlias(alias), destination);
      assert.equal(getAdminStaticAliasFromParams(new URLSearchParams({ tab: alias })), destination);
      assert.equal(getAdminStaticAliasFromParams(new URLSearchParams({ section: alias })), destination);
    }
    assert.deepEqual({ ...ADMIN_STATIC_TAB_ALIASES }, expected);
  });

  it('retorna null para valores desconhecidos, vazios, nulos ou não strings', () => {
    const unknowns = ['', '   ', 'desconhecido', 'relatorios', 'financeiro', 'dashboard', 'noticia', 'usuario', 'banner'];
    for (const val of unknowns) {
      assert.strictEqual(getAdminStaticAlias(val), null);
      assert.strictEqual(getAdminStaticAliasFromParams(new URLSearchParams({ tab: val })), null);
    }
    assert.strictEqual(getAdminStaticAlias(null), null);
    assert.strictEqual(getAdminStaticAlias(undefined), null);
    assert.strictEqual(getAdminStaticAlias(123 as unknown as string), null);
    assert.strictEqual(getAdminStaticAlias({} as unknown as string), null);
    assert.strictEqual(getAdminStaticAliasFromParams(new URLSearchParams()), null);
  });

  it('preserva a sensibilidade a maiúsculas/minúsculas e não aceita acentuação', () => {
    const casingOrAccents = [
      'Fotos', 'FOTOS', 'Banners', 'BANNERS', 'Duvidas', 'DÚVIDAS', 'dúvidas',
      'FAQ', 'Faq', 'Usuarios', 'USUARIOS', 'usuários', 'Usuários',
      'Kanban', 'KANBAN', 'Avisos', 'AVISOS', 'Galeria', 'GALERIA',
      'EstadosCidades', 'estadoscidades', 'ESTADOSCIDADES',
      'SiteInfo', 'siteinfo', 'SITEINFO', 'Redes', 'REDES',
    ];
    for (const val of casingOrAccents) {
      assert.strictEqual(getAdminStaticAlias(val), null, `Deveria retornar null para "${val}"`);
    }
  });

  it('é estritamente imune a chaves herdadas do Object.prototype (toString, constructor, __proto__)', () => {
    const protoKeys = ['toString', 'constructor', '__proto__', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString'];
    for (const key of protoKeys) {
      assert.strictEqual(getAdminStaticAlias(key), null, `Deveria retornar null para chave herdada "${key}"`);
      assert.strictEqual(getAdminStaticAliasFromParams(new URLSearchParams({ tab: key })), null);
      assert.strictEqual(getAdminRouteAlias(key), null);
      assert.strictEqual(Object.prototype.hasOwnProperty.call(ADMIN_STATIC_TAB_ALIASES, key), false);
      assert.strictEqual((ADMIN_STATIC_TAB_ALIASES as Record<string, unknown>)[key], undefined);
    }
  });

  it('não mapeia módulos dependentes de parâmetros (noticias, projetos) ou seleções locais (visaoGeral) como estáticos', () => {
    // noticias e projetos dependem de action=new ou mode; visaoGeral permanece seleção local no painel.
    assert.strictEqual(getAdminStaticAlias('noticias'), null);
    assert.strictEqual(getAdminStaticAlias('projetos'), null);
    assert.strictEqual(getAdminStaticAlias('visaoGeral'), null);
    assert.strictEqual(getAdminStaticAliasFromParams(new URLSearchParams('tab=noticias')), null);
    assert.strictEqual(getAdminStaticAliasFromParams(new URLSearchParams('tab=projetos')), null);
    assert.strictEqual(getAdminStaticAliasFromParams(new URLSearchParams('tab=visaoGeral')), null);
  });

  it('resolve rotas estáticas históricas e é uma função pura e determinística sem efeitos colaterais', () => {
    assert.deepEqual({ ...ADMIN_STATIC_ROUTE_ALIASES }, {
      '/auth/login': '/admin/login',
      '/painel-gestor': '/admin',
    });
    assert.equal(getAdminRouteAlias('/auth/login'), '/admin/login');
    assert.equal(getAdminRouteAlias('/painel-gestor'), '/admin');
    assert.strictEqual(getAdminRouteAlias('/rota-inexistente'), null);
    assert.strictEqual(getAdminRouteAlias(''), null);
    assert.strictEqual(getAdminRouteAlias(null), null);
    assert.strictEqual(getAdminRouteAlias(undefined), null);

    // Pureza: chamadas repetidas com os mesmos argumentos produzem exatamente o mesmo resultado
    const p1 = new URLSearchParams('tab=fotos&section=avisos');
    assert.equal(getAdminStaticAliasFromParams(p1), '/admin/banners');
    assert.equal(getAdminStaticAliasFromParams(p1), '/admin/banners');
    // Prioridade ?tab= sobre ?section=:
    assert.equal(getAdminStaticAliasFromParams(new URLSearchParams('tab=duvidas&section=avisos')), '/admin/faq');
    assert.equal(getAdminStaticAliasFromParams(new URLSearchParams('section=avisos')), '/admin/avisos');
  });

  it('confere os destinos estáticos com o efeito atual sem confundir push e replace nem repassar query ou hash', () => {
    const calls: { method: string; href: string }[] = [];
    const router = {
      back() {}, forward() {}, refresh() {}, prefetch() {}, bfcacheId: 'static-alias-audit',
      push(href: string) { calls.push({ method: 'push', href }); },
      replace(href: string) { calls.push({ method: 'replace', href }); },
    };
    const effects: React.EffectCallback[] = [];
    const effectMock = mock.method(React, 'useEffect', (effect: React.EffectCallback, dependencies?: React.DependencyList) => {
      const dependency = dependencies?.[0];
      if (dependency && typeof dependency === 'object' &&
        'push' in dependency && dependency.push === router.push) effects.push(effect);
    });
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    try {
      renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(AdminDashboardPage)));
      assert.equal(effects.length, 1);
      const replacing = new Set(['fotos', 'banners', 'duvidas', 'faq', 'usuarios', 'kanban']);
      for (const [alias, href] of Object.entries(ADMIN_STATIC_TAB_ALIASES)) {
        for (const parameter of ['tab', 'section']) {
          const search = `?${parameter}=${alias}&action=new&mode=editor&edit=42&redirect=https%3A%2F%2Fexample.com&extra=1&extra=2`;
          Object.defineProperty(globalThis, 'window', {
            configurable: true, value: { location: { search, hash: '#legado' } },
          });
          calls.length = 0;
          effects.length = 0;
          renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(AdminDashboardPage)));
          assert.equal(effects.length, 1);
          effects[0]();
          assert.deepEqual(calls, [{ method: replacing.has(alias) ? 'replace' : 'push', href }], search);
          const params = new URLSearchParams(search);
          const before = params.toString();
          assert.equal(getAdminStaticAliasFromParams(params), href);
          assert.equal(params.toString(), before);
        }
      }
    } finally {
      effectMock.mock.restore();
      if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor);
      else Reflect.deleteProperty(globalThis, 'window');
    }
  });

  it('preserva prioridade, primeiro valor repetido e fallback somente de tab vazio ou ausente', () => {
    const cases: [string, string | null][] = [
      ['tab=fotos&section=redes', '/admin/banners'],
      ['section=redes&tab=fotos', '/admin/banners'],
      ['tab=&section=redes', '/admin/redes'],
      ['tab&section=faq', '/admin/faq'],
      ['tab=desconhecido&section=redes', null],
      ['tab=%20&section=redes', null],
      ['tab=noticias&section=redes', null],
      ['tab=projetos&section=faq', null],
      ['tab=fotos&tab=redes', '/admin/banners'],
      ['tab=desconhecido&tab=fotos', null],
      ['tab=&tab=fotos&section=redes', '/admin/redes'],
      ['tab=&tab=fotos', null],
      ['section=faq&section=redes', '/admin/faq'],
      ['section=&section=faq', null],
      ['tab=&section=', null],
      ['tab=%66otos', '/admin/banners'],
      ['tab=fotos%20', null],
      ['module=redes', null],
    ];
    for (const [query, destination] of cases) {
      const params = new URLSearchParams(query);
      const before = params.toString();
      assert.equal(getAdminStaticAliasFromParams(params), destination, query);
      assert.equal(params.toString(), before, query);
    }
  });

  it('mantém noticias e projetos nos resolvedores existentes com suas regras distintas de criação', () => {
    const cases: [string, string | null][] = [
      ['tab=projetos', '/admin/projetos'],
      ['tab=projetos&action=new', '/admin/projetos?action=new'],
      ['tab=projetos&action=new&action=list', '/admin/projetos?action=new'],
      ['tab=projetos&action=list&action=new', '/admin/projetos'],
      ['section=projetos&mode=editor', '/admin/projetos'],
      ['tab=projetos&action=NEW', '/admin/projetos'],
      ['tab=noticias&action=new', null],
      ['tab=noticias&mode=nova', null],
    ];
    for (const [query, projectHref] of cases) {
      const params = new URLSearchParams(query);
      assert.equal(getAdminStaticAliasFromParams(params), null, query);
      assert.equal(getLegacyProjectsHref(params), projectHref, query);
    }
  });

  it('confere os pares de caminhos com os redirects configurados sem assumir sua semântica HTTP', async () => {
    assert.ok(nextConfig.redirects);
    const redirects = await nextConfig.redirects();
    assert.equal(redirects.length, 2);
    for (const { source, destination } of redirects) {
      assert.equal(getAdminRouteAlias(source), destination);
    }
    // O resolvedor aceita apenas o pathname exato; não interpreta nem reescreve URLs.
    for (const pathname of ['/admin', '/admin/login', '/AUTH/login', '/painel-gestor/',
      '/auth/login?redirect=/admin/redes', '/painel-gestor#inicio']) {
      assert.equal(getAdminRouteAlias(pathname), null, pathname);
    }
  });

  it('rejeita destinos externos e entradas herdadas sem fallback para outra seção', () => {
    for (const alias of ['https://example.com', '//example.com', 'javascript:alert(1)',
      '/admin/redes', 'toString', 'constructor', '__proto__']) {
      assert.equal(getAdminStaticAlias(alias), null);
      assert.equal(getAdminRouteAlias(alias), null);
      assert.equal(getAdminStaticAliasFromParams(new URLSearchParams({ tab: alias, section: 'redes' })), null);
    }
  });

  it('importa e resolve em isolamento com navegador, rede, sessão e imports indisponíveis', () => {
    const source = readFileSync('src/lib/admin-aliases.ts', 'utf8');
    const { outputText } = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } });
    const isolated: Record<string, unknown> = { exports: {}, URLSearchParams };
    for (const key of ['window', 'document', 'location', 'localStorage', 'sessionStorage',
      'fetch', 'process', 'require', 'setTimeout', 'setInterval']) {
      Object.defineProperty(isolated, key, { get() { throw new Error(`Acesso indevido: ${key}`); } });
    }
    runInNewContext(outputText, isolated, { timeout: 1000 });
    const api = isolated.exports as {
      getAdminStaticAlias: typeof getAdminStaticAlias;
      getAdminStaticAliasFromParams: typeof getAdminStaticAliasFromParams;
      getAdminRouteAlias: typeof getAdminRouteAlias;
    };
    for (let repetition = 0; repetition < 2; repetition++) {
      for (const [alias, href] of Object.entries(ADMIN_STATIC_TAB_ALIASES)) {
        assert.equal(api.getAdminStaticAlias(alias), href);
        const params = new URLSearchParams({ section: alias, extra: 'preservado' });
        const before = params.toString();
        assert.equal(api.getAdminStaticAliasFromParams(params), href);
        assert.equal(params.toString(), before);
      }
      for (const [pathname, href] of Object.entries(ADMIN_STATIC_ROUTE_ALIASES)) {
        assert.equal(api.getAdminRouteAlias(pathname), href);
      }
      assert.equal(api.getAdminStaticAlias('constructor'), null);
      assert.equal(api.getAdminRouteAlias('https://example.com'), null);
    }
  });
});

describe('Integração dos aliases estáticos no dashboard (12D-4B)', () => {
  function captureNavigation() {
    const calls: { method: string; href: string }[] = [];
    const router = {
      back() {}, forward() {}, refresh() {}, prefetch() {}, bfcacheId: 'integrated-alias-test',
      push(href: string) { calls.push({ method: 'push', href }); },
      replace(href: string) { calls.push({ method: 'replace', href }); },
    };
    const aliasEffects: React.EffectCallback[] = [];
    const loaders: ((isCurrent: () => boolean) => Promise<void>)[] = [];
    // Identifica os efeitos por suas dependências, sem índices ou alterações de useState.
    const effectMock = mock.method(React, 'useEffect', (effect: React.EffectCallback, dependencies?: React.DependencyList) => {
      if (!dependencies) return;
      const dependency = dependencies[0];
      if (dependency && typeof dependency === 'object' && 'push' in dependency && dependency.push === router.push) {
        aliasEffects.push(effect);
      } else if (typeof dependency === 'function' && typeof dependencies[1] === 'boolean') {
        loaders.push(dependency as (isCurrent: () => boolean) => Promise<void>);
      }
    });
    const authCheck = mock.method(medtecApi.auth, 'isAuthenticated', () => false);
    const me = mock.method(medtecApi.auth, 'me', async () => { throw new Error('Sessão Rails não configurada no teste.'); });
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 401 }));
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    function restore() {
      effectMock.mock.restore();
      authCheck.mock.restore();
      me.mock.restore();
      fetchMock.mock.restore();
      if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor);
      else Reflect.deleteProperty(globalThis, 'window');
    }
    try {
      renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(AdminDashboardPage)));
      assert.equal(aliasEffects.length, 1);
      assert.equal(loaders.length, 1);
    } catch (error) {
      restore();
      throw error;
    }
    return {
      calls, authCheck, me, fetchMock, restore, loadData: () => loaders[0](() => true),
      setQuery(query: string) {
        Object.defineProperty(globalThis, 'window', {
          configurable: true, value: { location: { search: '?' + query, hash: '#legado' } },
        });
      },
      runAlias() {
        aliasEffects.length = 0;
        renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(AdminDashboardPage)));
        assert.equal(aliasEffects.length, 1);
        aliasEffects[0]();
      },
    };
  }

  it('preserva precedência, vazios, desconhecidos e repetições no efeito integrado', () => {
    const nav = captureNavigation();
    const cases: [string, string | null, string | null][] = [
      ['tab=fotos&section=redes', 'replace', '/admin/banners'],
      ['section=redes&tab=fotos', 'replace', '/admin/banners'],
      ['tab=&section=redes', 'push', '/admin/redes'],
      ['tab&section=faq', 'replace', '/admin/faq'],
      ['tab=desconhecido&section=redes', null, null],
      ['tab=%20&section=redes', null, null],
      ['tab=fotos&tab=redes', 'replace', '/admin/banners'],
      ['tab=desconhecido&tab=fotos', null, null],
      ['tab=&tab=fotos&section=redes', 'push', '/admin/redes'],
      ['tab=&tab=fotos', null, null],
      ['section=faq&section=redes', 'replace', '/admin/faq'],
      ['section=&section=faq', null, null],
      ['tab=FOTOS', null, null],
      ['tab=d%C3%BAvidas', null, null],
      ['tab=&section=', null, null],
      ['module=redes', null, null],
      ['tab=visaoGeral', null, null],
      ['', null, null],
    ];
    try {
      for (const [query, method, href] of cases) {
        nav.setQuery(query);
        nav.calls.length = 0;
        nav.runAlias();
        assert.deepEqual(nav.calls, href ? [{ method, href }] : [], query);
      }
      assert.equal(nav.authCheck.mock.callCount(), 0);
      assert.equal(nav.me.mock.callCount(), 0);
      assert.equal(nav.fetchMock.mock.callCount(), 0);
    } finally { nav.restore(); }
  });

  it('mantém Notícias e Projetos com replace e suas regras próprias de action, mode e edit', () => {
    const nav = captureNavigation();
    const cases: [string, string][] = [
      ['tab=noticias&section=redes&action=new&edit=42&extra=1', '/admin/noticias?action=new'],
      ['tab=noticias&action=NEW&edit=42', '/admin/noticias'],
      ['tab=noticias&action=list&action=new', '/admin/noticias'],
      ['tab=noticias&action=new&action=list', '/admin/noticias?action=new'],
      ['tab=noticias&mode=lista&mode=editor', '/admin/noticias'],
      ['tab=noticias&mode=nova&mode=lista', '/admin/noticias?action=new'],
      ['tab=&section=noticias&mode=new', '/admin/noticias?action=new'],
      ['tab=projetos&section=fotos&action=new&edit=42', '/admin/projetos?action=new'],
      ['section=projetos&mode=editor&edit=42', '/admin/projetos'],
      ['tab=projetos&action=NEW', '/admin/projetos'],
      ['tab=projetos&action=list&action=new', '/admin/projetos'],
      ['tab=projetos&action=new&action=list', '/admin/projetos?action=new'],
      ['tab=redes&section=noticias&action=new&mode=editor', '/admin/redes'],
    ];
    try {
      for (const [query, href] of cases) {
        nav.setQuery(query);
        nav.calls.length = 0;
        nav.runAlias();
        assert.deepEqual(nav.calls, [{ method: href === '/admin/redes' ? 'push' : 'replace', href }], query);
      }
      assert.equal(nav.fetchMock.mock.callCount(), 0);
    } finally { nav.restore(); }
  });

  it('preserva a guarda antecipada de loadData sem consultar sessão ou carregar dados', async () => {
    const nav = captureNavigation();
    try {
      for (const alias of ['fotos', 'banners', 'projetos', 'duvidas', 'faq', 'usuarios', 'kanban']) {
        for (const parameter of ['tab', 'section']) {
          nav.setQuery(`${parameter}=${alias}&action=new`);
          await nav.loadData();
        }
      }
      nav.setQuery('tab=&section=fotos');
      await nav.loadData();
      assert.equal(nav.authCheck.mock.callCount(), 0);
      assert.equal(nav.me.mock.callCount(), 0);
      assert.equal(nav.fetchMock.mock.callCount(), 0);
      assert.deepEqual(nav.calls, []);

      // Um tab não vazio continua bloqueando section também na guarda de sessão.
      nav.setQuery('tab=desconhecido&section=fotos');
      await nav.loadData();
      assert.equal(nav.authCheck.mock.callCount(), 1);
      assert.equal(nav.fetchMock.mock.callCount(), 1);
      assert.deepEqual(nav.calls, [{ method: 'push', href: '/admin/login' }]);
    } finally { nav.restore(); }
  });

  it('mantém o encaminhamento por perfil das sessões Rails e local separado dos aliases', async () => {
    const profiles = [
      { name: 'Editor de Notícias', method: 'replace', href: '/admin/noticias?action=new' },
      { name: 'Curador de Fotos', method: 'replace', href: '/admin/banners' },
      { name: 'Publicador de Avisos', method: 'push', href: '/admin/avisos' },
      { name: 'Operador de Conteúdo', method: 'replace', href: '/admin/noticias?action=new' },
    ];
    for (const source of ['Rails', 'local']) for (const profile of profiles) {
      const nav = captureNavigation();
      try {
        nav.authCheck.mock.mockImplementation(() => source === 'Rails');
        nav.me.mock.mockImplementation(async () => ({ success: true, message: 'Sessão simulada', data: {
          id: 100, nome: 'Operador', cpf: '00000000000', ativo: true, perfil_id: 2, perfil_nome: profile.name,
        } }));
        nav.fetchMock.mock.mockImplementation(async () => new Response(JSON.stringify({
          isGestor: false, profileType: profile.name, user: 'operador',
        }), { status: 200 }));
        nav.setQuery('tab=invalido&action=new');
        nav.runAlias();
        assert.equal(nav.authCheck.mock.callCount(), 0);
        await nav.loadData();
        assert.deepEqual(nav.calls, [
          { method: profile.method, href: profile.href },
        ], `${source}: ${profile.name}`);
        assert.equal(nav.me.mock.callCount(), source === 'Rails' ? 1 : 0);
        assert.equal(nav.fetchMock.mock.callCount(), source === 'local' ? 1 : 0);
        if (source === 'local') assert.equal(nav.fetchMock.mock.calls[0].arguments[0], '/api/auth');
      } finally { nav.restore(); }
    }
  });

  it('delega sessão ao destino canônico e mantém login ao voltar para contexto sem alias', async () => {
    const nav = captureNavigation();
    try {
      nav.setQuery('tab=redes&redirect=https%3A%2F%2Fexample.com');
      nav.runAlias();
      assert.deepEqual(nav.calls, [{ method: 'push', href: '/admin/redes' }]);
      assert.equal(nav.authCheck.mock.callCount(), 0);
      await nav.loadData();
      assert.deepEqual(nav.calls, [{ method: 'push', href: '/admin/redes' }]);
      assert.equal(nav.authCheck.mock.callCount(), 0);
      assert.equal(nav.fetchMock.mock.callCount(), 0);
      nav.setQuery('tab=invalido');
      await nav.loadData();
      assert.deepEqual(nav.calls, [
        { method: 'push', href: '/admin/redes' }, { method: 'push', href: '/admin/login' },
      ]);
      assert.equal(nav.authCheck.mock.callCount(), 1);
      assert.equal(nav.me.mock.callCount(), 0);
      assert.equal(nav.fetchMock.mock.callCount(), 1);
    } finally { nav.restore(); }
  });
});

describe('Fallback seguro de seções administrativas (12D-4C)', () => {
  function inspectFallback(verify: (evaluate: (query: string) => {
    selections: unknown[]; navigation: { method: string; href: string }[];
  }) => void) {
    const selections: unknown[] = [];
    const navigation: { method: string; href: string }[] = [];
    const router = {
      back() {}, forward() {}, refresh() {}, prefetch() {}, bfcacheId: 'safe-fallback-test',
      push(href: string) { navigation.push({ method: 'push', href }); },
      replace(href: string) { navigation.push({ method: 'replace', href }); },
    };
    const originalState = React.useState;
    // Observa a seleção pelo valor inicial da seção, sem depender da posição do hook.
    const stateMock = mock.method(React, 'useState', (initial: unknown) => {
      const state = originalState(initial);
      return initial === 'visaoGeral' ? [state[0], (value: unknown) => { selections.push(value); }] : state;
    });
    const effects: React.EffectCallback[] = [];
    const effectMock = mock.method(React, 'useEffect', (effect: React.EffectCallback, dependencies?: React.DependencyList) => {
      const dependency = dependencies?.[0];
      if (dependency && typeof dependency === 'object' &&
        'push' in dependency && dependency.push === router.push) effects.push(effect);
    });
    const fetchMock = mock.method(globalThis, 'fetch', async () => { throw new Error('Fallback não deve consultar serviços.'); });
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    try {
      renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(AdminDashboardPage)));
      assert.equal(effects.length, 1);
      verify((query) => {
        selections.length = 0;
        navigation.length = 0;
        Object.defineProperty(globalThis, 'window', {
          configurable: true, value: { location: { search: '?' + query } },
        });
        effects.length = 0;
        renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(AdminDashboardPage)));
        assert.equal(effects.length, 1);
        effects[0]();
        return { selections: [...selections], navigation: [...navigation] };
      });
      assert.equal(fetchMock.mock.callCount(), 0);
    } finally {
      stateMock.mock.restore();
      effectMock.mock.restore();
      fetchMock.mock.restore();
      if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor);
      else Reflect.deleteProperty(globalThis, 'window');
    }
  }

  it('rejeita propriedades herdadas sem selecionar uma seção nem navegar', () => {
    inspectFallback((evaluate) => {
      for (const key of ['toString', 'constructor', '__proto__', 'valueOf',
        'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString']) {
        for (const query of [`tab=${key}`, `section=${key}`, `tab=${key}&section=visaoGeral`,
          `tab=${key}&tab=visaoGeral`, `section=${key}&section=visaoGeral`]) {
          assert.deepEqual(evaluate(query), { selections: [], navigation: [] }, query);
        }
      }
    });
  });

  it('preserva visaoGeral como seleção local legítima, a precedência e o primeiro valor repetido', () => {
    inspectFallback((evaluate) => {
      for (const query of ['tab=visaoGeral', 'section=visaoGeral', 'tab=&section=visaoGeral',
        'tab=visaoGeral&section=redes', 'tab=visaoGeral&tab=constructor',
        'section=visaoGeral&section=constructor']) {
        assert.deepEqual(evaluate(query), { selections: ['visaoGeral'], navigation: [] }, query);
      }
    });
  });

  it('ignora valores desconhecidos, vazios e grafias divergentes sem fallback implícito', () => {
    inspectFallback((evaluate) => {
      for (const query of ['', 'tab=', 'section=', 'tab=&section=',
        'tab=desconhecido', 'section=desconhecido', 'tab=desconhecido&section=visaoGeral',
        'tab=%20&section=visaoGeral', 'tab=&tab=visaoGeral', 'section=&section=visaoGeral',
        'tab=VisaoGeral', 'tab=visaogeral', 'tab=vis%C3%A3oGeral', 'tab=visaoGeral%20']) {
        assert.deepEqual(evaluate(query), { selections: [], navigation: [] }, query);
      }
    });
  });
});

describe('Reatividade dos aliases com React e Next reais (12D-4E)', () => {
  async function mountAliases(query: string, { strict = false } = {}) {
    const calls: { method: string; href: string }[] = [];
    const selections: AdminSection[] = [];
    const instances: number[] = [];
    const selectionCallbacks: ((section: AdminSection) => void)[] = [];
    let nextInstance = 0;
    let activations = 0;
    const router = {
      back() {}, forward() {}, refresh() {}, prefetch() {}, bfcacheId: 'reactive-alias-test',
      push(href: string) { calls.push({ method: 'push', href }); },
      replace(href: string) { calls.push({ method: 'replace', href }); },
    };
    // O controlador não renderiza elementos DOM. O contêiner mínimo permite
    // executar o reconciliador e os efeitos reais sem instalar um navegador/DOM.
    const doc = {
      nodeType: 9, addEventListener() {}, removeEventListener() {}, activeElement: null, body: null,
      defaultView: null as unknown, documentElement: { classList: { contains() { return false; } } },
    };
    const browser = { document: doc, HTMLIFrameElement: class {}, location: { pathname: '/admin', search: '' } };
    doc.defaultView = browser;
    const globals = {
      window: browser, document: doc, IS_REACT_ACT_ENVIRONMENT: true,
      MutationObserver: class { observe() {} disconnect() {} },
    };
    const descriptors = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const [key, value] of Object.entries(globals)) {
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const authCheck = mock.method(medtecApi.auth, 'isAuthenticated', () => false);
    // Mantém a sessão pendente; nenhum serviço real é consultado e nenhuma
    // decisão de autenticação interfere na navegação que este teste observa.
    const fetchMock = mock.method(globalThis, 'fetch', () => new Promise<Response>(() => {}));
    function ControllerHost() {
      const [instance] = React.useState(() => ++nextInstance);
      const dashboard = AdminDashboardRoute();
      const boundary = React.Children.toArray(dashboard.props.children).find(node =>
        isValidElement(node) && node.type === React.Suspense);
      assert.ok(isValidElement<{ children: ReactNode; fallback: ReactNode }>(boundary));
      assert.equal(boundary.props.fallback, null);
      const controller = boundary.props.children;
      assert.ok(isValidElement<{ onSelectSection: (section: AdminSection) => void }>(controller));
      const select = controller.props.onSelectSection;
      const observeSelection = React.useCallback((section: AdminSection) => {
        selections.push(section);
        select(section);
      }, [select]);
      instances.push(instance);
      selectionCallbacks.push(select);
      React.useEffect(() => { activations++; }, []);
      // Executa os hooks da página e o controlador de produção sob Suspense;
      // omite somente o DOM visual, que continua coberto pelos testes SSR.
      return React.cloneElement(boundary, {}, React.cloneElement(controller, { onSelectSection: observeSelection }));
    }
    const container = {
      nodeType: 1, tagName: 'DIV', namespaceURI: 'http://www.w3.org/1999/xhtml', ownerDocument: doc,
      addEventListener() {}, removeEventListener() {}, textContent: '',
    };
    const root = createRoot(container as unknown as Element);
    async function render(nextQuery: string, mode: 'visible' | 'hidden' = 'visible', entry = 'initial') {
      browser.location.search = '?' + nextQuery;
      let tree: React.ReactElement = createElement(AppRouterContext.Provider, { value: router },
        createElement(SearchParamsContext.Provider, { value: new URLSearchParams(nextQuery) },
          jsx(React.Activity, { mode, children: createElement(ControllerHost, { key: entry }) } satisfies React.ActivityProps)));
      if (strict) tree = createElement(React.StrictMode, null, tree);
      await React.act(async () => {
        root.render(tree);
      });
    }
    async function restore() {
      try {
        await React.act(async () => { root.unmount(); });
        for (const call of fetchMock.mock.calls) {
          assert.equal(call.arguments[0], '/api/auth');
          assert.equal(call.arguments[1]?.method || 'GET', 'GET');
        }
      } finally {
        authCheck.mock.restore();
        fetchMock.mock.restore();
        for (const [key, descriptor] of descriptors) {
          if (descriptor) Object.defineProperty(globalThis, key, descriptor);
          else Reflect.deleteProperty(globalThis, key);
        }
      }
    }
    try { await render(query); } catch (error) { await restore(); throw error; }
    return {
      calls, selections, render, restore,
      get instanceCount() { return new Set(instances).size; },
      assertRetained(expectedActivations = 1) {
        assert.equal(new Set(instances).size, 1, 'A instância deve permanecer montada.');
        assert.equal(activations, expectedActivations);
        assert.ok(selectionCallbacks.every(callback => callback === selectionCallbacks[0]), 'O callback deve permanecer estável.');
      },
    };
  }

  for (const [from, to, method, href] of [
    ['tab=visaoGeral', 'tab=faq', 'replace', '/admin/faq'],
    ['tab=invalido', 'tab=fotos', 'replace', '/admin/banners'],
    ['tab=faq', 'tab=avisos', 'push', '/admin/avisos'],
    ['section=galeria', 'section=redes', 'push', '/admin/redes'],
  ]) {
    it(`reage a ${from} → ${to} sem remontagem, inclusive com sessão pendente`, async () => {
      const page = await mountAliases(from);
      try {
        page.calls.length = 0;
        await page.render(to);
        assert.deepEqual(page.calls, [{ method, href }]);
        page.assertRetained();
      } finally { await page.restore(); }
    });
  }

  it('12D-5 Lote 4: simulação de Voltar/Avançar restaura a query e os métodos dos aliases', async () => {
    const query = (target: string) => new URL(adminAuthNavigation.getSafeAdminReturnTarget(target), 'https://medtec.invalid').search.slice(1);
    const previous = query('/admin?tab=faq&section=avisos&redirect=x');
    const next = query('/admin?tab=avisos&section=faq');
    const page = await mountAliases(previous);
    try {
      await page.render(next);
      await page.render(previous); // Voltar: restaura a entrada anterior.
      await page.render(next); // Avançar: restaura a entrada seguinte.
      assert.deepEqual(page.calls, [
        { method: 'replace', href: '/admin/faq' }, { method: 'push', href: '/admin/avisos' },
        { method: 'replace', href: '/admin/faq' }, { method: 'push', href: '/admin/avisos' },
      ]);
      page.assertRetained();
    } finally { await page.restore(); }
  });

  it('não repete navegação com parâmetros equivalentes, reordenados ou alterações irrelevantes', async () => {
    const page = await mountAliases('tab=fotos&section=redes&action=&mode=editor&edit=1');
    try {
      assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/banners' }]);
      await page.render('mode=editor&action=&section=redes&tab=fotos&tab=avisos&edit=2&extra=novo');
      await page.render('mode=editor&action=&section=redes&tab=fotos&tab=avisos&edit=2&extra=novo');
      assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/banners' }]);
      page.assertRetained();
    } finally { await page.restore(); }
  });

  it('mantém os onze destinos e métodos para tab e section na mesma instância', async () => {
    const page = await mountAliases('tab=invalido');
    const routes: [string, string, string][] = [
      ['fotos', 'replace', '/admin/banners'], ['banners', 'replace', '/admin/banners'],
      ['duvidas', 'replace', '/admin/faq'], ['faq', 'replace', '/admin/faq'],
      ['usuarios', 'replace', '/admin/usuarios'], ['kanban', 'replace', '/admin/kanban'],
      ['avisos', 'push', '/admin/avisos'], ['galeria', 'push', '/admin/galeria'],
      ['estadosCidades', 'push', '/admin/estados-cidades'], ['siteInfo', 'push', '/admin/institucional'],
      ['redes', 'push', '/admin/redes'],
    ];
    try {
      for (const parameter of ['tab', 'section']) for (const [alias, method, href] of routes) {
        // Cada contrato é verificado a partir de uma decisão neutra. A equivalência
        // entre aliases consecutivos é coberta pela suíte B3.2 abaixo.
        await page.render('tab=invalido');
        page.calls.length = 0;
        await page.render(`${parameter}=${alias}&action=new&extra=descartado`);
        assert.deepEqual(page.calls, [{ method, href }], `${parameter}=${alias}`);
      }
      page.assertRetained();
    } finally { await page.restore(); }
  });

  it('preserva precedência, vazios, primeiro valor repetido e rejeição de propriedades herdadas', async () => {
    const page = await mountAliases('tab=invalido');
    const cases: [string, string | null, string | null][] = [
      ['tab=fotos&section=redes', 'replace', '/admin/banners'],
      ['tab=&section=redes', 'push', '/admin/redes'],
      ['tab=desconhecido&section=redes', null, null],
      ['tab=fotos&tab=redes', 'replace', '/admin/banners'],
      ['tab=&tab=fotos&section=redes', 'push', '/admin/redes'],
      ['section=&section=faq', null, null], ['tab=&section=', null, null],
      ['tab=FOTOS', null, null], ['tab=d%C3%BAvidas', null, null],
      ['tab=toString', null, null], ['section=constructor', null, null],
      ['tab=__proto__&section=redes', null, null], ['tab=valueOf', null, null],
    ];
    try {
      for (const [query, method, href] of cases) {
        page.calls.length = 0;
        page.selections.length = 0;
        await page.render(query);
        assert.deepEqual(page.calls, href ? [{ method, href }] : [], query);
        assert.deepEqual(page.selections, [], query);
      }
      await page.render('tab=visaoGeral');
      assert.deepEqual(page.selections, ['visaoGeral']);
      page.assertRetained();
    } finally { await page.restore(); }
  });

  it('reage também a action e mode preservando as regras distintas de Notícias e Projetos', async () => {
    const page = await mountAliases('tab=invalido');
    const cases = [
      ['tab=noticias', '/admin/noticias'],
      ['tab=noticias&action=new', '/admin/noticias?action=new'],
      ['tab=noticias&mode=editor', '/admin/noticias?action=new'],
      ['tab=noticias&mode=new', '/admin/noticias?action=new'],
      ['tab=noticias&mode=nova', '/admin/noticias?action=new'],
      ['tab=noticias&mode=lista&mode=editor', '/admin/noticias'],
      ['tab=projetos', '/admin/projetos'],
      ['tab=projetos&action=new', '/admin/projetos?action=new'],
      ['tab=projetos&mode=editor', '/admin/projetos'],
      ['tab=projetos&action=list&action=new', '/admin/projetos'],
    ];
    try {
      for (const [query, href] of cases) {
        await page.render('tab=invalido');
        page.calls.length = 0;
        await page.render(query);
        assert.deepEqual(page.calls, [{ method: 'replace', href }], query);
      }
      page.assertRetained();
    } finally { await page.restore(); }
  });

  it('mantém a reexecução na reativação de Activity sem deduplicar ou remontar o controlador', async () => {
    const page = await mountAliases('tab=redes');
    try {
      assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/redes' }]);
      await page.render('tab=redes', 'hidden');
      assert.equal(page.calls.length, 1);
      await page.render('tab=redes');
      assert.deepEqual(page.calls, [
        { method: 'push', href: '/admin/redes' }, { method: 'push', href: '/admin/redes' },
      ]);
      page.assertRetained(2);
    } finally { await page.restore(); }
  });

  describe('Decisões equivalentes de aliases (12D-4F-B3.2)', () => {
    for (const [from, to, method, href] of [
      ['tab=redes', 'tab=redes&action=new', 'push', '/admin/redes'],
      ['tab=fotos', 'tab=fotos&mode=editor', 'replace', '/admin/banners'],
      ['tab=faq', 'tab=faq&mode=lista', 'replace', '/admin/faq'],
      ['tab=redes&section=avisos', 'tab=redes&section=galeria', 'push', '/admin/redes'],
      ['tab=noticias&action=new', 'tab=noticias&mode=nova', 'replace', '/admin/noticias?action=new'],
      ['tab=fotos', 'tab=banners', 'replace', '/admin/banners'],
      ['tab=duvidas', 'section=faq', 'replace', '/admin/faq'],
      ['tab=redes', 'section=redes', 'push', '/admin/redes'],
      ['tab=projetos&mode=editor', 'section=projetos&mode=lista', 'replace', '/admin/projetos'],
      ['tab=projetos&action=new', 'tab=projetos&action=new&mode=nova', 'replace', '/admin/projetos?action=new'],
    ]) {
      it(`${from} → ${to} mantém uma única solicitação`, async () => {
        const page = await mountAliases(from);
        try {
          assert.deepEqual(page.calls, [{ method, href }]);
          await page.render(to);
          assert.deepEqual(page.calls, [{ method, href }]);
          page.assertRetained();
        } finally { await page.restore(); }
      });
    }

    it('ignora reordenação, parâmetros externos e valores repetidos posteriores', async () => {
      const page = await mountAliases('tab=redes&action=new&extra=1');
      try {
        await page.render('extra=2&action=new&tab=redes&tab=fotos&edit=42');
        await page.render('action=new&tab=redes&extra=3');
        assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/redes' }]);
        page.assertRetained();
      } finally { await page.restore(); }
    });

    it('mantém a lista de Notícias quando mudam apenas formas equivalentes de não criar', async () => {
      const page = await mountAliases('tab=noticias');
      try {
        await page.render('tab=noticias&action=list');
        await page.render('tab=noticias&mode=lista&mode=editor');
        await page.render('section=noticias&action=NEW&mode=EDITOR');
        assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/noticias' }]);
        page.assertRetained();
      } finally { await page.restore(); }
    });

    it('continua navegando ao mudar destino ou método, inclusive ao voltar ao alias anterior', async () => {
      const page = await mountAliases('tab=redes');
      try {
        await page.render('tab=avisos');
        await page.render('tab=fotos');
        await page.render('tab=faq');
        await page.render('tab=redes');
        assert.deepEqual(page.calls, [
          { method: 'push', href: '/admin/redes' }, { method: 'push', href: '/admin/avisos' },
          { method: 'replace', href: '/admin/banners' }, { method: 'replace', href: '/admin/faq' },
          { method: 'push', href: '/admin/redes' },
        ]);
        page.assertRetained();
      } finally { await page.restore(); }
    });

    it('mantém as transições reais de lista/editor de Notícias e de lista/novo de Projetos', async () => {
      const page = await mountAliases('tab=noticias');
      try {
        await page.render('tab=noticias&mode=editor');
        await page.render('tab=noticias&mode=lista');
        await page.render('tab=projetos');
        await page.render('tab=projetos&action=new');
        await page.render('tab=projetos&mode=editor');
        assert.deepEqual(page.calls, [
          { method: 'replace', href: '/admin/noticias' }, { method: 'replace', href: '/admin/noticias?action=new' },
          { method: 'replace', href: '/admin/noticias' }, { method: 'replace', href: '/admin/projetos' },
          { method: 'replace', href: '/admin/projetos?action=new' }, { method: 'replace', href: '/admin/projetos' },
        ]);
        page.assertRetained();
      } finally { await page.restore(); }
    });

    it('permite o mesmo alias após uma decisão neutra e após uma nova montagem', async () => {
      const page = await mountAliases('tab=redes');
      try {
        await page.render('tab=invalido');
        await page.render('tab=redes');
        assert.equal(page.calls.length, 2);
        await page.render('tab=redes', 'visible', 'new-entry');
        assert.deepEqual(page.calls, Array.from({ length: 3 }, () => ({ method: 'push', href: '/admin/redes' })));
        assert.equal(page.instanceCount, 2);
      } finally { await page.restore(); }
    });

    it('evita seleções locais redundantes e permite selecionar novamente depois de sair da decisão', async () => {
      const page = await mountAliases('tab=visaoGeral');
      try {
        await page.render('section=visaoGeral&action=new');
        assert.deepEqual(page.selections, ['visaoGeral']);
        await page.render('tab=invalido');
        await page.render('tab=visaoGeral');
        assert.deepEqual(page.selections, ['visaoGeral', 'visaoGeral']);
        assert.deepEqual(page.calls, []);
        page.assertRetained();
      } finally { await page.restore(); }
    });

    it('preserva o replay inicial do Strict Mode sem repetir por query equivalente', async () => {
      const page = await mountAliases('tab=redes', { strict: true });
      try {
        assert.deepEqual(page.calls, [
          { method: 'push', href: '/admin/redes' }, { method: 'push', href: '/admin/redes' },
        ]);
        await page.render('tab=redes&action=new');
        assert.equal(page.calls.length, 2);
        page.assertRetained(2);
      } finally { await page.restore(); }
    });

    it('Activity permite nova navegação por reativação e ignora equivalência dentro da ativação', async () => {
      const page = await mountAliases('tab=redes');
      try {
        await page.render('tab=redes', 'hidden');
        await page.render('section=redes&mode=editor');
        assert.equal(page.calls.length, 2);
        await page.render('tab=redes&action=new');
        assert.equal(page.calls.length, 2);
        await page.render('tab=redes&action=new', 'hidden');
        await page.render('tab=redes');
        assert.equal(page.calls.length, 3);
        page.assertRetained(3);
      } finally { await page.restore(); }
    });

    it('Activity usa a decisão mais recente ao voltar de queries alteradas enquanto oculta', async () => {
      const page = await mountAliases('tab=redes');
      try {
        await page.render('tab=redes', 'hidden');
        await page.render('tab=fotos&mode=editor', 'hidden');
        assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/redes' }]);
        await page.render('tab=banners&action=new');
        assert.deepEqual(page.calls, [
          { method: 'push', href: '/admin/redes' }, { method: 'replace', href: '/admin/banners' },
        ]);
        page.assertRetained(2);
      } finally { await page.restore(); }
    });
  });
});

describe('Execuções de sessão vigentes no dashboard (12D-4F-B1)', () => {
  type RailsReply = Awaited<ReturnType<typeof medtecApi.auth.me>>;
  function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((accept, refuse) => { resolve = accept; reject = refuse; });
    return { promise, resolve, reject };
  }
  function railsSession(profile: string): RailsReply {
    return { success: true, message: 'Sessão sintética', data: {
      id: 100, perfil_id: 2, perfil_nome: profile, nome: 'Usuário de teste', cpf: '00000000000', ativo: true,
    } };
  }
  function localSession(profile: string) {
    return new Response(JSON.stringify({ isGestor: false, profileType: profile, user: 'operador-sintetico' }), { status: 200 });
  }

  async function mountSession({ source = 'Rails', strict = false, query = 'tab=invalido' } = {}) {
    const calls: { method: string; href: string }[] = [];
    const writes: unknown[] = [];
    const requests: ReturnType<typeof deferred<RailsReply>>[] = [];
    const localRequests: ReturnType<typeof deferred<Response>>[] = [];
    const overviewRequests: ReturnType<typeof deferred<Response>>[] = [];
    const instances: number[] = [];
    const loadings: boolean[] = [];
    let nextInstance = 0;
    let activations = 0;
    let unmounted = false;
    let session: Pick<AdminSession, 'isGestor' | 'profileType'> | undefined;
    const router = {
      back() {}, forward() {}, refresh() {}, prefetch() {}, bfcacheId: 'current-session-test',
      push(href: string) { calls.push({ method: 'push', href }); },
      replace(href: string) { calls.push({ method: 'replace', href }); },
    };
    // Como na suíte 12D-4E, monta os hooks reais e o controlador de aliases;
    // apenas o DOM visual é omitido, sem um navegador ou serviços externos.
    const doc = {
      nodeType: 9, addEventListener() {}, removeEventListener() {}, activeElement: null, body: null,
      defaultView: null as unknown, documentElement: { classList: { contains() { return false; } } },
    };
    const browser = { document: doc, HTMLIFrameElement: class {}, location: { pathname: '/admin', search: '?' + query } };
    doc.defaultView = browser;
    const globals = {
      window: browser, document: doc, IS_REACT_ACT_ENVIRONMENT: true,
      MutationObserver: class { observe() {} disconnect() {} },
    };
    const descriptors = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const [key, value] of Object.entries(globals)) {
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const useState = React.useState;
    const setters = new WeakMap<React.Dispatch<React.SetStateAction<unknown>>, React.Dispatch<React.SetStateAction<unknown>>>();
    // Delega ao React e observa tentativas de escrita, inclusive as ignoradas
    // após unmount. Identifica a sessão pelo formato, sem índices de hooks.
    const stateMock = mock.method(React, 'useState', (<S,>(initial: S | (() => S)) => {
      const [value, setValue] = useState(initial);
      if (initial && typeof initial === 'object' && 'isGestor' in initial) {
        session = value as Pick<AdminSession, 'isGestor' | 'profileType'>;
      }
      const dispatch = setValue as React.Dispatch<React.SetStateAction<unknown>>;
      if (!setters.has(dispatch)) setters.set(dispatch, next => { writes.push(next); dispatch(next); });
      return [value, setters.get(dispatch)] as [S, React.Dispatch<React.SetStateAction<S>>];
    }) as typeof React.useState);
    const authCheck = mock.method(medtecApi.auth, 'isAuthenticated', () => source === 'Rails');
    const me = mock.method(medtecApi.auth, 'me', () => {
      const request = deferred<RailsReply>();
      requests.push(request);
      return request.promise;
    });
    const fetchMock = mock.method(globalThis, 'fetch', (input: RequestInfo | URL, options?: RequestInit) => {
      assert.equal(options?.method || 'GET', 'GET');
      const request = deferred<Response>();
      if (String(input) === '/api/auth') localRequests.push(request);
      else overviewRequests.push(request);
      return request.promise;
    });
    const warn = mock.method(console, 'warn', () => {});
    const error = mock.method(console, 'error', () => {});
    function ControllerHost() {
      const [instance] = useState(() => ++nextInstance);
      instances.push(instance);
      const dashboard = AdminDashboardRoute();
      const children = React.Children.toArray(dashboard.props.children);
      const content = children.find(node => isValidElement(node) && typeof node.type === 'string');
      assert.ok(isValidElement<{ className: string }>(content));
      loadings.push(content.props.className.includes('items-center justify-center'));
      const boundary = children.find(node => isValidElement(node) && node.type === React.Suspense);
      assert.ok(isValidElement(boundary));
      React.useEffect(() => { activations++; }, []);
      return boundary;
    }
    const container = {
      nodeType: 1, tagName: 'DIV', namespaceURI: 'http://www.w3.org/1999/xhtml', ownerDocument: doc,
      addEventListener() {}, removeEventListener() {}, textContent: '',
    };
    const root = createRoot(container as unknown as Element);
    async function render(mode: 'visible' | 'hidden' = 'visible') {
      let tree: React.ReactElement = createElement(AppRouterContext.Provider, { value: router },
        createElement(SearchParamsContext.Provider, { value: new URLSearchParams(browser.location.search) },
          jsx(React.Activity, { mode, children: createElement(ControllerHost) } satisfies React.ActivityProps)));
      if (strict) tree = createElement(React.StrictMode, null, tree);
      await React.act(async () => { root.render(tree); });
    }
    async function unmount() {
      if (!unmounted) {
        await React.act(async () => { root.unmount(); });
        unmounted = true;
      }
    }
    async function settle(action: () => void) {
      await React.act(async () => { action(); });
    }
    async function restore() {
      try { await unmount(); }
      finally {
        for (const spy of [stateMock, authCheck, me, fetchMock, warn, error]) spy.mock.restore();
        for (const [key, descriptor] of descriptors) {
          if (descriptor) Object.defineProperty(globalThis, key, descriptor);
          else Reflect.deleteProperty(globalThis, key);
        }
      }
    }
    try { await render(); } catch (cause) { await restore(); throw cause; }
    return {
      calls, writes, requests, localRequests, overviewRequests, fetchMock, authCheck, warn, error,
      render, unmount, settle, restore,
      async setQuery(nextQuery: string) {
        browser.location.search = '?' + nextQuery;
        await render();
      },
      setLocationSearch(nextQuery: string) { browser.location.search = '?' + nextQuery; },
      get session() { return session; },
      get loading() { return loadings.at(-1) ?? true; },
      get activations() { return activations; },
      assertRetained() { assert.equal(new Set(instances).size, 1); },
    };
  }

  for (const exit of ['unmount', 'hidden'] as const) for (const profile of ['Administrador', 'Curador de Fotos']) {
    it(`ignora ${profile} após ${exit}, sem navegar, escrever estado ou iniciar overview`, async () => {
      const page = await mountSession();
      try {
        page.calls.length = 0;
        if (exit === 'unmount') await page.unmount();
        else await page.render('hidden');
        await page.settle(() => page.requests[0].resolve(railsSession(profile)));
        assert.deepEqual(page.calls, []);
        assert.deepEqual(page.writes, []);
        assert.equal(page.session?.isGestor, false);
        assert.equal(page.loading, true);
        assert.equal(page.overviewRequests.length, 0);
      } finally { await page.restore(); }
    });
  }

  it('resposta antiga não encerra o loading enquanto a nova sessão ainda está pendente', async () => {
    const page = await mountSession();
    try {
      await page.render('hidden');
      await page.render();
      page.calls.length = 0;
      await page.settle(() => page.requests[0].resolve(railsSession('Editor de Notícias')));
      assert.equal(page.loading, true);
      assert.equal(page.session?.isGestor, false);
      assert.deepEqual(page.writes, []);
      assert.deepEqual(page.calls, []);
      await page.settle(() => page.requests[1].resolve(railsSession('Curador de Fotos')));
      assert.equal(page.loading, false);
      assert.equal(page.session?.profileType, 'Curador de Fotos');
      assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/banners' }]);
    } finally { await page.restore(); }
  });

  it('não aceita novamente a resposta antiga após Activity reativar uma execução legítima', async () => {
    const page = await mountSession();
    try {
      await page.render('hidden');
      await page.render();
      assert.equal(page.requests.length, 2);
      assert.equal(page.activations, 2);
      page.assertRetained();
      page.calls.length = 0;
      await page.settle(() => page.requests[1].resolve(railsSession('Publicador de Avisos')));
      assert.equal(page.session?.profileType, 'Publicador de Avisos');
      assert.equal(page.loading, false);
      assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/avisos' }]);
      const writes = page.writes.length;
      await page.settle(() => page.requests[0].resolve(railsSession('Administrador')));
      assert.equal(page.session?.profileType, 'Publicador de Avisos');
      assert.equal(page.writes.length, writes);
      assert.equal(page.overviewRequests.length, 0);
      assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/avisos' }]);
    } finally { await page.restore(); }
  });

  it('sessão local antiga ausente não encaminha para login nem reabre o loading atual', async () => {
    const page = await mountSession({ source: 'local' });
    try {
      await page.render('hidden');
      await page.render();
      await page.settle(() => page.localRequests[1].resolve(localSession('Editor de Notícias')));
      const writes = page.writes.length;
      page.calls.length = 0;
      await page.settle(() => page.localRequests[0].resolve(new Response('{}', { status: 401 })));
      assert.deepEqual(page.calls, []);
      assert.equal(page.writes.length, writes);
      assert.equal(page.session?.profileType, 'Editor de Notícias');
      assert.equal(page.loading, false);
    } finally { await page.restore(); }
  });

  for (const exit of ['unmount', 'reactivation'] as const) {
    it(`falha Rails obsoleta após ${exit} não inicia fallback nem interfere na sessão`, async () => {
      const page = await mountSession();
      try {
        if (exit === 'unmount') await page.unmount();
        else {
          await page.render('hidden');
          await page.render();
          await page.settle(() => page.requests[1].resolve(railsSession('Curador de Fotos')));
        }
        page.calls.length = 0;
        const writes = page.writes.length;
        await page.settle(() => page.requests[0].reject(new Error('Falha Rails antiga')));
        assert.equal(page.localRequests.length, 0);
        assert.equal(page.warn.mock.callCount(), 0);
        assert.equal(page.error.mock.callCount(), 0);
        assert.equal(page.writes.length, writes);
        assert.deepEqual(page.calls, []);
        if (exit === 'reactivation') assert.equal(page.session?.profileType, 'Curador de Fotos');
      } finally { await page.restore(); }
    });
  }

  it('resposta local após desmontagem não inicia parsing nem aplica sessão', async () => {
    const page = await mountSession({ source: 'local' });
    const response = localSession('Editor de Notícias');
    const parse = mock.method(response, 'json', async () => ({ isGestor: false, profileType: 'Editor de Notícias' }));
    try {
      await page.unmount();
      page.calls.length = 0;
      await page.settle(() => page.localRequests[0].resolve(response));
      assert.equal(parse.mock.callCount(), 0);
      assert.deepEqual(page.writes, []);
      assert.deepEqual(page.calls, []);
    } finally { parse.mock.restore(); await page.restore(); }
  });

  for (const outcome of ['resolve', 'reject'] as const) {
    it(`parsing local pendente (${outcome}) não altera a sessão após reativação`, async () => {
      const page = await mountSession({ source: 'local' });
      const json = deferred<{ isGestor: boolean; profileType: string }>();
      const response = localSession('Curador de Fotos');
      const parse = mock.method(response, 'json', () => json.promise);
      try {
        await page.settle(() => page.localRequests[0].resolve(response));
        assert.equal(parse.mock.callCount(), 1);
        await page.render('hidden');
        await page.render();
        await page.settle(() => page.localRequests[1].resolve(localSession('Publicador de Avisos')));
        const writes = page.writes.length;
        page.calls.length = 0;
        await page.settle(() => {
          if (outcome === 'resolve') json.resolve({ isGestor: false, profileType: 'Curador de Fotos' });
          else json.reject(new Error('Parsing antigo falhou'));
        });
        assert.equal(page.session?.profileType, 'Publicador de Avisos');
        assert.equal(page.loading, false);
        assert.equal(page.writes.length, writes);
        assert.equal(page.error.mock.callCount(), 0);
        assert.deepEqual(page.calls, []);
      } finally { parse.mock.restore(); await page.restore(); }
    });
  }

  it('falha de fetch local após desmontagem não trata erro nem solicita login', async () => {
    const page = await mountSession({ source: 'local' });
    try {
      await page.unmount();
      page.calls.length = 0;
      await page.settle(() => page.localRequests[0].reject(new Error('Rede antiga falhou')));
      assert.equal(page.error.mock.callCount(), 0);
      assert.deepEqual(page.writes, []);
      assert.deepEqual(page.calls, []);
    } finally { await page.restore(); }
  });

  it('Strict Mode invalida o primeiro setup antes do microtask e mantém o segundo funcional', async () => {
    const page = await mountSession({ strict: true });
    try {
      assert.equal(page.activations, 2);
      assert.equal(page.requests.length, 1);
      page.calls.length = 0;
      await page.settle(() => page.requests[0].resolve(railsSession('Curador de Fotos')));
      assert.equal(page.session?.profileType, 'Curador de Fotos');
      assert.equal(page.loading, false);
      assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/banners' }]);
    } finally { await page.restore(); }
  });

  it('preserva fallback local e encaminhamento editorial quando a falha Rails é vigente', async () => {
    const page = await mountSession({ query: 'tab=invalido&action=new' });
    try {
      page.calls.length = 0;
      await page.settle(() => page.requests[0].reject(new Error('Token recusado simulado')));
      assert.equal(page.localRequests.length, 1);
      assert.equal(page.warn.mock.callCount(), 1);
      await page.settle(() => page.localRequests[0].resolve(localSession('Editor de Notícias')));
      assert.equal(page.session?.profileType, 'Editor de Notícias');
      assert.equal(page.loading, false);
      assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/noticias?action=new' }]);
    } finally { await page.restore(); }
  });

  it('preserva o login por erro vigente e mantém o loading de sessão', async () => {
    const page = await mountSession({ source: 'local' });
    try {
      page.calls.length = 0;
      await page.settle(() => page.localRequests[0].reject(new Error('Falha vigente')));
      assert.equal(page.error.mock.callCount(), 1);
      assert.equal(page.loading, true);
      assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/login' }]);
    } finally { await page.restore(); }
  });

  it('mantém as leituras do overview e o contador de dúvidas para o Administrador vigente', async () => {
    const page = await mountSession();
    try {
      page.calls.length = 0;
      await page.settle(() => page.requests[0].resolve(railsSession('Administrador')));
      assert.equal(page.session?.isGestor, true);
      assert.equal(page.loading, false);
      assert.equal(page.overviewRequests.length, 10);
      assert.equal(page.localRequests.length, 0);
      assert.deepEqual(page.calls, []);
    } finally { await page.restore(); }
  });

  it('mantém a guarda antecipada de aliases com efeitos reais', async () => {
    for (const alias of ['fotos', 'banners', 'projetos', 'duvidas', 'faq', 'usuarios', 'kanban']) {
      for (const parameter of ['tab', 'section']) {
        const page = await mountSession({ query: `${parameter}=${alias}&action=new` });
        try {
          assert.equal(page.authCheck.mock.callCount(), 0);
          assert.equal(page.requests.length, 0);
          assert.equal(page.fetchMock.mock.callCount(), 0);
          assert.equal(page.calls.length, 1);
        } finally { await page.restore(); }
      }
    }
  });
  it('12D-5 Lote 1: dashboard preserva classificação Rails, estados e destinos anteriores', async () => {
    for (const [label, fields, expected] of railsGestorCases) {
      const page = await mountSession();
      try {
        await page.settle(() => page.requests[0].resolve(railsClassificationReply(fields)));
        assert.equal(page.session?.isGestor, expected, label);
        assert.equal(page.session?.profileType, fields.perfil_nome, label);
        assert.equal(page.loading, false, label);
        assert.equal(page.localRequests.length, 0, label);
        assert.equal(page.overviewRequests.length, expected ? 10 : 0, label);
        const profile = fields.perfil_nome;
        assert.deepEqual(page.calls, expected ? [] : profile === 'Curador de Fotos'
          ? [{ method: 'replace', href: '/admin/banners' }] : profile === 'Publicador de Avisos'
          ? [{ method: 'push', href: '/admin/avisos' }] : [{ method: 'replace', href: '/admin/noticias' }], label);
        page.assertRetained();
      } finally { await page.restore(); }
    }
  });

  it('12D-5 Lote 1: dashboard mantém fallback quando data Rails é nulo ou ausente', async () => {
    for (const reply of [{ success: true, data: null }, { success: true }]) {
      const page = await mountSession();
      try {
        await page.settle(() => page.requests[0].resolve(JSON.parse(JSON.stringify(reply))));
        assert.equal(page.localRequests.length, 1);
        assert.equal(page.session?.isGestor, false);
        assert.equal(page.loading, true);
        assert.deepEqual(page.calls, []);
        await page.settle(() => page.localRequests[0].resolve(new Response('{}', { status: 401 })));
        assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/login' }]);
      } finally { await page.restore(); }
    }
  });

  it('12D-5 Lote 2: dashboard mantém campos Rails e editorialProfile sem incluir role/apiUser', async () => {
    for (const { label, data, expected, pageRenderError } of railsSessionFieldCases) {
      const page = await mountSession();
      const reply: RailsReply = JSON.parse(JSON.stringify({ success: true, message: 'Sessão sintética', data }));
      Object.freeze(reply.data);
      const before = structuredClone(reply.data);
      try {
        const settle = () => page.settle(() => page.requests[0].resolve(reply));
        // O avatar legado chama substring no nome. Caracteriza essa limitação
        // com valores não textuais, sem normalizá-los ou corrigir a interface.
        if (pageRenderError) await assert.rejects(settle, { name: 'TypeError', message: /substring/ });
        else await settle();
        assert.deepEqual(page.session, { ...expected, editorialProfile: expected.profileType }, label);
        assert.deepEqual(reply.data, before, label);
        if (!pageRenderError) assert.equal(page.loading, false, label);
        assert.equal(page.localRequests.length, 0, label);
        assert.equal(page.overviewRequests.length, expected.isGestor ? 10 : 0, label);
        assert.deepEqual(page.calls, expected.isGestor ? [] : expected.profileType === 'Curador de Fotos'
          ? [{ method: 'replace', href: '/admin/banners' }] : expected.profileType === 'Publicador de Avisos'
          ? [{ method: 'push', href: '/admin/avisos' }] : [{ method: 'replace', href: '/admin/noticias' }], label);
      } finally { await page.restore(); }
    }
  });

  it('12D-5 Lote 2: dashboard mantém campos locais e encaminhamento após fallback Rails', async () => {
    for (const source of ['Rails', 'local']) for (const { label, data, expected, pageRenderError } of localSessionFieldCases) {
      const page = await mountSession({ source });
      const response = new Response(JSON.stringify(data), { status: 200 });
      const input = Object.freeze(structuredClone(data));
      const parse = mock.method(response, 'json', async () => input);
      try {
        if (source === 'Rails') await page.settle(() => page.requests[0].reject(new Error('Falha Rails simulada')));
        const settle = () => page.settle(() => page.localRequests[0].resolve(response));
        if (pageRenderError) await assert.rejects(settle, { name: 'TypeError', message: /substring/ });
        else await settle();
        assert.deepEqual(page.session, expected, `${source}: ${label}`);
        assert.deepEqual(input, data, label);
        if (!pageRenderError) assert.equal(page.loading, false, label);
        assert.equal(page.overviewRequests.length, expected.isGestor ? (source === 'Rails' && !pageRenderError ? 10 : 9) : 0, label);
        assert.deepEqual(page.calls, expected.isGestor ? [] : expected.profileType === 'Curador de Fotos'
          ? [{ method: 'replace', href: '/admin/banners' }] : expected.profileType === 'Publicador de Avisos'
          ? [{ method: 'push', href: '/admin/avisos' }] : [{ method: 'replace', href: '/admin/noticias' }], label);
        assert.equal(page.warn.mock.callCount(), source === 'Rails' ? 1 : 0);
      } finally { parse.mock.restore(); await page.restore(); }
    }
  });

  it('12D-5 Lote 2: dashboard não aceita body local nulo nem JSON inválido', async () => {
    for (const body of ['null', '{']) {
      const page = await mountSession({ source: 'local' });
      try {
        await page.settle(() => page.localRequests[0].resolve(new Response(body, { status: 200 })));
        assert.deepEqual(page.session, { isGestor: false });
        assert.equal(page.loading, true);
        assert.equal(page.error.mock.callCount(), 1);
        assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/login' }]);
      } finally { await page.restore(); }
    }
  });

  describe('12D-5 Lote 4: retorno seguro preserva decisão editorial e E+D', () => {
    for (const source of ['Rails', 'local']) {
      for (const [profile, method, href] of [
        ['Editor de Notícias', 'replace', '/admin/noticias?action=new'],
        ['Curador de Fotos', 'replace', '/admin/banners'],
        ['Publicador de Avisos', 'push', '/admin/avisos'],
        ['Operador de Conteúdo', 'replace', '/admin/noticias?action=new'],
      ]) {
        it(`${source}, ${profile}: retorno conserva perfil, método e intenção`, async () => {
          const safe = adminAuthNavigation.getSafeAdminReturnTarget('/admin?tab=visaoGeral&action=new&redirect=x&section=faq');
          const query = new URL(safe, 'https://medtec.invalid').search.slice(1);
          assert.equal(query, 'tab=visaoGeral&action=new&section=faq');
          const page = await mountSession({ source, query });
          try {
            await page.settle(() => {
              if (source === 'Rails') page.requests[0].resolve(railsSession(profile));
              else page.localRequests[0].resolve(localSession(profile));
            });
            assert.deepEqual(page.calls, [{ method, href }]);
            assert.equal(page.session?.isGestor, false);
            assert.equal(page.session?.profileType, profile);
            assert.equal(page.overviewRequests.length, 0);
          } finally { await page.restore(); }
        });
      }
      it(`${source}: alias canônico do retorno prevalece e delega autenticação`, async () => {
        const safe = adminAuthNavigation.getSafeAdminReturnTarget('/admin?tab=faq&section=avisos&redirect=x');
        const page = await mountSession({ source, query: new URL(safe, 'https://medtec.invalid').search.slice(1) });
        try {
          assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/faq' }]);
          assert.equal(page.authCheck.mock.callCount(), 0);
          assert.equal(page.requests.length + page.localRequests.length + page.overviewRequests.length, 0);
        } finally { await page.restore(); }
      });
    }
  });

  describe('12D-5 Lote 3: caracterização editorial nos fluxos Rails e local', () => {
    for (const source of ['Rails', 'local']) {
      it(`${source}: mesmos perfis, métodos, destinos e loading`, async () => {
        for (const { label, isGestor, profileType, expected, localOnly, inactive } of editorialProfileCases) {
          if (source === 'Rails' && localOnly) continue;
          const page = await mountSession({ source });
          try {
            await page.settle(() => {
              if (source === 'Rails') page.requests[0].resolve(railsClassificationReply({
                id: isGestor && profileType !== 'Administrador' ? 1 : 100,
                perfil_id: 2, perfil_nome: profileType, ativo: !inactive,
              }));
              else page.localRequests[0].resolve(new Response(JSON.stringify({
                isGestor, profileType, user: 'editorial-sintetico', name: 'Nome sintético',
              }), { status: 200 }));
            });
            assert.deepEqual(page.calls, expected ? [expected] : [], label);
            assert.equal(page.session?.isGestor, isGestor, label);
            assert.equal(page.session?.profileType, profileType, label);
            assert.equal(page.loading, false, label);
            assert.equal(page.overviewRequests.length, isGestor ? (source === 'Rails' ? 10 : 9) : 0, label);
            assert.equal(page.requests.length, source === 'Rails' ? 1 : 0, label);
            assert.equal(page.localRequests.length, source === 'local' ? 1 : 0, label);
          } finally { await page.restore(); }
        }
      });

      it(`${source}: query vigente após espera preserva criação, lista, primeiro valor e precedência`, async () => {
        for (const [query, href] of editorialQueryCases) {
          const page = await mountSession({ source, query: 'tab=invalido&mode=nova' });
          try {
            await page.setQuery(`tab=invalido&${query}`);
            assert.deepEqual(page.calls, []);
            assert.equal(page.authCheck.mock.callCount(), 1);
            await page.settle(() => {
              if (source === 'Rails') page.requests[0].resolve(railsSession('Editor de Notícias'));
              else page.localRequests[0].resolve(localSession('Editor de Notícias'));
            });
            assert.deepEqual(page.calls, [{ method: 'replace', href }], query);
            assert.equal(page.loading, false);
            assert.equal(page.authCheck.mock.callCount(), 1);
            page.assertRetained();
          } finally { await page.restore(); }
        }
      });

      it(`${source}: contexto canônico invalida sessão anterior e retorno ao Início inicia decisão atual`, async () => {
        const page = await mountSession({ source, query: 'tab=visaoGeral&action=new' });
        try {
          await page.setQuery('tab=redes&section=noticias&mode=editor');
          const writes = page.writes.length;
          await page.settle(() => {
            if (source === 'Rails') page.requests[0].resolve(railsSession('Publicador de Avisos'));
            else page.localRequests[0].resolve(localSession('Publicador de Avisos'));
          });
          assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/redes' }]);
          assert.equal(page.writes.length, writes);
          assert.equal(page.session?.isGestor, false);
          await page.setQuery('tab=visaoGeral&mode=lista');
          assert.equal(page.authCheck.mock.callCount(), 2);
          await page.settle(() => {
            if (source === 'Rails') page.requests[1].resolve(railsSession('Editor de Notícias'));
            else page.localRequests[1].resolve(localSession('Editor de Notícias'));
          });
          assert.deepEqual(page.calls, [
            { method: 'push', href: '/admin/redes' }, { method: 'replace', href: '/admin/noticias' },
          ]);
          assert.equal(page.loading, false);
          page.assertRetained();
        } finally { await page.restore(); }
      });
    }
  });

  describe('Coordenação E + D entre aliases e sessão (12D-4F-B3.3)', () => {
    const aliasCases = [
      ['Administrador Rails + Redes', 'Rails', 'tab=redes', 'push', '/admin/redes'],
      ['Administrador Rails + Usuários', 'Rails', 'tab=usuarios', 'replace', '/admin/usuarios'],
      ['Editor + Notícias', 'Rails', 'tab=noticias', 'replace', '/admin/noticias'],
      ['Editor + Redes', 'Rails', 'tab=redes', 'push', '/admin/redes'],
      ['Curador + Banners', 'Rails', 'tab=banners', 'replace', '/admin/banners'],
      ['Curador + Galeria', 'Rails', 'tab=galeria', 'push', '/admin/galeria'],
      ['Publicador + Avisos', 'Rails', 'tab=avisos', 'push', '/admin/avisos'],
      ['Publicador + Notícias', 'Rails', 'tab=noticias', 'replace', '/admin/noticias'],
      ['Operador + Avisos', 'Rails', 'tab=avisos', 'push', '/admin/avisos'],
      ['Gestor literal + Redes', 'Rails', 'tab=redes', 'push', '/admin/redes'],
      ['Curador local + Galeria', 'local', 'tab=galeria', 'push', '/admin/galeria'],
      ['Administrador local + Usuários', 'local', 'tab=usuarios', 'replace', '/admin/usuarios'],
      ['Curador + tab precedendo section', 'Rails', 'tab=redes&section=galeria', 'push', '/admin/redes'],
      ['Editor + action=new', 'Rails', 'tab=noticias&action=new', 'replace', '/admin/noticias?action=new'],
      ['Editor + mode=editor', 'Rails', 'section=noticias&mode=editor', 'replace', '/admin/noticias?action=new'],
      ['Projetos + action=new', 'Rails', 'tab=projetos&action=new', 'replace', '/admin/projetos?action=new'],
    ];
    for (const [label, source, query, method, href] of aliasCases) {
      it(`${label}: encaminha sem consultar perfil, sessão ou overview na página`, async () => {
        const page = await mountSession({ source, query });
        try {
          assert.deepEqual(page.calls, [{ method, href }]);
          assert.equal(page.authCheck.mock.callCount(), 0);
          assert.equal(page.requests.length, 0);
          assert.equal(page.fetchMock.mock.callCount(), 0);
          assert.equal(page.session?.isGestor, false);
          page.assertRetained();
        } finally { await page.restore(); }
      });
    }

    for (const source of ['Rails', 'local']) {
      it(`${source}: URL canônica antes do commit React já impede efeitos da resposta anterior`, async () => {
        const page = await mountSession({ source, query: '' });
        try {
          page.setLocationSearch('tab=redes');
          const writes = page.writes.length;
          await page.settle(() => {
            if (source === 'Rails') page.requests[0].resolve(railsSession('Administrador'));
            else page.localRequests[0].resolve(localSession('Administrador'));
          });
          assert.equal(page.writes.length, writes);
          assert.equal(page.overviewRequests.length, 0);
          assert.deepEqual(page.calls, []);
          await page.setQuery('tab=redes');
          assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/redes' }]);
          assert.equal(page.authCheck.mock.callCount(), 1);
        } finally { await page.restore(); }
      });

      it(`${source}: Gestor literal sem heurísticas mantém destino editorial e não vira Administrador`, async () => {
        const page = await mountSession({ source, query: '' });
        try {
          await page.settle(() => {
            if (source === 'Rails') page.requests[0].resolve(railsSession('Gestor'));
            else page.localRequests[0].resolve(localSession('Gestor'));
          });
          assert.equal(page.session?.isGestor, false);
          assert.equal(page.session?.profileType, 'Gestor');
          assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/noticias' }]);
          assert.equal(page.overviewRequests.length, 0);
        } finally { await page.restore(); }
      });

      for (const query of ['', 'tab=visaoGeral', 'tab=desconhecido&section=noticias']) {
        it(`${source}: sem alias canônico (${query || 'ausente'}) mantém sessão e destino editorial`, async () => {
          const page = await mountSession({ source, query });
          try {
            assert.deepEqual(page.calls, []);
            assert.equal(page.loading, true);
            await page.settle(() => {
              if (source === 'Rails') page.requests[0].resolve(railsSession('Editor de Notícias'));
              else page.localRequests[0].resolve(localSession('Editor de Notícias'));
            });
            assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/noticias' }]);
            assert.equal(page.loading, false);
            assert.equal(page.session?.profileType, 'Editor de Notícias');
            assert.equal(page.authCheck.mock.callCount(), 1);
          } finally { await page.restore(); }
        });
      }

      for (const query of ['', 'tab=visaoGeral', 'tab=invalido']) {
        it(`${source}: alias guardado → ${query || 'Início'} retoma autenticação sem remontar`, async () => {
          const page = await mountSession({ source, query: 'tab=banners' });
          try {
            assert.equal(page.authCheck.mock.callCount(), 0);
            await page.setQuery(query);
            assert.equal(page.authCheck.mock.callCount(), 1);
            assert.equal(page.loading, true);
            await page.settle(() => {
              if (source === 'Rails') page.requests[0].resolve(railsSession('Curador de Fotos'));
              else page.localRequests[0].resolve(localSession('Curador de Fotos'));
            });
            assert.equal(page.loading, false);
            assert.deepEqual(page.calls, [
              { method: 'replace', href: '/admin/banners' }, { method: 'replace', href: '/admin/banners' },
            ]);
            page.assertRetained();
          } finally { await page.restore(); }
        });
      }

      it(`${source}: intenção canônica invalida autenticação pendente e o retorno inicia nova execução`, async () => {
        const page = await mountSession({ source, query: '' });
        try {
          await page.setQuery('tab=galeria');
          const writes = page.writes.length;
          await page.setQuery('tab=desconhecido&action=new');
          assert.equal(page.authCheck.mock.callCount(), 2);
          await page.settle(() => {
            if (source === 'Rails') page.requests[0].resolve(railsSession('Administrador'));
            else page.localRequests[0].resolve(localSession('Administrador'));
          });
          assert.equal(page.writes.length, writes);
          assert.equal(page.loading, true);
          assert.equal(page.overviewRequests.length, 0);
          await page.settle(() => {
            if (source === 'Rails') page.requests[1].resolve(railsSession('Editor de Notícias'));
            else page.localRequests[1].resolve(localSession('Editor de Notícias'));
          });
          assert.deepEqual(page.calls, [
            { method: 'push', href: '/admin/galeria' }, { method: 'replace', href: '/admin/noticias?action=new' },
          ]);
          assert.equal(page.loading, false);
          await page.setQuery('tab=galeria');
          assert.deepEqual(page.calls.at(-1), { method: 'push', href: '/admin/galeria' });
          assert.equal(page.authCheck.mock.callCount(), 2);
          page.assertRetained();
        } finally { await page.restore(); }
      });

      it(`${source}: resposta sem sessão obsoleta não disputa login com alias vigente`, async () => {
        const page = await mountSession({ source, query: '' });
        try {
          if (source === 'Rails') await page.settle(() => page.requests[0].resolve({ ...railsSession('Editor de Notícias'), success: false }));
          await page.setQuery('tab=redes');
          const writes = page.writes.length;
          await page.settle(() => page.localRequests[0].resolve(new Response('{}', { status: 401 })));
          assert.deepEqual(page.calls, [{ method: 'push', href: '/admin/redes' }]);
          assert.equal(page.writes.length, writes);
        } finally { await page.restore(); }
      });

      it(`${source}: query irrelevante não reinicia sessão, mas destino editorial usa query vigente`, async () => {
        const page = await mountSession({ source, query: 'tab=invalido&action=new' });
        try {
          await page.setQuery('section=invalido&mode=lista&extra=2');
          assert.equal(page.authCheck.mock.callCount(), 1);
          await page.settle(() => {
            if (source === 'Rails') page.requests[0].resolve(railsSession('Editor de Notícias'));
            else page.localRequests[0].resolve(localSession('Editor de Notícias'));
          });
          assert.deepEqual(page.calls, [{ method: 'replace', href: '/admin/noticias' }]);
          assert.equal(page.loading, false);
        } finally { await page.restore(); }
      });
    }

    it('Activity permite reencaminhar alias e depois retomar sessão, sem reabilitar execução antiga', async () => {
      const page = await mountSession({ query: '' });
      try {
        await page.setQuery('tab=avisos');
        await page.render('hidden');
        await page.render();
        await page.setQuery('tab=visaoGeral');
        assert.equal(page.requests.length, 2);
        await page.settle(() => page.requests[1].resolve(railsSession('Publicador de Avisos')));
        const writes = page.writes.length;
        await page.settle(() => page.requests[0].resolve(railsSession('Administrador')));
        assert.equal(page.writes.length, writes);
        assert.equal(page.session?.profileType, 'Publicador de Avisos');
        assert.deepEqual(page.calls, Array.from({ length: 3 }, () => ({ method: 'push', href: '/admin/avisos' })));
        assert.equal(page.loading, false);
        assert.equal(page.activations, 2);
        page.assertRetained();
      } finally { await page.restore(); }
    });

    it('Strict Mode preserva replay de alias sem uma emissão editorial adicional', async () => {
      const page = await mountSession({ query: 'tab=avisos', strict: true });
      try {
        assert.deepEqual(page.calls, [
          { method: 'push', href: '/admin/avisos' }, { method: 'push', href: '/admin/avisos' },
        ]);
        assert.equal(page.authCheck.mock.callCount(), 0);
        await page.setQuery('section=avisos&extra=2');
        assert.equal(page.calls.length, 2);
        await page.setQuery('tab=visaoGeral');
        assert.equal(page.requests.length, 1);
        await page.settle(() => page.requests[0].resolve(railsSession('Publicador de Avisos')));
        assert.equal(page.calls.length, 3);
        assert.equal(page.loading, false);
        page.assertRetained();
      } finally { await page.restore(); }
    });

    it('módulos equivalentes não autenticam; mudanças reais e retorno ao alias anterior navegam', async () => {
      const page = await mountSession({ query: 'tab=noticias&mode=editor' });
      try {
        await page.setQuery('section=noticias&action=new&extra=2');
        assert.equal(page.calls.length, 1);
        await page.setQuery('tab=projetos&action=new');
        await page.setQuery('tab=noticias&mode=nova');
        assert.deepEqual(page.calls, [
          { method: 'replace', href: '/admin/noticias?action=new' },
          { method: 'replace', href: '/admin/projetos?action=new' },
          { method: 'replace', href: '/admin/noticias?action=new' },
        ]);
        assert.equal(page.authCheck.mock.callCount(), 0);
        assert.equal(page.fetchMock.mock.callCount(), 0);
        page.assertRetained();
      } finally { await page.restore(); }
    });
  });

  describe('URL vigente nos redirects editoriais (12D-4F-B3.1)', () => {
    const transitions = [
      { from: 'tab=invalido', to: 'tab=invalido&action=new', after: '/admin/noticias?action=new' },
      { from: 'tab=invalido&mode=editor', to: 'tab=invalido&mode=lista', after: '/admin/noticias' },
      { from: 'tab=invalido', to: 'section=invalido&mode=nova', after: '/admin/noticias?action=new' },
    ];
    for (const source of ['Rails', 'local']) for (const profile of ['Editor de Notícias', 'Operador de Conteúdo']) {
      for (const transition of transitions) {
        it(`${source}, ${profile}: ${transition.from} → ${transition.to} usa a query vigente`, async () => {
          const page = await mountSession({ source, query: transition.from });
          try {
            await page.setQuery(transition.to);
            assert.deepEqual(page.calls, []);
            assert.equal(page.authCheck.mock.callCount(), 1);
            assert.equal(page.requests.length, source === 'Rails' ? 1 : 0);
            assert.equal(page.localRequests.length, source === 'local' ? 1 : 0);
            page.assertRetained();
            assert.equal(page.activations, 1);
            await page.settle(() => {
              if (source === 'Rails') page.requests[0].resolve(railsSession(profile));
              else page.localRequests[0].resolve(localSession(profile));
            });
            // Sem alias canônico, o único encaminhamento editorial usa a URL vigente.
            assert.deepEqual(page.calls, [{ method: 'replace', href: transition.after }]);
            assert.equal(page.session?.profileType, profile);
            assert.equal(page.loading, false);
            assert.equal(page.authCheck.mock.callCount(), 1);
          } finally { await page.restore(); }
        });
      }
    }

    it('reavalia a query alterada durante fallback local após falha Rails', async () => {
      const page = await mountSession({ query: 'tab=invalido' });
      try {
        await page.settle(() => page.requests[0].reject(new Error('Token recusado simulado')));
        assert.equal(page.localRequests.length, 1);
        await page.setQuery('tab=invalido&mode=new');
        await page.settle(() => page.localRequests[0].resolve(localSession('Gestor')));
        assert.deepEqual(page.calls.at(-1), { method: 'replace', href: '/admin/noticias?action=new' });
        assert.equal(page.session?.isGestor, false);
        assert.equal(page.requests.length, 1);
        assert.equal(page.localRequests.length, 1);
        assert.equal(page.warn.mock.callCount(), 1);
      } finally { await page.restore(); }
    });

    for (const profile of ['Editor de Notícias', 'Operador de Conteúdo']) {
      it(`reavalia a query após parsing JSON local pendente para ${profile}`, async () => {
        const page = await mountSession({ source: 'local', query: 'tab=invalido' });
        const json = deferred<{ isGestor: boolean; profileType: string }>();
        const response = localSession(profile);
        const parse = mock.method(response, 'json', () => json.promise);
        try {
          await page.settle(() => page.localRequests[0].resolve(response));
          assert.equal(parse.mock.callCount(), 1);
          await page.setQuery('section=invalido&action=new');
          await page.settle(() => json.resolve({ isGestor: false, profileType: profile }));
          assert.deepEqual(page.calls.at(-1), { method: 'replace', href: '/admin/noticias?action=new' });
          assert.equal(page.localRequests.length, 1);
          assert.equal(page.session?.profileType, profile);
        } finally { parse.mock.restore(); await page.restore(); }
      });
    }

    for (const source of ['Rails', 'local']) {
      it(`${source}: parâmetros equivalentes não reiniciam sessão nem repetem alias`, async () => {
        const page = await mountSession({ source, query: 'tab=invalido&action=new&mode=editor&extra=1' });
        try {
          await page.setQuery('mode=editor&action=new&tab=invalido&action=list&extra=2');
          assert.deepEqual(page.calls, []);
          await page.settle(() => {
            if (source === 'Rails') page.requests[0].resolve(railsSession('Editor de Notícias'));
            else page.localRequests[0].resolve(localSession('Editor de Notícias'));
          });
          assert.deepEqual(page.calls, [
            { method: 'replace', href: '/admin/noticias?action=new' },
          ]);
          assert.equal(page.authCheck.mock.callCount(), 1);
          page.assertRetained();
        } finally { await page.restore(); }
      });

      it(`${source}: ausência atual de parâmetros editoriais retorna à lista`, async () => {
        const page = await mountSession({ source, query: 'tab=noticias&action=new' });
        try {
          await page.setQuery('extra=sem-atalho');
          await page.settle(() => {
            if (source === 'Rails') page.requests[0].resolve(railsSession('Editor de Notícias'));
            else page.localRequests[0].resolve(localSession('Editor de Notícias'));
          });
          assert.deepEqual(page.calls, [
            { method: 'replace', href: '/admin/noticias?action=new' }, { method: 'replace', href: '/admin/noticias' },
          ]);
          assert.equal(page.authCheck.mock.callCount(), 1);
        } finally { await page.restore(); }
      });

      it(`${source}: preserva primeiro valor, vazios, caixa e as regras de tab/section/action/mode`, async () => {
        const cases: [string, string, string | null][] = [
          ['tab=noticias&action=list&action=new&mode=lista', '/admin/noticias', '/admin/noticias'],
          ['tab=noticias&action=new&action=list', '/admin/noticias?action=new', '/admin/noticias?action=new'],
          ['tab=noticias&mode=lista&mode=editor', '/admin/noticias', '/admin/noticias'],
          ['tab=noticias&mode=nova&mode=lista', '/admin/noticias?action=new', '/admin/noticias?action=new'],
          ['tab=noticias&action=list&mode=new', '/admin/noticias?action=new', '/admin/noticias?action=new'],
          ['tab=noticias&action=NEW&mode=EDITOR', '/admin/noticias', '/admin/noticias'],
          ['tab=noticias&mode=&mode=editor', '/admin/noticias', '/admin/noticias'],
          ['tab=&section=noticias&mode=nova', '/admin/noticias?action=new', '/admin/noticias?action=new'],
          ['tab=redes&section=noticias&action=new', '/admin/noticias?action=new', '/admin/redes'],
          ['tab=desconhecido&section=noticias&mode=editor', '/admin/noticias?action=new', null],
        ];
        for (const [query, href, aliasHref] of cases) {
          const page = await mountSession({ source, query: 'tab=invalido' });
          try {
            page.calls.length = 0;
            await page.setQuery(query);
            assert.deepEqual(page.calls, aliasHref ? [{ method: aliasHref === '/admin/redes' ? 'push' : 'replace', href: aliasHref }] : []);
            await page.settle(() => {
              if (source === 'Rails') page.requests[0].resolve(railsSession('Editor de Notícias'));
              else page.localRequests[0].resolve(localSession('Editor de Notícias'));
            });
            assert.deepEqual(page.calls, aliasHref
              ? [{ method: aliasHref === '/admin/redes' ? 'push' : 'replace', href: aliasHref }]
              : [{ method: 'replace', href }]);
            assert.equal(page.authCheck.mock.callCount(), 1);
          } finally { await page.restore(); }
        }
      });

      it(`${source}: sessão ausente continua solicitando login após mudança da query`, async () => {
        const page = await mountSession({ source, query: 'tab=invalido' });
        try {
          if (source === 'Rails') await page.settle(() => page.requests[0].reject(new Error('Sessão recusada simulada')));
          await page.setQuery('tab=invalido&action=new');
          await page.settle(() => page.localRequests[0].resolve(new Response('{}', { status: 401 })));
          assert.deepEqual(page.calls.at(-1), { method: 'push', href: '/admin/login' });
          assert.equal(page.loading, true);
          assert.equal(page.authCheck.mock.callCount(), 1);
        } finally { await page.restore(); }
      });

      for (const exit of ['unmount', 'hidden'] as const) {
        it(`${source}: query nova não revalida callbacks após ${exit}`, async () => {
          const page = await mountSession({ source, query: 'tab=invalido' });
          try {
            await page.setQuery('tab=invalido&action=new');
            if (exit === 'unmount') await page.unmount();
            else await page.render('hidden');
            const writes = page.writes.length;
            const calls = [...page.calls];
            await page.settle(() => {
              if (source === 'Rails') page.requests[0].resolve(railsSession('Editor de Notícias'));
              else page.localRequests[0].resolve(localSession('Editor de Notícias'));
            });
            assert.deepEqual(page.calls, calls);
            assert.equal(page.writes.length, writes);
            assert.equal(page.session?.isGestor, false);
          } finally { await page.restore(); }
        });
      }
    }
  });
});

describe('Execuções de sessão vigentes no AdminShell (12D-4F-B2)', () => {
  type RailsReply = Awaited<ReturnType<typeof medtecApi.auth.me>>;
  function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((accept, refuse) => { resolve = accept; reject = refuse; });
    return { promise, resolve, reject };
  }
  function railsSession(profile: string, overrides: Partial<NonNullable<RailsReply['data']>> = {}): RailsReply {
    return { success: true, message: 'Sessão sintética', data: {
      id: 100, perfil_id: 2, perfil_nome: profile, nome: 'Usuário de teste', cpf: '00000000000', ativo: true, ...overrides,
    } };
  }
  function localSession(profile: string, isGestor = false) {
    return new Response(JSON.stringify({ isGestor, profileType: profile, user: 'operador-sintetico' }), { status: 200 });
  }

  async function mountShell({ source = 'Rails', strict = false, section = 'redes', pathname = '/admin/redes', search = '', children = 'B2: conteúdo protegido' }: {
    source?: string; strict?: boolean; section?: AdminSection; pathname?: string; search?: string; children?: AdminShellProps['children'];
  } = {}) {
    const calls: { method: string; href: string }[] = [];
    const writes: unknown[] = [];
    const requests: ReturnType<typeof deferred<RailsReply>>[] = [];
    const localRequests: ReturnType<typeof deferred<Response>>[] = [];
    const instances: number[] = [];
    const snapshots: { loading: boolean; restricted: boolean; content: boolean }[] = [];
    const observed: { session?: AdminSession; loadingAuth: boolean } = { loadingAuth: true };
    let nextInstance = 0;
    let activations = 0;
    let unmounted = false;
    const router = {
      back() {}, forward() {}, refresh() {}, prefetch() {}, bfcacheId: 'shell-session-test',
      push(href: string) { calls.push({ method: 'push', href }); },
      replace(href: string) { calls.push({ method: 'replace', href }); },
    };
    // Monta os hooks reais, observando a árvore retornada pelo Shell sem
    // renderizar o DOM visual. Todas as consultas são promessas controladas.
    const doc = {
      nodeType: 9, addEventListener() {}, removeEventListener() {}, activeElement: null, body: null,
      defaultView: null as unknown, documentElement: { classList: { contains() { return false; } } },
    };
    const browser = { document: doc, HTMLIFrameElement: class {}, location: { pathname, search } };
    doc.defaultView = browser;
    const globals = {
      window: browser, document: doc, IS_REACT_ACT_ENVIRONMENT: true,
      MutationObserver: class { observe() {} disconnect() {} },
    };
    const descriptors = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const [key, value] of Object.entries(globals)) {
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const useState = React.useState;
    const setters = new WeakMap<React.Dispatch<React.SetStateAction<unknown>>, React.Dispatch<React.SetStateAction<unknown>>>();
    const stateMock = mock.method(React, 'useState', (<S,>(initial: S | (() => S)) => {
      const [value, setValue] = useState(initial);
      // Identifica estados por seus valores iniciais, sem índices de hooks;
      // os setters preservam identidade e continuam delegando ao React.
      if (initial && typeof initial === 'object' && 'isGestor' in initial) observed.session = value as AdminSession;
      if (initial === true) observed.loadingAuth = value as boolean;
      const dispatch = setValue as React.Dispatch<React.SetStateAction<unknown>>;
      if (!setters.has(dispatch)) setters.set(dispatch, next => { writes.push(next); dispatch(next); });
      return [value, setters.get(dispatch)] as [S, React.Dispatch<React.SetStateAction<S>>];
    }) as typeof React.useState);
    const authCheck = mock.method(medtecApi.auth, 'isAuthenticated', () => source === 'Rails');
    const me = mock.method(medtecApi.auth, 'me', () => {
      const request = deferred<RailsReply>();
      requests.push(request);
      return request.promise;
    });
    const fetchMock = mock.method(globalThis, 'fetch', (input: RequestInfo | URL, options?: RequestInit) => {
      assert.equal(String(input), '/api/auth');
      assert.equal(options?.method || 'GET', 'GET');
      const request = deferred<Response>();
      localRequests.push(request);
      return request.promise;
    });
    const warn = mock.method(console, 'warn', () => {});
    const error = mock.method(console, 'error', () => {});
    function textNodes(node: ReactNode): string[] {
      if (typeof node === 'string') return [node];
      if (Array.isArray(node)) return node.flatMap(textNodes);
      if (isValidElement<{ children?: ReactNode }>(node)) return textNodes(node.props.children);
      return [];
    }
    function ControllerHost() {
      const [instance] = useState(() => ++nextInstance);
      instances.push(instance);
      const tree = AdminShell({ activeSection: section, children });
      const text = textNodes(tree);
      snapshots.push({
        loading: text.some(value => value.includes('Autenticando e carregando')),
        restricted: text.includes('Acesso Restrito'), content: text.includes('B2: conteúdo protegido'),
      });
      React.useEffect(() => { activations++; }, []);
      return null;
    }
    const container = {
      nodeType: 1, tagName: 'DIV', namespaceURI: 'http://www.w3.org/1999/xhtml', ownerDocument: doc,
      addEventListener() {}, removeEventListener() {}, textContent: '',
    };
    const root = createRoot(container as unknown as Element);
    async function render(mode: 'visible' | 'hidden' = 'visible', nextPathname = browser.location.pathname) {
      browser.location.pathname = nextPathname;
      let tree: React.ReactElement = createElement(AppRouterContext.Provider, { value: router },
        createElement(PathnameContext.Provider, { value: nextPathname },
          jsx(React.Activity, { mode, children: createElement(ControllerHost) } satisfies React.ActivityProps)));
      if (strict) tree = createElement(React.StrictMode, null, tree);
      await React.act(async () => { root.render(tree); });
    }
    async function unmount() {
      if (!unmounted) {
        await React.act(async () => { root.unmount(); });
        unmounted = true;
      }
    }
    async function settle(action: () => void) { await React.act(async () => { action(); }); }
    async function restore() {
      try { await unmount(); }
      finally {
        for (const spy of [stateMock, authCheck, me, fetchMock, warn, error]) spy.mock.restore();
        for (const [key, descriptor] of descriptors) {
          if (descriptor) Object.defineProperty(globalThis, key, descriptor);
          else Reflect.deleteProperty(globalThis, key);
        }
      }
    }
    try { await render(); } catch (cause) { await restore(); throw cause; }
    return {
      calls, writes, requests, localRequests, warn, error, render, unmount, settle, restore,
      setSearch(search: string) { browser.location.search = search; },
      get session() { return observed.session; }, get loadingAuth() { return observed.loadingAuth; },
      get view() { return snapshots.at(-1); }, get activations() { return activations; },
      assertRetained() { assert.equal(new Set(instances).size, 1); },
    };
  }

  it('oculta o conteúdo protegido ao reativar até a sessão ser revalidada', async () => {
    const shell = await mountShell();
    try {
      await shell.settle(() => shell.requests[0].resolve(railsSession('Administrador')));
      assert.equal(shell.view?.content, true);
      await shell.render('hidden');
      await shell.render('visible');
      assert.equal(shell.view?.loading, true);
      assert.equal(shell.view?.content, false);
      await shell.settle(() => shell.requests[1].resolve(railsSession('Administrador')));
      assert.equal(shell.view?.loading, false);
      assert.equal(shell.view?.content, true);
      shell.assertRetained();
    } finally { await shell.restore(); }
  });

  for (const exit of ['unmount', 'hidden'] as const) {
    it(`ignora resposta Rails após ${exit}, inclusive as escritas do finally`, async () => {
      const shell = await mountShell();
      try {
        if (exit === 'unmount') await shell.unmount();
        else await shell.render('hidden');
        const writes = shell.writes.length;
        await shell.settle(() => shell.requests[0].resolve(railsSession('Administrador')));
        assert.equal(shell.writes.length, writes);
        assert.equal(shell.session?.apiUser, undefined);
        assert.equal(shell.session?.isGestor, false);
        assert.equal(shell.loadingAuth, true);
        assert.deepEqual(shell.calls, []);
      } finally { await shell.restore(); }
    });

    it(`sessão local ausente após ${exit} não solicita login nem encerra loading`, async () => {
      const shell = await mountShell({ source: 'local' });
      try {
        if (exit === 'unmount') await shell.unmount();
        else await shell.render('hidden');
        const writes = shell.writes.length;
        await shell.settle(() => shell.localRequests[0].resolve(new Response('{}', { status: 401 })));
        assert.equal(shell.writes.length, writes);
        assert.equal(shell.loadingAuth, true);
        assert.deepEqual(shell.calls, []);
      } finally { await shell.restore(); }
    });
  }

  for (const [recent, old] of [['Administrador', 'Editor de Notícias'], ['Editor de Notícias', 'Administrador']]) {
    it(`preserva ${recent} recente contra ${old} antigo após reativação`, async () => {
      const shell = await mountShell({ section: 'usuarios' });
      try {
        await shell.render('hidden');
        await shell.render();
        shell.assertRetained();
        assert.equal(shell.activations, 2);
        assert.equal(shell.requests.length, 2);
        await shell.settle(() => shell.requests[1].resolve(railsSession(recent)));
        assert.equal(shell.session?.apiUser?.perfil_nome, recent);
        assert.equal(shell.view?.content, recent === 'Administrador');
        assert.equal(shell.view?.restricted, recent !== 'Administrador');
        const writes = shell.writes.length;
        await shell.settle(() => shell.requests[0].resolve(railsSession(old)));
        assert.equal(shell.session?.apiUser?.perfil_nome, recent);
        assert.equal(shell.writes.length, writes);
        assert.equal(shell.loadingAuth, false);
        assert.equal(shell.view?.content, recent === 'Administrador');
        assert.equal(shell.view?.restricted, recent !== 'Administrador');
        assert.deepEqual(shell.calls, []);
      } finally { await shell.restore(); }
    });
  }

  it('sessão antiga ausente não solicita login depois de uma sessão local recente válida', async () => {
    const shell = await mountShell({ source: 'local' });
    try {
      await shell.render('hidden');
      await shell.render();
      await shell.settle(() => shell.localRequests[1].resolve(localSession('Gestor Geral', true)));
      const writes = shell.writes.length;
      await shell.settle(() => shell.localRequests[0].resolve(new Response('{}', { status: 401 })));
      assert.equal(shell.writes.length, writes);
      assert.equal(shell.session?.profileType, 'Gestor Geral');
      assert.equal(shell.view?.content, true);
      assert.equal(shell.loadingAuth, false);
      assert.deepEqual(shell.calls, []);
    } finally { await shell.restore(); }
  });

  for (const exit of ['unmount', 'reactivation'] as const) {
    it(`erro Rails antigo após ${exit} não inicia fallback nem modifica loading`, async () => {
      const shell = await mountShell();
      try {
        if (exit === 'unmount') await shell.unmount();
        else { await shell.render('hidden'); await shell.render(); }
        const writes = shell.writes.length;
        await shell.settle(() => shell.requests[0].reject(new Error('Erro Rails antigo')));
        assert.equal(shell.localRequests.length, 0);
        assert.equal(shell.writes.length, writes);
        assert.equal(shell.loadingAuth, true);
        assert.equal(shell.warn.mock.callCount(), 0);
        assert.equal(shell.error.mock.callCount(), 0);
        assert.deepEqual(shell.calls, []);
        if (exit === 'reactivation') {
          await shell.settle(() => shell.requests[1].resolve(railsSession('Administrador')));
          assert.equal(shell.view?.content, true);
          assert.equal(shell.loadingAuth, false);
        }
      } finally { await shell.restore(); }
    });
  }

  it('resposta local após desmontagem não inicia parsing', async () => {
    const shell = await mountShell({ source: 'local' });
    const response = localSession('Administrador', true);
    const parse = mock.method(response, 'json', async () => ({ isGestor: true, profileType: 'Administrador' }));
    try {
      await shell.unmount();
      const writes = shell.writes.length;
      await shell.settle(() => shell.localRequests[0].resolve(response));
      assert.equal(parse.mock.callCount(), 0);
      assert.equal(shell.writes.length, writes);
      assert.deepEqual(shell.calls, []);
    } finally { parse.mock.restore(); await shell.restore(); }
  });

  for (const outcome of ['resolve', 'reject'] as const) {
    it(`parsing local antigo (${outcome}) não interfere na sessão reativada`, async () => {
      const shell = await mountShell({ source: 'local' });
      const json = deferred<{ isGestor: boolean; profileType: string }>();
      const response = localSession('Editor de Notícias');
      const parse = mock.method(response, 'json', () => json.promise);
      try {
        await shell.settle(() => shell.localRequests[0].resolve(response));
        assert.equal(parse.mock.callCount(), 1);
        await shell.render('hidden');
        await shell.render();
        await shell.settle(() => shell.localRequests[1].resolve(localSession('Gestor Geral', true)));
        const writes = shell.writes.length;
        await shell.settle(() => {
          if (outcome === 'resolve') json.resolve({ isGestor: false, profileType: 'Editor de Notícias' });
          else json.reject(new Error('Parsing antigo falhou'));
        });
        assert.equal(shell.session?.profileType, 'Gestor Geral');
        assert.equal(shell.view?.content, true);
        assert.equal(shell.loadingAuth, false);
        assert.equal(shell.writes.length, writes);
        assert.equal(shell.error.mock.callCount(), 0);
        assert.deepEqual(shell.calls, []);
      } finally { parse.mock.restore(); await shell.restore(); }
    });
  }

  it('erro de fetch antigo não encerra loading nem solicita login enquanto a sessão recente aguarda', async () => {
    const shell = await mountShell({ source: 'local' });
    try {
      await shell.render('hidden');
      await shell.render();
      const writes = shell.writes.length;
      await shell.settle(() => shell.localRequests[0].reject(new Error('Rede antiga falhou')));
      assert.equal(shell.loadingAuth, true);
      assert.equal(shell.writes.length, writes);
      assert.equal(shell.error.mock.callCount(), 0);
      assert.deepEqual(shell.calls, []);
      await shell.settle(() => shell.localRequests[1].resolve(localSession('Gestor Geral', true)));
      assert.equal(shell.loadingAuth, false);
      assert.equal(shell.view?.content, true);
    } finally { await shell.restore(); }
  });

  for (const order of ['old-first', 'new-first'] as const) {
    it(`Strict Mode mantém somente a segunda execução válida (${order})`, async () => {
      const shell = await mountShell({ strict: true });
      try {
        assert.equal(shell.activations, 2);
        assert.equal(shell.requests.length, 2);
        shell.assertRetained();
        if (order === 'new-first') await shell.settle(() => shell.requests[1].resolve(railsSession('Editor de Notícias')));
        const writes = shell.writes.length;
        await shell.settle(() => shell.requests[0].resolve(railsSession('Administrador')));
        assert.equal(shell.writes.length, writes);
        if (order === 'old-first') {
          assert.equal(shell.loadingAuth, true);
          await shell.settle(() => shell.requests[1].resolve(railsSession('Editor de Notícias')));
        }
        assert.equal(shell.session?.apiUser?.perfil_nome, 'Editor de Notícias');
        assert.equal(shell.view?.restricted, true);
        assert.equal(shell.view?.content, false);
        assert.equal(shell.loadingAuth, false);
        assert.deepEqual(shell.calls, []);
      } finally { await shell.restore(); }
    });
  }

  it('mudança de pathname invalida o login da rota anterior', async () => {
    const shell = await mountShell({ source: 'local' });
    try {
      await shell.render('visible', '/admin/avisos');
      assert.equal(shell.localRequests.length, 2);
      await shell.settle(() => shell.localRequests[1].resolve(localSession('Gestor Geral', true)));
      const writes = shell.writes.length;
      await shell.settle(() => shell.localRequests[0].resolve(new Response('{}', { status: 401 })));
      assert.equal(shell.writes.length, writes);
      assert.equal(shell.view?.content, true);
      assert.deepEqual(shell.calls, []);
    } finally { await shell.restore(); }
  });

  for (const [source, profile, section, allowed] of [
    ['Rails', 'Administrador', 'redes', true],
    ['Rails', 'Administrador', 'usuarios', true],
    ['Rails', 'Editor de Notícias', 'noticias', true],
    ['Rails', 'Editor de Notícias', 'redes', false],
    ['Rails', 'Curador de Fotos', 'fotos', true],
    ['Rails', 'Curador de Fotos', 'galeria', true],
    ['Rails', 'Publicador de Avisos', 'avisos', true],
    ['Rails', 'Publicador de Avisos', 'noticias', true],
    ['Rails', 'Operador de Conteúdo', 'avisos', true],
    ['Rails', 'Gestor', 'redes', false],
    ['local', 'Curador de Fotos', 'galeria', true],
    ['local', 'Administrador', 'usuarios', false],
  ] as const) {
    it(`B3.3: destino mantém autorização ${source}, ${profile}, ${section}`, async () => {
      const shell = await mountShell({
        source, section, pathname: `/admin/${section}`,
        // Notícias usa conteúdo por função na rota canônica; as operações
        // continuam dependentes das permissões do módulo, não deste marcador.
        children: section === 'noticias' ? () => 'B2: conteúdo protegido' : 'B2: conteúdo protegido',
      });
      try {
        assert.equal(shell.view?.loading, true);
        await shell.settle(() => {
          if (source === 'Rails') shell.requests[0].resolve(railsSession(profile));
          else shell.localRequests[0].resolve(localSession(profile, profile === 'Administrador'));
        });
        assert.equal(shell.view?.content, allowed);
        assert.equal(shell.view?.restricted, !allowed);
        assert.equal(shell.view?.loading, false);
        assert.deepEqual(shell.calls, []);
        if (source === 'local') assert.equal(shell.session?.apiUser, undefined);
        if (profile === 'Gestor') assert.equal(shell.session?.isGestor, false);
      } finally { await shell.restore(); }
    });
  }

  it('12D-5 Lote 1: Shell preserva classificação Rails, apiUser e autorização da seção', async () => {
    for (const [label, fields, expected] of railsGestorCases) {
      const shell = await mountShell({ section: 'redes' });
      const reply = railsClassificationReply(fields);
      try {
        await shell.settle(() => shell.requests[0].resolve(reply));
        assert.equal(shell.session?.isGestor, expected, label);
        assert.equal(shell.session?.apiUser, reply.data, label);
        assert.equal(shell.session?.profileType, fields.perfil_nome, label);
        assert.equal(shell.loadingAuth, false, label);
        assert.equal(shell.view?.content, expected, label);
        assert.equal(shell.view?.restricted, !expected, label);
        assert.equal(shell.localRequests.length, 0, label);
        assert.deepEqual(shell.calls, [], label);
      } finally { await shell.restore(); }
    }
  });

  it('12D-5 Lote 1: Shell mantém fallback quando data Rails é nulo ou ausente', async () => {
    for (const reply of [{ success: true, data: null }, { success: true }]) {
      const shell = await mountShell();
      try {
        await shell.settle(() => shell.requests[0].resolve(JSON.parse(JSON.stringify(reply))));
        assert.equal(shell.localRequests.length, 1);
        assert.equal(shell.session?.isGestor, false);
        assert.equal(shell.loadingAuth, true);
        assert.deepEqual(shell.calls, []);
        await shell.settle(() => shell.localRequests[0].resolve(new Response('{}', { status: 401 })));
        assert.deepEqual(shell.calls, [{ method: 'push', href: '/admin/login?redirect=%2Fadmin%2Fredes' }]);
      } finally { await shell.restore(); }
    }
  });

  it('12D-5 Lote 2: Shell mantém campos Rails, role e apiUser original', async () => {
    for (const { label, data, expected } of railsSessionFieldCases) {
      const shell = await mountShell({ section: 'redes' });
      const reply: RailsReply = JSON.parse(JSON.stringify({ success: true, message: 'Sessão sintética', data }));
      Object.freeze(reply.data);
      const before = structuredClone(reply.data);
      try {
        await shell.settle(() => shell.requests[0].resolve(reply));
        assert.deepEqual(shell.session, { ...expected, role: expected.profileType, apiUser: reply.data }, label);
        assert.equal(shell.session?.apiUser, reply.data, label);
        assert.deepEqual(reply.data, before, label);
        assert.equal(shell.loadingAuth, false, label);
        assert.equal(shell.view?.content, expected.isGestor, label);
        assert.equal(shell.view?.restricted, !expected.isGestor, label);
        assert.equal(shell.localRequests.length, 0, label);
        assert.deepEqual(shell.calls, [], label);
      } finally { await shell.restore(); }
    }
  });

  it('12D-5 Lote 2: Shell mantém role local sem promover apiUser/editorialProfile', async () => {
    for (const source of ['Rails', 'local']) for (const { label, data, expected, role } of localSessionFieldCases) {
      const shell = await mountShell({ source, section: 'redes' });
      const response = new Response(JSON.stringify(data), { status: 200 });
      const input = Object.freeze(structuredClone(data));
      const parse = mock.method(response, 'json', async () => input);
      try {
        if (source === 'Rails') await shell.settle(() => shell.requests[0].reject(new Error('Falha Rails simulada')));
        await shell.settle(() => shell.localRequests[0].resolve(response));
        assert.deepEqual(shell.session, { ...expected, role }, `${source}: ${label}`);
        assert.deepEqual(input, data, label);
        assert.equal(shell.session?.apiUser, undefined, label);
        assert.equal(shell.loadingAuth, false, label);
        assert.equal(shell.view?.content, expected.isGestor, label);
        assert.equal(shell.view?.restricted, !expected.isGestor, label);
        assert.equal(shell.warn.mock.callCount(), source === 'Rails' ? 1 : 0);
        assert.deepEqual(shell.calls, [], label);
      } finally { parse.mock.restore(); await shell.restore(); }
    }
  });

  it('12D-5 Lote 2: Shell não aceita body local nulo nem JSON inválido', async () => {
    for (const body of ['null', '{']) {
      const shell = await mountShell({ source: 'local' });
      try {
        await shell.settle(() => shell.localRequests[0].resolve(new Response(body, { status: 200 })));
        assert.deepEqual(shell.session, { isGestor: false });
        assert.equal(shell.loadingAuth, false);
        assert.equal(shell.view?.loading, true);
        assert.equal(shell.error.mock.callCount(), 1);
        assert.deepEqual(shell.calls, [{ method: 'push', href: '/admin/login' }]);
      } finally { await shell.restore(); }
    }
  });

  it('preserva fallback vigente e sessão local sem apiUser e sem redirect editorial', async () => {
    const shell = await mountShell({ section: 'noticias' });
    try {
      await shell.settle(() => shell.requests[0].reject(new Error('Token recusado simulado')));
      assert.equal(shell.localRequests.length, 1);
      assert.equal(shell.warn.mock.callCount(), 1);
      await shell.settle(() => shell.localRequests[0].resolve(localSession('Editor de Notícias')));
      assert.equal(shell.session?.profileType, 'Editor de Notícias');
      assert.equal(shell.session?.apiUser, undefined);
      assert.equal(shell.loadingAuth, false);
      assert.equal(shell.view?.content, true);
      assert.deepEqual(shell.calls, []);
    } finally { await shell.restore(); }
  });

  it('12D-5 Lote 4 regressão: Shell preserva query antes perdida', async () => {
    const shell = await mountShell({ source: 'local', pathname: '/admin/noticias', search: '?action=new' });
    try {
      await shell.settle(() => shell.localRequests[0].resolve(new Response('{}', { status: 401 })));
      assert.deepEqual(shell.calls, [{ method: 'push', href: '/admin/login?redirect=%2Fadmin%2Fnoticias%3Faction%3Dnew' }]);
    } finally { await shell.restore(); }
  });

  for (const [pathname, search, expected] of [
    ['/admin/noticias', '?action=new', '/admin/noticias?action=new'],
    ['/admin', '?tab=faq&section=avisos', '/admin?tab=faq&section=avisos'],
    ['/admin/noticias', '?mode=editor&edit=42', '/admin/noticias?mode=editor&edit=42'],
    ['/admin', '?tab=faq&redirect=x&tab=avisos', '/admin?tab=faq&tab=avisos'],
    ['/admin', '?q=a%20b&x=%2f&q=a+b&flag', '/admin?q=a%20b&x=%2f&q=a+b&flag'],
  ]) {
    it(`12D-5 Lote 4 segurança: Shell transporta query ${search}`, async () => {
      const shell = await mountShell({ source: 'local', pathname, search });
      try {
        await shell.settle(() => shell.localRequests[0].resolve(new Response('{}', { status: 401 })));
        const href = '/admin/login?redirect=' + encodeURIComponent(expected);
        assert.deepEqual(shell.calls, [{ method: 'push', href }]);
        await simulateAdminReturnLogin(href.split('?')[1], expected);
      } finally { await shell.restore(); }
    });
  }

  it('12D-5 Lote 4 segurança: Shell usa query vigente sem novo efeito', async () => {
    const shell = await mountShell({ source: 'local', pathname: '/admin/noticias', search: '?mode=lista' });
    try {
      shell.setSearch('?action=new');
      await shell.settle(() => shell.localRequests[0].resolve(new Response('{}', { status: 401 })));
      assert.deepEqual(shell.calls, [{ method: 'push', href: '/admin/login?redirect=%2Fadmin%2Fnoticias%3Faction%3Dnew' }]);
      assert.equal(shell.localRequests.length, 1);
    } finally { await shell.restore(); }
  });

  for (const replay of ['Activity', 'Strict Mode']) {
    it(`12D-5 Lote 4 segurança: query preservada mantém B2 após ${replay}`, async () => {
      const shell = await mountShell({ source: 'local', pathname: '/admin/noticias', search: '?mode=lista', strict: replay === 'Strict Mode' });
      try {
        if (replay === 'Activity') { await shell.render('hidden'); await shell.render('visible'); }
        assert.equal(shell.localRequests.length, 2);
        shell.setSearch('?action=new');
        await shell.settle(() => shell.localRequests[0].resolve(new Response('{}', { status: 401 })));
        assert.deepEqual(shell.calls, []);
        await shell.settle(() => shell.localRequests[1].resolve(new Response('{}', { status: 401 })));
        assert.deepEqual(shell.calls, [{ method: 'push', href: '/admin/login?redirect=%2Fadmin%2Fnoticias%3Faction%3Dnew' }]);
        shell.assertRetained();
      } finally { await shell.restore(); }
    });
  }

  it('12D-5 Lote 4 segurança: retorno aceito não autoriza o módulo de destino', async () => {
    const target = adminAuthNavigation.getSafeAdminReturnTarget('/admin/redes');
    await simulateAdminReturnLogin('redirect=' + encodeURIComponent(target), target);
    const shell = await mountShell({ source: 'Rails', pathname: target, section: 'redes' });
    try {
      await shell.settle(() => shell.requests[0].resolve(railsSession('Editor de Notícias')));
      assert.equal(shell.session?.isGestor, false);
      assert.equal(shell.view?.restricted, true);
      assert.equal(shell.view?.content, false);
      assert.deepEqual(shell.calls, []);
    } finally { await shell.restore(); }
  });

  it('preserva redirect do pathname vigente quando não há sessão', async () => {
    const shell = await mountShell({ source: 'local', pathname: '/admin/usuarios' });
    try {
      await shell.settle(() => shell.localRequests[0].resolve(new Response('{}', { status: 401 })));
      assert.equal(shell.loadingAuth, false);
      assert.equal(shell.view?.loading, true);
      assert.deepEqual(shell.calls, [{ method: 'push', href: '/admin/login?redirect=%2Fadmin%2Fusuarios' }]);
    } finally { await shell.restore(); }
  });

  it('preserva login genérico e finally quando o erro é vigente', async () => {
    const shell = await mountShell({ source: 'local' });
    try {
      await shell.settle(() => shell.localRequests[0].reject(new Error('Erro vigente')));
      assert.equal(shell.error.mock.callCount(), 1);
      assert.equal(shell.loadingAuth, false);
      assert.equal(shell.view?.loading, true);
      assert.deepEqual(shell.calls, [{ method: 'push', href: '/admin/login' }]);
    } finally { await shell.restore(); }
  });

  for (const [profile, allowed] of [['Administrador', true], ['Gestor', true], ['Jornalista', false], ['Operador de Conteúdo', false], ['Editor de Notícias', false]] as const) {
    it('as três subrotas de projetos seguem os perfis com permissão: ' + profile, async () => {
      for (const section of ['projetos', 'projetosTemas', 'projetosMembros'] as const) {
        let renders = 0;
        const shell = await mountShell({ section, pathname: SHARED_SECTION_CONFIG[section].href, children: () => { renders++; return 'B2: conteúdo protegido'; } });
        try {
          assert.equal(renders, 0, 'Nada é montado antes da sessão');
          await shell.settle(() => shell.requests[0].resolve(railsSession(profile)));
          assert.equal(shell.view?.content, allowed, section);
          assert.equal(shell.view?.restricted, !allowed, section);
          assert.equal(renders > 0, allowed, section);
        } finally { await shell.restore(); }
      }
    });
  }

  for (const [profile, allowed] of [['Gestor', true], ['Jornalista', false]] as const) {
    it('dúvidas de visitantes seguem os perfis do seed Rails: ' + profile, async () => {
      const shell = await mountShell({ section: 'duvidas', pathname: '/admin/faq' });
      try {
        await shell.settle(() => shell.requests[0].resolve(railsSession(profile)));
        assert.equal(shell.view?.content, allowed);
        assert.equal(shell.view?.restricted, !allowed);
      } finally { await shell.restore(); }
    });
  }

  for (const [profile, allowed] of [
    ['Administrador', true], ['Operador de Conteúdo', false], ['Editor de Notícias', false],
    ['Curador de Fotos', false], ['Publicador de Avisos', false],
  ] as const) {
    it('protege as subrotas de professores e alunos na página para ' + profile, async () => {
      for (const section of ['professores', 'professoresDisciplinas', 'professoresRelatos', 'alunos', 'alunosCategorias'] as const) {
        let renders = 0;
        const shell = await mountShell({ section, pathname: SHARED_SECTION_CONFIG[section].href, children: () => {
          renders++; return 'B2: conteúdo protegido';
        } });
        try {
          await shell.settle(() => shell.requests[0].resolve(railsSession(profile)));
          const expected = profile !== 'Curador de Fotos' && profile !== 'Publicador de Avisos';
          assert.equal(shell.view?.content, expected, section);
          assert.equal(shell.view?.restricted, !expected, section);
          assert.equal(renders > 0, expected, section);
        } finally { await shell.restore(); }
      }
    });

    it('C1 aplica a guarda do FAQ para ' + profile, async () => {
      let renders = 0;
      const shell = await mountShell({ section: 'duvidas', pathname: '/admin/faq', children: () => {
        renders++; return 'B2: conteúdo protegido';
      } });
      try {
        assert.equal(renders, 0);
        await shell.settle(() => shell.requests[0].resolve(railsSession(profile)));
        assert.equal(shell.view?.content, allowed);
        assert.equal(shell.view?.restricted, !allowed);
        assert.equal(renders > 0, allowed);
      } finally { await shell.restore(); }
    });
  }

  for (const section of ['usuarios', 'kanban'] as const) {
    it(`preserva a autorização de ${section} com sessões Rails e locais vigentes`, async () => {
      const cases = [
        { source: 'Rails', profile: 'Administrador', overrides: {}, allowed: true },
        { source: 'Rails', profile: 'Administrador', overrides: { ativo: false }, allowed: section === 'kanban' },
        { source: 'Rails', profile: 'Editor de Notícias', overrides: {}, allowed: false },
        { source: 'Rails', profile: 'Editor de Notícias', overrides: { id: 1 }, allowed: false },
        { source: 'Rails', profile: 'Operador de Conteúdo', overrides: { perfil_id: 3 }, allowed: false },
        { source: 'Rails', profile: 'Gestor', overrides: {}, allowed: false },
        { source: 'local', profile: 'Administrador', overrides: {}, allowed: false },
        { source: 'local', profile: 'Gestor Geral', overrides: {}, allowed: false },
      ];
      for (const item of cases) {
        const shell = await mountShell({ source: item.source, section });
        try {
          await shell.settle(() => {
            if (item.source === 'Rails') shell.requests[0].resolve(railsSession(item.profile, item.overrides));
            else shell.localRequests[0].resolve(localSession(item.profile, true));
          });
          assert.equal(shell.view?.content, item.allowed, `${item.source}: ${item.profile}`);
          assert.equal(shell.view?.restricted, !item.allowed);
          assert.deepEqual(shell.calls, []);
        } finally { await shell.restore(); }
      }
    });
  }
});


describe('Avisos públicos Lote B — apresentação e limites', () => {
  function inspectView(announcements: AvisoPublico[], selected: AvisoPublico | null = null, error: string | null = null) {
    const replacement = <S,>(initial?: S | (() => S)): [S, React.Dispatch<React.SetStateAction<S>>] => {
      const value = typeof initial === 'function' ? (initial as () => S)() : initial;
      return [(initial === null ? selected : value) as S, () => {}];
    };
    const state = mock.method(React, 'useState', replacement as typeof React.useState);
    const refs = mock.method(React, 'useRef', ((value: unknown) => ({ current: value })) as typeof React.useRef);
    const effects = mock.method(React, 'useEffect', () => {});
    const ids = mock.method(React, 'useId', () => 'aviso-busca-teste');
    try { return AvisosView({ announcements, error }); }
    finally { state.mock.restore(); refs.mock.restore(); effects.mock.restore(); ids.mock.restore(); }
  }
  it('chaves não dependem de id, posição ou ordem de propriedades; duplicatas são distintas', () => {
    const a = { ...publicAvisoFixture };
    const b = { ...publicAvisoFixture, titulo: 'Outro comunicado' };
    const cards = (items: AvisoPublico[]) => noticeNodes(inspectView(items)).filter(node => node.type === 'article');
    const original = cards([a, b]);
    const reordered = cards([b, { created_at: a.created_at, tipo_cor: a.tipo_cor, tipo_slug: a.tipo_slug,
      tipo_nome: a.tipo_nome, link_url: a.link_url, link_texto: a.link_texto, conteudo: a.conteudo, titulo: a.titulo }]);
    assert.equal(original[0].key, reordered[1].key);assert.equal(original[1].key, reordered[0].key);
    const duplicates = cards([a, a, b]);assert.equal(new Set(duplicates.map(node => node.key)).size, 3);
    const before = JSON.stringify([a, b]);inspectView([Object.freeze(a), Object.freeze(b)]);
    assert.equal(JSON.stringify([a, b]), before);assert.ok(!Object.hasOwn(a, 'id'));
  });
  for (const links of [null, 'https://example.com/orientacoes', 'javascript:alert(1)']) {
    it('modal respeita campos nulos e link permitido: ' + links, () => {
      const item = { ...publicAvisoFixture, link_texto: links ? 'Consultar orientação' : null, link_url: links };
      const html = renderToStaticMarkup(inspectView([item], item));
      assert.match(html, /role="dialog"/);assert.match(html, /Comunicado recebido da API/);
      assert.doesNotMatch(html, /undefined|Invalid Date|javascript:/);
      assert.equal(html.includes('href="https://example.com/orientacoes"'), links?.startsWith('https:') || false);
    });
  }
  it('tipos oficiais adicionais e data inválida não criam campos de CMS', () => {
    const html = renderToStaticMarkup(inspectView([{ ...publicAvisoFixture, tipo_slug: 'plantao', tipo_nome: 'Plantão oficial', created_at: 'data-invalida' }]));
    assert.match(html, /Plantão oficial/);assert.match(html, /tipo=plantao/);assert.match(html, /Data não informada/);
    assert.doesNotMatch(html, /Invalid Date/);
  });
  for (const name of ['avisos', 'ao-vivo']) {
    it(name + ': tentar novamente recarrega a consulta preservando a URL atual', () => {
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
      const href = 'https://medtec.invalid/' + name + '?tipo=urgente&page=2&per_page=5';
      let reloads = 0;
      const location = { href, reload() { reloads++; } };
      Object.defineProperty(globalThis, 'window', { configurable: true, value: { location } });
      try {
        const tree = name === 'avisos'
          ? inspectView([], null, 'Falha HTTP 503')
          : LiveBroadcastSection({ announcementsError: 'Falha HTTP 503' });
        const retry = noticeNodes(tree).find(node => node.props.children === 'Tentar novamente');
        assert.ok(retry);
        assert.equal(retry.type, 'button');
        assert.equal(retry.props.type, 'button');
        assert.equal(typeof retry.props.onClick, 'function');
        Reflect.apply(retry.props.onClick as () => void, undefined, []);
        assert.equal(reloads, 1);
        assert.equal(location.href, href);
      } finally {
        if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
        else Reflect.deleteProperty(globalThis, 'window');
      }
    });
  }
  for (const [query, page, perPage, tipo] of [
    [{ page: '-2', per_page: '0' }, '1', '10', null],
    [{ page: '2abc', per_page: '999999' }, '1', '100', null],
    [{ page: ['3', '7'], per_page: ['5', '50'], tipo: ['urgente', 'aviso'] }, '3', '5', 'urgente'],
  ] as const) {
    it('URL normaliza limites e usa primeiro valor: ' + JSON.stringify(query), async () => {
      const calls: URL[] = [];
      const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
        calls.push(new URL(String(input)));return publicAvisosReply([]);
      });
      try {
        await resolvePublicNoticePage(PublicAvisosPage, query as Record<string, string | string[]>);
        assert.equal(calls[0].searchParams.get('page'), page);assert.equal(calls[0].searchParams.get('per_page'), perPage);
        assert.equal(calls[0].searchParams.get('tipo'), tipo);
      } finally { fetchMock.mock.restore(); }
    });
  }
  it('/ao-vivo não converte falha na consulta urgente em nova consulta ou vazio', async () => {
    let notices = 0;
    const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
      if (String(input).includes('/canais_contato')) return publicAvisosReply([]);
      notices++;return new Response('{}', { status: 503, headers: { 'Content-Type': 'application/json' } });
    });
    try {
      const view = await resolvePublicNoticePage(PublicAoVivoPage);assert.equal(notices, 1);
      const html = renderToStaticMarkup(view);assert.match(html, /role="alert"/);assert.match(html, /HTTP 503/);
      assert.doesNotMatch(html, /Nenhum comunicado no momento/);
    } finally { fetchMock.mock.restore(); }
  });
});


// Novas rotas — Lote B: dados sintéticos, rede sempre interceptada.
const publicAvisoFixture: AvisoPublico = {
  titulo: 'Comunicado recebido da API', conteudo: 'Conteúdo oficial recebido.',
  link_texto: null, link_url: null, tipo_nome: 'Urgente', tipo_slug: 'urgente',
  tipo_cor: '#DC2626', created_at: '2026-10-30T10:00:00-03:00',
};
function publicAvisosReply(items = [publicAvisoFixture], pagination = {
  current_page: 1, total_pages: 1, total_count: items.length, per_page: 10,
}) {
  return new Response(JSON.stringify({ success: true, message: 'Resultado sintético', data: { items, pagination } }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
type NoticeNodeProps = Record<string, unknown> & { children?: ReactNode };
function noticeNodes(node: ReactNode): React.ReactElement<NoticeNodeProps>[] {
  if (Array.isArray(node)) return node.flatMap(noticeNodes);
  if (!isValidElement<NoticeNodeProps>(node)) return [];
  return [node, ...noticeNodes(node.props.children)];
}
// Resolve apenas os Server Components assíncronos destas páginas, sem montar
// cabeçalho, rodapé, efeitos do navegador ou autenticação.
async function resolvePublicNoticePage(page: typeof PublicAvisosPage | typeof PublicAoVivoPage,
  query: Record<string, string | string[]> = {}) {
  const tree: ReactNode = await Reflect.apply(page, undefined, [{ searchParams: Promise.resolve(query) }]);
  async function find(node: ReactNode): Promise<React.ReactElement<NoticeNodeProps> | null> {
    for (const element of noticeNodes(node)) {
      if (element.type === AvisosView || element.type === LiveBroadcastSection) return element;
      if (typeof element.type === 'function' && element.type.constructor.name === 'AsyncFunction') {
        const result = await find(await Reflect.apply(element.type, undefined, [element.props]));
        if (result) return result;
      }
    }
    return null;
  }
  const view = await find(tree);
  assert.ok(view);
  return view;
}

describe('Avisos públicos Lote B — caracterização', () => {
  for (const [name, page] of [['avisos', PublicAvisosPage], ['ao-vivo', PublicAoVivoPage]] as const) {
    it('regressão: ' + name + ' consulta avisos públicos sem Bearer', async () => {
      const requests: { path: string; authorization: boolean; params: URLSearchParams }[] = [];
      setStoredTokens({ access_token: 'synthetic-only', refresh_token: 'synthetic-only' });
      const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
        const url = new URL(String(input));
        requests.push({ path: url.pathname, authorization: new Headers(options?.headers).has('Authorization'), params: url.searchParams });
        return publicAvisosReply();
      });
      try {
        await resolvePublicNoticePage(page);
        const request = requests.find(request => request.path.endsWith('/a_avisos'));
        assert.ok(request);
        assert.equal(request.path.endsWith('/publico/a_avisos'), true);
        assert.equal(request.authorization, false);
        assert.equal(request.params.get('page'), '1');
      } finally { fetchMock.mock.restore(); clearStoredTokens(); }
    });
    it('regressão: ' + name + ' informa HTTP 503 sem falso vazio', async () => {
      const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('{}', {
        status: 503, headers: { 'Content-Type': 'application/json' },
      }));
      const warn = mock.method(console, 'warn', () => {});
      try {
        const view = await resolvePublicNoticePage(page);
        assert.deepEqual(view.props.announcements, []);
        assert.equal(Boolean(view.props.error || view.props.announcementsError), true);
      } finally { fetchMock.mock.restore(); warn.mock.restore(); }
    });
  }
  for (const kind of ['avisos', 'tiposAviso'] as const) {
    for (const operation of ['list', 'get', 'create', 'update', 'delete'] as const) {
      it('CMS mantém ' + kind + '.' + operation + ' protegido', async () => {
        const endpoint = kind === 'avisos' ? '/a_avisos' : '/a_tipos_aviso';
        const root = kind === 'avisos' ? 'a_aviso' : 'a_tipo_aviso';
        const body = kind === 'avisos'
          ? { titulo: 'Sintético', conteudo: 'Conteúdo sintético', a_tipo_aviso_id: 7 }
          : { nome: 'Tipo sintético', slug: 'sintetico', cor: '#123456' };
        const requests: { url: URL; options?: RequestInit }[] = [];
        setStoredTokens({ access_token: 'synthetic-only', refresh_token: 'synthetic-only' });
        const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
          requests.push({ url: new URL(String(input)), options });
          if (operation === 'delete') return new Response(null, { status: 204 });
          return new Response(JSON.stringify(operation === 'list' ? {
            success: true, data: { items: [], pagination: { current_page: 1, total_pages: 0, total_count: 0, per_page: 10 } },
          } : { id: 7, ...body }), { status: operation === 'create' ? 201 : 200, headers: { 'Content-Type': 'application/json' } });
        });
        try {
          const service = medtecApi[kind];
          if (operation === 'list') await service.list({ page: 'all' });
          else if (operation === 'get' || operation === 'delete') await service[operation](7);
          else await Reflect.apply(service[operation], service, operation === 'create' ? [body] : [7, body]);
          assert.equal(requests.length, 1);
          const { url, options } = requests[0];
          assert.ok(url.pathname.endsWith(endpoint + (['get', 'update', 'delete'].includes(operation) ? '/7' : '')));
          assert.ok(!url.pathname.includes('/publico/'));
          assert.equal(options?.method, { list: 'GET', get: 'GET', create: 'POST', update: 'PATCH', delete: 'DELETE' }[operation]);
          assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer synthetic-only');
          if (operation === 'create' || operation === 'update') assert.deepEqual(JSON.parse(String(options?.body)), { [root]: body });
          else assert.equal(options?.body, undefined);
        } finally { fetchMock.mock.restore(); clearStoredTokens(); }
      });
    }
  }
});

describe('Avisos públicos Lote B — contrato e integração', () => {
  for (const params of [undefined, { tipo: 'urgente', page: 2, per_page: 5 }, { page: 'all' }] satisfies (PublicoAvisosParams | undefined)[]) {
    it('GET sem Bearer, parâmetros e DTO: ' + JSON.stringify(params), async () => {
      setStoredTokens({ access_token: 'synthetic-only', refresh_token: 'synthetic-only' });
      const calls: URL[] = [];
      const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
        calls.push(new URL(String(input)));
        assert.equal(options?.method, 'GET');assert.equal(options?.body, undefined);
        assert.equal(new Headers(options?.headers).get('Authorization'), null);
        return publicAvisosReply();
      });
      try {
        const response = await medtecApi.avisos.listPublico(params);
        assert.equal(calls.length, 1);assert.ok(calls[0].pathname.endsWith('/publico/a_avisos'));
        for (const [key, value] of Object.entries(params || {})) assert.equal(calls[0].searchParams.get(key), String(value));
        assert.deepEqual(response.data.items, [publicAvisoFixture]);
        assert.deepEqual(response.data.pagination, { current_page: 1, total_pages: 1, total_count: 1, per_page: 10 });
        for (const key of ['id', 'ativo', 'a_tipo_aviso_id', 'a_tipo_aviso']) assert.ok(!Object.hasOwn(response.data.items[0], key));
      } finally { fetchMock.mock.restore(); clearStoredTokens(); }
    });
  }
  it('vazio oficial preserva sucesso e metadados', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => publicAvisosReply([], { current_page: 1, total_pages: 0, total_count: 0, per_page: 10 }));
    try { const result = await medtecApi.avisos.listPublico();assert.deepEqual(result.data.items, []);assert.equal(result.data.pagination.total_count, 0); }
    finally { fetchMock.mock.restore(); }
  });
  for (const status of [401, 403, 404, 422, 429, 500]) {
    it('HTTP ' + status + ' público não faz refresh, retry ou logout', async () => {
      setStoredTokens({ access_token: 'synthetic-only', refresh_token: 'synthetic-only' });let calls = 0;
      const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
        calls++;assert.ok(String(input).includes('/publico/a_avisos'));
        assert.equal(new Headers(options?.headers).has('Authorization'), false);
        return new Response(JSON.stringify({ success: false, errors: [status === 401 ? 'token_expirado' : 'simulado'] }), { status, headers: { 'Content-Type': 'application/json' } });
      });
      try {
        await assert.rejects(medtecApi.avisos.listPublico(), error => error instanceof ApiError && error.status === status);
        assert.equal(calls, 1);assert.equal(getStoredAccessToken(), 'synthetic-only');assert.equal(getStoredRefreshToken(), 'synthetic-only');
      } finally { fetchMock.mock.restore(); clearStoredTokens(); }
    });
  }
  it('erro de rede é ApiError de conexão', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
    try { await assert.rejects(medtecApi.avisos.listPublico(), error => error instanceof ApiError && error.status === 0); }
    finally { fetchMock.mock.restore(); }
  });
  for (const payload of [null, {}, { success: false }, { success: true, data: { items: [] } },
    { success: true, data: { items: [publicAvisoFixture], pagination: { current_page: 1, total_pages: 1, total_count: 1, per_page: 0 } } },
    { success: true, data: { items: [{ titulo: 'Incompleto' }], pagination: { current_page: 1, total_pages: 1, total_count: 1, per_page: 10 } } }]) {
    it('resposta inválida não vira vazio: ' + JSON.stringify(payload), async () => {
      const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      try { await assert.rejects(medtecApi.avisos.listPublico(), /Resposta inválida/); }
      finally { fetchMock.mock.restore(); }
    });
  }
  for (const [name, page] of [['avisos', PublicAvisosPage], ['ao-vivo', PublicAoVivoPage]] as const) {
    it(name + ' declara carregamento antes da consulta', async () => {
      const fetchMock = mock.method(globalThis, 'fetch', async () => publicAvisosReply([]));
      let tree: ReactNode | Promise<ReactNode> = null;
      try {
        tree = Reflect.apply(page, undefined, [{ searchParams: Promise.resolve({}) }]);
        assert.ok(!(tree instanceof Promise));
        const boundary = noticeNodes(tree).find(node => node.type === React.Suspense);assert.ok(boundary);
        const html = renderToStaticMarkup(boundary.props.fallback as ReactNode);
        assert.match(html, /role="status"/);assert.match(html, /Carregando avisos/);
        assert.doesNotMatch(html, /Nenhum comunicado|Nenhum aviso encontrado/);
      } finally { await tree; fetchMock.mock.restore(); }
    });
    for (const outcome of ['success', 'empty', 'http', 'network'] as const) {
      it(name + ': ' + outcome + ' usa DTO ou mostra erro', async () => {
        const paths: string[] = [];
        const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
          const url = new URL(String(input));paths.push(url.pathname);
          if (url.pathname.endsWith('/canais_contato')) return publicAvisosReply([]);
          assert.ok(url.pathname.endsWith('/publico/a_avisos'));
          assert.equal(new Headers(options?.headers).has('Authorization'), false);
          if (outcome === 'network') throw new TypeError('Failed to fetch');
          if (outcome === 'http') return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } });
          return publicAvisosReply(outcome === 'empty' ? [] : [publicAvisoFixture]);
        });
        try {
          const view = await resolvePublicNoticePage(page);const html = renderToStaticMarkup(view);
          assert.ok(!paths.some(path => path.endsWith('/a_avisos') && !path.endsWith('/publico/a_avisos')));
          if (outcome === 'success') { assert.deepEqual(view.props.announcements, [publicAvisoFixture]);assert.match(html, /Comunicado recebido da API/);assert.doesNotMatch(html, /Invalid Date/); }
          else if (outcome === 'empty') { assert.match(html, /Nenhum aviso encontrado|Nenhum comunicado no momento/);assert.doesNotMatch(html, /role="alert"/); }
          else { assert.match(html, /role="alert"/);assert.doesNotMatch(html, /Nenhum aviso encontrado|Nenhum comunicado no momento/);assert.match(html, outcome === 'http' ? /HTTP 404/ : /conexão|conectar/i); }
        } finally { fetchMock.mock.restore(); }
      });
    }
  }
  it('/avisos transporta filtro e paginação da URL e conserva links', async () => {
    const calls: URL[] = [];
    const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
      calls.push(new URL(String(input)));return publicAvisosReply([publicAvisoFixture], { current_page: 2, total_pages: 4, total_count: 18, per_page: 5 });
    });
    try {
      const view = await resolvePublicNoticePage(PublicAvisosPage, { tipo: 'urgente', page: '2', per_page: '5' });
      assert.equal(calls.length, 1);
      for (const [key, value] of Object.entries({ tipo: 'urgente', page: '2', per_page: '5' })) assert.equal(calls[0].searchParams.get(key), value);
      const html = renderToStaticMarkup(view);assert.match(html, /Página 2 de 4/);
      const links = [...html.matchAll(/href="([^"]+)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&'), 'https://medtec.invalid'));
      for (const direction of ['1', '3']) assert.ok(links.some(link => link.searchParams.get('page') === direction && link.searchParams.get('tipo') === 'urgente' && link.searchParams.get('per_page') === '5'));
      assert.ok(links.some(link => link.searchParams.get('tipo') === 'aviso' && link.searchParams.get('page') === '1'));assert.match(html, /Buscar nesta página/);
    } finally { fetchMock.mock.restore(); }
  });
  it('/ao-vivo prioriza urgente e consulta mais recente apenas quando vazio', async () => {
    const calls: URL[] = [];
    const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
      const url = new URL(String(input));if (url.pathname.endsWith('/canais_contato')) return publicAvisosReply([]);
      calls.push(url);return publicAvisosReply(url.searchParams.has('tipo') ? [] : [{ ...publicAvisoFixture, tipo_slug: 'informativo' }]);
    });
    try {
      const view = await resolvePublicNoticePage(PublicAoVivoPage);assert.equal(calls.length, 2);
      assert.equal(calls[0].searchParams.get('tipo'), 'urgente');assert.equal(calls[1].searchParams.has('tipo'), false);
      for (const url of calls) { assert.equal(url.searchParams.get('page'), '1');assert.equal(url.searchParams.get('per_page'), '1'); }
      assert.match(renderToStaticMarkup(view), /Comunicado recebido da API/);
    } finally { fetchMock.mock.restore(); }
  });
});

describe('Componentes extraídos da navegação administrativa', () => {
  type ElementProps = { children?: ReactNode; className?: string; title?: string; onClick?: () => void;
    folder?: NavFolderDef; isOpen?: boolean; isCollapsed?: boolean; currentSection?: AdminSection;
    onSelectSection?: (section: AdminSection) => void };
  function elements(node: ReactNode): React.ReactElement<ElementProps>[] {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!isValidElement<ElementProps>(node)) return [];
    return [node, ...elements(node.props.children)];
  }
  function Icon({ className }: { className?: string }) {
    return createElement('svg', { className, 'data-menu-icon': 'fixture' });
  }
  function item(overrides: Partial<SidebarNavItemProps> = {}): SidebarNavItemProps {
    return { label: 'Notícias e Matérias', tooltip: 'Criar ou editar reportagens', icon: Icon,
      isActive: false, onClick() {}, ...overrides };
  }
  function folder(overrides: Partial<SidebarFolderAccordionProps> = {}): SidebarFolderAccordionProps {
    return {
      folder: { id: 'publicacoes', label: 'Publicações do Site', icon: Icon, visible: true, items: [
        { section: 'noticias', label: 'Notícias e Matérias', tooltip: 'Criar ou editar reportagens', icon: Icon, visible: true, badge: 0 },
        { section: 'avisos', label: 'Aviso proibido', tooltip: 'Tooltip proibido', icon: Icon, visible: false, badge: 999 },
        { section: 'projetos', label: 'Projetos Pedagógicos', tooltip: 'Cadastrar projetos das escolas', icon: Icon, visible: true, badge: 'novo' },
      ] },
      isOpen: false, isFolderActive: false, currentSection: 'noticias', onToggle() {}, onSelectSection() {},
      ...overrides,
    };
  }
  const renderItem = (props: SidebarNavItemProps) => renderToStaticMarkup(createElement(SidebarNavItem, props));
  const renderFolder = (props: SidebarFolderAccordionProps) => renderToStaticMarkup(createElement(SidebarFolderAccordion, props));

  it('renderiza item inativo com label, tooltip, ícone e classes originais', () => {
    const tree = SidebarNavItem(item());
    const nodes = elements(tree);
    assert.equal(nodes[0].type, 'button');
    assert.equal(nodes[0].props.title, 'Criar ou editar reportagens');
    assert.equal(nodes[0].props.className, 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium ');
    assert.equal(nodes.find(node => node.type === Icon)?.props.className, 'h-4 w-4 shrink-0 text-slate-400');
    const html = renderItem(item());
    assert.ok(html.includes('type="button"'));
    assert.ok(html.includes('Notícias e Matérias'));
    assert.ok(html.includes('data-menu-icon="fixture"'));
  });

  it('preserva estilos do item ativo e o callback de clique sem executar navegação própria', () => {
    let clicks = 0;
    const onClick = () => { clicks++; };
    const nodes = elements(SidebarNavItem(item({ isActive: true, onClick })));
    assert.ok(nodes[0].props.className?.includes('bg-[#004A99] text-white font-semibold shadow-xs ring-1 ring-white/10'));
    assert.equal(nodes.find(node => node.type === Icon)?.props.className, 'h-4 w-4 shrink-0 text-white');
    assert.strictEqual(nodes[0].props.onClick, onClick);
    nodes[0].props.onClick!();
    assert.equal(clicks, 1);
  });

  it('preserva badges numéricos, zero, texto e ausência de badge', () => {
    for (const badge of [0, 7, 'novo']) {
      const html = renderItem(item({ badge }));
      assert.ok(html.includes('>' + badge + '</span>'));
      assert.ok(html.includes('text-[10px] font-mono px-1.5 py-0.5 rounded'));
    }
    assert.ok(!renderItem(item()).includes('font-mono'));
    assert.ok(renderItem(item({ isActive: true, badge: 0 })).includes('bg-white/20 text-white'));
  });

  it('preserva sidebar recolhida, tooltip alternativo e valores padrão das props', () => {
    const collapsed = item({ isCollapsed: true, badge: 7 });
    const html = renderItem(collapsed);
    assert.ok(html.includes('justify-center px-2'));
    assert.ok(!html.includes('Notícias e Matérias'));
    assert.ok(!html.includes('font-mono'));
    assert.equal(elements(SidebarNavItem(collapsed))[0].props.title, 'Criar ou editar reportagens');
    for (const tooltip of [undefined, '']) {
      assert.equal(elements(SidebarNavItem(item({ isCollapsed: true, tooltip })))[0].props.title, 'Notícias e Matérias');
    }
    assert.equal(renderItem(item()), renderItem(item({ isCollapsed: false })));
  });

  it('renderiza pasta fechada com título, ícone e indicador sem revelar subitens', () => {
    let toggles = 0;
    const props = folder({ onToggle: () => { toggles++; } });
    const tree = SidebarFolderAccordion(props);
    const nodes = elements(tree);
    assert.equal(nodes.filter(node => node.type === 'button').length, 1);
    assert.equal(nodes.find(node => node.type === Icon)?.props.className, 'h-4 w-4 shrink-0 transition-colors text-slate-400');
    const html = renderFolder(props);
    assert.ok(html.includes('Publicações do Site'));
    assert.ok(html.includes('lucide-chevron-right'));
    assert.ok(!html.includes('Notícias e Matérias'));
    nodes.find(node => node.type === 'button')!.props.onClick!();
    assert.equal(toggles, 1);
  });

  it('renderiza pasta aberta com ordem, ícones, badges e estados ativo e inativo dos itens', () => {
    const props = folder({ isOpen: true, isFolderActive: true });
    const nodes = elements(SidebarFolderAccordion(props));
    const buttons = nodes.filter(node => node.type === 'button');
    assert.equal(buttons.length, 3);
    assert.deepEqual(buttons.slice(1).map(node => node.props.title), ['Criar ou editar reportagens', 'Cadastrar projetos das escolas']);
    assert.ok(buttons[0].props.className?.includes('text-white bg-slate-800/80 ring-1 ring-white/10'));
    assert.ok(buttons[1].props.className?.includes('bg-[#004A99] text-white font-bold shadow-xs ring-1 ring-sky-400/30'));
    assert.ok(buttons[2].props.className?.includes('text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'));
    const html = renderFolder(props);
    for (const text of ['lucide-chevron-down', 'ml-4 pl-3 border-l-2 border-slate-800', '>0</span>', '>novo</span>']) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(!html.includes('Aviso proibido'));
    assert.ok(!html.includes('Tooltip proibido'));
    assert.ok(!html.includes('999'));
    assert.equal(nodes.filter(node => node.type === Icon).length, 3);
    assert.equal(nodes.filter(node => node.type === Icon)[1].props.className, 'h-3.5 w-3.5 shrink-0 transition text-white');
    assert.equal(nodes.filter(node => node.type === Icon)[2].props.className, 'h-3.5 w-3.5 shrink-0 transition text-slate-400 group-hover:text-sky-300');
  });

  it('encaminha as seções corretas ao selecionar itens e mantém alternância separada da seleção', () => {
    const selected: AdminSection[] = [];
    let toggles = 0;
    const props = folder({ isOpen: true, onToggle: () => { toggles++; }, onSelectSection: section => selected.push(section) });
    const buttons = elements(SidebarFolderAccordion(props)).filter(node => node.type === 'button');
    for (const button of buttons.slice(1)) button.props.onClick!();
    assert.deepEqual(selected, ['noticias', 'projetos']);
    assert.equal(toggles, 0);
    buttons[0].props.onClick!();
    assert.equal(toggles, 1);
    assert.deepEqual(selected, ['noticias', 'projetos']);
  });

  it('mantém expansão e recolhimento controlados pelas props do pai', () => {
    let toggles = 0;
    const props = folder({ onToggle: () => { toggles++; } });
    elements(SidebarFolderAccordion(props)).find(node => node.type === 'button')!.props.onClick!();
    assert.equal(toggles, 1);
    assert.ok(!renderFolder(props).includes('Notícias e Matérias'));
    const opened = { ...props, isOpen: true };
    assert.ok(renderFolder(opened).includes('Notícias e Matérias'));
    elements(SidebarFolderAccordion(opened)).find(node => node.type === 'button')!.props.onClick!();
    assert.equal(toggles, 2);
    assert.ok(!renderFolder({ ...opened, isOpen: false }).includes('Notícias e Matérias'));
  });

  it('preserva pasta recolhida, tooltip do grupo, ícone e clique para os dois estados ativos', () => {
    for (const isFolderActive of [false, true]) {
      let toggles = 0;
      const props = folder({ isCollapsed: true, isOpen: true, isFolderActive, onToggle: () => { toggles++; } });
      const nodes = elements(SidebarFolderAccordion(props));
      assert.equal(nodes[0].type, 'button');
      assert.equal(nodes[0].props.title, 'Publicações do Site');
      assert.ok(nodes[0].props.className?.includes(isFolderActive ? 'bg-[#004A99] text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'));
      assert.equal(nodes.filter(node => node.type === Icon).length, 1);
      assert.equal(nodes.filter(node => node.type === 'button').length, 1);
      assert.ok(!renderFolder(props).includes('Notícias e Matérias'));
      nodes[0].props.onClick!();
      assert.equal(toggles, 1);
    }
  });

  it('não renderiza grupos sem itens visíveis, mesmo abertos ou com a sidebar recolhida', () => {
    const base = folder();
    for (const items of [[], base.folder.items.map(item => ({ ...item, visible: false }))]) {
      for (const isOpen of [false, true]) for (const isCollapsed of [false, true]) {
        const props = { ...base, folder: { ...base.folder, items }, isOpen, isCollapsed };
        assert.equal(SidebarFolderAccordion(props), null);
        assert.equal(renderFolder(props), '');
      }
    }
  });

  it('consome resultados da filtragem compartilhada sem alterar grupos, permissões ou props', () => {
    const base = folder({ isOpen: true });
    const filtered = filterAdminNavigation([base.folder], 'reportagens').filteredFolders;
    assert.equal(filtered.length, 1);
    const html = renderFolder({ ...base, folder: filtered[0] });
    assert.ok(html.includes('Publicações do Site'));
    assert.ok(html.includes('Notícias e Matérias'));
    assert.ok(!html.includes('Projetos Pedagógicos'));
    assert.ok(!html.includes('Aviso proibido'));
    assert.equal(base.folder.items.length, 3);
    assert.deepEqual(filterAdminNavigation([base.folder], 'sem resultados').filteredFolders, []);
    assert.equal(renderFolder(base), renderFolder({ ...base, isCollapsed: false }));
  });

  it('integra os componentes extraídos no desktop e mobile sem mudar os callbacks da página', () => {
    const originalState = React.useState;
    const mobileUpdates: boolean[] = [];
    const destinations: string[] = [];
    let index = 0;
    const stateMock = mock.method(React, 'useState', (initial: unknown) => {
      const current = index++;
      if (current === 1) return originalState(true);
      if (current === 3) return [originalState(true)[0], (value: boolean) => mobileUpdates.push(value)];
      if (initial && typeof initial === 'object' && 'isGestor' in initial) {
        return originalState({ isGestor: true, editorialProfile: 'Administrador' });
      }
      return originalState(initial);
    });
    const router = { back() {}, forward() {}, refresh() {}, replace() {}, prefetch() {}, bfcacheId: 'extracted-sidebar-test',
      push(href: string) { destinations.push(href); } };
    let tree: ReactNode;
    function Capture() { tree = AdminDashboardPage(); return tree; }
    try {
      renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(Capture)));
      const nodes = elements(tree);
      assert.equal(nodes.filter(node => node.type === SidebarNavItem).length, 2);
      const groups = nodes.filter(node => node.type === SidebarFolderAccordion);
      assert.equal(groups.length, 8);
      assert.deepEqual(groups.slice(0, 4).map(node => node.props.folder!.id), ['publicacoes', 'aprovacao', 'dados', 'usuarios']);
      for (let position = 0; position < 4; position++) {
        assert.strictEqual(groups[position].props.folder, groups[position + 4].props.folder);
        assert.equal(groups[position].props.isOpen, false);
        assert.equal(groups[position + 4].props.isCollapsed, false);
        assert.equal(groups[position].props.currentSection, 'visaoGeral');
      }
      groups[0].props.onSelectSection!('noticias');
      assert.deepEqual(mobileUpdates, []);
      groups[4].props.onSelectSection!('noticias');
      assert.deepEqual(destinations, ['/admin/noticias', '/admin/noticias']);
      assert.deepEqual(mobileUpdates, [false]);
    } finally { stateMock.mock.restore(); }
  });
});

describe('Pesquisa compartilhada da navegação administrativa', () => {
  function fixture() {
    const item = (section: AdminSection, tooltip: string, visible = true) => ({
      section, label: SECTION_CONFIG[section].title, tooltip, visible, href: SECTION_CONFIG[section].href, badge: 0,
    });
    return [
      { id: 'publicacoes', label: SECTION_CONFIG.noticias.group, visible: true, marker: 'primeiro', items: [
        item('noticias', 'Criar ou editar reportagens'),
        { ...item('projetos', 'Cadastrar projetos das escolas'), label: 'Projetos Pedagógicos' },
        item('avisos', 'Publicar alertas no mural', false),
      ] },
      { id: 'usuarios', label: SECTION_CONFIG.usuarios.group, visible: false, marker: 'oculto',
        items: [item('usuarios', 'Cadastro de operadores por CPF')] },
      { id: 'dados', label: SECTION_CONFIG.redes.group, visible: true, marker: 'segundo',
        items: [item('redes', 'Edita os links de YouTube e Instagram')] },
      { id: 'vazio', label: 'Pasta sem itens permitidos', visible: true, marker: 'vazio',
        items: [item('kanban', 'Aprovar rascunhos', false)] },
    ];
  }

  function sections(query: string) {
    return filterAdminNavigation(fixture(), query).filteredFolders.flatMap(folder => folder.items.map(item => item.section));
  }

  it('pesquisa rótulos dos itens sem ampliar a busca aos títulos completos e descrições de seção', () => {
    assert.deepEqual(sections('Redes Sociais'), ['redes']);
    assert.deepEqual(sections('Projetos Pedagógicos'), ['projetos']);
    assert.deepEqual(sections('Práticas Escolares'), []);
    assert.deepEqual(sections('transmissão, redes sociais e canais de atendimento'), []);
  });

  it('pesquisa as descrições curtas já suportadas pelos tooltips', () => {
    assert.deepEqual(sections('reportagens'), ['noticias']);
    assert.deepEqual(sections('YouTube'), ['redes']);
  });

  it('pesquisa nomes de grupos e inclui somente seus itens permitidos', () => {
    const result = filterAdminNavigation(fixture(), 'Publicações do Site');
    assert.deepEqual(result.filteredFolders.map(folder => folder.id), ['publicacoes']);
    assert.deepEqual(result.filteredFolders[0].items.map(item => item.section), ['noticias', 'projetos']);
    assert.deepEqual(sections('Dados e Contatos'), ['redes']);
  });

  it('ignora maiúsculas e minúsculas e espaços nas bordas sem normalizar espaços internos', () => {
    assert.deepEqual(sections('  rEdEs SoCiAiS  '), ['redes']);
    assert.deepEqual(sections('Redes  Sociais'), []);
  });

  it('mantém a diferenciação de acentos e os termos existentes de Início', () => {
    assert.deepEqual(sections('notícias'), ['noticias']);
    assert.deepEqual(sections('noticias'), []);
    for (const query of ['início', 'RESUMO DO PAINEL', 'visão geral', 'home']) {
      assert.equal(filterAdminNavigation(fixture(), query).homeMatchesSearch, true, query);
    }
    for (const query of ['inicio', 'visao geral']) {
      assert.equal(filterAdminNavigation(fixture(), query).homeMatchesSearch, false, query);
    }
  });

  it('preserva ordem e agrupamento com pesquisa vazia ou composta somente de espaços', () => {
    for (const query of ['', '  \t ']) {
      const result = filterAdminNavigation(fixture(), query);
      assert.equal(result.isSearching, false);
      assert.equal(result.homeMatchesSearch, true);
      assert.equal(result.hasAnySearchResult, true);
      assert.deepEqual(result.filteredFolders.map(folder => folder.id), ['publicacoes', 'dados']);
      assert.deepEqual(result.filteredFolders.flatMap(folder => folder.items.map(item => item.section)), ['noticias', 'projetos', 'redes']);
    }
  });

  it('remove grupos ocultos ou vazios e distingue ausência de resultados dos aliases de Início', () => {
    for (const query of ['termo inexistente', 'Usuários e Acessos', 'Pasta sem itens permitidos', 'avisos', 'rascunhos']) {
      const result = filterAdminNavigation(fixture(), query);
      assert.equal(result.isSearching, true);
      assert.equal(result.hasAnySearchResult, false, query);
      assert.deepEqual(result.filteredFolders, []);
    }
    const homeOnly = filterAdminNavigation([], 'home');
    assert.equal(homeOnly.homeMatchesSearch, true);
    assert.equal(homeOnly.hasAnySearchResult, true);
  });

  it('é determinística, não modifica as entradas e preserva propriedades específicas dos consumidores', () => {
    const input = fixture();
    for (const folder of input) { folder.items.forEach(Object.freeze); Object.freeze(folder.items); Object.freeze(folder); }
    Object.freeze(input);
    const first = filterAdminNavigation(input, '');
    assert.deepEqual(first, filterAdminNavigation(input, ''));
    assert.equal(input[0].items.length, 3);
    assert.equal(input[1].visible, false);
    assert.equal(first.filteredFolders[0].marker, 'primeiro');
    assert.equal(first.filteredFolders[0].label, input[0].label);
    assert.strictEqual(first.filteredFolders[0].items[0], input[0].items[0]);
    assert.equal(first.filteredFolders[0].items[0].href, '/admin/noticias');
    assert.equal(first.filteredFolders[0].items[0].badge, 0);
  });

  type MenuProps = {
    role?: string; 'aria-label'?: string; 'aria-modal'?: boolean | 'true' | 'false'; tabIndex?: number; ref?: React.Ref<HTMLDivElement>;
    children?: ReactNode; placeholder?: string; title?: string; href?: string; label?: string;
    onChange?: (event: { target: { value: string } }) => void; onClick?: () => void;
    folder?: { id: string; items: { section: AdminSection; visible: boolean }[] };
    isOpen?: boolean; isCollapsed?: boolean; onSelectSection?: (section: AdminSection) => void;
  };
  function elements(node: ReactNode): React.ReactElement<MenuProps>[] {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!isValidElement<MenuProps>(node)) return [];
    return [node, ...elements(node.props.children)];
  }

  function navigation(kind: 'page' | 'shell', session: AdminSession & { editorialProfile?: string }, mobile = false, collapsed = false) {
    let search = '';
    let openFolders = { publicacoes: kind === 'shell', aprovacao: false, dados: false, usuarios: false };
    const destinations: string[] = [];
    const router = { back() {}, forward() {}, refresh() {}, replace() {}, prefetch() {}, bfcacheId: 'menu-search-test',
      push(href: string) { destinations.push(href); } };
    const originalState = React.useState;
    function render() {
      let index = 0;
      const stateMock = mock.method(React, 'useState', (initial: unknown) => {
        const current = index++;
        const collapseIndex = kind === 'page' ? 2 : 0;
        const mobileIndex = kind === 'page' ? 3 : 1;
        const searchIndex = kind === 'page' ? 4 : 2;
        const foldersIndex = kind === 'page' ? 5 : 3;
        if (current === collapseIndex) return [originalState(collapsed)[0], (value: boolean) => { collapsed = value; }];
        if (current === mobileIndex) return [originalState(mobile)[0], (value: boolean) => { mobile = value; }];
        if (current === searchIndex) return [originalState(search)[0], (value: string) => { search = value; }];
        if (current === foldersIndex) return [originalState(openFolders)[0],
          (update: (previous: typeof openFolders) => typeof openFolders) => { openFolders = update(openFolders); }];
        if (initial && typeof initial === 'object' && 'isGestor' in initial) return originalState(session);
        if (current === (kind === 'page' ? 1 : 4)) return originalState(true);
        if (kind === 'shell' && current === 5) return originalState(false);
        return originalState(initial);
      });
      let tree: ReactNode;
      function Capture() { tree = kind === 'page' ? AdminDashboardPage() : AdminShell({ children: null }); return tree; }
      try {
        const html = renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router },
          createElement(PathnameContext.Provider, { value: '/admin' }, createElement(Capture))));
        return { html, nodes: elements(tree) };
      } finally { stateMock.mock.restore(); }
    }
    return {
      render, destinations, isMobileOpen: () => mobile,
      setSearch(value: string) {
        const input = render().nodes.find(node => node.props.placeholder === 'Pesquisar função ou menu...');
        assert.ok(input?.props.onChange);
        input.props.onChange({ target: { value } });
      },
    };
  }
  const admin: AdminSession & { editorialProfile: string } = {
    isGestor: true, editorialProfile: 'Administrador',
    apiUser: { id: 100, nome: 'Admin', cpf: '', ativo: true, perfil_id: 3, perfil_nome: 'Administrador' },
  };

  it('expande resultados na página e restaura as pastas anteriores ao limpar pelos controles existentes', () => {
    const page = navigation('page', admin, true);
    assert.ok(page.render().nodes.filter(node => node.props.folder).every(node => node.props.isOpen === false));
    page.setSearch('YouTube');
    const filtered = page.render();
    const groups = filtered.nodes.filter(node => node.props.folder);
    assert.deepEqual(groups.map(node => node.props.folder!.id), ['dados', 'dados']);
    assert.ok(groups.every(node => node.props.isOpen === true));
    assert.deepEqual(groups[0].props.folder!.items.map(item => item.section), ['redes']);
    assert.equal(filtered.nodes.filter(node => node.props.placeholder === 'Pesquisar função ou menu...').length, 2);
    const clear = filtered.nodes.filter(node => node.props.title === 'Limpar pesquisa');
    assert.equal(clear.length, 2);
    clear[1].props.onClick!();
    const restored = page.render().nodes.filter(node => node.props.folder);
    assert.equal(restored.length, 8);
    assert.ok(restored.every(node => node.props.isOpen === false));
  });

  it('preserva expansão inicial do shell, pesquisa somente no desktop e navegação mobile por links', () => {
    const shell = navigation('shell', admin, true);
    const initial = shell.render();
    assert.ok(initial.nodes.some(node => node.props.href === '/admin/noticias'));
    assert.ok(!initial.nodes.some(node => node.props.href === '/admin/redes' && !node.props.onClick));
    shell.setSearch('YouTube');
    const filtered = shell.render();
    assert.equal(filtered.nodes.filter(node => node.props.placeholder === 'Pesquisar função ou menu...').length, 1);
    const links = filtered.nodes.filter(node => node.props.href === '/admin/redes');
    assert.equal(links.length, 2);
    assert.ok(links[1].props.onClick);
    links[1].props.onClick();
    assert.equal(shell.isMobileOpen(), false);
    assert.deepEqual(shell.destinations, []);
    const clear = shell.render().nodes.find(node => node.props.title === 'Limpar pesquisa');
    assert.ok(clear?.props.onClick);
    clear.props.onClick();
    const restored = shell.render();
    assert.ok(restored.nodes.some(node => node.props.href === '/admin/noticias'));
    assert.ok(!restored.nodes.some(node => node.props.href === '/admin/redes'));
  });

  it('E10.2 — gaveta tem diálogo nomeado, referências de foco e fechamento acessível', () => {
    const page = navigation('page', admin, true);
    const nodes = page.render().nodes;
    const dialog = nodes.find(node => node.props.role === 'dialog');
    assert.ok(dialog); assert.equal(dialog.props['aria-label'], 'Navegação administrativa');
    assert.equal(dialog.props['aria-modal'], 'true'); assert.equal(dialog.props.tabIndex, -1);
    assert.ok(dialog.props.ref);
    const close = nodes.find(node => node.props['aria-label'] === 'Fechar menu lateral');
    assert.ok(close?.props.onClick); close.props.onClick(); assert.equal(page.isMobileOpen(), false);
  });

  it('preserva router.push e fechamento da gaveta mobile da página ao selecionar um resultado', () => {
    const page = navigation('page', admin, true);
    page.setSearch('YouTube');
    const groups = page.render().nodes.filter(node => node.props.folder);
    groups[1].props.onSelectSection!('redes');
    assert.deepEqual(page.destinations, ['/admin/redes']);
    assert.equal(page.isMobileOpen(), false);
    assert.equal(page.render().nodes.filter(node => node.props.placeholder === 'Pesquisar função ou menu...').length, 1);
    assert.ok(page.render().nodes.find(node => node.props.folder)?.props.isOpen);
  });

  it('preserva diferenças de Início e mensagens vazias nos menus mobile existentes', () => {
    const page = navigation('page', admin, true);
    const shell = navigation('shell', admin, true);
    for (const menu of [page, shell]) menu.setSearch('termo inexistente');
    const root = page.render();
    const subroute = shell.render();
    assert.equal((root.html.match(/Nenhuma função encontrada para/g) || []).length, 2);
    assert.equal((subroute.html.match(/Nenhuma função encontrada para/g) || []).length, 1);
    assert.ok(!root.nodes.some(node => node.props.label === 'Início (Resumo do Painel)'));
    assert.equal(subroute.nodes.filter(node => node.props.href === '/admin').length, 1);
    const clear = root.nodes.find(node => node.type === 'button' && node.props.children === 'Limpar pesquisa');
    assert.ok(clear?.props.onClick);
    clear.props.onClick();
    assert.ok(!page.render().html.includes('Nenhuma função encontrada para'));
  });

  it('não revela Usuários ou Kanban pela pesquisa e mantém as diferenças de autorização existentes', () => {
    for (const session of [admin, { isGestor: true }, { isGestor: false, profileType: 'Operador de Conteúdo' }]) {
      for (const kind of ['page', 'shell'] as const) {
        const menu = navigation(kind, session, true);
        menu.setSearch('Equipe e Senhas');
        const users = menu.render();
        const hasUsers = kind === 'page'
          ? users.nodes.some(node => node.props.folder?.items.some(item => item.section === 'usuarios'))
          : users.nodes.some(node => node.props.href === '/admin/usuarios');
        assert.equal(hasUsers, kind === 'page' ? session.isGestor : session === admin);
        menu.setSearch('Rascunho');
        const kanban = menu.render();
        const hasKanban = kind === 'page'
          ? kanban.nodes.some(node => node.props.folder?.items.some(item => item.section === 'kanban'))
          : kanban.nodes.some(node => node.props.href === '/admin/kanban');
        assert.equal(hasKanban, session === admin);
      }
    }
  });

  it('mantém o filtro no menu recolhido sem adicionar campos ou alterar a navegação', () => {
    for (const kind of ['page', 'shell'] as const) {
      const menu = navigation(kind, admin);
      menu.setSearch('YouTube');
      const expanded = menu.render();
      assert.equal(expanded.nodes.filter(node => node.props.placeholder === 'Pesquisar função ou menu...').length, 1);
      const collapse = expanded.nodes.find(node => node.props.title === 'Recolher menu lateral');
      assert.ok(collapse?.props.onClick);
      collapse.props.onClick();
      const collapsed = menu.render();
      assert.equal(collapsed.nodes.filter(node => node.props.placeholder === 'Pesquisar função ou menu...').length, 0);
      if (kind === 'page') {
        const groups = collapsed.nodes.filter(node => node.props.folder);
        assert.equal(groups.length, 1);
        assert.equal(groups[0].props.isCollapsed, true);
        assert.equal(groups[0].props.folder!.id, 'dados');
      } else {
        assert.ok(collapsed.nodes.some(node => node.props.title === 'Dados e Contatos do Site'));
        assert.ok(!collapsed.nodes.some(node => node.props.href === '/admin/redes'));
      }
      assert.deepEqual(menu.destinations, []);
    }
  });
});

describe('Tema administrativo compartilhado', () => {
  type Subscribe = (notify: () => void) => () => void;

  function withGlobals<T>(values: Record<string, unknown>, run: () => T): T {
    const descriptors = Object.fromEntries(Object.keys(values).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    try {
      for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { configurable: true, value });
      return run();
    } finally {
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    }
  }

  function withBrowser(run: (browser: ReturnType<typeof createBrowser>) => void, initialClass = 'light') {
    const browser = createBrowser(initialClass);
    withGlobals(browser.globals, () => run(browser));
  }

  function createBrowser(initialClass: string) {
    const classes = new Set(['portal-class', initialClass]);
    const storage = new Map<string, string>();
    const writes: [string, string][] = [];
    const reads: string[] = [];
    const pending = new Set<Observer>();
    const observers: Observer[] = [];
    class Observer {
      connected = false;
      target?: unknown;
      options?: MutationObserverInit;
      constructor(readonly notify: () => void) { observers.push(this); }
      observe(target: unknown, options: MutationObserverInit) { this.target = target; this.options = options; this.connected = true; }
      disconnect() { this.connected = false; pending.delete(this); }
    }
    const changed = () => observers.filter(observer => observer.connected).forEach(observer => pending.add(observer));
    const document = { documentElement: { classList: {
      contains(value: string) { return classes.has(value); },
      add(value: string) { if (!classes.has(value)) { classes.add(value); changed(); } },
      remove(value: string) { if (classes.delete(value)) changed(); },
    } } };
    const localStorage = {
      getItem(key: string) { reads.push(key); return storage.get(key) ?? null; },
      setItem(key: string, value: string) { writes.push([key, value]); storage.set(key, value); },
    };
    return {
      globals: { window: {}, document, localStorage, MutationObserver: Observer },
      classes, storage, writes, reads, observers, pending,
      flush() {
        const batch = [...pending];
        pending.clear();
        for (const observer of batch) if (observer.connected) observer.notify();
      },
    };
  }

  // Exercita os callbacks reais do hook com o contrato de useSyncExternalStore interceptado.
  // Não simula a hidratação nem o agendamento do React no navegador.
  function readTheme() {
    let contract: { subscribe: Subscribe; getSnapshot: () => boolean; getServerSnapshot: () => boolean } | undefined;
    const syncMock = mock.method(React, 'useSyncExternalStore',
      (subscribe: Subscribe, getSnapshot: () => boolean, getServerSnapshot: () => boolean) => {
        contract = { subscribe, getSnapshot, getServerSnapshot };
        return getSnapshot();
      });
    function Probe() { return useAdminTheme(); }
    try {
      const value = Probe();
      assert.ok(contract);
      return { value, ...contract };
    } finally { syncMock.mock.restore(); }
  }

  function ThemeProbe() {
    const { isDark } = useAdminTheme();
    return createElement('span', null, isDark ? 'escuro' : 'claro');
  }

  it('respeita a preferência existente aplicada pelo layout sem reinicializar o tema no hook', () => {
    const delimiter = String.fromCharCode(96);
    const bootstrap = readFileSync('src/app/layout.tsx', 'utf8').split('__html: ' + delimiter)[1]?.split(delimiter)[0];
    assert.ok(bootstrap);
    for (const preference of ['dark', 'light', undefined]) {
      withBrowser(browser => {
        if (preference) browser.storage.set('medtec-theme', preference);
        runInNewContext(bootstrap, browser.globals);
        const before = [...browser.classes];
        const theme = readTheme();
        assert.equal(theme.value.isDark, preference === 'dark');
        assert.deepEqual([...browser.classes], before);
        assert.deepEqual(browser.reads, ['medtec-theme']);
        assert.deepEqual(browser.writes, []);
        // O DOM continua sendo a fonte do admin, inclusive se divergir do armazenamento.
        browser.storage.set('medtec-theme', preference === 'dark' ? 'light' : 'dark');
        assert.equal(readTheme().value.isDark, preference === 'dark');
      }, 'dark');
    }
  });

  it('alterna de claro para escuro, persiste a chave existente e preserva outras classes', () => {
    withBrowser(browser => {
      const theme = readTheme();
      assert.equal(theme.value.isDark, false);
      theme.value.toggleTheme();
      assert.equal(theme.getSnapshot(), true);
      assert.deepEqual([...browser.classes].sort(), ['dark', 'portal-class']);
      assert.deepEqual(browser.writes, [['medtec-theme', 'dark']]);
      assert.equal(browser.storage.get('medtec-theme'), 'dark');
    });
  });

  it('alterna de escuro para claro e remove dark sem criar outra chave', () => {
    withBrowser(browser => {
      const theme = readTheme();
      assert.equal(theme.value.isDark, true);
      theme.value.toggleTheme();
      assert.equal(theme.getSnapshot(), false);
      assert.deepEqual([...browser.classes].sort(), ['light', 'portal-class']);
      assert.deepEqual(browser.writes, [['medtec-theme', 'light']]);
      assert.equal(browser.storage.size, 1);
    }, 'dark');
  });

  it('sincroniza assinantes simultâneos, montagem posterior e alterações externas sem ciclos', () => {
    withBrowser(browser => {
      let overview = readTheme();
      let shell = readTheme();
      let overviewUpdates = 0;
      let shellUpdates = 0;
      const stopOverview = overview.subscribe(() => { overviewUpdates++; overview = readTheme(); });
      const stopShell = shell.subscribe(() => { shellUpdates++; shell = readTheme(); });
      try {
        overview.value.toggleTheme();
        browser.flush();
        assert.equal(overview.value.isDark, true);
        assert.equal(shell.value.isDark, true);
        assert.equal(readTheme().value.isDark, true);
        assert.deepEqual([overviewUpdates, shellUpdates], [1, 1]);
        shell.value.toggleTheme();
        browser.flush();
        assert.equal(overview.value.isDark, false);
        assert.equal(shell.value.isDark, false);
        browser.globals.document.documentElement.classList.add('dark');
        browser.globals.document.documentElement.classList.remove('light');
        browser.flush();
        assert.equal(overview.value.isDark, true);
        assert.equal(shell.value.isDark, true);
        assert.deepEqual([overviewUpdates, shellUpdates], [3, 3]);
        assert.deepEqual(browser.writes, [['medtec-theme', 'dark'], ['medtec-theme', 'light']]);
        assert.equal(browser.observers.length, 2);
        assert.equal(browser.pending.size, 0);
        browser.flush();
        assert.deepEqual([overviewUpdates, shellUpdates], [3, 3]);
      } finally { stopOverview(); stopShell(); }
    });
  });

  it('observa somente a classe do documento e desconecta assinaturas ao desmontar e navegar', () => {
    withBrowser(browser => {
      const theme = readTheme();
      let updates = 0;
      const stop = theme.subscribe(() => { updates++; });
      assert.equal(browser.observers.length, 1);
      assert.equal(browser.observers[0].target, browser.globals.document.documentElement);
      assert.deepEqual(browser.observers[0].options, { attributes: true, attributeFilter: ['class'] });
      theme.value.toggleTheme();
      stop();
      browser.flush();
      assert.equal(updates, 0);
      for (let navigation = 0; navigation < 3; navigation++) {
        const next = readTheme();
        const cleanup = next.subscribe(() => { updates++; });
        assert.equal(browser.observers.filter(observer => observer.connected).length, 1);
        cleanup();
      }
      browser.globals.document.documentElement.classList.remove('dark');
      browser.flush();
      assert.equal(updates, 0);
      assert.ok(browser.observers.every(observer => !observer.connected));
      assert.equal(browser.pending.size, 0);
    });
  });

  it('renderiza no servidor sem acessar APIs do navegador e mantém callbacks seguros de leitura e assinatura', () => {
    const keys = ['window', 'document', 'localStorage', 'MutationObserver'];
    const descriptors = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    try {
      for (const key of keys) Object.defineProperty(globalThis, key, {
        configurable: true, get() { throw new Error('SSR não deve acessar ' + key); },
      });
      assert.equal(renderToStaticMarkup(createElement(ThemeProbe)), '<span>claro</span>');
    } finally {
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    }
    withGlobals(Object.fromEntries(keys.map(key => [key, undefined])), () => {
      const theme = readTheme();
      assert.equal(theme.value.isDark, false);
      assert.equal(theme.getServerSnapshot(), false);
      let updates = 0;
      const cleanup = theme.subscribe(() => { updates++; });
      cleanup();
      assert.equal(updates, 0);
    });
  });

  it('preserva o snapshot claro do servidor mesmo com dark já aplicado ao documento', () => {
    withBrowser(browser => {
      assert.equal(renderToStaticMarkup(createElement(ThemeProbe)), '<span>claro</span>');
      assert.equal(browser.observers.length, 0);
      assert.deepEqual(browser.reads, []);
      assert.deepEqual(browser.writes, []);
      const client = readTheme();
      assert.equal(client.getServerSnapshot(), false);
      assert.equal(client.getSnapshot(), true);
      assert.equal(client.value.isDark, true);
    }, 'dark');
  });

  it('preserva botões, ícones, tooltips e alternância efetiva na página e no shell', () => {
    type ControlProps = { children?: ReactNode; title?: string; className?: string; onClick?: () => void };
    function findControl(node: ReactNode): React.ReactElement<ControlProps>[] {
      if (Array.isArray(node)) return node.flatMap(findControl);
      if (!isValidElement<ControlProps>(node)) return [];
      const own = node.type === 'button' && node.props.title?.startsWith('Mudar para tema') ? [node] : [];
      return [...own, ...findControl(node.props.children)];
    }
    for (const kind of ['page', 'shell']) for (const initialClass of ['light', 'dark']) {
      withBrowser(browser => {
        const originalState = React.useState;
        let index = 0;
        const stateMock = mock.method(React, 'useState', (initial: unknown) => {
          const current = index++;
          if (initial && typeof initial === 'object' && 'isGestor' in initial) return originalState({ isGestor: true });
          if (kind === 'page' && current === 1) return originalState(true);
          if (kind === 'shell' && current === 4) return originalState(true);
          if (kind === 'shell' && current === 5) return originalState(false);
          return originalState(initial);
        });
        const syncMock = mock.method(React, 'useSyncExternalStore', (_subscribe: Subscribe, snapshot: () => boolean) => snapshot());
        const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: 'theme-controls-test' };
        let tree: ReactNode;
        function Capture() {
          tree = kind === 'page' ? AdminDashboardPage() : AdminShell({ children: null });
          return tree;
        }
        try {
          withGlobals({ window: undefined }, () => renderToStaticMarkup(
            createElement(AppRouterContext.Provider, { value: router }, createElement(Capture))));
          const controls = findControl(tree);
          assert.equal(controls.length, 1);
          const control = controls[0];
          const dark = initialClass === 'dark';
          assert.equal(control.props.title, dark ? 'Mudar para tema claro' : 'Mudar para tema escuro');
          const touchClass = kind === 'page' ? 'inline-flex min-h-11 min-w-11 lg:min-h-0 lg:min-w-0 items-center justify-center ' : '';
          assert.equal(control.props.className, touchClass + 'p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer');
          assert.ok(isValidElement<{ className: string }>(control.props.children));
          assert.equal(control.props.children.type, dark ? Sun : Moon);
          assert.equal(control.props.children.props.className, dark ? 'h-4 w-4 text-amber-400' : 'h-4 w-4 text-slate-600');
          control.props.onClick!();
          assert.equal(browser.classes.has('dark'), !dark);
          assert.deepEqual(browser.writes, [['medtec-theme', dark ? 'light' : 'dark']]);
        } finally { stateMock.mock.restore(); syncMock.mock.restore(); }
      }, initialClass);
    }
  });
});

describe('Metadados compartilhados da navegação administrativa', () => {
  type NavigationProps = {
    children?: ReactNode;
    label?: string;
    href?: string;
    onClick?: () => void;
    folder?: { id: string; items: { section: AdminSection; visible: boolean }[] };
    isOpen?: boolean;
    isFolderActive?: boolean;
    onSelectSection?: (section: AdminSection) => void;
  };

  function elements(node: ReactNode): React.ReactElement<NavigationProps>[] {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!isValidElement<NavigationProps>(node)) return [];
    return [node, ...elements(node.props.children)];
  }

  function capture(kind: 'page' | 'shell', session: AdminSession & { editorialProfile?: string },
    mobile = false, section: AdminSection = 'visaoGeral') {
    const originalState = React.useState;
    let stateIndex = 0;
    const selections: unknown[] = [];
    const calls: { method: string; href: string }[] = [];
    const effects: React.EffectCallback[] = [];
    const router = {
      back() {}, forward() {}, refresh() {}, prefetch() {}, bfcacheId: 'navigation-metadata-test',
      push(href: string) { calls.push({ method: 'push', href }); },
      replace(href: string) { calls.push({ method: 'replace', href }); },
    };
    // Injeta autenticação e abertura do drawer sem executar efeitos ou consultar serviços.
    const stateMock = mock.method(React, 'useState', (initial: unknown) => {
      const index = stateIndex++;
      if (initial && typeof initial === 'object' && 'isGestor' in initial) return originalState(session);
      if (kind === 'page') {
        if (index === 0) return [section, (value: unknown) => selections.push(value)];
        if (index === 1) return originalState(true);
        if (index === 3) return originalState(mobile);
      } else {
        if (index === 1) return originalState(mobile);
        if (index === 4) return originalState(true);
        if (index === 5) return originalState(false);
      }
      return originalState(initial);
    });
    const effectMock = mock.method(React, 'useEffect', (effect: React.EffectCallback, dependencies?: React.DependencyList) => {
      const dependency = dependencies?.[0];
      if (kind === 'page' && dependency && typeof dependency === 'object' &&
        'push' in dependency && dependency.push === router.push) effects.push(effect);
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => { throw new Error('Teste de navegação não deve consultar serviços.'); };
    let tree: ReactNode;
    function Capture() {
      tree = kind === 'page' ? AdminDashboardPage() : AdminShell({ activeSection: section, children: 'Conteúdo autorizado' });
      return tree;
    }
    try {
      const html = renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router },
        createElement(PathnameContext.Provider, { value: SHARED_SECTION_CONFIG[section].href }, createElement(Capture))));
      return { html, nodes: elements(tree), calls, selections, effects };
    } finally {
      stateMock.mock.restore();
      effectMock.mock.restore();
      globalThis.fetch = originalFetch;
    }
  }

  const session: AdminSession & { editorialProfile: string } = {
    isGestor: true, name: 'Administrador confirmado', profileType: 'Administrador', editorialProfile: 'Administrador',
    apiUser: { id: 100, nome: 'Administrador confirmado', cpf: '', ativo: true, perfil_id: 3,
      perfil_nome: 'Administrador' },
  };

  it('preserva integralmente a ordem, grupos, títulos, descrições e URLs das doze seções', () => {
    const expected = {
      "visaoGeral": {
        "group": "Início",
        "title": "Início (Resumo do Painel)",
        "subtitle": "Visão executiva unificada, indicadores em tempo real e atalhos didáticos de acesso rápido.",
        "href": "/admin"
      },
      "noticias": {
        "group": "Publicações do Site",
        "title": "Notícias e Matérias",
        "subtitle": "Aqui você escreve novas matérias, escolhe a foto de capa e edita notícias já publicadas no portal.",
        "href": "/admin/noticias"
      },
      "projetos": {
        "group": "Publicações do Site",
        "title": "Projetos Pedagógicos",
        "subtitle": "Cadastre os projetos das escolas com tema, relato, capa, anexos e membros, e acompanhe a aprovação.",
        "href": "/admin/projetos"
      },
      "projetosTemas": {
        "group": "Publicações do Site",
        "title": "Temas de Projeto",
        "subtitle": "Cadastre e organize os temas usados nos projetos pedagógicos.",
        "href": "/admin/projetos/temas"
      },
      "projetosMembros": {
        "group": "Publicações do Site",
        "title": "Membros de Projeto",
        "subtitle": "Cadastre as pessoas que participam dos projetos. O CPF não aparece no site.",
        "href": "/admin/projetos/membros"
      },
      "duvidas": {
        "group": "Publicações do Site",
        "title": "Dúvidas Frequentes (FAQ)",
        "subtitle": "Cadastre, edite e organize as perguntas e respostas que aparecem na Central de Dúvidas do portal.",
        "href": "/admin/faq"
      },
      "avisos": {
        "group": "Publicações do Site",
        "title": "Avisos e Comunicados",
        "subtitle": "Use esta área para postar comunicados oficiais, calendários e avisos urgentes para as escolas.",
        "href": "/admin/avisos"
      },
      "fotos": {
        "group": "Publicações do Site",
        "title": "Banners da Página Inicial",
        "subtitle": "Gerencie as imagens grandes que passam no topo da Página Inicial do site.",
        "href": "/admin/banners"
      },
      "galeria": {
        "group": "Publicações do Site",
        "title": "Galeria de Fotos",
        "subtitle": "Envie fotografias das salas de aula, estúdios e projetos realizados nos municípios.",
        "href": "/admin/galeria"
      },
      "professores": {
        "group": "Publicações do Site",
        "title": "Professores e Mediadores",
        "subtitle": "Cadastre e gerencie os perfis docentes de ministrantes e mediadores, disciplinas e relatos.",
        "href": "/admin/professores"
      },
      "professoresDisciplinas": {
        "group": "Publicações do Site",
        "title": "Disciplinas dos Professores",
        "subtitle": "Cadastre e organize as disciplinas vinculadas aos perfis docentes.",
        "href": "/admin/professores/disciplinas"
      },
      "professoresRelatos": {
        "group": "Publicações do Site",
        "title": "Relatos sobre Professores",
        "subtitle": "Modere os relatos enviados pelos alunos antes de aparecerem no site.",
        "href": "/admin/professores/relatos"
      },
      "alunos": {
        "group": "Publicações do Site",
        "title": "Alunos que Inspiram",
        "subtitle": "Cadastre, publique e gerencie as conquistas dos estudantes e suas categorias.",
        "href": "/admin/alunos"
      },
      "alunosCategorias": {
        "group": "Publicações do Site",
        "title": "Categorias de Conquista",
        "subtitle": "Cadastre e organize as categorias usadas nas conquistas dos estudantes.",
        "href": "/admin/alunos/categorias"
      },
      "kanban": {
        "group": "Aprovação e Revisão",
        "title": "Fila de Aprovação (Passo a Passo)",
        "subtitle": "Acompanhe as reportagens em rascunho, envie para revisão e publique oficialmente no portal.",
        "href": "/admin/kanban"
      },
      "siteInfo": {
        "group": "Dados e Contatos do Site",
        "title": "Números de Alunos e Escolas",
        "subtitle": "Atualize a quantidade oficial de estudantes, escolas, turmas e municípios atendidos.",
        "href": "/admin/institucional"
      },
      "redes": {
        "group": "Dados e Contatos do Site",
        "title": "Redes Sociais e WhatsApp",
        "subtitle": "Atualize os links oficiais de transmissão, redes sociais e canais de atendimento.",
        "href": "/admin/redes"
      },
      "usuarios": {
        "group": "Usuários e Acessos",
        "title": "Gerenciar Equipe e Senhas",
        "subtitle": "Cadastre operadores por CPF, redefina senhas e gerencie permissões de acesso ao sistema.",
        "href": "/admin/usuarios"
      },
      "estadosCidades": {
        "group": "Dados e Contatos do Site",
        "title": "Estados e Municípios",
        "subtitle": "Cadastre e gerencie a base de unidades federativas (UF) e municípios atendidos pelo MEDTEC.",
        "href": "/admin/estados-cidades"
      }
    };
    assert.deepEqual(SHARED_SECTION_CONFIG, expected);
    assert.deepEqual(Object.keys(SHARED_SECTION_CONFIG), Object.keys(expected));
  });

  it('mantém os dezoito destinos na ordem definida e exclui Início do mapa de redirecionamento', () => {
    assert.deepEqual([...SECTION_HREFS], [
      ['fotos', '/admin/banners'], ['projetos', '/admin/projetos'], ['projetosTemas', '/admin/projetos/temas'], ['projetosMembros', '/admin/projetos/membros'], ['duvidas', '/admin/faq'],
      ['usuarios', '/admin/usuarios'], ['kanban', '/admin/kanban'], ['noticias', '/admin/noticias'],
      ['avisos', '/admin/avisos'], ['galeria', '/admin/galeria'], ['estadosCidades', '/admin/estados-cidades'],
      ['professores', '/admin/professores'], ['professoresDisciplinas', '/admin/professores/disciplinas'],
      ['professoresRelatos', '/admin/professores/relatos'], ['alunos', '/admin/alunos'], ['alunosCategorias', '/admin/alunos/categorias'],
      ['siteInfo', '/admin/institucional'], ['redes', '/admin/redes'],
    ]);
    assert.equal(SECTION_HREFS.has('visaoGeral'), false);
    assert.equal(SHARED_SECTION_CONFIG.visaoGeral.href, '/admin');
    assert.equal(new Set(SECTION_HREFS.values()).size, 18);
  });

  it('preserva exports públicos e compatibilidade dos tipos de seção e props do shell', () => {
    const sharedSection: AdminSection = 'estadosCidades';
    const shellSection: ShellAdminSection = sharedSection;
    const publicProps: AdminShellProps = { activeSection: shellSection, badges: { [sharedSection]: 0 }, children: null };
    assert.equal(publicProps.activeSection, 'estadosCidades');
    assert.strictEqual(SECTION_CONFIG, SHARED_SECTION_CONFIG);
    assert.equal(typeof AdminShell, 'function');
    assert.equal(getFolderIdForSection('estadosCidades'), 'dados');
    assert.equal(canAccessAdminUsers(session), true);
  });

  it('preserva Início como seleção local e os onze router.push na página, no desktop e mobile', () => {
    for (const mobile of [false, true]) {
      const page = capture('page', session, mobile);
      const homes = page.nodes.filter(node => node.props.label === 'Início (Resumo do Painel)');
      assert.equal(homes.length, mobile ? 2 : 1);
      for (const home of homes) home.props.onClick!();
      assert.deepEqual(page.selections, mobile ? ['visaoGeral', 'visaoGeral'] : ['visaoGeral']);
      assert.deepEqual(page.calls, []);
      const folders = page.nodes.filter(node => node.props.folder && node.props.onSelectSection);
      assert.equal(folders.length, mobile ? 8 : 4);
      for (const folder of folders) {
        assert.equal(folder.props.isOpen, false);
        for (const item of folder.props.folder!.items) {
          if (item.visible) folder.props.onSelectSection!(item.section);
        }
      }
      const menuOrder = ['/admin/noticias', '/admin/projetos', '/admin/projetos/temas', '/admin/projetos/membros', '/admin/faq', '/admin/avisos', '/admin/banners',
        '/admin/galeria', '/admin/professores', '/admin/professores/disciplinas', '/admin/professores/relatos', '/admin/alunos', '/admin/alunos/categorias', '/admin/kanban', '/admin/institucional', '/admin/redes', '/admin/estados-cidades', '/admin/usuarios'];
      assert.deepEqual(page.calls, (mobile ? [...menuOrder, ...menuOrder] : menuOrder).map(href => ({ method: 'push', href })));
    }
  });

  it('preserva links e pastas inicialmente abertas no shell e a divergência de Estados/Cidades', () => {
    const desktop = capture('shell', session);
    const desktopHrefs = desktop.nodes.flatMap(node => node.props.href ? [node.props.href] : []);
    assert.deepEqual(desktopHrefs.filter(href => href.startsWith('/admin')),
      ['/admin', '/admin/noticias', '/admin/projetos', '/admin/projetos/temas', '/admin/projetos/membros', '/admin/faq', '/admin/avisos', '/admin/banners', '/admin/galeria', '/admin/professores', '/admin/professores/disciplinas', '/admin/professores/relatos', '/admin/alunos', '/admin/alunos/categorias']);
    assert.match(desktop.html, /<a\b[^>]*href="\/admin"/);
    assert.deepEqual(desktop.calls, []);
    const mobile = capture('shell', session, true);
    const mobileHrefs = mobile.nodes.flatMap(node => node.props.href ? [node.props.href] : []);
    for (const href of SECTION_HREFS.values()) assert.ok(mobileHrefs.includes(href), href);
    assert.equal(mobileHrefs.filter(href => href === '/admin').length, 2);
    assert.equal((mobile.html.match(/placeholder="Pesquisar função ou menu\.\.\."/g) || []).length, 1);
    const root = capture('page', session, true, 'estadosCidades');
    assert.equal((root.html.match(/placeholder="Pesquisar função ou menu\.\.\."/g) || []).length, 2);
    const dataFolders = root.nodes.filter(node => node.props.folder?.id === 'dados');
    assert.equal(dataFolders.length, 2);
    assert.ok(dataFolders.every(node => node.props.isFolderActive === false && node.props.isOpen === false));
    assert.equal(getFolderIdForSection('estadosCidades'), 'dados');
    assert.ok(capture('shell', session, false, 'estadosCidades').html.includes('href="/admin/estados-cidades"'));
  });

  it('preserva diferenças de permissão para sessão local, Administrador inativo e operadores', () => {
    for (const current of [
      { isGestor: true },
      { ...session, apiUser: { ...session.apiUser!, ativo: false } },
    ]) {
      const root = capture('page', current);
      assert.ok(root.nodes.some(node => node.props.folder?.items.some(item => item.section === 'usuarios' && item.visible)));
      const shell = capture('shell', current, true, 'usuarios');
      assert.ok(shell.html.includes('Acesso Restrito'));
      assert.ok(!shell.nodes.some(node => node.props.href === '/admin/usuarios'));
    }
    assert.ok(capture('shell', session, true, 'usuarios').html.includes('Conteúdo autorizado'));
    for (const current of [
      { isGestor: false, profileType: 'Editor de Notícias' },
      { isGestor: false, profileType: 'Operador de Conteúdo' },
      { isGestor: false, profileType: 'Gestor' },
    ]) {
      const root = capture('page', current);
      const items = root.nodes.flatMap(node => node.props.folder?.items.filter(item => item.visible).map(item => item.section) || []);
      assert.equal(items.includes('usuarios'), false);
      assert.equal(items.includes('kanban'), false);
      assert.equal(items.includes('noticias'), current.profileType !== 'Gestor');
      const shell = capture('shell', current, true, 'noticias');
      assert.ok(!shell.nodes.some(node => node.props.href === '/admin/usuarios'));
      assert.ok(!shell.nodes.some(node => node.props.href === '/admin/kanban'));
      assert.ok(shell.nodes.some(node => node.props.href === '/admin/noticias'));
    }
  });

  it('preserva aliases de Início sem redirecionar a página', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    try {
      for (const parameter of ['tab', 'section']) {
        Object.defineProperty(globalThis, 'window', { configurable: true,
          value: { location: { search: '?' + parameter + '=visaoGeral' } } });
        const page = capture('page', session);
        assert.equal(page.effects.length, 1);
        page.effects[0]();
        assert.deepEqual(page.calls, []);
        assert.deepEqual(page.selections, ['visaoGeral']);
      }
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
      else Reflect.deleteProperty(globalThis, 'window');
    }
  });
});


describe('Interface componentizada da Visão Geral', () => {
  function props(overrides: Partial<AdminOverviewProps> = {}): AdminOverviewProps {
    return {
      indicators: {
        loadingNews: false, errorNews: null, totalNews: 450, apiNewsPublishedCount: 400, apiNewsDraftCount: 50,
        loadingAvisos: false, errorAvisos: null, totalAvisos: 231,
        apiAvisosAtivosCount: 200, apiAvisosUrgentesCount: 7, loadingFotos: false, errorFotos: null,
        totalFotos: 280, totalCategorias: 12, usersCountLabel: 120,
        loadingFaqs: false, errorFaqs: null, totalFaqs: 35, apiFaqsPublishedCount: 28, apiFaqsPendingCount: 5,
      },
      userName: 'Gestora de teste',
      latestNews: { titulo: 'Notícia recebida', data_publicacao: '2026-10-30', autor_nome: 'Autoria recebida' },
      announcementTitle: 'Aviso recebido', canAccessKanban: true,
      onOpenNews() {}, onCreateNews() {}, onOpenKanban() {},
      ...overrides,
    };
  }
  function render(overrides: Partial<AdminOverviewProps> = {}) {
    return renderToStaticMarkup(createElement(AdminOverview, props(overrides)));
  }

  it('renderiza os totais preparados, destaques e grades responsivas sem consultar APIs', () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => { requests += 1; throw new Error('Componente visual não consulta dados.'); };
    try {
      const html = render();
      for (const value of ['450', '231', '280', '120', '35']) assert.ok(html.includes('>' + value + '</p>'));
      for (const text of ['Gestora de teste', '400', '50', '12', 'Notícia recebida', 'Autoria recebida', 'Aviso recebido']) {
        assert.ok(html.includes(text), text);
      }
      assert.ok(html.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'));
      assert.ok(html.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-3'));
      assert.equal(requests, 0);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('preserva zero confirmado e os textos vazios sem inserir destaques fictícios', () => {
    const base = props();
    const html = render({ indicators: { ...base.indicators,
      totalNews: 0, apiNewsPublishedCount: 0, apiNewsDraftCount: 0,
      totalAvisos: 0, apiAvisosAtivosCount: 0, apiAvisosUrgentesCount: 0,
      totalFotos: 0, totalCategorias: 0, usersCountLabel: 0,
      totalFaqs: 0, apiFaqsPublishedCount: 0, apiFaqsPendingCount: 0,
    }, latestNews: undefined, announcementTitle: undefined });
    assert.equal((html.match(/>0<\/p>/g) || []).length, 5);
    for (const text of ['Nenhuma matéria cadastrada', 'Nenhuma fotografia catalogada',
      'Nenhuma notícia publicada ainda', 'Indisponível — sem integração oficial',
      'Sem comunicados urgentes no momento', 'Nenhum comunicado urgente ativo', 'Nenhuma dúvida cadastrada']) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(!html.includes('Notícia recebida'));
    assert.ok(!html.includes('Prática recebida'));
  });

  it('mantém carregamento e falha distintos de vazio sem exibir totais antigos nos cards', () => {
    const base = props();
    const loading = render({ indicators: { ...base.indicators,
      loadingNews: true, loadingAvisos: true, loadingFotos: true, loadingFaqs: true, usersCountLabel: '...',
    } });
    assert.ok(loading.includes('Carregando API...'));
    assert.ok(loading.includes('Carregando...'));
    assert.ok(!loading.includes('>450</p>'));
    assert.ok(!loading.includes('Nenhuma matéria cadastrada'));
    for (const text of ['Notícia recebida', 'Autoria recebida', '2026-10-30', 'Aviso recebido', '200 avisos em exibição']) {
      assert.ok(!loading.includes(text), text);
    }
    const failed = render({ indicators: { ...base.indicators,
      errorNews: 'Falha de notícias', errorAvisos: 'Falha de avisos', errorFotos: 'Falha de fotos', errorFaqs: 'Falha de dúvidas', usersCountLabel: 'Indisponível',
    } });
    for (const text of ['Indisponível', 'Galeria Indisponível', 'Falha ao consultar /n_noticias',
      'Falha ao consultar /a_avisos', 'Falha ao consultar /fotos_galeria', 'Falha ao consultar /d_duvidas', 'Falha de comunicação com a API']) {
      assert.ok(failed.includes(text), text);
    }
    assert.ok(!failed.includes('>450</p>'));
    assert.ok(!failed.includes('Nenhuma matéria cadastrada'));
    for (const text of ['Notícia recebida', 'Autoria recebida', '2026-10-30', 'Aviso recebido', '200 avisos em exibição']) {
      assert.ok(!failed.includes(text), text);
    }
  });

  it('identifica cada indicador sem integração e não inventa números ou nomes para preenchê-lo', () => {
    const html = render();
    assert.equal((html.match(/Indisponível — sem integração oficial/g) || []).length, 5);
    for (const text of ['52 Municípios', '4 trilhas', '4 categorias', 'Nenhum projeto cadastrado',
      'Nenhuma dúvida cadastrada', 'missões', 'banners ativos', 'Transmissão ao vivo integrada']) {
      assert.ok(!html.includes(text), text);
    }
    const withoutAuthor = render({ latestNews: { titulo: 'Sem autoria', data_publicacao: '', autor_nome: '' } });
    assert.ok(!withoutAuthor.includes('• SEDUC-RO'));
  });

  it('preserva links de lista e Novo e mantém a ação editorial restrita desabilitada', () => {
    const html = render({ canAccessKanban: false });
    for (const href of ['/admin/projetos', '/admin/projetos?action=new', '/admin/avisos', '/admin/banners',
      '/admin/galeria', '/admin/faq', '/admin/institucional', '/admin/redes', '/admin/usuarios']) {
      assert.ok(html.includes('href="' + href + '"'), href);
    }
    assert.ok(/<button[^>]*disabled=""[^>]*><span>Abrir Fila de Aprovação<\/span>/.test(html));
    assert.equal(SECTION_CONFIG.estadosCidades.href, '/admin/estados-cidades');
    assert.ok(html.includes('target="_blank"'));
    assert.ok(html.includes('rel="noopener noreferrer"'));
  });

  it('encaminha as ações Novo, Notícias e Kanban pelos callbacks recebidos', () => {
    const calls: string[] = [];
    const input = props({
      onOpenNews: () => calls.push('/admin/noticias'),
      onCreateNews: () => calls.push('/admin/noticias?action=new'),
      onOpenKanban: () => calls.push('/admin/kanban'),
    });
    function activateButtons(node: ReactNode) {
      if (Array.isArray(node)) { node.forEach(activateButtons); return; }
      if (!isValidElement<{ children?: ReactNode; disabled?: boolean; onClick?: () => void }>(node)) return;
      if (node.type === 'button' && !node.props.disabled) node.props.onClick?.();
      activateButtons(node.props.children);
    }
    activateButtons(AdminOverview(input));
    activateButtons(OverviewStats({ indicators: input.indicators, onOpenNews: input.onOpenNews }));
    assert.deepEqual(calls, ['/admin/noticias?action=new', '/admin/noticias', '/admin/kanban', '/admin/noticias']);
  });
});

describe('Dados e KPIs isolados da Visão Geral', () => {
  const items: Record<string, object[]> = {
    n_noticias: [{ id: 1, titulo: 'Recebida', status: 'publicada' }, { id: 2, status: 'aguardando' }, { id: 3, status: 'reprovada' }],
    a_avisos: [{ id: 1, ativo: true, a_tipo_aviso: { slug: 'urgente' } },
      { id: 2, ativo: true, a_tipo_aviso: { nome: 'Comunicado Urgente' } }, { id: 3, ativo: false }],
    fotos_galeria: [{ id: 1 }], categorias_galeria: [{ id: 1 }], g_estados: [{ id: 1 }],
    usuarios: Array.from({ length: 50 }, (_, index) => ({ id: index + 1 })),
    d_duvidas: [{ id: 1, pergunta: 'Como funciona?', resposta: 'Resposta oficial.', d_categoria_duvida_id: 2, categoria_nome: 'Inscrições', status: 'publicada', status_nome: 'Publicada', autor_nome: 'Coordenação' }],
  };
  const totals: Record<string, number> = {
    n_noticias: 80, a_avisos: 90, fotos_galeria: 280, categorias_galeria: 12, g_estados: 27, usuarios: 120, d_duvidas: 35,
  };
  function json(value: unknown, status = 200) {
    return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
  }
  function serve(url: string, empty = false) {
    const parsed = new URL(url, 'http://test');
    const endpoint = parsed.pathname.split('/').pop()!;
    assert.ok(endpoint in items, `Endpoint inesperado: ${endpoint}`);
    const statusFilter = parsed.searchParams.get('q[n_status_noticia_slug_eq]');
    const totalCount = empty
      ? 0
      : endpoint === 'd_duvidas' && statusFilter === 'aguardando'
        ? 5
        : endpoint === 'd_duvidas' && statusFilter === 'publicada'
          ? 28
          : totals[endpoint];
    return json({ success: true, data: {
      items: empty ? [] : items[endpoint],
      pagination: { total_count: totalCount, current_page: 1, total_pages: 1, per_page: 1 },
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
      assert.equal(metrics.totalFaqs, 35);
      assert.equal(metrics.apiFaqsPendingCount, 5);
      assert.equal(metrics.apiFaqsPublishedCount, 28);
      assert.equal(metrics.apiNewsPublishedCount, 1);
      assert.equal(metrics.apiNewsDraftCount, 1);
      assert.equal(metrics.apiAvisosAtivosCount, 2);
      assert.equal(metrics.apiAvisosUrgentesCount, 2);
      assert.equal(queries.length, 9);
      assert.deepEqual([...new Set(queries.map((url) => url.pathname.split('/').pop()))].sort(), Object.keys(items).sort());
      assert.ok(!queries.some((url) => url.pathname === '/api/data'));
      for (const key of ['legacy', 'projectsCount', 'projectMunicipalities', 'bannersCount', 'faqsCount']) {
        assert.ok(!(key in metrics));
        assert.ok(!(key in state));
      }
      for (const endpoint of ['usuarios', 'fotos_galeria', 'categorias_galeria', 'g_estados', 'd_duvidas']) {
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

  it('abre o dashboard autenticado sem dados locais e preserva os onze destinos e a autorização do Kanban', () => {
    const originalState = React.useState;
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => { requests += 1; throw new Error('Renderização não consulta a API.'); };
    try {
      for (const editorialProfile of ['Administrador', undefined]) {
        let loginInjected = false;
        const stateMock = mock.method(React, 'useState', (initial: unknown) => {
          // Injeta somente o estado inicial; os hooks e a renderização continuam reais.
          if (initial === false && !loginInjected) { loginInjected = true; return originalState(true); }
          if (initial && typeof initial === 'object' && 'isGestor' in initial) {
            return originalState({ isGestor: true, name: 'Sessão confirmada', editorialProfile });
          }
          return originalState(initial);
        });
        const destinations: string[] = [];
        const router = { back() {}, forward() {}, refresh() {}, push(href: string) { destinations.push(href); },
          replace() {}, prefetch() {}, bfcacheId: 'overview-authenticated-test' };
        let page: ReactNode;
        function CapturePage() { page = AdminDashboardPage(); return page; }
        try {
          const html = renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(CapturePage)));
          assert.ok(html.includes('Painel do Gestor • Central Executiva CMS'));
          assert.ok(html.includes('Carregando API...'));
          assert.ok(html.includes('Indisponível — sem integração oficial'));
          assert.ok(!html.includes('Autenticando e carregando painel de gestão...'));
          type NavigationProps = { children?: ReactNode; folder?: { items: { section: string; badge?: number; visible: boolean }[] };
            onSelectSection?: (section: string) => void; canAccessKanban?: boolean };
          let overviewFound = false;
          function visit(node: ReactNode) {
            if (Array.isArray(node)) { node.forEach(visit); return; }
            if (!isValidElement<NavigationProps>(node)) return;
            if (node.type === AdminOverview) {
              overviewFound = true;
              assert.equal(node.props.canAccessKanban, editorialProfile === 'Administrador');
            }
            if (node.props.folder && node.props.onSelectSection) {
              for (const item of node.props.folder.items) {
                assert.equal(item.badge, undefined, item.section);
                if (item.visible) node.props.onSelectSection(item.section);
              }
            }
            visit(node.props.children);
          }
          visit(page);
          assert.equal(overviewFound, true);
          const expected = ['/admin/noticias', '/admin/projetos', '/admin/projetos/temas', '/admin/projetos/membros', '/admin/faq', '/admin/avisos', '/admin/banners',
            '/admin/galeria', '/admin/professores', '/admin/professores/disciplinas', '/admin/professores/relatos', '/admin/alunos', '/admin/alunos/categorias', '/admin/institucional', '/admin/redes', '/admin/estados-cidades', '/admin/usuarios'];
          if (editorialProfile === 'Administrador') expected.push('/admin/kanban');
          assert.deepEqual([...new Set(destinations)].sort(), expected.sort());
        } finally { stateMock.mock.restore(); }
      }
      assert.equal(requests, 0);
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
      for (const value of [metrics.totalUsers, metrics.totalNews, metrics.totalAvisos, metrics.totalFotos, metrics.totalCategorias, metrics.totalEstados, metrics.totalFaqs, metrics.apiFaqsPendingCount, metrics.apiFaqsPublishedCount]) {
        assert.equal(value, 0);
      }
      assert.equal(metrics.usersCountLabel, 0);
      assert.equal(state.users.loading, false);
      assert.equal(state.users.error, null);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('preserva tab, section e os parâmetros de criação nos aliases administrativos existentes', () => {
    const calls: string[] = [];
    const router = { back() {}, forward() {}, refresh() {}, push(href: string) { calls.push(href); },
      replace(href: string) { calls.push(href); }, prefetch() {}, bfcacheId: 'overview-alias-test' };
    const effects: React.EffectCallback[] = [];
    const effectMock = mock.method(React, 'useEffect', (effect: React.EffectCallback, dependencies?: React.DependencyList) => {
      const dependency = dependencies?.[0];
      if (dependency && typeof dependency === 'object' &&
        'push' in dependency && dependency.push === router.push) effects.push(effect);
    });
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    try {
      renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(AdminDashboardPage)));
      assert.equal(effects.length, 1);
      const routes = { noticias: '/admin/noticias', projetos: '/admin/projetos', duvidas: '/admin/faq', faq: '/admin/faq',
        avisos: '/admin/avisos', fotos: '/admin/banners', banners: '/admin/banners', galeria: '/admin/galeria',
        kanban: '/admin/kanban', siteInfo: '/admin/institucional', redes: '/admin/redes',
        estadosCidades: '/admin/estados-cidades', usuarios: '/admin/usuarios' };
      for (const parameter of ['tab', 'section']) {
        for (const [alias, target] of Object.entries(routes)) {
          const variants = [alias];
          if (['noticias', 'projetos', 'duvidas', 'faq'].includes(alias)) variants.push(alias + '&action=new');
          if (alias === 'noticias') for (const mode of ['editor', 'new', 'nova']) variants.push(alias + '&mode=' + mode);
          for (const variant of variants) {
            calls.length = 0;
            Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { search: '?' + parameter + '=' + variant } } });
            effects.length = 0;
            renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(AdminDashboardPage)));
            assert.equal(effects.length, 1);
            effects[0]();
            const creates = variant.includes('&') && ['noticias', 'projetos'].includes(alias);
            assert.deepEqual(calls, [target + (creates ? '?action=new' : '')], parameter + '=' + variant);
          }
        }
      }
    } finally {
      effectMock.mock.restore();
      if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor);
      else Reflect.deleteProperty(globalThis, 'window');
    }
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
      assert.equal(requests.length, 9);
      assert.equal(new Set(requests).size, 9);
      assert.ok(!requests.some((url) => /perfis|a_tipos_aviso|canais_contato/.test(url)));
      await read(true);
      assert.equal(requests.length, 18);
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
      const pending = getOverviewMetrics(loading);
      for (const [key, value] of Object.entries(pending)) {
        if (key !== 'usersCountLabel') assert.equal(value, null, key);
      }
      assert.deepEqual(getOverviewHighlights(loading), { latestNews: undefined, announcementTitle: undefined });
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
      assert.equal(getOverviewMetrics(after).totalUsers, null);
      assert.equal(getOverviewMetrics(after).totalNews, null);
      assert.equal(getOverviewMetrics(after).apiNewsPublishedCount, null);
      assert.equal(getOverviewMetrics(after).totalFotos, 280);
      assert.equal(getOverviewHighlights(after).latestNews, undefined);
      assert.equal(after.news.data, previous.news.data);
      assert.ok(after.news.error?.includes('API inacessível'));
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

  it('preserva a primeira notícia e a prioridade do primeiro aviso urgente ativo, sem alterar regras editoriais', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (input) => {
        if (String(input).includes('/n_noticias')) return json({ success: true, data: {
          items: [{ titulo: 'Primeira, ainda aguardando', status: 'aguardando', autor_nome: 'Autoria oficial', data_publicacao: '2099-01-01' },
            { titulo: 'Publicada futura', status: 'publicada', data_publicacao: '2099-01-02' }], pagination: { total_count: 2 },
        } });
        if (String(input).includes('/a_avisos')) return json({ success: true, data: {
          items: [{ titulo: 'Primeiro comum', ativo: true },
            { titulo: 'Urgente inativo', ativo: false, a_tipo_aviso: { slug: 'urgente' } },
            { titulo: 'Urgente por nome', ativo: true, a_tipo_aviso: { nome: 'Comunicado URGENTE' } },
            { titulo: 'Urgente por slug posterior', ativo: true, a_tipo_aviso: { slug: 'urgente' } }], pagination: { total_count: 4 },
        } });
        return serve(String(input));
      };
      const snapshot = await createAdminOverviewLoader()(true);
      assert.ok(snapshot);
      const state = applyOverviewSnapshot(createInitialOverviewState(), snapshot);
      assert.deepEqual(getOverviewHighlights(state), {
        latestNews: { titulo: 'Primeira, ainda aguardando', autor_nome: 'Autoria oficial', data_publicacao: '2099-01-01' },
        announcementTitle: 'Urgente por nome',
      });
      assert.equal(getOverviewMetrics(state).apiNewsPublishedCount, 1);
      assert.equal(getOverviewMetrics(state).apiNewsDraftCount, 1);
      assert.equal(getOverviewMetrics(state).apiAvisosAtivosCount, 3);
      assert.equal(getOverviewMetrics(state).apiAvisosUrgentesCount, 2);
      const noUrgent = { ...state, avisos: { ...state.avisos, data: {
        items: [{ ...state.avisos.data!.items[0], ativo: false }], total: 1,
      } } };
      assert.equal(getOverviewHighlights(noUrgent).announcementTitle, 'Primeiro comum');
      assert.deepEqual(getOverviewHighlights(createInitialOverviewState()), { latestNews: undefined, announcementTitle: undefined });
    } finally { globalThis.fetch = originalFetch; }
  });

  it('isola a falha de cada um dos seis endpoints e recupera os indicadores sem perder a navegação', async () => {
    const originalFetch = globalThis.fetch;
    try {
      const resources = { n_noticias: 'news', a_avisos: 'avisos', fotos_galeria: 'gallery',
        categorias_galeria: 'gallery', usuarios: 'users', g_estados: 'states', d_duvidas: 'faqs' } as const;
      for (const [endpoint, failedResource] of Object.entries(resources)) {
        globalThis.fetch = async (input) => String(input).includes('/' + endpoint)
          ? json({ success: false, message: 'Serviço indisponível' }, 503) : serve(String(input));
        const read = createAdminOverviewLoader();
        const snapshot = await read(true);
        assert.ok(snapshot);
        const state = applyOverviewSnapshot(createInitialOverviewState(), snapshot);
        for (const [key, resource] of Object.entries(state)) {
          assert.equal(resource.loading, false, key);
          if (key === failedResource) { assert.ok(resource.error); assert.equal(resource.data, null); }
          else { assert.equal(resource.error, null); assert.notEqual(resource.data, null); }
        }
        const html = renderToStaticMarkup(createElement(AdminOverview, {
          indicators: { ...getOverviewMetrics(state), loadingNews: false, errorNews: state.news.error,
            loadingAvisos: false, errorAvisos: state.avisos.error, loadingFotos: false, errorFotos: state.gallery.error,
            loadingFaqs: false, errorFaqs: state.faqs.error },
          ...getOverviewHighlights(state), canAccessKanban: true,
          onOpenNews() {}, onCreateNews() {}, onOpenKanban() {},
        }));
        for (const href of ['/admin/projetos', '/admin/faq', '/admin/banners', '/admin/usuarios', '/admin/avisos', '/admin/galeria']) {
          assert.ok(html.includes('href="' + href + '"'), href);
        }
        globalThis.fetch = async (input) => serve(String(input));
        const recovered = await read(true);
        assert.ok(recovered);
        const after = applyOverviewSnapshot(startOverviewLoading(state), recovered);
        assert.equal(after[failedResource].error, null);
        assert.equal(getOverviewMetrics(after).totalUsers, 120);
        assert.equal(getOverviewMetrics(after).totalNews, 80);
        assert.equal(getOverviewMetrics(after).totalFotos, 280);
        assert.equal(getOverviewMetrics(after).totalFaqs, 35);
      }
    } finally { globalThis.fetch = originalFetch; }
  });

  it('mantém os atalhos e a indisponibilidade explícita quando toda a API falha', async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const status of [401, 503, 'offline']) {
        globalThis.fetch = async () => {
          if (status === 'offline') throw new Error('Rede indisponível');
          return json({ success: false, message: 'API indisponível' }, Number(status));
        };
        const snapshot = await createAdminOverviewLoader()(true);
        assert.ok(snapshot);
        const state = applyOverviewSnapshot(createInitialOverviewState(), snapshot);
        for (const resource of Object.values(state)) {
          assert.ok(resource.error);
          assert.equal(resource.loading, false);
          assert.equal(resource.data, null);
        }
        const html = renderToStaticMarkup(createElement(AdminOverview, {
          indicators: { ...getOverviewMetrics(state), loadingNews: false, errorNews: state.news.error,
            loadingAvisos: false, errorAvisos: state.avisos.error, loadingFotos: false, errorFotos: state.gallery.error,
            loadingFaqs: false, errorFaqs: state.faqs.error },
          ...getOverviewHighlights(state), canAccessKanban: false,
          onOpenNews() {}, onCreateNews() {}, onOpenKanban() {},
        }));
        assert.ok(html.includes('Painel do Gestor • Central Executiva CMS'));
        assert.ok(html.includes('Indisponível — sem integração oficial'));
        assert.ok(html.includes('href="/admin/usuarios"'));
        assert.ok(!html.includes('>0</p>'));
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
        JSON.stringify({ ...source, siteInfo: {} }), JSON.stringify({ ...source, siteInfo: { heroImage: 1, studioImage: '/studio.jpg' } }),
        JSON.stringify({ ...source, siteInfo: { heroImage: '/hero.jpg' } })]) {
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
    return renderToStaticMarkup(createElement(SitePhotosManager, bannerManagerProps({
      banners,
      siteInfo: { heroImage: '/hero-recebido.jpg', studioImage: '/estudio-recebido.jpg' },
      news: [{ id: 1, title: 'Capa recebida', coverImage: '/capa-recebida.jpg', status: 'aguardando', statusName: 'Aguardando aprovação', publicationDate: null }],
      gallery: [{ id: 1, title: 'Foto recebida', imageUrl: '/foto-recebida.jpg', category: null }],
    }, saving)));
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

describe('Banners sem uploads ou gravações sem persistência', () => {
  const source = bannerManagerProps({
    banners: [
      { id: 'banner-1', title: 'Primeiro banner', imageUrl: '/banners/primeiro.svg', linkUrl: '#primeiro' },
      { id: 'banner-2', title: 'Segundo banner', imageUrl: '/uploads/existente.png', linkUrl: '/segundo' },
    ],
    siteInfo: { heroImage: '/hero-existente.jpg', studioImage: '/estudio-existente.jpg' },
    news: [{ id: 1, title: 'Notícia existente', coverImage: '/capa-existente.jpg', status: 'aguardando', statusName: 'Aguardando aprovação', publicationDate: null }],
    gallery: [{ id: 1, title: 'Foto existente', imageUrl: '/foto-existente.jpg', category: null }],
  });
  type ControlProps = {
    children?: ReactNode; type?: string; name?: string; disabled?: boolean; 'aria-label'?: string;
    onClick?: () => void;
    onChange?: (event: { target: { files?: File[]; value: string } }) => void;
    onSubmit?: (event: { preventDefault(): void }) => void;
  };
  async function withManager(run: (manager: {
    render(): string;
    controls(): React.ReactElement<ControlProps>[];
    requests: string[];
    data: typeof source;
  }) => Promise<void> | void) {
    const originalFetch = globalThis.fetch;
    const originalState = React.useState;
    const states: unknown[] = [];
    const data = { ...source, local: { ...source.local, data: structuredClone(source.local.data) },
      news: { ...source.news, data: structuredClone(source.news.data) }, gallery: { ...source.gallery, data: structuredClone(source.gallery.data) } };
    const requests: string[] = [];
    let capturing = false;
    let cursor = 0;
    let tree: ReactNode;
    globalThis.fetch = async (input, options) => {
      requests.push(`${options?.method || 'GET'} ${String(input)}`);
      throw new Error('O gerenciador consultivo não deve enviar requisições.');
    };
    // Conserva o estado do gerenciador entre renderizações; os componentes visuais usam seus hooks reais.
    const stateMock = mock.method(React, 'useState', (initial: unknown) => {
      if (!capturing) return originalState(initial);
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      const state: [unknown, React.Dispatch<React.SetStateAction<unknown>>] = [states[index], (next) => {
        states[index] = typeof next === 'function' ? next(states[index]) : next;
      }];
      return state;
    });
    function Capture() {
      cursor = 0;
      capturing = true;
      try { tree = SitePhotosManager(data); }
      finally { capturing = false; }
      return tree;
    }
    function controls() {
      const result: React.ReactElement<ControlProps>[] = [];
      function visit(node: ReactNode) {
        if (Array.isArray(node)) { node.forEach(visit); return; }
        if (!isValidElement<ControlProps>(node)) return;
        if (typeof node.type === 'function' && ['BannerCarousel', 'PhotoSlot', 'FileButton'].includes(node.type.name)) {
          // Expande os três componentes internos sem hooks para acionar seus controles reais.
          visit((node.type as (props: ControlProps) => ReactNode)(node.props));
          return;
        }
        if (typeof node.type === 'string') result.push(node);
        visit(node.props.children);
      }
      visit(tree);
      return result;
    }
    try {
      const render = () => renderToStaticMarkup(createElement(Capture));
      render();
      await run({ render, controls, requests, data });
      assert.deepEqual(data, source, 'As coleções, identificadores, ordem e URLs recebidos não podem mudar.');
      assert.deepEqual(requests, [], 'Não pode haver POST /api/upload, PUT /api/data ou escrita Rails.');
    } finally {
      stateMock.mock.restore();
      globalThis.fetch = originalFetch;
    }
  }

  for (const [area, label] of [['estúdio', 'Enviar do computador'], ['notícia', 'Trocar capa'], ['galeria', 'Trocar foto']]) {
    it(`bloqueia a seleção e o envio da imagem de ${area}, inclusive sem saving ativo`, async () => {
      await withManager(async ({ controls, requests, render }) => {
        const input = controls().find((node) => node.type === 'input' && node.props['aria-label'] === label);
        assert.ok(input, label);
        assert.equal(input.props.disabled, true);
        const target = { files: [new File(['imagem'], 'nova.png', { type: 'image/png' })], value: 'nova.png' };
        input.props.onChange?.({ target });
        await new Promise<void>((resolve) => setImmediate(resolve));
        assert.equal(input.props.onChange, undefined);
        assert.deepEqual(requests, []);
        const html = render();
        for (const path of ['/estudio-existente.jpg', '/capa-existente.jpg', '/foto-existente.jpg']) assert.ok(html.includes(path));
        assert.ok(html.includes('Edição indisponível'));
      });
    });
  }

  it('mantém ações de gravação desabilitadas e neutraliza submissões sem alterar os registros', async () => {
    await withManager(({ controls, render }) => {
      const before = render();
      const buttons = controls().filter((node) => node.type === 'button' && node.props['aria-label'] !== 'Ver prévia no site');
      assert.equal(buttons.length, 10);
      for (const button of buttons) {
        assert.equal(button.props.disabled, true);
        button.props.onClick?.();
        assert.equal(button.props.onClick, undefined);
      }
      let prevented = 0;
      const forms = controls().filter((node) => node.type === 'form');
      assert.equal(forms.length, 4);
      for (const form of forms) form.props.onSubmit?.({ preventDefault() { prevented += 1; } });
      assert.equal(prevented, forms.length);
      for (const input of controls().filter((node) => node.type === 'input' && node.props.type !== 'file')) {
        assert.equal(input.props.disabled, true);
        input.props.onChange?.({ target: { value: 'https://example.test/nao-salvar' } });
        assert.equal(input.props.onChange, undefined);
      }
      assert.equal(render(), before);
    });
  });

  it('mantém prévia e modal dos banners existentes sem enviar arquivos ou alterar URLs', async () => {
    await withManager(({ controls, render }) => {
      const preview = controls().find((node) => node.type === 'button' && node.props['aria-label'] === 'Ver prévia no site');
      assert.ok(preview?.props.onClick);
      assert.ok(!preview.props.disabled);
      preview.props.onClick();
      const html = render();
      assert.ok(html.includes('role="dialog"'));
      assert.ok(html.includes('/banners/primeiro.svg'));
      assert.ok(html.includes('Primeiro banner'));
      assert.ok(html.includes('#primeiro'));
      assert.ok(html.includes('Desktop'));
      assert.ok(html.includes('Celular'));
    });
  });

  it('aciona a seleção local, exibe a imagem no simulador e no modal e mantém as validações', async () => {
    const originalReader = Object.getOwnPropertyDescriptor(globalThis, 'FileReader');
    let reads = 0;
    class LocalReader {
      result = 'data:image/png;base64,cHJldmlh';
      onload: (() => void) | null = null;
      readAsDataURL() { reads += 1; queueMicrotask(() => this.onload?.()); }
    }
    Object.defineProperty(globalThis, 'FileReader', { configurable: true, value: LocalReader });
    try {
      await withManager(async ({ controls, render }) => {
        const input = controls().find((node) => node.type === 'input' && node.props['aria-label'] === 'Selecionar banner para prévia local');
        assert.ok(input?.props.onChange);
        assert.equal(input.props.disabled, false);
        const target = { files: [new File(['imagem'], 'previa.png', { type: 'image/png' })], value: 'previa.png' };
        input.props.onChange({ target });
        assert.equal(target.value, '');
        await new Promise<void>((resolve) => setImmediate(resolve));
        const html = render();
        assert.ok(html.includes('role="dialog"'));
        assert.ok((html.match(/data:image\/png;base64,cHJldmlh/g) || []).length >= 2);
        assert.ok(html.includes('previa.png'));
        assert.ok(html.includes('A imagem local não foi salva nem publicada.'));
        assert.equal(reads, 1);
        for (const file of [new File(['svg'], 'vetor.svg', { type: 'image/svg+xml' }),
          new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' })]) {
          input.props.onChange({ target: { files: [file], value: file.name } });
          await new Promise<void>((resolve) => setImmediate(resolve));
          assert.ok(render().includes('role="alert"'));
        }
        assert.equal(reads, 1, 'Arquivos inválidos não devem ser lidos.');
        assert.ok(render().includes('data:image/png;base64,cHJldmlh'));
      });
    } finally {
      if (originalReader) Object.defineProperty(globalThis, 'FileReader', originalReader);
      else Reflect.deleteProperty(globalThis, 'FileReader');
    }
  });
});

describe('Acervos oficiais independentes no gerenciador de Banners', () => {
  const local = { banners: [{ id: 'banner-original', title: 'Banner original', imageUrl: '/banner-original.svg', linkUrl: '#original' }],
    siteInfo: { heroImage: '/hero-original.jpg', studioImage: '/studio-original.jpg' },
    news: [{ title: 'Notícia local proibida' }], gallery: [{ title: 'Foto local proibida' }] };
  const news = [
    { id: 1, titulo: 'Notícia oficial aguardando', imagem_capa: '/rails/active_storage/capa.png', status: 'aguardando', status_nome: 'Aguardando aprovação', data_publicacao: '2099-01-01' },
    { id: 2, titulo: 'Notícia oficial sem capa', imagem_capa: null, status: 'publicada', status_nome: 'Publicada', data_publicacao: '2099-01-02' },
  ];
  const photos = [
    { id: 1, titulo: 'Foto oficial', imagem: '/rails/active_storage/foto.png', imagem_url: 'https://example.test/nao-priorizar.png',
      categoria_galeria: { id: 7, nome: 'Categoria recebida', ativo: false } },
    { id: 2, titulo: 'Foto externa', imagem: null, imagem_url: 'https://example.test/foto.png' },
    { id: 3, titulo: 'Foto sem imagem', imagem: null, imagem_url: null },
  ];
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const envelope = (items: unknown[], total = items.length) => ({ success: true, data: {
    items, pagination: { total_count: total, current_page: 1, total_pages: 1, per_page: items.length },
  } });
  function serve(input: string) {
    if (input === '/api/data') return json(local);
    const endpoint = new URL(input).pathname.split('/').pop();
    if (endpoint === 'n_noticias') return json(envelope(news));
    if (endpoint === 'fotos_galeria') return json(envelope(photos));
    throw new Error('Endpoint inesperado: ' + input);
  }
  const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

  it('retém apenas os campos locais necessários e ignora acervos locais ausentes ou inválidos', async () => {
    const original = globalThis.fetch;
    try {
      for (const extras of [{}, { news: null, gallery: 'inválida' }, { news: [{ id: 99 }], gallery: [{}] }]) {
        globalThis.fetch = async () => json({ banners: local.banners, siteInfo: local.siteInfo, ...extras });
        assert.deepEqual(await readAdminBanners(), { banners: local.banners, siteInfo: local.siteInfo });
      }
    } finally { globalThis.fetch = original; }
  });

  it('consulta somente os dois serviços autenticados com page=all, IDs oficiais e URLs conforme o contrato', async () => {
    const original = globalThis.fetch;
    const requests: string[] = [];
    setStoredTokens({ access_token: 'token-acervos', refresh_token: 'refresh-acervos' });
    globalThis.fetch = async (input, options) => {
      assert.equal(options?.method, 'GET');
      assert.equal(new Headers(options.headers).get('Authorization'), 'Bearer token-acervos');
      const url = new URL(String(input));
      assert.equal(url.searchParams.get('page'), 'all');
      requests.push(url.pathname.split('/').pop()!);
      return serve(String(input));
    };
    try {
      const [covers, gallery] = await Promise.all([readBannerNews(), readBannerGallery()]);
      assert.deepEqual(requests.sort(), ['fotos_galeria', 'n_noticias']);
      assert.equal(covers.total, 2);
      assert.deepEqual(covers.items[0], { id: 1, title: news[0].titulo, coverImage: getMediaUrl(news[0].imagem_capa),
        status: 'aguardando', statusName: 'Aguardando aprovação', publicationDate: '2099-01-01' });
      assert.equal(covers.items[1].coverImage, null);
      assert.equal(gallery.total, 3);
      assert.equal(gallery.items[0].id, 1);
      assert.equal(gallery.items[0].imageUrl, getMediaUrl(photos[0].imagem));
      assert.deepEqual(gallery.items[0].category, { id: 7, name: 'Categoria recebida', active: false });
      assert.equal(gallery.items[1].imageUrl, 'https://example.test/foto.png');
      assert.equal(gallery.items[2].imageUrl, null);
      assert.equal(gallery.items[2].category, null);
    } finally { clearStoredTokens(); globalThis.fetch = original; }
  });

  it('aceita zero oficial e rejeita paginação incompleta, envelopes inválidos e identificadores ambíguos', async () => {
    const original = globalThis.fetch;
    try {
      globalThis.fetch = async () => json(envelope([]));
      assert.deepEqual(await readBannerNews(), { items: [], total: 0 });
      assert.deepEqual(await readBannerGallery(), { items: [], total: 0 });
      for (const reader of [readBannerNews, readBannerGallery]) {
        for (const body of [null, {}, { success: false, data: { items: [] } }, envelope([], 1), envelope([], -1),
          envelope([{ id: '1' }]), envelope([{ id: 1 }, { id: 1 }]), envelope([null]), envelope([{ id: 1, titulo: 9 }]),
          { success: true, data: { items: [], pagination: { total_count: '0' } } }]) {
          globalThis.fetch = async () => json(body);
          await assert.rejects(reader(), /inválid|incomplet|duplicad/);
        }
      }
      globalThis.fetch = async () => json(envelope(news, 3));
      await assert.rejects(readBannerNews(), /incompleta/);
    } finally { globalThis.fetch = original; }
  });

  it('preserva falhas 401 e 403 sem fallback local ou tentativa de endpoints públicos', async () => {
    const original = globalThis.fetch;
    try {
      for (const status of [401, 403, 503]) {
        const requests: string[] = [];
        globalThis.fetch = async (input, options) => {
          requests.push(String(input)); assert.equal(options?.method, 'GET');
          return json({ success: false, message: 'Consulta recusada', errors: [status === 403 ? 'sem_permissao' : 'nao_autenticado'] }, status);
        };
        for (const reader of [readBannerNews, readBannerGallery]) {
          await assert.rejects(reader(), (error) => error instanceof ApiError && error.status === status);
        }
        assert.equal(requests.length, 2);
        assert.ok(!requests.some((url) => url.includes('/api/data') || url.includes('/publico/')));
      }
    } finally { globalThis.fetch = original; }
  });

  it('reutiliza o refresh existente sem executar operações de escrita nas entidades', async () => {
    const original = globalThis.fetch;
    const requests: string[] = [];
    setStoredTokens({ access_token: 'expirado', refresh_token: 'refresh-valido' });
    globalThis.fetch = async (input, options) => {
      const url = String(input); requests.push(`${options?.method} ${url}`);
      if (url.includes('/auth/refresh_token')) {
        assert.equal(options?.method, 'POST');
        return json({ success: true, data: { access_token: 'renovado', refresh_token: 'refresh-novo' } });
      }
      assert.equal(options?.method, 'GET');
      return new Headers(options.headers).get('Authorization') === 'Bearer expirado'
        ? json({ success: false, errors: ['token_expirado'] }, 401) : serve(url);
    };
    try {
      assert.equal((await readBannerNews()).total, 2);
      assert.equal(requests.length, 3);
      assert.equal(requests.filter((request) => request.startsWith('POST')).length, 1);
      assert.ok(requests.find((request) => request.startsWith('POST'))?.includes('/auth/refresh_token'));
    } finally { clearStoredTokens(); globalThis.fetch = original; }
  });

  type ManagerProps = Parameters<typeof SitePhotosManager>[0];
  async function withPage(fetcher: typeof fetch, run: (page: {
    render(): string; props(): ManagerProps; unmount(): void; updates(): number;
  }) => Promise<void>) {
    const originalFetch = globalThis.fetch;
    const originalState = React.useState;
    const originalEffect = React.useEffect;
    const states: unknown[] = [];
    type Effect = { callback: React.EffectCallback; dependencies?: React.DependencyList; cleanup?: () => void };
    let effects: Effect[] = [];
    let nextEffects: Effect[] = [];
    let capturing = false;
    let cursor = 0;
    let updates = 0;
    let disposed = false;
    let managerProps: ManagerProps;
    const shell: React.ReactElement<{ children: () => React.ReactElement }> = AdminBannersSubroutePage();
    const Content = shell.props.children().type as () => ReactNode;
    globalThis.fetch = fetcher;
    const stateMock = mock.method(React, 'useState', (initial: unknown) => {
      if (!capturing) return originalState(initial);
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      const state: [unknown, React.Dispatch<React.SetStateAction<unknown>>] = [states[index], (next) => {
        updates += 1; states[index] = typeof next === 'function' ? next(states[index]) : next;
      }];
      return state;
    });
    const effectMock = mock.method(React, 'useEffect', (callback: React.EffectCallback, dependencies?: React.DependencyList) => {
      if (capturing) nextEffects.push({ callback, dependencies });
      else originalEffect(callback, dependencies);
    });
    function Capture() {
      cursor = 0; capturing = true;
      let tree: ReactNode;
      try { tree = Content(); } finally { capturing = false; }
      function visit(node: ReactNode) {
        if (Array.isArray(node)) { node.forEach(visit); return; }
        if (!isValidElement<{ children?: ReactNode }>(node)) return;
        if (node.type === SitePhotosManager) managerProps = node.props as ManagerProps;
        visit(node.props.children);
      }
      visit(tree);
      return tree;
    }
    function render() {
      assert.equal(disposed, false);
      nextEffects = [];
      const html = renderToStaticMarkup(createElement(Capture));
      effects = nextEffects.map((effect, index) => {
        const previous = effects[index];
        if (previous && effect.dependencies?.every((value, i) => Object.is(value, previous.dependencies?.[i]))) return previous;
        previous?.cleanup?.();
        const cleanup = effect.callback();
        return { ...effect, cleanup: typeof cleanup === 'function' ? cleanup : undefined };
      });
      return html;
    }
    function unmount() { if (!disposed) { disposed = true; effects.forEach((effect) => effect.cleanup?.()); } }
    try { render(); await run({ render, props: () => managerProps, unmount, updates: () => updates }); }
    finally { unmount(); effectMock.mock.restore(); stateMock.mock.restore(); globalThis.fetch = originalFetch; }
  }

  it('carrega banners e fotos mesmo com Notícias pendentes e repete somente o acervo recusado', async () => {
    const counts = { local: 0, news: 0, gallery: 0 };
    let finishNews!: (response: Response) => void;
    await withPage(async (input, options) => {
      assert.equal(options?.method, 'GET');
      const url = String(input);
      if (url === '/api/data') counts.local += 1;
      else if (url.includes('/n_noticias')) { counts.news += 1; if (counts.news === 1) return new Promise((resolve) => { finishNews = resolve; }); }
      else counts.gallery += 1;
      return serve(url);
    }, async (page) => {
      await tick();
      let html = page.render();
      assert.ok(html.includes('Banner original'));
      assert.ok(html.includes('Foto oficial'));
      assert.ok(html.includes('Carregando Notícias'));
      assert.ok(!html.includes('Notícia local proibida'));
      finishNews(json({ success: false, errors: ['sem_permissao'] }, 403));
      await tick(); html = page.render();
      assert.ok(html.includes('Sem permissão para consultar Notícias'));
      assert.ok(html.includes('Foto oficial'));
      page.props().news.retry();
      assert.ok(page.render().includes('Carregando Notícias'));
      await tick(); html = page.render();
      assert.ok(html.includes('Notícia oficial aguardando'));
      assert.ok(html.includes('data-resource-id="noticia:1"'));
      assert.ok(html.includes('data-resource-id="galeria:1"'));
      assert.ok(html.includes('Aguardando aprovação'));
      assert.ok(html.includes('2099-01-01'));
      assert.ok(html.includes('Categoria recebida'));
      assert.ok(html.includes('— inativa'));
      assert.ok(html.includes('Capa não informada.'));
      assert.ok(html.includes('Imagem não informada.'));
      assert.deepEqual(counts, { local: 1, news: 2, gallery: 1 });
    });
  });

  for (const resource of ['local', 'news', 'gallery'] as const) {
    it(`isola erro e recarga de ${resource}, preserva cache sem exibi-lo como atual e recupera somente esse recurso`, async () => {
      let failure = false;
      const counts = { local: 0, news: 0, gallery: 0 };
      await withPage(async (input, options) => {
        assert.equal(options?.method, 'GET');
        const key = String(input) === '/api/data' ? 'local' : String(input).includes('/n_noticias') ? 'news' : 'gallery';
        counts[key] += 1;
        return failure && key === resource ? json({ success: false, errors: ['falha'] }, 503) : serve(String(input));
      }, async (page) => {
        await tick(); page.render();
        const previous = page.props()[resource].data;
        failure = true; page.props()[resource].retry();
        const pending = page.render();
        assert.equal(page.props()[resource].data, previous);
        const text = { local: 'Banner original', news: 'Notícia oficial aguardando', gallery: 'Foto oficial' };
        assert.ok(!pending.includes(text[resource]));
        await tick(); const failed = page.render();
        assert.equal(page.props()[resource].data, previous);
        assert.equal(page.props()[resource].status, 503);
        assert.ok(!failed.includes(text[resource]));
        for (const key of ['local', 'news', 'gallery'] as const) if (key !== resource) assert.ok(failed.includes(text[key]));
        failure = false; page.props()[resource].retry(); page.render();
        await tick(); assert.ok(page.render().includes(text[resource]));
        for (const key of ['local', 'news', 'gallery'] as const) assert.equal(counts[key], key === resource ? 3 : 1);
      });
    });
  }

  it('mostra vazio confirmado por acervo e mantém a sessão recusada distinta de vazio', async () => {
    await withPage(async (input) => String(input) === '/api/data' ? json(local) : json(envelope([])), async (page) => {
      await tick(); const html = page.render();
      assert.ok(html.includes('Nenhuma notícia encontrada no acervo oficial.'));
      assert.ok(html.includes('Nenhuma foto encontrada no acervo oficial.'));
      assert.ok(html.includes('Banner original'));
    });
    await withPage(async (input) => String(input).includes('/n_noticias')
      ? json({ success: false, errors: ['nao_autenticado'] }, 401) : serve(String(input)), async (page) => {
      await tick(); const html = page.render();
      assert.ok(html.includes('Sessão inválida ou expirada ao consultar Notícias'));
      assert.ok(html.includes('Entrar novamente'));
      assert.ok(!html.includes('Nenhuma notícia encontrada'));
      assert.ok(html.includes('Banner original'));
      assert.ok(html.includes('Foto oficial'));
    });
  });

  it('descarta respostas e falhas dos três recursos após desmontagem e aborta a leitura local', async () => {
    const pending: { resolve(response: Response): void; reject(error: Error): void }[] = [];
    let signal: AbortSignal | undefined;
    await withPage(async (input, options) => {
      if (String(input) === '/api/data') signal = options?.signal || undefined;
      return new Promise<Response>((resolve, reject) => { pending.push({ resolve, reject }); });
    }, async (page) => {
      await tick(); assert.equal(pending.length, 3);
      page.unmount(); assert.equal(signal?.aborted, true);
      const updates = page.updates();
      pending[0].resolve(json(local));
      pending[1].resolve(json(envelope(news)));
      pending[2].reject(new Error('Falha tardia'));
      await tick(); assert.equal(page.updates(), updates);
    });
  });

  it('identifica imagens quebradas por recurso sem esconder a foto de mesmo ID ou inventar substitutos', async () => {
    const originalFetch = globalThis.fetch;
    const originalState = React.useState;
    let requests = 0;
    globalThis.fetch = async (input, options) => { requests += 1; assert.equal(options?.method, 'GET'); return serve(String(input)); };
    let stateMock: ReturnType<typeof mock.method> | undefined;
    try {
      const [covers, gallery] = await Promise.all([readBannerNews(), readBannerGallery()]);
      const props = bannerManagerProps({ banners: local.banners, siteInfo: local.siteInfo, news: covers.items, gallery: gallery.items });
      let capturing = false;
      let cursor = 0;
      let tree: ReactNode;
      const states: unknown[] = [];
      stateMock = mock.method(React, 'useState', (initial: unknown) => {
        if (!capturing) return originalState(initial);
        const index = cursor++;
        if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
        const state: [unknown, React.Dispatch<React.SetStateAction<unknown>>] = [states[index], (next) => {
          states[index] = typeof next === 'function' ? next(states[index]) : next;
        }];
        return state;
      });
      function Capture() {
        capturing = true; cursor = 0;
        try { tree = SitePhotosManager(props); } finally { capturing = false; }
        return tree;
      }
      function image(resource: string) {
        let found: React.ReactElement<{ onError(): void }> | undefined;
        function visit(node: ReactNode, parent = '') {
          if (Array.isArray(node)) { node.forEach((child) => visit(child, parent)); return; }
          if (!isValidElement<{ children?: ReactNode; 'data-resource-id'?: string; onError(): void }>(node)) return;
          const key = node.props['data-resource-id'] || parent;
          if (node.type === 'img' && key === resource) found = node;
          visit(node.props.children, key);
        }
        visit(tree);
        assert.ok(found, resource);
        return found;
      }
      const render = () => renderToStaticMarkup(createElement(Capture));
      render(); image('noticia:1').props.onError();
      let html = render();
      assert.ok(html.includes('Capa indisponível.'));
      assert.ok(html.includes(getMediaUrl(photos[0].imagem)));
      image('galeria:1').props.onError(); html = render();
      assert.ok(html.includes('Imagem indisponível.'));
      assert.ok(html.includes('Notícia oficial aguardando'));
      assert.ok(html.includes('Foto oficial'));
      assert.ok(html.includes('/banner-original.svg'));
      assert.ok(!html.includes('src="/hero.jpg"'));
      assert.equal(requests, 2);
    } finally { stateMock?.mock.restore(); globalThis.fetch = originalFetch; }
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
        createElement(PathnameContext.Provider, { value: '/admin/projetos' }, createElement(AdminProjetosLayout, null, 'Conteúdo protegido')),
      ));
      assert.ok(html.includes('Autenticando e carregando painel de gestão...'));
      assert.ok(!html.includes('Conteúdo protegido'));
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

describe('FAQ administrativo migrado para Rails (C2)', () => {
  it('mostra carregamento inicial sem falso vazio nem bloqueio legado', () => {
    const html = renderToStaticMarkup(createElement(FaqModule));
    assert.match(html, /Carregando dúvidas/); assert.match(html, /Carregando categorias/);
    assert.doesNotMatch(html, /Nenhuma dúvida encontrada|Aguardando Endpoint da API|Prévia sem publicação/);
  });

  it('renderiza o DTO oficial com pergunta, resposta, categoria, autor e situação', async () => {
    const manager = await mountDuvidas(async url => url.pathname.endsWith('/d_categorias_duvida') ? categoriaList() : duvidaList());
    try {
      for (const text of ['Como faço minha matrícula?', 'Procure a secretaria.', 'Matrícula', 'Autora sintética', 'Aguardando aprovação']) {
        assert.ok(manager.html().includes(text));
      }
      assert.doesNotMatch(manager.html(), /personas|Tags e Palavras|Prévia sem publicação|Aguardando Endpoint/);
    } finally { await manager.restore(); }
  });

  it('formulário válido habilita envio e não promete publicação automática', async () => {
    const manager = await mountDuvidas(async url => url.pathname.endsWith('/d_categorias_duvida') ? categoriaList() : duvidaList([]));
    try {
      await manager.click('Nova dúvida');
      assert.match(manager.html(), /Salvar dúvida/); assert.match(manager.html(), /situação será definida ao salvar/);
      const form = manager.nodes().find(node => node.type === 'form' && node.props['aria-label'] === 'Criar dúvida'); assert.ok(form);
      assert.doesNotMatch(renderToStaticMarkup(form), /autor|status|motivo|tags|personas|actionLink/i);
      assert.equal(manager.calls.filter(call => call.options.method !== 'GET').length, 0);
    } finally { await manager.restore(); }
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

  it('deve distinguir 401, 403 e API inacessível (rede ou CORS) mesmo sem código de erro conhecido', async () => {
    const replies: [() => Promise<Response>, string][] = [
      [async () => new Response(JSON.stringify({ success: false, message: 'Token inválido', errors: ['token_invalido'] }), { headers: { 'Content-Type': 'application/json' }, status: 401 }), 'Você precisa estar autenticado para realizar esta ação.'],
      [async () => new Response(JSON.stringify({ success: false, message: 'Sem permissão', errors: ['sem_permissao'] }), { headers: { 'Content-Type': 'application/json' }, status: 403 }), 'Você não possui permissão para executar esta operação.'],
      [async () => new Response(JSON.stringify({ success: false, errors: [] }), { headers: { 'Content-Type': 'application/json' }, status: 403 }), 'Sem permissão'],
      [async () => new Response(JSON.stringify({ success: false, message: 'Você não pode alterar suas próprias permissões', errors: [] }), { headers: { 'Content-Type': 'application/json' }, status: 403 }), 'Você não pode alterar suas próprias permissões'],
      [async () => { throw new TypeError('Failed to fetch'); }, 'API inacessível: sem conexão com o servidor (rede, CORS ou URL incorreta).'],
    ];
    try {
      for (const [reply, expected] of replies) {
        globalThis.fetch = reply;
        const failure = await apiFetch('/n_noticias', { method: 'POST', body: '{}', skipAuth: true }).catch((error: unknown) => error);
        assert.equal(ApiError.getFriendlyMessage(failure), expected);
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
    const news = readFileSync('src/components/admin/NewsModule.tsx', 'utf8');
    assert.doesNotMatch(news, /errors\?\.join/);
    assert.equal(news.match(/ApiError\.getFriendlyMessage\(err\)/g)?.length, 2);
  });

  it('login e rotas do servidor usam a mesma URL de API do navegador', async () => {
    const saved = { public: process.env.NEXT_PUBLIC_API_URL, backend: process.env.BACKEND_API_URL };
    const urls: string[] = [];
    process.env.NEXT_PUBLIC_API_URL = 'http://api-unica.test/api/v1';
    delete process.env.BACKEND_API_URL;
    globalThis.fetch = async (input) => {
      const url = String(input);
      urls.push(url);
      if (url.endsWith('/auth/login')) return new Response(JSON.stringify({ success: true, data: { access_token: 'a', refresh_token: 'r' } }), { status: 200 });
      return new Response(JSON.stringify({ success: true, data: { id: 1, nome: 'Ana', cpf: '1', perfil_nome: 'Administrador' } }), { status: 200 });
    };
    try {
      const response = await authRoutePost(new Request('http://localhost:3000/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: '1', password: 'x' }),
      }));
      assert.equal(response.status, 200);
      assert.deepEqual((await response.json()).tokens, { access_token: 'a', refresh_token: 'r' });
      assert.deepEqual(urls, ['http://api-unica.test/api/v1/auth/login', 'http://api-unica.test/api/v1/auth/me']);
      assert.equal(getApiBaseUrl(), 'http://api-unica.test/api/v1');
    } finally {
      globalThis.fetch = originalFetch;
      if (saved.public === undefined) delete process.env.NEXT_PUBLIC_API_URL; else process.env.NEXT_PUBLIC_API_URL = saved.public;
      if (saved.backend !== undefined) process.env.BACKEND_API_URL = saved.backend;
    }
    for (const source of ['src/app/api/auth/route.ts', 'src/lib/rails-backend.ts']) {
      assert.doesNotMatch(readFileSync(source, 'utf8'), /172\.16\.|process\.env\.BACKEND_API_URL/, source);
    }
  });

  it('rotas do servidor exigem credenciais do ambiente, sem valores padrão versionados', async () => {
    const saved = { cpf: process.env.BACKEND_ADMIN_CPF, password: process.env.BACKEND_ADMIN_PASSWORD };
    delete process.env.BACKEND_ADMIN_CPF;
    delete process.env.BACKEND_ADMIN_PASSWORD;
    let requests = 0;
    globalThis.fetch = async () => { requests++; return new Response('{}', { status: 200 }); };
    try {
      await assert.rejects(railsApiFetch('/usuarios'), /defina BACKEND_ADMIN_CPF e BACKEND_ADMIN_PASSWORD/);
      assert.equal(requests, 0);
    } finally {
      globalThis.fetch = originalFetch;
      if (saved.cpf !== undefined) process.env.BACKEND_ADMIN_CPF = saved.cpf;
      if (saved.password !== undefined) process.env.BACKEND_ADMIN_PASSWORD = saved.password;
    }
    assert.doesNotMatch(readFileSync('src/lib/rails-backend.ts', 'utf8'), /BACKEND_ADMIN_\w+\s*\|\|/);
    const compose = readFileSync('docker-compose.yml', 'utf8');
    for (const name of ['ADMIN_USER', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET']) {
      assert.match(compose, new RegExp(`\\$\\{${name}:\\?Defina ${name} no \\.env\\}`));
    }
    const example = readFileSync('.env.example', 'utf8');
    assert.deepEqual(example.split('\n').filter(line => /^[A-Za-z_]\w*=./.test(line)), []);
    for (const name of ['BACKEND_ADMIN_CPF', 'BACKEND_ADMIN_PASSWORD']) assert.match(example, new RegExp(`^${name}=$`, 'm'));
  });

  it('imagem Docker recebe NEXT_PUBLIC_API_URL no build e o compose não define URL de reserva', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8');
    const positions = ['ARG NEXT_PUBLIC_API_URL', 'ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL', 'test -n "$NEXT_PUBLIC_API_URL"', 'RUN npm run build', 'FROM base AS runner'].map(text => dockerfile.indexOf(text));
    assert.ok(positions.every(position => position >= 0));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    const compose = readFileSync('docker-compose.yml', 'utf8');
    assert.match(compose, /args:\n\s+NEXT_PUBLIC_API_URL: \$\{NEXT_PUBLIC_API_URL:\?/);
    assert.doesNotMatch(compose, /:-http|172\.16\./);
    assert.match(readFileSync('docs/TESTE_LOCAL.md', 'utf8'), /--build-arg NEXT_PUBLIC_API_URL=/);
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

  it('deve enviar Content-Type só quando houver corpo JSON, evitando preflight em GET/DELETE', async () => {
    const sent: Headers[] = [];
    globalThis.fetch = async (_input, init) => {
      sent.push(new Headers(init?.headers));
      return new Response(null, { status: 204 });
    };

    try {
      await apiFetch('/publico/n_noticias', { skipAuth: true });
      await apiFetch('/g_estados/1', { method: 'DELETE' });
      await apiFetch('/g_estados', { method: 'POST', body: JSON.stringify({ nome: 'Rondônia' }) });
      await apiFetch('/c_conquistas_aluno', { method: 'POST', body: new FormData() });
      await apiFetch('/g_estados/1', { method: 'PUT', body: '{}', headers: { 'Content-Type': 'application/vnd.api+json' } });

      assert.deepEqual(sent.map(headers => headers.get('Content-Type')), [
        null,
        null,
        'application/json',
        null,
        'application/vnd.api+json',
      ]);
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

describe('Redes administrativas exclusivamente na API Rails', () => {
  const channels: CanalContato[] = [
    { id: 101, rede: 'youtube', valor: 'https://example.test/canal', posicao: 8, ativo: true },
    { id: 102, rede: 'email', valor: 'equipe@example.test', posicao: 12, ativo: false },
  ];
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  });
  const props = (overrides: Partial<SocialChannelsModuleProps> = {}): SocialChannelsModuleProps => ({
    apiCanais: channels, setApiCanais() {}, onSave: async () => {}, saving: false, canSave: false, ...overrides,
  });
  type ControlProps = {
    children?: ReactNode; id?: string; type?: string; disabled?: boolean;
    onChange?: (event: { target: { value: string; valueAsNumber: number; checked: boolean } }) => void;
  };
  function controls(node: ReactNode): Array<{ type: unknown; props: ControlProps }> {
    if (Array.isArray(node)) return node.flatMap(controls);
    if (!isValidElement<ControlProps>(node)) return [];
    return [{ type: node.type, props: node.props }, ...controls(node.props.children)];
  }

  it('aguarda o shell e apresenta carregamento antes de montar o formulário', () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => { requests += 1; throw new Error('Consulta não autorizada'); };
    try {
      const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: 'redes-test' };
      const html = renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router },
        createElement(PathnameContext.Provider, { value: '/admin/redes' }, createElement(AdminRedesSubroutePage))));
      assert.match(html, /Autenticando e carregando painel de gestão/);
      assert.doesNotMatch(html, /Salvar alterações/);
      const route = AdminRedesSubroutePage();
      const content = renderToStaticMarkup(route.props.children());
      assert.match(content, /Carregando canais oficiais/);
      assert.doesNotMatch(content, /<form/);
      assert.equal(requests, 0);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('lê somente canais oficiais e renderiza os valores recebidos sem fallback', async () => {
    const originalFetch = globalThis.fetch;
    const requests: string[] = [];
    globalThis.fetch = async (input, options) => {
      requests.push(String(input));
      const url = new URL(String(input));
      assert.equal(url.pathname, '/api/v1/canais_contato');
      assert.equal(url.searchParams.get('page'), 'all');
      assert.equal(options?.method, 'GET');
      return json({ success: true, data: { items: channels } });
    };
    try {
      const official = await readAdminChannels();
      assert.deepEqual(official, channels);
      const html = renderToStaticMarkup(createElement(SocialChannelsModule, props({ apiCanais: official })));
      for (const channel of channels) assert.ok(html.includes(`value="${channel.valor}"`));
      assert.equal(requests.length, 1);
      assert.ok(requests.every((url) => !url.includes('/api/data')));
    } finally { globalThis.fetch = originalFetch; }
  });

  it('distingue resposta vazia confirmada e mantém os sete canais ausentes bloqueados', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => json({ success: true, data: { items: [] } });
    try {
      const official = await readAdminChannels();
      assert.deepEqual(official, []);
      const input = props({ apiCanais: official });
      const html = renderToStaticMarkup(createElement(SocialChannelsModule, input));
      assert.match(html, /A API não retornou canais de contato/);
      assert.equal((html.match(/Canal não retornado pela API/g) || []).length, ADMIN_CHANNEL_KEYS.length);
      const elements = controls(SocialChannelsModule(input));
      assert.ok(elements.filter((node) => node.type === 'input').every((node) => node.props.disabled));
      assert.ok(elements.find((node) => node.type === 'button' && node.props.type === 'submit')?.props.disabled);
      assert.equal((html.match(/value="[^"]+"/g) || []).length, 0, 'Nenhum campo ausente recebe um valor substituto');
    } finally { globalThis.fetch = originalFetch; }
  });

  it('bloqueia canais ausentes sem criar registros ao acionar um controle', () => {
    let draft = channels.map((channel) => ({ ...channel }));
    const input = props({ apiCanais: draft, setApiCanais: (action) => {
      draft = typeof action === 'function' ? action(draft) : action;
    } });
    const elements = controls(SocialChannelsModule(input));
    const missing = elements.find((node) => node.props.id === 'canal-instagram-valor');
    assert.equal(missing?.props.disabled, true);
    missing?.props.onChange?.({ target: { value: 'https://example.test/ausente', valueAsNumber: NaN, checked: false } });
    assert.deepEqual(draft, channels);
    const existing = elements.find((node) => node.props.id === 'canal-youtube-valor');
    assert.equal(existing?.props.disabled, false);
    existing?.props.onChange?.({ target: { value: 'https://example.test/alterado', valueAsNumber: NaN, checked: false } });
    assert.deepEqual(getChannelChanges(channels, draft), [{ rede: 'youtube', valor: 'https://example.test/alterado' }]);
    assert.equal(channels[0].valor, 'https://example.test/canal');
  });

  it('propaga falhas de leitura e não permite gravar sem uma leitura válida', async () => {
    const originalFetch = globalThis.fetch;
    let writes = 0;
    globalThis.fetch = async (_input, options) => {
      if (options?.method === 'PUT') writes += 1;
      throw new Error('Falha de rede simulada');
    };
    try {
      await assert.rejects(readAdminChannels(), ApiError);
      await assert.rejects(saveAdminChannels(null, channels), /Carregue os canais oficiais/);
      assert.equal(writes, 0);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('preserva erros 401, 403 e 503 sem substituí-los por lista vazia ou permitir gravação', async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const status of [401, 403, 503]) {
        let writes = 0;
        globalThis.fetch = async (_input, options) => {
          if (options?.method === 'PUT') writes += 1;
          return json({ success: false, errors: [status === 401 ? 'nao_autenticado' : status === 403 ? 'sem_permissao' : 'indisponivel'] }, status);
        };
        await assert.rejects(readAdminChannels(), (error: unknown) => error instanceof ApiError && error.status === status);
        await assert.rejects(saveAdminChannels(null, channels), /Carregue os canais oficiais/);
        assert.equal(writes, 0);
      }
    } finally { globalThis.fetch = originalFetch; }
  });

  it('rejeita respostas de leitura inválidas ou ambíguas sem preencher dados', async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const body of [null, { success: false }, { success: true, data: { items: null } },
        { success: true, data: { items: [{}] } },
        { success: true, data: { items: [channels[0], channels[0]] } }]) {
        globalThis.fetch = async () => json(body);
        await assert.rejects(readAdminChannels(), /Resposta inválida/);
      }
    } finally { globalThis.fetch = originalFetch; }
  });

  it('envia somente campos modificados, sem IDs ou valores de canais não editados', async () => {
    const originalFetch = globalThis.fetch;
    const draft = channels.map((channel) => channel.rede === 'youtube' ? { ...channel, ativo: false } : { ...channel });
    let writes = 0;
    globalThis.fetch = async (input, options) => {
      writes += 1;
      assert.equal(new URL(String(input)).pathname, '/api/v1/canais_contato');
      assert.equal(options?.method, 'PUT');
      assert.deepEqual(JSON.parse(String(options?.body)), { canais_contato: [{ rede: 'youtube', ativo: false }] });
      return json({ success: true, data: [draft[0]] });
    };
    try {
      const saved = await saveAdminChannels(channels, draft);
      assert.equal(writes, 1);
      assert.equal(saved?.find((channel) => channel.rede === 'youtube')?.ativo, false);
      assert.deepEqual(saved?.find((channel) => channel.rede === 'email'), channels[1]);
      assert.equal(channels[0].ativo, true);
      assert.deepEqual(getChannelChanges(saved, saved || []), []);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('preserva campos oficiais vazios não alterados ao modificar somente posição ou visibilidade', async () => {
    const originalFetch = globalThis.fetch;
    const official = [{ ...channels[0], valor: '' }];
    const draft = [{ ...official[0], posicao: 3, ativo: false }];
    globalThis.fetch = async (_input, options) => {
      assert.deepEqual(JSON.parse(String(options?.body)), { canais_contato: [{ rede: 'youtube', posicao: 3, ativo: false }] });
      return json({ success: true, data: draft });
    };
    try { assert.deepEqual(await saveAdminChannels(official, draft), draft); }
    finally { globalThis.fetch = originalFetch; }
  });

  it('não grava sem mudanças, após desfazer a edição, nem canais que não vieram da API', async () => {
    const originalFetch = globalThis.fetch;
    let writes = 0;
    globalThis.fetch = async () => { writes += 1; throw new Error('Não deve gravar'); };
    try {
      assert.equal(await saveAdminChannels(channels, channels.map((channel) => ({ ...channel }))), null);
      assert.equal(await saveAdminChannels([], [{ ...channels[0] }]), null);
      assert.deepEqual(getChannelChanges(channels, [...channels, { ...channels[0], rede: 'instagram' }]), []);
      assert.equal(writes, 0);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('impede apagar valores e rejeita posições inválidas antes de chamar a API', async () => {
    const originalFetch = globalThis.fetch;
    let writes = 0;
    globalThis.fetch = async () => { writes += 1; throw new Error('Não deve gravar'); };
    try {
      for (const valor of ['', '   ']) {
        await assert.rejects(saveAdminChannels(channels, [{ ...channels[0], valor }, channels[1]]), /não pode ficar vazio/);
      }
      for (const posicao of [NaN, 0, 100, 1.5]) {
        await assert.rejects(saveAdminChannels(channels, [{ ...channels[0], posicao }, channels[1]]), /posição inteira/);
      }
      assert.equal(writes, 0);
    } finally { globalThis.fetch = originalFetch; }
  });

  it('não confirma sucesso com falha de gravação, resposta inválida ou canal alterado não confirmado', async () => {
    const originalFetch = globalThis.fetch;
    const draft = [{ ...channels[0], valor: 'https://example.test/alterado' }, channels[1]];
    try {
      for (const status of [401, 403, 422, 503]) {
        globalThis.fetch = async () => json({ success: false, errors: ['falha_simulada'] }, status);
        await assert.rejects(saveAdminChannels(channels, draft), (error: unknown) => error instanceof ApiError && error.status === status);
      }
      for (const body of [null, { success: false, data: draft }, { success: true, data: [] },
        { success: true, data: [channels[1]] }, { success: true, data: [{}] }]) {
        globalThis.fetch = async () => json(body);
        await assert.rejects(saveAdminChannels(channels, draft), /não confirmou/);
      }
      globalThis.fetch = async () => { throw new Error('Falha de rede simulada'); };
      await assert.rejects(saveAdminChannels(channels, draft), ApiError);
      assert.equal(channels[0].valor, 'https://example.test/canal');
    } finally { globalThis.fetch = originalFetch; }
  });

  it('bloqueia submit sem alterações e bloqueia os campos durante gravação', () => {
    for (const [saving, canSave] of [[false, false], [true, true]]) {
      const elements = controls(SocialChannelsModule(props({ saving, canSave })));
      assert.equal(elements.find((node) => node.type === 'button' && node.props.type === 'submit')?.props.disabled, true);
      if (saving) assert.ok(elements.filter((node) => node.type === 'input').every((node) => node.props.disabled));
    }
    const ready = controls(SocialChannelsModule(props({ canSave: true })));
    assert.equal(ready.find((node) => node.type === 'button' && node.props.type === 'submit')?.props.disabled, false);
  });
});


// 12D-5 Lote 4: usa os handlers reais com rede e navegação interceptadas.
// Nenhum payload é executado e o Proxy recebe somente sessão sintética.
function adminReturnDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(accept => { resolve = accept; });
  return { promise, resolve };
}

type LoginElementProps = {
  children?: ReactNode;
  type?: string;
  onChange?: (event: { target: { value: string } }) => void;
  onSubmit?: (event: { preventDefault(): void }) => Promise<void>;
};
function loginElements(node: ReactNode): React.ReactElement<LoginElementProps>[] {
  if (Array.isArray(node)) return node.flatMap(loginElements);
  if (!isValidElement<LoginElementProps>(node)) return [];
  return [node, ...loginElements(node.props.children)];
}

async function mountAdminReturnLogin(query: string) {
  const calls: { method: string; href?: string }[] = [];
  const post = adminReturnDeferred<Response>();
  let posts = 0;
  let submission: Promise<void> | undefined;
  let tree: ReactNode;
  const browser = { location: { pathname: '/admin/login', search: query ? '?' + query : '' }, HTMLIFrameElement: class {} };
  const doc = {
    nodeType: 9, addEventListener() {}, removeEventListener() {}, activeElement: null, body: null,
    defaultView: browser,
  };
  const globals = { window: browser, document: doc, IS_REACT_ACT_ENVIRONMENT: true };
  const descriptors = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const fetchMock = mock.method(globalThis, 'fetch', (input: RequestInfo | URL, options?: RequestInit) => {
    assert.equal(String(input), '/api/auth');
    assert.equal(options?.method, 'POST');
    assert.equal(options?.headers && new Headers(options.headers).get('Content-Type'), 'application/json');
    assert.deepEqual(Object.keys(JSON.parse(String(options?.body))).sort(), ['password', 'username']);
    posts++;
    return post.promise;
  });
  const router = {
    back() {}, forward() {}, prefetch() {}, bfcacheId: 'safe-admin-return',
    push(href: string) { calls.push({ method: 'push', href }); },
    replace(href: string) { calls.push({ method: 'replace', href }); },
    refresh() { calls.push({ method: 'refresh' }); },
  };
  function Host() { tree = AdminLoginPage(); return null; }
  const root = createRoot({
    nodeType: 1, tagName: 'DIV', namespaceURI: 'http://www.w3.org/1999/xhtml', ownerDocument: doc,
    addEventListener() {}, removeEventListener() {}, textContent: '',
  } as unknown as Element);
  async function restore() {
    try { await React.act(async () => { root.unmount(); }); }
    finally {
      fetchMock.mock.restore();
      for (const [key, descriptor] of descriptors) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    }
  }
  try {
    await React.act(async () => { root.render(createElement(AppRouterContext.Provider, { value: router }, createElement(Host))); });
    await React.act(async () => { loginElements(tree).find(node => node.type === 'input' && node.props.type === 'text')?.props.onChange?.({ target: { value: 'identificador-sintetico' } }); });
    await React.act(async () => { loginElements(tree).find(node => node.type === 'input' && node.props.type === 'password')?.props.onChange?.({ target: { value: 'entrada-sintetica' } }); });
  } catch (error) { await restore(); throw error; }
  return {
    calls, restore,
    setQuery(next: string) { browser.location.search = '?' + next; },
    async start() {
      await React.act(async () => { submission = loginElements(tree).find(node => node.type === 'form')?.props.onSubmit?.({ preventDefault() {} }); });
      assert.ok(submission);
      assert.equal(posts, 1);
      assert.deepEqual(calls, []);
    },
    async reply(status = 200, success = true) {
      await React.act(async () => { post.resolve(new Response(JSON.stringify({ success }), { status })); await submission; });
    },
    get tree() { return tree; },
  };
}

async function simulateAdminReturnLogin(query: string, expected: string, pendingQuery?: string) {
  const login = await mountAdminReturnLogin(query);
  try {
    await login.start();
    if (pendingQuery !== undefined) login.setQuery(pendingQuery);
    await login.reply();
    assert.deepEqual(login.calls, [{ method: 'push', href: expected }, { method: 'refresh' }]);
  } finally { await login.restore(); }
}

async function simulateAdminReturnProxy(path: string, authenticated = false) {
  const isolated: { exports: { proxy?: (request: NextRequest) => NextResponse } } = { exports: {} };
  const { outputText } = transpileModule(readFileSync('src/proxy.ts', 'utf8'), { compilerOptions: { module: ModuleKind.CommonJS } });
  runInNewContext(outputText, {
    exports: isolated.exports, URL, Headers, crypto: { randomUUID: () => 'request-id-sintetico' },
    require(name: string) {
      if (name === 'next/server') return { NextResponse };
      if (name === '@/lib/admin-auth-navigation') return adminAuthNavigation;
      if (name === '@/lib/auth') return {
        AUTH_COOKIE_NAME: 'synthetic-cookie',
        verifySessionToken(value: string | undefined) {
          assert.equal(value, authenticated ? 'synthetic-valid' : undefined);
          return authenticated ? { username: 'synthetic' } : null;
        },
      };
      throw new Error('Import não autorizado no Proxy isolado: ' + name);
    },
  }, { timeout: 1000 });
  assert.equal(typeof isolated.exports.proxy, 'function');
  const response = isolated.exports.proxy!(new NextRequest('https://medtec.invalid' + path, {
    headers: authenticated ? { cookie: 'synthetic-cookie=synthetic-valid' } : {},
  }));
  return { status: response.status, location: response.headers.get('location') };
}

describe('12D-5 Lote 4: caracterização do retorno de login', () => {
  const cases: [string, string, string][] = [
    ['painel', 'redirect=%2Fadmin', '/admin'],
    ['notícias', 'redirect=%2Fadmin%2Fnoticias', '/admin/noticias'],
    ['criação', 'redirect=%2Fadmin%2Fnoticias%3Faction%3Dnew', '/admin/noticias?action=new'],
    ['ausente', '', '/admin'],
    ['vazio', 'redirect=', '/admin'],
    ['primeiro repetido', 'redirect=%2Fadmin%2Fnoticias&redirect=%2Fadmin%2Favisos', '/admin/noticias'],
    ['primeiro vazio', 'redirect=&redirect=%2Fadmin%2Favisos', '/admin'],
  ];
  for (const [label, query, expected] of cases) {
    it(label, async () => { await simulateAdminReturnLogin(query, expected); });
  }
  it('query vigente após POST pendente', async () => {
    await simulateAdminReturnLogin('redirect=%2Fadmin%2Fnoticias', '/admin/avisos', 'redirect=%2Fadmin%2Favisos');
  });
  it('regressão: destino externo antes aceito usa fallback', async () => {
    await simulateAdminReturnLogin('redirect=https%3A%2F%2Fexample.com', '/admin');
  });
  it('regressão: destino fora de admin antes aceito usa fallback', async () => {
    await simulateAdminReturnLogin('redirect=%2Fapi%2Fauth', '/admin');
  });
  it('regressão: Proxy preserva query antes perdida', async () => {
    assert.deepEqual(await simulateAdminReturnProxy('/admin/noticias?action=new'), {
      status: 307, location: 'https://medtec.invalid/admin/login?redirect=%2Fadmin%2Fnoticias%3Faction%3Dnew',
    });
  });
  it('sessão válida no login continua indo para admin', async () => {
    assert.deepEqual(await simulateAdminReturnProxy('/admin/login?redirect=%2Fadmin%2Fnoticias%3Faction%3Dnew', true), {
      status: 307, location: 'https://medtec.invalid/admin',
    });
  });
});

const safeAdminReturnCases: [string, string][] = [
  ['/admin', '/admin'], ['/admin/', '/admin/'], ['/admin/noticias', '/admin/noticias'],
  ['/admin/avisos', '/admin/avisos'], ['/admin/banners', '/admin/banners'],
  ['/admin/modulo-futuro/item', '/admin/modulo-futuro/item'],
  ['/admin/noticias?action=new', '/admin/noticias?action=new'],
  ['/admin?tab=faq&section=avisos', '/admin?tab=faq&section=avisos'],
  ['/admin/noticias?mode=editor', '/admin/noticias?mode=editor'],
  ['/admin/noticias?edit=42&action=new&mode=editor', '/admin/noticias?edit=42&action=new&mode=editor'],
  ['/admin/noticias?q=texto%20livre%2F%3F%23%26%3D%2B&nome=Jo%C3%A3o', '/admin/noticias?q=texto%20livre%2F%3F%23%26%3D%2B&nome=Jo%C3%A3o'],
  ['/admin?tab=faq&tab=avisos&section=redes', '/admin?tab=faq&tab=avisos&section=redes'],
  ['/admin?q=a+b&x=%2f&empty=&flag', '/admin?q=a+b&x=%2f&empty=&flag'],
  ['/admin/noticias#editor', '/admin/noticias#editor'],
  ['/admin/avisos#detalhes_2-A', '/admin/avisos#detalhes_2-A'],
  ['/admin/noticias?action=new#editor', '/admin/noticias?action=new#editor'],
  ['/admin?tab=faq&redirect=https%3A%2F%2Fexample.com&section=avisos', '/admin?tab=faq&section=avisos'],
  ['/admin?redirect=/admin/login&tab=faq&redirect=/api/auth&tab=avisos', '/admin?tab=faq&tab=avisos'],
  ['/admin?redir%65ct=x&action=new&redirect&edit=42', '/admin?action=new&edit=42'],
  ['/admin?Redirect=keep&xredirect=keep&redirected=keep&q=redirect%3Dvalue', '/admin?Redirect=keep&xredirect=keep&redirected=keep&q=redirect%3Dvalue'],
  ['/admin?q=%252F%252Fexample.com&action=new', '/admin?q=%252F%252Fexample.com&action=new'],
  ['/admin?redirect=x&q=a%20b&x=%2f&q=a+b&flag', '/admin?q=a%20b&x=%2f&q=a+b&flag'],
  ['/admin?redir%2565ct=keep&action=new', '/admin?redir%2565ct=keep&action=new'],
  ['/admin?redirect=x#editor', '/admin#editor'],
  ['/admin/noticias?action=new#texto livre', '/admin/noticias?action=new'],
  ['/admin/noticias?action=new#editor ', '/admin/noticias?action=new'],
  ['/admin/noticias?action=new#editor\n', '/admin/noticias?action=new'],
  ['/admin/noticias?action=new#%65ditor', '/admin/noticias?action=new'],
  ['/admin/noticias?action=new#editor/extra?x=1', '/admin/noticias?action=new'],
  ['/admin/noticias?action=new#javascript:alert(1)', '/admin/noticias?action=new'],
  ['/admin/noticias?action=new#', '/admin/noticias?action=new'],
];
const unsafeAdminReturnCases = [
  'https://example.com', 'http://example.com', '//example.com', '///example.com',
  'javascript:alert(1)', 'data:text/html,teste', 'https://medtec.invalid/admin',
  'https://synthetic-user:synthetic-input@example.com/admin', '/api/auth', '/', '/administer',
  '/painel-gestor', 'noticias', '../api/auth', '/admin/../api/auth', '/admin/./noticias',
  '/admin/%2e%2e/api/auth', '/admin/%252e%252e/api/auth', '/%2Fexample.com',
  '%2F%2Fexample.com', 'https:%2F%2Fexample.com', '\\example.com', '\\\\example.com',
  '/admin\\noticias', '/admin//noticias', '/admin/noticias//', '/adm\tin/noticias',
  '/admin/noticias\n', '/admin/\0noticias', '/admin?x=\rvalor', ' /admin', '/admin ',
  '/admin/%', '/admin/%GG', '/admin/%6eoticias', '/admin/login', '/admin/login/',
  '/admin/login?redirect=/admin', '/admin/login/outro', '/admin#editor\n',
];
describe('12D-5 Lote 4: segurança do retorno administrativo', () => {
  for (const [raw, expected] of safeAdminReturnCases) {
    it('aceita ou limpa somente o necessário: ' + JSON.stringify(raw), () => {
      assert.equal(adminAuthNavigation.getSafeAdminReturnTarget(raw), expected);
      assert.equal(adminAuthNavigation.getSafeAdminReturnTarget(raw), expected);
    });
  }
  for (const raw of [null, undefined, '', ...unsafeAdminReturnCases]) {
    it('rejeita: ' + JSON.stringify(raw), () => {
      assert.equal(adminAuthNavigation.getSafeAdminReturnTarget(raw), '/admin');
    });
  }
  it('é puro sem runtime, navegador, sessão ou rede e não muda a entrada', () => {
    const source = readFileSync('src/lib/admin-auth-navigation.ts', 'utf8');
    const { outputText } = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } });
    const isolated: { exports: typeof adminAuthNavigation } = { exports: {} as typeof adminAuthNavigation };
    for (const key of ['require', 'window', 'document', 'localStorage', 'fetch', 'cookies', 'process', 'React']) {
      Object.defineProperty(isolated, key, { get() { throw new Error('Acesso indevido: ' + key); } });
    }
    Object.assign(isolated, { URL, URLSearchParams });
    runInNewContext(outputText, isolated, { timeout: 1000 });
    for (const [input, expected] of safeAdminReturnCases) {
      const frozen = Object.freeze({ input });
      assert.equal(isolated.exports.getSafeAdminReturnTarget(frozen.input), expected);
      assert.equal(frozen.input, input);
    }
    assert.equal(isolated.exports.getAdminLoginHref('/admin/noticias', '?action=new'), '/admin/login?redirect=%2Fadmin%2Fnoticias%3Faction%3Dnew');
  });
  for (const target of ['/admin/noticias?action=new', '/admin?tab=faq&section=avisos',
    '/admin?q=a%20b&x=%2f&q=a+b&flag', '/admin?redirect=x&action=new']) {
    it('construtor usa uma camada externa e mantém query: ' + target, () => {
      const i = target.indexOf('?');
      const href = adminAuthNavigation.getAdminLoginHref(target.slice(0, i), target.slice(i));
      const params = new URL(href, 'https://medtec.invalid').searchParams;
      const safe = adminAuthNavigation.getSafeAdminReturnTarget(target);
      assert.equal(params.get('redirect'), safe);
      assert.deepEqual([...params.keys()], ['redirect']);
      assert.equal(href, '/admin/login?redirect=' + encodeURIComponent(safe));
    });
  }
  it('construtor aplica fallback e não aceita search malformado', () => {
    assert.equal(adminAuthNavigation.getAdminLoginHref('/api/auth', '?action=new'), '/admin/login?redirect=%2Fadmin');
    assert.equal(adminAuthNavigation.getAdminLoginHref('/admin', '//example.com'), '/admin/login?redirect=%2Fadmin');
  });
  const loginCases: [string, string][] = [
    ['redirect=https%3A%2F%2Fexample.com', '/admin'],
    ['redirect=javascript%3Aalert(1)', '/admin'],
    ['redirect=data%3Atext%2Fhtml%2Cteste', '/admin'],
    ['redirect=%2Fapi%2Fauth', '/admin'],
    ['redirect=%2Fadmin%2Flogin', '/admin'],
    ['redirect=https%3A%2F%2Fexample.com&redirect=%2Fadmin%2Favisos', '/admin'],
    ['redirect=&redirect=%2Fadmin%2Favisos', '/admin'],
    ['redirect=%2Fadmin%2Favisos&redirect=https%3A%2F%2Fexample.com', '/admin/avisos'],
    ['redirect=%2F%2Fexample.com', '/admin'],
    ['redirect=%252F%252Fexample.com', '/admin'],
    ['redirect=%2Fadmin%3Ftab%3Dfaq%26redirect%3Dx%26section%3Davisos', '/admin?tab=faq&section=avisos'],
    ['redirect=%2Fadmin%2Fnoticias%3Faction%3Dnew%23editor', '/admin/noticias?action=new#editor'],
  ];
  for (const [query, expected] of loginCases) {
    it('login valida primeiro valor sem decode adicional: ' + query, async () => {
      await simulateAdminReturnLogin(query, expected);
    });
  }
  it('login valida a query insegura que mudou enquanto o POST aguardava', async () => {
    await simulateAdminReturnLogin('redirect=%2Fadmin%2Fnoticias', '/admin', 'redirect=javascript%3Aalert(1)');
  });
  it('login não navega nem faz refresh após autenticação recusada', async () => {
    const login = await mountAdminReturnLogin('redirect=%2Fadmin%2Fnoticias');
    try { await login.start(); await login.reply(401, false); assert.deepEqual(login.calls, []); }
    finally { await login.restore(); }
  });
  for (const [path, expected] of [
    ['/admin/noticias?action=new', '/admin/noticias?action=new'],
    ['/admin?tab=faq&section=avisos', '/admin?tab=faq&section=avisos'],
    ['/admin/noticias?mode=editor&edit=42', '/admin/noticias?mode=editor&edit=42'],
    ['/admin?tab=faq&redirect=https%3A%2F%2Fexample.com&tab=avisos', '/admin?tab=faq&tab=avisos'],
    ['/admin?q=a%20b&x=%2f&q=a+b&flag', '/admin?q=a%20b&x=%2f&q=a+b&flag'],
  ]) {
    it('Proxy transporta retorno e login o consome: ' + path, async () => {
      const result = await simulateAdminReturnProxy(path);
      assert.equal(result.status, 307);
      const url = new URL(result.location!);
      assert.equal(url.origin, 'https://medtec.invalid');
      assert.equal(url.pathname, '/admin/login');
      assert.equal(url.searchParams.get('redirect'), expected);
      await simulateAdminReturnLogin(url.search.slice(1), expected);
    });
  }
});

// Lote C1: somente respostas sintéticas; nenhum teste acessa o backend.
const categoriaDuvidaFixture: DCategoriaDuvida = {
  id: 21, nome: 'Matrícula', slug: 'matricula', ativo: true,
  created_by: '9', updated_by: null, created_at: '2026-10-31T12:00:00Z', updated_at: '2026-10-31T12:00:00Z',
};
function categoriaReply(body: unknown, status = 200) {
  return status === 204 ? new Response(null, { status })
    : new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
function categoriaList(items = [categoriaDuvidaFixture], pagination = {
  current_page: 1, total_pages: items.length ? 1 : 0, total_count: items.length, per_page: 10,
}) {
  return categoriaReply({ success: true, message: 'Resultado sintético', data: { items, pagination } });
}

describe('Categorias de Dúvidas C1 — serviço autenticado', () => {
  const service = medtecApi.categoriasDuvida;
  const operations = {
    list: () => service.list({ page: 2, per_page: 5, 'q[ativo_true]': 1 }),
    get: () => service.get(21),
    create: () => service.create({ nome: 'Matrícula', slug: 'matricula', ativo: true }),
    update: () => service.update(21, { nome: 'Matrícula', slug: 'matricula', ativo: false }),
    delete: () => service.delete(21),
  };
  for (const operation of ['list', 'get', 'create', 'update', 'delete'] as const) {
    it(operation + ' respeita Bearer, URL, payload e formato da resposta', async () => {
      setStoredTokens({ access_token: 'category-user-only', refresh_token: 'category-refresh-only' });
      const calls: { url: URL; options?: RequestInit }[] = [];
      const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
        calls.push({ url: new URL(String(input)), options });
        if (operation === 'list') return categoriaList([categoriaDuvidaFixture], { current_page: 2, total_pages: 4, total_count: 18, per_page: 5 });
        if (operation === 'delete') return categoriaReply(null, 204);
        return categoriaReply(categoriaDuvidaFixture, operation === 'create' ? 201 : 200);
      });
      try {
        const result = await operations[operation]();
        assert.equal(calls.length, 1);
        const { url, options } = calls[0];
        assert.ok(url.pathname.endsWith('/d_categorias_duvida' + (['get', 'update', 'delete'].includes(operation) ? '/21' : '')));
        assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer category-user-only');
        assert.equal(options?.method, { list: 'GET', get: 'GET', create: 'POST', update: 'PATCH', delete: 'DELETE' }[operation]);
        if (operation === 'list') {
          assert.equal(url.searchParams.get('page'), '2'); assert.equal(url.searchParams.get('per_page'), '5');
          assert.equal(url.searchParams.get('q[ativo_true]'), '1');
          assert.deepEqual(result, { success: true, message: 'Resultado sintético', data: { items: [categoriaDuvidaFixture], pagination: { current_page: 2, total_pages: 4, total_count: 18, per_page: 5 } } });
        } else if (operation === 'delete') assert.equal(result, undefined);
        else assert.deepEqual(result, categoriaDuvidaFixture);
        if (operation === 'create' || operation === 'update') {
          assert.deepEqual(JSON.parse(String(options?.body)), { d_categoria_duvida: { nome: 'Matrícula', slug: 'matricula', ativo: operation === 'create' } });
        } else assert.equal(options?.body, undefined);
      } finally { fetcher.mock.restore(); clearStoredTokens(); }
    });
  }
  it('omite slug e ativo opcionais sem inventar padrões no cliente', async () => {
    const fetcher = mock.method(globalThis, 'fetch', async (_input: RequestInfo | URL, options?: RequestInit) => {
      assert.deepEqual(JSON.parse(String(options?.body)), { d_categoria_duvida: { nome: 'Matrícula' } });
      return categoriaReply(categoriaDuvidaFixture, 201);
    });
    try { await service.create({ nome: 'Matrícula' }); } finally { fetcher.mock.restore(); }
  });
  it('listagem e consulta aceitam cancelamento; vazio oficial preserva total zero', async () => {
    const controller = new AbortController();
    const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
      assert.equal(options?.signal, controller.signal);
      return String(input).endsWith('/21') ? categoriaReply(categoriaDuvidaFixture) : categoriaList([]);
    });
    try {
      const result = await service.list({ page: 1 }, controller.signal);
      assert.deepEqual(result.data.items, []); assert.equal(result.data.pagination.total_count, 0);
      assert.deepEqual(await service.get(21, controller.signal), categoriaDuvidaFixture);
    } finally { fetcher.mock.restore(); }
  });
  for (const [status, operation] of [[401, 'list'], [403, 'create'], [404, 'get'], [422, 'delete']] as const) {
    it('propaga HTTP ' + status + ' sem persistência alternativa', async () => {
      const requests: string[] = [];
      const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
        requests.push(String(input));
        return categoriaReply({ success: false, message: 'Falha sintética', errors: [status === 401 ? 'nao_autenticado' : status === 403 ? 'sem_permissao' : 'Categoria possui dúvidas vinculadas'] }, status);
      });
      try {
        await assert.rejects(operations[operation](), error => error instanceof ApiError && error.status === status);
        assert.equal(requests.length, 1); assert.ok(requests[0].includes('/d_categorias_duvida'));
      } finally { fetcher.mock.restore(); }
    });
  }
  it('propaga erro de rede como ApiError sem resposta vazia', async () => {
    const fetcher = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
    try { await assert.rejects(service.list(), error => error instanceof ApiError && error.status === 0); }
    finally { fetcher.mock.restore(); }
  });
  for (const payload of [null, { success: true, data: { items: [] } },
    { success: true, data: { items: [categoriaDuvidaFixture], pagination: { current_page: 1, total_pages: 1, total_count: -1, per_page: 10 } } },
    { success: true, data: { items: [{ ...categoriaDuvidaFixture, ativo: 'sim' }], pagination: { current_page: 1, total_pages: 1, total_count: 1, per_page: 10 } } }]) {
    it('rejeita envelope inválido: ' + JSON.stringify(payload), async () => {
      const fetcher = mock.method(globalThis, 'fetch', async () => categoriaReply(payload));
      try { await assert.rejects(service.list(), /Resposta inválida/); } finally { fetcher.mock.restore(); }
    });
  }
  it('rejeita envelope de objeto individual indevido', async () => {
    const fetcher = mock.method(globalThis, 'fetch', async () => categoriaReply({ success: true, data: categoriaDuvidaFixture }));
    try { await assert.rejects(service.get(21), /Resposta inválida/); } finally { fetcher.mock.restore(); }
  });
});

// Executa hooks, efeitos e eventos reais com o reconciliador existente. O DOM
// visual é capturado como árvore React, seguindo os testes de sessão do projeto.
async function mountCategories(fetcher: (url: URL, options: RequestInit) => Promise<Response>, strict = false, config?: { component: () => ReactNode; allowedPaths: RegExp; anonymous?: boolean }) {
  let tree: ReactNode = null;
  const calls: { url: URL; options: RequestInit }[] = [];
  const visibilityListeners = new Set<() => void>();
  const doc = { nodeType: 9, visibilityState: 'visible',
    addEventListener(type: string, listener: () => void) { if (type === 'visibilitychange') visibilityListeners.add(listener); },
    removeEventListener(type: string, listener: () => void) { if (type === 'visibilitychange') visibilityListeners.delete(listener); },
    activeElement: null, body: null,
    defaultView: null as unknown, documentElement: { classList: { contains() { return false; } } } };
  const browser = { document: doc, HTMLIFrameElement: class {} };
  doc.defaultView = browser;
  const globals = { window: browser, document: doc, IS_REACT_ACT_ENVIRONMENT: true };
  const descriptors = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  setStoredTokens({ access_token: 'category-ui-user', refresh_token: 'category-ui-refresh' });
  const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options: RequestInit = {}) => {
    const url = new URL(String(input)); calls.push({ url, options });
    return fetcher(url, options);
  });
  function Capture() { tree = config ? config.component() : DuvidaCategoriesManager(); return null; }
  const root = createRoot({ nodeType: 1, tagName: 'DIV', namespaceURI: 'http://www.w3.org/1999/xhtml', ownerDocument: doc,
    addEventListener() {}, removeEventListener() {}, textContent: '' } as unknown as Element);
  let disposed = false;
  async function unmount() { if (!disposed) { disposed = true; await React.act(async () => root.unmount()); } }
  async function restore() {
    try {
      await unmount();
      for (const call of calls) {
        assert.match(call.url.pathname, config?.allowedPaths || /\/d_categorias_duvida(?:\/\d+)?$/);
        assert.equal(new Headers(call.options.headers).get('Authorization'), config?.anonymous ? null : 'Bearer category-ui-user');
        if (config?.anonymous) assert.equal(call.options.credentials, 'omit');
      }
    } finally {
      fetchMock.mock.restore(); clearStoredTokens();
      for (const [key, descriptor] of descriptors) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
      }
    }
  }
  async function act(action: () => unknown) { await React.act(async () => { await action(); }); }
  try { await act(() => root.render(strict ? createElement(React.StrictMode, null, createElement(Capture)) : createElement(Capture))); }
  catch (error) { await restore(); throw error; }
  return {
    calls, act, restore, unmount,
    render: () => act(() => root.render(strict ? createElement(React.StrictMode, null, createElement(Capture)) : createElement(Capture))),
    html: () => renderToStaticMarkup(tree),
    nodes: () => noticeNodes(tree),
    async visibilityChange(state: 'visible' | 'hidden') {
      doc.visibilityState = state;
      await act(() => { for (const listener of visibilityListeners) listener(); });
    },
    async click(label: string) {
      const node = noticeNodes(tree).find(node => node.type === 'button' && (node.props['aria-label'] === label || node.props.children === label));
      assert.ok(node, 'Botão: ' + label); assert.ok(!node.props.disabled, 'Botão habilitado: ' + label);
      await act(() => Reflect.apply(node.props.onClick as () => unknown, undefined, []));
    },
    async change(name: string, value: string | boolean) {
      const node = noticeNodes(tree).find(node => ['input', 'textarea', 'select'].includes(String(node.type)) && node.props.name === name);
      assert.ok(node, 'Campo: ' + name);
      await act(() => Reflect.apply(node.props.onChange as () => unknown, undefined, [{ target: { value, checked: value } }]));
    },
    async submit(label?: string) {
      const node = noticeNodes(tree).find(node => node.type === 'form' && (!label || node.props['aria-label'] === label)); assert.ok(node);
      await act(() => Reflect.apply(node.props.onSubmit as () => unknown, undefined, [{ preventDefault() {} }]));
    },
  };
}

describe('Categorias de Dúvidas C1 — interface e integração', () => {
  it('aba de categorias está dentro da guarda existente e independe da leitura legada', () => {
    const page = AdminFaqSubroutePage();
    assert.equal(page.type, AdminShell); assert.equal(page.props.activeSection, 'duvidas');
    assert.equal(typeof page.props.children, 'function');
    const workspace = page.props.children();
    const html = renderToStaticMarkup(workspace);
    assert.match(html, /Seções do FAQ/); assert.match(html, />Categorias</);
    const state = mock.method(React, 'useState', (<S,>(initial?: S | (() => S)) => {
      const value = typeof initial === 'function' ? (initial as () => S)() : initial;
      return [value === 'duvidas' ? 'categorias' : value, () => {}];
    }) as typeof React.useState);
    try {
      const tree = Reflect.apply(workspace.type as () => ReactNode, undefined, [workspace.props]);
      assert.equal(noticeNodes(tree).filter(node => node.type === DuvidaCategoriesManager).length, 1);
    } finally { state.mock.restore(); }
  });
  it('mostra carregamento e não inventa vazio enquanto a leitura está pendente', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountCategories(() => pending.promise);
    try {
      assert.match(manager.html(), /Carregando categorias/); assert.doesNotMatch(manager.html(), /Nenhuma categoria/);
      await manager.act(() => pending.resolve(categoriaList([])));
      assert.match(manager.html(), /Nenhuma categoria cadastrada/); assert.doesNotMatch(manager.html(), /Carregando categorias/);
    } finally { await manager.restore(); }
  });
  it('paginação usa metadados oficiais e solicita a próxima página', async () => {
    const manager = await mountCategories(async url => {
      const current = Number(url.searchParams.get('page'));
      assert.equal(url.searchParams.get('per_page'), '10');
      return categoriaList([{ ...categoriaDuvidaFixture, nome: current === 1 ? 'Matrícula' : 'Certificados' }], { current_page: current, total_pages: 3, total_count: 25, per_page: 10 });
    });
    try {
      assert.match(manager.html(), /Página 1 de 3 · 25 categorias/);
      await manager.click('Próxima'); assert.match(manager.html(), /Página 2 de 3 · 25 categorias/); assert.match(manager.html(), /Certificados/);
      await manager.click('Anterior'); assert.equal(manager.calls.length, 3);
    } finally { await manager.restore(); }
  });
  it('formulário inválido não envia escrita; criação omite slug vazio e atualiza a lista', async () => {
    let created = false;
    const manager = await mountCategories(async (_url, options) => {
      if (options.method === 'POST') {
        assert.deepEqual(JSON.parse(String(options.body)), { d_categoria_duvida: { nome: 'Certificados', ativo: true } });
        created = true; return categoriaReply({ ...categoriaDuvidaFixture, nome: 'Certificados' }, 201);
      }
      return categoriaList(created ? [{ ...categoriaDuvidaFixture, nome: 'Certificados' }] : []);
    });
    try {
      await manager.click('Nova categoria'); await manager.change('nome', '   '); await manager.submit();
      assert.match(manager.html(), /Informe o nome da categoria/); assert.equal(manager.calls.length, 1);
      await manager.change('nome', ' Certificados '); await manager.submit();
      assert.equal(created, true); assert.match(manager.html(), /Categoria salva com sucesso/);
      assert.match(manager.html(), /Certificados/); assert.doesNotMatch(manager.html(), /aria-label="Criar categoria"/);
      assert.deepEqual(manager.calls.map(call => call.options.method), ['GET', 'POST', 'GET']);
    } finally { await manager.restore(); }
  });
  it('edição consulta por ID, permite nome/slug/ativo e recarrega a listagem', async () => {
    let edited = false;
    const changed = { ...categoriaDuvidaFixture, nome: 'Matrículas 2027', slug: 'matriculas-2027', ativo: false };
    const manager = await mountCategories(async (url, options) => {
      if (options.method === 'PATCH') {
        assert.deepEqual(JSON.parse(String(options.body)), { d_categoria_duvida: { nome: changed.nome, slug: changed.slug, ativo: false } });
        edited = true; return categoriaReply(changed);
      }
      if (url.pathname.endsWith('/21')) return categoriaReply(categoriaDuvidaFixture);
      return categoriaList([edited ? changed : categoriaDuvidaFixture]);
    });
    try {
      await manager.click('Editar Matrícula');
      assert.match(manager.html(), /aria-label="Editar categoria"/);
      await manager.change('nome', changed.nome); await manager.change('slug', changed.slug); await manager.change('ativo', false);
      await manager.submit(); assert.match(manager.html(), /Matrículas 2027/); assert.match(manager.html(), /Inativa/);
      assert.deepEqual(manager.calls.map(call => call.options.method), ['GET', 'GET', 'PATCH', 'GET']);
    } finally { await manager.restore(); }
  });
  for (const initial of [true, false]) {
    it((initial ? 'desativa' : 'ativa') + ' somente após PATCH bem-sucedido', async () => {
      let active = initial;
      const manager = await mountCategories(async (_url, options) => {
        if (options.method === 'PATCH') {
          assert.deepEqual(JSON.parse(String(options.body)), { d_categoria_duvida: { ativo: !initial } });
          active = !initial; return categoriaReply({ ...categoriaDuvidaFixture, ativo: active });
        }
        return categoriaList([{ ...categoriaDuvidaFixture, ativo: active }]);
      });
      try {
        await manager.click((initial ? 'Desativar' : 'Ativar') + ' Matrícula');
        assert.equal(active, !initial); assert.equal(manager.calls.length, 3);
        assert.match(manager.html(), initial ? /Categoria desativada/ : /Categoria ativada/);
      } finally { await manager.restore(); }
    });
  }
  it('exclusão exige confirmação e recarrega após 204 sem corpo', async () => {
    let deleted = false;
    const manager = await mountCategories(async (_url, options) => {
      if (options.method === 'DELETE') { deleted = true; return categoriaReply(null, 204); }
      return categoriaList(deleted ? [] : [categoriaDuvidaFixture]);
    });
    try {
      await manager.click('Excluir Matrícula'); assert.equal(manager.calls.length, 1);
      await manager.click('Cancelar exclusão'); assert.equal(manager.calls.length, 1);
      await manager.click('Excluir Matrícula'); await manager.click('Confirmar exclusão');
      assert.match(manager.html(), /Categoria excluída com sucesso/); assert.match(manager.html(), /Nenhuma categoria cadastrada/);
      assert.deepEqual(manager.calls.map(call => call.options.method), ['GET', 'DELETE', 'GET']);
    } finally { await manager.restore(); }
  });
  it('422 ao excluir preserva a categoria e informa o vínculo', async () => {
    const manager = await mountCategories(async (_url, options) => options.method === 'DELETE'
      ? categoriaReply({ success: false, message: 'Não foi possível excluir', errors: ['Categoria possui dúvidas vinculadas'] }, 422)
      : categoriaList());
    try {
      await manager.click('Excluir Matrícula'); await manager.click('Confirmar exclusão');
      assert.match(manager.html(), /Não foi possível excluir/); assert.match(manager.html(), /Categoria possui dúvidas vinculadas/);
      assert.match(manager.html(), /aria-label="Editar Matrícula"/); assert.doesNotMatch(manager.html(), /Categoria excluída com sucesso/);
      assert.equal(manager.calls.length, 2);
    } finally { await manager.restore(); }
  });
  for (const status of [403, 422]) {
    it('falha HTTP ' + status + ' ao criar mantém formulário e conteúdo sem falso sucesso', async () => {
      const manager = await mountCategories(async (_url, options) => options.method === 'POST'
        ? categoriaReply({ success: false, message: 'Erro de validação', errors: [status === 403 ? 'sem_permissao' : 'Slug já está em uso'] }, status)
        : categoriaList([]));
      try {
        await manager.click('Nova categoria'); await manager.change('nome', 'Novo assunto'); await manager.submit();
        assert.match(manager.html(), /value="Novo assunto"/); assert.match(manager.html(), /role="alert"/);
        assert.match(manager.html(), status === 403 ? /não possui permissão/ : /Slug já está em uso/);
        assert.doesNotMatch(manager.html(), /salva com sucesso/); assert.equal(manager.calls.length, 2);
      } finally { await manager.restore(); }
    });
  }
  it('formulário aberto bloqueia ações que descartariam seu conteúdo', async () => {
    const manager = await mountCategories(async () => categoriaList());
    try {
      await manager.click('Nova categoria'); await manager.change('nome', 'Rascunho da categoria');
      for (const label of ['Nova categoria', 'Editar Matrícula', 'Desativar Matrícula', 'Excluir Matrícula', 'Próxima']) {
        const button = manager.nodes().find(node => node.type === 'button' && (node.props['aria-label'] === label || node.props.children === label));
        assert.ok(button); assert.equal(button.props.disabled, true);
      }
      assert.match(manager.html(), /value="Rascunho da categoria"/);
      await manager.click('Cancelar'); assert.equal(manager.calls.length, 1);
    } finally { await manager.restore(); }
  });
  it('envios concorrentes não duplicam uma criação enquanto a resposta está pendente', async () => {
    const pending = adminReturnDeferred<Response>();
    let written = false;
    const manager = await mountCategories(async (_url, options) => {
      if (options.method === 'POST') { written = true; return pending.promise; }
      return categoriaList(written ? [categoriaDuvidaFixture] : []);
    });
    try {
      await manager.click('Nova categoria'); await manager.change('nome', 'Matrícula');
      const form = manager.nodes().find(node => node.type === 'form'); assert.ok(form);
      await manager.act(() => {
        const submit = form.props.onSubmit as () => unknown;
        void Reflect.apply(submit, undefined, [{ preventDefault() {} }]);
        void Reflect.apply(submit, undefined, [{ preventDefault() {} }]);
      });
      assert.equal(manager.calls.filter(call => call.options.method === 'POST').length, 1);
      await manager.act(() => pending.resolve(categoriaReply(categoriaDuvidaFixture, 201)));
      assert.match(manager.html(), /Categoria salva com sucesso/);
      assert.equal(manager.calls.filter(call => call.options.method === 'POST').length, 1);
    } finally { await manager.restore(); }
  });
  it('404 na consulta de edição não abre formulário com dados antigos', async () => {
    const manager = await mountCategories(async url => url.pathname.endsWith('/21')
      ? categoriaReply({ success: false }, 404) : categoriaList());
    try {
      await manager.click('Editar Matrícula'); assert.match(manager.html(), /não foi encontrado/);
      assert.equal(manager.nodes().some(node => node.type === 'form'), false);
    } finally { await manager.restore(); }
  });
  for (const outcome of [401, 403, 404, 'network'] as const) {
    it('leitura com ' + outcome + ' mostra erro, nunca lista vazia; permite repetição', async () => {
      let failed = false;
      const manager = await mountCategories(async () => {
        if (failed) return categoriaList(); failed = true;
        if (outcome === 'network') throw new TypeError('Failed to fetch');
        return categoriaReply({ success: false, errors: [outcome === 401 ? 'nao_autenticado' : outcome === 403 ? 'sem_permissao' : 'http_404'] }, outcome);
      });
      try {
        assert.match(manager.html(), /role="alert"/); assert.doesNotMatch(manager.html(), /Nenhuma categoria cadastrada/);
        // O cliente existente encerra a sessão em 401; a repetição simula um novo login.
        if (outcome === 401) setStoredTokens({ access_token: 'category-ui-user', refresh_token: 'category-ui-refresh' });
        await manager.click('Tentar novamente'); assert.match(manager.html(), /Matrícula/); assert.equal(manager.calls.length, 2);
      } finally { await manager.restore(); }
    });
  }
  it('falha de recarga após gravação não repete POST nem desfaz sucesso confirmado', async () => {
    let written = false;
    const manager = await mountCategories(async (_url, options) => {
      if (options.method === 'POST') { written = true; return categoriaReply(categoriaDuvidaFixture, 201); }
      return written ? categoriaReply({ success: false }, 503) : categoriaList([]);
    });
    try {
      await manager.click('Nova categoria'); await manager.change('nome', 'Matrícula'); await manager.submit();
      assert.match(manager.html(), /Categoria salva com sucesso/); assert.match(manager.html(), /role="alert"/);
      assert.equal(manager.calls.filter(call => call.options.method === 'POST').length, 1);
    } finally { await manager.restore(); }
  });
  it('excluir último item de página volta à última página oficial disponível', async () => {
    let deleted = false;
    const manager = await mountCategories(async (url, options) => {
      if (options.method === 'DELETE') { deleted = true; return categoriaReply(null, 204); }
      const page = Number(url.searchParams.get('page'));
      return categoriaList(deleted && page === 2 ? [] : [categoriaDuvidaFixture], {
        current_page: page, total_pages: deleted ? 1 : 2, total_count: deleted ? 10 : 11, per_page: 10,
      });
    });
    try {
      await manager.click('Próxima'); await manager.click('Excluir Matrícula'); await manager.click('Confirmar exclusão');
      assert.match(manager.html(), /Página 1 de 1 · 10 categorias/);
      assert.equal(manager.calls.at(-1)?.url.searchParams.get('page'), '1');
    } finally { await manager.restore(); }
  });
  it('Strict Mode não duplica a leitura inicial', async () => {
    const manager = await mountCategories(async () => categoriaList(), true);
    try { assert.equal(manager.calls.length, 1); } finally { await manager.restore(); }
  });
  it('resposta de gravação após desmontagem não dispara nova listagem', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountCategories(async (_url, options) => options.method === 'PATCH' ? pending.promise : categoriaList());
    try {
      const toggle = manager.nodes().find(node => node.props['aria-label'] === 'Desativar Matrícula'); assert.ok(toggle);
      await manager.act(() => { void Reflect.apply(toggle.props.onClick as () => unknown, undefined, []); });
      await manager.unmount(); await manager.act(() => pending.resolve(categoriaReply({ ...categoriaDuvidaFixture, ativo: false })));
      assert.equal(manager.calls.length, 2);
    } finally { await manager.restore(); }
  });
});

// Lote C2 — fixtures restritas aos testes e rede integralmente interceptada.
const duvidaFixture: DDuvida = {
  id: 31, pergunta: 'Como faço minha matrícula?', resposta: 'Procure a secretaria.',
  d_categoria_duvida_id: 21, categoria_nome: 'Matrícula', n_status_noticia_id: 1,
  status: 'aguardando', status_nome: 'Aguardando aprovação', autor_id: 9, autor_nome: 'Autora sintética',
  avaliado_por_id: null, avaliado_por_nome: null, created_by: '9', updated_by: null,
  created_at: '2026-10-31T12:00:00Z', updated_at: '2026-10-31T12:00:00Z',
};
const duvidaInput: DDuvidaInput = { d_categoria_duvida_id: 21, pergunta: duvidaFixture.pergunta, resposta: duvidaFixture.resposta };
function duvidaList(items = [duvidaFixture], pagination = {
  current_page: 1, total_pages: items.length ? 1 : 0, total_count: items.length, per_page: 10,
}) {
  return categoriaReply({ success: true, message: 'Resultado sintético', data: { items, pagination } });
}
function mountDuvidas(fetcher: (url: URL, options: RequestInit) => Promise<Response>, strict = false, component = () => FaqModule()) {
  return mountCategories(fetcher, strict, { component, allowedPaths: /\/(?:d_categorias_duvida|d_duvidas(?:\/\d+(?:\/(?:publicar|reprovar|despublicar))?)?)$/ });
}

describe('Dúvidas C2 — oito endpoints autenticados', () => {
  const service = medtecApi.duvidas;
  const operations = {
    list: () => service.list({ page: 2, per_page: 5, 'q[pergunta_cont]': 'matrícula', 'q[d_categoria_duvida_id_eq]': 21, 'q[n_status_noticia_slug_eq]': 'aguardando' }),
    get: () => service.get(31), create: () => service.create(duvidaInput), update: () => service.update(31, duvidaInput),
    delete: () => service.delete(31), publicar: () => service.publicar(31), reprovar: () => service.reprovar(31), despublicar: () => service.despublicar(31),
  };
  for (const operation of ['list', 'get', 'create', 'update', 'delete', 'publicar', 'reprovar', 'despublicar'] as const) {
    it(operation + ': método, Bearer, formato e corpo oficiais', async () => {
      setStoredTokens({ access_token: 'duvida-user', refresh_token: 'duvida-refresh' });
      const calls: { url: URL; options: RequestInit }[] = [];
      const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options: RequestInit = {}) => {
        calls.push({ url: new URL(String(input)), options });
        if (operation === 'list') return duvidaList([duvidaFixture], { current_page: 2, total_pages: 4, total_count: 18, per_page: 5 });
        return categoriaReply(duvidaFixture, operation === 'create' ? 201 : operation === 'delete' ? 204 : 200);
      });
      try {
        const result = await operations[operation](); assert.equal(calls.length, 1);
        const { url, options } = calls[0];
        const editorial = ['publicar', 'reprovar', 'despublicar'].includes(operation);
        const suffix = ['get', 'update', 'delete'].includes(operation) || editorial ? '/31' : '';
        assert.ok(url.pathname.endsWith('/d_duvidas' + suffix + (editorial ? '/' + operation : '')));
        assert.equal(options.method, { list: 'GET', get: 'GET', create: 'POST', update: 'PATCH', delete: 'DELETE', publicar: 'PATCH', reprovar: 'PATCH', despublicar: 'PATCH' }[operation]);
        assert.equal(new Headers(options.headers).get('Authorization'), 'Bearer duvida-user');
        if (operation === 'create' || operation === 'update') assert.deepEqual(JSON.parse(String(options.body)), { d_duvida: duvidaInput });
        else assert.equal(options.body, undefined, 'Consulta, exclusão e decisões editoriais não enviam corpo ou motivo');
        if (operation === 'list') {
          assert.deepEqual(url.searchParams.get('q[pergunta_cont]'), 'matrícula');
          assert.equal(url.searchParams.get('q[d_categoria_duvida_id_eq]'), '21');
          assert.equal(url.searchParams.get('q[n_status_noticia_slug_eq]'), 'aguardando');
          assert.equal(url.searchParams.get('page'), '2'); assert.equal(url.searchParams.get('per_page'), '5');
          assert.deepEqual(result, { success: true, message: 'Resultado sintético', data: { items: [duvidaFixture], pagination: { current_page: 2, total_pages: 4, total_count: 18, per_page: 5 } } });
        } else if (operation === 'delete') assert.equal(result, undefined);
        else assert.deepEqual(result, duvidaFixture);
      } finally { fetcher.mock.restore(); clearStoredTokens(); }
    });
  }
  for (const method of ['create', 'update'] as const) {
    it(method + ' descarta campos extras do modelo legado e campos controlados pelo servidor', async () => {
      const fetcher = mock.method(globalThis, 'fetch', async (_input: RequestInfo | URL, options?: RequestInit) => {
        assert.deepEqual(JSON.parse(String(options?.body)), { d_duvida: duvidaInput });
        return categoriaReply(duvidaFixture);
      });
      const extra = { ...duvidaInput, autor_id: 999, status: 'publicada', motivo: 'não permitido', motivo_reprovacao: 'não permitido', tags: ['legado'], personas: ['gestores'], actionLink: { href: '/faq' } };
      try { if (method === 'create') await service.create(extra); else await service.update(31, extra); }
      finally { fetcher.mock.restore(); }
    });
  }
  it('reutiliza cancelamento do cliente e preserva avaliador nulo', async () => {
    const controller = new AbortController();
    const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
      assert.equal(options?.signal, controller.signal);
      return String(input).includes('/31') ? categoriaReply(duvidaFixture) : duvidaList([]);
    });
    try {
      const result = await service.list({ page: 1 }, controller.signal);
      assert.equal(result.data.pagination.total_count, 0); assert.deepEqual(result.data.items, []);
      assert.equal((await service.get(31, controller.signal)).avaliado_por_id, null);
    } finally { fetcher.mock.restore(); }
  });
  for (const [status, operation] of [[401, 'list'], [403, 'publicar'], [403, 'reprovar'], [403, 'delete'], [404, 'get'], [422, 'create'], [422, 'update']] as const) {
    it(operation + ' propaga HTTP ' + status, async () => {
      let count = 0;
      const fetcher = mock.method(globalThis, 'fetch', async () => {
        count++; return categoriaReply({ success: false, message: 'Falha sintética', errors: [status === 401 ? 'nao_autenticado' : status === 403 ? 'sem_permissao' : 'Pergunta inválida'] }, status);
      });
      try {
        await assert.rejects(operations[operation](), error => error instanceof ApiError && error.status === status);
        assert.equal(count, 1);
      } finally { fetcher.mock.restore(); }
    });
  }
  it('erro de rede não vira sucesso ou vazio', async () => {
    const fetcher = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
    try { await assert.rejects(service.list(), error => error instanceof ApiError && error.status === 0); }
    finally { fetcher.mock.restore(); }
  });
  for (const payload of [null, {}, { success: false }, { success: true, data: { items: [] } },
    { success: true, data: { items: [duvidaFixture], pagination: { current_page: 1, total_pages: 1, total_count: 1, per_page: 0 } } },
    { success: true, data: { items: [{ ...duvidaFixture, status: 'rascunho' }], pagination: { current_page: 1, total_pages: 1, total_count: 1, per_page: 10 } } }]) {
    it('rejeita resposta inválida: ' + JSON.stringify(payload), async () => {
      const fetcher = mock.method(globalThis, 'fetch', async () => categoriaReply(payload));
      try { await assert.rejects(service.list(), /Resposta inválida/); } finally { fetcher.mock.restore(); }
    });
  }
  it('objeto individual não aceita envelope indevido', async () => {
    const fetcher = mock.method(globalThis, 'fetch', async () => categoriaReply({ success: true, data: duvidaFixture }));
    try { await assert.rejects(service.get(31), /Resposta inválida/); } finally { fetcher.mock.restore(); }
  });
});

describe('Dúvidas C2 — interface e fluxo editorial', () => {
  function backend(read: (url: URL, options: RequestInit) => Promise<Response>) {
    return async (url: URL, options: RequestInit) => url.pathname.endsWith('/d_categorias_duvida') ? categoriaList() : read(url, options);
  }
  async function fill(manager: Awaited<ReturnType<typeof mountDuvidas>>) {
    await manager.change('d_categoria_duvida_id', '21');
    await manager.change('pergunta', duvidaFixture.pergunta); await manager.change('resposta', duvidaFixture.resposta);
  }
  it('listagem pendente apresenta carregamento; vazio oficial aparece somente após sucesso', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountDuvidas(backend(() => pending.promise));
    try {
      assert.match(manager.html(), /Carregando dúvidas/); assert.doesNotMatch(manager.html(), /Nenhuma dúvida/);
      await manager.act(() => pending.resolve(duvidaList([])));
      assert.match(manager.html(), /Nenhuma dúvida encontrada/); assert.doesNotMatch(manager.html(), /role="alert"/);
    } finally { await manager.restore(); }
  });
  it('pagina e envia os três filtros ao backend, reiniciando a página e preservando-os na navegação', async () => {
    const manager = await mountDuvidas(backend(async url => duvidaList([duvidaFixture], {
      current_page: Number(url.searchParams.get('page')), total_pages: 3, total_count: 25, per_page: 10,
    })));
    try {
      await manager.click('Próxima'); assert.match(manager.html(), /Página 2 de 3 · 25 dúvidas/);
      const before = manager.calls.length;
      await manager.change('busca', ' certificado '); await manager.change('categoriaFiltro', '21'); await manager.change('situacaoFiltro', 'reprovada');
      assert.equal(manager.calls.length, before, 'Alterar campos só consulta ao aplicar os filtros');
      await manager.submit('Filtros de dúvidas');
      const url = manager.calls.at(-1)!.url;
      assert.equal(url.searchParams.get('page'), '1'); assert.equal(url.searchParams.get('per_page'), '10');
      assert.equal(url.searchParams.get('q[pergunta_cont]'), 'certificado');
      assert.equal(url.searchParams.get('q[d_categoria_duvida_id_eq]'), '21');
      assert.equal(url.searchParams.get('q[n_status_noticia_slug_eq]'), 'reprovada');
      assert.match(manager.html(), /Como faço minha matrícula/, 'A interface usa a coleção recebida e não um filtro local da página');
      await manager.click('Próxima'); assert.equal(manager.calls.at(-1)!.url.searchParams.get('q[pergunta_cont]'), 'certificado');
      await manager.click('Limpar filtros');
      assert.equal(manager.calls.at(-1)!.url.searchParams.has('q[pergunta_cont]'), false);
      assert.equal(manager.calls.at(-1)!.url.searchParams.get('page'), '1');
    } finally { await manager.restore(); }
  });
  for (const status of ['aguardando', 'publicada'] as const) {
    it('cadastro aceita a situação ' + status + ' definida pelo Rails', async () => {
      let created = false;
      const value = { ...duvidaFixture, status, status_nome: status === 'publicada' ? 'Publicada' : 'Aguardando aprovação' };
      const manager = await mountDuvidas(backend(async (_url, options) => {
        if (options.method === 'POST') { assert.deepEqual(JSON.parse(String(options.body)), { d_duvida: duvidaInput }); created = true; return categoriaReply(value, 201); }
        return duvidaList(created ? [value] : []);
      }));
      try {
        await manager.click('Nova dúvida'); await fill(manager); await manager.submit('Criar dúvida');
        assert.match(manager.html(), new RegExp('Situação: ' + value.status_nome)); assert.equal(created, true);
        assert.deepEqual(manager.calls.filter(call => call.url.pathname.endsWith('/d_duvidas')).map(call => call.options.method), ['GET', 'POST', 'GET']);
      } finally { await manager.restore(); }
    });
  }
  it('formulário exige categoria, pergunta e resposta sem enviar dados inválidos', async () => {
    const manager = await mountDuvidas(backend(async () => duvidaList([])));
    try {
      await manager.click('Nova dúvida'); await manager.submit('Criar dúvida');
      assert.match(manager.html(), /Selecione a categoria e preencha/);
      await fill(manager); await manager.change('resposta', '   '); await manager.submit('Criar dúvida');
      assert.equal(manager.calls.filter(call => call.options.method !== 'GET').length, 0);
    } finally { await manager.restore(); }
  });
  it('edição usa GET individual e mostra reprovada → aguardando conforme resposta oficial', async () => {
    let saved = false;
    const rejected = { ...duvidaFixture, status: 'reprovada' as const, status_nome: 'Reprovada' };
    const manager = await mountDuvidas(backend(async (url, options) => {
      if (options.method === 'PATCH') {
        assert.deepEqual(JSON.parse(String(options.body)), { d_duvida: { ...duvidaInput, resposta: 'Resposta corrigida.' } });
        saved = true; return categoriaReply({ ...duvidaFixture, resposta: 'Resposta corrigida.' });
      }
      if (url.pathname.endsWith('/31')) return categoriaReply(rejected);
      return duvidaList([saved ? { ...duvidaFixture, resposta: 'Resposta corrigida.' } : rejected]);
    }));
    try {
      await manager.click('Editar ' + duvidaFixture.pergunta);
      assert.ok(manager.calls.some(call => call.url.pathname.endsWith('/d_duvidas/31') && call.options.method === 'GET'));
      await manager.change('resposta', 'Resposta corrigida.'); await manager.submit('Editar dúvida');
      assert.match(manager.html(), /Situação: Aguardando aprovação/); assert.match(manager.html(), /Resposta corrigida/);
    } finally { await manager.restore(); }
  });
  for (const [action, initial, status, label] of [
    ['publicar', 'aguardando', 'publicada', 'Publicar'],
    ['reprovar', 'aguardando', 'reprovada', 'Reprovar'],
    ['despublicar', 'publicada', 'aguardando', 'Despublicar'],
  ] as const) {
    it(label + ' usa PATCH próprio sem corpo e recarrega o resultado', async () => {
      let done = false;
      const value = { ...duvidaFixture, status, status_nome: status === 'publicada' ? 'Publicada' : status === 'reprovada' ? 'Reprovada' : 'Aguardando aprovação', avaliado_por_id: 7, avaliado_por_nome: 'Avaliadora sintética' };
      const manager = await mountDuvidas(backend(async (url, options) => {
        if (options.method === 'PATCH') {
          assert.ok(url.pathname.endsWith('/31/' + action)); assert.equal(options.body, undefined);
          done = true; return categoriaReply(value);
        }
        return duvidaList([done ? value : { ...duvidaFixture, status: initial }]);
      }));
      try {
        await manager.click(label + ' ' + duvidaFixture.pergunta);
        assert.match(manager.html(), new RegExp('Situação: ' + value.status_nome)); assert.match(manager.html(), /Avaliadora sintética/);
        assert.equal(manager.calls.filter(call => call.url.pathname.endsWith('/d_duvidas')).length, 2);
        assert.equal(manager.nodes().some(node => node.props.name === 'motivo'), false);
      } finally { await manager.restore(); }
    });
  }
  it('não presume publicação pelo botão acionado quando a API retorna aguardando', async () => {
    const manager = await mountDuvidas(backend(async (_url, options) => options.method === 'PATCH' ? categoriaReply(duvidaFixture) : duvidaList()));
    try {
      await manager.click('Publicar ' + duvidaFixture.pergunta);
      assert.match(manager.html(), /Situação: Aguardando aprovação/); assert.doesNotMatch(manager.html(), /publicada com sucesso/i);
    } finally { await manager.restore(); }
  });
  it('exclusão requer confirmação, aceita 204 e atualiza a lista', async () => {
    let deleted = false;
    const manager = await mountDuvidas(backend(async (_url, options) => {
      if (options.method === 'DELETE') { deleted = true; return categoriaReply(null, 204); }
      return duvidaList(deleted ? [] : [duvidaFixture]);
    }));
    try {
      await manager.click('Excluir ' + duvidaFixture.pergunta); assert.equal(deleted, false);
      await manager.click('Cancelar exclusão'); assert.equal(deleted, false);
      await manager.click('Excluir ' + duvidaFixture.pergunta); await manager.click('Confirmar exclusão');
      assert.match(manager.html(), /Dúvida excluída com sucesso/); assert.match(manager.html(), /Nenhuma dúvida/);
    } finally { await manager.restore(); }
  });
  for (const action of ['Publicar', 'Reprovar', 'Despublicar', 'Excluir'] as const) {
    it('403 em ' + action + ' não produz sucesso nem muda a situação', async () => {
      const value = { ...duvidaFixture, status: action === 'Despublicar' ? 'publicada' as const : 'aguardando' as const,
        status_nome: action === 'Despublicar' ? 'Publicada' : 'Aguardando aprovação' };
      const manager = await mountDuvidas(backend(async (_url, options) => options.method === 'GET' ? duvidaList([value])
        : categoriaReply({ success: false, errors: ['sem_permissao'] }, 403)));
      try {
        await manager.click(action + ' ' + duvidaFixture.pergunta);
        if (action === 'Excluir') await manager.click('Confirmar exclusão');
        assert.match(manager.html(), /não possui permissão/); assert.doesNotMatch(manager.html(), /Dúvida atualizada|Dúvida excluída com sucesso/);
        assert.match(manager.html(), /Como faço minha matrícula/);
        assert.ok(manager.nodes().some(node => node.props['aria-label'] === (action === 'Despublicar' ? 'Despublicar ' : 'Publicar ') + duvidaFixture.pergunta));
        assert.equal(manager.calls.filter(call => call.url.pathname.endsWith('/d_duvidas')).length, 1);
      } finally { await manager.restore(); }
    });
  }
  for (const status of [401, 403, 404, 422, 'network'] as const) {
    it('leitura com ' + status + ' informa falha sem falso vazio e permite repetir', async () => {
      let failed = false;
      const manager = await mountDuvidas(backend(async () => {
        if (failed) return duvidaList(); failed = true;
        if (status === 'network') throw new TypeError('Failed to fetch');
        return categoriaReply({ success: false, message: 'Falha de leitura', errors: [status === 401 ? 'nao_autenticado' : status === 403 ? 'sem_permissao' : 'Filtro inválido'] }, status);
      }));
      try {
        assert.match(manager.html(), /role="alert"/); assert.doesNotMatch(manager.html(), /Nenhuma dúvida/);
        if (status === 401) setStoredTokens({ access_token: 'category-ui-user', refresh_token: 'category-ui-refresh' });
        await manager.click('Tentar novamente'); assert.match(manager.html(), /Como faço minha matrícula/);
      } finally { await manager.restore(); }
    });
  }
  for (const [method, status] of [['create', 422], ['create', 403], ['edit', 422], ['edit', 404]] as const) {
    it(method + ': HTTP ' + status + ' preserva formulário e resposta sem sucesso falso', async () => {
      const manager = await mountDuvidas(backend(async (url, options) => {
        if (options.method === 'POST' || options.method === 'PATCH') return categoriaReply({ success: false, message: 'Não foi possível salvar', errors: [status === 403 ? 'sem_permissao' : 'Pergunta inválida'] }, status);
        return url.pathname.endsWith('/31') ? categoriaReply(duvidaFixture) : duvidaList();
      }));
      try {
        await manager.click(method === 'create' ? 'Nova dúvida' : 'Editar ' + duvidaFixture.pergunta);
        if (method === 'create') await fill(manager);
        await manager.change('resposta', 'Conteúdo preservado.'); await manager.submit(method === 'create' ? 'Criar dúvida' : 'Editar dúvida');
        assert.match(manager.html(), /role="alert"/); assert.match(manager.html(), /Conteúdo preservado/);
        assert.doesNotMatch(manager.html(), /Dúvida cadastrada\.|Dúvida salva\./);
      } finally { await manager.restore(); }
    });
  }
  it('consulta individual 404 não abre editor com dados obsoletos', async () => {
    const manager = await mountDuvidas(backend(async url => url.pathname.endsWith('/31') ? categoriaReply({ success: false }, 404) : duvidaList()));
    try {
      await manager.click('Editar ' + duvidaFixture.pergunta); assert.match(manager.html(), /não foi encontrado/);
      assert.equal(manager.nodes().some(node => node.props['aria-label'] === 'Editar dúvida'), false);
    } finally { await manager.restore(); }
  });
  it('reutiliza a listagem C1 e isola falha de categorias sem apagar dúvidas', async () => {
    let failed = true;
    const manager = await mountDuvidas(async url => {
      if (url.pathname.endsWith('/d_categorias_duvida')) {
        assert.equal(url.searchParams.get('page'), 'all');
        return failed ? categoriaReply({ success: false, errors: ['sem_permissao'] }, 403) : categoriaList();
      }
      return duvidaList();
    });
    try {
      assert.match(manager.html(), /Não foi possível carregar as categorias/); assert.match(manager.html(), /Como faço minha matrícula/);
      const create = manager.nodes().find(node => node.props.children === 'Nova dúvida'); assert.equal(create?.props.disabled, true);
      failed = false; await manager.click('Recarregar categorias'); await manager.click('Nova dúvida');
      assert.ok(manager.nodes().some(node => node.type === 'option' && node.props.value === 21));
      assert.equal(manager.calls.filter(call => call.url.pathname.endsWith('/d_duvidas')).length, 1);
    } finally { await manager.restore(); }
  });
  it('catálogo vazio impede cadastro sem inventar categorias', async () => {
    const manager = await mountDuvidas(async url => url.pathname.endsWith('/d_categorias_duvida') ? categoriaList([]) : duvidaList());
    try {
      assert.match(manager.html(), /Cadastre uma categoria na aba Categorias/);
      assert.equal(manager.nodes().find(node => node.props.children === 'Nova dúvida')?.props.disabled, true);
    } finally { await manager.restore(); }
  });
  it('retornar da aba C1 atualiza categorias sem perder o rascunho de dúvida', async () => {
    let active = true; let name = 'Matrícula';
    const manager = await mountDuvidas(async url => url.pathname.endsWith('/d_categorias_duvida')
      ? categoriaList([{ ...categoriaDuvidaFixture, nome: name }]) : duvidaList(), false, () => FaqModule({ active }));
    try {
      await manager.click('Nova dúvida'); await fill(manager); await manager.change('resposta', 'Rascunho mantido.');
      active = false; await manager.render(); const reads = manager.calls.length;
      name = 'Matrículas atualizadas'; active = true; await manager.render();
      assert.equal(manager.calls.length, reads + 2); assert.match(manager.html(), /Matrículas atualizadas/); assert.match(manager.html(), /Rascunho mantido/);
    } finally { await manager.restore(); }
  });
  it('sucesso de escrita com recarga falha informa ambos sem repetir a escrita', async () => {
    let written = false;
    const manager = await mountDuvidas(backend(async (_url, options) => {
      if (options.method === 'POST') { written = true; return categoriaReply(duvidaFixture, 201); }
      return written ? categoriaReply({ success: false }, 503) : duvidaList([]);
    }));
    try {
      await manager.click('Nova dúvida'); await fill(manager); await manager.submit('Criar dúvida');
      assert.match(manager.html(), /Dúvida cadastrada/); assert.match(manager.html(), /role="alert"/);
      assert.equal(manager.calls.filter(call => call.options.method === 'POST').length, 1);
    } finally { await manager.restore(); }
  });
  it('Strict Mode não duplica leituras iniciais de dúvidas e categorias', async () => {
    const manager = await mountDuvidas(backend(async () => duvidaList()), true);
    try { assert.equal(manager.calls.length, 2); } finally { await manager.restore(); }
  });
  it('resposta anterior aos filtros não substitui a leitura vigente', async () => {
    const pending = adminReturnDeferred<Response>(); let reads = 0;
    const manager = await mountDuvidas(backend(async () => ++reads === 1 ? pending.promise : duvidaList([{ ...duvidaFixture, pergunta: 'Resultado vigente' }])));
    try {
      await manager.change('busca', 'vigente'); await manager.submit('Filtros de dúvidas'); assert.match(manager.html(), /Resultado vigente/);
      await manager.act(() => pending.resolve(duvidaList([{ ...duvidaFixture, pergunta: 'Resposta obsoleta' }])));
      assert.match(manager.html(), /Resultado vigente/); assert.doesNotMatch(manager.html(), /Resposta obsoleta/);
    } finally { await manager.restore(); }
  });
  it('duplo clique em decisão editorial não duplica PATCH pendente', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountDuvidas(backend(async (_url, options) => options.method === 'PATCH' ? pending.promise : duvidaList()));
    try {
      const button = manager.nodes().find(node => node.props['aria-label'] === 'Publicar ' + duvidaFixture.pergunta); assert.ok(button);
      await manager.act(() => { for (let i = 0; i < 2; i++) void Reflect.apply(button.props.onClick as () => unknown, undefined, []); });
      assert.equal(manager.calls.filter(call => call.options.method === 'PATCH').length, 1);
      await manager.act(() => pending.resolve(categoriaReply(duvidaFixture)));
    } finally { await manager.restore(); }
  });
  it('decisão concluída após desmontagem não dispara recarga', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountDuvidas(backend(async (_url, options) => options.method === 'PATCH' ? pending.promise : duvidaList()));
    try {
      const button = manager.nodes().find(node => node.props['aria-label'] === 'Reprovar ' + duvidaFixture.pergunta); assert.ok(button);
      await manager.act(() => { void Reflect.apply(button.props.onClick as () => unknown, undefined, []); });
      await manager.unmount(); await manager.act(() => pending.resolve(categoriaReply({ ...duvidaFixture, status: 'reprovada' })));
      assert.equal(manager.calls.filter(call => call.url.pathname.endsWith('/d_duvidas')).length, 1);
    } finally { await manager.restore(); }
  });
  it('exclusão do último item de página retorna à última página válida', async () => {
    let deleted = false;
    const manager = await mountDuvidas(backend(async (url, options) => {
      if (options.method === 'DELETE') { deleted = true; return categoriaReply(null, 204); }
      const page = Number(url.searchParams.get('page'));
      return duvidaList(deleted && page === 2 ? [] : [duvidaFixture], { current_page: page, total_pages: deleted ? 1 : 2, total_count: deleted ? 10 : 11, per_page: 10 });
    }));
    try {
      await manager.click('Próxima'); await manager.click('Excluir ' + duvidaFixture.pergunta); await manager.click('Confirmar exclusão');
      assert.match(manager.html(), /Página 1 de 1 · 10 dúvidas/);
    } finally { await manager.restore(); }
  });
});

// Lote C3 — fixtures exclusivas dos testes, sem comunicação com o backend.
const visitanteFixture: DDuvidaVisitante = {
  id: 41, nome: 'Ana sintética', email: 'ana@example.invalid', telefone: null,
  descricao: 'Tem curso de informática no meu polo?', respondida: false,
  respondida_por_id: null, respondida_por_nome: null, respondida_em: null,
  created_at: '2026-10-31T12:00:00Z', updated_at: '2026-10-31T12:00:00Z',
};
const visitanteRespondida: DDuvidaVisitante = { ...visitanteFixture, respondida: true,
  respondida_por_id: 9, respondida_por_nome: 'Atendente sintética', respondida_em: '2026-10-31T13:30:00Z' };
function visitanteList(items = [visitanteFixture], pagination = {
  current_page: 1, total_pages: items.length ? 1 : 0, total_count: items.length, per_page: 10,
}) {
  return categoriaReply({ success: true, message: 'Resultado sintético', data: { items, pagination } });
}
function mountVisitantes(fetcher: (url: URL, options: RequestInit) => Promise<Response>, strict = false) {
  return mountCategories(fetcher, strict, { component: () => DuvidasVisitanteModule(), allowedPaths: /\/d_duvidas_visitante(?:\/\d+(?:\/responder)?)?$/ });
}

describe('Visitantes C3 — quatro endpoints autenticados', () => {
  const service = medtecApi.duvidasVisitante;
  const operations = { list: () => service.list({ page: 2, per_page: 5 }), get: () => service.get(41),
    responder: () => service.responder(41), delete: () => service.delete(41) };
  for (const operation of ['list', 'get', 'responder', 'delete'] as const) {
    it(operation + ': URL, Bearer, método e resposta oficiais; nenhum corpo', async () => {
      setStoredTokens({ access_token: 'visitor-user', refresh_token: 'visitor-refresh' });
      const calls: { url: URL; options: RequestInit }[] = [];
      const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options: RequestInit = {}) => {
        calls.push({ url: new URL(String(input)), options });
        return operation === 'list' ? visitanteList([visitanteFixture], { current_page: 2, total_pages: 4, total_count: 18, per_page: 5 })
          : categoriaReply(operation === 'responder' ? visitanteRespondida : visitanteFixture, operation === 'delete' ? 204 : 200);
      });
      try {
        const result = await operations[operation](); assert.equal(calls.length, 1);
        const { url, options } = calls[0];
        assert.ok(url.pathname.endsWith('/d_duvidas_visitante' + (operation === 'list' ? '' : '/41') + (operation === 'responder' ? '/responder' : '')));
        assert.equal(options.method, { list: 'GET', get: 'GET', responder: 'PATCH', delete: 'DELETE' }[operation]);
        assert.equal(new Headers(options.headers).get('Authorization'), 'Bearer visitor-user'); assert.equal(options.body, undefined);
        if (operation === 'list') {
          assert.equal(url.searchParams.get('page'), '2'); assert.equal(url.searchParams.get('per_page'), '5');
          assert.deepEqual(result, { success: true, message: 'Resultado sintético', data: { items: [visitanteFixture], pagination: { current_page: 2, total_pages: 4, total_count: 18, per_page: 5 } } });
        } else assert.deepEqual(result, operation === 'delete' ? undefined : operation === 'responder' ? visitanteRespondida : visitanteFixture);
      } finally { fetcher.mock.restore(); clearStoredTokens(); }
    });
  }
  for (const key of ['q[respondida_false]', 'q[respondida_true]']) {
    it('serializa o filtro ' + key + '=1', async () => {
      const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
        const url = new URL(String(input)); assert.equal(url.searchParams.get(key), '1'); return visitanteList([]);
      });
      try { assert.equal((await service.list({ [key]: 1 })).data.pagination.total_count, 0); }
      finally { fetcher.mock.restore(); }
    });
  }
  it('leituras aceitam signal e preservam campos nulos', async () => {
    const controller = new AbortController();
    const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
      assert.equal(options?.signal, controller.signal); return String(input).includes('/41') ? categoriaReply(visitanteFixture) : visitanteList();
    });
    try {
      assert.deepEqual((await service.list({ page: 1 }, controller.signal)).data.items, [visitanteFixture]);
      assert.deepEqual(await service.get(41, controller.signal), visitanteFixture);
    } finally { fetcher.mock.restore(); }
  });
  for (const [status, operation] of [[401, 'list'], [403, 'responder'], [404, 'get'], [422, 'delete']] as const) {
    it(operation + ' propaga HTTP ' + status + ' sem fallback', async () => {
      let count = 0;
      const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
        count++; assert.ok(String(input).includes('/d_duvidas_visitante'));
        return categoriaReply({ success: false, message: 'Falha sintética', errors: [status === 401 ? 'nao_autenticado' : status === 403 ? 'sem_permissao' : 'Operação inválida'] }, status);
      });
      try { await assert.rejects(operations[operation](), error => error instanceof ApiError && error.status === status); assert.equal(count, 1); }
      finally { fetcher.mock.restore(); }
    });
  }
  it('erro de rede propaga ApiError de conexão', async () => {
    const fetcher = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
    try { await assert.rejects(service.list(), error => error instanceof ApiError && error.status === 0); }
    finally { fetcher.mock.restore(); }
  });
  for (const payload of [null, { success: false }, { success: true, data: { items: [] } },
    { success: true, data: { items: [visitanteFixture], pagination: { current_page: 1, total_pages: 1, total_count: -1, per_page: 10 } } },
    { success: true, data: { items: [{ ...visitanteFixture, respondida: 'sim' }], pagination: { current_page: 1, total_pages: 1, total_count: 1, per_page: 10 } } }]) {
    it('rejeita resposta inválida: ' + JSON.stringify(payload), async () => {
      const fetcher = mock.method(globalThis, 'fetch', async () => categoriaReply(payload));
      try { await assert.rejects(service.list(), /Resposta inválida/); } finally { fetcher.mock.restore(); }
    });
  }
  it('objeto individual não aceita envelope no lugar do DTO', async () => {
    const fetcher = mock.method(globalThis, 'fetch', async () => categoriaReply({ success: true, data: visitanteFixture }));
    try { await assert.rejects(service.get(41), /Resposta inválida/); } finally { fetcher.mock.restore(); }
  });
});

function DuvidasCounterProbe(enabled: boolean) {
  const state = useDuvidasPendentes(enabled);
  return createElement('output', null, state.error ?? String(state.count));
}

describe('Visitantes C3 — interface administrativa', () => {
  it('aba Visitantes fica dentro da guarda atual, com C1/C2 preservados e montagem sob demanda', () => {
    const page = AdminFaqSubroutePage(); assert.equal(page.type, AdminShell); assert.equal(page.props.activeSection, 'duvidas');
    const workspace = page.props.children();
    const html = renderToStaticMarkup(workspace); assert.match(html, />Visitantes</); assert.match(html, />Categorias</);
    for (const section of ['duvidas', 'categorias', 'visitantes']) {
      const state = mock.method(React, 'useState', (<S,>(initial?: S | (() => S)) => {
        const value = typeof initial === 'function' ? (initial as () => S)() : initial;
        return [value === 'duvidas' ? section : value, () => {}];
      }) as typeof React.useState);
      try {
        const tree = Reflect.apply(workspace.type as () => ReactNode, undefined, [workspace.props]);
        const nodes = noticeNodes(tree);
        assert.equal(nodes.filter(node => node.type === DuvidasVisitanteModule).length, section === 'visitantes' ? 1 : 0);
        assert.equal(nodes.filter(node => node.type === DuvidaCategoriesManager).length, section === 'categorias' ? 1 : 0);
        const faq = nodes.find(node => node.type === FaqModule); assert.ok(faq); assert.equal(faq.props.active, section === 'duvidas');
      } finally { state.mock.restore(); }
    }
  });
  it('contador consulta só o total das não respondidas e atualiza quando avisado', async () => {
    let total = 3;
    const view = await mountCategories(async () => visitanteList([visitanteFixture], { current_page: 1, total_pages: total, total_count: total, per_page: 1 }), false, {
      component: () => DuvidasCounterProbe(true),
      allowedPaths: /\/d_duvidas_visitante$/,
    });
    try {
      await view.act(async () => { await Promise.resolve(); });
      assert.match(view.html(), /<output>3<\/output>/);
      const { searchParams } = view.calls[0].url;
      assert.equal(searchParams.get('q[respondida_false]'), '1'); assert.equal(searchParams.get('per_page'), '1');
      total = 2;
      await view.act(() => notifyDuvidasPendentes());
      assert.match(view.html(), /<output>2<\/output>/);
    } finally { await view.restore(); }
  });
  it('contador desativado não consulta a API e falha vira erro, não zero', async () => {
    const off = await mountCategories(async () => visitanteList(), false, { component: () => DuvidasCounterProbe(false), allowedPaths: /$^/ });
    try { assert.equal(off.calls.length, 0); } finally { await off.restore(); }
    const failing = await mountCategories(async () => categoriaReply({ success: false, message: 'Sem permissão', errors: ['sem_permissao'] }, 403), false, {
      component: () => DuvidasCounterProbe(true),
      allowedPaths: /\/d_duvidas_visitante$/,
    });
    try {
      assert.match(failing.html(), /não possui permissão/); assert.doesNotMatch(failing.html(), /<output>0/);
    } finally { await failing.restore(); }
  });
  it('Início mostra o total, a indisponibilidade ou nada na sessão sem token', () => {
    const props = { indicators: {} as OverviewStatsIndicators, canAccessKanban: true, onOpenNews() {}, onCreateNews() {}, onOpenKanban() {} };
    const html = (duvidasPendentes?: { count: number | null; error: string | null }) => renderToStaticMarkup(createElement(AdminOverview, { ...props, duvidasPendentes }));
    assert.match(html({ count: 4, error: null }), /Dúvidas de visitantes sem resposta:\s*(<!-- -->)?\s*4/);
    assert.match(html({ count: null, error: 'x' }), /sem resposta:\s*(<!-- -->)?\s*indisponível/);
    assert.doesNotMatch(html(), /sem resposta/);
  });
  it('item do menu exibe o total sem depender da aba aberta', () => {
    const access = Object.fromEntries(['noticias','projetos','duvidas','avisos','fotos','galeria','professores','alunos','kanban','siteInfo','redes','estadosCidades','usuarios'].map(key => [key, true]));
    const item = buildAdminMenu(access as Parameters<typeof buildAdminMenu>[0], { duvidas: 7 }).flatMap(folder => folder.items).find(entry => entry.section === 'duvidas');
    assert.equal(item?.badge, 7);
  });
  it('Fila lista as não respondidas, responde sem corpo e tira o item da lista', async () => {
    let pendentes = [visitanteFixture];
    const view = await mountCategories(async (url, options) => {
      if (options.method === 'PATCH') { pendentes = []; return categoriaReply(visitanteRespondida); }
      return visitanteList(pendentes, { current_page: 1, total_pages: 1, total_count: pendentes.length, per_page: pendentes.length });
    }, false, { component: () => DuvidasVisitanteQueue(), allowedPaths: /\/d_duvidas_visitante(\/\d+\/responder)?$/ });
    const settle = async () => { for (let turn = 0; turn < 5; turn++) await Promise.resolve(); };
    try {
      await view.act(settle);
      assert.equal(view.calls[0].url.searchParams.get('q[respondida_false]'), '1');
      assert.equal(view.calls[0].url.searchParams.get('page'), 'all');
      assert.match(view.html(), /Tem curso de informática/);
      await view.click('Responder ' + visitanteFixture.nome);
      await view.act(settle);
      const patch = view.calls.find(call => call.options.method === 'PATCH')!;
      assert.ok(patch.url.pathname.endsWith('/d_duvidas_visitante/' + visitanteFixture.id + '/responder'));
      assert.equal(patch.options.body, undefined);
      assert.match(view.html(), /Dúvida marcada como respondida/);
      assert.match(view.html(), /Nenhuma dúvida sem resposta/, 'page=all sem registros (per_page 0) não é resposta inválida');
      assert.doesNotMatch(view.html(), /role="alert"/);
    } finally { await view.restore(); }
  });
  it('Fila mostra a falha de leitura e permite tentar de novo, sem falso vazio', async () => {
    let fail = true;
    const view = await mountCategories(async () => fail
      ? categoriaReply({ success: false, message: 'Sem permissão', errors: ['sem_permissao'] }, 403) : visitanteList([visitanteFixture]),
    false, { component: () => DuvidasVisitanteQueue(), allowedPaths: /\/d_duvidas_visitante$/ });
    const settle = async () => { for (let turn = 0; turn < 5; turn++) await Promise.resolve(); };
    try {
      await view.act(settle);
      assert.match(view.html(), /role="alert"/); assert.doesNotMatch(view.html(), /Nenhuma dúvida sem resposta/);
      fail = false;
      await view.click('Recarregar dúvidas de visitantes');
      await view.act(settle);
      assert.match(view.html(), /Tem curso de informática/);
    } finally { await view.restore(); }
  });
  it('per_page 0 só é aceito na lista vazia', async () => {
    const reply = (total_count: number, items: DDuvidaVisitante[]) => mock.method(globalThis, 'fetch', async () => categoriaReply({ success: true, data: { items, pagination: { current_page: 1, total_pages: 1, total_count, per_page: 0 } } }));
    const empty = reply(0, []);
    try { assert.deepEqual((await medtecApi.duvidasVisitante.list({ page: 'all' })).data.items, []); } finally { empty.mock.restore(); }
    const filled = reply(1, [visitanteFixture]);
    try { await assert.rejects(medtecApi.duvidasVisitante.list({ page: 'all' }), /Resposta inválida/); } finally { filled.mock.restore(); }
  });
  describe('Transformar em FAQ', () => {
    const settle = async () => { for (let turn = 0; turn < 5; turn++) await Promise.resolve(); };
    const respondida = { ...visitanteRespondida, id: 42, nome: 'Visitante atendido', descricao: 'Tem curso no polo?' };
    const faqFetcher = (posts: RequestInit[]) => async (url: URL, options: RequestInit) => {
      if (options.method === 'POST') { posts.push(options); return categoriaReply({ ...duvidaFixture, status: 'publicada', status_nome: 'Publicada' }, 201); }
      return url.pathname.endsWith('/d_categorias_duvida') ? categoriaList() : duvidaList([]);
    };

    it('botão só aparece em dúvida respondida e entrega o envio à tela do FAQ', async () => {
      let chosen: DDuvidaVisitante | undefined;
      const view = await mountCategories(async () => visitanteList([visitanteFixture, respondida]), false, {
        component: () => DuvidasVisitanteModule({ onTransformToFaq: item => { chosen = item; } }), allowedPaths: /\/d_duvidas_visitante$/,
      });
      try {
        assert.doesNotMatch(view.html(), new RegExp('Transformar em FAQ: ' + visitanteFixture.nome));
        await view.click('Transformar em FAQ: Visitante atendido');
        assert.equal(chosen?.id, 42);
      } finally { await view.restore(); }
    });
    it('formulário abre com a pergunta, pede categoria e resposta e só envia campos do contrato', async () => {
      const posts: RequestInit[] = [];
      let prefill: { pergunta: string } | null = null;
      const view = await mountDuvidas(faqFetcher(posts), false, () => FaqModule({ prefill }));
      try {
        await view.act(settle);
        prefill = { pergunta: respondida.descricao };
        await view.render();
        assert.match(view.html(), /Transformar dúvida de visitante em FAQ/);
        assert.match(view.html(), /Tem curso no polo\?/);
        assert.match(view.html(), /publicam no site ao salvar/);
        await view.submit('Criar dúvida');
        assert.match(view.html(), /Selecione a categoria e preencha a pergunta e a resposta/);
        assert.equal(posts.length, 0, 'A API não guarda resposta nem categoria da dúvida do visitante');
        await view.change('d_categoria_duvida_id', '21');
        await view.change('resposta', 'Sim, veja o polo mais próximo.');
        await view.submit('Criar dúvida');
        await view.act(settle);
        assert.deepEqual(JSON.parse(String(posts[0].body)), { d_duvida: { d_categoria_duvida_id: 21, pergunta: respondida.descricao, resposta: 'Sim, veja o polo mais próximo.' } });
        assert.match(view.html(), /Dúvida cadastrada\. Situação: Publicada\./, 'Mostra a situação devolvida pela API');
      } finally { await view.restore(); }
    });
    it('rascunho aberto não é substituído', async () => {
      let prefill: { pergunta: string } | null = null;
      const view = await mountDuvidas(faqFetcher([]), false, () => FaqModule({ prefill }));
      try {
        await view.act(settle);
        await view.click('Nova dúvida');
        await view.change('pergunta', 'Rascunho em andamento');
        prefill = { pergunta: respondida.descricao };
        await view.render();
        assert.match(view.html(), /Rascunho em andamento/);
        assert.doesNotMatch(view.html(), /Tem curso no polo/);
        assert.match(view.html(), /Conclua ou cancele o rascunho aberto/);
      } finally { await view.restore(); }
    });
    it('Fila oferece a ação depois de responder, levando só o id na URL', async () => {
      const view = await mountCategories(async (url, options) => options.method === 'PATCH' ? categoriaReply(respondida) : visitanteList([{ ...visitanteFixture, id: 42, nome: 'Visitante atendido' }]), false, {
        component: () => DuvidasVisitanteQueue(), allowedPaths: /\/d_duvidas_visitante(\/\d+\/responder)?$/,
      });
      const link = () => view.nodes().find(node => node.props['aria-label'] === 'Transformar em FAQ: Visitante atendido');
      try {
        await view.act(settle);
        assert.equal(link(), undefined);
        await view.click('Responder Visitante atendido');
        await view.act(settle);
        assert.equal(link()?.props.href, '/admin/faq?visitante=42');
      } finally { await view.restore(); }
    });
    it('carregador só aceita dúvida respondida e mostra a falha', async () => {
      const mount = (reply: () => Response, visitanteId: number) => mountCategories(async () => reply(), false, {
        component: () => VisitanteFaqDraftLoader({ visitanteId, onLoaded }), allowedPaths: /\/d_duvidas_visitante\/\d+$/,
      });
      const loaded: DDuvidaVisitante[] = [];
      const onLoaded = (item: DDuvidaVisitante) => { loaded.push(item); };
      const invalid = await mount(() => categoriaReply(respondida), Number.NaN);
      try { assert.equal(invalid.calls.length, 0); } finally { await invalid.restore(); }
      const answered = await mount(() => categoriaReply(respondida), 42);
      try { await answered.act(settle); assert.equal(loaded[0]?.id, 42); assert.equal(answered.calls[0].options.method, 'GET'); } finally { await answered.restore(); }
      const pending = await mount(() => categoriaReply(visitanteFixture), 41);
      try { await pending.act(settle); assert.equal(loaded.length, 1); assert.match(pending.html(), /Marque a dúvida como respondida/); } finally { await pending.restore(); }
      const missing = await mount(() => categoriaReply({ success: false, message: 'Registro não encontrado', errors: ['x'] }, 404), 99);
      try { await missing.act(settle); assert.match(missing.html(), /role="alert"/); } finally { await missing.restore(); }
    });
    it('tela do FAQ abre o formulário ao transformar um envio', async () => {
      const workspace = AdminFaqSubroutePage().props.children();
      const view = await mountCategories(async () => duvidaList([]), false, { component: () => Reflect.apply(workspace.type as () => ReactNode, undefined, [{}]), allowedPaths: /$^/ });
      try {
        await view.click('Visitantes');
        const modulo = view.nodes().find(node => node.type === DuvidasVisitanteModule);
        await view.act(() => (modulo?.props.onTransformToFaq as (item: DDuvidaVisitante) => void)(respondida));
        const faq = view.nodes().find(node => node.type === FaqModule);
        assert.equal(faq?.props.active, true);
        assert.deepEqual(faq?.props.prefill, { pergunta: respondida.descricao });
      } finally { await view.restore(); }
    });
    it('categorias vazias com page=all (per_page 0) não viram resposta inválida', async () => {
      const fetcher = mock.method(globalThis, 'fetch', async () => categoriaList([], { current_page: 1, total_pages: 1, total_count: 0, per_page: 0 }));
      try { assert.deepEqual((await medtecApi.categoriasDuvida.list({ page: 'all' })).data.items, []); } finally { fetcher.mock.restore(); }
    });
  });
  it('carregamento não exibe falso vazio; vazio confirmado não vira erro', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountVisitantes(() => pending.promise);
    try {
      assert.match(manager.html(), /Carregando dúvidas de visitantes/); assert.doesNotMatch(manager.html(), /Nenhuma dúvida de visitante/);
      await manager.act(() => pending.resolve(visitanteList([])));
      assert.match(manager.html(), /Nenhuma dúvida de visitante/); assert.doesNotMatch(manager.html(), /role="alert"/);
    } finally { await manager.restore(); }
  });
  it('filtros oficiais são exclusivos, reiniciam a página e persistem na paginação', async () => {
    const manager = await mountVisitantes(async url => visitanteList([visitanteFixture], { current_page: Number(url.searchParams.get('page')), total_pages: 3, total_count: 25, per_page: 10 }));
    try {
      assert.equal(manager.calls[0].url.searchParams.has('q[respondida_false]'), false);
      assert.equal(manager.calls[0].url.searchParams.has('q[respondida_true]'), false);
      await manager.click('Próxima'); assert.match(manager.html(), /Página 2 de 3 · 25 envios/);
      await manager.change('situacaoVisitante', 'pendentes');
      assert.equal(manager.calls.at(-1)!.url.searchParams.get('q[respondida_false]'), '1'); assert.equal(manager.calls.at(-1)!.url.searchParams.get('page'), '1');
      assert.equal(manager.calls.at(-1)!.url.searchParams.has('q[respondida_true]'), false);
      await manager.click('Próxima'); assert.equal(manager.calls.at(-1)!.url.searchParams.get('q[respondida_false]'), '1');
      await manager.change('situacaoVisitante', 'respondidas');
      assert.equal(manager.calls.at(-1)!.url.searchParams.get('q[respondida_true]'), '1'); assert.equal(manager.calls.at(-1)!.url.searchParams.has('q[respondida_false]'), false);
      assert.match(manager.html(), /Tem curso de informática/, 'A coleção da API é a fonte de verdade, sem filtro local');
      await manager.change('situacaoVisitante', 'todas'); assert.equal(manager.calls.at(-1)!.url.searchParams.has('q[respondida_true]'), false);
    } finally { await manager.restore(); }
  });
  it('envio novo aparece ao atualizar a lista, sem recarregar a página nem perder o filtro', async () => {
    let items = [visitanteFixture];
    const manager = await mountVisitantes(async url => url.pathname.endsWith('/41') ? categoriaReply(visitanteFixture) : visitanteList(items));
    const novo = { ...visitanteFixture, id: 42, nome: 'Visitante recém-chegado' };
    try {
      await manager.change('situacaoVisitante', 'pendentes');
      assert.doesNotMatch(manager.html(), /Visitante recém-chegado/);
      items = [novo, visitanteFixture];
      await manager.click('Atualizar lista');
      assert.match(manager.html(), /Visitante recém-chegado/);
      assert.equal(manager.calls.at(-1)!.url.searchParams.get('q[respondida_false]'), '1');
    } finally { await manager.restore(); }
  });
  it('lista é buscada ao voltar para a aba, salvo com detalhes abertos ou aba oculta', async () => {
    let items = [visitanteFixture];
    const manager = await mountVisitantes(async url => url.pathname.endsWith('/41') ? categoriaReply(visitanteFixture) : visitanteList(items));
    const lists = () => manager.calls.filter(call => call.url.pathname.endsWith('/d_duvidas_visitante')).length;
    try {
      const inicial = lists();
      await manager.visibilityChange('hidden'); assert.equal(lists(), inicial);
      items = [{ ...visitanteFixture, id: 42, nome: 'Visitante recém-chegado' }, visitanteFixture];
      await manager.visibilityChange('visible'); assert.equal(lists(), inicial + 1);
      assert.match(manager.html(), /Visitante recém-chegado/);
      await manager.click('Ver detalhes de ' + visitanteFixture.nome);
      await manager.visibilityChange('visible'); assert.equal(lists(), inicial + 1, 'Detalhes abertos não são interrompidos');
    } finally { await manager.restore(); }
  });
  it('falha ao atualizar mostra o erro, nunca uma lista vazia', async () => {
    let reply = () => visitanteList();
    const manager = await mountVisitantes(async () => reply());
    try {
      reply = () => categoriaReply({ success: false, message: 'Faça login para continuar.', errors: ['nao_autenticado'] }, 401);
      await manager.click('Atualizar lista');
      assert.match(manager.html(), /role="alert"/); assert.match(manager.html(), /precisa estar autenticado/);
      assert.doesNotMatch(manager.html(), /Nenhuma dúvida de visitante/);
    } finally { await manager.restore(); }
  });
  it('detalhes consultam ID e exibem a descrição completa e os contatos recebidos', async () => {
    const detailed = { ...visitanteFixture, telefone: '(69) 99999-0000', descricao: 'Descrição completa recebida na consulta individual.\nSegunda linha.' };
    const manager = await mountVisitantes(async url => url.pathname.endsWith('/41') ? categoriaReply(detailed) : visitanteList());
    try {
      await manager.click('Ver detalhes de ' + visitanteFixture.nome);
      assert.equal(manager.calls.at(-1)!.url.pathname.endsWith('/d_duvidas_visitante/41'), true);
      assert.match(manager.html(), /Descrição completa recebida na consulta individual/); assert.match(manager.html(), /Segunda linha/);
      assert.match(manager.html(), /ana@example.invalid/); assert.match(manager.html(), /99999-0000/);
      await manager.click('Fechar detalhes'); assert.doesNotMatch(manager.html(), /Detalhes do envio/);
      assert.equal(manager.calls.filter(call => call.options.method !== 'GET').length, 0);
    } finally { await manager.restore(); }
  });
  it('marcar respondida usa PATCH sem corpo e apenas registra atendimento externo', async () => {
    let marked = false;
    const manager = await mountVisitantes(async (url, options) => {
      if (options.method === 'PATCH') {
        assert.ok(url.pathname.endsWith('/41/responder')); assert.equal(options.body, undefined);
        marked = true; return categoriaReply(visitanteRespondida);
      }
      return visitanteList([marked ? visitanteRespondida : visitanteFixture]);
    });
    try {
      assert.match(manager.html(), /contato com o visitante é feito externamente/); assert.match(manager.html(), /nenhuma mensagem é enviada/);
      await manager.click('Marcar como respondida: ' + visitanteFixture.nome);
      assert.match(manager.html(), /Dúvida marcada como respondida/);
      assert.deepEqual(manager.calls.map(call => call.options.method), ['GET', 'PATCH', 'GET']);
      assert.equal(manager.nodes().some(node => node.props['aria-label'] === 'Marcar como respondida: ' + visitanteFixture.nome), false);
    } finally { await manager.restore(); }
  });
  it('marcação pelo detalhe atualiza atendente e data exclusivamente com o retorno do servidor', async () => {
    let marked = false;
    const manager = await mountVisitantes(async (url, options) => {
      if (options.method === 'PATCH') { marked = true; return categoriaReply(visitanteRespondida); }
      if (url.pathname.endsWith('/41')) return categoriaReply(visitanteFixture);
      return visitanteList([marked ? visitanteRespondida : visitanteFixture]);
    });
    try {
      await manager.click('Ver detalhes de ' + visitanteFixture.nome); await manager.click('Marcar detalhe como respondido');
      assert.match(manager.html(), /Atendente sintética/); assert.match(manager.html(), /31\/10\/2026/);
      assert.equal(manager.nodes().some(node => node.props['aria-label'] === 'Marcar detalhe como respondido'), false);
    } finally { await manager.restore(); }
  });
  it('filtro pendente pode ficar vazio após marcação bem-sucedida', async () => {
    let marked = false;
    const manager = await mountVisitantes(async (_url, options) => {
      if (options.method === 'PATCH') { marked = true; return categoriaReply(visitanteRespondida); }
      return visitanteList(marked ? [] : [visitanteFixture]);
    });
    try {
      await manager.change('situacaoVisitante', 'pendentes'); await manager.click('Marcar como respondida: ' + visitanteFixture.nome);
      assert.match(manager.html(), /Nenhuma dúvida de visitante/); assert.equal(manager.calls.at(-1)!.url.searchParams.get('q[respondida_false]'), '1');
    } finally { await manager.restore(); }
  });
  it('exclusão exige confirmação, permite cancelar e aceita 204 sem conteúdo', async () => {
    let deleted = false;
    const manager = await mountVisitantes(async (_url, options) => {
      if (options.method === 'DELETE') { deleted = true; return categoriaReply(null, 204); }
      return visitanteList(deleted ? [] : [visitanteFixture]);
    });
    try {
      await manager.click('Excluir envio de ' + visitanteFixture.nome); assert.equal(manager.calls.length, 1);
      await manager.click('Cancelar exclusão'); assert.equal(manager.calls.length, 1);
      await manager.click('Excluir envio de ' + visitanteFixture.nome); await manager.click('Confirmar exclusão');
      assert.match(manager.html(), /Envio excluído com sucesso/); assert.match(manager.html(), /Nenhuma dúvida de visitante/);
      assert.deepEqual(manager.calls.map(call => call.options.method), ['GET', 'DELETE', 'GET']);
    } finally { await manager.restore(); }
  });
  it('excluir pelos detalhes fecha o registro somente após sucesso', async () => {
    let deleted = false;
    const manager = await mountVisitantes(async (url, options) => {
      if (options.method === 'DELETE') { deleted = true; return categoriaReply(null, 204); }
      return url.pathname.endsWith('/41') ? categoriaReply(visitanteFixture) : visitanteList(deleted ? [] : [visitanteFixture]);
    });
    try {
      await manager.click('Ver detalhes de ' + visitanteFixture.nome); await manager.click('Excluir este envio');
      assert.match(manager.html(), /Detalhes do envio/); await manager.click('Confirmar exclusão');
      assert.doesNotMatch(manager.html(), /Detalhes do envio/); assert.match(manager.html(), /Envio excluído com sucesso/);
    } finally { await manager.restore(); }
  });
  for (const status of [401, 403, 404, 422, 'network'] as const) {
    it('listagem com ' + status + ' não vira vazio e permite nova leitura', async () => {
      let failed = false;
      const manager = await mountVisitantes(async () => {
        if (failed) return visitanteList(); failed = true;
        if (status === 'network') throw new TypeError('Failed to fetch');
        return categoriaReply({ success: false, message: 'Falha na consulta', errors: [status === 401 ? 'nao_autenticado' : status === 403 ? 'sem_permissao' : 'Consulta inválida'] }, status);
      });
      try {
        assert.match(manager.html(), /role="alert"/); assert.doesNotMatch(manager.html(), /Nenhuma dúvida de visitante/);
        if (status === 401) setStoredTokens({ access_token: 'category-ui-user', refresh_token: 'category-ui-refresh' });
        await manager.click('Tentar novamente'); assert.match(manager.html(), /Ana sintética/);
      } finally { await manager.restore(); }
    });
  }
  for (const status of [403, 404]) {
    it('detalhes HTTP ' + status + ' não abrem um registro da lista como se fosse consulta válida', async () => {
      const manager = await mountVisitantes(async url => url.pathname.endsWith('/41') ? categoriaReply({ success: false, errors: [status === 403 ? 'sem_permissao' : 'http_404'] }, status) : visitanteList());
      try {
        await manager.click('Ver detalhes de ' + visitanteFixture.nome);
        assert.match(manager.html(), /role="alert"/); assert.doesNotMatch(manager.html(), /Detalhes do envio/);
      } finally { await manager.restore(); }
    });
  }
  for (const status of [401, 403, 404, 422, 'network'] as const) {
    it('marcação com ' + status + ' não mostra sucesso nem altera situação localmente', async () => {
      const manager = await mountVisitantes(async (_url, options) => {
        if (options.method === 'GET') return visitanteList();
        if (status === 'network') throw new TypeError('Failed to fetch');
        return categoriaReply({ success: false, message: 'Não foi possível registrar o atendimento', errors: [status === 401 ? 'nao_autenticado' : status === 403 ? 'sem_permissao' : 'Atendimento inválido'] }, status);
      });
      try {
        await manager.click('Marcar como respondida: ' + visitanteFixture.nome);
        assert.match(manager.html(), /role="alert"/); assert.doesNotMatch(manager.html(), /Dúvida marcada como respondida/);
        assert.ok(manager.nodes().some(node => node.props['aria-label'] === 'Marcar como respondida: ' + visitanteFixture.nome));
        assert.equal(manager.calls.length, 2);
      } finally { await manager.restore(); }
    });
  }
  for (const status of [403, 422]) {
    it('exclusão com ' + status + ' preserva registro e confirmação sem sucesso fictício', async () => {
      const manager = await mountVisitantes(async (_url, options) => options.method === 'DELETE'
        ? categoriaReply({ success: false, message: 'Não foi possível excluir', errors: [status === 403 ? 'sem_permissao' : 'Exclusão recusada'] }, status) : visitanteList());
      try {
        await manager.click('Excluir envio de ' + visitanteFixture.nome); await manager.click('Confirmar exclusão');
        assert.match(manager.html(), /role="alert"/); assert.match(manager.html(), /Confirmar exclusão do envio/);
        assert.match(manager.html(), /Ana sintética/); assert.doesNotMatch(manager.html(), /Envio excluído com sucesso/);
        assert.equal(manager.calls.length, 2);
      } finally { await manager.restore(); }
    });
  }
  it('registro já respondido não apresenta outra ação de marcação', async () => {
    const manager = await mountVisitantes(async url => url.pathname.endsWith('/41') ? categoriaReply(visitanteRespondida) : visitanteList([visitanteRespondida]));
    try {
      assert.equal(manager.nodes().some(node => node.props['aria-label'] === 'Marcar como respondida: ' + visitanteFixture.nome), false);
      await manager.click('Ver detalhes de ' + visitanteFixture.nome);
      assert.equal(manager.nodes().some(node => node.props['aria-label'] === 'Marcar detalhe como respondido'), false);
    } finally { await manager.restore(); }
  });
  it('resposta 200 ainda não respondida não produz marcação artificial', async () => {
    const manager = await mountVisitantes(async (_url, options) => options.method === 'PATCH' ? categoriaReply(visitanteFixture) : visitanteList());
    try {
      await manager.click('Marcar como respondida: ' + visitanteFixture.nome);
      assert.match(manager.html(), /A dúvida permanece não respondida/); assert.doesNotMatch(manager.html(), /Dúvida marcada como respondida/);
    } finally { await manager.restore(); }
  });
  it('telefone/atendente nulos e data inválida são apresentados sem inventar dados', async () => {
    const value = { ...visitanteFixture, created_at: 'data-invalida' };
    const manager = await mountVisitantes(async url => url.pathname.endsWith('/41') ? categoriaReply(value) : visitanteList([value]));
    try {
      await manager.click('Ver detalhes de ' + visitanteFixture.nome);
      assert.match(manager.html(), /Não informado/); assert.match(manager.html(), /Data não informada/);
      assert.doesNotMatch(manager.html(), /Invalid Date|undefined/);
    } finally { await manager.restore(); }
  });
  it('falha de recarga após marcação não repete PATCH nem apaga o sucesso confirmado', async () => {
    let marked = false;
    const manager = await mountVisitantes(async (_url, options) => {
      if (options.method === 'PATCH') { marked = true; return categoriaReply(visitanteRespondida); }
      return marked ? categoriaReply({ success: false }, 503) : visitanteList();
    });
    try {
      await manager.click('Marcar como respondida: ' + visitanteFixture.nome);
      assert.match(manager.html(), /Dúvida marcada como respondida/); assert.match(manager.html(), /role="alert"/);
      assert.equal(manager.calls.filter(call => call.options.method === 'PATCH').length, 1);
    } finally { await manager.restore(); }
  });
  it('resposta anterior ao filtro não substitui a coleção vigente', async () => {
    const pending = adminReturnDeferred<Response>(); let reads = 0;
    const manager = await mountVisitantes(async () => ++reads === 1 ? pending.promise : visitanteList([{ ...visitanteFixture, nome: 'Visitante vigente' }]));
    try {
      await manager.change('situacaoVisitante', 'respondidas'); assert.match(manager.html(), /Visitante vigente/);
      await manager.act(() => pending.resolve(visitanteList([{ ...visitanteFixture, nome: 'Visitante obsoleta' }])));
      assert.match(manager.html(), /Visitante vigente/); assert.doesNotMatch(manager.html(), /Visitante obsoleta/);
    } finally { await manager.restore(); }
  });
  it('duplo clique não duplica PATCH pendente', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountVisitantes(async (_url, options) => options.method === 'PATCH' ? pending.promise : visitanteList());
    try {
      const button = manager.nodes().find(node => node.props['aria-label'] === 'Marcar como respondida: ' + visitanteFixture.nome); assert.ok(button);
      await manager.act(() => { for (let i = 0; i < 2; i++) void Reflect.apply(button.props.onClick as () => unknown, undefined, []); });
      assert.equal(manager.calls.filter(call => call.options.method === 'PATCH').length, 1);
      await manager.act(() => pending.resolve(categoriaReply(visitanteRespondida)));
    } finally { await manager.restore(); }
  });
  it('desmontagem ignora marcação tardia sem iniciar nova consulta', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountVisitantes(async (_url, options) => options.method === 'PATCH' ? pending.promise : visitanteList());
    try {
      const button = manager.nodes().find(node => node.props['aria-label'] === 'Marcar como respondida: ' + visitanteFixture.nome); assert.ok(button);
      await manager.act(() => { void Reflect.apply(button.props.onClick as () => unknown, undefined, []); });
      await manager.unmount(); await manager.act(() => pending.resolve(categoriaReply(visitanteRespondida)));
      assert.equal(manager.calls.length, 2);
    } finally { await manager.restore(); }
  });
  it('Strict Mode não duplica a consulta inicial', async () => {
    const manager = await mountVisitantes(async () => visitanteList(), true);
    try { assert.equal(manager.calls.length, 1); } finally { await manager.restore(); }
  });
  it('exclusão do último item da última página retorna à página válida', async () => {
    let deleted = false;
    const manager = await mountVisitantes(async (url, options) => {
      if (options.method === 'DELETE') { deleted = true; return categoriaReply(null, 204); }
      const page = Number(url.searchParams.get('page'));
      return visitanteList(deleted && page === 2 ? [] : [visitanteFixture], { current_page: page, total_pages: deleted ? 1 : 2, total_count: deleted ? 10 : 11, per_page: 10 });
    });
    try {
      await manager.click('Próxima'); await manager.click('Excluir envio de ' + visitanteFixture.nome); await manager.click('Confirmar exclusão');
      assert.match(manager.html(), /Página 1 de 1 · 10 envios/);
      assert.equal(manager.calls.at(-1)!.url.searchParams.get('page'), '1');
    } finally { await manager.restore(); }
  });
});

// Lote D: contrato público, sem Bearer, cookies ou requisições reais.
const publicDuvidaFixture: DuvidaPublica = {
  id: 501, pergunta: 'Como faço minha matrícula?', resposta: 'Procure a secretaria do polo.',
  categoria_nome: 'Matrícula', categoria_slug: 'matricula',
};
const publicCategoryFixture: CategoriaDuvidaPublica = { nome: 'Matrícula', slug: 'matricula' };
const publicVisitorInput: DuvidaVisitantePublicaInput = { nome: 'Maria sintética', email: 'maria@example.invalid', descricao: 'Como participar?' };
function publicDuvidaList(items = [publicDuvidaFixture], pagination = {
  current_page: 1, total_pages: items.length ? 1 : 0, total_count: items.length, per_page: 10,
}) {
  return categoriaReply({ success: true, message: 'Resultado sintético', data: { items, pagination } });
}
function publicCategoryReply(items = [publicCategoryFixture]) {
  return categoriaReply({ success: true, message: 'Categorias encontradas', data: items });
}
function publicVisitorSuccess(message = 'Dúvida enviada. Em breve entraremos em contato.') {
  return categoriaReply({ success: true, message, data: null }, 201);
}
function mountPublicFaq(fetcher: (url: URL, options: RequestInit) => Promise<Response>, strict = false, component = () => FaqCentralSection()) {
  return mountCategories(fetcher, strict, { component, anonymous: true, allowedPaths: /\/publico\/d_(?:duvidas|categorias_duvida|duvidas_visitante)$/ });
}
function publicFaqBackend(read: (url: URL, options: RequestInit) => Promise<Response>) {
  return async (url: URL, options: RequestInit) => url.pathname.endsWith('/d_categorias_duvida') ? publicCategoryReply() : read(url, options);
}
async function fillPublicVisitor(manager: Awaited<ReturnType<typeof mountPublicFaq>>, telefone = '') {
  await manager.change('nome', ' Maria sintética '); await manager.change('email', ' maria@example.invalid ');
  await manager.change('descricao', ' Como participar? '); if (telefone) await manager.change('telefone', telefone);
}

describe('FAQ público Lote D — três endpoints anônimos', () => {
  const service = medtecApi.duvidasPublicas;
  const operations = {
    list: () => service.list({ categoria: 'matricula', busca: 'certificado', page: 2, per_page: 5 }),
    categories: () => service.listCategorias(), send: () => service.enviarVisitante(publicVisitorInput),
  };
  for (const operation of ['list', 'categories', 'send'] as const) {
    it(operation + ': endpoint, formato e parâmetros sem Bearer mesmo com sessão administrativa', async () => {
      setStoredTokens({ access_token: 'public-isolation-user', refresh_token: 'public-isolation-refresh' });
      const calls: { url: URL; options: RequestInit }[] = [];
      const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options: RequestInit = {}) => {
        calls.push({ url: new URL(String(input)), options });
        return operation === 'list' ? publicDuvidaList([publicDuvidaFixture], { current_page: 2, total_pages: 4, total_count: 18, per_page: 5 })
          : operation === 'categories' ? publicCategoryReply() : publicVisitorSuccess();
      });
      try {
        const result = await operations[operation](); assert.equal(calls.length, 1);
        const { url, options } = calls[0];
        assert.ok(url.pathname.endsWith('/publico/' + { list: 'd_duvidas', categories: 'd_categorias_duvida', send: 'd_duvidas_visitante' }[operation]));
        assert.equal(new Headers(options.headers).get('Authorization'), null); assert.equal(options.credentials, 'omit');
        assert.equal(options.method, operation === 'send' ? 'POST' : 'GET');
        if (operation === 'list') {
          for (const [key, value] of Object.entries({ categoria: 'matricula', busca: 'certificado', page: '2', per_page: '5' })) assert.equal(url.searchParams.get(key), value);
          assert.deepEqual(result, { success: true, message: 'Resultado sintético', data: { items: [publicDuvidaFixture], pagination: { current_page: 2, total_pages: 4, total_count: 18, per_page: 5 } } });
        } else if (operation === 'categories') {
          assert.deepEqual(result, { success: true, message: 'Categorias encontradas', data: [publicCategoryFixture] });
          assert.equal(Object.hasOwn(publicCategoryFixture, 'id'), false); assert.equal(Object.hasOwn(publicCategoryFixture, 'ativo'), false);
        } else {
          assert.deepEqual(JSON.parse(String(options.body)), { d_duvida_visitante: publicVisitorInput });
          assert.deepEqual(result, { success: true, message: 'Dúvida enviada. Em breve entraremos em contato.', data: null });
        }
        if (operation !== 'send') assert.equal(options.body, undefined);
        assert.equal(getStoredAccessToken(), 'public-isolation-user'); assert.equal(getStoredRefreshToken(), 'public-isolation-refresh');
      } finally { fetcher.mock.restore(); clearStoredTokens(); }
    });
  }
  for (const operation of ['list', 'categories', 'send'] as const) {
    it(operation + ': 401 token_expirado não faz refresh, retry ou logout', async () => {
      setStoredTokens({ access_token: 'public-isolation-user', refresh_token: 'public-isolation-refresh' }); let count = 0;
      const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
        count++; assert.match(String(input), /\/publico\/d_/); assert.equal(new Headers(options?.headers).get('Authorization'), null);
        return categoriaReply({ success: false, errors: ['token_expirado'] }, 401);
      });
      try {
        await assert.rejects(operations[operation](), error => error instanceof ApiError && error.status === 401);
        assert.equal(count, 1); assert.equal(getStoredAccessToken(), 'public-isolation-user'); assert.equal(getStoredRefreshToken(), 'public-isolation-refresh');
      } finally { fetcher.mock.restore(); clearStoredTokens(); }
    });
  }
  for (const telefone of [undefined, '92999999999']) {
    it('envio seleciona somente os campos permitidos; telefone: ' + telefone, async () => {
      const fetcher = mock.method(globalThis, 'fetch', async (_input: RequestInfo | URL, options?: RequestInit) => {
        const expected = { ...publicVisitorInput, ...(telefone ? { telefone } : {}) };
        assert.deepEqual(JSON.parse(String(options?.body)), { d_duvida_visitante: expected }); return publicVisitorSuccess();
      });
      const extra = { ...publicVisitorInput, telefone, id: 1, respondida: true, autor_id: 99, protocolo: 'não permitido' };
      try { await service.enviarVisitante(extra); } finally { fetcher.mock.restore(); }
    });
  }
  it('filtros vazios são omitidos e leituras aceitam cancelamento', async () => {
    const controller = new AbortController();
    const fetcher = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = new URL(String(input)); assert.equal(options?.signal, controller.signal); assert.equal(options?.cache, 'no-store');
      assert.equal(url.searchParams.has('categoria'), false); assert.equal(url.searchParams.has('busca'), false);
      return url.pathname.endsWith('/d_duvidas') ? publicDuvidaList([]) : publicCategoryReply([]);
    });
    try {
      assert.equal((await service.list({ categoria: '', busca: '' }, controller.signal)).data.pagination.total_count, 0);
      assert.deepEqual((await service.listCategorias(controller.signal)).data, []);
    } finally { fetcher.mock.restore(); }
  });
  for (const status of [422, 429]) {
    it('POST propaga HTTP ' + status + ' e suas mensagens', async () => {
      const fetcher = mock.method(globalThis, 'fetch', async () => categoriaReply({ success: false, message: 'Erro sintético', errors: [status === 429 ? 'muitas_tentativas' : 'Email inválido'] }, status));
      try { await assert.rejects(service.enviarVisitante(publicVisitorInput), error => error instanceof ApiError && error.status === status); }
      finally { fetcher.mock.restore(); }
    });
  }
  for (const operation of ['list', 'categories', 'send'] as const) {
    it(operation + ': falha de rede não vira sucesso ou vazio', async () => {
      const fetcher = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
      try { await assert.rejects(operations[operation](), error => error instanceof ApiError && error.status === 0); }
      finally { fetcher.mock.restore(); }
    });
  }
  for (const [operation, payload] of [
    ['list', null], ['list', { success: true, data: { items: [] } }],
    ['list', { success: true, data: { items: [{ pergunta: 'Incompleta' }], pagination: { current_page: 1, total_pages: 1, total_count: 1, per_page: 10 } } }],
    ['categories', { success: true, data: { items: [publicCategoryFixture] } }],
    ['categories', { success: true, data: [{ nome: 'Categoria sem slug' }] }],
    ['send', { success: true, message: 'OK', data: { id: 1 } }], ['send', { success: false, message: 'Falha', data: null }],
  ] as const) {
    it(operation + ': resposta inválida não simula sucesso: ' + JSON.stringify(payload), async () => {
      const fetcher = mock.method(globalThis, 'fetch', async () => categoriaReply(payload));
      try { await assert.rejects(operations[operation](), /Resposta inválida/); } finally { fetcher.mock.restore(); }
    });
  }
});

describe('FAQ público Lote D — páginas e listagem compartilhada', () => {
  it('/faq, /duvidas e wrapper existente compartilham o mesmo componente sem FAQs locais', () => {
    for (const page of [PublicFaqPage, PublicDuvidasPage, FaqSection]) {
      const tree = page(); const shared = noticeNodes(tree).filter(node => node.type === FaqCentralSection);
      assert.equal(shared.length, 1); assert.equal(Object.hasOwn(shared[0].props, 'initialFaqs'), false);
    }
  });
  it('SSR apresenta carregamento sem perguntas ou categorias inventadas', () => {
    const html = renderToStaticMarkup(createElement(FaqCentralSection));
    assert.match(html, /Carregando perguntas/); assert.match(html, /Carregando categorias/);
    assert.doesNotMatch(html, /Nenhuma pergunta encontrada|Horários de Transmissão|Papel do Mediador|Validade e Certificação|Metodologia &amp; Aulas/);
    assert.match(html, /Enviar dúvida/);
  });
  it('consulta anônima mostra total oficial, categorias sem ID e acordeão acessível', async () => {
    const manager = await mountPublicFaq(publicFaqBackend(async () => publicDuvidaList([publicDuvidaFixture], { current_page: 1, total_pages: 3, total_count: 25, per_page: 10 })));
    try {
      assert.match(manager.html(), /25 resultados/); assert.match(manager.html(), /Como faço minha matrícula/);
      assert.ok(manager.nodes().some(node => node.type === 'button' && node.props.children === 'Matrícula'));
      const question = manager.nodes().find(node => node.type === 'button' && typeof node.props.id === 'string' && node.props.id.endsWith('-pergunta-501')); assert.ok(question);
      assert.equal(question.props['aria-expanded'], false);
      await manager.act(() => Reflect.apply(question.props.onClick as () => unknown, undefined, []));
      const answer = manager.nodes().find(node => node.props.id === question.props['aria-controls']); assert.ok(answer);
      assert.equal(answer.props.hidden, false); assert.equal(answer.props['aria-labelledby'], question.props.id);
      assert.match(manager.html(), /Procure a secretaria do polo/);
      assert.equal(manager.calls.length, 2);
    } finally { await manager.restore(); }
  });
  it('busca global por pergunta, categoria e paginação são enviadas à API sem filtro local', async () => {
    const manager = await mountPublicFaq(publicFaqBackend(async url => publicDuvidaList([publicDuvidaFixture], { current_page: Number(url.searchParams.get('page')), total_pages: 3, total_count: 25, per_page: 10 })));
    try {
      await manager.click('Próxima'); assert.match(manager.html(), /Página 2 de 3/);
      const before = manager.calls.length; await manager.change('busca', ' certificado '); assert.equal(manager.calls.length, before);
      await manager.submit('Buscar perguntas'); let url = manager.calls.at(-1)!.url;
      assert.equal(url.searchParams.get('busca'), 'certificado'); assert.equal(url.searchParams.get('page'), '1'); assert.equal(url.searchParams.get('per_page'), '10');
      assert.match(manager.html(), /Como faço minha matrícula/, 'Não filtra a coleção retornada na página atual');
      await manager.click('Matrícula'); url = manager.calls.at(-1)!.url;
      assert.equal(url.searchParams.get('categoria'), 'matricula'); assert.equal(url.searchParams.get('busca'), 'certificado');
      await manager.click('Próxima'); assert.equal(manager.calls.at(-1)!.url.searchParams.get('categoria'), 'matricula');
      await manager.click('Limpar filtros'); url = manager.calls.at(-1)!.url;
      assert.equal(url.searchParams.has('busca'), false); assert.equal(url.searchParams.has('categoria'), false); assert.equal(url.searchParams.get('page'), '1');
    } finally { await manager.restore(); }
  });
  it('vazio legítimo só aparece após a leitura e não transforma categorias em mocks', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountPublicFaq(publicFaqBackend(() => pending.promise));
    try {
      assert.match(manager.html(), /Carregando perguntas/); assert.doesNotMatch(manager.html(), /Nenhuma pergunta encontrada/);
      await manager.act(() => pending.resolve(publicDuvidaList([])));
      assert.match(manager.html(), /Nenhuma pergunta encontrada/); assert.doesNotMatch(manager.html(), /role="alert"/);
    } finally { await manager.restore(); }
  });
  for (const outcome of [401, 404, 503, 'network'] as const) {
    it('perguntas com ' + outcome + ': indisponibilidade sem perguntas fictícias, login ou falso vazio', async () => {
      let failed = false;
      const manager = await mountPublicFaq(publicFaqBackend(async () => {
        if (failed) return publicDuvidaList(); failed = true;
        if (outcome === 'network') throw new TypeError('Failed to fetch');
        return categoriaReply({ success: false, errors: ['nao_autenticado'] }, outcome);
      }));
      try {
        assert.match(manager.html(), /role="alert"/); assert.match(manager.html(), outcome === 'network' ? /conectar/ : /Perguntas indisponíveis/);
        assert.doesNotMatch(manager.html(), /Nenhuma pergunta encontrada|Como faço minha matrícula|Faça login|Horários de Transmissão/);
        assert.ok(manager.nodes().some(node => node.type === DuvidaVisitanteForm));
        await manager.click('Tentar novamente'); assert.match(manager.html(), /Como faço minha matrícula/);
        assert.equal(getStoredAccessToken(), 'category-ui-user');
      } finally { await manager.restore(); }
    });
  }
  it('falha de categorias não impede perguntas e recarrega apenas o catálogo público', async () => {
    let failed = true;
    const manager = await mountPublicFaq(async url => {
      if (url.pathname.endsWith('/d_categorias_duvida')) return failed ? categoriaReply({ success: false }, 503) : publicCategoryReply();
      return publicDuvidaList();
    });
    try {
      assert.match(manager.html(), /Categorias indisponíveis/); assert.match(manager.html(), /Como faço minha matrícula/);
      assert.doesNotMatch(manager.html(), /Infraestrutura &amp; Satélite/);
      failed = false; await manager.click('Recarregar categorias');
      assert.equal(manager.calls.filter(call => call.url.pathname.endsWith('/d_duvidas')).length, 1);
      assert.ok(manager.nodes().some(node => node.type === 'button' && node.props.children === 'Matrícula'));
    } finally { await manager.restore(); }
  });
  it('catálogo vazio não cria categorias fixas', async () => {
    const manager = await mountPublicFaq(async url => url.pathname.endsWith('/d_categorias_duvida') ? publicCategoryReply([]) : publicDuvidaList());
    try { assert.match(manager.html(), /Nenhuma categoria disponível/); assert.match(manager.html(), /Como faço minha matrícula/); }
    finally { await manager.restore(); }
  });
  it('perguntas e categorias carregam independentemente', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountPublicFaq(async url => url.pathname.endsWith('/d_categorias_duvida') ? pending.promise : publicDuvidaList());
    try {
      assert.match(manager.html(), /Como faço minha matrícula/); assert.match(manager.html(), /Carregando categorias/);
      await manager.act(() => pending.resolve(publicCategoryReply())); assert.doesNotMatch(manager.html(), /Carregando categorias/);
    } finally { await manager.restore(); }
  });
  it('resposta obsoleta não substitui a busca vigente', async () => {
    const pending = adminReturnDeferred<Response>(); let reads = 0;
    const manager = await mountPublicFaq(publicFaqBackend(async () => ++reads === 1 ? pending.promise : publicDuvidaList([{ ...publicDuvidaFixture, pergunta: 'Resultado vigente' }])));
    try {
      await manager.change('busca', 'vigente'); await manager.submit('Buscar perguntas');
      await manager.act(() => pending.resolve(publicDuvidaList([{ ...publicDuvidaFixture, pergunta: 'Resultado obsoleto' }])));
      assert.match(manager.html(), /Resultado vigente/); assert.doesNotMatch(manager.html(), /Resultado obsoleto/);
    } finally { await manager.restore(); }
  });
  it('Strict Mode não duplica as duas leituras públicas iniciais', async () => {
    const manager = await mountPublicFaq(publicFaqBackend(async () => publicDuvidaList()), true);
    try { assert.equal(manager.calls.length, 2); } finally { await manager.restore(); }
  });
  it('respostas não executam HTML recebido da API', async () => {
    const manager = await mountPublicFaq(publicFaqBackend(async () => publicDuvidaList([{ ...publicDuvidaFixture, resposta: '<script>alert(1)</script>' }])));
    try { assert.match(manager.html(), /&lt;script&gt;/); assert.doesNotMatch(manager.html(), /<script>/); }
    finally { await manager.restore(); }
  });
});

describe('FAQ público Lote D — formulário acessível de visitantes', () => {
  const form = () => DuvidaVisitanteForm();
  it('validação local associa erros aos campos obrigatórios e não envia POST inválido', async () => {
    const manager = await mountPublicFaq(async () => { throw new Error('Nenhum envio esperado'); }, false, form);
    try {
      await manager.submit('Enviar dúvida');
      assert.match(manager.html(), /Informe seu nome/); assert.match(manager.html(), /Informe um e-mail válido/); assert.match(manager.html(), /Descreva sua dúvida/);
      for (const name of ['nome', 'email', 'descricao']) {
        const field = manager.nodes().find(node => node.props.name === name); assert.ok(field);
        assert.equal(field.props['aria-invalid'], true); assert.ok(manager.nodes().some(node => node.props.id === field.props['aria-describedby']));
        assert.ok(manager.nodes().some(node => node.type === 'label' && node.props.htmlFor === field.props.id));
      }
      assert.equal(manager.nodes().find(node => node.props.name === 'telefone')?.props.required, undefined);
      assert.equal(manager.calls.length, 0);
    } finally { await manager.restore(); }
  });
  it('nome e descrição em branco e email malformado continuam inválidos', async () => {
    const manager = await mountPublicFaq(async () => publicVisitorSuccess(), false, form);
    try {
      await manager.change('nome', '   '); await manager.change('descricao', '   '); await manager.change('email', 'sem-arroba');
      await manager.submit('Enviar dúvida'); assert.equal(manager.calls.length, 0); assert.match(manager.html(), /role="alert"/);
    } finally { await manager.restore(); }
  });
  it('resumo de erros recebe foco após envio inválido e não interrompe a correção dos campos', async () => {
    const manager = await mountPublicFaq(async () => publicVisitorSuccess(), false, form);
    try {
      await manager.submit('Enviar dúvida');
      const summary = manager.nodes().find(node => node.props.role === 'alert'); assert.ok(summary);
      const ref = summary.props.ref as { current: { focus: () => void } | null };
      let focuses = 0; ref.current = { focus() { focuses++; } };
      await manager.submit('Enviar dúvida'); assert.equal(focuses, 1);
      await manager.change('nome', 'Maria'); assert.equal(focuses, 1);
      await manager.change('email', 'maria@example.invalid'); assert.equal(focuses, 1);
      assert.equal(manager.calls.length, 0);
    } finally { await manager.restore(); }
  });
  for (const telefone of ['', '92999999999']) {
    it('envio válido com telefone ' + (telefone || 'opcional ausente') + ' confirma a mensagem da API e limpa os campos', async () => {
      const manager = await mountPublicFaq(async (_url, options) => {
        assert.deepEqual(JSON.parse(String(options.body)), { d_duvida_visitante: { ...publicVisitorInput, ...(telefone ? { telefone } : {}) } });
        return publicVisitorSuccess('Recebemos sua dúvida. A equipe entrará em contato.');
      }, false, form);
      try {
        await fillPublicVisitor(manager, telefone); await manager.submit('Enviar dúvida');
        assert.match(manager.html(), /Recebemos sua dúvida/); assert.match(manager.html(), /role="status"/);
        assert.equal(manager.nodes().find(node => node.props.name === 'nome')?.props.value, '');
        assert.doesNotMatch(manager.html(), /e-mail enviado|protocolo de atendimento/i);
        assert.equal(manager.calls.length, 1); assert.equal(manager.calls[0].options.method, 'POST');
        assert.equal(getStoredAccessToken(), 'category-ui-user');
      } finally { await manager.restore(); }
    });
  }
  it('envio pendente bloqueia campos e duplicatas, sem sucesso antecipado', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountPublicFaq(() => pending.promise, false, form);
    try {
      await fillPublicVisitor(manager);
      const node = manager.nodes().find(node => node.type === 'form'); assert.ok(node);
      await manager.act(() => { for (let i = 0; i < 2; i++) void Reflect.apply(node.props.onSubmit as () => unknown, undefined, [{ preventDefault() {} }]); });
      assert.equal(manager.calls.length, 1); assert.match(manager.html(), /Enviando dúvida/); assert.doesNotMatch(manager.html(), /Dúvida enviada/);
      assert.equal(manager.nodes().find(node => node.type === 'fieldset')?.props.disabled, true);
      assert.equal(manager.nodes().find(node => node.type === 'form')?.props['aria-busy'], true);
      await manager.act(() => pending.resolve(publicVisitorSuccess())); assert.match(manager.html(), /Dúvida enviada/);
    } finally { await manager.restore(); }
  });
  it('422 mostra mensagens do Rails e preserva os campos para correção', async () => {
    const manager = await mountPublicFaq(async () => categoriaReply({ success: false, message: 'Erro de validação', errors: ['Email inválido', 'Descrição não pode ficar em branco'] }, 422), false, form);
    try {
      await fillPublicVisitor(manager); await manager.submit('Enviar dúvida');
      assert.match(manager.html(), /Email inválido/); assert.match(manager.html(), /Descrição não pode ficar em branco/);
      assert.match(manager.html(), /value=" Maria sintética "/); assert.match(manager.html(), /Como participar/);
      assert.doesNotMatch(manager.html(), /Dúvida enviada/); assert.equal(manager.calls.length, 1);
    } finally { await manager.restore(); }
  });
  it('429 orienta aguardar um minuto sem apagar dados nem repetir POST automaticamente', async () => {
    let failed = true;
    const manager = await mountPublicFaq(async () => failed ? categoriaReply({ success: false, errors: ['muitas_tentativas'] }, 429) : publicVisitorSuccess(), false, form);
    try {
      await fillPublicVisitor(manager); await manager.submit('Enviar dúvida');
      assert.match(manager.html(), /Muitos envios. Aguarde um minuto/); assert.match(manager.html(), /value=" Maria sintética "/);
      assert.equal(manager.calls.length, 1); failed = false;
      await manager.submit('Enviar dúvida'); assert.match(manager.html(), /Dúvida enviada/); assert.equal(manager.calls.length, 2);
    } finally { await manager.restore(); }
  });
  for (const outcome of [401, 404, 503, 'network', 'invalid'] as const) {
    it('envio com ' + outcome + ' não afirma sucesso, email enviado ou protocolo', async () => {
      const manager = await mountPublicFaq(async () => {
        if (outcome === 'network') throw new TypeError('Failed to fetch');
        if (outcome === 'invalid') return categoriaReply({ success: true, data: { protocolo: 'não contratual' } }, 201);
        return categoriaReply({ success: false, errors: [outcome === 401 ? 'token_expirado' : 'falha'] }, outcome);
      }, false, form);
      try {
        await fillPublicVisitor(manager); await manager.submit('Enviar dúvida');
        assert.match(manager.html(), /role="alert"/); assert.match(manager.html(), /value=" Maria sintética "/);
        assert.doesNotMatch(manager.html(), /Dúvida enviada|email enviado|protocolo|Faça login/i);
        assert.equal(manager.calls.length, 1); assert.equal(getStoredAccessToken(), 'category-ui-user');
      } finally { await manager.restore(); }
    });
  }
  it('resposta após desmontagem não inicia novas chamadas', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountPublicFaq(() => pending.promise, false, form);
    try {
      await fillPublicVisitor(manager); const node = manager.nodes().find(node => node.type === 'form'); assert.ok(node);
      await manager.act(() => { void Reflect.apply(node.props.onSubmit as () => unknown, undefined, [{ preventDefault() {} }]); });
      await manager.unmount(); await manager.act(() => pending.resolve(publicVisitorSuccess())); assert.equal(manager.calls.length, 1);
    } finally { await manager.restore(); }
  });
  it('renderizar e reativar formulário não envia dados sem ação do visitante', async () => {
    const manager = await mountPublicFaq(async () => publicVisitorSuccess(), true, form);
    try { await manager.render(); assert.equal(manager.calls.length, 0); } finally { await manager.restore(); }
  });
});

describe('Lote E1 — correção das chamadas públicas e isolamento de sessão', () => {
  it('SiteFooter não chama /canais_contato, não aciona refresh, preserva sessão admin e exibe dados institucionais verificados', async () => {
    const manager = await mountCategories(async () => {
      throw new Error('SiteFooter não deve realizar chamadas HTTP');
    }, true, { component: () => SiteFooter(), anonymous: true, allowedPaths: /^$/ });
    try {
      assert.equal(manager.calls.length, 0);
      assert.equal(getStoredAccessToken(), 'category-ui-user');
      assert.equal(getStoredRefreshToken(), 'category-ui-refresh');
      const html = manager.html();
      assert.match(html, /\(69\) 3216-5300/);
      assert.match(html, /mediacaotecnologica@seduc\.ro\.gov\.br/);
      assert.match(html, /Palácio Rio Madeira, Porto Velho - RO/);
      assert.doesNotMatch(html, /999999999/);
    } finally {
      await manager.restore();
    }
  });

  it('FloatingSocialRotator não chama /canais_contato, preserva sessão admin e não exibe WhatsApp fictício', () => {
    setStoredTokens({ access_token: 'admin-session-token', refresh_token: 'admin-session-refresh' });
    let calls = 0;
    const fetchMock = mock.method(globalThis, 'fetch', async () => {
      calls++;
      throw new Error('FloatingSocialRotator não deve realizar chamadas HTTP');
    });
    try {
      const html = renderToStaticMarkup(
        createElement(PathnameContext.Provider, { value: '/' }, createElement(FloatingSocialRotator))
      );
      assert.equal(calls, 0);
      assert.equal(getStoredAccessToken(), 'admin-session-token');
      assert.equal(getStoredRefreshToken(), 'admin-session-refresh');
      assert.doesNotMatch(html, /999999999/);
      assert.match(html, /instagram\.com\/governoro|facebook\.com\/governoderondonia|youtube\.com\/@SeducRondonia/);
    } finally {
      fetchMock.mock.restore();
      clearStoredTokens();
    }
  });

  for (const [name, page] of [['galeria', PublicGaleriaPage], ['acervo', PublicAcervoPage]] as const) {
    it('/' + name + ' não chama /fotos_galeria sem autenticação nem envia Bearer da sessão admin', async () => {
      setStoredTokens({ access_token: 'admin-session-token', refresh_token: 'admin-session-refresh' });
      let calls = 0;
      const fetchMock = mock.method(globalThis, 'fetch', async () => {
        calls++;
        throw new Error('Não deve chamar endpoints protegidos em /' + name);
      });
      try {
        const tree = await page();
        assert.equal(calls, 0);
        assert.equal(getStoredAccessToken(), 'admin-session-token');
        assert.equal(getStoredRefreshToken(), 'admin-session-refresh');
        const section = noticeNodes(tree).find(node => node.type === GallerySection);
        assert.ok(section);
        assert.deepEqual(section.props.gallery, []);
        assert.equal(section.props.unavailable, true);
        const html = renderToStaticMarkup(section);
        assert.match(html, /role="alert"/);
        assert.match(html, /Acervo fotográfico indisponível no momento/);
        assert.doesNotMatch(html, /Nenhum registro fotográfico encontrado para a categoria selecionada/);
      } finally {
        fetchMock.mock.restore();
        clearStoredTokens();
      }
    });
  }

  it('GallerySection apresenta estados distintos para carregamento, lista vazia legítima, indisponibilidade e erro de rede', () => {
    const loadingHtml = renderToStaticMarkup(createElement(GallerySection, { gallery: [], loading: true }));
    assert.match(loadingHtml, /role="status"/);
    assert.match(loadingHtml, /Carregando acervo fotográfico/);
    assert.doesNotMatch(loadingHtml, /indisponível|Nenhum registro/);

    const unavailableHtml = renderToStaticMarkup(createElement(GallerySection, { gallery: [], unavailable: true }));
    assert.match(unavailableHtml, /role="alert"/);
    assert.match(unavailableHtml, /Acervo fotográfico indisponível no momento/);
    assert.doesNotMatch(unavailableHtml, /Nenhum registro fotográfico publicado/);

    const networkErrorHtml = renderToStaticMarkup(createElement(GallerySection, {
      gallery: [],
      error: 'Não foi possível conectar ao servidor no momento. Verifique sua conexão e tente novamente.',
    }));
    assert.match(networkErrorHtml, /role="alert"/);
    assert.match(networkErrorHtml, /Verifique sua conexão e tente novamente/);

    const emptyHtml = renderToStaticMarkup(createElement(GallerySection, { gallery: [] }));
    assert.match(emptyHtml, /Nenhum registro fotográfico publicado até o momento/);
    assert.doesNotMatch(emptyHtml, /role="alert"|categoria selecionada/);

    const withPhotoHtml = renderToStaticMarkup(createElement(GallerySection, {
      gallery: [{
        id: '10',
        title: 'Aula inaugural conectada',
        description: 'Transmissão para polos rurais.',
        imageUrl: 'https://medtec.invalid/foto.jpg',
        category: 'Salas de Aula',
        date: '31/10/2026',
      }],
    }));
    assert.match(withPhotoHtml, /Aula inaugural conectada/);
    assert.match(withPhotoHtml, /Salas de Aula/);
  });

  it('/redes não chama /canais_contato, preserva sessão admin e apresenta canais institucionais sem WhatsApp fictício', async () => {
    setStoredTokens({ access_token: 'admin-session-token', refresh_token: 'admin-session-refresh' });
    let calls = 0;
    const fetchMock = mock.method(globalThis, 'fetch', async () => {
      calls++;
      throw new Error('Não deve chamar /canais_contato em /redes');
    });
    try {
      const tree = await PublicRedesPage();
      assert.equal(calls, 0);
      assert.equal(getStoredAccessToken(), 'admin-session-token');
      assert.equal(getStoredRefreshToken(), 'admin-session-refresh');
      const section = noticeNodes(tree).find(node => node.type === SocialSection);
      assert.ok(section);
      const html = renderToStaticMarkup(section);
      assert.match(html, /youtube\.com\/@SeducRondonia/);
      assert.match(html, /instagram\.com\/governoro/);
      assert.match(html, /facebook\.com\/governoderondonia/);
      assert.match(html, /\(69\) 3216-5300/);
      assert.doesNotMatch(html, /999999999/);
    } finally {
      fetchMock.mock.restore();
      clearStoredTokens();
    }
  });

  it('SocialSection suporta estados de carregamento, indisponibilidade, erro de rede e WhatsApp configurado', () => {
    const loadingHtml = renderToStaticMarkup(createElement(SocialSection, { loading: true }));
    assert.match(loadingHtml, /role="status"/);
    assert.match(loadingHtml, /Carregando canais oficiais/);

    const unavailableHtml = renderToStaticMarkup(createElement(SocialSection, { unavailable: true }));
    assert.match(unavailableHtml, /role="alert"/);
    assert.match(unavailableHtml, /temporariamente indisponível/);
    assert.doesNotMatch(unavailableHtml, /999999999/);

    const errorHtml = renderToStaticMarkup(createElement(SocialSection, { error: 'Falha de conexão com a rede.' }));
    assert.match(errorHtml, /role="alert"/);
    assert.match(errorHtml, /Falha de conexão com a rede/);

    const customWhatsappHtml = renderToStaticMarkup(createElement(SocialSection, {
      socials: {
        instagram: 'https://www.instagram.com/governoro/',
        youtube: 'https://www.youtube.com/@SeducRondonia',
        facebook: 'https://www.facebook.com/governoderondonia',
        whatsapp: 'https://wa.me/556932165300',
        email: 'mediacaotecnologica@seduc.ro.gov.br',
        phone: '(69) 3216-5300',
        address: 'Palácio Rio Madeira, Porto Velho - RO',
      },
    }));
    assert.match(customWhatsappHtml, /https:\/\/wa\.me\/556932165300/);
    assert.match(customWhatsappHtml, /Falar no WhatsApp/);
  });

  it('/ao-vivo preserva Lote B (/publico/a_avisos sem Bearer) e não requisita /canais_contato nem aciona refresh', async () => {
    setStoredTokens({ access_token: 'admin-session-token', refresh_token: 'admin-session-refresh' });
    const paths: { path: string; auth: string | null }[] = [];
    const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = new URL(String(input));
      paths.push({ path: url.pathname, auth: new Headers(options?.headers).get('Authorization') });
      return publicAvisosReply([publicAvisoFixture]);
    });
    try {
      const view = await resolvePublicNoticePage(PublicAoVivoPage);
      assert.equal(paths.length, 1);
      assert.equal(paths[0].path.endsWith('/publico/a_avisos'), true);
      assert.equal(paths[0].auth, null);
      assert.equal(paths.some(item => item.path.includes('/canais_contato') || item.path.includes('/auth/refresh_token')), false);
      assert.equal(getStoredAccessToken(), 'admin-session-token');
      assert.equal(getStoredRefreshToken(), 'admin-session-refresh');
      const html = renderToStaticMarkup(view);
      assert.match(html, /Comunicado recebido da API/);
      assert.match(html, /\(69\) 3216-5300/);
      assert.doesNotMatch(html, /999999999/);
    } finally {
      fetchMock.mock.restore();
      clearStoredTokens();
    }
  });

  it('serviços autenticados do CMS (fotosGaleria, categoriasGaleria e canaisContato) permanecem protegidos por Bearer', async () => {
    setStoredTokens({ access_token: 'cms-bearer-token', refresh_token: 'cms-refresh-token' });
    const calls: { path: string; method: string; auth: string | null }[] = [];
    const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = new URL(String(input));
      calls.push({
        path: url.pathname,
        method: options?.method || 'GET',
        auth: new Headers(options?.headers).get('Authorization'),
      });
      return new Response(JSON.stringify({
        success: true,
        message: 'OK',
        data: { items: [], pagination: { current_page: 1, total_pages: 1, total_count: 0, per_page: 10 } },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
    try {
      await medtecApi.fotosGaleria.list({ page: 'all' });
      await medtecApi.categoriasGaleria.list({ page: 'all' });
      await medtecApi.canaisContato.list({ page: 'all' });
      assert.equal(calls.length, 3);
      assert.equal(calls[0].path.endsWith('/fotos_galeria'), true);
      assert.equal(calls[1].path.endsWith('/categorias_galeria'), true);
      assert.equal(calls[2].path.endsWith('/canais_contato'), true);
      for (const call of calls) {
        assert.equal(call.path.includes('/publico/'), false);
        assert.equal(call.auth, 'Bearer cms-bearer-token');
      }
    } finally {
      fetchMock.mock.restore();
      clearStoredTokens();
    }
  });
});

describe('Lote E2 — indicadores de FAQ na Visão Geral do painel gestor', () => {
  const faqFixture = {
    id: 11,
    pergunta: 'Como participar da mostra estadual?',
    resposta: 'As orientações estão disponíveis no edital oficial.',
    d_categoria_duvida_id: 3,
    categoria_nome: 'Inscrições',
    status: 'publicada',
    status_nome: 'Publicada',
    autor_nome: 'Coordenação MEDTEC',
  };

  function jsonResponse(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  function serveOverviewEndpoint(
    url: string,
    options: {
      emptyFaqs?: boolean;
      faqTotals?: { total: number; pending: number; published: number };
      faqResponse?: (parsed: URL) => Response;
    } = {},
  ): Response {
    const parsed = new URL(url, 'http://test');
    const endpoint = parsed.pathname.split('/').pop()!;
    if (endpoint === 'd_duvidas') {
      if (options.faqResponse) return options.faqResponse(parsed);
      const statusSlug = parsed.searchParams.get('q[n_status_noticia_slug_eq]');
      const counts = options.faqTotals ?? { total: 42, pending: 9, published: 30 };
      const totalCount = options.emptyFaqs
        ? 0
        : statusSlug === 'aguardando'
          ? counts.pending
          : statusSlug === 'publicada'
            ? counts.published
            : counts.total;
      return jsonResponse({
        success: true,
        message: 'OK',
        data: {
          items: options.emptyFaqs ? [] : [faqFixture],
          pagination: { current_page: 1, total_pages: totalCount > 0 ? totalCount : 0, total_count: totalCount, per_page: 1 },
        },
      });
    }
    if (endpoint === 'n_noticias') {
      return jsonResponse({
        success: true,
        data: {
          items: [
            { id: 1, titulo: 'Notícia oficial 1', status: 'publicada', autor_nome: 'Redação', data_publicacao: '2026-10-31' },
            { id: 2, titulo: 'Notícia oficial 2', status: 'aguardando' },
          ],
          pagination: { current_page: 1, total_pages: 1, total_count: 18, per_page: 20 },
        },
      });
    }
    if (endpoint === 'a_avisos') {
      return jsonResponse({
        success: true,
        data: {
          items: [
            { id: 1, titulo: 'Comunicado urgente de inscrição', ativo: true, a_tipo_aviso: { slug: 'urgente', nome: 'Urgente' } },
            { id: 2, titulo: 'Aviso geral', ativo: true, a_tipo_aviso: { slug: 'informativo', nome: 'Informativo' } },
          ],
          pagination: { current_page: 1, total_pages: 1, total_count: 14, per_page: 20 },
        },
      });
    }
    const totals: Record<string, number> = {
      usuarios: 64,
      fotos_galeria: 150,
      categorias_galeria: 8,
      g_estados: 27,
    };
    return jsonResponse({
      success: true,
      data: {
        items: [{ id: 1 }],
        pagination: { current_page: 1, total_pages: 1, total_count: totals[endpoint] ?? 1, per_page: 1 },
      },
    });
  }

  function renderOverviewFromState(state: ReturnType<typeof createInitialOverviewState>) {
    const metrics = getOverviewMetrics(state);
    const highlights = getOverviewHighlights(state);
    return renderToStaticMarkup(createElement(AdminOverview, {
      indicators: {
        ...metrics,
        loadingNews: state.news.loading,
        errorNews: state.news.error,
        loadingAvisos: state.avisos.loading,
        errorAvisos: state.avisos.error,
        loadingFotos: state.gallery.loading,
        errorFotos: state.gallery.error,
        loadingFaqs: state.faqs.loading,
        errorFaqs: state.faqs.error,
      },
      userName: 'Gestor MEDTEC',
      ...highlights,
      canAccessKanban: true,
      onOpenNews() {},
      onCreateNews() {},
      onOpenKanban() {},
    }));
  }

  it('obtém contagens oficiais de FAQ via pagination.total_count com filtros por situação e Bearer do usuário autenticado', async () => {
    setStoredTokens({ access_token: 'gestor-faq-bearer', refresh_token: 'gestor-faq-refresh' });
    const faqCalls: { statusFilter: string | null; page: string | null; perPage: string | null; auth: string | null }[] = [];
    const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = new URL(String(input), 'http://test');
      if (url.pathname.endsWith('/d_duvidas')) {
        faqCalls.push({
          statusFilter: url.searchParams.get('q[n_status_noticia_slug_eq]'),
          page: url.searchParams.get('page'),
          perPage: url.searchParams.get('per_page'),
          auth: new Headers(options?.headers).get('Authorization'),
        });
      }
      return serveOverviewEndpoint(String(input), {
        faqTotals: { total: 42, pending: 9, published: 30 },
      });
    });

    try {
      const snapshot = await createAdminOverviewLoader()(true);
      assert.ok(snapshot);
      const state = applyOverviewSnapshot(createInitialOverviewState(), snapshot);
      const metrics = getOverviewMetrics(state);

      assert.equal(faqCalls.length, 3);
      assert.deepEqual(
        faqCalls.map(call => call.statusFilter).sort(),
        [null, 'aguardando', 'publicada'].sort(),
      );
      for (const call of faqCalls) {
        assert.equal(call.page, '1');
        assert.equal(call.perPage, '1');
        assert.equal(call.auth, 'Bearer gestor-faq-bearer');
      }

      assert.equal(metrics.totalFaqs, 42);
      assert.equal(metrics.apiFaqsPendingCount, 9);
      assert.equal(metrics.apiFaqsPublishedCount, 30);

      // Preservação dos indicadores de Notícias e Avisos
      assert.equal(metrics.totalNews, 18);
      assert.equal(metrics.apiNewsPublishedCount, 1);
      assert.equal(metrics.apiNewsDraftCount, 1);
      assert.equal(metrics.totalAvisos, 14);
      assert.equal(metrics.apiAvisosAtivosCount, 2);
      assert.equal(metrics.apiAvisosUrgentesCount, 1);

      const html = renderOverviewFromState(state);
      assert.ok(html.includes('>42</p>'));
      assert.ok(html.includes('30 publicadas · 9 aguardando'));
      assert.ok(html.includes('Registros sincronizados com a API Rails'));
      assert.ok(html.includes('42 dúvidas'));
      assert.ok(html.includes('30 publicadas · 9 aguardando aprovação'));
      assert.ok(html.includes('42 registros no catálogo oficial'));
      assert.ok(html.includes('href="/admin/faq"'));
      assert.equal((html.match(/Indisponível — sem integração oficial/g) || []).length, 5);
    } finally {
      fetchMock.mock.restore();
      clearStoredTokens();
    }
  });

  it('exibe estado de coleção realmente vazia (0 dúvidas) sem confundir com erro ou ausência de integração', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) =>
      serveOverviewEndpoint(String(input), { emptyFaqs: true }),
    );
    try {
      const snapshot = await createAdminOverviewLoader()(true);
      assert.ok(snapshot);
      const state = applyOverviewSnapshot(createInitialOverviewState(), snapshot);
      const metrics = getOverviewMetrics(state);

      assert.equal(state.faqs.error, null);
      assert.equal(metrics.totalFaqs, 0);
      assert.equal(metrics.apiFaqsPendingCount, 0);
      assert.equal(metrics.apiFaqsPublishedCount, 0);

      const html = renderOverviewFromState(state);
      assert.ok(html.includes('0 publicadas · 0 aguardando'));
      assert.ok(html.includes('Nenhuma dúvida cadastrada'));
      assert.ok(html.includes('0 dúvidas'));
      assert.ok(html.includes('Nenhuma dúvida cadastrada até o momento'));
      assert.ok(html.includes('href="/admin/faq"'));
      assert.ok(!html.includes('Falha ao consultar /d_duvidas'));
    } finally {
      fetchMock.mock.restore();
    }
  });

  it('trata erros 401 e 403 em /d_duvidas sem exibir zeros ou números fictícios e preservando Notícias e Avisos', async () => {
    for (const [status, errorCode, expectedMessage] of [
      [401, 'nao_autenticado', 'Você precisa estar autenticado para realizar esta ação.'],
      [403, 'sem_permissao', 'Você não possui permissão para executar esta operação.'],
    ] as const) {
      clearStoredTokens();
      const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) =>
        serveOverviewEndpoint(String(input), {
          faqResponse: () => jsonResponse({ success: false, message: 'Acesso negado', errors: [errorCode] }, status),
        }),
      );
      try {
        const snapshot = await createAdminOverviewLoader()(true);
        assert.ok(snapshot);
        const state = applyOverviewSnapshot(createInitialOverviewState(), snapshot);
        const metrics = getOverviewMetrics(state);

        assert.equal(state.faqs.loading, false);
        assert.equal(state.faqs.data, null);
        assert.equal(state.faqs.error, expectedMessage);
        assert.equal(metrics.totalFaqs, null);
        assert.equal(metrics.apiFaqsPendingCount, null);
        assert.equal(metrics.apiFaqsPublishedCount, null);

        // Indicadores de Notícias e Avisos permanecem intactos
        assert.equal(state.news.error, null);
        assert.equal(metrics.totalNews, 18);
        assert.equal(state.avisos.error, null);
        assert.equal(metrics.totalAvisos, 14);

        const html = renderOverviewFromState(state);
        assert.ok(html.includes(`Falha ao consultar /d_duvidas · ${expectedMessage}`));
        assert.ok(html.includes(`Falha de comunicação com a API (${expectedMessage})`));
        assert.ok(!html.includes('0 publicadas · 0 aguardando'));
        assert.ok(!html.includes('Nenhuma dúvida cadastrada'));
        assert.ok(!html.includes('0 dúvidas'));
        assert.ok(html.includes('>18</p>'));
        assert.ok(html.includes('>14</p>'));
        assert.ok(html.includes('href="/admin/faq"'));
      } finally {
        fetchMock.mock.restore();
      }
    }
  });

  it('distingue endpoint ainda não implantado (404), indisponibilidade (503) e falha de rede sem inventar valores', async () => {
    const scenarios: {
      mode: 404 | 503 | 'network';
      expectedError: string;
    }[] = [
      { mode: 404, expectedError: 'Endpoint ainda não disponível no servidor.' },
      { mode: 503, expectedError: 'Falha de comunicação com o servidor. Tente novamente em instantes.' },
      { mode: 'network', expectedError: 'API inacessível: sem conexão com o servidor (rede, CORS ou URL incorreta).' },
    ];

    for (const scenario of scenarios) {
      const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) =>
        serveOverviewEndpoint(String(input), {
          faqResponse: () => {
            if (scenario.mode === 'network') throw new Error('ECONNREFUSED');
            return jsonResponse({ success: false, message: scenario.expectedError }, scenario.mode);
          },
        }),
      );
      try {
        const snapshot = await createAdminOverviewLoader()(true);
        assert.ok(snapshot);
        const state = applyOverviewSnapshot(createInitialOverviewState(), snapshot);
        const metrics = getOverviewMetrics(state);

        assert.equal(state.faqs.data, null);
        assert.equal(state.faqs.error, scenario.expectedError);
        assert.equal(metrics.totalFaqs, null);
        assert.equal(metrics.apiFaqsPendingCount, null);
        assert.equal(metrics.apiFaqsPublishedCount, null);

        const html = renderOverviewFromState(state);
        assert.ok(html.includes(`Falha ao consultar /d_duvidas · ${scenario.expectedError}`));
        assert.ok(html.includes(`Falha de comunicação com a API (${scenario.expectedError})`));
        assert.ok(!html.includes('Nenhuma dúvida cadastrada'));
        assert.ok(!html.includes('0 dúvidas'));
      } finally {
        fetchMock.mock.restore();
      }
    }
  });
});

describe('Lote E3 — correção das notícias públicas e remoção de dados fictícios', () => {
  const publicNoticiaFixture: NoticiaPublica = {
    slug: 'polo-ribeirinho-recebe-novos-computadores',
    titulo: 'Polo ribeirinho recebe novos computadores',
    resumo: 'Breve resumo oficial para o card.',
    conteudo: 'Primeiro parágrafo oficial.\n\nSegundo parágrafo oficial.',
    data_publicacao: '2026-10-26',
    categoria_nome: 'Pedagógico',
    categoria_slug: 'pedagogico',
    autor_nome: 'Maria Silva',
    imagem_capa: null,
  };

  const publicNoticiaCategoriaFixture: CategoriaPublica = {
    nome: 'Pedagógico',
    slug: 'pedagogico',
  };

  function publicNoticiasReply(
    items: NoticiaPublica[] = [publicNoticiaFixture],
    pagination = {
      current_page: 1,
      total_pages: items.length ? 1 : 0,
      total_count: items.length,
      per_page: 9,
    },
  ) {
    return categoriaReply({
      success: true,
      message: 'Notícias públicas encontradas',
      data: { items, pagination },
    });
  }

  function publicCategoriasNoticiaReply(items: CategoriaPublica[] = [publicNoticiaCategoriaFixture]) {
    return categoriaReply({
      success: true,
      message: 'Categorias públicas encontradas',
      data: items,
    });
  }

  function mountPublicNoticias(
    fetcher: (url: URL, options: RequestInit) => Promise<Response>,
    strict = false,
    component = () => NewsEditorialSection(),
  ) {
    return mountCategories(fetcher, strict, {
      component,
      anonymous: true,
      allowedPaths: /\/publico\/n_(?:noticias|categorias_noticia)(?:\/[^/]+)?$/,
    });
  }

  function publicNoticiasBackend(read: (url: URL, options: RequestInit) => Promise<Response>) {
    return async (url: URL, options: RequestInit) =>
      url.pathname.endsWith('/n_categorias_noticia') ? publicCategoriasNoticiaReply() : read(url, options);
  }

  it('/noticias compartilha NewsEditorialSection e SSR apresenta carregamento sem notícias, categorias ou citações fictícias', () => {
    const pageTree = PublicNoticiasPage();
    const shared = noticeNodes(pageTree).filter((node) => node.type === NewsEditorialSection);
    assert.equal(shared.length, 1);

    const html = renderToStaticMarkup(createElement(NewsEditorialSection));
    assert.match(html, /Carregando notícias/);
    assert.match(html, /Carregando categorias/);
    assert.doesNotMatch(
      html,
      /Nenhuma reportagem encontrada|Calha Fluvial|Polo Central|Prof\. Carlos Eduardo Mendonça|Mayara Suruí|Salas Conectadas|Estudantes Atendidos|Resumo Executivo \(3 Pontos\)|Ficha de Impacto Territorial/,
    );
  });

  it('consulta anônima exibe notícias, total oficial, categorias ativas e links para detalhes sem dados fictícios de getEditorialDetails', async () => {
    const manager = await mountPublicNoticias(
      publicNoticiasBackend(async () =>
        publicNoticiasReply([publicNoticiaFixture], {
          current_page: 1,
          total_pages: 3,
          total_count: 24,
          per_page: 9,
        }),
      ),
    );
    try {
      const html = manager.html();
      assert.match(html, /24 resultados/);
      assert.match(html, /Polo ribeirinho recebe novos computadores/);
      assert.match(html, /Breve resumo oficial para o card\./);
      assert.match(html, /Maria Silva/);
      assert.match(html, /2026-10-26/);
      assert.match(html, /href="\/noticias\/polo-ribeirinho-recebe-novos-computadores"/);
      assert.ok(manager.nodes().some((node) => node.type === 'button' && node.props.children === 'Pedagógico'));

      // Ausência total de dados fictícios e estatísticas simuladas
      assert.doesNotMatch(
        html,
        /Calha Fluvial|Polo Central|Estúdios Centrais SEDUC|Terras Indígenas|Cone Sul|Vale do Jamari|Prof\. Carlos Eduardo Mendonça|Mayara Suruí|Profa\. Maria Helena Ribeiro|Prof\. José Arnaldo Silva|Salas Conectadas|Estudantes Atendidos|Resumo Executivo|Ficha de Impacto Territorial|unsplash\.com/,
      );

      // Abrir o leitor rápido também preserva apenas dados oficiais e link para detalhes
      const coverTrigger = manager.nodes().find(
        (node) => node.type === 'button' && node.props['aria-haspopup'] === 'dialog',
      );
      assert.ok(coverTrigger);
      await manager.act(() => Reflect.apply(coverTrigger.props.onClick as () => unknown, undefined, []));
      const modalHtml = manager.html();
      assert.match(modalHtml, /Primeiro parágrafo oficial\./);
      assert.match(modalHtml, /Segundo parágrafo oficial\./);
      assert.match(modalHtml, /Página da notícia/);
      assert.doesNotMatch(
        modalHtml,
        /Prof\. Carlos Eduardo Mendonça|Mayara Suruí|Salas Conectadas|Estudantes Atendidos|Resumo Executivo|Ficha de Impacto Territorial|Impacto Direto na Juventude|unsplash\.com/,
      );
      assert.equal(manager.calls.length, 2);
    } finally {
      await manager.restore();
    }
  });

  it('busca por notícia (busca), filtro por categoria (slug) e paginação enviam parâmetros oficiais à API sem filtro local e preservam filtros entre páginas', async () => {
    const manager = await mountPublicNoticias(
      publicNoticiasBackend(async (url) =>
        publicNoticiasReply([publicNoticiaFixture], {
          current_page: Number(url.searchParams.get('page') || 1),
          total_pages: 3,
          total_count: 24,
          per_page: 9,
        }),
      ),
    );
    try {
      await manager.click('Próxima');
      assert.match(manager.html(), /Página 2 de 3/);
      assert.equal(manager.calls.at(-1)!.url.searchParams.get('page'), '2');

      const beforeSearchCalls = manager.calls.length;
      await manager.change('busca', ' satélite ');
      assert.equal(manager.calls.length, beforeSearchCalls, 'Digitação não faz filtro local nem dispara requisição antes do envio');

      await manager.submit('Buscar notícias');
      let lastUrl = manager.calls.at(-1)!.url;
      assert.equal(lastUrl.searchParams.get('busca'), 'satélite');
      assert.equal(lastUrl.searchParams.get('page'), '1');
      assert.equal(lastUrl.searchParams.get('per_page'), '9');
      assert.match(
        manager.html(),
        /Polo ribeirinho recebe novos computadores/,
        'Não filtra localmente a página retornada pela API quando o termo difere do título local',
      );

      await manager.click('Pedagógico');
      lastUrl = manager.calls.at(-1)!.url;
      assert.equal(lastUrl.searchParams.get('categoria'), 'pedagogico');
      assert.equal(lastUrl.searchParams.get('busca'), 'satélite');
      assert.equal(lastUrl.searchParams.get('page'), '1');

      await manager.click('Próxima');
      lastUrl = manager.calls.at(-1)!.url;
      assert.equal(lastUrl.searchParams.get('page'), '2');
      assert.equal(lastUrl.searchParams.get('categoria'), 'pedagogico');
      assert.equal(lastUrl.searchParams.get('busca'), 'satélite');

      await manager.click('Limpar filtros');
      lastUrl = manager.calls.at(-1)!.url;
      assert.equal(lastUrl.searchParams.has('busca'), false);
      assert.equal(lastUrl.searchParams.has('categoria'), false);
      assert.equal(lastUrl.searchParams.get('page'), '1');
    } finally {
      await manager.restore();
    }
  });

  it('estados de carregamento, vazio legítimo e erro funcionam independentemente para notícias e categorias sem inventar categorias fixas', async () => {
    const pendingNews = adminReturnDeferred<Response>();
    const manager = await mountPublicNoticias(async (url) =>
      url.pathname.endsWith('/n_categorias_noticia') ? publicCategoriasNoticiaReply([]) : pendingNews.promise,
    );
    try {
      assert.match(manager.html(), /Carregando notícias/);
      assert.match(manager.html(), /Nenhuma categoria disponível/);
      assert.doesNotMatch(manager.html(), /Infraestrutura|Tecnologia|Eventos|Nenhuma reportagem encontrada/);

      await manager.act(() => pendingNews.resolve(publicNoticiasReply([])));
      assert.match(manager.html(), /Nenhuma reportagem encontrada/);
      assert.doesNotMatch(manager.html(), /role="alert"/);
    } finally {
      await manager.restore();
    }

    for (const outcome of [401, 404, 503, 'network'] as const) {
      let failed = true;
      const errorManager = await mountPublicNoticias(
        publicNoticiasBackend(async () => {
          if (!failed) return publicNoticiasReply();
          if (outcome === 'network') throw new TypeError('Failed to fetch');
          return categoriaReply({ success: false, errors: ['nao_autenticado'] }, outcome);
        }),
      );
      try {
        assert.match(errorManager.html(), /role="alert"/);
        assert.match(errorManager.html(), outcome === 'network' ? /conectar/ : /Notícias indisponíveis/);
        assert.doesNotMatch(errorManager.html(), /Nenhuma reportagem encontrada|Polo ribeirinho/);
        failed = false;
        await errorManager.click('Tentar novamente');
        assert.match(errorManager.html(), /Polo ribeirinho recebe novos computadores/);
      } finally {
        await errorManager.restore();
      }
    }

    let catFailed = true;
    const catErrorManager = await mountPublicNoticias(async (url) => {
      if (url.pathname.endsWith('/n_categorias_noticia')) {
        return catFailed ? categoriaReply({ success: false }, 503) : publicCategoriasNoticiaReply();
      }
      return publicNoticiasReply();
    });
    try {
      assert.match(catErrorManager.html(), /Categorias indisponíveis/);
      assert.match(catErrorManager.html(), /Polo ribeirinho recebe novos computadores/);
      catFailed = false;
      await catErrorManager.click('Recarregar categorias');
      assert.ok(catErrorManager.nodes().some((node) => node.type === 'button' && node.props.children === 'Pedagógico'));
    } finally {
      await catErrorManager.restore();
    }
  });

  it('chamadas públicas de notícias nunca enviam Bearer, não acionam refresh e preservam sessão administrativa mesmo em 401', async () => {
    setStoredTokens({ access_token: 'admin-news-token', refresh_token: 'admin-news-refresh' });
    const calls: { url: URL; auth: string | null; credentials: RequestCredentials | undefined }[] = [];
    const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = new URL(String(input));
      calls.push({
        url,
        auth: new Headers(options?.headers).get('Authorization'),
        credentials: options?.credentials,
      });
      if (url.pathname.endsWith('/n_categorias_noticia')) return publicCategoriasNoticiaReply();
      if (url.pathname.endsWith('/polo-ribeirinho-recebe-novos-computadores')) {
        return categoriaReply({ success: true, message: 'OK', data: publicNoticiaFixture });
      }
      return publicNoticiasReply();
    });

    try {
      await medtecApi.noticias.listPublico({ page: 1, per_page: 9, categoria: 'pedagogico', busca: 'polo' });
      await medtecApi.noticias.listCategoriasPublico();
      await medtecApi.noticias.getPublicoBySlug('polo-ribeirinho-recebe-novos-computadores');

      assert.equal(calls.length, 3);
      for (const call of calls) {
        assert.match(call.url.pathname, /\/publico\/n_/);
        assert.equal(call.auth, null);
        assert.equal(call.credentials, 'omit');
      }
      assert.equal(getStoredAccessToken(), 'admin-news-token');
      assert.equal(getStoredRefreshToken(), 'admin-news-refresh');
    } finally {
      fetchMock.mock.restore();
      clearStoredTokens();
    }
  });

  it('página de detalhes /noticias/[id] consome GET /publico/n_noticias/:slug sem Bearer, preserva retorno à listagem, omite capa ausente e não aciona NewsViewTracker', async () => {
    setStoredTokens({ access_token: 'admin-detail-token', refresh_token: 'admin-detail-refresh' });
    const calls: { path: string; method: string; auth: string | null }[] = [];
    const fetchMock = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = new URL(String(input), 'http://localhost:3000');
      calls.push({
        path: url.pathname,
        method: options?.method || 'GET',
        auth: new Headers(options?.headers).get('Authorization'),
      });
      return categoriaReply({
        success: true,
        message: 'Notícia encontrada',
        data: publicNoticiaFixture,
      });
    });

    try {
      const router = {
        back() {},
        forward() {},
        refresh() {},
        push() {},
        replace() {},
        prefetch() {},
        bfcacheId: 'noticia-detalhe-test',
      };
      const meta = await generateNoticiaMetadata({ params: Promise.resolve({ id: publicNoticiaFixture.slug }) });
      assert.match(String(meta.title), /Polo ribeirinho recebe novos computadores/);

      const pageElement = await PublicNoticiaDetalhePage({
        params: Promise.resolve({ id: publicNoticiaFixture.slug }),
      });
      const html = renderToStaticMarkup(
        createElement(
          AppRouterContext.Provider,
          { value: router },
          createElement(PathnameContext.Provider, { value: `/noticias/${publicNoticiaFixture.slug}` }, pageElement),
        ),
      );

      assert.match(html, /Polo ribeirinho recebe novos computadores/);
      assert.match(html, /Breve resumo oficial para o card\./);
      assert.match(html, /Primeiro parágrafo oficial\./);
      assert.match(html, /Maria Silva/);
      assert.match(html, /2026-10-26/);
      assert.match(html, /Pedagógico/);
      assert.match(html, /href="\/noticias"/);
      assert.match(html, /Voltar para todas as notícias/);
      assert.doesNotMatch(html, /unsplash\.com/);
      assert.doesNotMatch(html, /Conteúdo em elaboração/);

      // Nenhuma chamada POST para /api/news/view nem envio de Bearer
      recordNewsView(publicNoticiaFixture.slug);
      assert.equal(renderToStaticMarkup(createElement(NewsViewTracker, { id: publicNoticiaFixture.slug })), '');
      assert.equal(calls.some((call) => call.path.includes('/api/news/view') || call.method === 'POST'), false);
      for (const call of calls) {
        assert.equal(call.path.endsWith(`/publico/n_noticias/${publicNoticiaFixture.slug}`), true);
        assert.equal(call.auth, null);
      }
      assert.equal(getStoredAccessToken(), 'admin-detail-token');
      assert.equal(getStoredRefreshToken(), 'admin-detail-refresh');
    } finally {
      fetchMock.mock.restore();
      clearStoredTokens();
    }
  });
});

// E5: exercita formulários e cargas das páginas sem montar autenticação nem
// realizar HTTP real. Reutiliza o reconciliador e o interceptador já existentes.
const e5Active: ATipoAviso = { id: 37, nome: 'Ativa oficial', slug: 'ativa-oficial', ativo: true, posicao: 0, cor: '#004A99' };
const e5Inactive: ATipoAviso = { ...e5Active, id: 51, nome: 'Inativa oficial', slug: 'inativa-oficial', ativo: false };
const e5Aviso: AAviso = { id: 81, titulo: 'Comunicado existente', conteudo: 'Orientação oficial', a_tipo_aviso_id: 51, ativo: true, created_at: '2026-10-31T12:00:00Z', updated_at: '2026-10-31T12:00:00Z' };
const e5Foto: FotoGaleria = { id: 82, titulo: 'Foto existente', categoria_galeria_id: 51, imagem_url: 'https://example.test/foto.jpg', created_at: '2026-10-31T12:00:00Z', updated_at: '2026-10-31T12:00:00Z' };
type E5Kind = 'avisos' | 'galeria';

async function mountE5(kind: E5Kind, config: {
  catalog?: ATipoAviso[]; existing?: boolean; loading?: boolean; error?: string; page?: boolean;
  fetcher?: (url: URL, options: RequestInit) => Promise<Response>;
} = {}) {
  const alerts: string[] = [];
  let confirmed = true;
  const descriptors = new Map(['alert', 'confirm'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.defineProperty(globalThis, 'alert', { configurable: true, value: (message: string) => alerts.push(message) });
  Object.defineProperty(globalThis, 'confirm', { configurable: true, value: () => confirmed });
  let updateCatalog: (next: ATipoAviso[]) => void;
  let updateLoading: React.Dispatch<React.SetStateAction<boolean>>;
  let updateError: React.Dispatch<React.SetStateAction<string | null>>;
  const isAviso = kind === 'avisos';
  const formLabel = isAviso ? 'Formulário de aviso' : 'Formulário de foto';
  const foreign = isAviso ? 'a_tipo_aviso_id' : 'categoria_galeria_id';
  function Component() {
    const [catalog, setCatalog] = React.useState(config.catalog ?? [e5Active]);
    const [categories, setCategories] = React.useState<CategoriaGaleria[]>(config.catalog ?? [e5Active]);
    const [loading, setLoading] = React.useState(config.loading ?? false);
    const [error, setError] = React.useState<string | null>(config.error ?? null);
    const [avisos, setAvisos] = React.useState(config.existing ? [e5Aviso] : []);
    const [fotos, setFotos] = React.useState(config.existing ? [e5Foto] : []);
    React.useEffect(() => {
      updateCatalog = isAviso ? setCatalog : setCategories; updateLoading = setLoading; updateError = setError;
    }, [setCatalog, setCategories, setLoading, setError]);
    if (config.page) {
      // Os hooks da página e do módulo executam no Capture do harness. O Shell
      // continua sendo conferido pelos testes de acesso existentes.
      if (isAviso) {
        const page = AdminAvisosPage();
        const child = page.props.children as React.ReactElement<AnnouncementsModuleProps>;
        return AnnouncementsModule(child.props);
      }
      const page = AdminGaleriaPage();
      const child = page.props.children as React.ReactElement<GalleryModuleProps>;
      return GalleryModule(child.props);
    }
    return isAviso ? AnnouncementsModule({
      apiAvisos: avisos, setApiAvisos: setAvisos, apiTiposAviso: catalog, setApiTiposAviso: setCatalog,
      loadingAvisos: loading, errorAvisos: error, onPreview() {},
    }) : GalleryModule({
      apiFotos: fotos, setApiFotos: setFotos, apiCategorias: categories, setApiCategorias: setCategories,
      loadingFotos: loading, errorFotos: error, onPreview() {},
    });
  }
  const restoreDialogs = () => {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
    }
  };
  try {
    const manager = await mountCategories(config.fetcher ?? (async () => { throw new Error('HTTP inesperado no teste E5'); }), false, {
      component: Component, allowedPaths: /\/(?:a_avisos|a_tipos_aviso|fotos_galeria|categorias_galeria)(?:\/\d+)?$/,
    });
    const invoke = async (predicate: (node: React.ReactElement<NoticeNodeProps>) => boolean) => {
      const node = manager.nodes().find(predicate); assert.ok(node);
      await manager.act(() => Reflect.apply(node.props.onClick as () => unknown, undefined, []));
    };
    return {
      ...manager, alerts, foreign, formLabel,
      restore: async () => { try { await manager.restore(); } finally { restoreDialogs(); } },
      setCatalog: (value: ATipoAviso[]) => manager.act(() => updateCatalog(value)),
      setLoading: (value: boolean) => manager.act(() => updateLoading(value)),
      setError: (value: string | null) => manager.act(() => updateError(value)),
      confirm: (value: boolean) => { confirmed = value; },
      newRecord: () => invoke(node => node.type === 'button' && node.props.children instanceof Array && node.props.children.some((child: unknown) => isValidElement(child) && String((child.props as { children?: unknown }).children).includes(isAviso ? 'Novo Aviso' : 'Adicionar Foto'))),
      toggleCatalog: () => invoke(node => node.type === 'button' && Array.isArray(node.props.children) &&
        node.props.children.some((child: unknown) => isValidElement(child) && String((child.props as { children?: unknown }).children).includes(isAviso ? 'Tipos e Cores de Aviso' : 'Categorias da Galeria'))),
      async catalogAction(action: 'edit' | 'delete', index: number) {
        const title = isAviso ? (action === 'edit' ? 'Editar tipo' : 'Excluir tipo') : (action === 'edit' ? 'Editar categoria' : 'Excluir categoria');
        const node = manager.nodes().filter(node => node.type === 'button' && node.props.title === title)[index]; assert.ok(node);
        await manager.act(() => Reflect.apply(node.props.onClick as () => unknown, undefined, []));
      },
      submitCatalog: () => manager.submit(),
      edit: () => invoke(node => node.type === 'button' && node.props.title === (isAviso ? 'Editar' : 'Editar foto')),
      remove: () => invoke(node => node.type === 'button' && node.props.title === (isAviso ? 'Excluir' : 'Excluir foto')),
      select: () => manager.nodes().find(node => node.type === 'select' && node.props.name === foreign)!,
      optionIds() {
        const select = manager.nodes().find(node => node.type === 'select' && node.props.name === foreign); assert.ok(select);
        return noticeNodes(select).filter(node => node.type === 'option').map(node => node.props.value);
      },
      saveDisabled: () => manager.nodes().find(node => node.type === 'button' && node.props.type === 'submit')?.props.disabled,
      fill: async () => {
        await manager.change('titulo', 'Conteúdo de apresentação');
        await manager.change(isAviso ? 'conteudo' : 'imagem_url', isAviso ? 'Mensagem oficial' : 'https://example.test/nova.jpg');
      },
      submit: () => manager.submit(formLabel),
    };
  } catch (error) { restoreDialogs(); throw error; }
}

function e5List(items: unknown[]) {
  return categoriaReply({ success: true, data: { items, pagination: { current_page: 1, total_pages: items.length ? 1 : 0, total_count: items.length, per_page: 20 } } });
}

for (const kind of ['avisos', 'galeria'] as const) describe(`E5 — ${kind}`, () => {
  const isAviso = kind === 'avisos';
  const recordPath = isAviso ? '/a_avisos' : '/fotos_galeria';
  const catalogPath = isAviso ? '/a_tipos_aviso' : '/categorias_galeria';
  const saved = isAviso ? { ...e5Aviso, a_tipo_aviso_id: 37 } : { ...e5Foto, categoria_galeria_id: 37 };

  it('catálogo vazio não inventa ID 1 e bloqueia botão e submissão direta', async () => {
    const manager = await mountE5(kind, { catalog: [] });
    try {
      await manager.newRecord(); await manager.fill();
      assert.deepEqual(manager.optionIds(), ['']); assert.equal(manager.select().props.value, '');
      assert.equal(manager.saveDisabled(), true); await manager.submit();
      assert.equal(manager.calls.length, 0); assert.match(manager.alerts.at(-1)!, /Carregue e selecione/);
      assert.match(manager.html(), /Cadastre ou ative/);
    } finally { await manager.restore(); }
  });

  it('seleciona e envia apenas ID oficial ativo, mesmo com opção inativa em primeiro lugar', async () => {
    const manager = await mountE5(kind, { catalog: [e5Inactive, e5Active], fetcher: async () => categoriaReply(saved, 201) });
    try {
      await manager.newRecord(); await manager.fill();
      assert.deepEqual(manager.optionIds(), [37]); assert.equal(manager.select().props.value, 37);
      assert.equal(manager.saveDisabled(), false); await manager.submit();
      assert.equal(manager.calls.length, 1);
      const call = manager.calls[0]; assert.equal(call.options.method, 'POST'); assert.ok(call.url.pathname.endsWith(recordPath));
      const body = JSON.parse(String(call.options.body));
      assert.equal(body[isAviso ? 'a_aviso' : 'foto_galeria'][manager.foreign], 37);
      assert.match(manager.alerts.at(-1)!, /sucesso/);
    } finally { await manager.restore(); }
  });

  it('IDs inválidos no catálogo nunca são oferecidos ou enviados', async () => {
    const manager = await mountE5(kind, { catalog: [0, -1, 1.5].map(id => ({ ...e5Active, id })) });
    try {
      await manager.newRecord(); await manager.fill(); await manager.submit();
      assert.deepEqual(manager.optionIds(), ['']); assert.equal(manager.calls.length, 0);
    } finally { await manager.restore(); }
  });

  it('somente opções inativas não habilitam novos cadastros', async () => {
    const manager = await mountE5(kind, { catalog: [e5Inactive] });
    try {
      await manager.newRecord(); await manager.fill(); await manager.submit();
      assert.deepEqual(manager.optionIds(), ['']); assert.equal(manager.saveDisabled(), true);
      assert.equal(manager.calls.length, 0);
    } finally { await manager.restore(); }
  });

  it('edição mantém associação original inativa retornada pela API e exclui as outras inativas', async () => {
    const manager = await mountE5(kind, { existing: true, catalog: [e5Active, e5Inactive, { ...e5Inactive, id: 52 }], fetcher: async () => categoriaReply(isAviso ? e5Aviso : e5Foto) });
    try {
      await manager.edit();
      assert.equal(manager.select().props.value, 51); assert.deepEqual(manager.optionIds(), [37, 51]);
      assert.match(manager.html(), /inativ[oa] \(atual\)/);
      await manager.submit();
      assert.equal(manager.calls[0].options.method, 'PATCH');
      assert.equal(JSON.parse(String(manager.calls[0].options.body))[isAviso ? 'a_aviso' : 'foto_galeria'][manager.foreign], 51);
      await manager.newRecord(); assert.deepEqual(manager.optionIds(), [37]);
    } finally { await manager.restore(); }
  });

  it('associação ausente do catálogo não é fabricada a partir do registro editado', async () => {
    const manager = await mountE5(kind, { existing: true, catalog: [] });
    try {
      await manager.edit(); await manager.submit();
      assert.deepEqual(manager.optionIds(), ['']); assert.equal(manager.saveDisabled(), true); assert.equal(manager.calls.length, 0);
    } finally { await manager.restore(); }
  });

  it('seleção acompanha desativação e exclusão, bloqueando quando não restam opções válidas', async () => {
    const second = { ...e5Active, id: 73, nome: 'Segunda ativa' };
    const manager = await mountE5(kind, { catalog: [e5Active, second] });
    try {
      await manager.newRecord(); await manager.fill();
      await manager.change(manager.foreign, '73'); assert.equal(manager.select().props.value, 73);
      await manager.setCatalog([e5Active, { ...second, ativo: false }]);
      assert.equal(manager.select().props.value, 37); assert.deepEqual(manager.optionIds(), [37]);
      await manager.setCatalog([second]); assert.equal(manager.select().props.value, 73);
      await manager.setCatalog([]); assert.equal(manager.select().props.value, '');
      await manager.submit(); assert.equal(manager.calls.length, 0);
    } finally { await manager.restore(); }
  });

  for (const action of ['delete', 'deactivate'] as const) it(`resposta oficial de ${action} no gerenciador atualiza seleção e preserva o rascunho`, async () => {
    const second = { ...e5Active, id: 73, nome: 'Segunda ativa' };
    const manager = await mountE5(kind, { catalog: [e5Active, second], fetcher: async (url, options) => {
      if (url.pathname.endsWith(catalogPath + '/73')) {
        assert.equal(options.method, action === 'delete' ? 'DELETE' : 'PATCH');
        return action === 'delete' ? new Response(null, { status: 204 }) : categoriaReply({ ...second, ativo: false });
      }
      return categoriaReply(saved, 201);
    } });
    try {
      await manager.newRecord(); await manager.fill(); await manager.change(manager.foreign, '73');
      await manager.toggleCatalog();
      await manager.catalogAction(action === 'delete' ? 'delete' : 'edit', 1);
      if (action === 'deactivate') await manager.submitCatalog();
      await manager.click('Fechar');
      assert.equal(manager.select().props.value, 37); assert.deepEqual(manager.optionIds(), [37]);
      assert.match(manager.html(), /Conteúdo de apresentação/);
      await manager.submit();
      assert.equal(manager.calls.length, 2);
      assert.equal(JSON.parse(String(manager.calls[1].options.body))[isAviso ? 'a_aviso' : 'foto_galeria'][manager.foreign], 37);
    } finally { await manager.restore(); }
  });

  it('exclusão recusada do catálogo mantém a opção existente e mostra o erro', async () => {
    const manager = await mountE5(kind, { fetcher: async () => categoriaReply({ success: false, message: 'Existem vínculos', errors: ['Não foi possível excluir'] }, 422) });
    try {
      await manager.newRecord(); await manager.fill(); await manager.toggleCatalog();
      await manager.catalogAction('delete', 0); await manager.click('Fechar');
      assert.equal(manager.select().props.value, 37); assert.deepEqual(manager.optionIds(), [37]);
      assert.match(manager.alerts.at(-1)!, /Existem vínculos/); assert.doesNotMatch(manager.alerts.at(-1)!, /sucesso/);
      assert.equal(manager.calls.length, 1);
    } finally { await manager.restore(); }
  });

  it('carregamento ou erro bloqueia envio mesmo mantendo catálogo previamente válido e rascunho', async () => {
    const manager = await mountE5(kind);
    try {
      await manager.newRecord(); await manager.fill();
      await manager.setLoading(true); assert.equal(manager.saveDisabled(), true); await manager.submit();
      await manager.setLoading(false); await manager.setError('Falha simulada');
      assert.equal(manager.saveDisabled(), true); await manager.submit();
      assert.equal(manager.calls.length, 0); assert.match(manager.html(), /Conteúdo de apresentação/);
      await manager.setError(null); assert.equal(manager.saveDisabled(), false);
    } finally { await manager.restore(); }
  });

  for (const failure of [401, 403, 500, 'network', 'invalid'] as const) it(`página distingue falha ${failure} de vazio e permite recarregar catálogo e lista`, async () => {
    let failed = true;
    const manager = await mountE5(kind, { page: true, fetcher: async url => {
      assert.equal(url.searchParams.get('page'), 'all');
      if (failed && url.pathname.endsWith(catalogPath)) {
        if (failure === 'network') throw new TypeError('Failed to fetch');
        if (failure === 'invalid') return categoriaReply({ success: true, data: { items: null } });
        return categoriaReply({ success: false, message: 'Falha simulada', errors: ['sem_permissao'] }, failure);
      }
      return url.pathname.endsWith(catalogPath) ? e5List([e5Active]) : e5List([]);
    } });
    try {
      assert.match(manager.html(), /role="alert"/);
      assert.doesNotMatch(manager.html(), /Nenhum aviso cadastrado|Nenhuma foto cadastrada/);
      await manager.newRecord(); await manager.fill(); assert.equal(manager.saveDisabled(), true); await manager.submit();
      assert.equal(manager.calls.filter(call => call.options.method !== 'GET').length, 0);
      if (failure === 401) {
        assert.equal(getStoredAccessToken(), null);
        // Simula autenticação renovada pelo usuário antes de repetir a leitura.
        setStoredTokens({ access_token: 'category-ui-user', refresh_token: 'category-ui-refresh' });
      }
      failed = false; await manager.click('Tentar novamente');
      assert.equal(manager.select().props.value, 37); assert.equal(manager.saveDisabled(), false);
      assert.match(manager.html(), /Conteúdo de apresentação/); assert.doesNotMatch(manager.html(), /role="alert"/);
      assert.equal(manager.calls.length, 4);
      await manager.click('Cancelar');
      assert.match(manager.html(), isAviso ? /Nenhum aviso cadastrado/ : /Nenhuma foto cadastrada/);
    } finally { await manager.restore(); }
  });

  it('falha na leitura dos registros também bloqueia envio e não se apresenta como lista vazia', async () => {
    const manager = await mountE5(kind, { page: true, fetcher: async url => url.pathname.endsWith(catalogPath)
      ? e5List([e5Active]) : categoriaReply({ success: false, message: 'Lista indisponível' }, 503) });
    try {
      assert.match(manager.html(), /role="alert"/);
      assert.doesNotMatch(manager.html(), /Nenhum aviso cadastrado|Nenhuma foto cadastrada/);
      await manager.newRecord(); await manager.fill(); await manager.submit();
      assert.equal(manager.saveDisabled(), true); assert.equal(manager.calls.length, 2);
    } finally { await manager.restore(); }
  });

  it('página aguarda catálogo pendente, sem tratar carregamento como vazio ou permitir salvar', async () => {
    const pending = adminReturnDeferred<Response>();
    const manager = await mountE5(kind, { page: true, fetcher: async url => url.pathname.endsWith(catalogPath) ? pending.promise : e5List([]) });
    try {
      assert.match(manager.html(), /Carregando/); assert.doesNotMatch(manager.html(), /Nenhum aviso cadastrado|Nenhuma foto cadastrada/);
      await manager.newRecord(); await manager.fill(); await manager.submit(); assert.equal(manager.saveDisabled(), true);
      await manager.act(() => pending.resolve(e5List([e5Active])));
      assert.equal(manager.select().props.value, 37); assert.equal(manager.saveDisabled(), false);
      assert.equal(manager.calls.length, 2);
    } finally { await manager.restore(); }
  });

  it('exclusão mantém confirmação, cancelamento e tratamento de 204 sem corpo', async () => {
    const manager = await mountE5(kind, { existing: true, fetcher: async () => new Response(null, { status: 204 }) });
    try {
      manager.confirm(false); await manager.remove(); assert.equal(manager.calls.length, 0);
      manager.confirm(true); await manager.remove();
      assert.equal(manager.calls.length, 1); assert.equal(manager.calls[0].options.method, 'DELETE');
      assert.match(manager.alerts.at(-1)!, /sucesso/);
    } finally { await manager.restore(); }
  });
});

for (const existing of [false, true]) it(`E5 — upload da Galeria preserva multipart e seleção oficial na ${existing ? 'edição' : 'criação'}`, async () => {
  const manager = await mountE5('galeria', { existing, catalog: [e5Active, e5Inactive], fetcher: async (_url, options) => {
    assert.ok(options.body instanceof FormData);
    assert.equal(new Headers(options.headers).get('Content-Type'), null);
    assert.equal(options.body.get('foto_galeria[categoria_galeria_id]'), existing ? '51' : '37');
    assert.equal(options.body.get('foto_galeria[titulo]'), existing ? e5Foto.titulo : 'Conteúdo de apresentação');
    const file = options.body.get('foto_galeria[imagem]'); assert.ok(file instanceof File); assert.equal(file.name, 'apresentacao.png');
    assert.equal(options.method, existing ? 'PATCH' : 'POST');
    return categoriaReply(e5Foto, existing ? 200 : 201);
  } });
  try {
    if (existing) await manager.edit(); else { await manager.newRecord(); await manager.fill(); }
    const input = manager.nodes().find(node => node.type === 'input' && node.props.type === 'file'); assert.ok(input);
    await manager.act(() => Reflect.apply(input.props.onChange as () => unknown, undefined, [{ target: { files: [new File(['png'], 'apresentacao.png', { type: 'image/png' })] } }]));
    await manager.submit(); assert.equal(manager.calls.length, 1); assert.match(manager.alerts.at(-1)!, /sucesso/);
  } finally { await manager.restore(); }
});

const e6News: NewsItem = {
  id: '91', title: 'Notícia devolvida para correção', slug: 'noticia-devolvida',
  excerpt: 'Resumo oficial', content: 'Conteúdo original da notícia.',
  coverImage: 'https://api.example.test/rails/active_storage/blobs/redirect/original/capa.png',
  author: 'Autora oficial', category: 'Pedagógico', publishedAt: '2026-10-31',
  featured: false, published: false, rejected: true, rejectionReason: 'Informe a fonte da fotografia.',
};

async function mountE6(config: {
  news?: Partial<NewsItem>; create?: boolean; list?: boolean; canEdit?: boolean;
  fetcher?: (url: URL, options: RequestInit) => Promise<Response>;
} = {}) {
  const news = { ...e6News, ...config.news };
  const alerts: string[] = [];
  const refresh = mock.fn(async () => {});
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'alert');
  Object.defineProperty(globalThis, 'alert', { configurable: true, value: (message: string) => alerts.push(message) });
  function Component() {
    const [mode, setMode] = React.useState<'lista' | 'editor'>(config.list ? 'lista' : 'editor');
    return NewsModule({
      effectiveNews: [news], apiNewsCategories: [{ id: 37, nome: 'Pedagógico', slug: 'pedagogico', ativo: true }],
      initialEditingNews: config.create || config.list ? undefined : news, initialNew: config.create,
      loadingNews: false, errorNews: null, userSession: { name: 'Autora oficial' },
      canCreate: true, canEdit: config.canEdit ?? true, canDelete: true, canPublish: false,
      newsViewMode: mode, setNewsViewMode: setMode, onRefresh: refresh,
      onTogglePublished: async () => {}, onPreview() {},
    });
  }
  const restoreAlert = () => {
    if (descriptor) Object.defineProperty(globalThis, 'alert', descriptor); else Reflect.deleteProperty(globalThis, 'alert');
  };
  try {
    const manager = await mountCategories(config.fetcher ?? (async () => categoriaReply({ id: 91 }, config.create ? 201 : 200)), false, {
      component: Component, allowedPaths: /\/n_noticias(?:\/\d+)?$/,
    });
    Object.defineProperty(window, 'scrollTo', { configurable: true, value() {} });
    return {
      ...manager, alerts,
      refreshes: () => refresh.mock.callCount(),
      restore: async () => {
        // O módulo mantém o aviso de sucesso existente, agendado em 50 ms.
        try { if (refresh.mock.callCount()) await new Promise(resolve => setTimeout(resolve, 60)); await manager.restore(); }
        finally { restoreAlert(); }
      },
      async text(placeholder: string, value: string) {
        const input = manager.nodes().find(node => node.props.placeholder === placeholder); assert.ok(input);
        await manager.act(() => Reflect.apply(input.props.onChange as () => unknown, undefined, [{ target: { value } }]));
      },
      async upload() {
        const input = manager.nodes().find(node => node.type === 'input' && node.props.name === 'imagem_capa'); assert.ok(input);
        await manager.act(() => Reflect.apply(input.props.onChange as () => unknown, undefined, [{ target: { files: [new File(['nova-capa'], 'nova.png', { type: 'image/png' })] } }]));
      },
      async edit() {
        const button = manager.nodes().find(node => node.type === 'button' && node.props.title === 'Editar notícia'); assert.ok(button);
        await manager.act(() => Reflect.apply(button.props.onClick as () => unknown, undefined, []));
      },
      coverPreview: () => manager.nodes().find(node => node.type === 'img' && node.props.alt === 'Preview')?.props.src,
      coverInput: () => manager.nodes().find(node => node.type === 'input' && node.props.name === 'imagem_capa_url')!,
    };
  } catch (error) { restoreAlert(); throw error; }
}

function assertE6Preserved(body: unknown) {
  const payload = JSON.parse(String(body)).n_noticia;
  assert.ok(!Object.hasOwn(payload, 'imagem_capa_url'));
  assert.ok(!Object.hasOwn(payload, 'imagem_capa'));
  assert.ok(!Object.hasOwn(payload, 'remove_imagem_capa'));
  return payload;
}

describe('E6 — preservação da capa e motivo de reprovação de Notícias', () => {
  for (const coverImage of [e6News.coverImage, 'https://example.test/capa-externa.jpg', '']) {
    it(`editar texto preserva capa ${coverImage.includes('/rails/') ? 'enviada por upload' : coverImage ? 'externa' : 'ausente'} e omite todos os campos de imagem no PATCH`, async () => {
      const manager = await mountE6({ news: { coverImage } });
      try {
        assert.equal(manager.coverInput().props.value, '');
        assert.equal(manager.coverPreview(), coverImage || undefined);
        await manager.text('Ex: Polo ribeirinho recebe novos computadores do MEDTEC...', 'Título corrigido');
        await manager.text('Escreva aqui os parágrafos completos da notícia...', 'Conteúdo corrigido.');
        await manager.submit(); assert.equal(manager.calls.length, 1);
        const call = manager.calls[0]; assert.ok(call.url.pathname.endsWith('/n_noticias/91')); assert.equal(call.options.method, 'PATCH');
        assert.deepEqual(assertE6Preserved(call.options.body), {
          titulo: 'Título corrigido', conteudo: 'Conteúdo corrigido.', n_categoria_noticia_id: 37,
          resumo: 'Resumo oficial', data_publicacao: '2026-10-31',
        });
        assert.equal(manager.refreshes(), 1);
      } finally { await manager.restore(); }
    });
  }

  it('substituição explícita por URL envia somente os campos oficiais do Rails', async () => {
    const manager = await mountE6();
    try {
      await manager.change('imagem_capa_url', ' https://example.test/nova-capa.jpg ');
      assert.equal(manager.coverPreview(), 'https://example.test/nova-capa.jpg');
      await manager.submit();
      assert.deepEqual(JSON.parse(String(manager.calls[0].options.body)), { n_noticia: {
        titulo: e6News.title, conteudo: e6News.content, n_categoria_noticia_id: 37, resumo: e6News.excerpt,
        data_publicacao: e6News.publishedAt, imagem_capa_url: 'https://example.test/nova-capa.jpg',
      } });
      assert.equal(manager.refreshes(), 1);
    } finally { await manager.restore(); }
  });

  it('repetir a URL atual não converte o anexo em link nem envia substituição', async () => {
    const manager = await mountE6();
    try {
      await manager.change('imagem_capa_url', ' ' + e6News.coverImage + ' '); await manager.submit();
      assertE6Preserved(manager.calls[0].options.body);
    } finally { await manager.restore(); }
  });

  it('limpar a nova URL restaura a prévia atual e não solicita remoção de capa', async () => {
    const manager = await mountE6();
    try {
      await manager.change('imagem_capa_url', 'https://example.test/temporaria.jpg');
      await manager.change('imagem_capa_url', '');
      assert.equal(manager.coverPreview(), e6News.coverImage);
      assert.match(manager.html(), /capa atual será mantida/);
      await manager.submit(); assertE6Preserved(manager.calls[0].options.body);
    } finally { await manager.restore(); }
  });

  it('novo upload substitui a capa por multipart sem enviar a URL anterior ou a URL digitada antes do arquivo', async () => {
    const manager = await mountE6();
    try {
      await manager.change('imagem_capa_url', 'https://example.test/temporaria.jpg'); await manager.upload();
      assert.equal(manager.coverInput().props.value, ''); assert.equal(manager.coverInput().props.disabled, true);
      await manager.submit();
      const call = manager.calls[0]; assert.equal(call.options.method, 'PATCH'); assert.ok(call.options.body instanceof FormData);
      assert.equal(new Headers(call.options.headers).get('Content-Type'), null);
      const form = call.options.body;
      assert.deepEqual([...form.keys()], ['n_noticia[titulo]', 'n_noticia[n_categoria_noticia_id]', 'n_noticia[conteudo]', 'n_noticia[resumo]', 'n_noticia[data_publicacao]', 'n_noticia[imagem_capa]']);
      assert.equal(form.get('n_noticia[n_categoria_noticia_id]'), '37');
      const image = form.get('n_noticia[imagem_capa]'); assert.ok(image instanceof File); assert.equal(image.name, 'nova.png');
      assert.equal(form.has('n_noticia[imagem_capa_url]'), false);
    } finally { await manager.restore(); }
  });

  it('remover somente o arquivo recém-selecionado preserva a capa anterior ao salvar', async () => {
    const manager = await mountE6();
    try {
      await manager.upload(); assert.match(String(manager.coverPreview()), /^blob:/);
      await manager.click('Remover arquivo');
      assert.equal(manager.coverPreview(), e6News.coverImage); assert.equal(manager.coverInput().props.disabled, false);
      await manager.submit(); assertE6Preserved(manager.calls[0].options.body);
    } finally { await manager.restore(); }
  });

  it('abertura pela lista e cancelamento descartam a substituição pendente sem alterar o registro', async () => {
    const manager = await mountE6({ list: true });
    try {
      await manager.edit(); assert.match(manager.html(), /Informe a fonte da fotografia/);
      await manager.change('imagem_capa_url', 'https://example.test/descartada.jpg');
      await manager.click('Cancelar e Voltar'); assert.equal(manager.calls.length, 0);
      await manager.edit(); assert.equal(manager.coverInput().props.value, ''); assert.equal(manager.coverPreview(), e6News.coverImage);
      await manager.submit(); assertE6Preserved(manager.calls[0].options.body);
    } finally { await manager.restore(); }
  });

  for (const selection of ['none', 'url', 'file'] as const) it(`novo cadastro mantém o fluxo existente com capa ${selection}`, async () => {
    const manager = await mountE6({ create: true });
    try {
      await manager.text('Ex: Polo ribeirinho recebe novos computadores do MEDTEC...', 'Notícia nova');
      await manager.text('Escreva aqui os parágrafos completos da notícia...', 'Conteúdo novo');
      if (selection === 'url') await manager.change('imagem_capa_url', 'https://example.test/nova.jpg');
      if (selection === 'file') await manager.upload();
      await manager.submit(); assert.equal(manager.calls.length, 1); assert.equal(manager.calls[0].options.method, 'POST');
      assert.ok(manager.calls[0].url.pathname.endsWith('/n_noticias'));
      const body = manager.calls[0].options.body;
      if (selection === 'file') { assert.ok(body instanceof FormData); assert.ok(body.get('n_noticia[imagem_capa]') instanceof File); }
      else if (selection === 'url') assert.equal(JSON.parse(String(body)).n_noticia.imagem_capa_url, 'https://example.test/nova.jpg');
      else assertE6Preserved(body);
      assert.equal(manager.refreshes(), 1);
    } finally { await manager.restore(); }
  });

  it('exibe a justificativa real como texto, preservando quebras de linha e escapando marcação', async () => {
    const reason = 'Inclua a fonte oficial.\nConfira o crédito <img src=x onerror=alert(1)>.';
    const manager = await mountE6({ news: { rejectionReason: reason } });
    try {
      const section = manager.nodes().find(node => node.type === 'section' && node.props['aria-label'] === 'Motivo da reprovação'); assert.ok(section);
      const paragraph = noticeNodes(section).find(node => node.type === 'p'); assert.ok(paragraph);
      assert.equal(paragraph.props.children, reason);
      assert.match(String(paragraph.props.className), /whitespace-pre-wrap/);
      assert.match(manager.html(), /&lt;img src=x onerror=alert\(1\)&gt;/);
      assert.equal(manager.calls.length, 0);
    } finally { await manager.restore(); }
  });

  for (const reason of [undefined, '', '   ']) it(`motivo ${reason === undefined ? 'ausente' : reason ? 'em branco' : 'vazio'} mostra somente a ausência informada`, async () => {
    const manager = await mountE6({ news: { rejectionReason: reason } });
    try {
      assert.match(manager.html(), /Motivo de reprovação não informado pela API/);
      assert.doesNotMatch(manager.html(), /Informe a fonte da fotografia/); assert.equal(manager.calls.length, 0);
    } finally { await manager.restore(); }
  });

  it('não apresenta motivo obsoleto quando a notícia não está reprovada', async () => {
    const manager = await mountE6({ news: { rejected: false } });
    try {
      assert.doesNotMatch(manager.html(), /Motivo da reprovação|Informe a fonte da fotografia/);
    } finally { await manager.restore(); }
  });

  it('mantém a restrição de edição para quem não possui permissão', async () => {
    const manager = await mountE6({ canEdit: false });
    try {
      assert.equal(manager.nodes().some(node => node.type === 'form'), false); assert.equal(manager.calls.length, 0);
    } finally { await manager.restore(); }
  });

  for (const status of [403, 422]) it(`recusa ${status} mantém o rascunho e a nova URL, sem sucesso ou recarregamento`, async () => {
    const manager = await mountE6({ fetcher: async () => categoriaReply({ success: false, message: 'Alteração recusada', errors: ['erro_simulado'] }, status) });
    try {
      await manager.change('imagem_capa_url', 'https://example.test/revisar.jpg'); await manager.submit();
      assert.equal(manager.calls.length, 1); assert.equal(manager.refreshes(), 0);
      assert.equal(manager.coverInput().props.value, 'https://example.test/revisar.jpg');
      assert.match(manager.alerts.at(-1)!, status === 422 ? /erro_simulado/ : /Alteração recusada/); assert.doesNotMatch(manager.alerts.join(' '), /sucesso/);
      assert.match(manager.html(), /Informe a fonte da fotografia/);
    } finally { await manager.restore(); }
  });
});

// Small DOM substitute for the shared focus hook; native keyboard activation is
// additionally checked in Chrome. No requests or authenticated sessions involved.
function mountE102Dialog(options: { empty?: boolean; disconnectedOpener?: boolean; open?: boolean } = {}) {
  const listeners = new Map<string, (event: { key?: string; shiftKey?: boolean; target?: unknown; preventDefault(): void; stopPropagation(): void }) => void>();
  class FocusElement {
    inert = false; isConnected = true; tabIndex = 0; hidden = false; disabled = false;
    parentElement: FocusElement | null = null; children: FocusElement[] = []; style = { overflow: 'auto' };
    focus() { if (!this.closest('[inert]')) doc.activeElement = this; }
    contains(node: unknown): boolean { return this === node || this.children.some(child => child.contains(node)); }
    closest(_selector: string): FocusElement | null { return this.inert ? this : this.parentElement?.closest(_selector) || null; }
    matches() { return this.disabled; }
    getClientRects() { return this.hidden ? [] : [{}]; }
    querySelectorAll(): FocusElement[] { return this.children.flatMap(child => [child, ...child.querySelectorAll()]); }
    append(...items: FocusElement[]) { for (const item of items) { item.parentElement = this; this.children.push(item); } }
  }
  const body = new FocusElement(), background = new FocusElement(), alreadyInert = new FocusElement();
  const overlay = new FocusElement(), dialog = new FocusElement(), opener = new FocusElement(), fallback = new FocusElement();
  const first = new FocusElement(), last = new FocusElement(), disabled = new FocusElement(), hidden = new FocusElement();
  disabled.disabled = true; hidden.hidden = true; dialog.tabIndex = -1; alreadyInert.inert = true;
  body.append(background, alreadyInert, overlay); background.append(opener, fallback); overlay.append(dialog);
  if (!options.empty) dialog.append(first, last, disabled, hidden);
  opener.isConnected = !options.disconnectedOpener;
  const doc: { activeElement: FocusElement; body: FocusElement; addEventListener: unknown; removeEventListener: unknown; querySelector: unknown } = { body, activeElement: opener,
    addEventListener: (type: string, callback: typeof listeners extends Map<string, infer V> ? V : never) => listeners.set(type, callback),
    removeEventListener: (type: string) => listeners.delete(type), querySelector: () => fallback };
  const values = { document: doc, HTMLElement: FocusElement, getComputedStyle: () => ({ visibility: 'visible' }) };
  const descriptors = new Map(Object.keys(values).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { configurable: true, value });
  let closed = 0;
  const effects: React.EffectCallback[] = [];
  const refs = [dialog, overlay, () => { closed++; }];
  const refMock = mock.method(React, 'useRef', (() => ({ current: refs.shift() })) as typeof React.useRef);
  const effectMock = mock.method(React, 'useEffect', (effect: React.EffectCallback) => { effects.push(effect); });
  let cleanup: ReturnType<React.EffectCallback>;
  function FocusProbe() {
    useDialogFocus(options.open ?? true, () => { closed++; }, '#fallback');
    return null;
  }
  try {
    FocusProbe();
    for (const effect of effects) { const result = effect(); if (result) cleanup = result; }
  } finally { refMock.mock.restore(); effectMock.mock.restore(); }
  let stopped = false;
  const stop = () => { if (!stopped) { stopped = true; if (cleanup) cleanup(); } };
  return { doc, dialog, first, last, opener, fallback, background, alreadyInert, body, get closed() { return closed; }, stop,
    key(key: string, shiftKey = false) {
      let prevented = false;
      listeners.get('keydown')?.({ key, shiftKey, preventDefault() { prevented = true; }, stopPropagation() {} });
      return prevented;
    },
    outsideFocus() { doc.activeElement = opener; listeners.get('focusin')?.({ target: opener, preventDefault() {}, stopPropagation() {} }); },
    restore() { stop(); for (const [key, value] of descriptors) { if (value) Object.defineProperty(globalThis, key, value); else Reflect.deleteProperty(globalThis, key); } },
  };
}

describe('E10.2 — foco e teclado dos diálogos', () => {
  it('direciona foco ao diálogo e isola o fundo sem perder o estado anterior', () => {
    const view = mountE102Dialog();
    try {
      assert.equal(view.doc.activeElement, view.dialog); assert.equal(view.background.inert, true);
      assert.equal(view.body.style.overflow, 'hidden');
      view.stop(); assert.equal(view.background.inert, false); assert.equal(view.alreadyInert.inert, true);
      assert.equal(view.body.style.overflow, 'auto');
    } finally { view.restore(); }
  });
  it('Tab e Shift+Tab percorrem e envolvem somente controles disponíveis', () => {
    const view = mountE102Dialog();
    try {
      assert.equal(view.key('Tab'), true); assert.equal(view.doc.activeElement, view.first);
      view.key('Tab', true); assert.equal(view.doc.activeElement, view.last);
      view.key('Tab'); assert.equal(view.doc.activeElement, view.first);
      view.dialog.focus(); view.key('Tab', true); assert.equal(view.doc.activeElement, view.last);
    } finally { view.restore(); }
  });
  it('sem controles mantém o foco no painel', () => {
    const view = mountE102Dialog({ empty: true });
    try { assert.equal(view.key('Tab'), true); assert.equal(view.key('Tab', true), true); assert.equal(view.doc.activeElement, view.dialog); }
    finally { view.restore(); }
  });
  it('Escape solicita fechamento uma vez; outras teclas não fecham', () => {
    const view = mountE102Dialog();
    try { assert.equal(view.key('Enter'), false); assert.equal(view.closed, 0); assert.equal(view.key('Escape'), true); assert.equal(view.closed, 1); }
    finally { view.restore(); }
  });
  it('fechamento restaura o acionador e remove os listeners', () => {
    const view = mountE102Dialog();
    try { view.stop(); assert.equal(view.doc.activeElement, view.opener); view.key('Escape'); assert.equal(view.closed, 0); }
    finally { view.restore(); }
  });
  it('acionador removido usa o retorno persistente do menu', () => {
    const view = mountE102Dialog({ disconnectedOpener: true });
    try { view.stop(); assert.equal(view.doc.activeElement, view.fallback); } finally { view.restore(); }
  });
  it('foco externo é devolvido ao painel', () => {
    const view = mountE102Dialog();
    try { view.outsideFocus(); assert.equal(view.doc.activeElement, view.dialog); } finally { view.restore(); }
  });
  it('fechado não prende foco nem rolagem', () => {
    const view = mountE102Dialog({ open: false });
    try { assert.equal(view.doc.activeElement, view.opener); assert.equal(view.background.inert, false); assert.equal(view.key('Tab'), false); }
    finally { view.restore(); }
  });
});

describe('E10.2 — controles semânticos dos cards', () => {
  it('projetos têm botão nativo de expansão e link separado', () => {
    let selected = '';
    const project = { id: 'p1', title: 'Projeto real no teste', shortTitle: 'Projeto', image: '', quote: '', school: '' };
    const states = mock.method(React, 'useState', ((value: unknown) => [Array.isArray(value) ? [project] : value === true ? false : typeof value === 'string' ? selected : value,
      (id: string) => { selected = id; }]) as typeof React.useState);
    const effects = mock.method(React, 'useEffect', () => {});
    try {
      const nodes = noticeNodes(HomeProjectsAccordionSection());
      const button = nodes.find(node => node.type === 'button' && String(node.props['aria-label']).startsWith('Expandir projeto'));
      assert.ok(button); assert.equal(button.props.type, 'button'); assert.equal(button.props['aria-expanded'], false);
      assert.equal(noticeNodes(button.props.children as ReactNode).some(node => node.type === NextLink || node.type === 'a'), false);
      Reflect.apply(button.props.onClick as () => unknown, undefined, []); assert.equal(selected, 'p1');
      const expanded = noticeNodes(HomeProjectsAccordionSection());
      assert.ok(expanded.some(node => node.type === NextLink && node.props.href === '/projetos'));
      assert.equal(expanded.find(node => node.type === 'button')?.props['aria-expanded'], true);
    } finally { states.mock.restore(); effects.mock.restore(); }
  });
  it('mural abre perfis por botões nativos nomeados', async () => {
    const teacher: ProfessorPublico = { id: 1, nome: 'Professora do teste', pratica_pedagogica: 'Resumo', escola_nome: 'Escola', cidade_nome: 'Teste', disciplinas: [{ nome: 'Ciências', slug: 'ciencias' }] };
    const student: ConquistaPublica = { id: 2, nome_aluno: 'Estudante do teste', titulo: 'Conquista', relato: 'Resumo', categoria_nome: 'Vestibular', categoria_slug: 'vestibular', escola_nome: 'Escola', cidade_nome: 'Teste', imagem: null, imagem_url: null, created_at: '2026-11-01' };
    const view = await mountCategories(async () => { throw new Error('Não deve chamar a API'); }, false, {
      component: () => CommunityMuralSection({ initialTeachers: [teacher], initialStudents: [student] }), allowedPaths: /never/,
    });
    try {
      for (const [opener, label] of [
        ['Abrir perfil de ' + teacher.nome, 'Perfil de ' + teacher.nome],
        ['Abrir conquista de ' + student.nome_aluno, 'Conquista de ' + student.nome_aluno],
      ]) {
        await view.click(opener);
        const dialog = view.nodes().find(node => node.props.role === 'dialog');
        assert.ok(dialog); assert.equal(dialog.props['aria-modal'], 'true'); assert.equal(dialog.props['aria-label'], label);
        await view.click('Fechar modal'); assert.equal(view.nodes().some(node => node.props.role === 'dialog'), false);
      }
      const text = view.nodes().flatMap(node => React.Children.toArray(node.props.children as ReactNode)).filter(child => typeof child === 'string').join(' ');
      assert.doesNotMatch(text, /LGPD|autorizada/);
      assert.equal(view.calls.length, 0);
    } finally { await view.restore(); }
  });
});

describe('E10.2 — abertura e fechamento dos modais públicos', () => {
  it('Avisos usa diálogo nomeado com foco programável e mantém o fechamento', async () => {
    const view = await mountCategories(async () => { throw new Error('Chamada inesperada'); }, false, {
      component: () => AvisosView({ announcements: [publicAvisoFixture] }), allowedPaths: /never/,
    });
    try {
      const opener = view.nodes().find(node => node.type === 'article')?.props.children;
      const button = noticeNodes(opener as ReactNode).find(node => node.type === 'button');
      assert.ok(button);
      await view.act(() => Reflect.apply(button.props.onClick as () => unknown, undefined, [{ stopPropagation() {} }]));
      const dialog = view.nodes().find(node => node.props.role === 'dialog');
      assert.ok(dialog); assert.equal(dialog.props.tabIndex, -1); assert.ok(dialog.props.ref);
      assert.equal(dialog.props['aria-label'], 'Comunicado: ' + publicAvisoFixture.titulo);
      await view.click('Fechar comunicado'); assert.equal(view.nodes().some(node => node.props.role === 'dialog'), false);
      assert.equal(view.calls.length, 0);
    } finally { await view.restore(); }
  });
  it('dossiê usa diálogo nomeado e preserva a ação existente de fechamento', async () => {
    let closed = 0;
    const view = await mountCategories(async () => { throw new Error('Chamada inesperada'); }, false, {
      component: () => ExecutiveDossierModal({ isOpen: true, onClose: () => { closed++; } }), allowedPaths: /never/,
    });
    try {
      const dialog = view.nodes().find(node => node.props.role === 'dialog');
      assert.ok(dialog); assert.equal(dialog.props['aria-modal'], 'true'); assert.equal(dialog.props.tabIndex, -1);
      assert.ok(dialog.props.ref); assert.equal(dialog.props['aria-label'], 'Dossiê institucional MEDTEC');
      await view.click('Fechar modal'); assert.equal(closed, 1); assert.equal(view.calls.length, 0);
    } finally { await view.restore(); }
  });
});

describe('E10.3 — busca de avisos e categorias recolhíveis do FAQ', () => {
  it('busca de avisos tem rótulo visível associado e preserva filtro local e links oficiais', async () => {
    const pagination = { current_page: 2, total_pages: 3, total_count: 21, per_page: 10 };
    const view = await mountCategories(async () => { throw new Error('Nenhuma requisição esperada'); }, false, {
      component: () => AvisosView({ announcements: [publicAvisoFixture], pagination, tipo: 'urgente' }), allowedPaths: /never/,
    });
    try {
      const input = view.nodes().find(node => node.type === 'input' && node.props.name === 'busca');
      assert.ok(input); assert.equal(input.props.type, 'search');
      const label = view.nodes().find(node => node.type === 'label' && node.props.htmlFor === input.props.id);
      assert.ok(label); assert.equal(label.props.children, 'Buscar avisos nesta página');
      assert.ok(!String(label.props.className).includes('sr-only'));
      const previousHref = view.nodes().find(node => node.type === NextLink && node.props.children === 'Anterior')?.props.href;
      assert.equal(previousHref, '/avisos?page=1&per_page=10&tipo=urgente');
      await view.change('busca', 'texto sem correspondência');
      assert.match(view.html(), /Nenhum comunicado nesta página corresponde à busca/);
      assert.ok(view.nodes().some(node => node.type === 'label' && node.props.htmlFor === input.props.id));
      await view.change('busca', ''); assert.match(view.html(), /Comunicado recebido da API/);
      assert.equal(view.calls.length, 0);
    } finally { await view.restore(); }
  });
  it('abre e recolhe categorias por botão sem novas consultas nem perda das perguntas', async () => {
    const categories = Array.from({ length: 30 }, (_, index) => ({ nome: `Categoria ${index + 1}`, slug: `categoria-${index + 1}` }));
    const view = await mountPublicFaq(async url => url.pathname.endsWith('/d_categorias_duvida') ? publicCategoryReply(categories) : publicDuvidaList());
    try {
      const trigger = () => view.nodes().find(node => node.type === 'button' && node.props['aria-label'] === 'Categorias');
      const panel = () => view.nodes().find(node => node.props.id === trigger()?.props['aria-controls']);
      assert.equal(trigger()?.props['aria-expanded'], false); assert.ok(panel());
      const calls = view.calls.length;
      await view.click('Categorias'); assert.equal(trigger()?.props['aria-expanded'], true);
      assert.equal(noticeNodes(panel()?.props.children as ReactNode).filter(node => node.type === 'button').length, 31);
      assert.ok(noticeNodes(panel()?.props.children as ReactNode).every(node => node.type !== 'button' || node.props.type === 'button'));
      await view.click('Categorias'); assert.equal(trigger()?.props['aria-expanded'], false);
      assert.equal(view.calls.length, calls); assert.match(view.html(), /Como faço minha matrícula/);
    } finally { await view.restore(); }
  });
  it('recolher categorias mantém seleção, busca, paginação e acordeão de perguntas', async () => {
    const view = await mountPublicFaq(publicFaqBackend(async url => publicDuvidaList([publicDuvidaFixture], {
      current_page: Number(url.searchParams.get('page')), total_pages: 3, total_count: 25, per_page: 10,
    })));
    try {
      await view.change('busca', 'matrícula'); await view.submit('Buscar perguntas');
      await view.click('Categorias'); await view.click('Matrícula'); await view.click('Próxima');
      const question = view.nodes().find(node => typeof node.props.id === 'string' && node.props.id.endsWith('-pergunta-501'));
      assert.ok(question); await view.act(() => Reflect.apply(question.props.onClick as () => unknown, undefined, []));
      const calls = view.calls.length;
      await view.click('Categorias');
      assert.match(view.html(), /Selecionada: Matrícula/); assert.match(view.html(), /Página 2 de 3/);
      assert.equal(view.calls.length, calls);
      const url = view.calls.at(-1)!.url;
      assert.equal(url.searchParams.get('categoria'), 'matricula'); assert.equal(url.searchParams.get('busca'), 'matrícula');
      assert.equal(view.nodes().find(node => node.props.id === question.props['aria-controls'])?.props.hidden, false);
      await view.click('Categorias'); assert.ok(view.nodes().some(node => node.props['aria-pressed'] === true && node.props.children === 'Matrícula'));
    } finally { await view.restore(); }
  });
  it('categorias recolhidas mantêm erro e tentativa de recuperação visíveis', async () => {
    let failed = true;
    const view = await mountPublicFaq(async url => url.pathname.endsWith('/d_categorias_duvida')
      ? failed ? categoriaReply({ success: false }, 503) : publicCategoryReply() : publicDuvidaList());
    try {
      assert.equal(view.nodes().find(node => node.props['aria-label'] === 'Categorias')?.props['aria-expanded'], false);
      assert.match(view.html(), /Categorias indisponíveis/); assert.match(view.html(), /Como faço minha matrícula/);
      failed = false; await view.click('Recarregar categorias');
      assert.doesNotMatch(view.html(), /Categorias indisponíveis/);
      assert.equal(view.calls.filter(call => call.url.pathname.endsWith('/d_duvidas')).length, 1);
      await view.click('Categorias'); assert.ok(view.nodes().some(node => node.type === 'button' && node.props.children === 'Matrícula'));
    } finally { await view.restore(); }
  });
});

describe('Editor dos Quatro Pilares da Home — modelo, validação e interface administrativa', () => {
  it('extrai fielmente o cabeçalho e os quatro pilares existentes em TechAdvantages.tsx sem mutar a origem', () => {
    const draft = createInitialHomePillarsDraft();
    const publicHtml = renderToStaticMarkup(createElement(TechAdvantages));
    const previewHtml = renderToStaticMarkup(
      createElement(HomePillarsPreviewRenderer, { draft, device: 'desktop' }),
    );

    assert.equal(draft.chave, 'pilares');
    assert.equal(draft.tipo, 'cards');
    assert.equal(draft.ancora, 'tecnologia');
    assert.equal(draft.variante, 'pilares');
    assert.equal(draft.itens.length, 4);

    for (const expectedText of [
      draft.sobretitulo,
      'Por que o MEDTEC é um modelo',
      'inovador no Brasil?',
      draft.descricao,
      'Transmissão Ao Vivo em Tempo Real via Satélite',
      'Transmissão Satelital',
      'Latência Controlada • Banda C / Ku',
      'Porto Velho',
      '52 Municípios',
      'Professor Mediador Presencial',
      'Apoio Humano 100%',
      'Plantão ativo durante as transmissões',
      'Equidade &amp; Inclusão Geográfica',
      'Universalização',
      'Ribeirinhos • Indígenas • Rurais',
      '100% Gratuito',
      'Matriz BNCC + Agroecologia &amp; Sustentabilidade',
      'Itinerário NBAZ • SEDUC',
      'Diploma Oficial SEDUC/Censo Escolar',
      'Portaria SEDUC nº 928/2025',
    ]) {
      assert.ok(publicHtml.includes(expectedText), `Ausente em TechAdvantages: ${expectedText}`);
      assert.ok(previewHtml.includes(expectedText), `Ausente na prévia: ${expectedText}`);
    }

    assert.deepEqual(
      draft.itens.map((item) => [item.chave, item.posicao, item.colSpan, item.icone, item.variante]),
      [
        ['transmissao-satelital', 1, 8, 'satellite', 'tecnologia'],
        ['professor-mediador-presencial', 2, 4, 'users', 'padrao'],
        ['equidade-inclusao-geografica', 3, 4, 'heart-handshake', 'inclusao'],
        ['matriz-bncc-agroecologia', 4, 8, 'leaf', 'sustentabilidade'],
      ],
    );

    assert.equal(hasHomePillarsChanges(draft), false);
    for (const item of draft.itens) {
      assert.equal(hasHomePillarItemChanges(item), false);
    }

    // Mutar a cópia não altera uma nova instância nem o item individual buscado por chave
    draft.itens[0].titulo = 'Alterado localmente';
    assert.equal(hasHomePillarsChanges(draft), true);
    assert.equal(hasHomePillarItemChanges(draft.itens[0]), true);
    assert.equal(
      createInitialHomePillarsDraft().itens[0].titulo,
      'Transmissão Ao Vivo em Tempo Real via Satélite',
    );
    assert.equal(
      getInitialHomePillarByKey('transmissao-satelital')?.titulo,
      'Transmissão Ao Vivo em Tempo Real via Satélite',
    );
    assert.equal(getInitialHomePillarByKey('inexistente'), null);
  });

  it('valida campos obrigatórios, limites de tamanho, ícones, variantes e reordenação com cálculo do Bento Grid', () => {
    const valid = createInitialHomePillarsDraft();
    assert.equal(validateHomePillarsDraft(valid).hasErrors, false);
    assert.equal(PILLAR_ICON_OPTIONS.length, 6);
    assert.equal(PILLAR_VARIANT_OPTIONS.length, 4);
    assert.equal(getBentoColSpanForPosition(1), 8);
    assert.equal(getBentoColSpanForPosition(2), 4);
    assert.equal(getBentoColSpanForPosition(3), 4);
    assert.equal(getBentoColSpanForPosition(4), 8);

    // Reordenação dentro e fora dos limites
    const unchanged = moveHomePillarItem(valid.itens, 0, 'up');
    assert.deepEqual(
      unchanged.map((i) => i.chave),
      valid.itens.map((i) => i.chave),
    );
    const movedDown = moveHomePillarItem(valid.itens, 0, 'down');
    assert.deepEqual(
      movedDown.map((i) => [i.chave, i.posicao, i.colSpan]),
      [
        ['professor-mediador-presencial', 1, 8],
        ['transmissao-satelital', 2, 4],
        ['equidade-inclusao-geografica', 3, 4],
        ['matriz-bncc-agroecologia', 4, 8],
      ],
    );

    // Campos vazios
    const emptyDraft = createInitialHomePillarsDraft();
    emptyDraft.sobretitulo = '   ';
    emptyDraft.titulo = '';
    emptyDraft.descricao = ' ';
    emptyDraft.itens[0].titulo = '';
    emptyDraft.itens[0].descricao = ' ';
    emptyDraft.itens[0].selo = '';
    emptyDraft.itens[0].nota = '';
    const emptyValidation = validateHomePillarsDraft(emptyDraft);
    assert.equal(emptyValidation.hasErrors, true);
    assert.ok(emptyValidation.section.sobretitulo);
    assert.ok(emptyValidation.section.titulo);
    assert.ok(emptyValidation.section.descricao);
    assert.ok(emptyValidation.items['transmissao-satelital']?.titulo);
    assert.ok(emptyValidation.items['transmissao-satelital']?.descricao);
    assert.ok(emptyValidation.items['transmissao-satelital']?.selo);
    assert.ok(emptyValidation.items['transmissao-satelital']?.nota);

    // Excesso de limite e enums inválidos
    const overflowDraft = createInitialHomePillarsDraft();
    overflowDraft.sobretitulo = 'x'.repeat(HOME_PILLARS_LIMITS.sobretitulo + 1);
    overflowDraft.titulo = 'x'.repeat(HOME_PILLARS_LIMITS.secaoTitulo + 1);
    overflowDraft.descricao = 'x'.repeat(HOME_PILLARS_LIMITS.secaoDescricao + 1);
    overflowDraft.itens[1].titulo = 'x'.repeat(HOME_PILLARS_LIMITS.itemTitulo + 1);
    overflowDraft.itens[1].descricao = 'x'.repeat(HOME_PILLARS_LIMITS.itemDescricao + 1);
    overflowDraft.itens[1].selo = 'x'.repeat(HOME_PILLARS_LIMITS.selo + 1);
    overflowDraft.itens[1].nota = 'x'.repeat(HOME_PILLARS_LIMITS.nota + 1);
    overflowDraft.itens[1].complemento = 'x'.repeat(HOME_PILLARS_LIMITS.complemento + 1);
    (overflowDraft.itens[1] as unknown as { icone: string }).icone = 'invalido';
    (overflowDraft.itens[1] as unknown as { variante: string }).variante = 'invalida';

    const overflowValidation = validateHomePillarsDraft(overflowDraft);
    assert.equal(overflowValidation.hasErrors, true);
    assert.ok(overflowValidation.section.sobretitulo?.includes(String(HOME_PILLARS_LIMITS.sobretitulo)));
    assert.ok(overflowValidation.items['professor-mediador-presencial']?.complemento);
    assert.ok(overflowValidation.items['professor-mediador-presencial']?.icone);
    assert.ok(overflowValidation.items['professor-mediador-presencial']?.variante);
  });

  it('integra o editor em /admin/institucional dentro da guarda do AdminShell sem duplicar módulos', () => {
    const page = AdminInstitucionalSubroutePage();
    assert.equal(page.type, AdminShell);
    assert.equal(page.props.activeSection, 'siteInfo');
    assert.equal(typeof page.props.children, 'function');

    const workspace = page.props.children();
    const html = renderToStaticMarkup(workspace);
    assert.match(html, />Quatro Pilares da Home</);
    assert.match(html, />Textos do Hero e Indicadores</);
    assert.match(html, /Editor dos Quatro Pilares Estratégicos da Home/);
    assert.match(html, /Modo de Simulação em Memória — Alterações Temporárias \(Não Publicadas\)/);
  });

  it('permite editar em memória cabeçalho e pilares, validar, reordenar, alternar prévia e restaurar valores originais sem chamadas de escrita', async () => {
    const view = await mountCategories(
      async () => {
        throw new Error('O editor de pilares em memória não deve disparar requisições HTTP');
      },
      false,
      {
        component: () => HomePillarsModule({}),
        allowedPaths: /never/,
      },
    );

    try {
      // Estado inicial: sem alterações, botões de escrita desabilitados e restaurar desabilitado
      assert.match(view.html(), /Valores originais do código/);
      const saveBtn = view
        .nodes()
        .find((node) => node.type === 'button' && node.props['aria-label'] === 'Salvar rascunho (Aguardando API)');
      const publishBtn = view
        .nodes()
        .find((node) => node.type === 'button' && node.props['aria-label'] === 'Publicar na Home (Indisponível)');
      const restoreAllBtn = () =>
        view
          .nodes()
          .find((node) => node.type === 'button' && node.props['aria-label'] === 'Restaurar valores originais');

      assert.equal(saveBtn?.props.disabled, true);
      assert.equal(publishBtn?.props.disabled, true);
      assert.equal(restoreAllBtn()?.props.disabled, true);

      // Editar cabeçalho e primeiro pilar em memória e conferir atualização imediata da prévia
      await view.change('secao_titulo', 'Modelo MEDTEC atualizado em memória');
      await view.change('pilar_titulo', 'Satélite de Alta Capacidade em Rondônia');
      await view.change('pilar_selo', 'Selo Satelital Editado');
      await view.change('pilar_nota', 'Nota técnica atualizada');
      await view.change('pilar_complemento', 'Capital ↔ Interior');

      assert.match(view.html(), /Rascunho modificado em memória/);
      assert.match(view.html(), /Prévia em memória \(Não publicado\)/);
      assert.match(view.html(), /Modelo MEDTEC atualizado em memória/);
      assert.match(view.html(), /Satélite de Alta Capacidade em Rondônia/);
      assert.match(view.html(), /Selo Satelital Editado/);
      assert.match(view.html(), /Nota técnica atualizada/);
      assert.equal(restoreAllBtn()?.props.disabled, false);

      // Validação ao limpar campo obrigatório
      await view.change('pilar_titulo', '   ');
      assert.match(view.html(), /O título do pilar é obrigatório\./);
      assert.match(view.html(), /role="alert"/);

      // Restaurar apenas o card selecionado mantém a alteração do cabeçalho da seção
      await view.click('Restaurar este card');
      assert.doesNotMatch(view.html(), /O título do pilar é obrigatório\./);
      assert.match(view.html(), /Transmissão Ao Vivo em Tempo Real via Satélite/);
      assert.match(view.html(), /Modelo MEDTEC atualizado em memória/);

      // Reordenar card 1 para baixo
      await view.click('Mover pilar 1 para baixo');

      // Alternar dispositivo na prévia (Celular / Computador) e abrir modal de tela cheia
      await view.click('Celular');
      assert.match(view.html(), /Visualização Mobile \(360px\)/);

      await view.click('Expandir prévia dos pilares em tela cheia');
      const dialog = view.nodes().find((node) => node.props.role === 'dialog');
      assert.ok(dialog);
      assert.equal(dialog.props['aria-modal'], 'true');
      await view.click('Fechar Prévia');
      assert.equal(
        view.nodes().some((node) => node.props.role === 'dialog'),
        false,
      );

      // Restaurar todos os valores originais volta ao estado inicial completo
      await view.click('Restaurar valores originais');
      assert.match(view.html(), /Valores originais do código/);
      assert.match(view.html(), /Idêntico ao código atual/);
      assert.equal(restoreAllBtn()?.props.disabled, true);
      assert.equal(view.calls.length, 0);
    } finally {
      await view.restore();
    }
  });

  it('mantém HomePillarsModule montado e alterna com Textos do Hero e Indicadores em /admin/institucional', async () => {
    const page = AdminInstitucionalSubroutePage();
    const workspace = (page.props.children as () => React.ReactElement)();
    for (const section of ['pilares', 'indicadores'] as const) {
      const state = mock.method(React, 'useState', (<S,>(initial?: S | (() => S)) => {
        const value = typeof initial === 'function' ? (initial as () => S)() : initial;
        return [value === 'pilares' ? section : value, () => {}];
      }) as typeof React.useState);
      try {
        const tree = Reflect.apply(workspace.type as () => ReactNode, undefined, [workspace.props]);
        const nodes = noticeNodes(tree);
        const pillars = nodes.find((node) => node.type === HomePillarsModule);
        assert.ok(pillars, 'HomePillarsModule permanece montado para preservar o rascunho em memória');
        assert.equal(pillars.props.active, section === 'pilares');
      } finally {
        state.mock.restore();
      }
    }
  });
});

describe('Projetos — temas no painel', () => {
  const headers = { 'content-type': 'application/json' };
  const tema = { id: 2, nome: 'Ciência na Amazônia', slug: 'ciencia-na-amazonia', ativo: true };
  const reply = (body: unknown, status = 200) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
  const list = () => reply({ success: true, data: { items: [tema], pagination: { current_page: 1, total_pages: 1, total_count: 1, per_page: 10 } } });
  const panel = TemasProjetoPanel();
  const mount = (write: (options: RequestInit) => Response) => mountCategories(async (_url, options) => options.method && options.method !== 'GET' ? write(options) : list(), false, {
    component: () => Reflect.apply(panel.type as () => ReactNode, undefined, [panel.props]), allowedPaths: /\/pj_temas(\/\d+)?$/,
  });
  const settle = () => new Promise(resolve => setImmediate(resolve));

  it('usa o gerenciador comum, no masculino, e cria com o corpo do contrato', async () => {
    const view = await mount(() => reply(tema, 201));
    try {
      await view.act(settle);
      assert.match(view.html(), /Ciência na Amazônia/); assert.match(view.html(), /Ativo/); assert.doesNotMatch(view.html(), /Ativa/);
      await view.click('Novo tema');
      await view.change('taxonomy-nome', 'Tecnologia Solar');
      await view.submit('Criar tema');
      await view.act(settle);
      const post = view.calls.find(call => call.options.method === 'POST')!;
      assert.deepEqual(JSON.parse(String(post.options.body)), { pj_tema: { nome: 'Tecnologia Solar', ativo: true } });
    } finally { await view.restore(); }
  });
  it('tema com projetos mostra a recusa da API e pode ser desativado', async () => {
    const view = await mount(options => options.method === 'DELETE'
      ? reply({ success: false, message: 'Não foi possível excluir', errors: ['Não foi possível excluir'] }, 422) : reply({ ...tema, ativo: false }));
    try {
      await view.act(settle);
      await view.click('Excluir ' + tema.nome);
      await view.click('Confirmar exclusão');
      await view.act(settle);
      assert.match(view.html(), /Não foi possível excluir/);
      await view.click('Desativar ' + tema.nome);
      await view.act(settle);
      assert.deepEqual(JSON.parse(String(view.calls.find(call => call.options.method === 'PATCH')!.options.body)), { pj_tema: { ativo: false } });
      assert.match(view.html(), /desativado\./);
    } finally { await view.restore(); }
  });
});

describe('Projetos — membros no painel', () => {
  const headers = { 'content-type': 'application/json' };
  const membro = { id: 1, nome: 'Maria Ribeiro', cpf: '01251667708' };
  const reply = (body: unknown, status = 200) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
  const list = (items = [membro]) => reply({ success: true, data: { items, pagination: { current_page: 1, total_pages: 1, total_count: items.length, per_page: 10 } } });
  const settle = () => new Promise(resolve => setImmediate(resolve));
  const mount = (write: (options: RequestInit) => Response = () => reply(membro, 201)) => mountCategories(async (_url, options) => options.method && options.method !== 'GET' ? write(options) : list(), false, {
    component: () => MembrosProjetoPanel(), allowedPaths: /\/pj_membros(\/\d+)?$/,
  });

  it('a listagem mascara o CPF e liga o membro ao filtro de projetos', async () => {
    const view = await mount();
    try {
      await view.act(settle);
      assert.match(view.html(), /Maria Ribeiro/); assert.match(view.html(), /\*\*\*\.516\.677-\*\*/);
      assert.doesNotMatch(view.html(), /01251667708|012\.516\.677-08/);
      assert.equal(view.nodes().find(node => node.props['aria-label'] === 'Ver projetos de Maria Ribeiro')?.props.href, '/admin/projetos?membro=1');
    } finally { await view.restore(); }
  });
  it('filtros usam q[nome_cont] e q[cpf_eq] só com números e recusam CPF inválido', async () => {
    const view = await mount();
    try {
      await view.act(settle);
      await view.change('membro-busca-cpf', '123');
      await view.submit('Filtrar membros');
      assert.match(view.html(), /Informe um CPF válido para buscar/);
      await view.change('membro-busca-nome', ' Maria ');
      await view.change('membro-busca-cpf', '012.516.677-08');
      await view.submit('Filtrar membros');
      await view.act(settle);
      const { searchParams } = view.calls.at(-1)!.url;
      assert.equal(searchParams.get('q[nome_cont]'), 'Maria'); assert.equal(searchParams.get('q[cpf_eq]'), '01251667708');
    } finally { await view.restore(); }
  });
  it('cadastro valida o CPF antes de enviar e envia só números', async () => {
    const view = await mount();
    const writes = () => view.calls.filter(call => call.options.method === 'POST');
    try {
      await view.act(settle);
      await view.click('Novo membro');
      await view.change('membro-nome', 'Maria Ribeiro');
      await view.change('membro-cpf', '11111111111');
      await view.submit('Criar membro');
      assert.match(view.html(), /Informe um CPF válido\./); assert.equal(writes().length, 0);
      await view.change('membro-cpf', '01251667708');
      await view.submit('Criar membro');
      await view.act(settle);
      assert.deepEqual(JSON.parse(String(writes()[0].options.body)), { pj_membro: { nome: 'Maria Ribeiro', cpf: '01251667708' } });
      assert.match(view.html(), /Membro salvo com sucesso/);
    } finally { await view.restore(); }
  });
  it('membro em projeto mostra a recusa da API ao excluir', async () => {
    const view = await mount(() => reply({ success: false, message: 'Não foi possível excluir', errors: ['Não foi possível excluir'] }, 422));
    try {
      await view.act(settle);
      await view.click('Excluir Maria Ribeiro');
      await view.click('Confirmar exclusão');
      await view.act(settle);
      assert.match(view.html(), /Não foi possível excluir/);
    } finally { await view.restore(); }
  });
});

describe('Projetos — painel', () => {
  const headers = { 'content-type': 'application/json' };
  const reply = (body: unknown, status = 200) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
  const list = (items: unknown[]) => reply({ success: true, data: { items, pagination: { current_page: 1, total_pages: 1, total_count: items.length, per_page: 10 } } });
  const settle = () => new Promise(resolve => setImmediate(resolve));
  const tema = { id: 2, nome: 'Ciência', slug: 'ciencia', ativo: true };
  const escola = { id: 3, nome: 'EEEFM Bolívar', inep: null, g_cidade_id: 4, cidade_nome: 'Porto Velho' };
  const membro = { id: 1, nome: 'Maria Ribeiro', cpf: '01251667708' };
  const anexo = { id: 10, nome: 'relatorio.pdf', tipo: 'application/pdf', tamanho: 52344, url: '/rails/relatorio.pdf' };
  const projeto = {
    id: 7, titulo: 'Hortas em Jirau', relato: 'Relato', pj_tema_id: 2, tema_nome: 'Ciência', escola_id: 3, escola_nome: escola.nome, cidade_nome: 'Porto Velho',
    imagem: null, imagem_url: 'https://x.com/capa.jpg', anexos: [anexo], membros: [{ id: 5, pj_membro_id: 1, nome: 'Maria Ribeiro', cpf: '01251667708', funcao: 'Mediadora' }],
    status: 'aguardando', status_nome: 'Aguardando', autor_nome: 'Gestora', avaliado_por_nome: null,
  };
  const publicado = { ...projeto, status: 'publicada', status_nome: 'Publicada' };
  const files = (...values: File[]) => ({ target: { files: values, value: 'x' } });
  function mount(props: Parameters<typeof ProjetosPanel>[0] = {}, write: (url: URL, options: RequestInit) => Response = () => reply(publicado, 201)) {
    return mountCategories(async (url, options) => {
      if (options.method && options.method !== 'GET') return write(url, options);
      if (url.pathname.endsWith('/pj_temas')) return list([tema]);
      if (url.pathname.endsWith('/pj_membros')) return list([membro]);
      if (url.pathname.endsWith('/escolas')) return list([escola]);
      if (/\/pj_projetos\/\d+$/.test(url.pathname)) return reply(projeto);
      return list([projeto]);
    }, false, { component: () => ProjetosPanel(props), allowedPaths: /\/(pj_temas|pj_membros|escolas|pj_projetos(\/\d+(\/(publicar|reprovar|despublicar)|\/anexos\/\d+)?)?)$/ });
  }
  type View = Awaited<ReturnType<typeof mount>>;
  const pick = (view: View, name: string, event: unknown) => view.act(() => {
    const node = view.nodes().find(item => item.type === 'input' && item.props.name === name);
    assert.ok(node, name);
    return Reflect.apply(node.props.onChange as (value: unknown) => unknown, undefined, [event]);
  });
  async function fillBase(view: View) {
    await view.change('projeto-titulo', ' Hortas ');
    await view.change('projeto-relato', ' Relato ');
    await view.change('projeto-tema', '2');
    await view.change('projeto-escola', '3');
  }
  const sentBy = (view: View, method: string) => view.calls.filter(call => call.options.method === method);

  it('filtros do contrato chegam à API e voltam à primeira página', async () => {
    const view = await mount({ membroId: '1' });
    try {
      await view.act(settle);
      const projetos = () => view.calls.filter(call => call.url.pathname.endsWith('/pj_projetos')).at(-1)!.url.searchParams;
      assert.equal(projetos().get('q[pj_membros_id_eq]'), '1', 'Atalho da tela de membros');
      await view.change('projeto-busca-titulo', ' Hortas ');
      await view.submit('Filtrar projetos');
      await view.change('projeto-filtro-tema', '2');
      await view.change('projeto-filtro-cidade', '4');
      await view.act(settle);
      await view.change('projeto-filtro-escola', '3');
      await view.change('projeto-filtro-status', 'aguardando');
      await view.act(settle);
      assert.equal(projetos().get('q[titulo_cont]'), 'Hortas'); assert.equal(projetos().get('q[pj_tema_id_eq]'), '2');
      assert.equal(projetos().get('q[escola_g_cidade_id_eq]'), '4'); assert.equal(projetos().get('q[escola_id_eq]'), '3');
      assert.equal(projetos().get('q[n_status_noticia_slug_eq]'), 'aguardando'); assert.equal(projetos().get('page'), '1');
    } finally { await view.restore(); }
  });
  it('a listagem não expõe o CPF dos membros', async () => {
    const view = await mount();
    try {
      await view.act(settle);
      assert.match(view.html(), /Hortas em Jirau/); assert.match(view.html(), /1 membro/);
      assert.doesNotMatch(view.html(), /01251667708|012\.516\.677-08/);
    } finally { await view.restore(); }
  });
  it('sem arquivo cria em JSON e informa a situação devolvida pela API', async () => {
    const view = await mount({ startNew: true });
    try {
      await view.act(settle);
      assert.match(view.html(), /publicam no site ao salvar/);
      await view.submit('Criar projeto');
      assert.match(view.html(), /Informe título, relato, tema e escola/); assert.equal(sentBy(view, 'POST').length, 0);
      await fillBase(view);
      await view.submit('Criar projeto');
      await view.act(settle);
      assert.deepEqual(JSON.parse(String(sentBy(view, 'POST')[0].options.body)), { pj_projeto: { titulo: 'Hortas', pj_tema_id: 2, relato: 'Relato', escola_id: 3 } });
      assert.match(view.html(), /Projeto salvo\. Situação: Publicada\./);
    } finally { await view.restore(); }
  });
  it('capa aceita link só com HTTPS', async () => {
    const view = await mount({ startNew: true });
    try {
      await view.act(settle);
      await fillBase(view);
      const modoLink = view.nodes().find(item => item.props.name === 'projeto-imagem-modo' && item.props.value === 'link');
      await view.act(() => Reflect.apply(modoLink!.props.onChange as () => unknown, undefined, []));
      await view.change('projeto-imagem-url', 'http://x.com/capa.jpg');
      await view.submit('Criar projeto');
      assert.match(view.html(), /link HTTPS válido/); assert.equal(sentBy(view, 'POST').length, 0);
      await view.change('projeto-imagem-url', 'https://x.com/capa.jpg');
      await view.submit('Criar projeto');
      await view.act(settle);
      assert.equal(JSON.parse(String(sentBy(view, 'POST')[0].options.body)).pj_projeto.imagem_url, 'https://x.com/capa.jpg');
    } finally { await view.restore(); }
  });
  it('recusa capa e anexos fora das regras e envia os válidos em multipart', async () => {
    const view = await mount({ startNew: true });
    try {
      await view.act(settle);
      await fillBase(view);
      const pesada = new File(['x'], 'capa.png', { type: 'image/png' }); Object.defineProperty(pesada, 'size', { value: 5 * 1024 * 1024 + 1 });
      await pick(view, 'projeto-imagem', files(pesada));
      assert.match(view.html(), /até 5 MB/);
      await pick(view, 'projeto-imagem', files(new File(['x'], 'capa.gif', { type: 'image/gif' })));
      assert.match(view.html(), /PNG, JPG ou WEBP/);
      const capa = new File(['x'], 'capa.webp', { type: 'image/webp' });
      await pick(view, 'projeto-imagem', files(capa));
      const pdf = new File(['x'], 'a.pdf', { type: 'application/pdf' }); const foto = new File(['y'], 'b.jpg', { type: 'image/jpeg' });
      await pick(view, 'projeto-anexos', files(pdf, new File(['x'], 'c.txt', { type: 'text/plain' }), foto));
      assert.match(view.html(), /c\.txt: deve ser PDF/);
      await pick(view, 'projeto-anexos', files(pdf));
      assert.equal((view.html().match(/Retirar a\.pdf/g) ?? []).length, 1, 'O mesmo arquivo não entra duas vezes');
      await view.submit('Criar projeto');
      await view.act(settle);
      const form = sentBy(view, 'POST')[0].options.body as FormData;
      assert.ok(form instanceof FormData); assert.equal((form.get('pj_projeto[imagem]') as File).name, 'capa.webp');
      assert.deepEqual(form.getAll('pj_projeto[anexos][]').map(item => (item as File).name), ['a.pdf', 'b.jpg']);
    } finally { await view.restore(); }
  });
  it('edição envia só a diferença dos membros e soma os anexos novos', async () => {
    const view = await mount({}, () => reply(projeto));
    try {
      await view.act(settle);
      await view.click('Editar Hortas em Jirau');
      await view.act(settle);
      assert.doesNotMatch(view.html(), /publicam no site ao salvar/);
      const editor = () => view.nodes().find(item => item.type === ProjetoMembrosEditor)!;
      const atuais = editor().props.value as { pj_membro_id: number; nome: string; cpf: string; funcao: string }[];
      await view.act(() => (editor().props.onChange as (next: unknown) => void)([{ ...atuais[0], funcao: 'Coordenadora' }, { pj_membro_id: 9, nome: 'João', cpf: '52998224725', funcao: 'Aluno' }]));
      await pick(view, 'projeto-anexos', files(new File(['x'], 'novo.pdf', { type: 'application/pdf' })));
      await view.submit('Editar projeto');
      await view.act(settle);
      const form = sentBy(view, 'PATCH')[0].options.body as FormData;
      assert.ok(sentBy(view, 'PATCH')[0].url.pathname.endsWith('/pj_projetos/7'));
      assert.equal(form.get('pj_projeto[pj_projeto_membros_attributes][0][id]'), '5');
      assert.equal(form.get('pj_projeto[pj_projeto_membros_attributes][0][funcao]'), 'Coordenadora');
      assert.equal(form.get('pj_projeto[pj_projeto_membros_attributes][1][pj_membro_id]'), '9');
      assert.equal(form.get('pj_projeto[pj_projeto_membros_attributes][1][funcao]'), 'Aluno');
      assert.deepEqual(form.getAll('pj_projeto[anexos][]').map(item => (item as File).name), ['novo.pdf']);
      assert.equal(form.get('pj_projeto[imagem_url]'), null, 'Sem troca de capa, o link não é reenviado');
    } finally { await view.restore(); }
  });
  it('tirar membro do projeto envia _destroy e não o exclui do cadastro', async () => {
    const view = await mount({}, () => reply(projeto));
    try {
      await view.act(settle);
      await view.click('Editar Hortas em Jirau');
      await view.act(settle);
      await view.act(() => (view.nodes().find(item => item.type === ProjetoMembrosEditor)!.props.onChange as (next: unknown) => void)([]));
      await view.submit('Editar projeto');
      await view.act(settle);
      assert.deepEqual(JSON.parse(String(sentBy(view, 'PATCH')[0].options.body)).pj_projeto.pj_projeto_membros_attributes, [{ id: 5, _destroy: true }]);
      assert.ok(!view.calls.some(call => call.url.pathname.includes('/pj_membros/') && call.options.method === 'DELETE'));
    } finally { await view.restore(); }
  });
  it('função em branco e membro repetido bloqueiam o envio', async () => {
    const view = await mount({}, () => reply(projeto));
    try {
      await view.act(settle);
      await view.click('Editar Hortas em Jirau');
      await view.act(settle);
      const editor = () => view.nodes().find(item => item.type === ProjetoMembrosEditor)!;
      const atuais = editor().props.value as { funcao: string }[];
      await view.act(() => (editor().props.onChange as (next: unknown) => void)([{ ...atuais[0], funcao: ' ' }]));
      await view.submit('Editar projeto');
      assert.match(view.html(), /Informe a função de cada membro/);
      await view.act(() => (editor().props.onChange as (next: unknown) => void)([{ ...atuais[0], funcao: 'A' }, { ...atuais[0], funcao: 'B' }]));
      await view.submit('Editar projeto');
      assert.match(view.html(), /mesmo membro foi informado mais de uma vez/);
      assert.equal(sentBy(view, 'PATCH').length, 0);
    } finally { await view.restore(); }
  });
  it('anexo atual sai pela rota própria, depois de confirmar', async () => {
    const view = await mount({}, () => reply(null, 204));
    try {
      await view.act(settle);
      await view.click('Editar Hortas em Jirau');
      await view.act(settle);
      assert.match(view.html(), /relatorio\.pdf/);
      await view.click('Remover anexo relatorio.pdf');
      assert.equal(sentBy(view, 'DELETE').length, 0, 'Nada é removido antes da confirmação');
      await view.click('Confirmar remoção');
      await view.act(settle);
      assert.ok(sentBy(view, 'DELETE')[0].url.pathname.endsWith('/pj_projetos/7/anexos/10'));
      assert.match(view.html(), /Anexo relatorio\.pdf removido/);
      assert.equal(view.nodes().some(item => item.props['aria-label'] === 'Anexos atuais'), false);
    } finally { await view.restore(); }
  });
  it('trocar o link por arquivo limpa o link antigo', async () => {
    const view = await mount({}, () => reply(projeto));
    try {
      await view.act(settle);
      await view.click('Editar Hortas em Jirau');
      await view.act(settle);
      const modo = view.nodes().find(item => item.props.name === 'projeto-imagem-modo' && item.props.value === 'upload');
      await view.act(() => Reflect.apply(modo!.props.onChange as () => unknown, undefined, []));
      await pick(view, 'projeto-imagem', files(new File(['x'], 'capa.png', { type: 'image/png' })));
      await view.submit('Editar projeto');
      await view.act(settle);
      const form = sentBy(view, 'PATCH')[0].options.body as FormData;
      assert.equal(form.get('pj_projeto[imagem_url]'), ''); assert.equal((form.get('pj_projeto[imagem]') as File).name, 'capa.png');
    } finally { await view.restore(); }
  });
  it('moderação segue o status: aguardando publica ou reprova, publicada despublica', async () => {
    const view = await mount({}, () => reply(publicado));
    try {
      await view.act(settle);
      assert.ok(view.nodes().some(item => item.props['aria-label'] === 'Reprovar Hortas em Jirau'));
      assert.ok(!view.nodes().some(item => item.props['aria-label'] === 'Despublicar Hortas em Jirau'));
      await view.click('Publicar Hortas em Jirau');
      await view.act(settle);
      assert.ok(sentBy(view, 'PATCH')[0].url.pathname.endsWith('/pj_projetos/7/publicar'));
      assert.match(view.html(), /Projeto publicado/);
    } finally { await view.restore(); }
    const live = await mountCategories(async (url, options) => options.method === 'PATCH' ? reply(projeto) : url.pathname.endsWith('/pj_projetos') ? list([publicado]) : list([]), false, {
      component: () => ProjetosPanel(), allowedPaths: /\/(pj_temas|pj_membros|escolas|pj_projetos(\/\d+\/despublicar)?)$/,
    });
    try {
      await live.act(settle);
      assert.ok(!live.nodes().some(item => item.props['aria-label'] === 'Publicar Hortas em Jirau'));
      assert.equal(live.nodes().find(item => item.props['aria-label'] === 'Ver Hortas em Jirau no site')?.props.href, '/projetos/7');
      await live.click('Despublicar Hortas em Jirau');
      await live.act(settle);
      assert.ok(live.calls.some(call => call.url.pathname.endsWith('/pj_projetos/7/despublicar')));
    } finally { await live.restore(); }
  });
  it('erro de validação da API aparece sem fechar o formulário', async () => {
    const view = await mount({ startNew: true }, () => reply({ success: false, message: 'Erro de validação', errors: ['Anexos a.pdf: deve ter no máximo 10 MB'] }, 422));
    try {
      await view.act(settle);
      await fillBase(view);
      await view.submit('Criar projeto');
      await view.act(settle);
      assert.match(view.html(), /deve ter no máximo 10 MB/);
      assert.ok(view.nodes().some(item => item.props['aria-label'] === 'Criar projeto'));
    } finally { await view.restore(); }
  });
});

describe('Projetos — Fila de Aprovação', () => {
  const headers = { 'content-type': 'application/json' };
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  const list = (items: unknown[]) => reply({ success: true, data: { items, pagination: { current_page: 1, total_pages: 1, total_count: items.length, per_page: items.length } } });
  const settle = () => new Promise(resolve => setImmediate(resolve));
  const projeto = { id: 7, titulo: 'Hortas em Jirau', relato: 'Relato', tema_nome: 'Ciência', escola_nome: 'Escola', cidade_nome: 'Cidade', status: 'aguardando', status_nome: 'Aguardando', membros: [{ id: 5, pj_membro_id: 1, nome: 'Maria', cpf: '01251667708', funcao: 'Mediadora' }] };

  it('lista só os aguardando, modera e esvazia sem falso erro', async () => {
    let items: unknown[] = [projeto];
    const view = await mountCategories(async (_url, options) => {
      if (options.method === 'PATCH') { items = []; return reply({ ...projeto, status: 'publicada' }); }
      return list(items);
    }, false, { component: () => ProjetosApprovalQueue(), allowedPaths: /\/pj_projetos(\/\d+\/(publicar|reprovar))?$/ });
    try {
      await view.act(settle);
      assert.equal(view.calls[0].url.searchParams.get('q[n_status_noticia_slug_eq]'), 'aguardando');
      assert.equal(view.calls[0].url.searchParams.get('page'), 'all');
      assert.match(view.html(), /Hortas em Jirau/); assert.doesNotMatch(view.html(), /01251667708/);
      await view.click('Publicar Hortas em Jirau');
      await view.act(settle);
      assert.ok(view.calls.some(call => call.url.pathname.endsWith('/pj_projetos/7/publicar')));
      assert.match(view.html(), /Projeto publicado/);
      assert.match(view.html(), /Nenhum projeto aguardando/, 'page=all sem registros devolve per_page 0');
      assert.doesNotMatch(view.html(), /role="alert"/);
    } finally { await view.restore(); }
  });
  it('reprovar usa a rota própria, e a falha de leitura permite tentar de novo', async () => {
    let fail = true;
    const view = await mountCategories(async (_url, options) => {
      if (options.method === 'PATCH') return reply({ ...projeto, status: 'reprovada' });
      return fail ? reply({ success: false, message: 'Sem permissão', errors: ['sem_permissao'] }, 403) : list([projeto]);
    }, false, { component: () => ProjetosApprovalQueue(), allowedPaths: /\/pj_projetos(\/\d+\/reprovar)?$/ });
    try {
      await view.act(settle);
      assert.match(view.html(), /role="alert"/); assert.doesNotMatch(view.html(), /Nenhum projeto aguardando/);
      fail = false;
      await view.click('Recarregar projetos');
      await view.act(settle);
      await view.click('Reprovar Hortas em Jirau');
      await view.act(settle);
      assert.ok(view.calls.some(call => call.url.pathname.endsWith('/pj_projetos/7/reprovar')));
    } finally { await view.restore(); }
  });
});

describe('Projetos — membros no formulário', () => {
  const headers = { 'content-type': 'application/json' };
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  const list = (items: unknown[]) => reply({ success: true, data: { items, pagination: { current_page: 1, total_pages: 1, total_count: items.length, per_page: 1 } } });
  const settle = () => new Promise(resolve => setImmediate(resolve));
  const maria = { id: 1, nome: 'Maria Ribeiro', cpf: '01251667708' };
  function mount(found: unknown[], initial: { pj_membro_id: number; nome: string; cpf: string; funcao: string }[] = []) {
    const state = { value: initial };
    const created = { id: 8, nome: 'João Lima', cpf: '52998224725' };
    return mountCategories(async (_url, options) => options.method === 'POST' ? reply(created, 201) : list(found), false, {
      component: () => ProjetoMembrosEditor({ value: state.value, onChange: next => { state.value = next; } }), allowedPaths: /\/pj_membros$/,
    }).then(view => ({ view, state }));
  }
  it('CPF inválido não consulta a API', async () => {
    const { view } = await mount([]);
    try {
      await view.change('membro-busca-cpf', '123');
      await view.click('Buscar CPF');
      assert.match(view.html(), /Informe um CPF válido/); assert.equal(view.calls.length, 0);
    } finally { await view.restore(); }
  });
  it('CPF cadastrado reutiliza o membro, sem novo POST', async () => {
    const { view, state } = await mount([maria]);
    try {
      await view.change('membro-busca-cpf', '012.516.677-08');
      await view.click('Buscar CPF');
      await view.act(settle);
      assert.equal(view.calls[0].url.searchParams.get('q[cpf_eq]'), '01251667708');
      assert.match(view.html(), /Já cadastrado/);
      await view.change('membro-nova-funcao', ' Mediadora ');
      await view.click('Adicionar ao projeto');
      await view.act(settle);
      assert.deepEqual(state.value, [{ pj_membro_id: 1, nome: 'Maria Ribeiro', cpf: '01251667708', funcao: 'Mediadora' }]);
      assert.ok(!view.calls.some(call => call.options.method === 'POST'));
    } finally { await view.restore(); }
  });
  it('CPF sem cadastro cria o membro só com números e usa o id novo', async () => {
    const { view, state } = await mount([]);
    try {
      await view.change('membro-busca-cpf', '529.982.247-25');
      await view.click('Buscar CPF');
      await view.act(settle);
      await view.change('membro-nova-funcao', 'Aluno');
      await view.click('Adicionar ao projeto');
      assert.match(view.html(), /Informe o nome do membro/);
      await view.change('membro-novo-nome', ' João Lima ');
      await view.click('Adicionar ao projeto');
      await view.act(settle);
      const post = view.calls.find(call => call.options.method === 'POST')!;
      assert.deepEqual(JSON.parse(String(post.options.body)), { pj_membro: { nome: 'João Lima', cpf: '52998224725' } });
      assert.equal(state.value[0].pj_membro_id, 8);
    } finally { await view.restore(); }
  });
  it('membro repetido é recusado e a linha mostra o CPF mascarado', async () => {
    const { view } = await mount([maria], [{ pj_membro_id: 1, nome: 'Maria Ribeiro', cpf: '01251667708', funcao: 'Mediadora' }]);
    try {
      assert.match(view.html(), /\*\*\*\.516\.677-\*\*/); assert.doesNotMatch(view.html(), /01251667708/);
      await view.change('membro-busca-cpf', '01251667708');
      await view.click('Buscar CPF');
      await view.act(settle);
      assert.match(view.html(), /já está neste projeto/);
      assert.doesNotMatch(view.html(), /Adicionar ao projeto/);
    } finally { await view.restore(); }
  });
  it('função é obrigatória', async () => {
    const { view, state } = await mount([maria]);
    try {
      await view.change('membro-busca-cpf', '01251667708');
      await view.click('Buscar CPF');
      await view.act(settle);
      await view.click('Adicionar ao projeto');
      assert.match(view.html(), /Informe a função do membro/); assert.equal(state.value.length, 0);
    } finally { await view.restore(); }
  });
});

describe('Projetos — regras do formulário', () => {
  const vinculo = (id: number, pj_membro_id: number, funcao: string): PjProjetoMembro => ({ id, pj_membro_id, nome: 'Nome ' + pj_membro_id, cpf: '01251667708', funcao });
  const draft = (pj_membro_id: number, funcao: string) => ({ pj_membro_id, nome: 'Nome ' + pj_membro_id, cpf: '01251667708', funcao });

  it('diff envia novo, troca de função por id do vínculo e _destroy, omitindo o que não mudou', () => {
    const originais = [vinculo(5, 1, 'Mediadora'), vinculo(6, 2, 'Aluno'), vinculo(7, 3, 'Coordenador')];
    assert.deepEqual(diffProjetoMembros(originais, [draft(1, 'Mediadora'), draft(2, ' Aluna '), draft(4, 'Convidada')]), [
      { id: 6, funcao: 'Aluna' }, { pj_membro_id: 4, funcao: 'Convidada' }, { id: 7, _destroy: true },
    ]);
  });
  it('diff de cadastro novo só traz vínculos novos e edição sem mudança não envia nada', () => {
    assert.deepEqual(diffProjetoMembros([], [draft(1, 'Aluna')]), [{ pj_membro_id: 1, funcao: 'Aluna' }]);
    assert.deepEqual(diffProjetoMembros([vinculo(5, 1, 'Aluna')], [draft(1, 'Aluna')]), []);
  });
  it('membro que sai e volta na mesma edição mantém o vínculo, sem _destroy nem novo cadastro', () => {
    assert.deepEqual(diffProjetoMembros([vinculo(5, 1, 'Aluna')], [draft(1, 'Monitora')]), [{ id: 5, funcao: 'Monitora' }]);
  });
  it('detecta membro duplicado', () => {
    assert.equal(hasMembroDuplicado([draft(1, 'A'), draft(2, 'B')]), false);
    assert.equal(hasMembroDuplicado([draft(1, 'A'), draft(1, 'B')]), true);
  });
  it('valida CPF pelos dígitos verificadores, com ou sem máscara', () => {
    for (const valid of ['01251667708', '012.516.677-08', '529.982.247-25']) assert.equal(isValidCpf(valid), true, valid);
    for (const invalid of ['', '123', '11111111111', '01251667709', '012.516.677-00', '0125166770800']) assert.equal(isValidCpf(invalid), false, invalid);
  });
  it('formata a digitação e mascara a listagem sem expor o CPF inteiro', () => {
    assert.equal(formatCpf('01251667708'), '012.516.677-08'); assert.equal(formatCpf('0125'), '012.5'); assert.equal(formatCpf('0125166'), '012.516.6');
    assert.equal(formatCpf('0125166770899'), '012.516.677-08');
    assert.equal(maskCpf('01251667708'), '***.516.677-**'); assert.equal(maskCpf('012.516.677-08'), '***.516.677-**'); assert.equal(maskCpf('123'), '***');
  });
  it('anexo aceita PDF, Office e imagens até 10 MB e recusa o restante', () => {
    const file = (name: string, type: string, size = 10) => { const value = new File(['x'], name, { type }); Object.defineProperty(value, 'size', { value: size }); return value; };
    for (const [name, type] of [['a.pdf', 'application/pdf'], ['a.doc', 'application/msword'], ['a.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      ['a.xls', 'application/vnd.ms-excel'], ['a.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], ['a.ppt', 'application/vnd.ms-powerpoint'],
      ['a.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'], ['a.png', 'image/png'], ['a.jpg', 'image/jpeg'], ['a.webp', 'image/webp'], ['a.docx', '']]) {
      assert.equal(validateProjetoAnexo(file(name, type)), null, name + type);
    }
    for (const [name, type] of [['a.txt', 'text/plain'], ['a.svg', 'image/svg+xml'], ['a.exe', ''], ['a.pdf', 'application/x-msdownload']]) {
      assert.match(validateProjetoAnexo(file(name, type)) ?? '', /deve ser PDF/, name + type);
    }
    assert.equal(validateProjetoAnexo(file('a.pdf', 'application/pdf', PROJETO_ANEXO_MAX_BYTES)), null);
    assert.match(validateProjetoAnexo(file('a.pdf', 'application/pdf', PROJETO_ANEXO_MAX_BYTES + 1)) ?? '', /até 10 MB/);
  });
  it('capa usa o link quando existe e o tamanho do arquivo sai legível', () => {
    assert.equal(getProjetoImageSrc({ imagem: null, imagem_url: 'https://x.com/a.jpg' }), 'https://x.com/a.jpg');
    assert.equal(getProjetoImageSrc({ imagem: '/a.png', imagem_url: 'https://x.com/a.jpg' }), 'https://x.com/a.jpg');
    assert.match(getProjetoImageSrc({ imagem: '/rails/a.png', imagem_url: '' }), /\/rails\/a\.png$/);
    assert.equal(getProjetoImageSrc({ imagem: null, imagem_url: null }), '');
    assert.equal(formatFileSize(52344), '51 KB'); assert.equal(formatFileSize(300), '1 KB'); assert.equal(formatFileSize(2_621_440), '2,5 MB');
  });
});

describe('Projetos — service', () => {
  const headers = { 'content-type': 'application/json' };
  const json = (body: unknown, status = 200) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
  const list = (items: unknown[]) => json({ success: true, message: 'ok', data: { items, pagination: { current_page: 1, total_pages: 1, total_count: items.length, per_page: 10 } } });
  const projeto = { id: 1, titulo: 'Hortas', relato: 'Relato', pj_tema_id: 2, tema_nome: 'Tema', escola_id: 3, escola_nome: 'Escola', cidade_nome: 'Cidade', imagem: null, imagem_url: null, anexos: [], membros: [], status: 'aguardando', status_nome: 'Aguardando' };
  const input = { titulo: 'Hortas', relato: 'Relato', pj_tema_id: 2, escola_id: 3 };
  async function capture<T>(reply: Response, run: () => Promise<T>) {
    const calls: { url: URL; options: RequestInit }[] = [];
    const spy = mock.method(globalThis, 'fetch', async (target: RequestInfo | URL, options: RequestInit = {}) => { calls.push({ url: new URL(String(target)), options }); return reply; });
    setStoredTokens({ access_token: 'projeto-user', refresh_token: 'projeto-refresh' });
    try { return { result: await run(), calls }; } finally { spy.mock.restore(); clearStoredTokens(); }
  }

  for (const [label, service, path, root] of [
    ['temas', medtecApi.temasProjeto, '/pj_temas', 'pj_tema'],
    ['membros', medtecApi.membrosProjeto, '/pj_membros', 'pj_membro'],
  ] as const) {
    it(label + ': CRUD com método, rota, Bearer e corpo do contrato', async () => {
      const data = { nome: 'Nome', cpf: '01251667708', slug: 's', ativo: true };
      const crud = service as unknown as { list(p: unknown): Promise<unknown>; get(id: number): Promise<unknown>; create(d: unknown): Promise<unknown>; update(id: number, d: unknown): Promise<unknown>; delete(id: number): Promise<unknown> };
      const steps: [string, string, Response, () => Promise<unknown>][] = [
        ['GET', path, list([]), () => crud.list({ page: 1 })],
        ['GET', path + '/9', json({ id: 9 }), () => crud.get(9)],
        ['POST', path, json({ id: 9 }, 201), () => crud.create(data)],
        ['PATCH', path + '/9', json({ id: 9 }), () => crud.update(9, data)],
        ['DELETE', path + '/9', json(null, 204), () => crud.delete(9)],
      ];
      for (const [method, route, reply, run] of steps) {
        const { calls } = await capture(reply, run);
        assert.equal(calls[0].options.method, method); assert.ok(calls[0].url.pathname.endsWith(route), route);
        assert.equal(new Headers(calls[0].options.headers).get('Authorization'), 'Bearer projeto-user');
        if (method === 'POST' || method === 'PATCH') assert.deepEqual(JSON.parse(String(calls[0].options.body)), { [root]: data });
      }
    });
  }
  it('busca de membro por CPF usa q[cpf_eq]', async () => {
    const { calls } = await capture(list([]), () => medtecApi.membrosProjeto.list({ 'q[cpf_eq]': '01251667708' }));
    assert.equal(calls[0].url.searchParams.get('q[cpf_eq]'), '01251667708');
  });
  it('sem arquivo envia JSON só com os campos do contrato', async () => {
    const attrs = [{ pj_membro_id: 1, funcao: 'Aluna' }, { id: 5, funcao: 'Coordenadora' }, { id: 6, _destroy: true as const }];
    const { calls } = await capture(json(projeto, 201), () => medtecApi.projetos.create({ ...input, imagem_url: 'https://x.com/c.jpg', pj_projeto_membros_attributes: attrs, status: 'publicada', autor_id: 9 } as PjProjetoInput));
    assert.deepEqual(JSON.parse(String(calls[0].options.body)), { pj_projeto: { ...input, imagem_url: 'https://x.com/c.jpg', pj_projeto_membros_attributes: attrs } });
    assert.equal(new Headers(calls[0].options.headers).get('Content-Type'), 'application/json');
    const { calls: empty } = await capture(json(projeto), () => medtecApi.projetos.update(1, input));
    assert.deepEqual(JSON.parse(String(empty[0].options.body)), { pj_projeto: input }, 'Sem mudança de membros, a chave não é enviada');
  });
  it('com arquivos envia multipart com capa, vários anexos e vínculos indexados', async () => {
    const imagem = new File(['c'], 'capa.png', { type: 'image/png' });
    const anexos = [new File(['a'], 'a.pdf', { type: 'application/pdf' }), new File(['b'], 'b.jpg', { type: 'image/jpeg' })];
    const { calls } = await capture(json(projeto), () => medtecApi.projetos.update(1, { ...input, imagem, imagem_url: '', anexos,
      pj_projeto_membros_attributes: [{ pj_membro_id: 1, funcao: 'Aluna' }, { id: 5, _destroy: true }] }));
    const form = calls[0].options.body as FormData;
    assert.ok(form instanceof FormData); assert.equal(calls[0].options.method, 'PATCH');
    assert.equal(new Headers(calls[0].options.headers).has('Content-Type'), false, 'O navegador define o boundary');
    assert.equal(form.get('pj_projeto[titulo]'), 'Hortas'); assert.equal(form.get('pj_projeto[escola_id]'), '3'); assert.equal(form.get('pj_projeto[imagem_url]'), '');
    assert.equal((form.get('pj_projeto[imagem]') as File).name, 'capa.png');
    assert.deepEqual(form.getAll('pj_projeto[anexos][]').map(file => (file as File).name), ['a.pdf', 'b.jpg']);
    assert.equal(form.get('pj_projeto[pj_projeto_membros_attributes][0][pj_membro_id]'), '1');
    assert.equal(form.get('pj_projeto[pj_projeto_membros_attributes][0][funcao]'), 'Aluna');
    assert.equal(form.get('pj_projeto[pj_projeto_membros_attributes][1][id]'), '5');
    assert.equal(form.get('pj_projeto[pj_projeto_membros_attributes][1][_destroy]'), 'true');
  });
  it('moderação e remoção de anexo usam as rotas próprias, sem corpo', async () => {
    for (const action of ['publicar', 'reprovar', 'despublicar'] as const) {
      const { calls } = await capture(json(projeto), () => medtecApi.projetos[action](1));
      assert.equal(calls[0].options.method, 'PATCH'); assert.ok(calls[0].url.pathname.endsWith('/pj_projetos/1/' + action)); assert.equal(calls[0].options.body, undefined);
    }
    const { calls } = await capture(json(null, 204), () => medtecApi.projetos.removerAnexo(1, 10));
    assert.equal(calls[0].options.method, 'DELETE'); assert.ok(calls[0].url.pathname.endsWith('/pj_projetos/1/anexos/10'));
  });
  it('filtros do painel chegam à API', async () => {
    const { calls } = await capture(list([projeto]), () => medtecApi.projetos.list({ 'q[titulo_cont]': 'x', 'q[pj_tema_id_eq]': 1, 'q[escola_id_eq]': 2, 'q[escola_g_cidade_id_eq]': 3, 'q[pj_membros_id_eq]': 4, 'q[n_status_noticia_slug_eq]': 'aguardando' }));
    for (const key of ['titulo_cont', 'pj_tema_id_eq', 'escola_id_eq', 'escola_g_cidade_id_eq', 'pj_membros_id_eq', 'n_status_noticia_slug_eq']) assert.ok(calls[0].url.searchParams.has('q[' + key + ']'), key);
  });
  it('rotas públicas não enviam token e nunca devolvem CPF, autor ou auditoria', async () => {
    const vazado = { ...projeto, tema_slug: 't', created_at: 'x', cpf: '01251667708', autor_nome: 'Autora', avaliado_por_nome: 'Avaliadora', created_by: '1' };
    const lista = await capture(list([vazado]), () => medtecApi.projetosPublicos.list({ tema: 't', cidade: 1, busca: 'h', page: 2, per_page: 5 }));
    assert.equal(lista.calls[0].url.pathname.endsWith('/publico/pj_projetos'), true);
    assert.equal(new Headers(lista.calls[0].options.headers).has('Authorization'), false); assert.equal(lista.calls[0].options.credentials, 'omit');
    assert.deepEqual([...lista.calls[0].url.searchParams.keys()].sort(), ['busca', 'cidade', 'page', 'per_page', 'tema']);
    const detalhe = await capture(json({ success: true, message: 'Projeto encontrado', data: { ...vazado,
      membros: [{ id: 5, pj_membro_id: 1, nome: 'Maria', cpf: '01251667708', funcao: 'Mediadora' }],
      anexos: [{ id: 10, nome: 'a.pdf', tipo: 'application/pdf', tamanho: 1, url: '/a.pdf', extra: 'x' }] } }), () => medtecApi.projetosPublicos.get(1));
    assert.equal(new Headers(detalhe.calls[0].options.headers).has('Authorization'), false);
    assert.deepEqual(detalhe.result.data.membros, [{ nome: 'Maria', funcao: 'Mediadora' }]);
    assert.deepEqual(detalhe.result.data.anexos, [{ id: 10, nome: 'a.pdf', tipo: 'application/pdf', tamanho: 1, url: '/a.pdf' }]);
    for (const value of [JSON.stringify(lista.result), JSON.stringify(detalhe.result)]) {
      for (const secret of ['01251667708', 'cpf', 'Autora', 'Avaliadora', 'created_by']) assert.ok(!value.includes(secret), secret);
    }
  });
  it('resposta pública fora do contrato é recusada', async () => {
    const invalidTema = mock.method(globalThis, 'fetch', async () => json({ success: true, data: [{ nome: 1 }] }));
    try { await assert.rejects(medtecApi.projetosPublicos.listTemas(), /Temas de Projeto/); } finally { invalidTema.mock.restore(); }
    const invalidDetalhe = mock.method(globalThis, 'fetch', async () => json({ success: true, data: { id: 1, titulo: 'x' } }));
    try { await assert.rejects(medtecApi.projetosPublicos.get(1), /API pública de Projetos/); } finally { invalidDetalhe.mock.restore(); }
  });
});

describe('Envelope paginado comum', () => {
  it('per_page 0 só é aceito em lista sem registros, como page=all devolve', async () => {
    const reply = (total_count: number, items: unknown[]) => mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({
      success: true, data: { items, pagination: { current_page: 1, total_pages: 1, total_count, per_page: 0 } },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    const empty = reply(0, []);
    try { assert.deepEqual((await medtecApi.escolas.list({ page: 'all' })).data.items, []); } finally { empty.mock.restore(); }
    const filled = reply(1, [{ id: 1 }]);
    try { await assert.rejects(medtecApi.escolas.list({ page: 'all' }), /Resposta inválida/); } finally { filled.mock.restore(); }
  });
});

describe('Professores e conquistas — integração com a API', () => {
  const JSON_HEADERS = { 'content-type': 'application/json' };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
  const listReply = (items: unknown[]) => json({
    success: true, message: 'ok',
    data: { items, pagination: { current_page: 1, total_pages: 1, total_count: items.length, per_page: 10 } },
  });
  const problem = (status: number, errors: string[], message = 'Erro de validação') => json({ success: false, message, errors }, status);
  const settle = () => new Promise(resolve => setImmediate(resolve));
  const sent = (call: { options: RequestInit }) => JSON.parse(String(call.options.body));

  const escola = { id: 3, nome: 'EEEFM Simón Bolívar', inep: '11000101', g_cidade_id: 4388, cidade_nome: 'Porto Velho' };
  const disciplina = { id: 1, nome: 'Biologia', slug: 'biologia', ativo: true };
  const categoria = { id: 2, nome: 'Robótica', slug: 'robotica', ativo: true };
  const professor = {
    id: 7, nome: 'Ana Beatriz Moura', pratica_pedagogica: 'Laboratório vivo.', ativo: true, escola_id: 3,
    escola_nome: escola.nome, cidade_nome: escola.cidade_nome, p_disciplina_ids: [1], disciplinas: [{ id: 1, nome: 'Biologia' }],
  };
  const relato = {
    id: 11, p_professor_id: 7, professor_nome: professor.nome, nome: 'João', email: 'joao@exemplo.com', telefone: '69999990000',
    texto: 'Mudou meu jeito de estudar.', n_status_noticia_id: 1, status: 'aguardando', status_nome: 'Aguardando aprovação',
  };
  const conquista = {
    id: 21, nome_aluno: 'Ana Souza', titulo: 'Aprovada em Medicina', relato: 'Passou na federal.', c_categoria_conquista_aluno_id: 2,
    categoria_nome: 'Robótica', escola_id: 3, escola_nome: escola.nome, cidade_nome: escola.cidade_nome, imagem_url: null,
    imagem: null, status: 'aguardando', status_nome: 'Aguardando aprovação',
  };
  const publicConquista = {
    id: 21, nome_aluno: 'Ana Souza', titulo: 'Aprovada em Medicina', relato: 'Passou na federal.', categoria_nome: 'Robótica',
    categoria_slug: 'robotica', escola_nome: escola.nome, cidade_nome: 'Porto Velho', imagem: null, imagem_url: null, created_at: '2026-11-01',
  };

  async function withFetch<T>(reply: (url: URL, options: RequestInit) => Response, run: (calls: { url: URL; options: RequestInit }[]) => Promise<T>) {
    const calls: { url: URL; options: RequestInit }[] = [];
    const spy = mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, options: RequestInit = {}) => {
      const url = new URL(String(input));
      calls.push({ url, options });
      return reply(url, options);
    });
    try { return await run(calls); } finally { spy.mock.restore(); }
  }

  it('mantém as subrotas no AdminShell, destaca a ativa e não exibe dados fictícios nem selos LGPD', () => {
    for (const [section, page, label] of [
      ['professores', AdminProfessoresSubroutePage(), 'Novo professor'],
      ['professoresDisciplinas', AdminDisciplinasSubroutePage(), 'Disciplinas'],
      ['professoresRelatos', AdminRelatosSubroutePage(), 'Relatos dos alunos'],
      ['alunos', AdminAlunosSubroutePage(), 'Nova conquista'],
      ['alunosCategorias', AdminCategoriasConquistaSubroutePage(), 'Categorias de conquista'],
    ] as const) {
      assert.equal(page.type, AdminShell);
      assert.equal(page.props.activeSection, section);
      assert.equal(getFolderIdForSection(section), 'publicacoes');
      const html = renderToStaticMarkup(page.props.children());
      assert.match(html, new RegExp(label));
      assert.doesNotMatch(html, /fictíci|LGPD verificad|Termo LGPD|aria-pressed/i);
      const group = ADMIN_SUBROUTE_GROUPS.find(item => item.items.some(entry => entry.section === section));
      assert.ok(group);
      for (const entry of group.items) {
        const href = SECTION_HREFS.get(entry.section);
        assert.ok(href);
        const link = html.match(new RegExp(`<a\\b[^>]*href="${href}"[^>]*>`))?.[0];
        assert.ok(link, href);
        assert.equal(link.includes('aria-current="page"'), entry.section === section, href);
      }
    }
  });

  it('gera os menus da árvore única, respeitando as permissões informadas por cada tela', () => {
    const access = {
      noticias: false, projetos: false, duvidas: false, avisos: false, fotos: false, galeria: false, professores: true,
      alunos: false, kanban: false, siteInfo: false, redes: false, estadosCidades: false, usuarios: false,
    };
    const folders = buildAdminMenu(access, { professoresRelatos: 3 });
    assert.deepEqual(folders.map(folder => [folder.id, folder.visible]), [['publicacoes', true], ['aprovacao', false], ['dados', false], ['usuarios', false]]);
    const items = folders.flatMap(folder => folder.items);
    assert.deepEqual(items.filter(item => item.visible).map(item => item.section), ['professores', 'professoresDisciplinas', 'professoresRelatos']);
    assert.equal(items.find(item => item.section === 'professoresRelatos')?.badge, 3);
    assert.deepEqual(items.map(item => [item.section, item.href]), [...SECTION_HREFS].sort((a, b) =>
      items.findIndex(item => item.section === a[0]) - items.findIndex(item => item.section === b[0])));
    for (const source of ['src/components/admin/AdminShell.tsx', 'src/app/admin/page.tsx']) {
      const code = readFileSync(source, 'utf8');
      assert.match(code, /buildAdminMenu\(/, source);
      assert.doesNotMatch(code, /section: '[a-zA-Z]+'/, source);
    }
  });

  it('serviços usam os corpos do contrato e objetos diretos no CMS', async () => {
    await withFetch(() => json(professor), async calls => {
      await medtecApi.professores.update(7, { nome: 'Ana', escola_id: 3, pratica_pedagogica: 'Prática', ativo: true, p_disciplina_ids: [1, 2] });
      assert.equal(calls[0].url.pathname, '/api/v1/p_professores/7');
      assert.equal(calls[0].options.method, 'PATCH');
      assert.deepEqual(sent(calls[0]), { p_professor: { nome: 'Ana', escola_id: 3, pratica_pedagogica: 'Prática', ativo: true, p_disciplina_ids: [1, 2] } });
    });
    await withFetch(() => json(conquista), async calls => {
      const input = { nome_aluno: 'Ana', titulo: 'T', relato: 'R', c_categoria_conquista_aluno_id: 2, escola_id: 3, status: 'publicada', autor_id: 9 };
      const created = await medtecApi.conquistas.create({ ...input, imagem_url: 'https://exemplo.com/a.jpg' });
      assert.equal(created.id, 21);
      assert.deepEqual(sent(calls[0]), { c_conquista_aluno: {
        nome_aluno: 'Ana', titulo: 'T', relato: 'R', c_categoria_conquista_aluno_id: 2, escola_id: 3, imagem_url: 'https://exemplo.com/a.jpg',
      } });
      await medtecApi.conquistas.update(21, { ...input, imagem: new File(['x'], 'a.png', { type: 'image/png' }) });
      const body = calls[1].options.body as FormData;
      assert.ok(body instanceof FormData);
      assert.equal(body.get('c_conquista_aluno[escola_id]'), '3');
      assert.ok(body.get('c_conquista_aluno[imagem]') instanceof File);
      assert.equal(body.get('c_conquista_aluno[status]'), null);
      assert.equal(new Headers(calls[1].options.headers).has('Content-Type'), false);
      await medtecApi.conquistas.reprovar(21);
      assert.equal(calls[2].url.pathname, '/api/v1/c_conquistas_aluno/21/reprovar');
      assert.equal(calls[2].options.body, undefined);
    });
    await withFetch(() => new Response(null, { status: 204 }), async calls => {
      assert.equal(await medtecApi.relatos.delete(11), undefined);
      assert.equal(calls[0].options.method, 'DELETE');
    });
  });

  it('rotas públicas não enviam sessão e descartam contato, autor e auditoria', async () => {
    setStoredTokens({ access_token: 'sessao-admin', refresh_token: 'refresh-admin' });
    try {
      await withFetch(url => url.pathname.endsWith('/7')
        ? json({ success: true, message: 'ok', data: { ...professor, email: 'prof@x.com', telefone: '69', disciplinas: [{ nome: 'Biologia', slug: 'biologia' }], relatos: [{ nome: 'João', texto: 'Bom', created_at: 'x', email: 'joao@x.com', telefone: '69999990000' }] } })
        : listReply([{ ...publicConquista, autor_nome: 'Gestora', avaliado_por_nome: 'Gestora' }]), async calls => {
        const detail = await medtecApi.professoresPublicos.get(7);
        assert.doesNotMatch(JSON.stringify(detail), /@x\.com|69999990000|telefone|email/);
        assert.deepEqual(detail.data.relatos, [{ nome: 'João', texto: 'Bom', created_at: 'x' }]);
        const list = await medtecApi.conquistasPublicas.list({ categoria: 'robotica', page: 'all' });
        assert.doesNotMatch(JSON.stringify(list), /autor|avaliado/);
        assert.equal(calls[1].url.searchParams.get('categoria'), 'robotica');
        for (const call of calls) {
          assert.equal(new Headers(call.options.headers).has('Authorization'), false);
          assert.equal(call.options.credentials, 'omit');
        }
      });
    } finally { clearStoredTokens(); }
  });

  it('monta imagem pela URL do servidor, valida arquivo e gera iniciais', () => {
    assert.equal(getConquistaImageSrc({ imagem: '/rails/active_storage/blobs/redirect/a/foto.png', imagem_url: null }),
      'http://localhost:3000/rails/active_storage/blobs/redirect/a/foto.png');
    assert.equal(getConquistaImageSrc({ imagem: null, imagem_url: 'https://exemplo.com/a.jpg' }), 'https://exemplo.com/a.jpg');
    assert.equal(getConquistaImageSrc({ imagem: null, imagem_url: null }), '');
    assert.equal(validateConquistaImage(new File(['x'], 'a.webp', { type: 'image/webp' })), null);
    assert.match(String(validateConquistaImage(new File(['x'], 'a.gif', { type: 'image/gif' }))), /PNG, JPG ou WEBP/);
    const big = new File(['x'], 'a.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: CONQUISTA_IMAGE_MAX_BYTES + 1 });
    assert.match(String(validateConquistaImage(big)), /5 MB/);
    assert.equal(getNameInitials('Ana Beatriz Moura'), 'AM');
    assert.equal(isHttpsUrl('http://exemplo.com/a.jpg'), false);
    assert.equal(isHttpsUrl('https://exemplo.com/a.jpg'), true);
  });

  it('CRUD de professores envia a lista de disciplinas e mostra o 422 da API', async () => {
    let rejectNext = true;
    const view = await mountCategories(async (url, options) => {
      if (url.pathname.endsWith('/escolas')) return listReply([escola]);
      if (url.pathname.endsWith('/p_disciplinas')) return listReply([disciplina, { ...disciplina, id: 2, nome: 'Inativa', ativo: false }]);
      if (options.method === 'POST') {
        if (rejectNext) { rejectNext = false; return problem(422, ['P disciplinas precisa ter ao menos uma']); }
        return json(professor, 201);
      }
      return listReply([professor]);
    }, false, { component: () => ProfessoresPanel(), allowedPaths: /\/(p_professores|p_disciplinas|escolas)$/ });
    try {
      await view.act(settle);
      assert.match(view.html(), /Ana Beatriz Moura/);
      await view.click('Novo professor');
      assert.ok(view.nodes().some(node => node.props.name === 'professor-disciplina-1'));
      assert.equal(view.nodes().some(node => node.props.name === 'professor-disciplina-2'), false);
      await view.submit('Criar professor');
      assert.match(view.html(), /Informe nome, escola/);
      await view.change('professor-nome', 'Nova Professora');
      await view.change('professor-escola', '3');
      await view.change('professor-pratica', 'Prática');
      await view.submit('Criar professor');
      assert.match(view.html(), /Selecione ao menos uma disciplina/);
      await view.change('professor-disciplina-1', true);
      await view.submit('Criar professor');
      assert.match(view.html(), /P disciplinas precisa ter ao menos uma/);
      await view.submit('Criar professor');
      await view.act(settle);
      const post = view.calls.filter(call => call.options.method === 'POST').at(-1);
      assert.ok(post);
      assert.deepEqual(sent(post), { p_professor: { nome: 'Nova Professora', escola_id: 3, pratica_pedagogica: 'Prática', ativo: true, p_disciplina_ids: [1] } });
      assert.match(view.html(), /Professor salvo com sucesso/);
    } finally { await view.restore(); }
  });

  it('relatos mostram contato só no CMS e botões conforme o status', async () => {
    const statuses = [
      { ...relato, id: 11, nome: 'Aguarda' },
      { ...relato, id: 12, nome: 'Publicado', status: 'publicada', status_nome: 'Publicada' },
      { ...relato, id: 13, nome: 'Reprovado', status: 'reprovada', status_nome: 'Reprovada' },
    ];
    const view = await mountCategories(async (url, options) => options.method === 'PATCH' ? json(relato) : listReply(statuses), false,
      { component: () => RelatosPanel(), allowedPaths: /\/p_relatos(\/\d+\/(publicar|reprovar|despublicar))?$/ });
    try {
      await view.act(settle);
      assert.equal(view.calls[0].url.searchParams.get('q[n_status_noticia_slug_eq]'), 'aguardando');
      assert.match(view.html(), /joao@exemplo\.com/);
      const labels = view.nodes().filter(node => node.type === 'button').map(node => String(node.props['aria-label']));
      for (const label of ['Publicar relato de Aguarda', 'Reprovar relato de Aguarda', 'Despublicar relato de Publicado', 'Publicar relato de Reprovado']) {
        assert.ok(labels.includes(label), label);
      }
      for (const label of ['Despublicar relato de Aguarda', 'Publicar relato de Publicado', 'Reprovar relato de Publicado', 'Reprovar relato de Reprovado', 'Despublicar relato de Reprovado']) {
        assert.equal(labels.includes(label), false, label);
      }
      await view.click('Reprovar relato de Aguarda');
      await view.act(settle);
      assert.ok(view.calls.some(call => call.url.pathname.endsWith('/p_relatos/11/reprovar') && call.options.body === undefined));
      assert.match(view.html(), /Relato reprovado/);
    } finally { await view.restore(); }
  });

  it('município só filtra escolas e não é enviado na conquista; 403 usa a mensagem do projeto', async () => {
    let forbid = true;
    const view = await mountCategories(async (url, options) => {
      if (url.pathname.endsWith('/escolas')) return listReply([escola]);
      if (url.pathname.endsWith('/c_categorias_conquista_aluno')) return listReply([categoria]);
      if (options.method === 'PATCH') {
        if (forbid) { forbid = false; return problem(403, ['sem_permissao'], 'Sem permissão'); }
        return json({ ...conquista, status: 'publicada' });
      }
      if (options.method === 'POST') return json(conquista, 201);
      return listReply([conquista]);
    }, false, { component: () => ConquistasPanel(), allowedPaths: /\/(c_conquistas_aluno|c_categorias_conquista_aluno|escolas)(\/\d+\/publicar)?$/ });
    try {
      await view.act(settle);
      await view.click(`Publicar ${conquista.titulo}`);
      assert.match(view.html(), /não possui permissão/);
      await view.click('Nova conquista');
      await view.change('conquista-nome-aluno', 'Ana');
      await view.change('conquista-titulo', 'Título');
      await view.change('conquista-relato', 'Relato');
      await view.change('conquista-categoria', '2');
      await view.change('conquista-cidade', '4388');
      await view.act(settle);
      assert.ok(view.calls.some(call => call.url.pathname.endsWith('/escolas') &&
        call.url.searchParams.get('q[g_cidade_id_eq]') === '4388' && call.url.searchParams.get('page') === 'all'));
      await view.change('conquista-escola', '3');
      await view.submit('Criar conquista');
      await view.act(settle);
      const post = view.calls.find(call => call.options.method === 'POST');
      assert.ok(post);
      assert.deepEqual(sent(post), { c_conquista_aluno: { nome_aluno: 'Ana', titulo: 'Título', relato: 'Relato', c_categoria_conquista_aluno_id: 2, escola_id: 3 } });
      assert.match(view.html(), /Conquista salva com sucesso/);
    } finally { await view.restore(); }
  });

  it('formulário de conquista aceita só PNG/JPG/WEBP até 5 MB e imagem_url HTTPS', async () => {
    const view = await mountCategories(async (url, options) => {
      if (url.pathname.endsWith('/escolas')) return listReply([escola]);
      if (url.pathname.endsWith('/c_categorias_conquista_aluno')) return listReply([categoria]);
      if (options.method === 'POST') return json(conquista, 201);
      return listReply([]);
    }, false, { component: () => ConquistasPanel(), allowedPaths: /\/(c_conquistas_aluno|c_categorias_conquista_aluno|escolas)$/ });
    const posts = () => view.calls.filter(call => call.options.method === 'POST');
    const fill = async () => {
      await view.click('Nova conquista');
      await view.change('conquista-nome-aluno', 'Ana');
      await view.change('conquista-titulo', 'Título');
      await view.change('conquista-relato', 'Relato');
      await view.change('conquista-categoria', '2');
      await view.change('conquista-escola', '3');
    };
    const chooseFile = (file: File) => {
      const input = view.nodes().find(node => node.props.name === 'conquista-imagem');
      assert.ok(input);
      return view.act(() => Reflect.apply(input.props.onChange as () => unknown, undefined, [{ target: { files: [file], value: file.name } }]));
    };
    const useLink = () => {
      const radio = view.nodes().find(node => node.props.name === 'conquista-imagem-modo' && node.props.value === 'link');
      assert.ok(radio);
      return view.act(() => Reflect.apply(radio.props.onChange as () => unknown, undefined, []));
    };
    try {
      await view.act(settle);
      await fill();
      const gif = new File(['x'], 'a.gif', { type: 'image/gif' });
      await chooseFile(gif);
      assert.match(view.html(), /A imagem deve ser PNG, JPG ou WEBP/);
      const big = new File(['x'], 'a.png', { type: 'image/png' });
      Object.defineProperty(big, 'size', { value: CONQUISTA_IMAGE_MAX_BYTES + 1 });
      await chooseFile(big);
      assert.match(view.html(), /A imagem deve ter até 5 MB/);
      // Arquivo recusado não fica no formulário: o envio segue sem imagem.
      await view.submit('Criar conquista');
      await view.act(settle);
      assert.equal(posts().length, 1);
      assert.equal(typeof posts()[0].options.body, 'string');
      assert.equal('imagem' in sent(posts()[0]).c_conquista_aluno, false);

      for (const [file, type] of [['a.png', 'image/png'], ['a.jpg', 'image/jpeg'], ['a.webp', 'image/webp']] as const) {
        await fill();
        await chooseFile(new File(['x'], file, { type }));
        await view.submit('Criar conquista');
        await view.act(settle);
        const body = posts().at(-1)?.options.body;
        assert.ok(body instanceof FormData, file);
        assert.equal((body.get('c_conquista_aluno[imagem]') as File).name, file);
      }

      const before = posts().length;
      await fill();
      await useLink();
      for (const link of ['http://exemplo.com/a.jpg', 'javascript:alert(1)', 'ftp://exemplo.com/a.jpg', 'exemplo.com/a.jpg']) {
        await view.change('conquista-imagem-url', link);
        await view.submit('Criar conquista');
        assert.match(view.html(), /Informe um link HTTPS válido/, link);
        assert.equal(posts().length, before, link);
      }
      await view.change('conquista-imagem-url', 'https://exemplo.com/a.jpg');
      await view.submit('Criar conquista');
      await view.act(settle);
      assert.equal(sent(posts()[before]).c_conquista_aluno.imagem_url, 'https://exemplo.com/a.jpg');
    } finally { await view.restore(); }
  });

  it('Fila de Aprovação lista conquistas e relatos aguardando e os publica', async () => {
    const view = await mountCategories(async (url, options) => {
      if (options.method === 'PATCH') return json(relato);
      return listReply(url.pathname.endsWith('/p_relatos') ? [relato] : [conquista]);
    }, false, { component: () => CommunityApprovalQueue(), allowedPaths: /\/(p_relatos|c_conquistas_aluno)(\/\d+\/(publicar|reprovar))?$/ });
    try {
      await view.act(settle);
      for (const call of view.calls) {
        assert.equal(call.url.searchParams.get('q[n_status_noticia_slug_eq]'), 'aguardando');
        assert.equal(call.url.searchParams.get('page'), 'all');
      }
      assert.match(view.html(), /Aprovada em Medicina/);
      assert.match(view.html(), /Mudou meu jeito de estudar/);
      await view.click(`Publicar ${conquista.titulo}`);
      await view.act(settle);
      assert.ok(view.calls.some(call => call.url.pathname.endsWith('/c_conquistas_aluno/21/publicar')));
      await view.click('Reprovar relato de João');
      await view.act(settle);
      assert.ok(view.calls.some(call => call.url.pathname.endsWith('/p_relatos/11/reprovar')));
    } finally { await view.restore(); }
  });

  it('formulário público de relato trata validação, 422, 429 e sucesso', async () => {
    const replies = [
      () => problem(422, ['Email já enviou um relato para este professor', 'Telefone deve ter DDD e 10 ou 11 dígitos']),
      () => problem(429, ['muitas_tentativas'], 'Muitas tentativas'),
      () => json({ success: true, message: 'Relato enviado. Ele aparece no site depois de aprovado.', data: null }, 201),
    ];
    const view = await mountCategories(async () => (replies.shift() as () => Response)(), false, {
      component: () => RelatoProfessorForm({ professorId: 7, professorNome: 'Ana' }),
      allowedPaths: /\/publico\/p_professores\/7\/p_relatos$/, anonymous: true,
    });
    try {
      await view.submit();
      assert.equal(view.calls.length, 0);
      assert.match(view.html(), /Informe seu nome/);
      await view.change('relato-nome', 'João');
      await view.change('relato-email', 'joao@exemplo.com');
      await view.change('relato-telefone', '(69) 99999-0000');
      await view.change('relato-texto', 'Mudou meu jeito de estudar.');
      await view.submit();
      assert.match(view.html(), /Email já enviou um relato/);
      assert.match(view.html(), /Telefone deve ter DDD/);
      await view.submit();
      assert.match(view.html(), /Muitos envios\. Aguarde um minuto\./);
      await view.submit();
      assert.match(view.html(), /Relato enviado\. Ele aparece no site depois de aprovado\./);
      assert.deepEqual(sent(view.calls[0]), { p_relato: { nome: 'João', email: 'joao@exemplo.com', telefone: '(69) 99999-0000', texto: 'Mudou meu jeito de estudar.' } });
    } finally { await view.restore(); }
  });

  it('página do professor mostra "em breve" em qualquer erro da API e relatos sem contato', async () => {
    await assert.rejects(ProfessorDetalhePage({ params: Promise.resolve({ id: 'abc' }) }));
    for (const reply of [
      () => problem(404, ['nao_encontrado'], 'Não encontrado'),
      () => problem(500, ['erro_interno'], 'Erro interno'),
      () => { throw new TypeError('fetch failed'); },
    ]) {
      await withFetch(reply, async () => {
        const nodes = noticeNodes(await ProfessorDetalhePage({ params: Promise.resolve({ id: '7' }) }));
        assert.equal(nodes.find(node => node.type === CommunityComingSoon)?.props.message, 'O quadro de professores e mediadores estará disponível em breve.');
        assert.ok(!nodes.some(node => node.props.role === 'alert' || node.type === RelatoProfessorForm));
      });
    }
    await withFetch(() => json({ success: true, message: 'ok', data: {
      id: 7, nome: 'Ana', pratica_pedagogica: 'Prática', escola_nome: 'Escola', cidade_nome: 'Porto Velho',
      email: 'prof@x.com', disciplinas: [{ nome: 'Biologia', slug: 'biologia' }],
      relatos: [{ nome: 'João', texto: 'Relato publicado', created_at: 'x', email: 'joao@x.com' }],
    } }), async () => {
      const nodes = noticeNodes(await ProfessorDetalhePage({ params: Promise.resolve({ id: '7' }) }));
      const text = nodes.flatMap(node => React.Children.toArray(node.props.children as ReactNode)).filter(child => typeof child === 'string').join(' ');
      assert.match(text, /Relato publicado/);
      assert.doesNotMatch(text, /@x\.com/);
      assert.equal(nodes.find(node => node.type === RelatoProfessorForm)?.props.professorId, 7);
    });
  });

  describe('seções públicas sem a API', () => {
    const noError = (html: string) => {
      assert.match(html, /Em breve/);
      assert.doesNotMatch(html, /role="alert"|Tentar novamente|Tente novamente|Não foi possível|Falha|Erro/);
    };
    const failures: [string, () => Promise<Response>][] = [
      ['404', async () => problem(404, ['nao_encontrado'], 'Não encontrado')],
      ['500', async () => problem(500, ['erro_interno'], 'Erro interno')],
      ['rede', async () => { throw new TypeError('fetch failed'); }],
    ];
    const silenceWarnings = () => mock.method(console, 'warn', () => {});
    // O mural usa motion, que não renderiza em HTML neste ambiente: lê a árvore de elementos.
    const muralText = (view: { nodes(): { props: { children?: unknown; role?: unknown } }[] }) => {
      assert.ok(!view.nodes().some(node => node.props.role === 'alert'));
      return view.nodes().flatMap(node => [node.props.children].flat()).filter(value => typeof value === 'string').join(' ');
    };

    for (const [name, fail] of failures) {
      it(`/alunos mostra "em breve" sem filtros nem erro (${name})`, async () => {
        const warn = silenceWarnings();
        const view = await mountCategories(fail, false, { component: () => AlunosView(), allowedPaths: /\/publico\/(c_conquistas_aluno|c_categorias_conquista_aluno)$/, anonymous: true });
        try {
          await view.act(settle);
          noError(view.html());
          assert.match(view.html(), /As histórias dos estudantes estarão disponíveis em breve/);
          assert.doesNotMatch(view.html(), /conquistas-busca|conquistas-categoria/);
        } finally { await view.restore(); warn.mock.restore(); }
      });

      it(`/professores mostra "em breve" e avisa a página para ocultar os filtros (${name})`, async () => {
        let unavailable = 0;
        const onUnavailable = () => { unavailable++; };
        const view = await mountCategories(fail, false, { component: () => TeacherProfiles({ onUnavailable }), allowedPaths: /\/publico\/p_professores$/, anonymous: true });
        try {
          await view.act(settle);
          noError(view.html());
          assert.match(view.html(), /O quadro de professores e mediadores estará disponível em breve/);
          assert.equal(unavailable, 1);
        } finally { await view.restore(); }
      });

      it(`home mostra "em breve" nas duas colunas (${name})`, async () => {
        const view = await mountCategories(fail, false, { component: () => CommunityMuralSection(), allowedPaths: /\/publico\/(p_professores|c_conquistas_aluno)$/, anonymous: true });
        try {
          await view.act(settle);
          const text = muralText(view);
          noError(text);
          assert.match(text, /O quadro de professores e mediadores estará disponível em breve/);
          assert.match(text, /As histórias dos estudantes estarão disponíveis em breve/);
        } finally { await view.restore(); }
      });
    }

    it('/professores oculta os filtros quando a lista fica indisponível', async () => {
      const warn = silenceWarnings();
      const view = await mountCategories(async () => problem(404, ['nao_encontrado']), false, { component: () => ProfessoresView(), allowedPaths: /\/publico\/p_disciplinas$/, anonymous: true });
      try {
        await view.act(settle);
        assert.match(view.html(), /name="professores-busca"/);
        const list = view.nodes().find(node => node.type === TeacherProfiles);
        assert.ok(list);
        await view.act(() => Reflect.apply(list.props.onUnavailable as () => unknown, undefined, []));
        assert.doesNotMatch(view.html(), /name="professores-busca"|name="professores-disciplina"/);
      } finally { await view.restore(); warn.mock.restore(); }
    });

    it('home degrada só a coluna que falhou e lista vazia não vira "em breve"', async () => {
      const view = await mountCategories(async url => url.pathname.endsWith('/p_professores') ? problem(500, ['erro_interno']) : listReply([publicConquista]), false, {
        component: () => CommunityMuralSection(), allowedPaths: /\/publico\/(p_professores|c_conquistas_aluno)$/, anonymous: true,
      });
      try {
        await view.act(settle);
        const text = muralText(view);
        assert.match(text, /O quadro de professores e mediadores estará disponível em breve/);
        assert.match(text, new RegExp(publicConquista.titulo));
        assert.doesNotMatch(text, /As histórias dos estudantes estarão disponíveis em breve/);
      } finally { await view.restore(); }
      const empty = await mountCategories(async url => url.pathname.endsWith('/c_categorias_conquista_aluno')
        ? json({ success: true, message: 'ok', data: [] }) : listReply([]), false, {
        component: () => AlunosView(), allowedPaths: /\/publico\/(c_conquistas_aluno|c_categorias_conquista_aluno)$/, anonymous: true,
      });
      try {
        await empty.act(settle);
        assert.doesNotMatch(empty.html(), /Em breve/);
        assert.match(empty.html(), /name="conquistas-busca"/);
      } finally { await empty.restore(); }
    });
  });

  it('site de conquistas filtra categoria e busca na API e município pelo nome devolvido', async () => {
    const items = [publicConquista, { ...publicConquista, id: 22, nome_aluno: 'Beto Lima', cidade_nome: 'Ji-Paraná' }];
    const view = await mountCategories(async url => url.pathname.endsWith('/publico/c_categorias_conquista_aluno')
      ? json({ success: true, message: 'ok', data: [{ nome: 'Robótica', slug: 'robotica' }] })
      : listReply(items), false, { component: () => AlunosView(), allowedPaths: /\/publico\/(c_conquistas_aluno|c_categorias_conquista_aluno)$/, anonymous: true });
    try {
      await view.act(settle);
      assert.equal(view.calls.find(call => call.url.pathname.endsWith('/c_conquistas_aluno'))?.url.searchParams.get('page'), 'all');
      await view.change('conquistas-categoria', 'robotica');
      await view.act(settle);
      assert.equal(view.calls.at(-1)?.url.searchParams.get('categoria'), 'robotica');
      const select = view.nodes().find(node => node.props.name === 'conquistas-cidade');
      assert.ok(select);
      const stories = () => view.nodes().find(node => node.type === StudentStories)?.props.conquistas as ConquistaPublica[];
      assert.equal(stories().length, 2);
      await view.change('conquistas-cidade', 'Ji-Paraná');
      assert.deepEqual(stories().map(item => item.nome_aluno), ['Beto Lima']);
      assert.equal(view.calls.at(-1)?.url.searchParams.get('cidade'), null);
      assert.doesNotMatch(renderToStaticMarkup(createElement(StudentStories, { conquistas: stories() })), /LGPD|autorizad/i);
    } finally { await view.restore(); }
  });
});

describe('Reativação sob Activity e seleção de UF (pós-auditoria)', () => {
  type ElementProps = {
    children?: ReactNode;
    onClick?: () => void;
    onSubmit?: (event: { preventDefault(): void }) => Promise<void>;
  };
  const flatten = (node: ReactNode): React.ReactElement<ElementProps>[] => {
    if (Array.isArray(node)) return node.flatMap(flatten);
    if (!isValidElement<ElementProps>(node)) return [];
    return [node, ...flatten(node.props.children)];
  };
  const texts = (node: ReactNode): string[] => {
    if (typeof node === 'string') return [node];
    if (Array.isArray(node)) return node.flatMap(texts);
    return isValidElement<ElementProps>(node) ? texts(node.props.children) : [];
  };
  const flush = () => React.act(async () => { await new Promise(resolve => setImmediate(resolve)); });

  // Executa os hooks reais sob Activity; a árvore retornada é apenas observada.
  async function mountHooks(body: () => void) {
    const doc = {
      nodeType: 9, addEventListener() {}, removeEventListener() {}, activeElement: null, body: null,
      defaultView: null as unknown,
    };
    const browser = { document: doc, HTMLIFrameElement: class {} };
    doc.defaultView = browser;
    const globals = { window: browser, document: doc, IS_REACT_ACT_ENVIRONMENT: true };
    const descriptors = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const [key, value] of Object.entries(globals)) {
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    function Host() { body(); return null; }
    const container = {
      nodeType: 1, tagName: 'DIV', namespaceURI: 'http://www.w3.org/1999/xhtml', ownerDocument: doc,
      addEventListener() {}, removeEventListener() {}, textContent: '',
    };
    const root = createRoot(container as unknown as Element);
    const render = (mode: 'visible' | 'hidden') => React.act(async () => {
      root.render(jsx(React.Activity, { mode, children: createElement(Host) } satisfies React.ActivityProps));
    });
    await render('visible');
    await flush();
    return {
      render,
      async restore() {
        await React.act(async () => { root.unmount(); });
        for (const [key, descriptor] of descriptors) {
          if (descriptor) Object.defineProperty(globalThis, key, descriptor);
          else Reflect.deleteProperty(globalThis, key);
        }
      },
    };
  }

  for (const [label, services, readError] of [
    ['Avisos', [medtecApi.tiposAviso, medtecApi.avisos], () => {
      const page = AdminAvisosPage();
      return (page.props.children as React.ReactElement<AnnouncementsModuleProps>).props.errorAvisos;
    }],
    ['Galeria', [medtecApi.categoriasGaleria, medtecApi.fotosGaleria], () => {
      const page = AdminGaleriaPage();
      return (page.props.children as React.ReactElement<GalleryModuleProps>).props.errorFotos;
    }],
  ] as const) {
    it(`${label} limpa o erro quando a recarga da reativação tem sucesso`, async () => {
      let failing = true;
      const reply = () => failing
        ? Promise.reject(new Error('Falha sintética'))
        : Promise.resolve({ success: true, data: { items: [] } });
      const spies = (services as readonly unknown[]).map(service =>
        mock.method(service as { list: () => Promise<unknown> }, 'list', reply));
      let error: string | null | undefined;
      const hooks = await mountHooks(() => { error = readError(); });
      try {
        assert.ok(error);
        failing = false;
        await hooks.render('hidden');
        await hooks.render('visible');
        await flush();
        assert.equal(error, null);
      } finally {
        await hooks.restore();
        for (const spy of spies) spy.mock.restore();
      }
    });
  }

  async function createEstadoAfter(initial: Estado[]) {
    const created = { id: 99, nome: 'Estado novo', sigla_uf: 'EN', codigo_ibge: '99' } as Estado;
    const requested: unknown[] = [];
    const cidades = mock.method(medtecApi.cidades, 'list', ((params: Record<string, unknown>) => {
      requested.push(params['q[g_estado_id_eq]']);
      return Promise.resolve({ success: true, data: { items: [] } });
    }) as never);
    const create = mock.method(medtecApi.estados, 'create', (() => Promise.resolve(created)) as never);
    let tree: ReactNode = null;
    let deliver!: (items: Estado[]) => void;
    // A lista sempre chega depois da montagem, como na subrota do painel.
    const hooks = await mountHooks(() => {
      const [apiEstados, setApiEstados] = React.useState<Estado[]>([]);
      deliver = setApiEstados;
      tree = EstadosCidadesModule({ apiEstados, setApiEstados, loadingEstados: false });
    });
    try {
      await React.act(async () => { deliver(initial); });
      await flush();
      const openModal = flatten(tree).find(node => node.type === 'button' && texts(node).includes('Novo Estado (UF)'));
      await React.act(async () => { openModal?.props.onClick?.(); });
      const form = flatten(tree).find(node => node.type === 'form' && texts(node).includes('Cadastrar Estado'));
      await React.act(async () => { await form?.props.onSubmit?.({ preventDefault() {} }); });
      await flush();
      assert.equal(create.mock.callCount(), 1);
      return requested;
    } finally {
      await hooks.restore();
      cidades.mock.restore();
      create.mock.restore();
    }
  }

  it('criar UF mantém o estado efetivo quando a lista chega depois da montagem', async () => {
    const estados = [
      { id: 1, nome: 'Estado A', sigla_uf: 'AA', codigo_ibge: '11' },
      { id: 2, nome: 'Estado B', sigla_uf: 'BB', codigo_ibge: '12' },
    ] as Estado[];
    assert.deepEqual(await createEstadoAfter(estados), [1]);
  });

  it('a primeira UF criada passa a ser o estado efetivo', async () => {
    assert.deepEqual(await createEstadoAfter([]), [99]);
  });
});
