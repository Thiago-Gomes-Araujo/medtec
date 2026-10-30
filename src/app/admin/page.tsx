'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DatabaseSchema } from '@/types';
import { 
  Tv, 
  Newspaper, 
  Share2, 
  LogOut, 
  Plus, 
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
  Loader2,
  ChevronRight,
  ChevronDown,
  ArrowRight,
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
  AlertCircle,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, FacebookIcon } from '@/components/SocialIcons';
import { useEditorialNews } from '@/components/admin/useEditorialNews';
import { useAdminUsers } from '@/components/admin/useAdminUsers';
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
  AAviso,
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
  const [data, setData] = useState<DatabaseSchema | null>(null);
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
  const [apiAvisos, setApiAvisos] = useState<AAviso[]>([]);
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
    apiNews, effectiveNews, loadingNews, errorNews,
    reload: loadNewsData,
  } = useEditorialNews();

  // Estados de Carregamento e Erro da API v1 Oficial (para KPIs e Auditoria)
  const [loadingAvisos, setLoadingAvisos] = useState(true);
  const [errorAvisos, setErrorAvisos] = useState<string | null>(null);

  const [loadingFotos, setLoadingFotos] = useState(true);
  const [errorFotos, setErrorFotos] = useState<string | null>(null);

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

  const loadApiData = useCallback(async () => {
    // 1. Avisos e Tipos
    setLoadingAvisos(true);
    setErrorAvisos(null);
    try {
      const [tiposRes, avisosRes] = await Promise.all([
        medtecApi.tiposAviso.list({ page: 'all' }),
        medtecApi.avisos.list({ page: 'all' }),
      ]);
      if (tiposRes.success && tiposRes.data?.items) {
        setApiTiposAviso(tiposRes.data.items);
      }
      if (avisosRes.success && avisosRes.data?.items) {
        setApiAvisos(avisosRes.data.items);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar avisos/tipos:', err);
      setErrorAvisos('Falha ao comunicar com a API de Avisos');
    } finally {
      setLoadingAvisos(false);
    }

    // 2. Galeria e Categorias
    setLoadingFotos(true);
    setErrorFotos(null);
    try {
      const [catsRes, fotosRes] = await Promise.all([
        medtecApi.categoriasGaleria.list({ page: 'all' }),
        medtecApi.fotosGaleria.list({ page: 'all' }),
      ]);
      if (catsRes.success && catsRes.data?.items) {
        setApiCategorias(catsRes.data.items);
      }
      if (fotosRes.success && fotosRes.data?.items) {
        setApiFotos(fotosRes.data.items);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar galeria/categorias:', err);
      setErrorFotos('Falha ao comunicar com a API da Galeria');
    } finally {
      setLoadingFotos(false);
    }

    // 3. Canais de Contato
    try {
      const canaisRes = await medtecApi.canaisContato.list({ page: 'all' });
      if (canaisRes.success && canaisRes.data?.items) {
        setApiCanais(canaisRes.data.items);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar canais de contato:', err);
    }

    // 4. Estados
    try {
      setLoadingEstados(true);
      const estadosRes = await medtecApi.estados.list({ page: 'all' });
      if (estadosRes.success && estadosRes.data?.items) {
        setApiEstados(estadosRes.data.items);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar estados:', err);
    } finally {
      setLoadingEstados(false);
    }

    // Notícias oficiais para os KPIs da Visão Geral.
    await loadNewsData();
  }, [loadNewsData]);

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

      // 1. Tenta validar token JWT na API Backend v1 (/auth/me)
      if (medtecApi.auth.isAuthenticated()) {
        try {
          const meRes = await medtecApi.auth.me();
          if (meRes.success && meRes.data) {
            authenticated = true;
            const isGestor = meRes.data.perfil_nome === 'Administrador' || meRes.data.perfil_id === 3 || meRes.data.id === 1;
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

      // Carrega dados da API Backend v1 oficial (avisos, fotos, canais, estados, cidades)
      try {
        await loadApiData();
      } catch (apiErr) {
        console.warn('API v1: Aviso ao carregar dados oficiais do backend:', apiErr);
      }

      // Carrega configurações institucionais do portal (siteInfo, stats, socials, banners)
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // fallback silencioso
      }
    } catch (err) {
      console.error(err);
      router.push('/admin/login');
    }
  }, [router, loadApiData]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await loadData();
    };
    void run();
    return () => {
      isMounted = false;
    };
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


  // Métricas oficiais dos módulos integrados à API Rails v1 (Fonte Única de Verdade)
  const apiNewsPublishedCount = apiNews.filter((n) => n.status === 'publicada').length;
  const apiNewsDraftCount = apiNews.filter((n) => n.status === 'aguardando').length;
  const draftCount = apiNewsDraftCount;
  const totalNewsViews = effectiveNews.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const apiAvisosAtivosCount = apiAvisos.filter((a) => a.ativo).length;
  const apiAvisosUrgentesCount = apiAvisos.filter(
    (a) => a.ativo && (a.a_tipo_aviso?.slug === 'urgente' || a.a_tipo_aviso?.nome?.toLowerCase().includes('urgente'))
  ).length;

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
  const usersManagement = useAdminUsers({ enabled: isLoggedIn && canAccessUsers });
  const usersCountLabel = usersManagement.loadingUsers ? '...' : usersManagement.errorUsers ? 'Indisponível' : (usersManagement.totalUsers ?? '—');
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
          badge: errorNews ? undefined : (loadingNews ? undefined : apiNews.length),
          visible: canAccessNews,
        },
        {
          section: 'projetos',
          label: 'Projetos Pedagógicos',
          tooltip: 'Cadastrar e gerenciar projetos pedagógicos das escolas',
          icon: Lightbulb,
          badge: data?.projects?.length,
          visible: canAccessProjects,
        },
        {
          section: 'duvidas',
          label: 'Dúvidas Frequentes (FAQ)',
          tooltip: 'Cadastrar e gerenciar perguntas frequentes do portal',
          icon: HelpCircle,
          badge: data?.faqs?.length,
          visible: canAccessFaqs,
        },
        {
          section: 'avisos',
          label: 'Avisos e Comunicados',
          tooltip: 'Publicar alertas no mural',
          icon: Megaphone,
          badge: errorAvisos ? undefined : (loadingAvisos ? undefined : apiAvisos.length),
          visible: canAccessAnnouncements,
        },
        {
          section: 'fotos',
          label: 'Banners da Página Inicial',
          tooltip: 'Trocar imagens do topo da Home',
          icon: Presentation,
          badge: data?.banners?.length,
          visible: canAccessPhotos,
        },
        {
          section: 'galeria',
          label: 'Galeria de Fotos',
          tooltip: 'Adicionar fotos das escolas',
          icon: Images,
          badge: errorFotos ? undefined : (loadingFotos ? undefined : apiFotos.length),
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
          badge: apiEstados.length > 0 ? apiEstados.length : undefined,
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
          badge: usersManagement.errorUsers ? undefined : (usersManagement.totalUsers ?? undefined),
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
          <p className="text-xs text-slate-400">Autenticando e carregando painel de gestão...</p>
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
          loadingFotos={loadingFotos}
          errorFotos={errorFotos}
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
            <div className="space-y-6">
              
              {/* 1. Cabeçalho Compacto de Boas-Vindas */}
              <div className="rounded-2xl bg-gradient-to-r from-[#071731] via-[#0B254E] to-[#0A3066] text-white p-5 sm:p-6 border border-slate-700/60 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Sistema Operacional • 52 Municípios Conectados via Satélite</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">
                    Painel do Gestor • Central Executiva CMS
                  </h2>
                  <p className="text-xs text-slate-300">
                    SEDUC-RO • Olá, <strong className="text-white">{userSession.name || userSession.username}</strong>. Selecione um módulo abaixo para gerenciar publicações, triagem e governança.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link
                    href="/admin/projetos?action=new"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Novo Projeto</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      router.push('/admin/noticias?action=new');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Nova Notícia</span>
                  </button>

                  <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-sky-300" />
                    <span>Ver Portal Público</span>
                  </Link>
                </div>
              </div>

              {/* 2. Linha de Indicadores Rápidos (6 Cards no Topo) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                
                {/* KPI 1: Notícias */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Notícias e Matérias
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 flex items-center justify-center">
                      <Newspaper className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    {loadingNews ? (
                      <div className="h-9 flex items-center gap-2 text-slate-400 text-xs">
                        <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                        <span>Carregando API...</span>
                      </div>
                    ) : errorNews ? (
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Indisponível</span>
                        </p>
                        <p className="text-[10px] text-slate-400">Falha ao consultar /n_noticias</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                          {apiNews.length}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {apiNewsPublishedCount} no ar · {apiNewsDraftCount} rascunhos
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {apiNews.length === 0 ? 'Nenhuma matéria cadastrada' : 'Registros sincronizados com a API Rails'}
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      router.push('/admin/noticias');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Notícias</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* KPI: Projetos Pedagógicos */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Projetos Escolares
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40 flex items-center justify-center">
                      <Lightbulb className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {data.projects?.length || 0}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Set((data.projects || []).map(p => p.municipality)).size} municípios com práticas
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      4 trilhas de conhecimento no ar
                    </p>
                  </div>
                  <Link
                    href="/admin/projetos"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Projetos</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* KPI 2: Avisos */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Avisos e Comunicados
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                      <Megaphone className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    {loadingAvisos ? (
                      <div className="h-9 flex items-center gap-2 text-slate-400 text-xs">
                        <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                        <span>Carregando API...</span>
                      </div>
                    ) : errorAvisos ? (
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Indisponível</span>
                        </p>
                        <p className="text-[10px] text-slate-400">Falha ao consultar /a_avisos</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                          {apiAvisos.length}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {apiAvisosAtivosCount} avisos ativos no mural da Home
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {apiAvisosUrgentesCount > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                              {apiAvisosUrgentesCount} classificado{apiAvisosUrgentesCount === 1 ? '' : 's'} urgente
                            </span>
                          ) : (
                            'Nenhum comunicado urgente ativo'
                          )}
                        </p>
                      </>
                    )}
                  </div>
                  <Link
                    href="/admin/avisos"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Avisos</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* KPI: Galeria de Fotos */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Galeria de Fotos
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                      <Images className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    {loadingFotos ? (
                      <div className="h-9 flex items-center gap-2 text-slate-400 text-xs">
                        <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                        <span>Carregando API...</span>
                      </div>
                    ) : errorFotos ? (
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Galeria Indisponível</span>
                        </p>
                        <p className="text-[10px] text-slate-400">Falha ao consultar /fotos_galeria</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                          {apiFotos.length}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {apiCategorias.length} categoria{apiCategorias.length === 1 ? '' : 's'} de acervo escolar
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {apiFotos.length === 0 ? 'Nenhuma fotografia catalogada' : 'Acervo oficial sincronizado com a API Rails'}
                        </p>
                      </>
                    )}
                  </div>
                  <Link
                    href="/admin/galeria"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Galeria de Fotos</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* KPI 4: Equipe e Operadores */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Gerenciar Equipe e Senhas
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                      <UsersRound className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {usersCountLabel}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Operadores cadastrados com acesso por CPF
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Controle seguro de perfis e senhas
                    </p>
                  </div>
                  <Link
                    href="/admin/usuarios"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Operadores</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* KPI: Dúvidas Frequentes (FAQ) */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Dúvidas Frequentes (FAQ)
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-[#004A99] dark:text-sky-400 border border-sky-100/60 dark:border-sky-900/40 flex items-center justify-center">
                      <HelpCircle className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {data.faqs?.length || 0}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Perguntas ativas na Central de Dúvidas
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Respostas oficiais para a comunidade
                    </p>
                  </div>
                  <Link
                    href="/admin/faq"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Dúvidas</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

              </div>

              {/* 3. Grade Principal de Módulos do Sistema (6 Launcher Cards com linguagem 100% didática) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    O que você deseja gerenciar agora?
                  </h3>
                  <span className="text-xs text-slate-400">
                    Clique em um módulo para abrir seu espaço de trabalho
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  
                  {/* Módulo 01: Notícias e Matérias */}
                  <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                            <Newspaper className="h-4 w-4" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Notícias e Matérias
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                          {loadingNews ? 'Carregando...' : errorNews ? 'Indisponível' : `${apiNews.length} matérias`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Tudo o que você publicar aqui aparecerá imediatamente na página &ldquo;Notícias&rdquo; e na grade principal do site oficial.
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Última publicação no ar:
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                          {loadingNews ? 'Carregando...' : errorNews ? 'Falha de comunicação com a API' : (apiNews[0]?.titulo || 'Nenhuma notícia publicada ainda')}
                        </p>
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          {apiNews[0] ? `${apiNews[0].data_publicacao || ''} • ${apiNews[0].autor_nome || 'SEDUC-RO'}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        router.push('/admin/noticias');
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Abrir Notícias e Matérias</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Módulo: Projetos Pedagógicos e Práticas Escolares */}
                  <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-500/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40 flex items-center justify-center">
                            <Lightbulb className="h-4 w-4" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Projetos Pedagógicos
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200/80 dark:border-amber-800/80">
                          {data.projects?.length || 0} missões
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Cadastre e edite práticas escolares de campo, trilhas temáticas curriculares, docentes mediadores e guias de replicação pedagógica.
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Prática em destaque:
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                          {data.projects?.[0]?.title || 'Nenhum projeto cadastrado'}
                        </p>
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          {data.projects?.[0]?.school || 'SEDUC-RO'} • {data.projects?.[0]?.municipality || 'Rondônia'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/admin/projetos"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <span>Abrir Projetos</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/admin/projetos?action=new"
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        title="Cadastrar Novo Projeto"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Novo</span>
                      </Link>
                    </div>
                  </div>

                  {/* Módulo 02: Avisos e Comunicados */}
                  <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                            <Megaphone className="h-4 w-4" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Avisos e Comunicados
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                          {loadingAvisos ? 'Carregando...' : errorAvisos ? 'Indisponível' : `${apiAvisos.length} avisos`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Use esta área para postar comunicados oficiais. Todos os avisos ativos aparecem com destaque na Página Inicial do portal.
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Último comunicado urgente ativo:
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                          {loadingAvisos ? 'Carregando...' : errorAvisos ? 'Falha de comunicação com a API' : ((apiAvisos.find(a => (a.a_tipo_aviso?.slug === 'urgente' || a.a_tipo_aviso?.nome?.toLowerCase().includes('urgente')) && a.ativo) || apiAvisos[0])?.titulo || 'Sem comunicados urgentes no momento')}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                          {apiAvisosAtivosCount} avisos em exibição no portal
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/avisos"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Abrir Avisos e Comunicados</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Módulo 03: Banners da Página Inicial */}
                  <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                            <Presentation className="h-4 w-4" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Banners da Página Inicial
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                          {data.banners?.length || 0} banners
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Troque as imagens grandes que passam no carrossel de entrada da Página Inicial do portal, fotos de estúdio e transmissão ao vivo.
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Carrossel & Transmissão:
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                          {data.banners?.length || 0} banners ativos no carrossel da página inicial, foto do estúdio e capas de destaque.
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                          Transmissão ao vivo integrada
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/banners"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Trocar Banners da Home</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Módulo 04: Galeria de Fotos */}
                  <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                            <Images className="h-4 w-4" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Galeria de Fotos
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                          {loadingFotos ? 'Carregando...' : errorFotos ? 'Indisponível' : `${apiFotos.length} fotos`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Todas as fotos enviadas aqui aparecem na aba pública &ldquo;Galeria&rdquo;, destacando as salas de aula, estúdios e feiras escolares nos municípios.
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Acervo Pedagógico de Rondônia:
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                          {loadingFotos ? 'Carregando...' : errorFotos ? 'Falha de comunicação com a API' : `${apiFotos.length} fotos catalogadas no acervo oficial da API Rails v1.`}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                          Fotos públicas visíveis no portal
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/galeria"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Abrir Galeria de Fotos</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Módulo 05: Fila de Aprovação (Passo a Passo) */}
                  <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Fila de Aprovação (Passo a Passo)
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                          {loadingNews ? '...' : errorNews ? 'Indisponível' : `${apiNewsDraftCount} pendentes`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Acompanhe o fluxo de reportagens: triagem em rascunho, validação jurídica/LGPD e aprovação final para publicação oficial no site.
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Triagem & Governança Editorial:
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                          {loadingNews ? 'Carregando...' : errorNews ? 'Falha de comunicação com a API' : `${apiNewsDraftCount} matéria${apiNewsDraftCount === 1 ? '' : 's'} no fluxo de triagem e governança editorial.`}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                          Fluxo: Rascunho ➔ Revisão ➔ Publicado
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canAccessKanban}
                      onClick={() => router.push('/admin/kanban')}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Abrir Fila de Aprovação</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Módulo 06: Dados, Contatos e Equipe */}
                  <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                            <SlidersHorizontal className="h-4 w-4" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Dados, Contatos e Equipe
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                          {usersCountLabel} operadores
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Atualize a quantidade oficial de alunos e escolas no rodapé, links de redes sociais/WhatsApp e cadastre operadores por CPF.
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <Link
                          href="/admin/institucional"
                          className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071324] hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200/60 dark:hover:border-blue-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer group"
                        >
                          <span className="flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                            <span>Números de Alunos e Escolas</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition" />
                        </Link>
                        <Link
                          href="/admin/redes"
                          className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071324] hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200/60 dark:hover:border-blue-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer group"
                        >
                          <span className="flex items-center gap-2">
                            <Share2 className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                            <span>Redes Sociais e WhatsApp</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition" />
                        </Link>
                        <Link
                          href="/admin/usuarios"
                          className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071324] hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200/60 dark:hover:border-blue-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer group"
                        >
                          <span className="flex items-center gap-2">
                            <UserCog className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                            <span>Gerenciar Equipe e Senhas ({usersCountLabel})</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition" />
                        </Link>
                      </div>
                    </div>

                    <Link
                      href="/admin/institucional"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Gerenciar Dados e Configurações</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Módulo: Central de Dúvidas Frequentes (FAQ) */}
                  <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-[#004A99] dark:text-sky-400 border border-sky-100/60 dark:border-sky-900/40 flex items-center justify-center">
                            <HelpCircle className="h-4 w-4" />
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Dúvidas Frequentes (FAQ)
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                          {data.faqs?.length || 0} dúvidas
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Cadastre e edite perguntas e respostas oficiais da SEDUC sobre aulas ao vivo, sinal satelital, professores mediadores e certificação.
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Central de Respostas Oficiais:
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                          {data.faqs && data.faqs.length > 0
                            ? `${data.faqs.length} dúvidas catalogadas em 4 categorias para estudantes, mediadores e gestores.`
                            : 'Nenhuma dúvida cadastrada ainda.'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                          Aparece na tela pública /duvidas
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/faq"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Abrir Central de Dúvidas</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                </div>
              </div>

            </div>
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
