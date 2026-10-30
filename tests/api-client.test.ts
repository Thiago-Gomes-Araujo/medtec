/**
 * Testes Unitários Automatizados da Camada Central de Integração MEDTEC
 * Executado pelo test runner nativo do Node.js: npx tsx --test tests/api-client.test.ts
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { Sun, Moon } from 'lucide-react';
import React, { createElement, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import AdminFaqSubroutePage from '../src/app/admin/faq/page';
import AdminProjetosSubroutePage from '../src/app/admin/projetos/page';
import AdminBannersSubroutePage from '../src/app/admin/banners/page';
import AdminDashboardPage from '../src/app/admin/page';
import DesktopSidebarContainer from '../src/components/admin/DesktopSidebarContainer';
import SidebarNavItem, { type SidebarNavItemProps } from '../src/components/admin/SidebarNavItem';
import SidebarFolderAccordion, { type SidebarFolderAccordionProps, type NavFolderDef } from '../src/components/admin/SidebarFolderAccordion';
import AdminOverview, { type AdminOverviewProps } from '../src/components/admin/AdminOverview';
import OverviewStats from '../src/components/admin/OverviewStats';
import EditorialKanban from '../src/components/EditorialKanban';
import UserManager from '../src/components/UserManager';
import SitePhotosManager from '../src/components/SitePhotosManager';
import FaqModule, { type FaqViewMode } from '../src/components/admin/FaqModule';
import ProjectsModule, { type ProjectViewMode } from '../src/components/admin/ProjectsModule';
import type { AdminUsersData } from '../src/components/admin/useAdminUsers';
import AdminShell, { canAccessAdminUsers, getFolderIdForSection, SECTION_CONFIG, type AdminSection as ShellAdminSection, type AdminSession, type AdminShellProps } from '../src/components/admin/AdminShell';
import { SECTION_CONFIG as SHARED_SECTION_CONFIG, SECTION_HREFS, type AdminSection } from '../src/lib/admin-navigation';
import { useAdminTheme } from '../src/components/admin/useAdminTheme';
import { filterAdminNavigation } from '../src/lib/admin-navigation-filter';
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
import { getLegacyBannersHref, readAdminBanners, readBannerNews, readBannerGallery, prepareLocalBannerPreview,
  type AdminBannersData, type BannerNewsCover, type BannerGalleryPhoto } from '../src/lib/admin-banners';
import AdminLiveSimulator from '../src/components/AdminLiveSimulator';
import { applyOverviewSnapshot, createAdminOverviewLoader, createInitialOverviewState, getOverviewHighlights, getOverviewMetrics, startOverviewLoading } from '../src/lib/admin-overview';
import AdminRedesSubroutePage from '../src/app/admin/redes/page';
import SocialChannelsModule, { type SocialChannelsModuleProps } from '../src/components/admin/SocialChannelsModule';
import { ADMIN_CHANNEL_KEYS, getChannelChanges, readAdminChannels, saveAdminChannels } from '../src/lib/admin-channels';
import type { CanalContato } from '../src/lib/api';

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
          assert.equal(control.props.className, 'p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer');
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
      if (kind === 'page' && dependencies?.length === 1 && dependency && typeof dependency === 'object' &&
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
        "title": "Projetos Pedagógicos e Práticas Escolares",
        "subtitle": "Cadastre, edite e gerencie os projetos pedagógicos, práticas de campo e missões escolares dos 52 municípios.",
        "href": "/admin/projetos"
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

  it('mantém os onze destinos na ordem anterior e exclui Início do mapa de redirecionamento', () => {
    assert.deepEqual([...SECTION_HREFS], [
      ['fotos', '/admin/banners'], ['projetos', '/admin/projetos'], ['duvidas', '/admin/faq'],
      ['usuarios', '/admin/usuarios'], ['kanban', '/admin/kanban'], ['noticias', '/admin/noticias'],
      ['avisos', '/admin/avisos'], ['galeria', '/admin/galeria'], ['estadosCidades', '/admin/estados-cidades'],
      ['siteInfo', '/admin/institucional'], ['redes', '/admin/redes'],
    ]);
    assert.equal(SECTION_HREFS.has('visaoGeral'), false);
    assert.equal(SHARED_SECTION_CONFIG.visaoGeral.href, '/admin');
    assert.equal(new Set(SECTION_HREFS.values()).size, 11);
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
      const menuOrder = ['/admin/noticias', '/admin/projetos', '/admin/faq', '/admin/avisos', '/admin/banners',
        '/admin/galeria', '/admin/kanban', '/admin/institucional', '/admin/redes', '/admin/estados-cidades', '/admin/usuarios'];
      assert.deepEqual(page.calls, (mobile ? [...menuOrder, ...menuOrder] : menuOrder).map(href => ({ method: 'push', href })));
    }
  });

  it('preserva links e pastas inicialmente abertas no shell e a divergência de Estados/Cidades', () => {
    const desktop = capture('shell', session);
    const desktopHrefs = desktop.nodes.flatMap(node => node.props.href ? [node.props.href] : []);
    assert.deepEqual(desktopHrefs.filter(href => href.startsWith('/admin')),
      ['/admin', '/admin/noticias', '/admin/projetos', '/admin/faq', '/admin/avisos', '/admin/banners', '/admin/galeria']);
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
    const page = capture('page', session);
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    try {
      assert.equal(page.effects.length, 1);
      for (const parameter of ['tab', 'section']) {
        Object.defineProperty(globalThis, 'window', { configurable: true,
          value: { location: { search: '?' + parameter + '=visaoGeral' } } });
        page.effects[0]();
      }
      assert.deepEqual(page.calls, []);
      assert.deepEqual(page.selections, ['visaoGeral', 'visaoGeral']);
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
      for (const value of ['450', '231', '280', '120']) assert.ok(html.includes('>' + value + '</p>'));
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
    }, latestNews: undefined, announcementTitle: undefined });
    assert.equal((html.match(/>0<\/p>/g) || []).length, 4);
    for (const text of ['Nenhuma matéria cadastrada', 'Nenhuma fotografia catalogada',
      'Nenhuma notícia publicada ainda', 'Indisponível — sem integração oficial',
      'Sem comunicados urgentes no momento', 'Nenhum comunicado urgente ativo']) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(!html.includes('Notícia recebida'));
    assert.ok(!html.includes('Prática recebida'));
  });

  it('mantém carregamento e falha distintos de vazio sem exibir totais antigos nos cards', () => {
    const base = props();
    const loading = render({ indicators: { ...base.indicators,
      loadingNews: true, loadingAvisos: true, loadingFotos: true, usersCountLabel: '...',
    } });
    assert.ok(loading.includes('Carregando API...'));
    assert.ok(loading.includes('Carregando...'));
    assert.ok(!loading.includes('>450</p>'));
    assert.ok(!loading.includes('Nenhuma matéria cadastrada'));
    for (const text of ['Notícia recebida', 'Autoria recebida', '2026-10-30', 'Aviso recebido', '200 avisos em exibição']) {
      assert.ok(!loading.includes(text), text);
    }
    const failed = render({ indicators: { ...base.indicators,
      errorNews: 'Falha de notícias', errorAvisos: 'Falha de avisos', errorFotos: 'Falha de fotos', usersCountLabel: 'Indisponível',
    } });
    for (const text of ['Indisponível', 'Galeria Indisponível', 'Falha ao consultar /n_noticias',
      'Falha ao consultar /a_avisos', 'Falha ao consultar /fotos_galeria', 'Falha de comunicação com a API']) {
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
    assert.equal((html.match(/Indisponível — sem integração oficial/g) || []).length, 8);
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
  };
  const totals: Record<string, number> = {
    n_noticias: 80, a_avisos: 90, fotos_galeria: 280, categorias_galeria: 12, g_estados: 27, usuarios: 120,
  };
  function json(value: unknown, status = 200) {
    return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
  }
  function serve(url: string, empty = false) {
    const endpoint = new URL(url, 'http://test').pathname.split('/').pop()!;
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
      assert.equal(queries.length, 6);
      assert.deepEqual(queries.map((url) => url.pathname.split('/').pop()).sort(), Object.keys(items).sort());
      assert.ok(!queries.some((url) => url.pathname === '/api/data'));
      for (const key of ['legacy', 'projectsCount', 'projectMunicipalities', 'bannersCount', 'faqsCount']) {
        assert.ok(!(key in metrics));
        assert.ok(!(key in state));
      }
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
          const expected = ['/admin/noticias', '/admin/projetos', '/admin/faq', '/admin/avisos', '/admin/banners',
            '/admin/galeria', '/admin/institucional', '/admin/redes', '/admin/estados-cidades', '/admin/usuarios'];
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
      for (const value of [metrics.totalUsers, metrics.totalNews, metrics.totalAvisos, metrics.totalFotos, metrics.totalCategorias, metrics.totalEstados]) {
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
      if (dependencies?.length === 1 && dependency && typeof dependency === 'object' &&
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
      assert.equal(requests.length, 6);
      assert.equal(new Set(requests).size, 6);
      assert.ok(!requests.some((url) => /perfis|a_tipos_aviso|canais_contato/.test(url)));
      await read(true);
      assert.equal(requests.length, 12);
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
        categorias_galeria: 'gallery', usuarios: 'users', g_estados: 'states' } as const;
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
            loadingAvisos: false, errorAvisos: state.avisos.error, loadingFotos: false, errorFotos: state.gallery.error },
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
            loadingAvisos: false, errorAvisos: state.avisos.error, loadingFotos: false, errorFotos: state.gallery.error },
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
