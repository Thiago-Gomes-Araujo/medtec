'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DatabaseSchema, NewsItem, ProjectMission, ReplicationWeek } from '@/types';
import { 
  Tv, 
  Newspaper, 
  Share2, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Eye, 
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
  Camera,
  Loader2,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
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
  GraduationCap,
  MapPin,
  School,
  Sparkles,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Lock,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, FacebookIcon } from '@/components/SocialIcons';
import NewsModule, { type NewsModuleHandle } from '@/components/admin/NewsModule';
import EditorialKanban from '@/components/EditorialKanban';
import SitePhotosManager from '@/components/SitePhotosManager';
import AdminLiveSimulator, { AdminPreviewModal, PreviewContentType, PreviewItemData } from '@/components/AdminLiveSimulator';
import UserManager from '@/components/UserManager';
import SocialChannelsModule from '@/components/admin/SocialChannelsModule';
import SiteInfoModule from '@/components/admin/SiteInfoModule';
import EstadosCidadesModule from '@/components/admin/EstadosCidadesModule';
import GalleryModule from '@/components/admin/GalleryModule';
import AnnouncementsModule from '@/components/admin/AnnouncementsModule';
import { FaqItem, FaqCategory } from '@/types';
import {
  medtecApi,
  getMediaUrl,
  clearStoredTokens,
  ATipoAviso,
  AAviso,
  CategoriaGaleria,
  FotoGaleria,
  CanalContato,
  Estado,
  NNoticia,
  NCategoriaNoticia,
} from '@/lib/api';

