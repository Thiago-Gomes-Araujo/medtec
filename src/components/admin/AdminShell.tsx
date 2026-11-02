'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useAdminTheme } from '@/components/admin/useAdminTheme';
import { useDuvidasPendentes } from '@/components/admin/useDuvidasPendentes';
import { useAprovacoesPendentes } from '@/components/admin/useAprovacoesPendentes';
import { useProjetosPendentes } from '@/components/admin/useProjetosPendentes';
import { useRelatosPendentes } from '@/components/admin/useRelatosPendentes';
import DesktopSidebarContainer from '@/components/admin/DesktopSidebarContainer';
import MobileDrawerFooter from '@/components/admin/MobileDrawerFooter';
import { filterAdminNavigation } from '@/lib/admin-navigation-filter';
import { useRouter, usePathname } from 'next/navigation';
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
  ChevronDown,
  ArrowLeft,
  Search,
  Home,
  Info,
  Lock,
} from 'lucide-react';
import { medtecApi, clearStoredTokens, fetchWithTimeout, isConnectionFailure, isTimeoutError, type AuthUser } from '@/lib/api';
import AdminSessionError from '@/components/admin/AdminSessionError';
import { canAccessBanners, canAccessDuvidas, canAccessProjetos, getRailsSessionFields, getLocalSessionFields } from '@/lib/admin-session';
import { getAdminLoginHref } from '@/lib/admin-auth-navigation';
import { AdminPreviewModal, PreviewContentType, PreviewItemData } from '@/components/AdminLiveSimulator';
import { buildAdminMenu, getActiveMenuSection, getFolderIdForSection, PENDING_BADGE_SECTIONS, SECTION_CONFIG, type AdminSection } from '@/lib/admin-navigation';
import { adminPrimaryButtonClass, sidebarBadgeClass, sidebarFolderClass, sidebarIconButtonClass, sidebarIconClass, sidebarItemClass, sidebarPortalLinkClass, sidebarSearchInputClass } from '@/components/admin/adminTheme';

export { getFolderIdForSection, SECTION_CONFIG, type AdminSection } from '@/lib/admin-navigation';

export interface AdminSession {
  isGestor: boolean;
  username?: string;
  role?: string;
  name?: string;
  profileType?: string;
  apiUser?: AuthUser;
}

// O contrato Rails documenta Administrador como perfil com todas as permissões.
// A sessão local e as heurísticas por ID não autorizam gestão de contas.
export function canAccessAdminUsers(session: Pick<AdminSession, 'isGestor' | 'apiUser'>): boolean {
  return session.isGestor && session.apiUser?.ativo === true &&
    session.apiUser.perfil_nome === 'Administrador';
}

export interface AdminShellProps {
  children: React.ReactNode | ((session: AdminSession) => React.ReactNode);
  activeSection?: AdminSection;
  badges?: Partial<Record<AdminSection, number | string>>;
  previewModalState?: {
    isOpen: boolean;
    type: PreviewContentType;
    data: PreviewItemData;
  };
  setPreviewModalState?: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      type: PreviewContentType;
      data: PreviewItemData;
    }>
  >;
}

