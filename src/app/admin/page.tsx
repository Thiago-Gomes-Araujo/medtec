'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useDialogFocus } from '@/components/useDialogFocus';
import SidebarNavItem from '@/components/admin/SidebarNavItem';
import DesktopSidebarContainer from '@/components/admin/DesktopSidebarContainer';
import MobileDrawerFooter from '@/components/admin/MobileDrawerFooter';
import SidebarFolderAccordion, { type NavFolderDef } from '@/components/admin/SidebarFolderAccordion';
import { useAdminTheme } from '@/components/admin/useAdminTheme';
import { filterAdminNavigation } from '@/lib/admin-navigation-filter';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Tv, 
  LogOut, 
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Search,
  Home,
  Info,
} from 'lucide-react';
import { useAdminOverview } from '@/components/admin/useAdminOverview';
import AdminOverview from '@/components/admin/AdminOverview';
import { getLegacyProjectsHref } from '@/lib/admin-projects';
import { getAdminStaticAlias } from '@/lib/admin-aliases';
import { useDuvidasPendentes } from '@/components/admin/useDuvidasPendentes';
import { useBannersTotal } from '@/components/admin/useBannersTotal';
import { useProjetosResumo } from '@/components/admin/useProjetosResumo';
import { canAccessBanners, canAccessDuvidas, canAccessProjetos, getRailsSessionFields, getLocalSessionFields } from '@/lib/admin-session';
import { getAdminEditorialDestination } from '@/lib/admin-auth-navigation';
import { buildAdminMenu, SECTION_CONFIG, SECTION_HREFS, type AdminSection } from '@/lib/admin-navigation';
import {
  medtecApi,
  clearStoredTokens,
} from '@/lib/api';

function getAdminNavigationIntent(params: URLSearchParams) {
  const tabParam = params.get('tab') || params.get('section');
  const staticHref = getAdminStaticAlias(tabParam);
  const projectsHref = getLegacyProjectsHref(params);
  let method: 'push' | 'replace' | 'select' | null = null;
  let target: string | null = null;

  if (staticHref && ['fotos', 'banners', 'duvidas', 'faq', 'usuarios', 'kanban'].includes(tabParam || '')) {
    method = 'replace';
    target = staticHref;
  } else if (projectsHref) {
    method = 'replace';
    target = projectsHref;
  } else if (tabParam === 'noticias') {
    const create = params.get('action') === 'new' || ['editor', 'new', 'nova'].includes(params.get('mode') || '');
    method = 'replace';
    target = create ? '/admin/noticias?action=new' : '/admin/noticias';
  } else if (staticHref && ['avisos', 'galeria', 'estadosCidades', 'siteInfo', 'redes', 'professores', 'alunos'].includes(tabParam || '')) {
    method = 'push';
    target = staticHref;
  } else if (tabParam && Object.prototype.hasOwnProperty.call(SECTION_CONFIG, tabParam)) {
    method = 'select';
    target = tabParam;
  }

  return { method, target };
}

function hasCanonicalAdminAlias(params: URLSearchParams): boolean {
  const { method } = getAdminNavigationIntent(params);
  return method === 'push' || method === 'replace';
}