type AdminSection = 'visaoGeral' | 'kanban' | 'fotos' | 'noticias' | 'avisos' | 'galeria' | 'redes' | 'siteInfo' | 'usuarios' | 'projetos' | 'duvidas' | 'estadosCidades';
type CmsSubTab = 'fotos' | 'noticias' | 'avisos' | 'galeria' | 'redes' | 'siteInfo' | 'projetos' | 'duvidas' | 'estadosCidades';

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
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentSection, setCurrentSection] = useState<AdminSection>('visaoGeral');
  const newsModuleRef = useRef<NewsModuleHandle>(null);
  const handleNewNews = () => newsModuleRef.current?.newNews();
  const [newsViewMode, setNewsViewMode] = useState<'lista' | 'editor'>('lista');
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
  }>({ isGestor: false });

  // Estado para formulário de Projeto Pedagógico (novo ou edição)
  const [editingProject, setEditingProject] = useState<ProjectMission | null>(null);
  const [projectViewMode, setProjectViewMode] = useState<'lista' | 'editor'>('lista');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [selectedProjectTrack, setSelectedProjectTrack] = useState<string>('Todas as Trilhas');
  const [competenciasInput, setCompetenciasInput] = useState('');
  const [materialsInput, setMaterialsInput] = useState('');

  const defaultProjectTimeline: ReplicationWeek[] = [
    { week: 1, title: 'Semana 01 • Introdução e Sensibilização', studioAction: 'Transmissão síncrona pelo canal MEDTEC introduzindo o tema curricular e desafio territorial.', fieldAction: 'Roda de conversa com a comunidade escolar e formação dos grupos de trabalho discentes.' },
    { week: 2, title: 'Semana 02 • Diagnóstico e Levantamento de Campo', studioAction: 'Oficina técnica de coleta de dados locais, segurança na pesquisa e uso de ferramentas.', fieldAction: 'Entrevistas locais, registros fotográficos e diagnóstico participativo das demandas escolares.' },
    { week: 3, title: 'Semana 03 • Aplicação Prática e Prototipagem', studioAction: 'Orientação síncrona com os professores ministrantes e resolução conjunta de dúvidas.', fieldAction: 'Construção da intervenção prática na escola (canteiros, protótipos, podcasts ou montagens).' },
    { week: 4, title: 'Semana 04 • Culminância e Apresentação Comunitária', studioAction: 'Transmissão estadual especial celebrando as conquistas dos estudantes rondonienses.', fieldAction: 'Apresentação pública dos resultados, entrega de certificados e celebração com as famílias.' },
  ];

  const emptyProjectForm: Partial<ProjectMission> = {
    number: '',
    missionCode: '',
    title: '',
    shortTitle: '',
    track: 'Agroecologia & NBAZ',
    territory: 'Vale do Jamari • Região Central',
    typology: 'Comunidade Ribeirinha Fluvial',
    municipality: 'Porto Velho',
    school: '',
    mediatorName: '',
    mediatorRole: 'Docente Mediador(a) Tecnológico(a)',
    mediatorInitials: '',
    studentCohort: '3º Ano A - Ensino Médio Regular',
    seal: 'Inovação e Prática de Campo',
    image: '',
    initialApplause: 140,
    desafioLocal: {
      title: '',
      description: '',
    },
    praticaMedtec: {
      title: '',
      description: '',
    },
    impactoGerado: {
      title: '',
      metric: '',
      description: '',
    },
    competencias: [],
    quote: '',
    replicationGuide: {
      materials: [],
      timeline: defaultProjectTimeline,
      pedagogicalTip: '',
    },
  };

  const [projectForm, setProjectForm] = useState<Partial<ProjectMission>>(emptyProjectForm);

  // Estado para formulário de Dúvidas Frequentes (FAQ)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqViewMode, setFaqViewMode] = useState<'lista' | 'editor'>('lista');
  const [faqSearchTerm, setFaqSearchTerm] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('Todas as Dúvidas');
  const [faqTagsInput, setFaqTagsInput] = useState('');

  const emptyFaqForm: Partial<FaqItem> = {
    index: '',
    question: '',
    answer: '',
    category: 'Metodologia & Aulas ao Vivo',
    personas: ['estudantes', 'mediadores'],
    actionLink: {
      label: '',
      href: '',
    },
    tags: ['MEDTEC', 'Rondônia'],
  };

  const [faqForm, setFaqForm] = useState<Partial<FaqItem>>(emptyFaqForm);

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

  // Upload status
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Notícias e Categorias (/n_noticias, /n_categorias_noticia)
  const [apiNews, setApiNews] = useState<NNoticia[]>([]);
  const [apiNewsCategories, setApiNewsCategories] = useState<NCategoriaNoticia[]>([]);

  // Estados de Carregamento e Erro da API v1 Oficial (para KPIs e Auditoria)
  const [loadingAvisos, setLoadingAvisos] = useState(true);
  const [errorAvisos, setErrorAvisos] = useState<string | null>(null);

  const [loadingFotos, setLoadingFotos] = useState(true);
  const [errorFotos, setErrorFotos] = useState<string | null>(null);

  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);

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

  // Carregamento de dados da API v1 oficial
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

    // 5. Notícias e Categorias do CMS
    setLoadingNews(true);
    setErrorNews(null);
    try {
      const [catsRes, newsRes] = await Promise.all([
        medtecApi.noticias.listCategorias({ page: 'all', 'q[ativo_true]': 1 }),
        medtecApi.noticias.list({ page: 'all' }),
      ]);
      if (catsRes.success && catsRes.data?.items) {
        setApiNewsCategories(catsRes.data.items);
      }
      if (!catsRes.success || !catsRes.data?.items || !newsRes.success || !newsRes.data?.items) {
        throw new Error('Resposta inválida da API de Notícias');
      }
      setApiNews(newsRes.data.items);
    } catch (err) {
      console.warn('API v1: Erro ao listar notícias/categorias do backend:', err);
      setErrorNews('Falha ao comunicar com a API de Notícias');
    } finally {
      setLoadingNews(false);
    }
  }, []);

  // Carrega dados iniciais e verifica sessão
  const loadData = useCallback(async () => {
    await Promise.resolve();
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
            });

            if (!isGestor) {
              if (meRes.data.perfil_nome === 'Editor de Notícias') {
                setCurrentSection('noticias');
              } else if (meRes.data.perfil_nome === 'Curador de Fotos') {
                setCurrentSection('fotos');
              } else if (meRes.data.perfil_nome === 'Publicador de Avisos') {
                router.push('/admin/avisos');
                return;
              } else {
                setCurrentSection('noticias');
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
              setCurrentSection('noticias');
            } else if (profileType === 'Curador de Fotos') {
              setCurrentSection('fotos');
            } else if (profileType === 'Publicador de Avisos') {
              router.push('/admin/avisos');
              return;
            } else {
              setCurrentSection('noticias');
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
      if (tabParam === 'avisos') {
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

  // Upload genérico de arquivo de imagem
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'project') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (res.ok && resData.url) {
        if (targetField === 'project') {
          setProjectForm(prev => ({ ...prev, image: resData.url }));
        }
      } else {
        alert('Erro ao enviar imagem: ' + (resData.error || 'Erro desconhecido'));
      }
    } catch {
      alert('Falha no upload da foto.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Salvar banco de dados completo no servidor
  const persistData = async (newData: DatabaseSchema) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      if (res.ok) {
        setData(newData);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Erro ao salvar dados no disco.');
      }
    } catch {
      alert('Erro de conexão com a API.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (id: string) => {
    if (!userSession.isGestor) {
      alert('Publicação e despublicação exigem permissão de administrador na API.');
      return;
    }
    const numId = Number(id);
    if (!numId) return;

    try {
      const current = apiNews.find(n => n.id === numId);
      if (current?.status === 'publicada') {
        await medtecApi.noticias.despublicar(numId);
        alert('Notícia despublicada com sucesso. Ela retornou à fila de aprovação.');
      } else {
        await medtecApi.noticias.publicar(numId);
        alert('Notícia publicada com sucesso!');
      }
      await loadApiData();
    } catch (err: unknown) {
      const error = err as { errors?: string[]; message?: string };
      alert('Erro ao alterar status da notícia: ' + (error?.errors?.join(', ') || error?.message || 'Falha na operação.'));
    }
  };

  const handleApproveNews = async (id: string): Promise<boolean> => {
    const numId = Number(id);
    if (!numId) return false;

    try {
      await medtecApi.noticias.publicar(numId);
      await loadApiData();
      return true;
    } catch (err: unknown) {
      const error = err as { errors?: string[]; message?: string };
      alert('Não foi possível aprovar a notícia: ' + (error?.errors?.join(', ') || error?.message || 'Apenas administradores possuem permissão para publicar.'));
      return false;
    }
  };

  const handleRejectNews = async (id: string, reason?: string): Promise<boolean> => {
    const numId = Number(id);
    if (!numId) return false;

    if (!reason || !reason.trim()) {
      alert('É obrigatório informar o motivo da reprovação.');
      return false;
    }

    try {
      await medtecApi.noticias.reprovar(numId, reason.trim());
      await loadApiData();
      return true;
    } catch (err: unknown) {
      const error = err as { errors?: string[]; message?: string };
      alert('Não foi possível reprovar a notícia: ' + (error?.errors?.join(', ') || error?.message || 'Apenas administradores possuem permissão para reprovar.'));
      return false;
    }
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


  // Funções de Gestão de Projetos Pedagógicos
  const handleNewProject = () => {
    const nextNum = String((data?.projects?.length || 0) + 1).padStart(2, '0');
    setEditingProject(null);
    setProjectForm({
      ...emptyProjectForm,
      number: nextNum,
      missionCode: `Projeto ${nextNum}`,
      replicationGuide: {
        materials: [],
        timeline: defaultProjectTimeline,
        pedagogicalTip: '',
      },
    });
    setCompetenciasInput('');
    setMaterialsInput('');
    setProjectViewMode('editor');
  };

  const handleEditProject = (item: ProjectMission) => {
    setEditingProject(item);
    setProjectForm({ ...item });
    setCompetenciasInput((item.competencias || []).join(', '));
    setMaterialsInput((item.replicationGuide?.materials || []).join('\n'));
    setProjectViewMode('editor');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDeleteProject = (_id: string) => {
    alert('A exclusão de projetos pedagógicos está desabilitada aguardando a disponibilização dos endpoints oficiais pelo backend Rails (/p_projetos). Nenhuma gravação local é simulada.');
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    alert('A criação e edição de projetos pedagógicos estão desabilitadas aguardando a disponibilização dos endpoints oficiais pelo backend Rails (/p_projetos). A persistência em disco local foi descontinuada para cumprir a diretriz de fonte única de dados.');
  };

  const handleNewFaq = () => {
    setEditingFaq(null);
    const count = (data?.faqs || []).length;
    const nextIndex = String(count + 1).padStart(2, '0');
    setFaqForm({
      ...emptyFaqForm,
      index: nextIndex,
    });
    setFaqTagsInput('MEDTEC, Rondônia');
    setFaqViewMode('editor');
  };

  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFaqForm({
      ...faq,
      actionLink: faq.actionLink ? { ...faq.actionLink } : { label: '', href: '' },
      personas: [...faq.personas],
      tags: [...faq.tags],
    });
    setFaqTagsInput(faq.tags.join(', '));
    setFaqViewMode('editor');
  };

  const handleDeleteFaq = (_id: string) => {
    alert('A exclusão de dúvidas frequentes (FAQ) está desabilitada aguardando a disponibilização dos endpoints oficiais pelo backend Rails (/faqs). Nenhuma gravação local é simulada.');
  };

  const handleToggleFaqPersona = (persona: 'estudantes' | 'mediadores' | 'gestores') => {
    const current = faqForm.personas || [];
    const next = current.includes(persona)
      ? current.filter((p) => p !== persona)
      : [...current, persona];
    setFaqForm((prev) => ({ ...prev, personas: next }));
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    alert('A criação e edição de dúvidas frequentes (FAQ) estão desabilitadas aguardando a disponibilização dos endpoints oficiais pelo backend Rails (/faqs). A persistência em disco local foi descontinuada para cumprir a diretriz de fonte única de dados.');
  };

  const effectiveNews: NewsItem[] = useMemo(() => {
    return apiNews.map((n) => ({
      id: String(n.id),
      title: n.titulo,
      slug: n.slug,
      excerpt: n.resumo || '',
      content: n.conteudo,
      coverImage: getMediaUrl(n.imagem_capa),
      author: n.autor_nome,
      category: n.categoria_nome,
      publishedAt: n.data_publicacao,
      featured: false,
      urgent: false,
      folder: n.categoria_nome || 'Geral',
      published: n.status === 'publicada',
      rejected: n.status === 'reprovada',
      rejectionReason: n.motivo_reprovacao || undefined,
      views: 0,
      tags: [],
    }));
  }, [apiNews]);

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
  const canAccessKanban = userSession.isGestor;
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
          badge: data?.users?.length,
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

    if (tab === 'fotos' && canAccessPhotos) {
      const activeBanner = data.banners?.[0] || {
        id: 'banner-default',
        title: 'Ensino Médio com Mediação Tecnológica em Rondônia',
        imageUrl: data.siteInfo.heroImage || '/hero.jpg',
        linkUrl: '',
      };
      return (
        <div className="space-y-6">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Gerenciador de Banners:</strong> A persistência deste módulo aguarda a disponibilização do endpoint oficial no backend Rails. A gravação em disco local foi desabilitada para cumprir a diretriz de fonte única de dados. As fotos da galeria e as capas de notícias são gerenciadas exclusivamente nas respectivas abas integradas à API.
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-7 min-w-0">
              <SitePhotosManager
                data={data}
                saving={saving}
                onSave={(_next) => {
                  alert('A gravação de banners está desabilitada aguardando a disponibilização do endpoint oficial no backend Rails. A persistência em disco local foi descontinuada.');
                }}
                onPreview={(banner) => setPreviewModal({ isOpen: true, type: 'banner', data: banner })}
              />
            </div>
            <div className="xl:col-span-5 min-w-0">
              <AdminLiveSimulator
                type="banner"
                data={activeBanner}
                onOpenFullscreen={() => setPreviewModal({ isOpen: true, type: 'banner', data: activeBanner })}
              />
            </div>
          </div>
        </div>
      );
    }

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

    if (tab === 'projetos' && canAccessProjects) {
      const projectsList = data.projects || [];
      const trackOptions = [
        'Todas as Trilhas',
        'Agroecologia & NBAZ',
        'Ciência na Amazônia',
        'Saberes Indígenas & História',
        'Tecnologia Solar & Robótica'
      ] as const;

      const getTrackBadgeClass = (track?: string) => {
        switch (track) {
          case 'Agroecologia & NBAZ':
            return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
          case 'Ciência na Amazônia':
            return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
          case 'Saberes Indígenas & História':
            return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
          case 'Tecnologia Solar & Robótica':
            return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
          default:
            return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
      };

      const filteredProjects = projectsList.filter((p) => {
        const matchesTrack =
          selectedProjectTrack === 'Todas as Trilhas' || p.track === selectedProjectTrack;
        const q = projectSearchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          (p.shortTitle && p.shortTitle.toLowerCase().includes(q)) ||
          p.school.toLowerCase().includes(q) ||
          p.municipality.toLowerCase().includes(q) ||
          p.mediatorName.toLowerCase().includes(q) ||
          (p.missionCode && p.missionCode.toLowerCase().includes(q));
        return matchesTrack && matchesSearch;
      });

      return (
        <div className="space-y-6">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Módulo em Homologação Técnica:</strong> As operações de criação, edição e exclusão de projetos pedagógicos estão desabilitadas aguardando a disponibilização dos endpoints oficiais pelo backend Rails (<code className="font-mono text-[11px]">/p_projetos</code>). Nenhuma persistência simulada em disco local é utilizada.
            </span>
          </div>

          {/* Sub-navegação Interna: Lista vs Editor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProjectViewMode('lista')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  projectViewMode === 'lista'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Lightbulb className="h-4 w-4" />
                <span>Projetos Cadastrados ({projectsList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (projectViewMode !== 'editor') {
                    handleNewProject();
                  }
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  projectViewMode === 'editor'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>{editingProject ? `Editando: ${projectForm.missionCode || 'Missão'}` : 'Novo Projeto'}</span>
              </button>
            </div>

            {projectViewMode === 'lista' ? (
              <button
                type="button"
                onClick={handleNewProject}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Cadastrar Novo Projeto</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingProject(null);
                  setProjectViewMode('lista');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar para Lista de Projetos</span>
              </button>
            )}
          </div>

          {/* ========================================================
              VISÃO 1: LISTAGEM E GERENCIAMENTO DE PROJETOS
          ======================================================== */}
          {projectViewMode === 'lista' && (
            <div className="space-y-6">
              {/* Barra de Filtros e Busca */}
              <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Busca por Texto */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={projectSearchTerm}
                      onChange={(e) => setProjectSearchTerm(e.target.value)}
                      placeholder="Buscar por título, escola, município ou docente..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-500 transition"
                    />
                    {projectSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setProjectSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {filteredProjects.length}
                    </span>
                    <span>de {projectsList.length} projetos exibidos</span>
                  </div>
                </div>

                {/* Filtro de Trilhas Temáticas */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {trackOptions.map((tr) => {
                    const isSelected = selectedProjectTrack === tr;
                    return (
                      <button
                        key={tr}
                        type="button"
                        onClick={() => setSelectedProjectTrack(tr)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                          isSelected
                            ? 'bg-[#004A99] text-white border-[#004A99] shadow-xs dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{tr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid de Cards de Projetos */}
              {filteredProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Nenhum projeto encontrado com os filtros atuais
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Tente alterar os termos de busca ou selecionar outra trilha temática curricular.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {(projectSearchTerm || selectedProjectTrack !== 'Todas as Trilhas') && (
                      <button
                        type="button"
                        onClick={() => {
                          setProjectSearchTerm('');
                          setSelectedProjectTrack('Todas as Trilhas');
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                        Limpar Filtros
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleNewProject}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-xs"
                    >
                      + Cadastrar Novo Projeto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      {/* Topo: Imagem de Capa com Tags */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                        <img
                          src={project.image || '/hero.jpg'}
                          alt={project.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-black/60 backdrop-blur-md text-white border border-white/20">
                            #{project.number || '00'}
                          </span>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getTrackBadgeClass(project.track)}`}>
                            {project.track}
                          </span>
                        </div>

                        <div className="absolute bottom-2.5 left-3 right-3 text-white">
                          <p className="text-[11px] font-semibold text-sky-300 truncate">
                            {project.seal || 'Prática Escolar Inovadora'}
                          </p>
                          <p className="text-xs font-bold text-white truncate">
                            {project.school}
                          </p>
                        </div>
                      </div>

                      {/* Corpo do Card */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {project.municipality}
                            </span>
                            <span>•</span>
                            <span className="truncate">{project.territory}</span>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {project.title}
                          </h3>

                          {project.shortTitle && project.shortTitle !== project.title && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                              &ldquo;{project.shortTitle}&rdquo;
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                            <p className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium truncate">
                              <GraduationCap className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400 shrink-0" />
                              <span className="truncate">{project.mediatorName}</span>
                              <span className="text-[10px] text-slate-400">({project.mediatorInitials || 'MD'})</span>
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pl-5">
                              {project.studentCohort}
                            </p>
                          </div>

                          {/* Snippet do Desafio / Prática */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                            <p className="line-clamp-2">
                              <strong className="text-slate-800 dark:text-slate-200">Prática:</strong> {project.praticaMedtec?.description || project.praticaMedtec?.title || 'Metodologia ativa MEDTEC.'}
                            </p>
                          </div>
                        </div>

                        {/* Rodapé do Card com Ações */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {(project.competencias || []).slice(0, 3).map((comp) => (
                              <span
                                key={comp}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[140px]"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleEditProject(project)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#004A99] hover:bg-[#003875] text-white transition cursor-pointer shadow-xs"
                                title="Editar dados da missão"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Editar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                title="Excluir projeto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <Link
                              href="/projetos"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#004A99] dark:hover:text-sky-400 transition"
                              title="Visualizar no portal público"
                            >
                              <span>Ver no Portal</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              VISÃO 2: FORMULÁRIO DE CADASTRO E EDIÇÃO DE PROJETO
          ======================================================== */}
          {projectViewMode === 'editor' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Coluna Principal: Formulário Estruturado */}
              <div className="xl:col-span-7 bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                
                {/* Cabeçalho do Editor */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {editingProject ? `Editar Missão #${projectForm.number || ''}` : 'Cadastrar Novo Projeto Pedagógico'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Preencha os campos pedagógicos, localização e guias para publicação no portal oficial do MEDTEC.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                    {projectForm.missionCode || 'Projeto'}
                  </span>
                </div>

                <form onSubmit={handleSaveProject} className="space-y-8">
                  
                  {/* Seção 1: Identificação Básica & Trilha */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#004A99] dark:text-sky-400 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>1. Identificação da Missão e Trilha Curricular</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Número da Missão *
                        </label>
                        <input
                          type="text"
                          required
                          value={projectForm.number || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, number: e.target.value }))}
                          placeholder="Ex: 01, 07"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Código de Exibição
                        </label>
                        <input
                          type="text"
                          value={projectForm.missionCode || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, missionCode: e.target.value }))}
                          placeholder="Ex: Projeto 01"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Selo Institucional
                        </label>
                        <input
                          type="text"
                          value={projectForm.seal || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, seal: e.target.value }))}
                          placeholder="Ex: Inovação Rural Sustentável"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Trilha Temática Curricular *
                      </label>
                      <select
                        value={projectForm.track || 'Agroecologia & NBAZ'}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, track: e.target.value as ProjectMission['track'] }))}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                      >
                        <option value="Agroecologia & NBAZ">Agroecologia & NBAZ</option>
                        <option value="Ciência na Amazônia">Ciência na Amazônia</option>
                        <option value="Saberes Indígenas & História">Saberes Indígenas & História</option>
                        <option value="Tecnologia Solar & Robótica">Tecnologia Solar & Robótica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Título Oficial da Prática Escolar *
                      </label>
                      <input
                        type="text"
                        required
                        value={projectForm.title || ''}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Sistemas Agroflorestais & Hortas Suspensas em Jirau"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Título Curto / Linha de Apoio
                      </label>
                      <input
                        type="text"
                        value={projectForm.shortTitle || ''}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, shortTitle: e.target.value }))}
                        placeholder="Ex: Hortas em Jirau & Agrofloresta"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                      />
                    </div>
                  </div>

                  {/* Seção 2: Localização e Unidade Escolar */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#004A99] dark:text-sky-400 flex items-center gap-2">
                      <School className="h-4 w-4" />
                      <span>2. Localização e Comunidade Escolar</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Município de Rondônia *
                        </label>
                        <input
                          type="text"
                          required
                          value={projectForm.municipality || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, municipality: e.target.value }))}
                          placeholder="Ex: Porto Velho, Machadinho d'Oeste"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Escola Estadual Polo/Atendida *
                        </label>
                        <input
                          type="text"
                          required
                          value={projectForm.school || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, school: e.target.value }))}
                          placeholder="Ex: EEEFM Nazaré"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Território / Região
                        </label>
                        <input
                          type="text"
                          value={projectForm.territory || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, territory: e.target.value }))}
                          placeholder="Ex: Baixo Madeira • Distrito de Nazaré"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Tipologia da Comunidade
                        </label>
                        <input
                          type="text"
                          value={projectForm.typology || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, typology: e.target.value }))}
                          placeholder="Ex: Comunidade Ribeirinha Fluvial, Escola Rural Polo"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção 3: Docência Mediadora & Turma */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#004A99] dark:text-sky-400 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>3. Corpo Docente Mediador e Turma</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Nome do(a) Professor(a) Mediador(a) *
                        </label>
                        <input
                          type="text"
                          required
                          value={projectForm.mediatorName || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, mediatorName: e.target.value }))}
                          placeholder="Ex: Profª Francisca Ribeiro"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Iniciais
                        </label>
                        <input
                          type="text"
                          value={projectForm.mediatorInitials || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, mediatorInitials: e.target.value }))}
                          placeholder="Ex: FR"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Especialidade / Função do Docente
                        </label>
                        <input
                          type="text"
                          value={projectForm.mediatorRole || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, mediatorRole: e.target.value }))}
                          placeholder="Ex: Bióloga & Mediadora Tecnológica"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Turma / Ano dos Estudantes
                        </label>
                        <input
                          type="text"
                          value={projectForm.studentCohort || ''}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, studentCohort: e.target.value }))}
                          placeholder="Ex: 3º Ano A - Ensino Médio Regular"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Depoimento / Citação do Docente Mediador
                      </label>
                      <textarea
                        rows={2}
                        value={projectForm.quote || ''}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, quote: e.target.value }))}
                        placeholder="Ex: Quando a tecnologia se alia ao saber ancestral dos ribeirinhos, a escola se transforma em sementeira."
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                      />
                    </div>
                  </div>

                  {/* Seção 4: Fotografia de Capa & Upload */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#004A99] dark:text-sky-400 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      <span>4. Fotografia de Capa do Projeto</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Enviar Foto do Computador
                          </label>
                          <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-[#004A99] dark:hover:border-sky-500 cursor-pointer transition bg-slate-50 dark:bg-slate-900/50">
                            <Upload className="h-4 w-4 text-[#004A99] dark:text-sky-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {uploadingImage ? 'Enviando...' : 'Selecionar arquivo de imagem'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingImage}
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'project')}
                            />
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Ou URL / Caminho da Imagem
                          </label>
                          <input
                            type="text"
                            value={projectForm.image || ''}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, image: e.target.value }))}
                            placeholder="Ex: /hero.jpg ou https://..."
                            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                          />
                        </div>
                      </div>

                      {/* Miniatura de Preview */}
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 h-36 flex items-center justify-center relative">
                        {projectForm.image ? (
                          <img
                            src={projectForm.image}
                            alt="Capa do projeto"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 text-slate-400">
                            <Camera className="h-6 w-6 mx-auto mb-1 opacity-60" />
                            <span className="text-[11px]">Nenhuma foto selecionada</span>
                          </div>
                        )}
                        {projectForm.image && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                            Foto Ativa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seção 5: Tríade Pedagógica MEDTEC */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#004A99] dark:text-sky-400 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>5. Tríade Pedagógica MEDTEC (Desafio, Prática e Impacto)</span>
                    </h3>

                    {/* Desafio Local */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                        A. Desafio Local Enfrentado
                      </span>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Título do Desafio
                        </label>
                        <input
                          type="text"
                          value={projectForm.desafioLocal?.title || ''}
                          onChange={(e) => setProjectForm(prev => ({
                            ...prev,
                            desafioLocal: { ...prev.desafioLocal, title: e.target.value, description: prev.desafioLocal?.description || '' }
                          }))}
                          placeholder="Ex: Alagamento sazonal e isolamento fluvial"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Descrição Detalhada do Desafio
                        </label>
                        <textarea
                          rows={2}
                          value={projectForm.desafioLocal?.description || ''}
                          onChange={(e) => setProjectForm(prev => ({
                            ...prev,
                            desafioLocal: { ...prev.desafioLocal, title: prev.desafioLocal?.title || '', description: e.target.value }
                          }))}
                          placeholder="Descreva a realidade da comunidade antes da intervenção..."
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    {/* Prática MEDTEC */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                        B. Metodologia com Mediação Tecnológica
                      </span>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Título da Prática Pedagógica
                        </label>
                        <input
                          type="text"
                          value={projectForm.praticaMedtec?.title || ''}
                          onChange={(e) => setProjectForm(prev => ({
                            ...prev,
                            praticaMedtec: { ...prev.praticaMedtec, title: e.target.value, description: prev.praticaMedtec?.description || '' }
                          }))}
                          placeholder="Ex: Construção de canteiros suspensos e compostagem assistida"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Descrição da Metodologia Aplicada
                        </label>
                        <textarea
                          rows={2}
                          value={projectForm.praticaMedtec?.description || ''}
                          onChange={(e) => setProjectForm(prev => ({
                            ...prev,
                            praticaMedtec: { ...prev.praticaMedtec, title: prev.praticaMedtec?.title || '', description: e.target.value }
                          }))}
                          placeholder="Como a mediação tecnológica e as aulas conectadas foram utilizadas em campo..."
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    {/* Impacto Gerado */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        C. Impacto Comunitário e Métrica
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Título do Impacto
                          </label>
                          <input
                            type="text"
                            value={projectForm.impactoGerado?.title || ''}
                            onChange={(e) => setProjectForm(prev => ({
                              ...prev,
                              impactoGerado: { ...prev.impactoGerado, title: e.target.value, metric: prev.impactoGerado?.metric || '', description: prev.impactoGerado?.description || '' }
                            }))}
                            placeholder="Ex: Segurança alimentar e protagonismo"
                            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Métrica em Destaque
                          </label>
                          <input
                            type="text"
                            value={projectForm.impactoGerado?.metric || ''}
                            onChange={(e) => setProjectForm(prev => ({
                              ...prev,
                              impactoGerado: { ...prev.impactoGerado, metric: e.target.value, title: prev.impactoGerado?.title || '', description: prev.impactoGerado?.description || '' }
                            }))}
                            placeholder="Ex: 12 canteiros ativos, +180 famílias"
                            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Descrição dos Resultados
                        </label>
                        <textarea
                          rows={2}
                          value={projectForm.impactoGerado?.description || ''}
                          onChange={(e) => setProjectForm(prev => ({
                            ...prev,
                            impactoGerado: { ...prev.impactoGerado, description: e.target.value, title: prev.impactoGerado?.title || '', metric: prev.impactoGerado?.metric || '' }
                          }))}
                          placeholder="Quais foram as mudanças concretas para os alunos e para o município..."
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção 6: Competências & Guia de Replicação */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#004A99] dark:text-sky-400 flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>6. Competências BNCC/DCRC e Replicação</span>
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Competências e Habilidades (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        value={competenciasInput}
                        onChange={(e) => setCompetenciasInput(e.target.value)}
                        placeholder="Ex: Sustentabilidade, Pensamento Científico, Cultura Digital, Cidadania"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#004A99]"
                      />
                      {competenciasInput && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {competenciasInput.split(/[,;\n]+/).filter(Boolean).map((c, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 font-semibold border border-blue-100/60 dark:border-blue-900/40">
                              {c.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Materiais Necessários (1 por linha)
                      </label>
                      <textarea
                        rows={3}
                        value={materialsInput}
                        onChange={(e) => setMaterialsInput(e.target.value)}
                        placeholder="Ex:&#10;Bambus nativos ou madeiras de reaproveitamento&#10;Composto orgânico produzido na escola&#10;Celulares para registro de campo"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dica Pedagógica do Mediador (Conselho para Outras Escolas)
                      </label>
                      <textarea
                        rows={2}
                        value={projectForm.replicationGuide?.pedagogicalTip || ''}
                        onChange={(e) => setProjectForm(prev => ({
                          ...prev,
                          replicationGuide: {
                            materials: prev.replicationGuide?.materials || [],
                            timeline: prev.replicationGuide?.timeline || defaultProjectTimeline,
                            pedagogicalTip: e.target.value,
                          }
                        }))}
                        placeholder="Ex: Realize a primeira reunião com os anciãos da comunidade para validar as espécies a serem cultivadas."
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Ações Finais do Formulário */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(null);
                        setProjectViewMode('lista');
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Cancelar e Voltar
                    </button>

                    <button
                      type="submit"
                      disabled={true}
                      title="Aguardando disponibilização do endpoint oficial no backend Rails (/p_projetos)"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-400 text-white text-xs font-bold transition shadow-xs cursor-not-allowed opacity-60"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Aguardando Endpoint da API</span>
                    </button>
                  </div>

                </form>
              </div>

              {/* Coluna Lateral: Pré-visualização Fiel em Tempo Real */}
              <div className="xl:col-span-5 xl:sticky xl:top-24 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <Eye className="h-4 w-4 text-[#004A99] dark:text-sky-400" />
                    <span>Simulação no Portal Público</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Ao Vivo
                  </span>
                </div>

                {/* Card de Simulação Exata da Página /projetos */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132238] shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={projectForm.image || '/hero.jpg'}
                      alt={projectForm.title || 'Capa'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-black/60 backdrop-blur-md text-white border border-white/20">
                        #{projectForm.number || '01'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTrackBadgeClass(projectForm.track)}`}>
                        {projectForm.track || 'Agroecologia & NBAZ'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#004A99] dark:text-sky-400">
                        <span>{projectForm.track || 'Trilha Temática'}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                          {projectForm.municipality || 'Município'}
                        </span>
                      </div>

                      <h4 className="font-display text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {projectForm.title || 'Título do Projeto Pedagógico'}
                      </h4>

                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <p className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <School className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400 shrink-0" />
                          <span>{projectForm.school || 'Nome da Escola Estadual'}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>
                            {projectForm.mediatorName || 'Professor(a) Mediador(a)'} ({projectForm.mediatorRole || 'Docente'})
                          </span>
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 line-clamp-3">
                        {projectForm.praticaMedtec?.description || projectForm.desafioLocal?.description || 'Metodologia ativa e prática de campo mediada por tecnologia em Rondônia.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {competenciasInput ? (
                          competenciasInput.split(/[,;\n]+/).filter(Boolean).slice(0, 3).map((comp, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {comp.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 italic">
                            Competências aparecerão aqui
                          </span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                        <span className="font-bold block uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400">
                          Métrica em Destaque:
                        </span>
                        <p className="font-black text-xs">
                          {projectForm.impactoGerado?.metric || 'Ex: 12 canteiros ativos'}
                        </p>
                        <p className="line-clamp-2 text-slate-600 dark:text-slate-300">
                          {projectForm.impactoGerado?.description || 'Resultados observados na comunidade escolar.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Integração com Backend Pendente</span>
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Este formulário representa a interface homologada. O cadastro será ativado assim que as rotas da API Rails forem publicadas.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      );
    }

    if (tab === 'duvidas' && canAccessFaqs) {
      const faqsList: FaqItem[] = data.faqs || [];
      const categoryOptions: FaqCategory[] = [
        'Todas as Dúvidas',
        'Metodologia & Aulas ao Vivo',
        'Infraestrutura & Satélite',
        'Comunidades & Matrículas',
        'Legislação & Diretrizes',
      ];

      const getCategoryBadgeClass = (cat?: string) => {
        switch (cat) {
          case 'Metodologia & Aulas ao Vivo':
            return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
          case 'Infraestrutura & Satélite':
            return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
          case 'Comunidades & Matrículas':
            return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
          case 'Legislação & Diretrizes':
            return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
          default:
            return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
      };

      const filteredFaqs = faqsList.filter((f) => {
        const matchesCat =
          selectedFaqCategory === 'Todas as Dúvidas' || f.category === selectedFaqCategory;
        const q = faqSearchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q)) ||
          f.index.includes(q);
        return matchesCat && matchesSearch;
      });

      return (
        <div className="space-y-6">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Módulo em Homologação Técnica:</strong> As operações de criação, edição e exclusão de dúvidas (FAQ) estão desabilitadas aguardando a disponibilização dos endpoints oficiais pelo backend Rails (<code className="font-mono text-[11px]">/d_duvidas</code> ou <code className="font-mono text-[11px]">/faqs</code>). Nenhuma persistência simulada em disco local é utilizada.
            </span>
          </div>

          {/* Sub-navegação Interna: Lista vs Editor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFaqViewMode('lista')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  faqViewMode === 'lista'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                <span>Dúvidas Cadastradas ({faqsList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (faqViewMode !== 'editor') {
                    handleNewFaq();
                  }
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  faqViewMode === 'editor'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>{editingFaq ? `Editando: ${editingFaq.index || 'FAQ'}` : 'Nova Dúvida'}</span>
              </button>
            </div>

            {faqViewMode === 'lista' ? (
              <button
                type="button"
                onClick={handleNewFaq}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Cadastrar Nova Dúvida</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingFaq(null);
                  setFaqViewMode('lista');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar para a Lista</span>
              </button>
            )}
          </div>

          {/* MODO 1: LISTA DE DÚVIDAS */}
          {faqViewMode === 'lista' && (
            <div className="space-y-5">
              {/* Filtros e Barra de Busca */}
              <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  {/* Campo de Busca */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={faqSearchTerm}
                      onChange={(e) => setFaqSearchTerm(e.target.value)}
                      placeholder="Buscar dúvida por palavra-chave, resposta ou tag..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-400"
                    />
                  </div>

                  {/* Seletor de Categoria */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 shrink-0 font-medium hidden sm:inline">
                      Categoria:
                    </span>
                    <select
                      value={selectedFaqCategory}
                      onChange={(e) => setSelectedFaqCategory(e.target.value)}
                      className="text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                    >
                      {categoryOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags rápidas de categoria */}
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedFaqCategory(opt)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        selectedFaqCategory === opt
                          ? 'bg-[#004A99] text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid / Lista de Cards de Dúvidas */}
              {filteredFaqs.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 mx-auto flex items-center justify-center">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Nenhuma dúvida encontrada
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {faqSearchTerm
                      ? `Nenhum resultado corresponde à busca "${faqSearchTerm}". Tente outros termos.`
                      : 'Nenhuma dúvida cadastrada nesta categoria. Clique no botão abaixo para adicionar a primeira.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleNewFaq}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Cadastrar Nova Dúvida</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#004A99]/40 dark:hover:border-sky-500/40 transition space-y-3"
                    >
                      {/* Topo do Card: Número, Categoria e Ações */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-sky-400 dark:text-slate-950">
                            {faq.index || 'FAQ'}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(
                              faq.category
                            )}`}
                          >
                            {faq.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditFaq(faq)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#004A99] dark:text-sky-300 text-xs font-bold transition cursor-pointer"
                          >
                            <SlidersHorizontal className="h-3 w-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition cursor-pointer"
                            title="Excluir dúvida"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Pergunta */}
                      <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
                        {faq.question}
                      </h4>

                      {/* Resposta */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3">
                        {faq.answer}
                      </p>

                      {/* Rodapé: Personas, Tags e Link de Ação */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                        {/* Personas e Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Público:</span>
                          {faq.personas?.map((p) => (
                            <span
                              key={p}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize"
                            >
                              {p}
                            </span>
                          ))}

                          {faq.tags?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                              {faq.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Botão de Ação Link */}
                        {faq.actionLink?.label && faq.actionLink?.href && (
                          <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[#004A99] dark:text-sky-400 font-bold">
                            <span>Link: {faq.actionLink.label}</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODO 2: EDITOR / FORMULÁRIO DE DÚVIDA */}
          {faqViewMode === 'editor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Coluna 1 (8 cols): Formulário de Edição */}
              <div className="lg:col-span-8 bg-white dark:bg-[#0B1729] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-[#004A99] dark:text-sky-400" />
                      <span>{editingFaq ? 'Editar Dúvida Frequente' : 'Cadastrar Nova Dúvida Frequente'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Preencha os campos abaixo. Esta dúvida ficará disponível na tela oficial de FAQ e na busca inteligente.
                    </p>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    {faqForm.index || '01'}
                  </span>
                </div>

                <form onSubmit={handleSaveFaq} className="space-y-5">
                  {/* Linha 1: Número de Ordem e Categoria */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Número de Ordem (Index) *
                      </label>
                      <input
                        type="text"
                        value={faqForm.index || ''}
                        onChange={(e) => setFaqForm({ ...faqForm, index: e.target.value })}
                        placeholder="Ex: 01, 02, 11"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Categoria Temática *
                      </label>
                      <select
                        value={faqForm.category || 'Metodologia & Aulas ao Vivo'}
                        onChange={(e) =>
                          setFaqForm({
                            ...faqForm,
                            category: e.target.value as FaqItem['category'],
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                        required
                      >
                        <option value="Metodologia & Aulas ao Vivo">Metodologia & Aulas ao Vivo</option>
                        <option value="Infraestrutura & Satélite">Infraestrutura & Satélite</option>
                        <option value="Comunidades & Matrículas">Comunidades & Matrículas</option>
                        <option value="Legislação & Diretrizes">Legislação & Diretrizes</option>
                      </select>
                    </div>
                  </div>

                  {/* Pergunta */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Pergunta Completa *
                    </label>
                    <input
                      type="text"
                      value={faqForm.question || ''}
                      onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                      placeholder="Ex: Como funciona a transmissão ao vivo nas escolas ribeirinhas?"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] font-medium"
                      required
                    />
                  </div>

                  {/* Resposta */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Resposta Oficial Completa *
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {(faqForm.answer || '').length} caracteres
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={faqForm.answer || ''}
                      onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                      placeholder="Escreva a resposta detalhada e oficial da SEDUC-RO para esta dúvida..."
                      className="w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] leading-relaxed"
                      required
                    />
                  </div>

                  {/* Personas / Públicos Alvo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Públicos-alvo (A quem interessa esta dúvida)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: 'estudantes', label: '🎓 Estudantes e Famílias' },
                          { id: 'mediadores', label: '👩‍🏫 Professores Mediadores' },
                          { id: 'gestores', label: '🏢 Gestores Escolares / SEDUC' },
                        ] as const
                      ).map((p) => {
                        const isSelected = (faqForm.personas || []).includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleToggleFaqPersona(p.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                              isSelected
                                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 text-[#004A99] dark:text-sky-300'
                                : 'bg-slate-50 dark:bg-[#071324] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            <span>{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Link de Ação Opcional (Redirecionamento) */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Botão de Ação / Link Rápido (Opcional)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Texto do Botão
                        </label>
                        <input
                          type="text"
                          value={faqForm.actionLink?.label || ''}
                          onChange={(e) =>
                            setFaqForm({
                              ...faqForm,
                              actionLink: {
                                label: e.target.value,
                                href: faqForm.actionLink?.href || '',
                              },
                            })
                          }
                          placeholder="Ex: CONHECER O CORPO DOCENTE"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          URL de Destino
                        </label>
                        <input
                          type="text"
                          value={faqForm.actionLink?.href || ''}
                          onChange={(e) =>
                            setFaqForm({
                              ...faqForm,
                              actionLink: {
                                label: faqForm.actionLink?.label || '',
                                href: e.target.value,
                              },
                            })
                          }
                          placeholder="Ex: /professores, /mapa, /noticias"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tags e Palavras-chave (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={faqTagsInput}
                      onChange={(e) => setFaqTagsInput(e.target.value)}
                      placeholder="Ex: MEDTEC, Satélite, Aulas ao Vivo, CEE-RO"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                    />
                  </div>

                  {/* Botões do Formulário */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFaq(null);
                        setFaqViewMode('lista');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={true}
                      title="Aguardando disponibilização do endpoint oficial no backend Rails (/faqs)"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-400 text-white text-xs font-bold transition shadow-xs cursor-not-allowed opacity-60"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Aguardando Endpoint da API</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Coluna 2 (4 cols): Pré-visualização Fiel em Tempo Real */}
              <div className="lg:col-span-4 space-y-4 sticky top-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Visualização no Portal</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Em tempo real</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-sky-400 dark:text-slate-950">
                      {faqForm.index || '01'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                        faqForm.category
                      )}`}
                    >
                      {faqForm.category || 'Metodologia & Aulas ao Vivo'}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {faqForm.question || 'Sua pergunta aparecerá aqui...'}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                    {faqForm.answer || 'A resposta detalhada oficial aparecerá aqui.'}
                  </p>

                  {/* Personas */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-wrap gap-1">
                    {(faqForm.personas || []).map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Ação */}
                  {faqForm.actionLink?.label && faqForm.actionLink?.href && (
                    <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-[#0284C7] dark:text-[#00D8FF] font-mono font-bold">
                      <span className="truncate">{faqForm.actionLink.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Disponibilidade Imediata</span>
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Ao salvar, a dúvida fica instantaneamente visível na página pública &ldquo;Dúvidas Frequentes&rdquo; (`/duvidas`).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
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
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSection('projetos');
                      handleNewProject();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Novo Projeto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSection('noticias');
                      handleNewNews();
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
                      setCurrentSection('noticias');
                      setNewsViewMode('lista');
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
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSection('projetos');
                      setProjectViewMode('lista');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Projetos</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
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
                      {data.users?.length || 0}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Operadores cadastrados com acesso por CPF
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Controle seguro de perfis e senhas
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentSection('usuarios')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Operadores</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
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
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSection('duvidas');
                      setFaqViewMode('lista');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Dúvidas</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
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
                        setCurrentSection('noticias');
                        setNewsViewMode('lista');
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
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSection('projetos');
                          setProjectViewMode('lista');
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <span>Abrir Projetos</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSection('projetos');
                          handleNewProject();
                        }}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        title="Cadastrar Novo Projeto"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Novo</span>
                      </button>
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

                    <button
                      type="button"
                      onClick={() => setCurrentSection('fotos')}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Trocar Banners da Home</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
                      onClick={() => setCurrentSection('kanban')}
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
                          {data.users?.length || 0} operadores
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
                        <button
                          type="button"
                          onClick={() => setCurrentSection('usuarios')}
                          className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071324] hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200/60 dark:hover:border-blue-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer group"
                        >
                          <span className="flex items-center gap-2">
                            <UserCog className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                            <span>Gerenciar Equipe e Senhas ({data.users?.length || 0})</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition" />
                        </button>
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

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSection('duvidas');
                        setFaqViewMode('lista');
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Abrir Central de Dúvidas</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* VISÃO 2: PIPELINE KANBAN (EXCLUSIVO GESTOR) */}
          {currentSection === 'kanban' && canAccessKanban && (
            <div className="w-full">
              <EditorialKanban
                news={effectiveNews}
                onApproveNews={handleApproveNews}
                onRejectNews={handleRejectNews}
                isGestor={userSession.isGestor}
              />
            </div>
          )}

          {/* VISÃO 3: FOTOS & BANNERS DO SITE (VISÃO DEDICADA) */}
          {currentSection === 'fotos' && canAccessPhotos && renderCmsModule('fotos')}

          {/* VISÃO 4: NOTÍCIAS & REPORTAGENS (VISÃO DEDICADA) */}
          {canAccessNews && (
            <div hidden={currentSection !== 'noticias'}>
              <NewsModule
                ref={newsModuleRef}
                effectiveNews={effectiveNews}
                apiNewsCategories={apiNewsCategories}
                loadingNews={loadingNews}
                errorNews={errorNews}
                userSession={userSession}
                canPublish={userSession.isGestor}
                newsViewMode={newsViewMode}
                setNewsViewMode={setNewsViewMode}
                onRefresh={loadApiData}
                onTogglePublished={handleTogglePublished}
                onPreview={setPreviewModal}
              />
            </div>
          )}

          {/* VISÃO: PROJETOS PEDAGÓGICOS (VISÃO DEDICADA GESTOR) */}
          {currentSection === 'projetos' && canAccessProjects && renderCmsModule('projetos')}

          {/* VISÃO: DÚVIDAS FREQUENTES (FAQ) */}
          {currentSection === 'duvidas' && canAccessFaqs && renderCmsModule('duvidas')}

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

          {/* VISÃO 9: CADASTRO E GESTÃO DE OPERADORES & USUÁRIOS (EXCLUSIVO GESTOR) */}
          {currentSection === 'usuarios' && canAccessUsers && (
            <div className="space-y-6">
              <UserManager
                users={data.users || []}
                onRefreshUsers={loadData}
              />
            </div>
          )}

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
