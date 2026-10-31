'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '@/components/admin/useAdminTheme';
import DesktopSidebarContainer from '@/components/admin/DesktopSidebarContainer';
import MobileDrawerFooter from '@/components/admin/MobileDrawerFooter';
import { filterAdminNavigation } from '@/lib/admin-navigation-filter';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Tv,
  Newspaper,
  Share2,
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
  FolderKanban,
  Megaphone,
  Presentation,
  Images,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  BarChart3,
  UsersRound,
  UserCog,
  Info,
  Lightbulb,
  MapPin,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { medtecApi, clearStoredTokens, type AuthUser } from '@/lib/api';
import { getRailsSessionFields, getLocalSessionFields } from '@/lib/admin-session';
import { getAdminLoginHref } from '@/lib/admin-auth-navigation';
import { AdminPreviewModal, PreviewContentType, PreviewItemData } from '@/components/AdminLiveSimulator';
import { SECTION_CONFIG, type AdminSection } from '@/lib/admin-navigation';

export { SECTION_CONFIG, type AdminSection } from '@/lib/admin-navigation';

export function getFolderIdForSection(sec: AdminSection): string | null {
  if (['noticias', 'avisos', 'fotos', 'galeria', 'projetos', 'duvidas'].includes(sec)) return 'publicacoes';
  if (['kanban'].includes(sec)) return 'aprovacao';
  if (['siteInfo', 'redes', 'estadosCidades'].includes(sec)) return 'dados';
  if (['usuarios'].includes(sec)) return 'usuarios';
  return null;
}

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
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => {
    const activeFolder = getFolderIdForSection(activeSection);
    return {
      publicacoes: true, // Garante que a pasta de publicações esteja expandida na subrota
      aprovacao: activeFolder === 'aprovacao',
      dados: activeFolder === 'dados',
      usuarios: activeFolder === 'usuarios',
    };
  });

  // Estado de Autenticação / Sessão
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userSession, setUserSession] = useState<AdminSession>({ isGestor: false });

  // Sincronização do tema escuro
  const { isDark, toggleTheme } = useAdminTheme();

  // Verificação de sessão
  const checkAuth = useCallback(async (isCurrent: () => boolean) => {
    if (!isCurrent()) return;
    setLoadingAuth(true);
    try {
      let authenticated = false;

      // 1. Tenta validar token JWT na API Backend v1 (/auth/me)
      if (medtecApi.auth.isAuthenticated()) {
        try {
          const meRes = await medtecApi.auth.me();
          if (!isCurrent()) return;
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
          if (!isCurrent()) return;
          console.warn('AdminShell: GET /auth/me falhou ou token expirou:', meErr);
        }
      }

      // 2. Fallback de sessão local
      if (!authenticated) {
        const authRes = await fetch('/api/auth');
        if (!isCurrent()) return;
        if (authRes.ok) {
          const authJson = await authRes.json();
          if (!isCurrent()) return;
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

      if (!authenticated) {
        setIsLoggedIn(false);
        router.push(getAdminLoginHref(pathname || '/admin', window.location.search));
      }
    } catch (err) {
      if (!isCurrent()) return;
      console.error('AdminShell: Erro ao verificar autenticação:', err);
      router.push('/admin/login');
    } finally {
      if (isCurrent()) setLoadingAuth(false);
    }
  }, [router, pathname]);

  useEffect(() => {
    // O cleanup invalida somente este setup, inclusive após ocultar e reativar.
    let active = true;
    void checkAuth(() => active);
    return () => { active = false; };
  }, [checkAuth]);

  // Fecha o drawer mobile ao mudar de rota
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await medtecApi.auth.logout();
    } catch (err) {
      console.warn('AdminShell: Erro ao chamar logout da API v1:', err);
    }
    clearStoredTokens();
    await fetch('/api/auth', { method: 'DELETE' });
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
  const canAccessPhotos =
    userSession.isGestor ||
    userSession.profileType === 'Curador de Fotos' ||
    userSession.profileType === 'Operador de Conteúdo';
  const canAccessAnnouncements =
    userSession.isGestor ||
    userSession.profileType === 'Publicador de Avisos' ||
    userSession.profileType === 'Operador de Conteúdo';
  const canAccessGallery =
    userSession.isGestor ||
    userSession.profileType === 'Curador de Fotos' ||
    userSession.profileType === 'Operador de Conteúdo';
  const canAccessProjects = userSession.isGestor;
  const canAccessFaqs = userSession.isGestor || userSession.profileType === 'Operador de Conteúdo';
  const canAccessSocials = userSession.isGestor;
  const canAccessSiteInfo = userSession.isGestor;
  const canAccessKanban = userSession.isGestor && userSession.apiUser?.perfil_nome === 'Administrador';
  const canAccessUsers = canAccessAdminUsers(userSession);
  const canAccessEstados = userSession.isGestor;

  // Definição da Árvore de Pastas da Sidebar
  const folders = [
    {
      id: 'publicacoes',
      label: 'Publicações do Site',
      icon: FolderKanban,
      visible:
        canAccessNews ||
        canAccessAnnouncements ||
        canAccessPhotos ||
        canAccessGallery ||
        canAccessProjects ||
        canAccessFaqs,
      items: [
        {
          section: 'noticias' as AdminSection,
          label: 'Notícias e Matérias',
          tooltip: 'Criar ou editar reportagens',
          icon: Newspaper,
          badge: badges.noticias,
          visible: canAccessNews,
          href: SECTION_CONFIG.noticias.href,
        },
        {
          section: 'projetos' as AdminSection,
          label: 'Projetos Pedagógicos',
          tooltip: 'Cadastrar e gerenciar projetos pedagógicos das escolas',
          icon: Lightbulb,
          badge: badges.projetos,
          visible: canAccessProjects,
          href: SECTION_CONFIG.projetos.href,
        },
        {
          section: 'duvidas' as AdminSection,
          label: 'Dúvidas Frequentes (FAQ)',
          tooltip: 'Cadastrar e gerenciar perguntas frequentes do portal',
          icon: HelpCircle,
          badge: badges.duvidas,
          visible: canAccessFaqs,
          href: SECTION_CONFIG.duvidas.href,
        },
        {
          section: 'avisos' as AdminSection,
          label: 'Avisos e Comunicados',
          tooltip: 'Publicar alertas no mural',
          icon: Megaphone,
          badge: badges.avisos,
          visible: canAccessAnnouncements,
          href: SECTION_CONFIG.avisos.href,
        },
        {
          section: 'fotos' as AdminSection,
          label: 'Banners da Página Inicial',
          tooltip: 'Trocar imagens do topo da Home',
          icon: Presentation,
          badge: badges.fotos,
          visible: canAccessPhotos,
          href: SECTION_CONFIG.fotos.href,
        },
        {
          section: 'galeria' as AdminSection,
          label: 'Galeria de Fotos',
          tooltip: 'Adicionar fotos das escolas',
          icon: Images,
          badge: badges.galeria,
          visible: canAccessGallery,
          href: SECTION_CONFIG.galeria.href,
        },
      ],
    },
    {
      id: 'aprovacao',
      label: 'Aprovação e Revisão',
      icon: ShieldCheck,
      visible: canAccessKanban,
      items: [
        {
          section: 'kanban' as AdminSection,
          label: 'Fila de Aprovação (Passo a Passo)',
          tooltip: 'Abre o fluxo Rascunho > Revisão > Publicado',
          icon: CheckCircle2,
          badge: badges.kanban,
          visible: canAccessKanban,
          href: SECTION_CONFIG.kanban.href,
        },
      ],
    },
    {
      id: 'dados',
      label: 'Dados e Contatos do Site',
      icon: SlidersHorizontal,
      visible: canAccessSiteInfo || canAccessSocials || canAccessEstados,
      items: [
        {
          section: 'siteInfo' as AdminSection,
          label: 'Números de Alunos e Escolas',
          tooltip: 'Edita os contadores e textos institucionais',
          icon: BarChart3,
          badge: badges.siteInfo,
          visible: canAccessSiteInfo,
          href: SECTION_CONFIG.siteInfo.href,
        },
        {
          section: 'redes' as AdminSection,
          label: 'Redes Sociais e WhatsApp',
          tooltip: 'Edita os links de YouTube, Instagram e suporte',
          icon: Share2,
          badge: badges.redes,
          visible: canAccessSocials,
          href: SECTION_CONFIG.redes.href,
        },
        {
          section: 'estadosCidades' as AdminSection,
          label: 'Estados e Municípios',
          tooltip: 'Cadastrar e gerenciar estados (UF) e municípios da API',
          icon: MapPin,
          badge: badges.estadosCidades,
          visible: canAccessEstados,
          href: SECTION_CONFIG.estadosCidades.href,
        },
      ],
    },
    {
      id: 'usuarios',
      label: 'Usuários e Acessos',
      icon: UsersRound,
      visible: canAccessUsers,
      items: [
        {
          section: 'usuarios' as AdminSection,
          label: 'Gerenciar Equipe e Senhas',
          tooltip: 'Abre o cadastro de operadores por CPF',
          icon: UserCog,
          badge: badges.usuarios,
          visible: canAccessUsers,
          href: SECTION_CONFIG.usuarios.href,
        },
      ],
    },
  ];

  // Pesquisa rápida da Sidebar
  const { isSearching, homeMatchesSearch, filteredFolders, hasAnySearchResult } = filterAdminNavigation(folders, sidebarSearch);

  // Tela de carregamento enquanto valida sessão
  if (loadingAuth || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#07152B] flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-9 h-9 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-wide">MEDTEC Rondônia • SEDUC-RO</p>
          <p className="text-xs text-slate-400">Autenticando e carregando painel de gestão...</p>
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
      : activeSection === 'projetos'
      ? canAccessProjects
      : activeSection === 'duvidas'
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
      : true;

  const currentConfig = SECTION_CONFIG[activeSection] || SECTION_CONFIG.visaoGeral;

  return (
    <div
      translate="no"
      className="notranslate h-screen h-[100dvh] w-full flex overflow-hidden bg-slate-50 dark:bg-[#060D1A] text-slate-800 dark:text-slate-100"
    >
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

        {/* Campo de Pesquisa Rápida */}
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

        {/* Corpo Navegável com Árvore Expansível */}
        <div className="flex-1 min-h-0 overflow-y-auto py-3 px-3 space-y-3 scrollbar-thin">
          {/* 1. Início (Resumo do Painel) */}
          {userSession.isGestor && homeMatchesSearch && (
            <div className="space-y-1">
              <Link
                href="/admin"
                title={isCollapsed ? 'Início (Resumo do Painel)' : 'Visão geral e atalhos rápidos do painel'}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                  activeSection === 'visaoGeral'
                    ? 'bg-[#004A99] text-white font-semibold shadow-xs ring-1 ring-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Home className={`h-4 w-4 shrink-0 ${activeSection === 'visaoGeral' ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate text-left flex-1">Início (Resumo do Painel)</span>}
              </Link>
            </div>
          )}

          {/* 2. Pastas / Módulos Expansíveis */}
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
                    toggleFolder(folder.id);
                  }}
                  title={folder.label}
                  className={`w-full flex items-center justify-center p-2 rounded-lg transition cursor-pointer ${
                    isFolderActive
                      ? 'bg-[#004A99] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <folder.icon className="h-4 w-4 shrink-0" />
                </button>
              );
            }

            return (
              <div key={folder.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer select-none ${
                    isFolderActive
                      ? 'text-white bg-slate-800/80 ring-1 ring-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <folder.icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isFolderActive ? 'text-sky-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate text-left">{folder.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="ml-4 pl-3 border-l-2 border-slate-800 space-y-1 pt-0.5 pb-1 transition-all">
                    {folder.items.map((item) => {
                      const isItemActive = activeSection === item.section;
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.section}
                          href={item.href}
                          title={item.tooltip}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer group ${
                            isItemActive
                              ? 'bg-[#004A99] text-white font-bold shadow-xs ring-1 ring-sky-400/30'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                          }`}
                        >
                          <ItemIcon
                            className={`h-3.5 w-3.5 shrink-0 transition ${
                              isItemActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-300'
                            }`}
                          />
                          <span className="truncate text-left flex-1">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                isItemActive
                                  ? 'bg-white/20 text-white font-bold'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                              }`}
                            >
                              {item.badge}
                            </span>
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

        {/* Rodapé Fixo da Sidebar */}
        <div className="shrink-0 border-t border-slate-800/80 p-3 space-y-2 bg-[#051021]">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver Portal Público"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition text-xs font-medium ${
              isCollapsed ? 'justify-center px-1' : ''
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Ver Portal Público</span>}
          </Link>

          <div
            className={`pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 ${
              isCollapsed ? 'flex-col' : ''
            }`}
          >
            {!isCollapsed ? (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {userSession.name || userSession.username}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {userSession.isGestor ? 'Gestor Geral' : userSession.profileType || 'Operador'}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              title="Sair do Sistema"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer shrink-0"
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
          <div className="relative w-72 max-w-[85vw] bg-[#07152B] text-slate-200 flex flex-col h-full z-10 shadow-2xl">
            <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#004A99] flex items-center justify-center text-white font-bold">
                  <Tv className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="font-extrabold text-xs text-white">MEDTEC Rondônia</h1>
                  <p className="text-[10px] text-slate-400 font-mono">SEDUC-RO • Painel Gestor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {userSession.isGestor && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeSection === 'visaoGeral' ? 'bg-[#004A99] text-white' : 'text-slate-300'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Início (Resumo do Painel)</span>
                </Link>
              )}

              {filteredFolders.map((folder) => (
                <div key={folder.id} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <folder.icon className="h-3.5 w-3.5 text-sky-400" />
                    <span>{folder.label}</span>
                  </div>
                  <div className="space-y-0.5 pl-2">
                    {folder.items.map((item) => (
                      <Link
                        key={item.section}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                          activeSection === item.section
                            ? 'bg-[#004A99] text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

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
        <header className="h-16 sticky top-0 z-20 shrink-0 bg-white/95 dark:bg-[#0B1528]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* ========================================================
            4. CORPO DO CONTEÚDO
        ======================================================== */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 space-y-6 pb-20">
          {/* Barra de Topo do Módulo com Botão "← Voltar para o Início" */}
          {activeSection !== 'visaoGeral' && userSession.isGestor && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#004A99] dark:hover:text-sky-400 transition shadow-xs cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                <span>Voltar para o Início</span>
              </Link>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>{currentConfig.group}</span>
                <span>•</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{currentConfig.title}</span>
              </div>
            </div>
          )}

          {/* Guia Visual Didático ("O que esta tela faz?") */}
          {activeSection !== 'visaoGeral' && (
            <div className="flex items-start sm:items-center gap-3 p-3.5 rounded-xl bg-blue-50/80 dark:bg-[#08182F] border border-blue-200/80 dark:border-blue-900/60 text-slate-700 dark:text-slate-200 text-xs shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-[#004A99] dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Info className="h-4 w-4" />
              </div>
              <p className="flex-1 leading-relaxed">
                <strong className="font-bold text-slate-900 dark:text-white mr-1.5">O que esta tela faz:</strong>
                {currentConfig.subtitle}
              </p>
            </div>
          )}

          {/* Renderização Condicional: Acesso Permitido vs Restrito */}
          {isAuthorized ? (
            typeof children === 'function' ? children(userSession) : children
          ) : (
            <div className="p-12 text-center space-y-4 rounded-2xl bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Acesso Restrito</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Seu perfil de acesso ({userSession.profileType || 'Operador'}) não possui permissão para visualizar ou gerenciar este módulo.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs"
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