function AdminAliasNavigation({ onSelectSection: handleSelectSection, onLoadData: loadData }: {
  onSelectSection: (section: AdminSection) => void;
  onLoadData: (isCurrent: () => boolean) => Promise<void>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { method, target } = getAdminNavigationIntent(new URLSearchParams(searchParams));
  const hasCanonicalAlias = method === 'push' || method === 'replace';

  // A decisão efetiva evita repetir navegação por parâmetros sem efeito no destino.
  // Montagens, reativações e mudanças de contexto continuam executando o efeito.
  useEffect(() => {
    if (typeof window === 'undefined' || !method || !target) return;
    if (method === 'select') handleSelectSection(target as AdminSection);
    else if (method === 'replace') router.replace(target);
    else router.push(target);
  }, [router, method, target, handleSelectSection]);

  useEffect(() => {
    // O destino canônico valida sua sessão e autorização. Início e aliases
    // desconhecidos retomam a validação desta página, sem disputar com o alias.
    if (hasCanonicalAlias) return;
    let active = true;
    const isCurrent = () => active && !hasCanonicalAdminAlias(new URLSearchParams(window.location.search));
    void loadData(isCurrent);
    return () => { active = false; };
  }, [loadData, hasCanonicalAlias]);

  return null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<AdminSection>('visaoGeral');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { dialogRef: mobileDrawerRef, overlayRef: mobileOverlayRef } = useDialogFocus(isMobileOpen, () => setIsMobileOpen(false));
  useEffect(() => {
    if (!isMobileOpen || typeof window.matchMedia !== 'function') return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setIsMobileOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [isMobileOpen]);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    publicacoes: false,
    aprovacao: false,
    dados: false,
    usuarios: false,
  });

  const getFolderIdForSection = useCallback((sec: AdminSection): string | null => {
    if (['noticias', 'avisos', 'fotos', 'galeria', 'projetos', 'projetosTemas', 'projetosMembros', 'duvidas', 'professores', 'professoresDisciplinas', 'professoresRelatos', 'alunos', 'alunosCategorias'].includes(sec)) return 'publicacoes';
    if (['kanban'].includes(sec)) return 'aprovacao';
    if (['siteInfo', 'redes'].includes(sec)) return 'dados';
    if (['usuarios'].includes(sec)) return 'usuarios';
    return null;
  }, []);

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => {
      const isFolderActive = getFolderIdForSection(currentSection) === folderId;
      const currentlyOpen = prev[folderId] ?? isFolderActive;
      return {
        ...prev,
        [folderId]: !currentlyOpen,
      };
    });
  };

  const handleSelectSection = useCallback((sec: AdminSection) => {
    const href = SECTION_HREFS.get(sec);
    if (href) {
      router.push(href);
      return;
    }
    setCurrentSection(sec);
    const activeFolder = getFolderIdForSection(sec);
    if (activeFolder) {
      setOpenFolders((prev) => ({ ...prev, [activeFolder]: true }));
    }
  }, [router, getFolderIdForSection]);

  const [userSession, setUserSession] = useState<{
    isGestor: boolean;
    username?: string;
    name?: string;
    profileType?: string;
    editorialProfile?: string;
  }>({ isGestor: false });

  // A sessão Rails confirma o perfil editorial; permissões de edição não aprovam notícias.
  const canAccessKanban = userSession.isGestor && userSession.editorialProfile === 'Administrador';
  const {
    latestNews, loadingNews, errorNews, totalNews,
    announcementTitle, loadingAvisos, errorAvisos, totalAvisos,
    loadingFotos, errorFotos, totalFotos, totalCategorias, totalEstados,
    loadingFaqs, errorFaqs, totalFaqs, apiFaqsPendingCount, apiFaqsPublishedCount,
    apiNewsPublishedCount, apiNewsDraftCount, apiAvisosAtivosCount, apiAvisosUrgentesCount,
    totalUsers, errorUsers, usersCountLabel,
    reload: loadOverview,
  } = useAdminOverview();

  // Sincronização do tema escuro
  const { isDark, toggleTheme } = useAdminTheme();

  // Carrega dados iniciais e verifica sessão
  const loadData = useCallback(async (isCurrent: () => boolean) => {
    await Promise.resolve();
    if (!isCurrent()) return;
    // Mantém a guarda também na carga: nenhum alias canônico consulta sessão
    // ou overview nesta página, inclusive se a URL mudar antes do microtask.
    if (hasCanonicalAdminAlias(new URLSearchParams(window.location.search))) return;
    try {
      let authenticated = false;
      let overviewAuthorized = false;

      // 1. Tenta validar token JWT na API Backend v1 (/auth/me)
      if (medtecApi.auth.isAuthenticated()) {
        try {
          const meRes = await medtecApi.auth.me();
          if (!isCurrent()) return;
          if (meRes.success && meRes.data) {
            authenticated = true;
            const { isGestor, username, name, profileType } = getRailsSessionFields(meRes.data);
            overviewAuthorized = isGestor;
            setIsLoggedIn(true);
            setUserSession({
              isGestor,
              username,
              name,
              profileType,
              editorialProfile: meRes.data.perfil_nome,
            });

            const destination = getAdminEditorialDestination(
              isGestor, profileType, new URLSearchParams(window.location.search),
            );
            if (destination) {
              if (destination.method === 'push') router.push(destination.href);
              else router.replace(destination.href);
              return;
            } else {
              setCurrentSection('visaoGeral');
            }
          }
        } catch (meErr) {
          if (!isCurrent()) return;
          console.warn('GET /auth/me falhou ou token expirou:', meErr);
        }
      }

      // 2. Fallback de sessão local caso o token ainda não exista
      if (!authenticated) {
        const authRes = await fetch('/api/auth');
        if (!isCurrent()) return;
        if (authRes.ok) {
          const authJson = await authRes.json();
          if (!isCurrent()) return;
          const { isGestor, username, name, profileType } = getLocalSessionFields(authJson);
          overviewAuthorized = isGestor;

          setIsLoggedIn(true);
          setUserSession({
            isGestor,
            username,
            name,
            profileType,
          });
          authenticated = true;

          const destination = getAdminEditorialDestination(
            isGestor, profileType, new URLSearchParams(window.location.search),
          );
          if (destination) {
            if (destination.method === 'push') router.push(destination.href);
            else router.replace(destination.href);
            return;
          } else {
            setCurrentSection('visaoGeral');
          }
        }
      }

      if (!authenticated) {
        setIsLoggedIn(false);
        router.push('/admin/login');
        return;
      }

      // A autenticação e os redirecionamentos acima continuam pertencendo à página.
      if (!isCurrent()) return;
      await loadOverview(overviewAuthorized);
    } catch (err) {
      if (!isCurrent()) return;
      console.error(err);
      router.push('/admin/login');
    }
  }, [router, loadOverview]);

  const handleLogout = async () => {
    try {
      await medtecApi.auth.logout();
    } catch (err) {
      console.warn('Erro ao chamar logout da API v1:', err);
    }
    clearStoredTokens();
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  // Permissões por Atribuição de Perfil
  const canAccessNews = userSession.isGestor || userSession.profileType === 'Editor de Notícias' || userSession.profileType === 'Operador de Conteúdo';
  const canAccessPhotos = canAccessBanners(userSession);
  const canAccessAnnouncements = userSession.isGestor || userSession.profileType === 'Publicador de Avisos' || userSession.profileType === 'Operador de Conteúdo';
  const canAccessGallery = userSession.isGestor || userSession.profileType === 'Curador de Fotos' || userSession.profileType === 'Operador de Conteúdo';
  const canAccessProjects = canAccessProjetos(userSession);
  const canAccessFaqs = canAccessDuvidas(userSession);
  // A sessão local não tem token, e o Gestor sai desta página: o AdminShell conta para ele.
  const canReadApiCounters = userSession.isGestor && medtecApi.auth.isAuthenticated();
  const duvidasPendentes = useDuvidasPendentes(canReadApiCounters);
  const projetosResumo = useProjetosResumo(canReadApiCounters);
  const bannersTotal = useBannersTotal(canReadApiCounters);
  const canAccessProfessores =
    userSession.isGestor ||
    userSession.profileType === 'Editor de Notícias' ||
    userSession.profileType === 'Operador de Conteúdo';
  const canAccessAlunos =
    userSession.isGestor ||
    userSession.profileType === 'Editor de Notícias' ||
    userSession.profileType === 'Operador de Conteúdo';
  const canAccessSocials = userSession.isGestor;
  const canAccessSiteInfo = userSession.isGestor;
  const canAccessUsers = userSession.isGestor;
  const canAccessEstados = userSession.isGestor;

  // Árvore de Navegação em Pastas Expansíveis (Didático - Estilo Accordion JOER SEDUC-RO)
  const folders: NavFolderDef[] = buildAdminMenu({
    noticias: canAccessNews,
    projetos: canAccessProjects,
    duvidas: canAccessFaqs,
    avisos: canAccessAnnouncements,
    fotos: canAccessPhotos,
    galeria: canAccessGallery,
    professores: canAccessProfessores,
    alunos: canAccessAlunos,
    kanban: canAccessKanban,
    siteInfo: canAccessSiteInfo,
    redes: canAccessSocials,
    estadosCidades: canAccessEstados,
    usuarios: canAccessUsers,
  }, {
    noticias: errorNews ? undefined : (loadingNews ? undefined : (totalNews ?? undefined)),
    avisos: errorAvisos ? undefined : (loadingAvisos ? undefined : (totalAvisos ?? undefined)),
    galeria: errorFotos ? undefined : (loadingFotos ? undefined : (totalFotos ?? undefined)),
    kanban: errorNews ? undefined : (loadingNews ? undefined : (apiNewsDraftCount !== null && apiNewsDraftCount > 0 ? apiNewsDraftCount : undefined)),
    estadosCidades: totalEstados !== null && totalEstados > 0 ? totalEstados : undefined,
    usuarios: errorUsers ? undefined : (totalUsers ?? undefined),
    duvidas: duvidasPendentes.count || undefined,
  });

  // Pesquisa Rápida da Sidebar (Filtro Instantâneo Didático)
  const { isSearching, homeMatchesSearch, filteredFolders, hasAnySearchResult } = filterAdminNavigation(folders, sidebarSearch);
  const aliasNavigation = (
    <Suspense fallback={null}>
      <AdminAliasNavigation onSelectSection={handleSelectSection} onLoadData={loadData} />
    </Suspense>
  );

  // Loading State
  if (!isLoggedIn) {
    return (
      <>
      {aliasNavigation}
      <div className="min-h-screen bg-[#07152B] flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-9 h-9 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-wide">MEDTEC Rondônia • SEDUC-RO</p>
          <p className="text-xs text-slate-400">Autenticando e carregando painel de gestão...</p>
        </div>
      </div>
      </>
    );
  }

  const currentConfig = SECTION_CONFIG[currentSection];

  return (
    <>
    {aliasNavigation}
    <div translate="no" className="notranslate h-screen h-[100dvh] w-full flex overflow-hidden bg-slate-50 dark:bg-[#060D1A] text-slate-800 dark:text-slate-100">
      
      {/* ========================================================
          1. SIDEBAR DESKTOP (FIXA E RETRÁTIL COM ACCORDION JOER)
      ======================================================== */}
      <DesktopSidebarContainer isCollapsed={isCollapsed}>
        {/* Topo da Sidebar: Identidade + Botão de Recolher */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#004A99] flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                <Tv className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-xs text-white tracking-tight truncate">
                  MEDTEC Rondônia
                </h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider truncate">
                  SEDUC-RO • Painel Gestor
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-[#004A99] flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              <Tv className="h-4 w-4" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition cursor-pointer"
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Campo de Pesquisa Rápida no Topo da Sidebar (Estilo JOER) */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Pesquisar função ou menu..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-slate-900/90 text-slate-100 placeholder-slate-400 border border-slate-700/70 focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition shadow-inner"
              />
              {sidebarSearch && (
                <button
                  type="button"
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Corpo Navegável com Árvore Expansível (Accordion) */}
        <div className="flex-1 min-h-0 overflow-y-auto py-3 px-3 space-y-3 scrollbar-thin">
          {/* 1. Início (Resumo do Painel) - Item Direto no Topo */}
          {userSession.isGestor && homeMatchesSearch && (
            <div className="space-y-1">
              <SidebarNavItem
                label="Início (Resumo do Painel)"
                icon={Home}
                tooltip="Visão geral e atalhos rápidos do painel"
                isActive={currentSection === 'visaoGeral'}
                isCollapsed={isCollapsed}
                onClick={() => handleSelectSection('visaoGeral')}
              />
            </div>
          )}

          {/* 2. Pastas / Módulos Expansíveis (Accordion) */}
          {filteredFolders.map((folder) => {
            const isFolderActive = getFolderIdForSection(currentSection) === folder.id;
            const isOpen = isSearching ? true : (openFolders[folder.id] ?? isFolderActive);
            return (
              <SidebarFolderAccordion
                key={folder.id}
                folder={folder}
                isOpen={isOpen}
                isFolderActive={isFolderActive}
                currentSection={currentSection}
                isCollapsed={isCollapsed}
                onToggle={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  toggleFolder(folder.id);
                }}
                onSelectSection={(sec) => handleSelectSection(sec)}
              />
            );
          })}

          {/* Mensagem quando a pesquisa rápida não encontrar resultados */}
          {!hasAnySearchResult && (
            <div className="px-2 py-6 text-center text-xs text-slate-400 space-y-2">
              <p className="leading-snug">
                Nenhuma função encontrada para &ldquo;<strong className="text-white">{sidebarSearch}</strong>&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSidebarSearch('')}
                className="text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer text-xs"
              >
                Limpar pesquisa
              </button>
            </div>
          )}
        </div>

        {/* Rodapé Fixo da Sidebar: Link Público + Usuário Autenticado */}
        <div className="shrink-0 border-t border-slate-800/80 p-3 space-y-2 bg-[#051021]">
          {/* Link para o Portal */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver Portal Público"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs transition ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Ver Portal Público</span>}
          </Link>

          {/* Card do Usuário Logado */}
          <div className={`pt-2 border-t border-slate-800/60 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-slate-800 text-sky-300 border border-slate-700/80 flex items-center justify-center text-xs font-bold shrink-0">
                {(userSession.name || userSession.username || 'AD').substring(0, 2).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {userSession.name || userSession.username || 'Administrador'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight">
                    {userSession.isGestor ? 'Gestor Geral' : (userSession.profileType || 'Operador')}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Encerrar Sessão"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-950/30 transition cursor-pointer shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DesktopSidebarContainer>

      {/* ========================================================
          2. GAVETA MOBILE (OFF-CANVAS PARA TELAS < LG COM ACCORDION)
      ======================================================== */}
      {isMobileOpen && (
        <div ref={mobileOverlayRef} className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div ref={mobileDrawerRef} role="dialog" aria-modal="true" aria-label="Navegação administrativa" tabIndex={-1} className="fixed inset-y-0 left-0 w-72 h-full h-[100dvh] bg-[#07152B] text-slate-200 border-r border-slate-800 flex flex-col z-50 shadow-2xl">
            <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#004A99] flex items-center justify-center text-white font-bold">
                  <Tv className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-xs text-white">MEDTEC Rondônia</h2>
                  <p className="text-[10px] text-slate-400 font-mono">SEDUC-RO • Painel Gestor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Fechar menu lateral"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Campo de Pesquisa Mobile */}
            <div className="px-3 pt-3 pb-1 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Pesquisar função ou menu..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-slate-900/90 text-slate-100 placeholder-slate-400 border border-slate-700/70 focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition shadow-inner"
                />
                {sidebarSearch && (
                  <button
                    type="button"
                    onClick={() => setSidebarSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                    title="Limpar pesquisa"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Lista Mobile com Accordion */}
            <div className="flex-1 min-h-0 overflow-y-auto py-3 px-3 space-y-3 scrollbar-thin">
              {userSession.isGestor && homeMatchesSearch && (
                <div className="space-y-1">
                  <SidebarNavItem
                    label="Início (Resumo do Painel)"
                    icon={Home}
                    tooltip="Visão geral e atalhos rápidos do painel"
                    isActive={currentSection === 'visaoGeral'}
                    isCollapsed={false}
                    onClick={() => {
                      handleSelectSection('visaoGeral');
                      setIsMobileOpen(false);
                    }}
                  />
                </div>
              )}

              {filteredFolders.map((folder) => {
                const isFolderActive = getFolderIdForSection(currentSection) === folder.id;
                const isOpen = isSearching ? true : (openFolders[folder.id] ?? isFolderActive);
                return (
                  <SidebarFolderAccordion
                    key={folder.id}
                    folder={folder}
                    isOpen={isOpen}
                    isFolderActive={isFolderActive}
                    currentSection={currentSection}
                    isCollapsed={false}
                    onToggle={() => toggleFolder(folder.id)}
                    onSelectSection={(sec) => {
                      handleSelectSection(sec);
                      setIsMobileOpen(false);
                    }}
                  />
                );
              })}

              {!hasAnySearchResult && (
                <div className="px-2 py-6 text-center text-xs text-slate-400 space-y-2">
                  <p className="leading-snug">
                    Nenhuma função encontrada para &ldquo;<strong className="text-white">{sidebarSearch}</strong>&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSidebarSearch('')}
                    className="text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer text-xs"
                  >
                    Limpar pesquisa
                  </button>
                </div>
              )}
            </div>

            <MobileDrawerFooter
              userName={userSession.name || userSession.username}
              roleLabel={userSession.isGestor ? 'Gestor Geral' : (userSession.profileType || 'Operador')}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* ========================================================
          3. ÁREA DE TRABALHO PRINCIPAL
      ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden relative">
        
        {/* TOPBAR CONTEXTUAL STICKY */}
        <header className="h-16 sticky top-0 z-20 shrink-0 bg-white/95 dark:bg-[#0B1528]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Esquerda: Botão Menu Mobile + Breadcrumb + Subtítulo */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="hidden sm:inline">Painel Gestor</span>
                <ChevronRight className="h-3.5 w-3.5 hidden sm:inline text-slate-400" />
                <span className="hidden md:inline">{currentConfig.group}</span>
                <ChevronRight className="h-3.5 w-3.5 hidden md:inline text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-white truncate">
                  {currentConfig.title}
                </span>
              </nav>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xl hidden sm:block">
                {currentConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Direita: Ações Globais (Tema + Botão Salvar Primário apenas em módulos editáveis) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Alternador de Tema Claro/Escuro */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              className="inline-flex min-h-11 min-w-11 lg:min-h-0 lg:min-w-0 items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* ========================================================
            4. CORPO DO CONTEÚDO (MÓDULO ATIVO)
        ======================================================== */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 space-y-6 pb-20">
          
          {/* Barra de Topo do Módulo com Botão "← Voltar para o Início" */}
          {currentSection !== 'visaoGeral' && userSession.isGestor && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentSection('visaoGeral')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#004A99] dark:hover:text-sky-400 transition shadow-xs cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                <span>Voltar para o Início</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>{SECTION_CONFIG[currentSection].group}</span>
                <span>•</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{SECTION_CONFIG[currentSection].title}</span>
              </div>
            </div>
          )}

          {/* Guia Visual Didático ("O que esta tela faz?") no Topo de Cada Módulo Aberto */}
          {currentSection !== 'visaoGeral' && (
            <div className="flex items-start sm:items-center gap-3 p-3.5 rounded-xl bg-blue-50/80 dark:bg-[#08182F] border border-blue-200/80 dark:border-blue-900/60 text-slate-700 dark:text-slate-200 text-xs shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-[#004A99] dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Info className="h-4 w-4" />
              </div>
              <p className="flex-1 leading-relaxed">
                <strong className="font-bold text-slate-900 dark:text-white mr-1.5">O que esta tela faz:</strong>
                {SECTION_CONFIG[currentSection].subtitle}
              </p>
            </div>
          )}

          {/* ========================================================
              VISÃO PRINCIPAL: PAINEL DO GESTOR (HUB DE MÓDULOS)
          ======================================================== */}
          {currentSection === 'visaoGeral' && userSession.isGestor && (
            <AdminOverview
              indicators={{
                loadingNews, errorNews, totalNews, apiNewsPublishedCount, apiNewsDraftCount,
                loadingAvisos, errorAvisos, totalAvisos,
                apiAvisosAtivosCount, apiAvisosUrgentesCount, loadingFotos, errorFotos,
                totalFotos, totalCategorias,
                loadingFaqs, errorFaqs, totalFaqs, apiFaqsPendingCount, apiFaqsPublishedCount,
                usersCountLabel,
              }}
              userName={userSession.name || userSession.username}
              latestNews={latestNews}
              announcementTitle={announcementTitle}
              canAccessKanban={canAccessKanban}
              duvidasPendentes={canReadApiCounters ? duvidasPendentes : undefined}
              projetosResumo={canReadApiCounters ? projetosResumo : undefined}
              bannersTotal={canReadApiCounters ? bannersTotal : undefined}
              onOpenNews={() => router.push('/admin/noticias')}
              onCreateNews={() => router.push('/admin/noticias?action=new')}
              onOpenKanban={() => router.push('/admin/kanban')}
            />
          )}

        </main>
      </div>

    </div>
    </>
  );
}
