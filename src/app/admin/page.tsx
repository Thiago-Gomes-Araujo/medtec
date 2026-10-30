'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Tv, 
  Newspaper, 
  Share2, 
  LogOut, 
  Check,
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
  MessageSquare,
  Phone,
  Mail,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, FacebookIcon } from '@/components/SocialIcons';
import { useAdminOverview } from '@/components/admin/useAdminOverview';
import AdminOverview from '@/components/admin/AdminOverview';
import { AdminPreviewModal, PreviewContentType, PreviewItemData } from '@/components/AdminLiveSimulator';
import SocialChannelsModule from '@/components/admin/SocialChannelsModule';
import SiteInfoModule from '@/components/admin/SiteInfoModule';
import EstadosCidadesModule from '@/components/admin/EstadosCidadesModule';
import GalleryModule from '@/components/admin/GalleryModule';
import AnnouncementsModule from '@/components/admin/AnnouncementsModule';
import { getLegacyFaqHref } from '@/lib/admin-faq';
import { getLegacyProjectsHref } from '@/lib/admin-projects';
import { getLegacyBannersHref } from '@/lib/admin-banners';
import {
  medtecApi,
  clearStoredTokens,
  ATipoAviso,
  CategoriaGaleria,
  FotoGaleria,
  CanalContato,
  Estado,
} from '@/lib/api';

type AdminSection = 'visaoGeral' | 'kanban' | 'fotos' | 'noticias' | 'avisos' | 'galeria' | 'redes' | 'siteInfo' | 'usuarios' | 'projetos' | 'duvidas' | 'estadosCidades';
type CmsSubTab = 'noticias' | 'avisos' | 'galeria' | 'redes' | 'siteInfo' | 'estadosCidades';

// Mapa de Títulos de Seção para Breadcrumb e Header (Didático e sem jargões)
const SECTION_CONFIG: Record<AdminSection, { group: string; title: string; subtitle: string }> = {
  visaoGeral: {
    group: 'Início',
    title: 'Início (Resumo do Painel)',
    subtitle: 'Visão executiva unificada, indicadores em tempo real e atalhos didáticos de acesso rápido.',
  },
  noticias: {
    group: 'Publicações do Site',
    title: 'Notícias e Matérias',
    subtitle: 'Aqui você escreve novas matérias, escolhe a foto de capa e edita notícias já publicadas no portal.',
  },
  projetos: {
    group: 'Publicações do Site',
    title: 'Projetos Pedagógicos e Práticas Escolares',
    subtitle: 'Cadastre, edite e gerencie os projetos pedagógicos, práticas de campo e missões escolares dos 52 municípios.',
  },
  duvidas: {
    group: 'Publicações do Site',
    title: 'Dúvidas Frequentes (FAQ)',
    subtitle: 'Cadastre, edite e organize as perguntas e respostas que aparecem na Central de Dúvidas do portal.',
  },
  avisos: {
    group: 'Publicações do Site',
    title: 'Avisos e Comunicados',
    subtitle: 'Use esta área para postar comunicados oficiais, calendários e avisos urgentes para as escolas.',
  },
  fotos: {
    group: 'Publicações do Site',
    title: 'Banners da Página Inicial',
    subtitle: 'Gerencie as imagens grandes que passam no topo da Página Inicial do site.',
  },
  galeria: {
    group: 'Publicações do Site',
    title: 'Galeria de Fotos',
    subtitle: 'Envie fotografias das salas de aula, estúdios e projetos realizados nos municípios.',
  },
  kanban: {
    group: 'Aprovação e Revisão',
    title: 'Fila de Aprovação (Passo a Passo)',
    subtitle: 'Acompanhe as reportagens em rascunho, envie para revisão e publique oficialmente no portal.',
  },
  siteInfo: {
    group: 'Dados e Contatos do Site',
    title: 'Números de Alunos e Escolas',
    subtitle: 'Atualize a quantidade oficial de estudantes, escolas, turmas e municípios atendidos.',
  },
  redes: {
    group: 'Dados e Contatos do Site',
    title: 'Redes Sociais e WhatsApp',
    subtitle: 'Atualize os links oficiais de transmissão, redes sociais e canais de atendimento.',
  },
  usuarios: {
    group: 'Usuários e Acessos',
    title: 'Gerenciar Equipe e Senhas',
    subtitle: 'Cadastre operadores por CPF, redefina senhas e gerencie permissões de acesso ao sistema.',
  },
  estadosCidades: {
    group: 'Dados e Contatos do Site',
    title: 'Estados e Municípios',
    subtitle: 'Cadastre e gerencie a base de unidades federativas (UF) e municípios atendidos pelo MEDTEC.',
  },
};

