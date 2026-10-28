'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DatabaseSchema, NewsItem, AnnouncementItem, GalleryItem, AnnouncementType, ProjectMission, ReplicationWeek } from '@/types';
import { 
  Tv, 
  Newspaper, 
  Bell, 
  Share2, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
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
  Building2,
  Palette,
  Globe,
  Layers,
  MessageSquare,
  Phone,
  Mail,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, FacebookIcon } from '@/components/SocialIcons';
import EditorialKanban from '@/components/EditorialKanban';
import SitePhotosManager from '@/components/SitePhotosManager';
import AdminLiveSimulator, { AdminPreviewModal, PreviewContentType, PreviewItemData } from '@/components/AdminLiveSimulator';
import UserManager from '@/components/UserManager';
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
  Cidade,
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
  const [newsFolder, setNewsFolder] = useState('Todas');
  const [newsViewMode, setNewsViewMode] = useState<'lista' | 'editor'>('lista');
  const [announcementViewMode, setAnnouncementViewMode] = useState<'lista' | 'editor'>('lista');
  const [galleryViewMode, setGalleryViewMode] = useState<'lista' | 'editor'>('lista');
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

  // Estado para formulário de Notícia (novo ou edição)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
    title: '',
    category: 'Pedagógico',
    author: 'Equipe MEDTEC / SEDUC',
    coverImage: '',
    excerpt: '',
    content: '',
    featured: false,
    urgent: false,
    folder: 'Geral',
    published: true,
    publishedAt: '',
  });

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

  // Estado para formulário de Aviso
  const [announcementForm, setAnnouncementForm] = useState<Partial<AnnouncementItem>>({
    title: '',
    content: '',
    type: 'aviso',
    date: '',
    linkText: '',
    linkUrl: '',
    active: true,
  });

  // Estado para formulário de Foto da Galeria
  const [galleryForm, setGalleryForm] = useState<Partial<GalleryItem>>({
    title: '',
    description: '',
    imageUrl: '',
    category: 'Salas de Aula',
    date: 'Outubro 2026',
  });

  // Upload status
  const [uploadingImage, setUploadingImage] = useState(false);

  // -------------------------------------------------------------
  // ESTADOS DA API v1 OFICIAL (/api/v1)
  // -------------------------------------------------------------
  // Avisos e Tipos de Aviso (/a_avisos, /a_tipos_aviso)
  const [apiAvisos, setApiAvisos] = useState<AAviso[]>([]);
  const [apiTiposAviso, setApiTiposAviso] = useState<ATipoAviso[]>([]);
  const [selectedTipoAvisoId, setSelectedTipoAvisoId] = useState<number | null>(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  const [showTipoAvisoManager, setShowTipoAvisoManager] = useState(false);
  const [editingTipoAviso, setEditingTipoAviso] = useState<ATipoAviso | null>(null);
  const [tipoAvisoForm, setTipoAvisoForm] = useState({
    nome: '',
    slug: '',
    cor: '#004A99',
    posicao: 0,
    ativo: true,
  });

  // Galeria e Categorias (/fotos_galeria, /categorias_galeria)
  const [apiFotos, setApiFotos] = useState<FotoGaleria[]>([]);
  const [apiCategorias, setApiCategorias] = useState<CategoriaGaleria[]>([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [showCategoriaManager, setShowCategoriaManager] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaGaleria | null>(null);
  const [categoriaForm, setCategoriaForm] = useState({
    nome: '',
    slug: '',
    posicao: 0,
    ativo: true,
  });

  // Canais de Contato (/canais_contato)
  const [apiCanais, setApiCanais] = useState<CanalContato[]>([]);
  const [savingCanais, setSavingCanais] = useState(false);

  // Estados e Cidades (/g_estados, /g_cidades)
  const [apiEstados, setApiEstados] = useState<Estado[]>([]);
  const [apiCidades, setApiCidades] = useState<Cidade[]>([]);
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [cidadeSearch, setCidadeSearch] = useState('');

  // Modal de Estado
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [editingEstado, setEditingEstado] = useState<Estado | null>(null);
  const [estadoForm, setEstadoForm] = useState({ nome: '', sigla_uf: '', codigo_ibge: '' });
  const [savingEstado, setSavingEstado] = useState(false);
  const [estadoError, setEstadoError] = useState('');

  // Modal de Cidade
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [editingCidade, setEditingCidade] = useState<Cidade | null>(null);
  const [cidadeForm, setCidadeForm] = useState({ g_estado_id: 0, nome: '', codigo_ibge: '' });
  const [savingCidade, setSavingCidade] = useState(false);
  const [cidadeError, setCidadeError] = useState('');

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
    try {
      const [tiposRes, avisosRes] = await Promise.all([
        medtecApi.tiposAviso.list({ page: 'all' }),
        medtecApi.avisos.list({ page: 'all' }),
      ]);
      if (tiposRes.success && tiposRes.data?.items) {
        setApiTiposAviso(tiposRes.data.items);
        if (tiposRes.data.items.length > 0) {
          setSelectedTipoAvisoId(prev => prev ?? tiposRes.data.items[0].id);
        }
      }
      if (avisosRes.success && avisosRes.data?.items) {
        setApiAvisos(avisosRes.data.items);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar avisos/tipos:', err);
    }

    // 2. Galeria e Categorias
    try {
      const [catsRes, fotosRes] = await Promise.all([
        medtecApi.categoriasGaleria.list({ page: 'all' }),
        medtecApi.fotosGaleria.list({ page: 'all' }),
      ]);
      if (catsRes.success && catsRes.data?.items) {
        setApiCategorias(catsRes.data.items);
        if (catsRes.data.items.length > 0) {
          setSelectedCategoriaId(prev => prev ?? catsRes.data.items[0].id);
        }
      }
      if (fotosRes.success && fotosRes.data?.items) {
        setApiFotos(fotosRes.data.items);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar galeria/categorias:', err);
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
        if (estadosRes.data.items.length > 0) {
          setSelectedEstadoId(prev => prev ?? estadosRes.data.items[0].id);
        }
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar estados:', err);
    } finally {
      setLoadingEstados(false);
    }
  }, []);

  // Carrega cidades do estado selecionado
  useEffect(() => {
    if (!selectedEstadoId) return;
    setLoadingCidades(true);
    medtecApi.cidades.list({ 'q[g_estado_id_eq]': selectedEstadoId, page: 'all' })
      .then((res) => {
        if (res.success && res.data?.items) {
          setApiCidades(res.data.items);
        }
      })
      .catch((err) => console.warn('API v1: Erro ao carregar cidades:', err))
      .finally(() => setLoadingCidades(false));
  }, [selectedEstadoId]);

  // Carrega dados iniciais e verifica sessão
  const loadData = useCallback(async () => {
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
                setCurrentSection('avisos');
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
              setCurrentSection('avisos');
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

      // Carrega dados locais (fallback / noticias / banners / faq)
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }

      // Carrega dados da API Backend v1 oficial (se falhar, mantém os dados locais)
      try {
        await loadApiData();
      } catch (apiErr) {
        console.warn('API v1: Aviso ao carregar dados oficiais, mantendo dados locais de fallback:', apiErr);
      }
    } catch (err) {
      console.error(err);
      router.push('/admin/login');
    }
  }, [router, loadApiData]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'news' | 'gallery' | 'project') => {
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
        if (targetField === 'news') {
          setNewsForm(prev => ({ ...prev, coverImage: resData.url }));
        } else if (targetField === 'gallery') {
          setGalleryForm(prev => ({ ...prev, imageUrl: resData.url }));
        } else if (targetField === 'project') {
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

  // Funções de Gestão de Notícias
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !newsForm.title || !newsForm.content) return;

    let updatedNews = [...data.news];
    if (editingNews) {
      updatedNews = updatedNews.map(item => 
        item.id === editingNews.id 
          ? ({ ...item, ...newsForm } as NewsItem)
          : item
      );
    } else {
      const newId = `noticia-${Date.now()}`;
      const slug = newsForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const newItem: NewsItem = {
        id: newId,
        title: newsForm.title || '',
        slug: slug || newId,
        excerpt: newsForm.excerpt || newsForm.title.substring(0, 120),
        content: newsForm.content || '',
        coverImage: newsForm.coverImage || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
        author: newsForm.author || 'Assessoria SEDUC',
        category: newsForm.category || 'Institucional',
        publishedAt: newsForm.publishedAt || new Date().toLocaleDateString('pt-BR'),
        featured: newsForm.featured || false,
        urgent: newsForm.urgent || false,
        folder: newsForm.folder?.trim() || 'Geral',
        published: newsForm.published !== false,
        tags: ['MEDTEC', 'SEDUC-RO'],
      };
      updatedNews.unshift(newItem);
    }

    const newData: DatabaseSchema = { ...data, news: updatedNews };
    persistData(newData);

    setEditingNews(null);
    setNewsForm({
      title: '',
      category: 'Pedagógico',
      author: 'Equipe MEDTEC / SEDUC',
      coverImage: '',
      excerpt: '',
      content: '',
      featured: false,
      urgent: false,
      folder: 'Geral',
      published: true,
      publishedAt: '',
    });
    setNewsViewMode('lista');
  };

  const handleTogglePublished = (id: string) => {
    if (!data) return;
    const updatedNews = data.news.map((item) =>
      item.id === id ? { ...item, published: item.published === false } : item
    );
    persistData({ ...data, news: updatedNews });
  };

  const handleApproveNews = async (id: string): Promise<boolean> => {
    if (!data || !userSession.isGestor) return false;
    const target = data.news.find((n) => n.id === id);
    if (!target) return false;

    const updatedNews = data.news.map((item) =>
      item.id === id
        ? {
            ...item,
            published: true,
            rejected: false,
            publishedAt: item.publishedAt || new Date().toLocaleDateString('pt-BR'),
          }
        : item
    );

    try {
      await persistData({ ...data, news: updatedNews });
      return true;
    } catch {
      return false;
    }
  };

  const handleRejectNews = async (id: string, reason?: string): Promise<boolean> => {
    if (!data || !userSession.isGestor) return false;
    const target = data.news.find((n) => n.id === id);
    if (!target) return false;

    const updatedNews = data.news.map((item) =>
      item.id === id
        ? {
            ...item,
            published: false,
            rejected: true,
            rejectionReason: reason || 'Recusada pelo gestor.',
          }
        : item
    );

    try {
      await persistData({ ...data, news: updatedNews });
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteNews = (id: string) => {
    if (!data) return;
    if (!confirm('Deseja realmente excluir esta notícia?')) return;
    const updatedNews = data.news.filter(n => n.id !== id);
    persistData({ ...data, news: updatedNews });
  };

  const handleEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setNewsForm({ ...item });
    setNewsViewMode('editor');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleNewNews = () => {
    setEditingNews(null);
    setNewsForm({
      title: '',
      category: 'Pedagógico',
      author: 'Equipe MEDTEC / SEDUC',
      coverImage: '',
      excerpt: '',
      content: '',
      featured: false,
      urgent: false,
      folder: 'Geral',
      published: true,
      publishedAt: '',
    });
    setNewsViewMode('editor');
  };

  // -------------------------------------------------------------
  // FUNÇÕES DE AVISOS E TIPOS DE AVISO (API v1)
  // -------------------------------------------------------------
  const handleNewAnnouncement = () => {
    setEditingAnnouncementId(null);
    setAnnouncementForm({
      title: '',
      content: '',
      type: 'aviso',
      date: new Date().toLocaleDateString('pt-BR'),
      linkText: '',
      linkUrl: '',
      active: true,
    });
    if (apiTiposAviso.length > 0) {
      setSelectedTipoAvisoId(apiTiposAviso[0].id);
    }
    setAnnouncementViewMode('editor');
  };

  const handleEditAnnouncement = (aviso: AAviso | AnnouncementItem) => {
    const isApi = 'a_tipo_aviso_id' in aviso;
    const numId = Number(aviso.id);
    setEditingAnnouncementId(isNaN(numId) ? null : numId);
    setAnnouncementForm({
      title: 'titulo' in aviso ? aviso.titulo : aviso.title,
      content: 'conteudo' in aviso ? aviso.conteudo : aviso.content,
      type: isApi && aviso.a_tipo_aviso ? (aviso.a_tipo_aviso.slug as AnnouncementType) : (aviso as AnnouncementItem).type || 'aviso',
      date: 'created_at' in aviso ? new Date(aviso.created_at).toLocaleDateString('pt-BR') : (aviso as AnnouncementItem).date || new Date().toLocaleDateString('pt-BR'),
      linkText: 'link_texto' in aviso ? (aviso.link_texto || '') : ((aviso as AnnouncementItem).linkText || ''),
      linkUrl: 'link_url' in aviso ? (aviso.link_url || '') : ((aviso as AnnouncementItem).linkUrl || ''),
      active: 'ativo' in aviso ? aviso.ativo !== false : (aviso as AnnouncementItem).active !== false,
    });
    if (isApi && aviso.a_tipo_aviso_id) {
      setSelectedTipoAvisoId(aviso.a_tipo_aviso_id);
    }
    setAnnouncementViewMode('editor');
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) return;

    setSaving(true);
    try {
      const tipoId = selectedTipoAvisoId || (apiTiposAviso[0] ? apiTiposAviso[0].id : 1);
      const tipoObj = apiTiposAviso.find(t => t.id === tipoId);

      let savedAviso: AAviso | null = null;
      try {
        if (editingAnnouncementId) {
          savedAviso = await medtecApi.avisos.update(editingAnnouncementId, {
            titulo: announcementForm.title,
            a_tipo_aviso_id: tipoId,
            conteudo: announcementForm.content,
            link_texto: announcementForm.linkText || '',
            link_url: announcementForm.linkUrl || '',
            ativo: announcementForm.active ?? true,
          });
        } else {
          savedAviso = await medtecApi.avisos.create({
            titulo: announcementForm.title,
            a_tipo_aviso_id: tipoId,
            conteudo: announcementForm.content,
            link_texto: announcementForm.linkText || '',
            link_url: announcementForm.linkUrl || '',
            ativo: announcementForm.active ?? true,
          });
        }
      } catch (apiErr: unknown) {
        const err = apiErr as { message?: string; errors?: string[] };
        console.warn('Erro ao salvar aviso na API v1:', err);
        alert(`Erro na API: ${err.message || err.errors?.join(', ') || 'Falha na requisição'}`);
      }

      const announcementId = savedAviso ? String(savedAviso.id) : (editingAnnouncementId ? String(editingAnnouncementId) : `aviso-${Date.now()}`);
      const newItem: AnnouncementItem = {
        id: announcementId,
        title: announcementForm.title,
        content: announcementForm.content,
        type: (tipoObj?.slug as AnnouncementType) || announcementForm.type || 'aviso',
        date: new Date().toLocaleDateString('pt-BR'),
        linkText: announcementForm.linkText || '',
        linkUrl: announcementForm.linkUrl || '',
        active: announcementForm.active ?? true,
        typeColor: tipoObj?.cor,
        typeName: tipoObj?.nome,
        a_tipo_aviso_id: tipoId,
        a_tipo_aviso: tipoObj ? {
          id: tipoObj.id,
          nome: tipoObj.nome,
          slug: tipoObj.slug,
          cor: tipoObj.cor,
          posicao: tipoObj.posicao,
          ativo: tipoObj.ativo,
        } : undefined,
      };

      if (data) {
        const updated = editingAnnouncementId
          ? data.announcements.map(a => a.id === String(editingAnnouncementId) ? newItem : a)
          : [newItem, ...data.announcements];
        persistData({ ...data, announcements: updated });
      }

      if (savedAviso) {
        setApiAvisos(prev => editingAnnouncementId ? prev.map(a => a.id === savedAviso!.id ? savedAviso! : a) : [savedAviso!, ...prev]);
      }

      setEditingAnnouncementId(null);
      setAnnouncementForm({
        title: '',
        content: '',
        type: 'aviso',
        date: new Date().toLocaleDateString('pt-BR'),
        linkText: '',
        linkUrl: '',
        active: true,
      });
      setAnnouncementViewMode('lista');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Deseja realmente excluir este comunicado oficial?')) return;
    const numId = Number(id);
    if (!isNaN(numId)) {
      try {
        await medtecApi.avisos.delete(numId);
        setApiAvisos(prev => prev.filter(a => a.id !== numId));
      } catch (err: unknown) {
        const errorData = err as { message?: string };
        alert(`Erro ao excluir na API: ${errorData.message || 'Falha na exclusão'}`);
      }
    }
    if (data) {
      const updated = data.announcements.filter(a => a.id !== id);
      persistData({ ...data, announcements: updated });
    }
  };

  const handleToggleAnnouncementActive = async (id: string) => {
    const numId = Number(id);
    const existingApi = apiAvisos.find(a => a.id === numId);
    const currentActive = existingApi ? existingApi.ativo : data?.announcements.find(a => a.id === id)?.active ?? true;
    const newActive = !currentActive;

    if (!isNaN(numId)) {
      try {
        await medtecApi.avisos.update(numId, { ativo: newActive });
        setApiAvisos(prev => prev.map(a => a.id === numId ? { ...a, ativo: newActive } : a));
      } catch (err) {
        console.warn('Erro ao atualizar ativo na API v1:', err);
      }
    }
    if (data) {
      const updated = data.announcements.map(a => a.id === id ? { ...a, active: newActive } : a);
      persistData({ ...data, announcements: updated });
    }
  };

  // CRUD Tipos de Aviso
  const handleSaveTipoAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoAvisoForm.nome.trim() || !tipoAvisoForm.slug.trim()) {
      alert('Informe o nome e o slug do tipo de aviso.');
      return;
    }
    try {
      if (editingTipoAviso) {
        const updated = await medtecApi.tiposAviso.update(editingTipoAviso.id, tipoAvisoForm);
        setApiTiposAviso(prev => prev.map(t => t.id === updated.id ? updated : t));
      } else {
        const created = await medtecApi.tiposAviso.create(tipoAvisoForm);
        setApiTiposAviso(prev => [...prev, created]);
      }
      setEditingTipoAviso(null);
      setTipoAvisoForm({ nome: '', slug: '', cor: '#004A99', posicao: 0, ativo: true });
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Erro ao salvar Tipo de Aviso: ${errorData.message || errorData.errors?.join(', ') || 'Erro'}`);
    }
  };

  const handleDeleteTipoAviso = async (id: number) => {
    if (!confirm('Deseja excluir este tipo de aviso?')) return;
    try {
      await medtecApi.tiposAviso.delete(id);
      setApiTiposAviso(prev => prev.filter(t => t.id !== id));
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Não foi possível excluir: ${errorData.message || errorData.errors?.join(', ') || 'Existem avisos vinculados'}`);
    }
  };

  // -------------------------------------------------------------
  // FUNÇÕES DE GALERIA E CATEGORIAS (API v1)
  // -------------------------------------------------------------
  const handleNewPhoto = () => {
    setEditingPhotoId(null);
    setGalleryFile(null);
    setGalleryForm({
      title: '',
      description: '',
      imageUrl: '',
      category: 'Salas de Aula',
      date: 'Outubro 2026',
    });
    if (apiCategorias.length > 0) {
      setSelectedCategoriaId(apiCategorias[0].id);
    }
    setGalleryViewMode('editor');
  };

  const handleEditPhoto = (foto: FotoGaleria | GalleryItem) => {
    const isApi = 'categoria_galeria_id' in foto;
    const numId = Number(foto.id);
    setEditingPhotoId(isNaN(numId) ? null : numId);
    setGalleryFile(null);
    const displayImg = 'imagem' in foto && foto.imagem ? getMediaUrl(foto.imagem) : (foto as GalleryItem).imageUrl || ('imagem_url' in foto ? foto.imagem_url || '' : '');
    setGalleryForm({
      title: 'titulo' in foto ? foto.titulo : (foto as GalleryItem).title,
      description: ('descricao' in foto ? foto.descricao : (foto as GalleryItem).description) || '',
      imageUrl: displayImg,
      category: isApi && foto.categoria_galeria ? foto.categoria_galeria.nome : (foto as GalleryItem).category || 'Salas de Aula',
      date: 'Outubro 2026',
    });
    if (isApi && foto.categoria_galeria_id) {
      setSelectedCategoriaId(foto.categoria_galeria_id);
    }
    setGalleryViewMode('editor');
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title) return;
    if (!galleryFile && !galleryForm.imageUrl) {
      alert('Selecione um arquivo de foto do computador ou informe um link externo direto.');
      return;
    }

    setSaving(true);
    try {
      const catId = selectedCategoriaId || (apiCategorias[0] ? apiCategorias[0].id : 1);
      const catObj = apiCategorias.find(c => c.id === catId);

      let savedFoto: FotoGaleria | null = null;
      try {
        if (galleryFile) {
          const form = new FormData();
          form.append('foto_galeria[titulo]', galleryForm.title);
          form.append('foto_galeria[categoria_galeria_id]', String(catId));
          form.append('foto_galeria[descricao]', galleryForm.description || '');
          form.append('foto_galeria[imagem]', galleryFile);

          if (editingPhotoId) {
            savedFoto = await medtecApi.fotosGaleria.update(editingPhotoId, form);
          } else {
            savedFoto = await medtecApi.fotosGaleria.create(form);
          }
        } else if (galleryForm.imageUrl) {
          const payload = {
            foto_galeria: {
              titulo: galleryForm.title,
              categoria_galeria_id: catId,
              descricao: galleryForm.description || '',
              imagem_url: galleryForm.imageUrl,
            },
          };
          if (editingPhotoId) {
            savedFoto = await medtecApi.fotosGaleria.update(editingPhotoId, payload);
          } else {
            savedFoto = await medtecApi.fotosGaleria.create(payload);
          }
        }
      } catch (apiErr: unknown) {
        const err = apiErr as { message?: string; errors?: string[] };
        console.warn('Erro ao salvar foto na API v1:', err);
        alert(`Erro na API: ${err.message || err.errors?.join(', ') || 'Falha ao salvar foto'}`);
      }

      const displayImg = savedFoto?.imagem
        ? getMediaUrl(savedFoto.imagem)
        : savedFoto?.imagem_url || galleryForm.imageUrl || '';

      const photoId = savedFoto ? String(savedFoto.id) : (editingPhotoId ? String(editingPhotoId) : `gal-${Date.now()}`);
      const newPhotoItem: GalleryItem = {
        id: photoId,
        title: galleryForm.title,
        description: galleryForm.description || '',
        imageUrl: displayImg,
        category: catObj?.nome || galleryForm.category || 'Salas de Aula',
        date: 'Outubro 2026',
        categoria_galeria_id: catId,
        imagem: savedFoto?.imagem,
        imagem_url: savedFoto?.imagem_url,
      };

      if (data) {
        const updated = editingPhotoId
          ? data.gallery.map(g => g.id === String(editingPhotoId) ? newPhotoItem : g)
          : [newPhotoItem, ...data.gallery];
        persistData({ ...data, gallery: updated });
      }

      if (savedFoto) {
        setApiFotos(prev => editingPhotoId ? prev.map(f => f.id === savedFoto!.id ? savedFoto! : f) : [savedFoto!, ...prev]);
      }

      setEditingPhotoId(null);
      setGalleryFile(null);
      setGalleryForm({
        title: '',
        description: '',
        imageUrl: '',
        category: 'Salas de Aula',
        date: 'Outubro 2026',
      });
      setGalleryViewMode('lista');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Deseja excluir esta foto da galeria?')) return;
    const numId = Number(id);
    if (!isNaN(numId)) {
      try {
        await medtecApi.fotosGaleria.delete(numId);
        setApiFotos(prev => prev.filter(f => f.id !== numId));
      } catch (err: unknown) {
        const errorData = err as { message?: string };
        alert(`Erro ao excluir foto na API: ${errorData.message || 'Falha'}`);
      }
    }
    if (data) {
      const updated = data.gallery.filter(g => g.id !== id);
      persistData({ ...data, gallery: updated });
    }
  };

  // CRUD Categorias da Galeria
  const handleSaveCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaForm.nome.trim() || !categoriaForm.slug.trim()) {
      alert('Informe o nome e o slug da categoria.');
      return;
    }
    try {
      if (editingCategoria) {
        const updated = await medtecApi.categoriasGaleria.update(editingCategoria.id, categoriaForm);
        setApiCategorias(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await medtecApi.categoriasGaleria.create(categoriaForm);
        setApiCategorias(prev => [...prev, created]);
      }
      setEditingCategoria(null);
      setCategoriaForm({ nome: '', slug: '', posicao: 0, ativo: true });
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Erro ao salvar Categoria: ${errorData.message || errorData.errors?.join(', ') || 'Erro'}`);
    }
  };

  const handleDeleteCategoria = async (id: number) => {
    if (!confirm('Deseja excluir esta categoria de fotos?')) return;
    try {
      await medtecApi.categoriasGaleria.delete(id);
      setApiCategorias(prev => prev.filter(c => c.id !== id));
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Não foi possível excluir: ${errorData.message || errorData.errors?.join(', ') || 'Existem fotos nesta categoria'}`);
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

      if (data) {
        const map: Record<string, string> = {};
        payload.forEach(c => { map[c.rede] = c.valor; });
        const updatedSocials = {
          ...data.socials,
          youtube: map.youtube || data.socials.youtube,
          instagram: map.instagram || data.socials.instagram,
          facebook: map.facebook || data.socials.facebook,
          whatsapp: map.whatsapp || data.socials.whatsapp,
          phone: map.telefone || data.socials.phone,
          email: map.email || data.socials.email,
          address: map.endereco || data.socials.address,
        };
        await persistData({ ...data, socials: updatedSocials });
      }

      alert('Canais de atendimento e redes oficiais salvos com sucesso na API!');
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Erro ao salvar canais: ${errorData.message || errorData.errors?.join(', ') || 'Falha na requisição'}`);
    } finally {
      setSavingCanais(false);
    }
  };

  // -------------------------------------------------------------
  // FUNÇÕES DE ESTADOS E MUNICÍPIOS (/g_estados, /g_cidades)
  // -------------------------------------------------------------
  const handleSaveEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEstado(true);
    setEstadoError('');
    try {
      if (editingEstado) {
        const updated = await medtecApi.estados.update(editingEstado.id, {
          nome: estadoForm.nome,
          sigla_uf: estadoForm.sigla_uf.toUpperCase(),
          codigo_ibge: estadoForm.codigo_ibge,
        });
        setApiEstados(prev => prev.map(est => est.id === updated.id ? updated : est));
      } else {
        const created = await medtecApi.estados.create({
          nome: estadoForm.nome,
          sigla_uf: estadoForm.sigla_uf.toUpperCase(),
          codigo_ibge: estadoForm.codigo_ibge,
        });
        setApiEstados(prev => [...prev, created]);
        if (!selectedEstadoId) setSelectedEstadoId(created.id);
      }
      setShowEstadoModal(false);
      setEditingEstado(null);
      setEstadoForm({ nome: '', sigla_uf: '', codigo_ibge: '' });
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      setEstadoError(errorData.message || errorData.errors?.join(', ') || 'Falha ao salvar estado.');
    } finally {
      setSavingEstado(false);
    }
  };

  const handleDeleteEstado = async (id: number) => {
    if (!confirm('Deseja excluir este estado?')) return;
    try {
      await medtecApi.estados.delete(id);
      setApiEstados(prev => prev.filter(est => est.id !== id));
      if (selectedEstadoId === id) {
        const remaining = apiEstados.filter(est => est.id !== id);
        setSelectedEstadoId(remaining[0] ? remaining[0].id : null);
      }
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Não foi possível excluir: ${errorData.message || errorData.errors?.join(', ') || 'O estado possui cidades vinculadas'}`);
    }
  };

  const handleSaveCidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstadoId) {
      alert('Selecione um estado antes de cadastrar uma cidade.');
      return;
    }
    setSavingCidade(true);
    setCidadeError('');
    try {
      if (editingCidade) {
        const updated = await medtecApi.cidades.update(editingCidade.id, {
          g_estado_id: selectedEstadoId,
          nome: cidadeForm.nome,
          codigo_ibge: cidadeForm.codigo_ibge,
        });
        setApiCidades(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await medtecApi.cidades.create({
          g_estado_id: selectedEstadoId,
          nome: cidadeForm.nome,
          codigo_ibge: cidadeForm.codigo_ibge,
        });
        setApiCidades(prev => [...prev, created]);
      }
      setShowCidadeModal(false);
      setEditingCidade(null);
      setCidadeForm({ g_estado_id: selectedEstadoId, nome: '', codigo_ibge: '' });
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      setCidadeError(errorData.message || errorData.errors?.join(', ') || 'Falha ao salvar município.');
    } finally {
      setSavingCidade(false);
    }
  };

  const handleDeleteCidade = async (id: number) => {
    if (!confirm('Deseja excluir este município?')) return;
    try {
      await medtecApi.cidades.delete(id);
      setApiCidades(prev => prev.filter(c => c.id !== id));
    } catch (err: unknown) {
      const errorData = err as { message?: string };
      alert(`Erro ao excluir município: ${errorData.message || 'Falha'}`);
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

  const handleDeleteProject = (id: string) => {
    if (!data) return;
    if (!confirm('Deseja realmente excluir este projeto pedagógico das escolas?')) return;
    const updated = (data.projects || []).filter(p => p.id !== id);
    persistData({ ...data, projects: updated });
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !projectForm.title || !projectForm.school || !projectForm.municipality) {
      alert('Por favor, preencha o Título do Projeto, a Escola Estadual e o Município.');
      return;
    }

    const currentProjects = data.projects || [];
    const num = projectForm.number?.trim() || String(currentProjects.length + 1).padStart(2, '0');
    const missionCode = projectForm.missionCode?.trim() || `Projeto ${num}`;
    
    // Iniciais do mediador
    let initials = projectForm.mediatorInitials?.trim() || '';
    if (!initials && projectForm.mediatorName) {
      initials = projectForm.mediatorName
        .replace(/Profª?\.?/gi, '')
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');
    }

    // Processar competências
    const parsedCompetencias = competenciasInput
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    // Processar materiais
    const parsedMaterials = materialsInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const slug = (projectForm.title || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const id = editingProject?.id || `missao-${num}-${slug || Date.now()}`;

    const completeProject: ProjectMission = {
      id,
      number: num,
      missionCode,
      title: projectForm.title.trim(),
      shortTitle: projectForm.shortTitle?.trim() || projectForm.title.trim(),
      track: (projectForm.track as ProjectMission['track']) || 'Agroecologia & NBAZ',
      territory: projectForm.territory?.trim() || `${projectForm.municipality} • Rondônia`,
      typology: projectForm.typology?.trim() || 'Comunidade Escolar de Rondônia',
      municipality: projectForm.municipality.trim(),
      school: projectForm.school.trim(),
      mediatorName: projectForm.mediatorName?.trim() || 'Equipe Pedagógica MEDTEC',
      mediatorRole: projectForm.mediatorRole?.trim() || 'Docente Mediador(a)',
      mediatorInitials: initials || 'MD',
      studentCohort: projectForm.studentCohort?.trim() || 'Ensino Médio Regular',
      seal: projectForm.seal?.trim() || 'Inovação e Prática de Campo',
      image: projectForm.image?.trim() || '/hero.jpg',
      initialApplause: Number(projectForm.initialApplause) || 120,
      desafioLocal: {
        title: projectForm.desafioLocal?.title?.trim() || 'Desafio Territorial Enfrentado',
        description: projectForm.desafioLocal?.description?.trim() || 'Descrição da problemática local e contexto da comunidade escolar.',
      },
      praticaMedtec: {
        title: projectForm.praticaMedtec?.title?.trim() || 'Metodologia com Mediação Tecnológica',
        description: projectForm.praticaMedtec?.description?.trim() || 'Metodologia ativa e uso da tecnologia aplicada à realidade local.',
      },
      impactoGerado: {
        title: projectForm.impactoGerado?.title?.trim() || 'Transformação Comunitária',
        metric: projectForm.impactoGerado?.metric?.trim() || 'Resultados em Campo',
        description: projectForm.impactoGerado?.description?.trim() || 'Impacto positivo mensurado junto aos estudantes e famílias.',
      },
      competencias: parsedCompetencias.length > 0 ? parsedCompetencias : ['Pensamento Científico', 'Sustentabilidade', 'Cultura Digital'],
      quote: projectForm.quote?.trim() || 'A mediação tecnológica conecta os conhecimentos da floresta ao futuro dos nossos jovens.',
      replicationGuide: {
        materials: parsedMaterials.length > 0 ? parsedMaterials : ['Computador conectado ao canal MEDTEC', 'Caderno de campo e celulares para registro'],
        timeline: projectForm.replicationGuide?.timeline || defaultProjectTimeline,
        pedagogicalTip: projectForm.replicationGuide?.pedagogicalTip?.trim() || 'Incentive a escuta das famílias e o protagonismo dos estudantes desde a primeira semana.',
      },
    };

    let updatedProjects: ProjectMission[];
    if (editingProject) {
      updatedProjects = currentProjects.map(p => p.id === editingProject.id ? completeProject : p);
    } else {
      updatedProjects = [completeProject, ...currentProjects];
    }

    persistData({ ...data, projects: updatedProjects });
    setProjectViewMode('lista');
    setEditingProject(null);
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

  const handleDeleteFaq = (id: string) => {
    if (!data) return;
    if (!confirm('Deseja realmente excluir esta dúvida frequente do portal?')) return;
    const updated = (data.faqs || []).filter((f) => f.id !== id);
    persistData({ ...data, faqs: updated });
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
    if (!data || !faqForm.question?.trim() || !faqForm.answer?.trim()) {
      alert('Por favor, informe a Pergunta e a Resposta da dúvida.');
      return;
    }

    const currentFaqs = data.faqs || [];
    const num = faqForm.index?.trim() || String(currentFaqs.length + 1).padStart(2, '0');
    const id = editingFaq?.id || `faq-${Date.now()}`;

    const parsedTags = faqTagsInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const actionLink =
      faqForm.actionLink?.label?.trim() && faqForm.actionLink?.href?.trim()
        ? { label: faqForm.actionLink.label.trim(), href: faqForm.actionLink.href.trim() }
        : undefined;

    const completeFaq: FaqItem = {
      id,
      index: num,
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
      category: (faqForm.category as FaqItem['category']) || 'Metodologia & Aulas ao Vivo',
      personas: faqForm.personas && faqForm.personas.length > 0 ? faqForm.personas : ['estudantes', 'mediadores'],
      actionLink,
      tags: parsedTags.length > 0 ? parsedTags : ['MEDTEC', 'SEDUC-RO'],
    };

    let updatedFaqs: FaqItem[];
    if (editingFaq) {
      updatedFaqs = currentFaqs.map((f) => (f.id === editingFaq.id ? completeFaq : f));
    } else {
      updatedFaqs = [completeFaq, ...currentFaqs];
    }

    persistData({ ...data, faqs: updatedFaqs });
    setEditingFaq(null);
    setFaqViewMode('lista');
  };

  const newsFolders = data
    ? Array.from(new Set(data.news.map((item) => item.folder?.trim() || 'Geral'))).sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      )
    : [];
  const publishedCount = data ? data.news.filter((item) => item.published !== false).length : 0;
  const draftCount = data ? data.news.length - publishedCount : 0;
  const totalNewsViews = data ? data.news.reduce((acc, curr) => acc + (curr.views || 0), 0) : 0;
  const urgentAnnouncementsCount = data ? data.announcements.filter(a => a.type === 'urgente').length : 0;
  const activeAnnouncementsCount = data ? data.announcements.filter(a => a.active).length : 0;

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

  // Seções onde o botão "Salvar Alterações" no topo deve estar ativo
  const isEditableCmsSection = ['visaoGeral', 'fotos', 'noticias', 'avisos', 'galeria', 'redes', 'siteInfo', 'projetos', 'duvidas', 'estadosCidades'].includes(currentSection);

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
          badge: data?.news?.length,
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
          badge: apiAvisos.length > 0 ? apiAvisos.length : data?.announcements?.length,
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
          badge: apiFotos.length > 0 ? apiFotos.length : data?.gallery?.length,
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
          badge: draftCount > 0 ? draftCount : undefined,
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
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-7 min-w-0">
              <SitePhotosManager
                data={data}
                saving={saving}
                onSave={persistData}
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

    if (tab === 'noticias' && canAccessNews) {
      return (
        <div className="space-y-6">
          {/* Sub-navegação Interna: Lista vs Editor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewsViewMode('lista')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  newsViewMode === 'lista'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Newspaper className="h-4 w-4" />
                <span>Itens Publicados ({data.news.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (newsViewMode !== 'editor') {
                    handleNewNews();
                  }
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  newsViewMode === 'editor'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>{editingNews ? 'Editando Notícia' : 'Nova Notícia'}</span>
              </button>
            </div>

            {newsViewMode === 'lista' ? (
              <button
                type="button"
                onClick={handleNewNews}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Cadastrar Nova Notícia</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingNews(null);
                  setNewsViewMode('lista');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar para Lista de Notícias</span>
              </button>
            )}
          </div>

          {/* Formulário de Criação / Edição + Prévia ao Vivo */}
          {newsViewMode === 'editor' && (
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {editingNews ? 'Editar Notícia' : 'Publicar Nova Notícia'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Insira título, texto completo e escolha uma foto do seu computador ou via link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingNews(null);
                  setNewsForm({
                    title: '',
                    category: 'Pedagógico',
                    author: 'Equipe MEDTEC / SEDUC',
                    coverImage: '',
                    excerpt: '',
                    content: '',
                    featured: false,
                    urgent: false,
                    folder: 'Geral',
                    published: true,
                    publishedAt: '',
                  });
                  setNewsViewMode('lista');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
              >
                Cancelar e Voltar
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 min-w-0">
                <form onSubmit={handleSaveNews} className="space-y-5">
                {/* PASSO 1: TÍTULO E CATEGORIA */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Passo 1: Título e Categoria
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Título da Notícia *
                      </label>
                      <input
                        type="text"
                        required
                        value={newsForm.title}
                        onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                        placeholder="Ex: Polo ribeirinho recebe novos computadores do MEDTEC..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Categoria
                      </label>
                      <select
                        value={newsForm.category}
                        onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                      >
                        <option value="Pedagógico">Pedagógico</option>
                        <option value="Institucional">Institucional</option>
                        <option value="Infraestrutura">Infraestrutura</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Eventos">Eventos</option>
                        <option value="Agroecologia">Agroecologia</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Pasta no Painel
                      </label>
                      <input
                        type="text"
                        list="pastas-noticias"
                        value={newsForm.folder || ''}
                        onChange={(e) => setNewsForm({ ...newsForm, folder: e.target.value })}
                        placeholder="Ex: Institucional, Eventos, Interior"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                      />
                      <datalist id="pastas-noticias">
                        {newsFolders.map((folder) => (
                          <option key={folder} value={folder} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Situação no Site
                      </label>
                      <select
                        value={newsForm.published === false ? 'rascunho' : 'publicado'}
                        onChange={(e) => setNewsForm({ ...newsForm, published: e.target.value === 'publicado' })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                      >
                        <option value="publicado">Publicada (visível no site)</option>
                        <option value="rascunho">Rascunho (apenas no painel)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* PASSO 2: FOTO DE CAPA DA MATÉRIA */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Passo 2: Foto de Capa da Matéria
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                        1. Fazer upload do computador:
                      </span>
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#060D1A] border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#004A99] rounded-xl cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#004A99] transition">
                        <Upload size={16} />
                        <span>{uploadingImage ? 'Enviando foto...' : 'Escolher foto do PC'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileUpload(e, 'news')}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                        2. Ou colar link direto de imagem:
                      </span>
                      <input
                        type="url"
                        value={newsForm.coverImage}
                        onChange={e => setNewsForm({ ...newsForm, coverImage: e.target.value })}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {newsForm.coverImage && (
                    <div className="pt-2 flex items-center gap-3">
                      <img
                        src={newsForm.coverImage}
                        alt="Preview"
                        className="w-20 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                      <span className="text-xs text-[#004A99] dark:text-sky-400 font-medium truncate max-w-sm">
                        Foto selecionada: {newsForm.coverImage}
                      </span>
                    </div>
                  )}
                </div>

                {/* PASSO 3: TEXTO COMPLETO E PUBLICAÇÃO */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">3</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Passo 3: Texto e Publicação
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Resumo Curto (Exibido no card da notícia)
                    </label>
                    <input
                      type="text"
                      value={newsForm.excerpt}
                      onChange={e => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                      placeholder="Breve resumo da matéria em 1 ou 2 frases..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Conteúdo Completo da Notícia *
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={newsForm.content}
                      onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                      placeholder="Escreva aqui os parágrafos completos da notícia..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Autor da Publicação
                      </label>
                      <input
                        type="text"
                        value={newsForm.author}
                        onChange={e => setNewsForm({ ...newsForm, author: e.target.value })}
                        placeholder="Ex: Assessoria de Comunicação SEDUC"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Data de Publicação
                      </label>
                      <input
                        type="text"
                        value={newsForm.publishedAt}
                        onChange={e => setNewsForm({ ...newsForm, publishedAt: e.target.value })}
                        placeholder="Ex: 10/10/2026"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={!!newsForm.featured}
                        onChange={e => setNewsForm({ ...newsForm, featured: e.target.checked })}
                        className="rounded text-[#004A99] focus:ring-[#004A99] h-4 w-4"
                      />
                      <label htmlFor="featured" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Destacar na página inicial
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="urgent"
                        checked={!!newsForm.urgent}
                        onChange={e => setNewsForm({ ...newsForm, urgent: e.target.checked })}
                        className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                      />
                      <label htmlFor="urgent" className="text-xs font-semibold text-rose-700 dark:text-rose-400 cursor-pointer">
                        Marcar como urgência
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Save size={16} />
                      <span>{editingNews ? 'Salvar Edição da Notícia' : 'Publicar Notícia Oficial'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="xl:col-span-5 min-w-0">
              <AdminLiveSimulator
                type="noticia"
                data={{
                  title: newsForm.title || '',
                  excerpt: newsForm.excerpt || '',
                  content: newsForm.content || '',
                  coverImage: newsForm.coverImage || '',
                  author: newsForm.author || '',
                  category: newsForm.category || 'Pedagógico',
                  publishedAt: newsForm.publishedAt || new Date().toLocaleDateString('pt-BR'),
                  featured: !!newsForm.featured,
                  urgent: !!newsForm.urgent,
                  published: newsForm.published !== false,
                }}
                hasUnsavedChanges={
                  !!(
                    (newsForm.title && newsForm.title.trim() !== (editingNews?.title || '')) ||
                    (newsForm.content && newsForm.content.trim() !== (editingNews?.content || '')) ||
                    (newsForm.excerpt && newsForm.excerpt.trim() !== (editingNews?.excerpt || '')) ||
                    (newsForm.coverImage && newsForm.coverImage.trim() !== (editingNews?.coverImage || ''))
                  )
                }
                onOpenFullscreen={() => setPreviewModal({
                  isOpen: true,
                  type: 'noticia',
                  data: {
                    title: newsForm.title || '',
                    excerpt: newsForm.excerpt || '',
                    content: newsForm.content || '',
                    coverImage: newsForm.coverImage || '',
                    author: newsForm.author || '',
                    category: newsForm.category || 'Pedagógico',
                    publishedAt: newsForm.publishedAt || new Date().toLocaleDateString('pt-BR'),
                    featured: !!newsForm.featured,
                    urgent: !!newsForm.urgent,
                    published: newsForm.published !== false,
                  },
                })}
              />
            </div>
          </div>
        </div>
        )}

          {/* Listagem de Notícias Cadastradas */}
          {newsViewMode === 'lista' && (
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Notícias por pasta ({data.news.length})
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{publishedCount} publicadas</span>
                  {' · '}
                  <span className="font-bold text-slate-600 dark:text-slate-400">{draftCount} rascunhos</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setNewsFolder('Todas')}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  newsFolder === 'Todas' ? 'bg-[#004A99] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Todas ({data.news.length})
              </button>
              {newsFolders.map((folder) => {
                const total = data.news.filter((item) => (item.folder || 'Geral') === folder).length;
                const live = data.news.filter(
                  (item) => (item.folder || 'Geral') === folder && item.published !== false
                ).length;
                return (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => setNewsFolder(folder)}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      newsFolder === folder ? 'bg-[#004A99] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {folder} ({live}/{total})
                  </button>
                );
              })}
            </div>

            <div className="space-y-6">
              {newsFolders
                .filter((folder) => newsFolder === 'Todas' || folder === newsFolder)
                .map((folder) => {
                  const items = data.news.filter((item) => (item.folder || 'Geral') === folder);
                  if (items.length === 0) return null;
                  const live = items.filter((item) => item.published !== false).length;
                  return (
                    <section key={folder}>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{folder}</h4>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {live} publicada{live === 1 ? '' : 's'} · {items.length - live} rascunho{items.length - live === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                        {items.map((item) => (
                          <div key={item.id} className="py-4 px-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="w-16 h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                              />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {item.category}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {item.publishedAt}
                                  </span>
                                  {item.featured && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                      Destaque
                                    </span>
                                  )}
                                  {item.urgent && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                                      Urgente
                                    </span>
                                  )}
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                                    item.published === false
                                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  }`}>
                                    {item.published === false ? 'Rascunho' : 'Publicada'}
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.excerpt}</p>
                                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                  <Eye size={12} />
                                  <span>
                                    {(item.views || 0).toLocaleString('pt-BR')}{' '}
                                    {(item.views || 0) === 1 ? 'visualização' : 'visualizações'}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewModal({ isOpen: true, type: 'noticia', data: item })}
                                className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-[#004A99] dark:text-[#00D8FF] text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-sky-200 dark:border-sky-800/60"
                                title="Ver prévia deste item no site oficial"
                              >
                                <Eye size={13} />
                                <span className="hidden md:inline">Ver Prévia</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTogglePublished(item.id)}
                                className={`rounded-lg px-2.5 py-2 text-[11px] font-bold cursor-pointer transition ${
                                  item.published === false
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {item.published === false ? 'Publicar' : 'Tirar do ar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditNews(item)}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-600 dark:text-slate-300 hover:text-primary transition cursor-pointer"
                                title="Editar notícia"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNews(item.id)}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition cursor-pointer"
                                title="Excluir notícia"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
            </div>
          </div>
          )}
        </div>
      );
    }

    if (tab === 'avisos' && canAccessAnnouncements) {
      const activeTipo = apiTiposAviso.find(t => t.id === selectedTipoAvisoId) || apiTiposAviso[0];
      const displayAvisosCount = apiAvisos.length > 0 ? apiAvisos.length : data?.announcements?.length || 0;

      return (
        <div className="space-y-6">
          {/* Sub-navegação Interna: Lista vs Editor vs Gerenciar Tipos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAnnouncementViewMode('lista');
                  setShowTipoAvisoManager(false);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  announcementViewMode === 'lista' && !showTipoAvisoManager
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Avisos Oficiais ({displayAvisosCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleNewAnnouncement();
                  setShowTipoAvisoManager(false);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  announcementViewMode === 'editor' && !showTipoAvisoManager
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>{editingAnnouncementId ? 'Editar Aviso' : 'Novo Comunicado'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTipoAvisoManager(!showTipoAvisoManager)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  showTipoAvisoManager
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Palette className="h-4 w-4 text-amber-500" />
                <span>Tipos e Cores de Aviso ({apiTiposAviso.length})</span>
              </button>
            </div>

            {announcementViewMode === 'lista' && !showTipoAvisoManager && (
              <button
                type="button"
                onClick={handleNewAnnouncement}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Cadastrar Novo Aviso</span>
              </button>
            )}
          </div>

          {/* Gerenciador de Tipos de Aviso (CRUD /a_tipos_aviso) */}
          {showTipoAvisoManager && (
            <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-amber-200 dark:border-amber-900/40 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Palette className="text-amber-500 h-5 w-5" />
                    <span>Gerenciar Tipos de Aviso e Cores (`/a_tipos_aviso`)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defina as categorias dinâmicas de avisos e a cor hexadecimal (#RRGGBB) aplicada no portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTipoAvisoManager(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              {/* Formulário de Criar/Editar Tipo */}
              <form onSubmit={handleSaveTipoAviso} className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {editingTipoAviso ? `Editar Tipo: ${editingTipoAviso.nome}` : 'Cadastrar Novo Tipo de Aviso'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Tipo *
                    </label>
                    <input
                      type="text"
                      required
                      value={tipoAvisoForm.nome}
                      onChange={e => {
                        const val = e.target.value;
                        const autoSlug = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
                        setTipoAvisoForm(prev => ({
                          ...prev,
                          nome: val,
                          slug: editingTipoAviso ? prev.slug : autoSlug,
                        }));
                      }}
                      placeholder="Ex: Urgente, Alerta, Informativo..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Slug Único *
                    </label>
                    <input
                      type="text"
                      required
                      value={tipoAvisoForm.slug}
                      onChange={e => setTipoAvisoForm({ ...tipoAvisoForm, slug: e.target.value.toLowerCase().trim() })}
                      placeholder="ex: urgente"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cor Hexadecimal *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tipoAvisoForm.cor}
                        onChange={e => setTipoAvisoForm({ ...tipoAvisoForm, cor: e.target.value.toUpperCase() })}
                        className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        required
                        value={tipoAvisoForm.cor}
                        onChange={e => setTipoAvisoForm({ ...tipoAvisoForm, cor: e.target.value.toUpperCase() })}
                        placeholder="#DC2626"
                        maxLength={7}
                        className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs font-mono text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer flex-1"
                    >
                      {editingTipoAviso ? 'Atualizar' : 'Salvar Tipo'}
                    </button>
                    {editingTipoAviso && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTipoAviso(null);
                          setTipoAvisoForm({ nome: '', slug: '', cor: '#004A99', posicao: 0, ativo: true });
                        }}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Lista de Tipos Existentes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {apiTiposAviso.map((tipo) => (
                  <div
                    key={tipo.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060D1A] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-md border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: tipo.cor }}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{tipo.nome}</p>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          slug: {tipo.slug} • {tipo.cor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTipoAviso(tipo);
                          setTipoAvisoForm({
                            nome: tipo.nome,
                            slug: tipo.slug,
                            cor: tipo.cor,
                            posicao: tipo.posicao || 0,
                            ativo: tipo.ativo !== false,
                          });
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Editar tipo"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTipoAviso(tipo.id)}
                        className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600"
                        title="Excluir tipo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Criar / Editar Aviso */}
          {announcementViewMode === 'editor' && (
            <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                    {editingAnnouncementId ? 'Editar Comunicado Oficial' : 'Adicionar Comunicado ou Aviso'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aparecerá com destaque no topo do portal com a cor oficial configurada na API v1.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAnnouncementId(null);
                    setAnnouncementViewMode('lista');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
                >
                  Cancelar e Voltar
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-7 min-w-0">
                  <form onSubmit={handleSaveAnnouncement} className="space-y-5">
                    {/* PASSO 1: TÍTULO E CLASSIFICAÇÃO */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Passo 1: Título e Classificação do Tipo
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Título do Aviso *
                          </label>
                          <input
                            type="text"
                            required
                            value={announcementForm.title}
                            onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                            placeholder="Ex: Suspensão de transmissões na data..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Tipo de Aviso (API)
                          </label>
                          <div className="relative">
                            <select
                              value={selectedTipoAvisoId || ''}
                              onChange={e => {
                                const id = Number(e.target.value);
                                setSelectedTipoAvisoId(id);
                                const tipo = apiTiposAviso.find(t => t.id === id);
                                if (tipo) {
                                  setAnnouncementForm(prev => ({
                                    ...prev,
                                    type: (tipo.slug as AnnouncementType) || 'aviso',
                                    typeColor: tipo.cor,
                                    typeName: tipo.nome,
                                    a_tipo_aviso_id: tipo.id,
                                  }));
                                }
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                            >
                              {apiTiposAviso.length === 0 ? (
                                <option value="1">Padrão Oficial (Azul)</option>
                              ) : (
                                apiTiposAviso.map(t => (
                                  <option key={t.id} value={t.id}>
                                    {t.nome} ({t.slug})
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PASSO 2: MENSAGEM */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Passo 2: Mensagem e Orientações
                        </h3>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Conteúdo do Comunicado *
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={announcementForm.content}
                          onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                          placeholder="Detalhes e orientações para as escolas, professores e estudantes..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                        />
                      </div>
                    </div>

                    {/* PASSO 3: BOTÃO DE AÇÃO */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">3</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Passo 3: Link de Destino e Publicação
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Texto do Botão / Link (Opcional)
                          </label>
                          <input
                            type="text"
                            value={announcementForm.linkText}
                            onChange={e => setAnnouncementForm({ ...announcementForm, linkText: e.target.value })}
                            placeholder="Ex: Baixar Edital Oficial"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            URL de Destino
                          </label>
                          <input
                            type="text"
                            value={announcementForm.linkUrl}
                            onChange={e => setAnnouncementForm({ ...announcementForm, linkUrl: e.target.value })}
                            placeholder="Ex: #secao ou https://..."
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={announcementForm.active ?? true}
                            onChange={e => setAnnouncementForm({ ...announcementForm, active: e.target.checked })}
                            className="rounded border-slate-300 text-[#004A99] focus:ring-[#004A99]"
                          />
                          <span>Publicar e manter ativo no mural</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAnnouncementId(null);
                          setAnnouncementViewMode('lista');
                        }}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                      >
                        <Save size={16} />
                        <span>{editingAnnouncementId ? 'Salvar Alterações' : 'Cadastrar Aviso Oficial'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="xl:col-span-5 min-w-0">
                  <AdminLiveSimulator
                    type="aviso"
                    data={{
                      title: announcementForm.title || '',
                      content: announcementForm.content || '',
                      type: announcementForm.type || 'aviso',
                      date: new Date().toLocaleDateString('pt-BR'),
                      linkText: announcementForm.linkText || '',
                      linkUrl: announcementForm.linkUrl || '',
                      active: announcementForm.active ?? true,
                      cor: activeTipo?.cor,
                      typeName: activeTipo?.nome,
                    }}
                    hasUnsavedChanges={
                      !!(
                        (announcementForm.title && announcementForm.title.trim() !== '') ||
                        (announcementForm.content && announcementForm.content.trim() !== '')
                      )
                    }
                    onOpenFullscreen={() => setPreviewModal({
                      isOpen: true,
                      type: 'aviso',
                      data: {
                        title: announcementForm.title || '',
                        content: announcementForm.content || '',
                        type: announcementForm.type || 'aviso',
                        date: new Date().toLocaleDateString('pt-BR'),
                        linkText: announcementForm.linkText || '',
                        linkUrl: announcementForm.linkUrl || '',
                        active: announcementForm.active ?? true,
                        cor: activeTipo?.cor,
                        typeName: activeTipo?.nome,
                      },
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lista de Avisos */}
          {announcementViewMode === 'lista' && (
            <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Avisos Atuais ({displayAvisosCount})
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {(apiAvisos.length > 0 ? apiAvisos : (data?.announcements || [])).map((item) => {
                  const isApiItem = 'a_tipo_aviso_id' in item;
                  const itemTitle = 'titulo' in item ? item.titulo : item.title;
                  const itemContent = 'conteudo' in item ? item.conteudo : item.content;
                  const itemDate = 'created_at' in item ? new Date(item.created_at).toLocaleDateString('pt-BR') : item.date;
                  const itemActive = 'ativo' in item ? item.ativo !== false : (item as AnnouncementItem).active !== false;
                  const itemColor = (isApiItem && item.a_tipo_aviso?.cor) || (item as AnnouncementItem).typeColor;
                  const itemTypeName = (isApiItem && item.a_tipo_aviso?.nome) || (item as AnnouncementItem).typeName || (item as AnnouncementItem).type;

                  return (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            style={itemColor ? { backgroundColor: `${itemColor}20`, color: itemColor, borderColor: `${itemColor}50` } : undefined}
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
                          >
                            {itemTypeName}
                          </span>
                          <span className="text-xs text-slate-400">{itemDate}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            itemActive 
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {itemActive ? 'Ativo na Home' : 'Oculto'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{itemTitle}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">{itemContent}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewModal({
                            isOpen: true,
                            type: 'aviso',
                            data: {
                              title: itemTitle,
                              content: itemContent,
                              date: itemDate,
                              cor: itemColor,
                              typeName: itemTypeName,
                              active: itemActive,
                            }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-[#004A99] dark:text-[#00D8FF] text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-sky-200 dark:border-sky-800/60"
                          title="Ver prévia deste aviso no mural oficial"
                        >
                          <Eye size={13} />
                          <span className="hidden md:inline">Ver Prévia</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditAnnouncement(item)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAnnouncementActive(String(item.id))}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        >
                          {itemActive ? 'Ocultar' : 'Exibir'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(String(item.id))}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (tab === 'galeria' && canAccessGallery) {
      const displayFotosCount = apiFotos.length > 0 ? apiFotos.length : data?.gallery?.length || 0;
      const selectedCatObj = apiCategorias.find(c => c.id === selectedCategoriaId) || apiCategorias[0];

      return (
        <div className="space-y-6">
          {/* Sub-navegação Interna: Lista vs Editor vs Categorias */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setGalleryViewMode('lista');
                  setShowCategoriaManager(false);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  galleryViewMode === 'lista' && !showCategoriaManager
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Camera className="h-4 w-4" />
                <span>Fotos no Acervo ({displayFotosCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleNewPhoto();
                  setShowCategoriaManager(false);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  galleryViewMode === 'editor' && !showCategoriaManager
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>{editingPhotoId ? 'Editar Foto' : 'Adicionar Foto'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCategoriaManager(!showCategoriaManager)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  showCategoriaManager
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="h-4 w-4 text-sky-500" />
                <span>Categorias da Galeria ({apiCategorias.length})</span>
              </button>
            </div>

            {galleryViewMode === 'lista' && !showCategoriaManager && (
              <button
                type="button"
                onClick={handleNewPhoto}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Cadastrar Nova Foto</span>
              </button>
            )}
          </div>

          {/* Gerenciador de Categorias da Galeria (/categorias_galeria) */}
          {showCategoriaManager && (
            <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-sky-200 dark:border-sky-900/40 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="text-sky-500 h-5 w-5" />
                    <span>Categorias da Galeria Oficial (`/categorias_galeria`)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cadastre, organize e edite as categorias de fotos dos projetos, estúdios e salas de aula.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoriaManager(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              {/* Form de Categoria */}
              <form onSubmit={handleSaveCategoria} className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {editingCategoria ? `Editar Categoria: ${editingCategoria.nome}` : 'Nova Categoria'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoriaForm.nome}
                      onChange={e => {
                        const val = e.target.value;
                        const autoSlug = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
                        setCategoriaForm(prev => ({
                          ...prev,
                          nome: val,
                          slug: editingCategoria ? prev.slug : autoSlug,
                        }));
                      }}
                      placeholder="Ex: Salas de Aula, Eventos..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Slug Único *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoriaForm.slug}
                      onChange={e => setCategoriaForm({ ...categoriaForm, slug: e.target.value.toLowerCase().trim() })}
                      placeholder="ex: salas_de_aula"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Posição / Ordem
                    </label>
                    <input
                      type="number"
                      value={categoriaForm.posicao}
                      onChange={e => setCategoriaForm({ ...categoriaForm, posicao: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer flex-1"
                    >
                      {editingCategoria ? 'Atualizar' : 'Salvar Categoria'}
                    </button>
                    {editingCategoria && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoria(null);
                          setCategoriaForm({ nome: '', slug: '', posicao: 0, ativo: true });
                        }}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Lista de Categorias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {apiCategorias.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060D1A] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{cat.nome}</p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        slug: {cat.slug} • ordem: {cat.posicao}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoria(cat);
                          setCategoriaForm({
                            nome: cat.nome,
                            slug: cat.slug,
                            posicao: cat.posicao || 0,
                            ativo: cat.ativo !== false,
                          });
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Editar categoria"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategoria(cat.id)}
                        className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600"
                        title="Excluir categoria"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload / Edição de Foto */}
          {galleryViewMode === 'editor' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                      {editingPhotoId ? 'Editar Fotografia do Acervo' : 'Adicionar Foto à Galeria'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Suporte duplo da API: Envie arquivos via upload (`multipart/form-data`) ou informe links externos (`imagem_url`).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPhotoId(null);
                      setGalleryViewMode('lista');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
                  >
                    Cancelar e Voltar
                  </button>
                </div>

                <form onSubmit={handleSavePhoto} className="space-y-5">
                  {/* PASSO 1: IDENTIFICAÇÃO E CATEGORIA */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Passo 1: Identificação e Categoria Oficial
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Título / Legenda da Foto *
                        </label>
                        <input
                          type="text"
                          required
                          value={galleryForm.title}
                          onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                          placeholder="Ex: Turma da E.E.E.F.M no Rio Madeira acompanhando aula"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Categoria da Galeria (API)
                        </label>
                        <select
                          value={selectedCategoriaId || ''}
                          onChange={e => {
                            const id = Number(e.target.value);
                            setSelectedCategoriaId(id);
                            const cat = apiCategorias.find(c => c.id === id);
                            if (cat) {
                              setGalleryForm(prev => ({
                                ...prev,
                                category: cat.nome,
                                categoria_galeria_id: cat.id,
                              }));
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                        >
                          {apiCategorias.length === 0 ? (
                            <option value="1">Salas de Aula (Padrão)</option>
                          ) : (
                            apiCategorias.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.nome} ({c.slug})
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* PASSO 2: ENVIO DUPLO DA IMAGEM */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Passo 2: Envio da Fotografia (Upload ou Link Direto)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                          Opção A: Upload de arquivo do computador (`File`)
                        </span>
                        <label className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 bg-white dark:bg-[#060D1A] border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#004A99] rounded-xl cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#004A99] transition">
                          <Upload size={18} />
                          <span>{galleryFile ? `Arquivo: ${galleryFile.name}` : 'Selecionar Imagem do Computador'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setGalleryFile(file);
                                setGalleryForm(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {galleryFile && (
                          <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                            <span>Pronto para upload em multipart/form-data</span>
                            <button
                              type="button"
                              onClick={() => {
                                setGalleryFile(null);
                                setGalleryForm(prev => ({ ...prev, imageUrl: '' }));
                              }}
                              className="text-rose-500 hover:underline cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                          Opção B: Ou informar Link Externo (`imagem_url`)
                        </span>
                        <input
                          type="url"
                          value={galleryForm.imageUrl && !galleryFile ? galleryForm.imageUrl : ''}
                          onChange={e => {
                            setGalleryFile(null);
                            setGalleryForm({ ...galleryForm, imageUrl: e.target.value });
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                        />
                      </div>
                    </div>

                    {galleryForm.imageUrl && (
                      <div className="pt-2 flex items-center gap-3">
                        <img
                          src={galleryForm.imageUrl}
                          alt="Preview"
                          className="w-24 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        <span className="text-xs text-[#004A99] dark:text-sky-400 font-semibold truncate max-w-sm">
                          Foto pronta para o acervo oficial da mediação tecnológica!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PASSO 3: DESCRIÇÃO */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">3</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Passo 3: Descrição e Contextualização
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Descrição Breve ou Detalhes da Localidade
                      </label>
                      <input
                        type="text"
                        value={galleryForm.description || ''}
                        onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        placeholder="Breve contextualização da imagem, escola ou município..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPhotoId(null);
                        setGalleryViewMode('lista');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <Save size={16} />
                      <span>{editingPhotoId ? 'Salvar Alterações' : 'Inserir Foto no Acervo'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Coluna Direita: Simulador de Galeria Fiel ao Vivo */}
              <div className="xl:col-span-5 xl:sticky xl:top-24">
                <AdminLiveSimulator
                  type="galeria"
                  data={{
                    title: galleryForm.title || '',
                    description: galleryForm.description || '',
                    category: selectedCatObj?.nome || galleryForm.category || 'Salas de Aula',
                    imageUrl: galleryForm.imageUrl,
                    date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                  }}
                  hasUnsavedChanges={Boolean(galleryForm.title || galleryForm.imageUrl || galleryForm.description)}
                  onOpenFullscreen={() => setPreviewModal({
                    isOpen: true,
                    type: 'galeria',
                    data: {
                      title: galleryForm.title || 'Título da Fotografia no Acervo',
                      description: galleryForm.description || 'Breve contextualização da imagem da sala de aula ou comunidade atendida.',
                      category: selectedCatObj?.nome || galleryForm.category || 'Salas de Aula',
                      imageUrl: galleryForm.imageUrl,
                      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                    }
                  })}
                />
              </div>
            </div>
          )}

          {/* Grid de Fotos Existentes */}
          {galleryViewMode === 'lista' && (
            <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Fotos no Acervo da Galeria ({displayFotosCount})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(apiFotos.length > 0 ? apiFotos : (data?.gallery || [])).map((photo) => {
                  const isApiFoto = 'categoria_galeria_id' in photo;
                  const photoTitle = 'titulo' in photo ? photo.titulo : photo.title;
                  const photoDesc = ('descricao' in photo ? photo.descricao : (photo as GalleryItem).description) || '';
                  const photoCat = isApiFoto && photo.categoria_galeria ? photo.categoria_galeria.nome : (photo as GalleryItem).category;
                  const photoImg = 'imagem' in photo && photo.imagem
                    ? getMediaUrl(photo.imagem)
                    : (photo as GalleryItem).imageUrl || ('imagem_url' in photo ? photo.imagem_url || '' : '');
                  const photoDate = 'created_at' in photo ? new Date(photo.created_at).toLocaleDateString('pt-BR') : (photo as GalleryItem).date;

                  return (
                    <div key={photo.id} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-[#060D1A] flex flex-col justify-between group">
                      <div className="relative h-40 bg-slate-200 dark:bg-slate-900">
                        <img
                          src={photoImg}
                          alt={photoTitle}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                          {photoCat}
                        </span>
                      </div>

                      <div className="p-3">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{photoTitle}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{photoDesc}</p>
                        
                        <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">{photoDate}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                type: 'galeria',
                                data: {
                                  title: photoTitle,
                                  description: photoDesc,
                                  category: photoCat,
                                  imageUrl: photoImg,
                                  date: photoDate,
                                }
                              })}
                              className="text-slate-500 hover:text-[#004A99] dark:hover:text-sky-400 p-1 cursor-pointer transition"
                              title="Pré-visualizar no site"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditPhoto(photo)}
                              className="text-slate-500 hover:text-[#004A99] p-1 cursor-pointer"
                              title="Editar foto"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(String(photo.id))}
                              className="text-rose-600 hover:text-rose-800 dark:text-rose-400 p-1 cursor-pointer"
                              title="Excluir foto"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (tab === 'redes' && canAccessSocials) {
      const FIXED_REDES_CONFIG = [
        {
          rede: 'youtube' as const,
          label: 'YouTube (Canal Oficial)',
          desc: 'Transmissões ao vivo, videoaulas e eventos',
          icon: YoutubeIcon,
          placeholder: 'https://www.youtube.com/@SeducRondonia',
          defaultVal: data?.socials?.youtube || '',
        },
        {
          rede: 'instagram' as const,
          label: 'Instagram Oficial',
          desc: 'Publicações, stories e novidades da rede estadual',
          icon: InstagramIcon,
          placeholder: 'https://instagram.com/seducro',
          defaultVal: data?.socials?.instagram || '',
        },
        {
          rede: 'facebook' as const,
          label: 'Facebook Oficial',
          desc: 'Página institucional do Governo de Rondônia',
          icon: FacebookIcon,
          placeholder: 'https://facebook.com/seducro',
          defaultVal: data?.socials?.facebook || '',
        },
        {
          rede: 'whatsapp' as const,
          label: 'WhatsApp de Suporte / Polos',
          desc: 'Canal direto para atendimento pedagógico e técnico',
          icon: MessageSquare,
          placeholder: 'https://wa.me/5569999998888 ou 69999998888',
          defaultVal: data?.socials?.whatsapp || '',
        },
        {
          rede: 'telefone' as const,
          label: 'Telefone da SEDUC',
          desc: 'Central de atendimento telefônico oficial',
          icon: Phone,
          placeholder: '(69) 3216-5300',
          defaultVal: data?.socials?.phone || '',
        },
        {
          rede: 'email' as const,
          label: 'E-mail Institucional',
          desc: 'Endereço para dúvidas, protocolos e comunicados',
          icon: Mail,
          placeholder: 'contato@seduc.ro.gov.br',
          defaultVal: data?.socials?.email || '',
        },
        {
          rede: 'endereco' as const,
          label: 'Endereço Oficial',
          desc: 'Localização física da sede da SEDUC / Palácio Rio Madeira',
          icon: MapPin,
          placeholder: 'Av. Farquar, 2986 - Bairro Pedrinhas, Palácio Rio Madeira, Porto Velho - RO',
          defaultVal: data?.socials?.address || '',
        },
      ];

      const updateCanal = (rede: string, field: 'valor' | 'posicao' | 'ativo', val: any) => {
        setApiCanais(prev => {
          const idx = prev.findIndex(c => c.rede === rede);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: val };
            return copy;
          }
          const cfg = FIXED_REDES_CONFIG.find(c => c.rede === rede);
          const newEntry: CanalContato = {
            id: 0,
            rede: rede as any,
            valor: field === 'valor' ? val : (cfg?.defaultVal || ''),
            posicao: field === 'posicao' ? val : (FIXED_REDES_CONFIG.findIndex(c => c.rede === rede) + 1),
            ativo: field === 'ativo' ? val : true,
          };
          return [...prev, newEntry];
        });
      };

      return (
        <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Share2 size={18} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Canais Oficiais de Contato e Redes Sociais (/canais_contato)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure os 7 canais fixos da API Backend v1. Cada canal possui valor, ordem de exibição (posição) e controle de visibilidade (ativo).
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSocials} className="space-y-4">
            <div className="space-y-3">
              {FIXED_REDES_CONFIG.map((item, index) => {
                const canal = apiCanais.find(c => c.rede === item.rede);
                const valor = canal?.valor !== undefined ? canal.valor : item.defaultVal;
                const posicao = canal?.posicao !== undefined ? canal.posicao : (index + 1);
                const ativo = canal?.ativo !== undefined ? canal.ativo : true;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.rede}
                    className={`p-4 rounded-xl border transition-all ${
                      ativo
                        ? 'bg-slate-50/70 dark:bg-[#060D1A] border-slate-200 dark:border-slate-800'
                        : 'bg-slate-100/40 dark:bg-[#060D1A]/40 border-dashed border-slate-200 dark:border-slate-800/60 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          ativo
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          <IconComponent size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                              {item.label}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              rede: &quot;{item.rede}&quot;
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={ativo}
                            onChange={e => updateCanal(item.rede, 'ativo', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-10 h-5 rounded-full transition-colors relative ${
                            ativo ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                              ativo ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                          </div>
                          <span className={`text-xs font-bold ${
                            ativo ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                          }`}>
                            {ativo ? 'Visível no Portal' : 'Oculto'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-10">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Valor / Link / Contato
                        </label>
                        <input
                          type="text"
                          value={valor}
                          onChange={e => updateCanal(item.rede, 'valor', e.target.value)}
                          placeholder={item.placeholder}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071324] text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Posição
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={posicao}
                          onChange={e => updateCanal(item.rede, 'posicao', parseInt(e.target.value) || 1)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071324] text-slate-900 dark:text-slate-100 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Os canais ativos serão sincronizados automaticamente com o rodapé e o botão flutuante.
              </span>
              <button
                type="submit"
                disabled={savingCanais}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#003875] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {savingCanais ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Salvar 7 Canais na API Backend</span>
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (tab === 'siteInfo' && canAccessSiteInfo) {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-7 bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Textos Institucionais & Métricas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Altere os títulos, slogans e números exibidos na página inicial do MEDTEC em tempo real.
              </p>
            </div>

            <div className="space-y-6">
              {/* Métricas */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Números e Métricas de Alcance (Hero)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Estudantes Formados/Atendidos
                    </label>
                    <input
                      type="text"
                      value={data.stats.studentsCount}
                      onChange={e => setData({ ...data, stats: { ...data.stats, studentsCount: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Salas Conectadas
                    </label>
                    <input
                      type="text"
                      value={data.stats.schoolsCount}
                      onChange={e => setData({ ...data, stats: { ...data.stats, schoolsCount: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Municípios Atendidos
                    </label>
                    <input
                      type="text"
                      value={data.stats.citiesCount}
                      onChange={e => setData({ ...data, stats: { ...data.stats, citiesCount: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Horas de Transmissão
                    </label>
                    <input
                      type="text"
                      value={data.stats.liveHoursCount}
                      onChange={e => setData({ ...data, stats: { ...data.stats, liveHoursCount: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Textos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Título do Hero
                  </label>
                  <input
                    type="text"
                    value={data.siteInfo.heroTitle}
                    onChange={e => setData({ ...data, siteInfo: { ...data.siteInfo, heroTitle: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Descrição do Hero
                  </label>
                  <textarea
                    rows={2}
                    value={data.siteInfo.heroDescription}
                    onChange={e => setData({ ...data, siteInfo: { ...data.siteInfo, heroDescription: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Referência Legal / Legislação
                  </label>
                  <input
                    type="text"
                    value={data.siteInfo.lawText}
                    onChange={e => setData({ ...data, siteInfo: { ...data.siteInfo, lawText: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => persistData(data)}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Save size={16} />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>

          {/* Coluna Direita: Simulador de Métricas Fiel ao Vivo */}
          <div className="xl:col-span-5 xl:sticky xl:top-24">
            <AdminLiveSimulator
              type="siteInfo"
              data={data}
              hasUnsavedChanges={false}
              onOpenFullscreen={() => setPreviewModal({
                isOpen: true,
                type: 'siteInfo',
                data: data,
              })}
            />
          </div>
        </div>
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
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Salvando Projeto...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>{editingProject ? 'Salvar Alterações da Missão' : 'Cadastrar Projeto Oficial'}</span>
                        </>
                      )}
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
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Sincronização Automática</span>
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Ao salvar, o projeto ficará disponível instantaneamente na aba pública &ldquo;Projetos&rdquo; e na página inicial.
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
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{editingFaq ? 'Atualizar Dúvida' : 'Salvar e Publicar Dúvida'}</span>
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
      const selectedEstado = apiEstados.find(e => e.id === selectedEstadoId);
      const filteredCidades = apiCidades.filter(c =>
        c.nome.toLowerCase().includes(cidadeSearch.toLowerCase()) ||
        (c.codigo_ibge && c.codigo_ibge.includes(cidadeSearch))
      );

      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  <MapPin size={18} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Estados e Municípios Oficiais (/g_estados e /g_cidades)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Gerencie as Unidades Federativas e seus respectivos municípios cadastrados na base de dados oficial da SEDUC-RO.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingEstado(null);
                  setEstadoForm({ nome: '', sigla_uf: '', codigo_ibge: '' });
                  setEstadoError('');
                  setShowEstadoModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Novo Estado (UF)</span>
              </button>
            </div>
          </div>

          {/* Grid de 2 Colunas: Estados na esquerda, Cidades na direita */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Coluna 1: Estados */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0B1729] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Estados Cadastrados</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    {apiEstados.length}
                  </span>
                </h3>
              </div>

              {loadingEstados ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className="text-xs">Carregando estados...</span>
                </div>
              ) : apiEstados.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Nenhum estado cadastrado. Clique em &quot;Novo Estado&quot;.
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {apiEstados.map(est => {
                    const isSelected = est.id === selectedEstadoId;
                    return (
                      <div
                        key={est.id}
                        onClick={() => setSelectedEstadoId(est.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm'
                            : 'bg-white dark:bg-[#060D1A] border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {est.sigla_uf}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {est.nome}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              IBGE: {est.codigo_ibge || 'Não inf.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEstado(est);
                              setEstadoForm({
                                nome: est.nome,
                                sigla_uf: est.sigla_uf,
                                codigo_ibge: est.codigo_ibge || '',
                              });
                              setEstadoError('');
                              setShowEstadoModal(true);
                            }}
                            title="Editar Estado"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition cursor-pointer"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEstado(est.id)}
                            title="Excluir Estado"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Coluna 2: Cidades do Estado Selecionado */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0B1729] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Municípios</span>
                    {selectedEstado && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                        de {selectedEstado.nome} ({selectedEstado.sigla_uf})
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {apiCidades.length} município(s) registrado(s)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!selectedEstadoId}
                    onClick={() => {
                      if (!selectedEstadoId) return;
                      setEditingCidade(null);
                      setCidadeForm({ g_estado_id: selectedEstadoId, nome: '', codigo_ibge: '' });
                      setCidadeError('');
                      setShowCidadeModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Novo Município</span>
                  </button>
                </div>
              </div>

              {/* Filtro de Busca de Municípios */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar municípios por nome ou código IBGE..."
                  value={cidadeSearch}
                  onChange={e => setCidadeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {loadingCidades ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                  <span className="text-xs">Carregando municípios...</span>
                </div>
              ) : !selectedEstadoId ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Selecione um estado na coluna ao lado para visualizar os municípios.
                </div>
              ) : filteredCidades.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  {cidadeSearch ? 'Nenhum município encontrado com este filtro.' : 'Nenhum município cadastrado neste estado.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredCidades.map(cid => (
                    <div
                      key={cid.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {cid.nome}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          IBGE: {cid.codigo_ibge || 'Não cadastrado'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCidade(cid);
                            setCidadeForm({
                              g_estado_id: cid.g_estado_id,
                              nome: cid.nome,
                              codigo_ibge: cid.codigo_ibge || '',
                            });
                            setCidadeError('');
                            setShowCidadeModal(true);
                          }}
                          title="Editar Município"
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCidade(cid.id)}
                          title="Excluir Município"
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Estado */}
          {showEstadoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#0B1729] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingEstado ? 'Editar Estado (UF)' : 'Novo Estado (UF)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowEstadoModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                {estadoError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
                    {estadoError}
                  </div>
                )}

                <form onSubmit={handleSaveEstado} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Estado *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rondônia"
                      value={estadoForm.nome}
                      onChange={e => setEstadoForm({ ...estadoForm, nome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Sigla (UF) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        placeholder="RO"
                        value={estadoForm.sigla_uf}
                        onChange={e => setEstadoForm({ ...estadoForm, sigla_uf: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Código IBGE
                      </label>
                      <input
                        type="text"
                        placeholder="11"
                        value={estadoForm.codigo_ibge}
                        onChange={e => setEstadoForm({ ...estadoForm, codigo_ibge: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEstadoModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingEstado}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-[#003875] text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {savingEstado ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      <span>{editingEstado ? 'Salvar Alterações' : 'Cadastrar Estado'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Cidade */}
          {showCidadeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#0B1729] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingCidade ? 'Editar Município' : 'Novo Município'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCidadeModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                {cidadeError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
                    {cidadeError}
                  </div>
                )}

                <form onSubmit={handleSaveCidade} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Estado Pertencente
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${selectedEstado?.nome || ''} (${selectedEstado?.sigla_uf || ''})`}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#060D1A] text-slate-500 dark:text-slate-400 text-xs font-bold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Município *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Porto Velho, Ji-Paraná..."
                      value={cidadeForm.nome}
                      onChange={e => setCidadeForm({ ...cidadeForm, nome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Código IBGE do Município
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1100205"
                      value={cidadeForm.codigo_ibge}
                      onChange={e => setCidadeForm({ ...cidadeForm, codigo_ibge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCidadeModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingCidade}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-[#003875] text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {savingCidade ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      <span>{editingCidade ? 'Salvar Município' : 'Cadastrar Município'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-screen h-[100dvh] w-full flex overflow-hidden bg-slate-50 dark:bg-[#060D1A] text-slate-800 dark:text-slate-100">
      
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

            {/* Feedback e Botão Primário de Salvar (Aparece apenas nas seções de edição do CMS) */}
            {isEditableCmsSection && (
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    <span>Salvo no banco</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => persistData(data)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            )}
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
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {data.news.length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {publishedCount} no ar · {draftCount} rascunhos
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {totalNewsViews.toLocaleString('pt-BR')} visualizações no site
                    </p>
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
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {data.announcements.length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activeAnnouncementsCount} avisos ativos no mural da Home
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {urgentAnnouncementsCount > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          {urgentAnnouncementsCount} classificado{urgentAnnouncementsCount === 1 ? '' : 's'} urgente
                        </span>
                      ) : (
                        'Nenhum comunicado urgente ativo'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSection('avisos');
                      setAnnouncementViewMode('lista');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Gerenciar Avisos</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* KPI 3: Banners e Fotos */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Banners da Home & Fotos
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                      <Presentation className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {(data.banners?.length || 0) + data.gallery.length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {data.banners?.length || 0} banners rotativos no topo
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {data.gallery.length} fotos públicas no acervo
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentSection('fotos')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-sky-400 hover:text-[#003875] dark:hover:text-sky-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Trocar Banners da Home</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
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
                          {data.news.length} matérias
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
                          {data.news[0]?.title || 'Nenhuma notícia publicada ainda'}
                        </p>
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          {data.news[0]?.publishedAt || ''} • {data.news[0]?.author || 'SEDUC-RO'}
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
                          {data.announcements.length} avisos
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
                          {(data.announcements.find(a => a.type === 'urgente' && a.active) || data.announcements[0])?.title || 'Sem comunicados urgentes no momento'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                          {data.announcements.filter(a => a.active).length} avisos em exibição no portal
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSection('avisos');
                        setAnnouncementViewMode('lista');
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Abrir Avisos e Comunicados</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
                          {data.gallery.length} fotos
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
                          {data.gallery.length} fotos catalogadas em Salas de Aula, Estúdios de TV, Comunidades Ribeirinhas e Feiras SEDUC.
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                          Fotos públicas visíveis no portal
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSection('galeria');
                        setGalleryViewMode('lista');
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Abrir Galeria de Fotos</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
                          {draftCount} pendentes
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
                          {Math.ceil(draftCount / 2)} matérias aguardando revisão jurídica e conformidade com LGPD/ECA antes da veiculação oficial.
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
                        <button
                          type="button"
                          onClick={() => setCurrentSection('siteInfo')}
                          className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071324] hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200/60 dark:hover:border-blue-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer group"
                        >
                          <span className="flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                            <span>Números de Alunos e Escolas</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSection('redes')}
                          className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071324] hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200/60 dark:hover:border-blue-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer group"
                        >
                          <span className="flex items-center gap-2">
                            <Share2 className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                            <span>Redes Sociais e WhatsApp</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition" />
                        </button>
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

                    <button
                      type="button"
                      onClick={() => setCurrentSection('siteInfo')}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Gerenciar Dados e Configurações</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
                news={data?.news || []}
                onApproveNews={handleApproveNews}
                onRejectNews={handleRejectNews}
                isGestor={userSession.isGestor}
              />
            </div>
          )}

          {/* VISÃO 3: FOTOS & BANNERS DO SITE (VISÃO DEDICADA) */}
          {currentSection === 'fotos' && canAccessPhotos && renderCmsModule('fotos')}

          {/* VISÃO 4: NOTÍCIAS & REPORTAGENS (VISÃO DEDICADA) */}
          {currentSection === 'noticias' && canAccessNews && renderCmsModule('noticias')}

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