export default function AdminShell({
  children,
  activeSection = 'visaoGeral',
  badges = {},
  previewModalState,
  setPreviewModalState,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Estados de Interface do Shell
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  // O menu abre inteiro: quem usa pouco o painel vê todas as opções de uma vez.
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ conteudo: true, atendimento: true, configuracoes: true });

  // Estado de Autenticação / Sessão
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const [authAttempt, setAuthAttempt] = useState(0);
  const [userSession, setUserSession] = useState<AdminSession>({ isGestor: false });

  // Sincronização do tema escuro
  const { isDark, toggleTheme } = useAdminTheme();

  // Rota oculta pelo Activity volta em carregamento até a sessão ser revalidada.
  useLayoutEffect(() => () => { setLoadingAuth(true); }, []);

  // Verificação de sessão
  useEffect(() => {
    // O cleanup invalida somente este setup, inclusive após ocultar e reativar.
    let active = true;
    const verifyAuth = async () => {
      let sessionUnreachable = false;
      try {
        let authenticated = false;

        // 1. Tenta validar token JWT na API Backend v1 (/auth/me)
        if (medtecApi.auth.isAuthenticated()) {
          try {
            const meRes = await medtecApi.auth.me();
            if (!active) return;
            if (meRes.success && meRes.data) {
              authenticated = true;
              const { isGestor, username, name, profileType } = getRailsSessionFields(meRes.data);
              setIsLoggedIn(true);
              setUserSession({
                isGestor,
                username,
                role: meRes.data.perfil_nome,
                name,
                profileType,
                apiUser: meRes.data,
              });
            }
          } catch (meErr) {
            if (!active) return;
            console.warn('AdminShell: GET /auth/me falhou ou token expirou:', meErr);
          }
        }

        // 2. Fallback de sessão local
        if (!authenticated) {
          const authRes = await fetchWithTimeout('/api/auth').catch((cause: unknown) => {
            sessionUnreachable = isConnectionFailure(cause);
            throw cause;
          });
          if (!active) return;
          if (authRes.ok) {
            const authJson = await authRes.json();
            if (!active) return;
            const { isGestor, username, name, profileType } = getLocalSessionFields(authJson);
            setIsLoggedIn(true);
            setUserSession({
              isGestor,
              username,
              role: authJson.role,
              name,
              profileType,
            });
            authenticated = true;
          }
        }

        setAuthFailed(false);
        if (!authenticated) {
          setIsLoggedIn(false);
          router.push(getAdminLoginHref(pathname || '/admin', window.location.search));
        }
      } catch (err) {
        if (!active) return;
        console.error('AdminShell: Erro ao verificar autenticação:', err);
        // Sem resposta do servidor, a navegação para o login também ficaria presa no carregamento.
        if (sessionUnreachable || isTimeoutError(err)) {
          setIsLoggedIn(false);
          setAuthFailed(true);
        } else {
          router.push('/admin/login');
        }
      } finally {
        if (active) setLoadingAuth(false);
      }
    };

    void verifyAuth();
    return () => { active = false; };
  }, [router, pathname, authAttempt]);

  // Fecha o drawer mobile ao mudar de rota
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileOpen(false);
  }

  const handleLogout = async () => {
    try {
      await medtecApi.auth.logout();
    } catch (err) {
      console.warn('AdminShell: Erro ao chamar logout da API v1:', err);
    }
    clearStoredTokens();
    try {
      await fetchWithTimeout('/api/auth', { method: 'DELETE' });
    } catch (err) {
      console.warn('AdminShell: Erro ao encerrar a sessão local:', err);
    }
    router.push('/admin/login');
  };

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => {
      const isFolderActive = getFolderIdForSection(activeSection) === folderId;
      const currentlyOpen = prev[folderId] ?? isFolderActive;
      return {
        ...prev,
        [folderId]: !currentlyOpen,
      };
    });
  };

  // Permissões por perfil
  const canAccessNews =
    userSession.profileType === 'Gestor' ||
    userSession.isGestor ||
    userSession.profileType === 'Editor de Notícias' ||
    userSession.profileType === 'Operador de Conteúdo';
  const canAccessPhotos = canAccessBanners(userSession);
  const canAccessAnnouncements =
    userSession.isGestor ||
    userSession.profileType === 'Publicador de Avisos' ||
    userSession.profileType === 'Operador de Conteúdo';
  const canAccessGallery =
    userSession.isGestor ||
    userSession.profileType === 'Curador de Fotos' ||
    userSession.profileType === 'Operador de Conteúdo';
  const canAccessProjects = canAccessProjetos(userSession);
  const canAccessFaqs = canAccessDuvidas(userSession);
  // A sessão local não tem token: a consulta só devolveria 401.
  const duvidasPendentes = useDuvidasPendentes(canAccessFaqs && !!userSession.apiUser);
  const canAccessProfessores =
    userSession.isGestor ||
    userSession.profileType === 'Operador de Conteúdo' ||
    userSession.profileType === 'Editor de Notícias';
  const relatosPendentes = useRelatosPendentes(canAccessProfessores && !!userSession.apiUser);
  const canAccessAlunos =
    userSession.isGestor ||
    userSession.profileType === 'Operador de Conteúdo' ||
    userSession.profileType === 'Editor de Notícias';
  const canAccessSocials = userSession.isGestor;
  const canAccessSiteInfo = userSession.isGestor;
  const canAccessKanban = userSession.isGestor && userSession.apiUser?.perfil_nome === 'Administrador';
  // Quem tem a Fila vê o total; quem só aprova projetos vê os projetos.
  const aprovacoesPendentes = useAprovacoesPendentes(canAccessKanban);
  const projetosPendentes = useProjetosPendentes(canAccessProjects && !canAccessKanban && !!userSession.apiUser);
  const canAccessUsers = canAccessAdminUsers(userSession);
  const canAccessEstados = userSession.isGestor;

  // Definição da Árvore de Pastas da Sidebar
  const folders = buildAdminMenu({
    noticias: canAccessNews,
    projetos: canAccessProjects,
    duvidas: canAccessFaqs,
    avisos: canAccessAnnouncements,
    fotos: canAccessPhotos,
    galeria: canAccessGallery,
    professores: canAccessProfessores,
    alunos: canAccessAlunos,
    kanban: canAccessKanban,
    redes: canAccessSocials,
    estadosCidades: canAccessEstados,
    usuarios: canAccessUsers,
  }, { duvidasPublico: duvidasPendentes.count || undefined, kanban: aprovacoesPendentes.count || undefined, projetosAprovacao: projetosPendentes.count || undefined, professores: relatosPendentes.count || undefined, ...badges });

  // Pesquisa rápida da Sidebar
  const { isSearching, homeMatchesSearch, filteredFolders, hasAnySearchResult } = filterAdminNavigation(folders, sidebarSearch);
  const activeMenuSection = getActiveMenuSection(activeSection, folders);

  if (authFailed && !isLoggedIn && !loadingAuth) {
    return (
      <AdminSessionError
        onRetry={() => {
          setAuthFailed(false);
          setLoadingAuth(true);
          setAuthAttempt((attempt) => attempt + 1);
        }}
      />
    );
  }

  // Tela de carregamento enquanto valida sessão
  if (loadingAuth || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-admin-bg flex flex-col items-center justify-center space-y-4 text-admin-text">
        <div className="w-9 h-9 border-2 border-admin-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-wide">MEDTEC Rondônia • SEDUC-RO</p>
          <p className="text-xs text-admin-muted">Autenticando e carregando painel de gestão...</p>
        </div>
      </div>
    );
  }

  // Verificação de autorização para a seção ativa
  const isAuthorized =
    activeSection === 'visaoGeral'
      ? userSession.isGestor
      : activeSection === 'avisos'
      ? canAccessAnnouncements
      : activeSection === 'noticias'
      ? typeof children === 'function' || canAccessNews
      : activeSection === 'fotos'
      ? canAccessPhotos
      : activeSection === 'galeria'
      ? canAccessGallery
      : activeSection === 'projetos' || activeSection === 'projetosTemas' || activeSection === 'projetosMembros' || activeSection === 'projetosAprovacao'
      ? canAccessProjects
      : activeSection === 'duvidas' || activeSection === 'duvidasPublico'
      ? canAccessFaqs
      : activeSection === 'siteInfo'
      ? canAccessSiteInfo
      : activeSection === 'redes'
      ? canAccessSocials
      : activeSection === 'kanban'
      ? canAccessKanban
      : activeSection === 'usuarios'
      ? canAccessUsers
      : activeSection === 'estadosCidades'
      ? canAccessEstados
      : activeSection === 'professores' || activeSection === 'professoresDisciplinas' || activeSection === 'professoresRelatos'
      ? canAccessProfessores
      : activeSection === 'alunos' || activeSection === 'alunosCategorias'
      ? canAccessAlunos
      : true;

  const currentConfig = SECTION_CONFIG[activeSection] || SECTION_CONFIG.visaoGeral;

  return (
    <div
      translate="no"
      className="notranslate h-screen h-[100dvh] w-full flex overflow-hidden bg-admin-bg text-admin-text"
    >
      {/* ========================================================
          1. SIDEBAR DESKTOP (FIXA E RETRÁTIL COM ACCORDION JOER)
      ======================================================== */}
      <DesktopSidebarContainer isCollapsed={isCollapsed}>
        {/* Topo da Sidebar: Identidade + Botão de Recolher */}
        <div className="h-16 px-4 border-b border-admin-border flex items-center justify-between shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-admin-accent flex items-center justify-center text-admin-accent-fg font-bold shrink-0">
                <Tv className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm text-admin-text tracking-tight truncate">
                  MEDTEC Rondônia
                </h1>
                <p className="text-[11px] text-admin-muted truncate">
                  Painel de gestão
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-admin-accent flex items-center justify-center text-admin-accent-fg font-bold shrink-0">
              <Tv className="h-4 w-4" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            aria-expanded={!isCollapsed}
            className={sidebarIconButtonClass}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Campo de Pesquisa Rápida */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-muted pointer-events-none" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Buscar no menu..."
                aria-label="Pesquisar no menu"
                className={sidebarSearchInputClass}
              />
              {sidebarSearch && (
                <button
                  type="button"
                  onClick={() => setSidebarSearch('')}
                  aria-label="Limpar pesquisa"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-admin-muted hover:text-admin-text p-0.5 rounded cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Corpo Navegável com Árvore Expansível */}
        <nav aria-label="Menu do painel" className="flex-1 min-h-0 overflow-y-auto py-3 px-3 space-y-4 scrollbar-thin">
          {/* 1. Início */}
          {userSession.isGestor && homeMatchesSearch && (
            <div className="space-y-1">
              <Link
                href="/admin"
                title={isCollapsed ? 'Início' : 'Resumo do site e atalhos'}
                aria-label={isCollapsed ? 'Início' : undefined}
                aria-current={activeSection === 'visaoGeral' ? 'page' : undefined}
                className={`${sidebarItemClass(activeSection === 'visaoGeral')} ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Home className={sidebarIconClass(activeSection === 'visaoGeral')} />
                {!isCollapsed && <span className="text-left flex-1">Início</span>}
              </Link>
            </div>
          )}

          {/* 2. Grupos do menu */}
          {filteredFolders.map((folder) => {
            const isFolderActive = getFolderIdForSection(activeSection) === folder.id;
            const isOpen = isSearching ? true : (openFolders[folder.id] ?? isFolderActive);

            if (isCollapsed) {
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => {
                    setIsCollapsed(false);
                    setOpenFolders((prev) => ({ ...prev, [folder.id]: true }));
                  }}
                  title={folder.label}
                  aria-label={folder.label}
                  className={`${sidebarItemClass(isFolderActive)} justify-center px-2`}
                >
                  <folder.icon className={sidebarIconClass(isFolderActive)} />
                </button>
              );
            }

            return (
              <div key={folder.id} className="space-y-0.5">
                <button type="button" onClick={() => toggleFolder(folder.id)} aria-expanded={isOpen} className={sidebarFolderClass}>
                  <span className="text-left">{folder.label}</span>
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="space-y-0.5">
                    {folder.items.map((item) => {
                      const isItemActive = activeMenuSection === item.section;
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.section}
                          href={item.href}
                          title={item.tooltip}
                          aria-current={isItemActive ? 'page' : undefined}
                          className={sidebarItemClass(isItemActive)}
                        >
                          <ItemIcon className={sidebarIconClass(isItemActive)} />
                          <span className="text-left flex-1">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className={sidebarBadgeClass(isItemActive, PENDING_BADGE_SECTIONS.has(item.section))}>{item.badge}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {!hasAnySearchResult && (
            <div className="px-2 py-6 text-center text-xs text-admin-muted space-y-2">
              <p className="leading-snug">
                Nada encontrado para &ldquo;<strong className="text-admin-text">{sidebarSearch}</strong>&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSidebarSearch('')}
                className="text-admin-accent font-semibold underline cursor-pointer text-xs"
              >
                Limpar pesquisa
              </button>
            </div>
          )}
        </nav>

        {/* Rodapé Fixo da Sidebar */}
        <div className="shrink-0 border-t border-admin-border p-3 space-y-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver o site"
            aria-label={isCollapsed ? 'Ver o site' : undefined}
            className={`${sidebarPortalLinkClass} ${isCollapsed ? 'justify-center px-1' : ''}`}
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>Ver o site</span>}
          </Link>

          <div
            className={`pt-2 border-t border-admin-border flex items-center justify-between gap-2 ${
              isCollapsed ? 'flex-col' : ''
            }`}
          >
            {!isCollapsed ? (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-admin-text truncate">
                  {userSession.name || userSession.username}
                </p>
                <p className="text-[11px] text-admin-muted truncate">
                  {userSession.isGestor ? 'Gestor Geral' : userSession.profileType || 'Operador'}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              title="Sair do painel"
              aria-label="Sair do painel"
              className={`${sidebarIconButtonClass} shrink-0`}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DesktopSidebarContainer>

      {/* ========================================================
          2. DRAWER MOBILE
      ======================================================== */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-admin-surface text-admin-text flex flex-col h-full z-10 shadow-2xl">
            <div className="h-16 px-4 border-b border-admin-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-admin-accent flex items-center justify-center text-admin-accent-fg font-bold">
                  <Tv className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="font-bold text-sm text-admin-text">MEDTEC Rondônia</h1>
                  <p className="text-[11px] text-admin-muted">Painel de gestão</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Fechar menu lateral"
                className={`${sidebarIconButtonClass} inline-flex min-h-11 min-w-11 items-center justify-center`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-3 pt-3 pb-1 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-muted pointer-events-none" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Buscar no menu..."
                  aria-label="Pesquisar no menu"
                  className={sidebarSearchInputClass}
                />
              </div>
            </div>

            <nav aria-label="Menu do painel" className="flex-1 overflow-y-auto p-3 space-y-4">
              {userSession.isGestor && homeMatchesSearch && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileOpen(false)}
                  aria-current={activeSection === 'visaoGeral' ? 'page' : undefined}
                  className={sidebarItemClass(activeSection === 'visaoGeral')}
                >
                  <Home className={sidebarIconClass(activeSection === 'visaoGeral')} />
                  <span>Início</span>
                </Link>
              )}

              {filteredFolders.map((folder) => (
                <div key={folder.id} className="space-y-0.5">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-admin-muted">
                    {folder.label}
                  </div>
                  <div className="space-y-0.5">
                    {folder.items.map((item) => {
                      const isItemActive = activeMenuSection === item.section;
                      return (
                        <Link
                          key={item.section}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          aria-current={isItemActive ? 'page' : undefined}
                          className={sidebarItemClass(isItemActive)}
                        >
                          <item.icon className={sidebarIconClass(isItemActive)} />
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className={sidebarBadgeClass(isItemActive, PENDING_BADGE_SECTIONS.has(item.section))}>{item.badge}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!hasAnySearchResult && (
                <div className="px-2 py-6 text-center text-xs text-admin-muted space-y-2">
                  <p className="leading-snug">
                    Nada encontrado para &ldquo;<strong className="text-admin-text">{sidebarSearch}</strong>&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSidebarSearch('')}
                    className="text-admin-accent font-semibold underline cursor-pointer text-xs"
                  >
                    Limpar pesquisa
                  </button>
                </div>
              )}
            </nav>

            <MobileDrawerFooter
              userName={userSession.name || userSession.username}
              roleLabel={userSession.isGestor ? 'Gestor Geral' : userSession.profileType || 'Operador'}
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
        <header className="h-16 sticky top-0 z-20 shrink-0 bg-admin-surface border-b border-admin-border px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-admin-muted hover:bg-admin-surface-muted cursor-pointer"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <nav aria-label="Você está em" className="flex items-center gap-1.5 text-xs font-medium text-admin-muted">
                <span className="hidden sm:inline">Painel</span>
                <ChevronRight className="h-3.5 w-3.5 hidden sm:inline" />
                {currentConfig.group !== currentConfig.title && (
                  <>
                    <span className="hidden md:inline">{currentConfig.group}</span>
                    <ChevronRight className="h-3.5 w-3.5 hidden md:inline" />
                  </>
                )}
                <span className="font-semibold text-admin-text truncate">
                  {currentConfig.title}
                </span>
              </nav>
              <p className="text-[11px] text-admin-muted truncate max-w-xl hidden sm:block">
                {currentConfig.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              className="p-2 rounded-lg border border-admin-border text-admin-muted hover:bg-admin-surface-muted transition cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* ========================================================
            4. CORPO DO CONTEÚDO
        ======================================================== */}
        <main id="conteudo-principal" className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 space-y-6 pb-20">
          {/* Barra de Topo do Módulo com Botão "← Voltar para o Início" */}
          {activeSection !== 'visaoGeral' && userSession.isGestor && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-admin-border">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-admin-text bg-admin-surface border border-admin-border hover:bg-admin-surface-muted transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-admin-muted" />
                <span>Voltar para o Início</span>
              </Link>

              <div className="flex items-center gap-2 text-xs font-semibold text-admin-muted">
                <span>{currentConfig.group}</span>
                <span>•</span>
                <span className="text-admin-text font-bold">{currentConfig.title}</span>
              </div>
            </div>
          )}

          {/* Guia Visual Didático ("O que esta tela faz?") */}
          {activeSection !== 'visaoGeral' && (
            <div className="flex items-start sm:items-center gap-3 p-3.5 rounded-xl bg-admin-surface border border-admin-border text-admin-text text-xs">
              <div className="w-6 h-6 rounded-lg text-admin-muted flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Info className="h-4 w-4" />
              </div>
              <p className="flex-1 leading-relaxed">
                <strong className="font-bold text-admin-text mr-1.5">O que esta tela faz:</strong>
                {currentConfig.subtitle}
              </p>
            </div>
          )}

          {/* Renderização Condicional: Acesso Permitido vs Restrito */}
          {isAuthorized ? (
            typeof children === 'function' ? children(userSession) : children
          ) : (
            <div className="p-12 text-center space-y-4 rounded-2xl bg-admin-surface border border-admin-border">
              <div className="w-12 h-12 mx-auto rounded-full bg-admin-danger-soft text-admin-danger flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-admin-text">Acesso Restrito</h2>
              <p className="text-xs text-admin-muted max-w-md mx-auto">
                Seu perfil de acesso ({userSession.profileType || 'Operador'}) não possui permissão para visualizar ou gerenciar este módulo.
              </p>
              <Link
                href="/admin"
                className={adminPrimaryButtonClass}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar ao Painel Geral</span>
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Modal Global de Pré-visualização Fiel */}
      {previewModalState && setPreviewModalState && (
        <AdminPreviewModal
          isOpen={previewModalState.isOpen}
          onClose={() => setPreviewModalState((prev) => ({ ...prev, isOpen: false }))}
          type={previewModalState.type}
          data={previewModalState.data}
        />
      )}
    </div>
  );
}