interface NavItemDef {
  section: AdminSection;
  label: string;
  tooltip: string;
  icon: React.ElementType;
  badge?: number | string;
  visible: boolean;
}

interface NavFolderDef {
  id: string;
  label: string;
  icon: React.ElementType;
  visible: boolean;
  items: NavItemDef[];
}

interface SidebarNavItemProps {
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  isActive: boolean;
  isCollapsed?: boolean;
  onClick: () => void;
  tooltip?: string;
}

function SidebarNavItem({
  label,
  icon: Icon,
  badge,
  isActive,
  isCollapsed = false,
  onClick,
  tooltip,
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={isCollapsed ? (tooltip || label) : tooltip}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
        isActive
          ? 'bg-[#004A99] text-white font-semibold shadow-xs ring-1 ring-white/10'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
      } ${isCollapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
      {!isCollapsed && (
        <>
          <span className="truncate text-left flex-1">{label}</span>
          {badge !== undefined && badge !== null && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

interface SidebarFolderAccordionProps {
  folder: NavFolderDef;
  isOpen: boolean;
  isFolderActive: boolean;
  currentSection: AdminSection;
  isCollapsed?: boolean;
  onToggle: () => void;
  onSelectSection: (section: AdminSection) => void;
}

function SidebarFolderAccordion({
  folder,
  isOpen,
  isFolderActive,
  currentSection,
  isCollapsed = false,
  onToggle,
  onSelectSection,
}: SidebarFolderAccordionProps) {
  const visibleItems = folder.items.filter((item) => item.visible);
  if (visibleItems.length === 0) return null;

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onToggle}
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
    <div className="space-y-1">
      {/* Botão da Pasta / Grupo Pai */}
      <button
        type="button"
        onClick={onToggle}
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

      {/* Subitens Expansíveis com Linha Guia e Recuo Didático */}
      {isOpen && (
        <div className="ml-4 pl-3 border-l-2 border-slate-800 space-y-1 pt-0.5 pb-1 transition-all">
          {visibleItems.map((item) => {
            const isItemActive = currentSection === item.section;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.section}
                type="button"
                onClick={() => onSelectSection(item.section)}
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
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<AdminSection>('visaoGeral');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    publicacoes: false,
    aprovacao: false,
    dados: false,
    usuarios: false,
  });

  const getFolderIdForSection = (sec: AdminSection): string | null => {
    if (['noticias', 'avisos', 'fotos', 'galeria', 'projetos', 'duvidas'].includes(sec)) return 'publicacoes';
    if (['kanban'].includes(sec)) return 'aprovacao';
    if (['siteInfo', 'redes'].includes(sec)) return 'dados';
    if (['usuarios'].includes(sec)) return 'usuarios';
    return null;
  };

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

  const handleSelectSection = (sec: AdminSection) => {
    if (sec === 'fotos') {
      router.push('/admin/banners');
      return;
    }
    if (sec === 'projetos') {
      router.push('/admin/projetos');
      return;
    }
    if (sec === 'duvidas') {
      router.push('/admin/faq');
      return;
    }
    if (sec === 'usuarios') {
      router.push('/admin/usuarios');
      return;
    }
    if (sec === 'kanban') {
      router.push('/admin/kanban');
      return;
    }
    if (sec === 'noticias') {
      router.push('/admin/noticias');
      return;
    }
    if (sec === 'avisos') {
      router.push('/admin/avisos');
      return;
    }
    if (sec === 'galeria') {
      router.push('/admin/galeria');
      return;
    }
    if (sec === 'estadosCidades') {
      router.push('/admin/estados-cidades');
      return;
    }
    if (sec === 'siteInfo') {
      router.push('/admin/institucional');
      return;
    }
    if (sec === 'redes') {
      router.push('/admin/redes');
      return;
    }
    setCurrentSection(sec);
    const activeFolder = getFolderIdForSection(sec);
    if (activeFolder) {
      setOpenFolders((prev) => ({ ...prev, [activeFolder]: true }));
    }
  };

  const [userSession, setUserSession] = useState<{
    isGestor: boolean;
    username?: string;
    role?: string;
    name?: string;
    profileType?: string;
    editorialProfile?: string;
  }>({ isGestor: false });

  // Estado para Modal de Pré-visualização Fiel em Tela Cheia
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    type: PreviewContentType;
    data: PreviewItemData;
  }>({
    isOpen: false,
    type: 'noticia',
    data: {},
  });

  // -------------------------------------------------------------
  // ESTADOS DA API v1 OFICIAL (/api/v1)
  // -------------------------------------------------------------
  // Avisos e Tipos de Aviso (/a_avisos, /a_tipos_aviso) - Compartilhado com Visão Geral e Sidebar
  const [apiTiposAviso, setApiTiposAviso] = useState<ATipoAviso[]>([]);

  // Galeria e Categorias (/fotos_galeria, /categorias_galeria) - Compartilhado com Visão Geral e Sidebar
  const [apiFotos, setApiFotos] = useState<FotoGaleria[]>([]);
  const [apiCategorias, setApiCategorias] = useState<CategoriaGaleria[]>([]);

  // Canais de Contato (/canais_contato)
  const [apiCanais, setApiCanais] = useState<CanalContato[]>([]);
  const [savingCanais, setSavingCanais] = useState(false);

  // A sessão Rails confirma o perfil editorial; permissões de edição não aprovam notícias.
  const canAccessKanban = userSession.isGestor && userSession.editorialProfile === 'Administrador';
  const {
    data, setData, errorData, apiNews, loadingNews, errorNews, totalNews,
    apiAvisos, setApiAvisos, loadingAvisos, errorAvisos, totalAvisos,
    loadingFotos, errorFotos, totalFotos, totalCategorias, totalEstados,
    apiNewsPublishedCount, apiNewsDraftCount, apiAvisosAtivosCount, apiAvisosUrgentesCount,
    totalUsers, errorUsers, usersCountLabel, projectsCount, projectMunicipalities, bannersCount, faqsCount,
    reload: loadOverview,
  } = useAdminOverview();
  const draftCount = apiNewsDraftCount;

  // As listas completas abaixo pertencem aos blocos legados, não aos KPIs.
  const [loadingGalleryModule, setLoadingGalleryModule] = useState(true);
  const [errorGalleryModule, setErrorGalleryModule] = useState<string | null>(null);

  // Estados (/g_estados) - Compartilhado com a Sidebar
  const [apiEstados, setApiEstados] = useState<Estado[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);

  // Sincronização do tema escuro
  const isDark = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const observer = new MutationObserver(onStoreChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    },
    () => (typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false),
    () => false
  );

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('medtec-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('medtec-theme', 'light');
    }
  };

  // Mantém os blocos antigos sem buscar dados de seus formulários ao abrir o resumo.
  useEffect(() => {
    if (!isLoggedIn || !userSession.isGestor) return;
    let active = true;
    const loadLegacyModule = async () => {
      await Promise.resolve();
      if (!active) return;
      try {
        if (currentSection === 'avisos') {
          const response = await medtecApi.tiposAviso.list({ page: 'all' });
          if (active && response.success && response.data?.items) setApiTiposAviso(response.data.items);
        } else if (currentSection === 'galeria') {
          setLoadingGalleryModule(true);
          setErrorGalleryModule(null);
          const [categories, photos] = await Promise.all([
            medtecApi.categoriasGaleria.list({ page: 'all' }),
            medtecApi.fotosGaleria.list({ page: 'all' }),
          ]);
          if (active && categories.success && categories.data?.items) setApiCategorias(categories.data.items);
          if (active && photos.success && photos.data?.items) setApiFotos(photos.data.items);
        } else if (currentSection === 'redes') {
          const response = await medtecApi.canaisContato.list({ page: 'all' });
          if (active && response.success && response.data?.items) setApiCanais(response.data.items);
        } else if (currentSection === 'estadosCidades') {
          setLoadingEstados(true);
          const response = await medtecApi.estados.list({ page: 'all' });
          if (active && response.success && response.data?.items) setApiEstados(response.data.items);
        }
      } catch (error) {
        console.warn('API v1: Erro ao carregar módulo legado:', error);
        if (active && currentSection === 'galeria') setErrorGalleryModule('Falha ao comunicar com a API da Galeria');
      } finally {
        if (active && currentSection === 'galeria') setLoadingGalleryModule(false);
        if (active && currentSection === 'estadosCidades') setLoadingEstados(false);
      }
    };
    void loadLegacyModule();
    return () => { active = false; };
  }, [currentSection, isLoggedIn, userSession.isGestor]);

  // Carrega dados iniciais e verifica sessão
  const loadData = useCallback(async () => {
    await Promise.resolve();
    const params = new URLSearchParams(window.location.search);
    // O efeito de compatibilidade encaminha os módulos migrados para suas rotas.
    // Não carrega sessão/dados dos demais módulos para esse acesso legado.
    if (getLegacyBannersHref(params) || getLegacyProjectsHref(params) || getLegacyFaqHref(params) || ['kanban', 'usuarios'].includes(params.get('tab') || params.get('section') || '')) return;
    const createNews = params.get('action') === 'new' || ['editor', 'new', 'nova'].includes(params.get('mode') || '');
    const newsTarget = createNews ? '/admin/noticias?action=new' : '/admin/noticias';
    try {
      let authenticated = false;
      let overviewAuthorized = false;

      // 1. Tenta validar token JWT na API Backend v1 (/auth/me)
      if (medtecApi.auth.isAuthenticated()) {
        try {
          const meRes = await medtecApi.auth.me();
          if (meRes.success && meRes.data) {
            authenticated = true;
            const isGestor = meRes.data.perfil_nome === 'Administrador' || meRes.data.perfil_id === 3 || meRes.data.id === 1;
            overviewAuthorized = isGestor;
            setIsLoggedIn(true);
            setUserSession({
              isGestor,
              username: meRes.data.cpf,
              role: meRes.data.perfil_nome,
              name: meRes.data.nome,
              profileType: meRes.data.perfil_nome,
              editorialProfile: meRes.data.perfil_nome,
            });

            if (!isGestor) {
              if (meRes.data.perfil_nome === 'Editor de Notícias') {
                router.replace(newsTarget);
                return;
              } else if (meRes.data.perfil_nome === 'Curador de Fotos') {
                router.replace('/admin/banners');
                return;
              } else if (meRes.data.perfil_nome === 'Publicador de Avisos') {
                router.push('/admin/avisos');
                return;
              } else {
                router.replace(newsTarget);
                return;
              }
            } else {
              setCurrentSection('visaoGeral');
            }
          }
        } catch (meErr) {
          console.warn('GET /auth/me falhou ou token expirou:', meErr);
        }
      }

      // 2. Fallback de sessão local caso o token ainda não exista
      if (!authenticated) {
        const authRes = await fetch('/api/auth');
        if (authRes.ok) {
          const authJson = await authRes.json();
          const isGestor = authJson.isGestor !== false;
          overviewAuthorized = isGestor;
          const profileType = authJson.profileType;

          setIsLoggedIn(true);
          setUserSession({
            isGestor,
            username: authJson.user,
            role: authJson.role,
            name: authJson.name,
            profileType,
          });
          authenticated = true;

          if (!isGestor) {
            if (profileType === 'Editor de Notícias') {
              router.replace(newsTarget);
              return;
            } else if (profileType === 'Curador de Fotos') {
              router.replace('/admin/banners');
              return;
            } else if (profileType === 'Publicador de Avisos') {
              router.push('/admin/avisos');
              return;
            } else {
              router.replace(newsTarget);
              return;
            }
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
      await loadOverview(overviewAuthorized);
    } catch (err) {
      console.error(err);
      router.push('/admin/login');
    }
  }, [router, loadOverview]);

  useEffect(() => {
    const run = async () => {
      await loadData();
    };
    void run();
  }, [loadData]);

  // Sincroniza subrotas legadas ou transição de abas via query param ?tab= ou ?section=
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') || params.get('section');
      const faqHref = getLegacyFaqHref(params);
      const projectsHref = getLegacyProjectsHref(params);
      const bannersHref = getLegacyBannersHref(params);
      if (bannersHref) {
        router.replace(bannersHref);
      } else if (projectsHref) {
        router.replace(projectsHref);
      } else if (faqHref) {
        router.replace(faqHref);
      } else if (tabParam === 'usuarios') {
        router.replace('/admin/usuarios');
      } else if (tabParam === 'kanban') {
        router.replace('/admin/kanban');
      } else if (tabParam === 'noticias') {
        const create = params.get('action') === 'new' || ['editor', 'new', 'nova'].includes(params.get('mode') || '');
        router.replace(create ? '/admin/noticias?action=new' : '/admin/noticias');
      } else if (tabParam === 'avisos') {
        router.push('/admin/avisos');
      } else if (tabParam === 'galeria') {
        router.push('/admin/galeria');
      } else if (tabParam === 'estadosCidades') {
        router.push('/admin/estados-cidades');
      } else if (tabParam === 'siteInfo') {
        router.push('/admin/institucional');
      } else if (tabParam === 'redes') {
        router.push('/admin/redes');
      } else if (tabParam && tabParam in SECTION_CONFIG) {
        handleSelectSection(tabParam as AdminSection);
      }
    }
  }, [router]);

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

  // -------------------------------------------------------------
  // FUNÇÕES DE REDES SOCIAIS E CANAIS DE CONTATO (/canais_contato)
  // -------------------------------------------------------------
  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCanais(true);
    try {
      const fixedKeys = ['youtube', 'instagram', 'facebook', 'whatsapp', 'telefone', 'email', 'endereco'] as const;
      const payload = fixedKeys.map((rede, idx) => {
        const found = apiCanais.find(c => c.rede === rede);
        const fallbackValue = rede === 'youtube' ? (data?.socials?.youtube || '') :
                              rede === 'instagram' ? (data?.socials?.instagram || '') :
                              rede === 'facebook' ? (data?.socials?.facebook || '') :
                              rede === 'whatsapp' ? (data?.socials?.whatsapp || '') :
                              rede === 'telefone' ? (data?.socials?.phone || '') :
                              rede === 'email' ? (data?.socials?.email || '') :
                              (data?.socials?.address || '');
        return {
          rede,
          valor: found?.valor !== undefined && found.valor !== '' ? found.valor : fallbackValue,
          posicao: found?.posicao !== undefined ? Number(found.posicao) : (idx + 1),
          ativo: found?.ativo !== undefined ? Boolean(found.ativo) : true,
        };
      });

      const res = await medtecApi.canaisContato.updateMany(payload);
      if (res.success && res.data) {
        setApiCanais(res.data);
      }

      alert('Canais de atendimento e redes oficiais salvos com sucesso na API oficial!');
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Erro ao salvar canais na API oficial: ${errorData.message || errorData.errors?.join(', ') || 'Falha na requisição'}`);
    } finally {
      setSavingCanais(false);
    }
  };


  // Permissões por Atribuição de Perfil
  const canAccessNews = userSession.isGestor || userSession.profileType === 'Editor de Notícias' || userSession.profileType === 'Operador de Conteúdo';
  const canAccessPhotos = userSession.isGestor || userSession.profileType === 'Curador de Fotos' || userSession.profileType === 'Operador de Conteúdo';
  const canAccessAnnouncements = userSession.isGestor || userSession.profileType === 'Publicador de Avisos' || userSession.profileType === 'Operador de Conteúdo';
  const canAccessGallery = userSession.isGestor || userSession.profileType === 'Curador de Fotos' || userSession.profileType === 'Operador de Conteúdo';
  const canAccessProjects = userSession.isGestor;
  const canAccessFaqs = userSession.isGestor || userSession.profileType === 'Operador de Conteúdo';
  const canAccessSocials = userSession.isGestor;
  const canAccessSiteInfo = userSession.isGestor;
  const canAccessUsers = userSession.isGestor;
  const canAccessEstados = userSession.isGestor;

  // Árvore de Navegação em Pastas Expansíveis (Didático - Estilo Accordion JOER SEDUC-RO)
  const folders: NavFolderDef[] = [
    {
      id: 'publicacoes',
      label: 'Publicações do Site',
      icon: FolderKanban,
      visible: canAccessNews || canAccessAnnouncements || canAccessPhotos || canAccessGallery || canAccessProjects || canAccessFaqs,
      items: [
        {
          section: 'noticias',
          label: 'Notícias e Matérias',
          tooltip: 'Criar ou editar reportagens',
          icon: Newspaper,
          badge: errorNews ? undefined : (loadingNews ? undefined : (totalNews ?? undefined)),
          visible: canAccessNews,
        },
        {
          section: 'projetos',
          label: 'Projetos Pedagógicos',
          tooltip: 'Cadastrar e gerenciar projetos pedagógicos das escolas',
          icon: Lightbulb,
          badge: projectsCount,
          visible: canAccessProjects,
        },
        {
          section: 'duvidas',
          label: 'Dúvidas Frequentes (FAQ)',
          tooltip: 'Cadastrar e gerenciar perguntas frequentes do portal',
          icon: HelpCircle,
          badge: faqsCount,
          visible: canAccessFaqs,
        },
        {
          section: 'avisos',
          label: 'Avisos e Comunicados',
          tooltip: 'Publicar alertas no mural',
          icon: Megaphone,
          badge: errorAvisos ? undefined : (loadingAvisos ? undefined : (totalAvisos ?? undefined)),
          visible: canAccessAnnouncements,
        },
        {
          section: 'fotos',
          label: 'Banners da Página Inicial',
          tooltip: 'Trocar imagens do topo da Home',
          icon: Presentation,
          badge: bannersCount,
          visible: canAccessPhotos,
        },
        {
          section: 'galeria',
          label: 'Galeria de Fotos',
          tooltip: 'Adicionar fotos das escolas',
          icon: Images,
          badge: errorFotos ? undefined : (loadingFotos ? undefined : (totalFotos ?? undefined)),
          visible: canAccessGallery,
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
          section: 'kanban',
          label: 'Fila de Aprovação (Passo a Passo)',
          tooltip: 'Abre o fluxo Rascunho > Revisão > Publicado',
          icon: CheckCircle2,
          badge: errorNews ? undefined : (loadingNews ? undefined : (draftCount > 0 ? draftCount : undefined)),
          visible: canAccessKanban,
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
          section: 'siteInfo',
          label: 'Números de Alunos e Escolas',
          tooltip: 'Edita os contadores e textos institucionais',
          icon: BarChart3,
          badge: undefined,
          visible: canAccessSiteInfo,
        },
        {
          section: 'redes',
          label: 'Redes Sociais e WhatsApp',
          tooltip: 'Edita os links de YouTube, Instagram e suporte',
          icon: Share2,
          badge: undefined,
          visible: canAccessSocials,
        },
        {
          section: 'estadosCidades',
          label: 'Estados e Municípios',
          tooltip: 'Cadastrar e gerenciar estados (UF) e municípios da API',
          icon: MapPin,
          badge: totalEstados !== null && totalEstados > 0 ? totalEstados : undefined,
          visible: canAccessEstados,
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
          section: 'usuarios',
          label: 'Gerenciar Equipe e Senhas',
          tooltip: 'Abre o cadastro de operadores por CPF',
          icon: UserCog,
          badge: errorUsers ? undefined : (totalUsers ?? undefined),
          visible: canAccessUsers,
        },
      ],
    },
  ];

  // Pesquisa Rápida da Sidebar (Filtro Instantâneo Didático)
  const searchQuery = sidebarSearch.trim().toLowerCase();
  const isSearching = searchQuery.length > 0;
  const homeMatchesSearch = !isSearching || 'início resumo do painel visão geral home'.includes(searchQuery);

  const filteredFolders = folders
    .map((folder) => {
      if (!folder.visible) return { ...folder, items: [] };

      const folderNameMatches = folder.label.toLowerCase().includes(searchQuery);
      const matchedItems = folder.items.filter((item) => {
        if (!item.visible) return false;
        if (!isSearching || folderNameMatches) return true;
        return (
          item.label.toLowerCase().includes(searchQuery) ||
          item.tooltip.toLowerCase().includes(searchQuery)
        );
      });

      return {
        ...folder,
        items: matchedItems,
        visible: matchedItems.length > 0,
      };
    })
    .filter((folder) => folder.visible);

  const hasAnySearchResult = homeMatchesSearch || filteredFolders.length > 0;

  // Loading State
  if (!isLoggedIn || !data) {
    return (
      <div className="min-h-screen bg-[#07152B] flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-9 h-9 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-wide">MEDTEC Rondônia • SEDUC-RO</p>
          <p role={errorData ? 'alert' : undefined} className="text-xs text-slate-400">{errorData || 'Autenticando e carregando painel de gestão...'}</p>
        </div>
      </div>
    );
  }

  const currentConfig = SECTION_CONFIG[currentSection];

  // Renderizador unificado dos módulos CMS (reutilizável tanto nas visões dedicadas quanto nas abas do Painel Geral)
  const renderCmsModule = (tab: CmsSubTab) => {
    if (!data) return null;

    if (tab === 'avisos' && canAccessAnnouncements) {
      return (
        <AnnouncementsModule
          apiAvisos={apiAvisos}
          setApiAvisos={setApiAvisos}
          apiTiposAviso={apiTiposAviso}
          setApiTiposAviso={setApiTiposAviso}
          loadingAvisos={loadingAvisos}
          errorAvisos={errorAvisos}
          onPreview={(avisoData) =>
            setPreviewModal({
              isOpen: true,
              type: 'aviso',
              data: avisoData,
            })
          }
        />
      );
    }

    if (tab === 'galeria' && canAccessGallery) {
      return (
        <GalleryModule
          apiFotos={apiFotos}
          setApiFotos={setApiFotos}
          apiCategorias={apiCategorias}
          setApiCategorias={setApiCategorias}
          loadingFotos={loadingGalleryModule}
          errorFotos={errorGalleryModule}
          onPreview={(photoData) =>
            setPreviewModal({
              isOpen: true,
              type: 'galeria',
              data: photoData,
            })
          }
        />
      );
    }

    if (tab === 'redes' && canAccessSocials) {
      return (
        <SocialChannelsModule
          apiCanais={apiCanais}
          setApiCanais={setApiCanais}
          defaultSocials={data?.socials}
          onSave={handleSaveSocials}
          saving={savingCanais}
        />
      );
    }

    if (tab === 'siteInfo' && canAccessSiteInfo) {
      return (
        <SiteInfoModule
          data={data}
          setData={setData}
          onPreview={(siteData) => setPreviewModal({
            isOpen: true,
            type: 'siteInfo',
            data: siteData,
          })}
        />
      );
    }

    if (tab === 'estadosCidades' && canAccessEstados) {
      return (
        <EstadosCidadesModule
          apiEstados={apiEstados}
          setApiEstados={setApiEstados}
          loadingEstados={loadingEstados}
        />
      );
    }

    return null;
  };

  return (
    <div translate="no" className="notranslate h-screen h-[100dvh] w-full flex overflow-hidden bg-slate-50 dark:bg-[#060D1A] text-slate-800 dark:text-slate-100">
      
      {/* ========================================================
          1. SIDEBAR DESKTOP (FIXA E RETRÁTIL COM ACCORDION JOER)
      ======================================================== */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-full bg-[#07152B] text-slate-200 border-r border-slate-800 select-none z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
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
      </aside>

      {/* ========================================================
          2. GAVETA MOBILE (OFF-CANVAS PARA TELAS < LG COM ACCORDION)
      ======================================================== */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 h-full h-[100dvh] bg-[#07152B] text-slate-200 border-r border-slate-800 flex flex-col z-50 shadow-2xl">
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
                className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800"
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

            <div className="shrink-0 border-t border-slate-800 p-3 space-y-2 bg-[#051021]">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                <span>Ver Portal Público</span>
              </Link>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {userSession.name || userSession.username}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {userSession.isGestor ? 'Gestor Geral' : (userSession.profileType || 'Operador')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-400 p-1.5 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
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

          {/* Direita: Ações Globais (Tema + Botão Salvar Primário apenas em módulos editáveis) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Alternador de Tema Claro/Escuro */}
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
                projectsCount, projectMunicipalities, loadingAvisos, errorAvisos, totalAvisos,
                apiAvisosAtivosCount, apiAvisosUrgentesCount, loadingFotos, errorFotos,
                totalFotos, totalCategorias, usersCountLabel, faqsCount, bannersCount,
              }}
              userName={userSession.name || userSession.username}
              latestNews={apiNews[0] ? {
                titulo: apiNews[0].titulo, data_publicacao: apiNews[0].data_publicacao, autor_nome: apiNews[0].autor_nome,
              } : undefined}
              featuredProject={data.projects?.[0] ? {
                title: data.projects[0].title, school: data.projects[0].school, municipality: data.projects[0].municipality,
              } : undefined}
              announcementTitle={(apiAvisos.find(a => (a.a_tipo_aviso?.slug === 'urgente' || a.a_tipo_aviso?.nome?.toLowerCase().includes('urgente')) && a.ativo) || apiAvisos[0])?.titulo}
              canAccessKanban={canAccessKanban}
              onOpenNews={() => router.push('/admin/noticias')}
              onCreateNews={() => router.push('/admin/noticias?action=new')}
              onOpenKanban={() => router.push('/admin/kanban')}
            />
          )}

          {/* VISÃO 5: MURAL DE AVISOS (VISÃO DEDICADA) */}
          {currentSection === 'avisos' && canAccessAnnouncements && renderCmsModule('avisos')}

          {/* VISÃO 6: GALERIA FOTOGRÁFICA (VISÃO DEDICADA) */}
          {currentSection === 'galeria' && canAccessGallery && renderCmsModule('galeria')}

          {/* VISÃO 7: REDES SOCIAIS & CONTATOS (VISÃO DEDICADA) */}
          {currentSection === 'redes' && canAccessSocials && renderCmsModule('redes')}

          {/* VISÃO 8: MÉTRICAS & TEXTOS INSTITUCIONAIS (VISÃO DEDICADA) */}
          {currentSection === 'siteInfo' && canAccessSiteInfo && renderCmsModule('siteInfo')}

          {/* VISÃO 10: ESTADOS E MUNICÍPIOS (/g_estados, /g_cidades) */}
          {currentSection === 'estadosCidades' && canAccessEstados && renderCmsModule('estadosCidades')}

        </main>
      </div>

      {/* ========================================================
          MODAL DE TELA CHEIA - SIMULAÇÃO FIEL DO PORTAL PÚBLICO
      ======================================================== */}
      <AdminPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
        type={previewModal.type}
        data={previewModal.data}
      />

    </div>
  );
}
