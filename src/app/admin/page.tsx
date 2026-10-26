'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DatabaseSchema, NewsItem, AnnouncementItem, GalleryItem, AnnouncementType } from '@/types';
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
  Info
} from 'lucide-react';
import EditorialKanban from '@/components/EditorialKanban';
import SitePhotosManager from '@/components/SitePhotosManager';
import AdminLiveSimulator, { AdminPreviewModal, PreviewContentType, PreviewItemData } from '@/components/AdminLiveSimulator';
import UserManager from '@/components/UserManager';

type AdminSection = 'visaoGeral' | 'kanban' | 'fotos' | 'noticias' | 'avisos' | 'galeria' | 'redes' | 'siteInfo' | 'usuarios';
type CmsSubTab = 'fotos' | 'noticias' | 'avisos' | 'galeria' | 'redes' | 'siteInfo';

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
    if (['noticias', 'avisos', 'fotos', 'galeria'].includes(sec)) return 'publicacoes';
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

  // Carrega dados iniciais e verifica sessão
  const loadData = useCallback(async () => {
    try {
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

        // Configura a seção inicial de acordo com a atribuição do perfil
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

        const res = await fetch('/api/data');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } else {
        setIsLoggedIn(false);
        router.push('/admin/login');
      }
    } catch (err) {
      console.error(err);
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  // Upload genérico de arquivo de imagem
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'news' | 'gallery') => {
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
        } else {
          setGalleryForm(prev => ({ ...prev, imageUrl: resData.url }));
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

  const handleNewAnnouncement = () => {
    setAnnouncementForm({
      title: '',
      content: '',
      type: 'aviso',
      date: new Date().toLocaleDateString('pt-BR'),
      linkText: '',
      linkUrl: '',
      active: true,
    });
    setAnnouncementViewMode('editor');
  };

  const handleNewPhoto = () => {
    setGalleryForm({
      title: '',
      description: '',
      imageUrl: '',
      category: 'Salas de Aula',
      date: 'Outubro 2026',
    });
    setGalleryViewMode('editor');
  };

  // Funções de Gestão de Avisos
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !announcementForm.title || !announcementForm.content) return;

    const newId = `aviso-${Date.now()}`;
    const newItem: AnnouncementItem = {
      id: newId,
      title: announcementForm.title || '',
      content: announcementForm.content || '',
      type: announcementForm.type || 'aviso',
      date: announcementForm.date || new Date().toLocaleDateString('pt-BR'),
      linkText: announcementForm.linkText || '',
      linkUrl: announcementForm.linkUrl || '',
      active: announcementForm.active ?? true,
    };

    const newData: DatabaseSchema = {
      ...data,
      announcements: [newItem, ...data.announcements],
    };
    persistData(newData);

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
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!data) return;
    if (!confirm('Excluir este aviso?')) return;
    const updated = data.announcements.filter(a => a.id !== id);
    persistData({ ...data, announcements: updated });
  };

  const handleToggleAnnouncementActive = (id: string) => {
    if (!data) return;
    const updated = data.announcements.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    );
    persistData({ ...data, announcements: updated });
  };

  // Funções de Gestão da Galeria de Fotos
  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !galleryForm.title || !galleryForm.imageUrl) return;

    const newPhoto: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: galleryForm.title || '',
      description: galleryForm.description || '',
      imageUrl: galleryForm.imageUrl || '',
      category: galleryForm.category || 'Salas de Aula',
      date: galleryForm.date || 'Outubro 2026',
    };

    const newData: DatabaseSchema = {
      ...data,
      gallery: [newPhoto, ...data.gallery],
    };
    persistData(newData);

    setGalleryForm({
      title: '',
      description: '',
      imageUrl: '',
      category: 'Salas de Aula',
      date: 'Outubro 2026',
    });
    setGalleryViewMode('lista');
  };

  const handleDeletePhoto = (id: string) => {
    if (!data) return;
    if (!confirm('Deseja excluir esta foto da galeria?')) return;
    const updated = data.gallery.filter(g => g.id !== id);
    persistData({ ...data, gallery: updated });
  };

  // Funções de Redes Sociais & Contatos
  const handleSaveSocials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    persistData(data);
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
  const canAccessSocials = userSession.isGestor;
  const canAccessSiteInfo = userSession.isGestor;
  const canAccessKanban = userSession.isGestor;
  const canAccessUsers = userSession.isGestor;

  // Seções onde o botão "Salvar Alterações" no topo deve estar ativo
  const isEditableCmsSection = ['visaoGeral', 'fotos', 'noticias', 'avisos', 'galeria', 'redes', 'siteInfo'].includes(currentSection);

  // Árvore de Navegação em Pastas Expansíveis (Didático - Estilo Accordion JOER SEDUC-RO)
  const folders: NavFolderDef[] = [
    {
      id: 'publicacoes',
      label: 'Publicações do Site',
      icon: FolderKanban,
      visible: canAccessNews || canAccessAnnouncements || canAccessPhotos || canAccessGallery,
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
          section: 'avisos',
          label: 'Avisos e Comunicados',
          tooltip: 'Publicar alertas no mural',
          icon: Megaphone,
          badge: data?.announcements?.length,
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
          badge: data?.gallery?.length,
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
      visible: canAccessSiteInfo || canAccessSocials,
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
      return (
        <div className="space-y-6">
          {/* Sub-navegação Interna: Lista vs Editor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAnnouncementViewMode('lista')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  announcementViewMode === 'lista'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Avisos Atuais ({data.announcements.length})</span>
              </button>

              <button
                type="button"
                onClick={handleNewAnnouncement}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  announcementViewMode === 'editor'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Novo Aviso Oficial</span>
              </button>
            </div>

            {announcementViewMode === 'lista' ? (
              <button
                type="button"
                onClick={handleNewAnnouncement}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Cadastrar Novo Aviso</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAnnouncementViewMode('lista')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar para Lista de Avisos</span>
              </button>
            )}
          </div>

          {/* Criar Aviso */}
          {announcementViewMode === 'editor' && (
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  Adicionar Comunicado ou Aviso
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aparecerá com destaque no topo do portal com alerta colorido.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnnouncementViewMode('lista')}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
              >
                Cancelar e Voltar
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 min-w-0">
                <form onSubmit={handleSaveAnnouncement} className="space-y-5">
              {/* PASSO 1: TÍTULO E NÍVEL DE URGÊNCIA */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Passo 1: Título e Nível de Urgência
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
                      Nível de Urgência
                    </label>
                    <select
                      value={announcementForm.type}
                      onChange={e => setAnnouncementForm({ ...announcementForm, type: e.target.value as AnnouncementType })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                    >
                      <option value="aviso">Aviso Importante (Amarelo)</option>
                      <option value="urgente">Urgente (Vermelho)</option>
                      <option value="informativo">Informativo (Azul)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PASSO 2: MENSAGEM E ORIENTAÇÕES */}
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

              {/* PASSO 3: BOTÃO DE AÇÃO E PUBLICAÇÃO */}
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
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementViewMode('lista')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Cadastrar Aviso Oficial</span>
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
                active: true,
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
                  active: true,
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
              Avisos Atuais ({data.announcements.length})
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.announcements.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.type === 'urgente' 
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' 
                          : item.type === 'aviso'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400">{item.date}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.active 
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {item.active ? 'Ativo na Home' : 'Oculto'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">{item.content}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModal({ isOpen: true, type: 'aviso', data: item })}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-[#004A99] dark:text-[#00D8FF] text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-sky-200 dark:border-sky-800/60"
                      title="Ver prévia deste aviso no mural oficial"
                    >
                      <Eye size={13} />
                      <span className="hidden md:inline">Ver Prévia</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnnouncementActive(item.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      {item.active ? 'Ocultar' : 'Exibir'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(item.id)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      );
    }

    if (tab === 'galeria' && canAccessGallery) {
      return (
        <div className="space-y-6">
          {/* Sub-navegação Interna: Lista vs Editor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGalleryViewMode('lista')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  galleryViewMode === 'lista'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Camera className="h-4 w-4" />
                <span>Fotos na Galeria ({data.gallery.length})</span>
              </button>

              <button
                type="button"
                onClick={handleNewPhoto}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  galleryViewMode === 'editor'
                    ? 'bg-[#004A99] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Foto</span>
              </button>
            </div>

            {galleryViewMode === 'lista' ? (
              <button
                type="button"
                onClick={handleNewPhoto}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Cadastrar Nova Foto</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setGalleryViewMode('lista')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar para Galeria</span>
              </button>
            )}
          </div>

          {/* Upload de Foto */}
          {galleryViewMode === 'editor' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                      Adicionar Foto à Galeria
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Faça upload de fotos das salas de aula conectadas, estúdios ou eventos da SEDUC.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGalleryViewMode('lista')}
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
                        Passo 1: Identificação e Categoria
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
                          Categoria da Foto
                        </label>
                        <select
                          value={galleryForm.category}
                          onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                        >
                          <option value="Salas de Aula">Salas de Aula</option>
                          <option value="Estúdios">Estúdios de TV</option>
                          <option value="Comunidades">Comunidades & Aldeias</option>
                          <option value="Eventos">Eventos & Feiras</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* PASSO 2: ENVIO DA FOTOGRAFIA */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Passo 2: Envio da Fotografia
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                          Opção A: Enviar arquivo do computador
                        </span>
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#060D1A] border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#004A99] rounded-xl cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#004A99] transition">
                          <Upload size={16} />
                          <span>{uploadingImage ? 'Enviando...' : 'Fazer Upload da Imagem'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleFileUpload(e, 'gallery')}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                          Opção B: Ou colar link (URL direta)
                        </span>
                        <input
                          type="url"
                          value={galleryForm.imageUrl}
                          onChange={e => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
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
                          Foto carregada e pronta para o acervo!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PASSO 3: DESCRIÇÃO E CONFIRMAÇÃO */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-[#004A99] text-white text-[11px] font-black flex items-center justify-center shrink-0">3</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Passo 3: Descrição e Confirmação no Acervo
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Descrição Breve ou Detalhes da Localidade
                      </label>
                      <input
                        type="text"
                        value={galleryForm.description}
                        onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        placeholder="Breve contextualização da imagem, escola ou município..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setGalleryViewMode('lista')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Inserir Foto no Acervo da Galeria</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Coluna Direita: Simulador de Galeria Fiel ao Vivo */}
              <div className="xl:col-span-5 xl:sticky xl:top-24">
                <AdminLiveSimulator
                  type="galeria"
                  data={galleryForm}
                  hasUnsavedChanges={Boolean(galleryForm.title || galleryForm.imageUrl || galleryForm.description)}
                  onOpenFullscreen={() => setPreviewModal({
                    isOpen: true,
                    type: 'galeria',
                    data: {
                      title: galleryForm.title || 'Título da Fotografia no Acervo',
                      description: galleryForm.description || 'Breve contextualização da imagem da sala de aula ou comunidade atendida.',
                      category: galleryForm.category || 'Salas de Aula',
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
              Fotos na Galeria ({data.gallery.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.gallery.map((photo) => (
                <div key={photo.id} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-[#060D1A] flex flex-col justify-between group">
                  <div className="relative h-40 bg-slate-200 dark:bg-slate-900">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                      {photo.category}
                    </span>
                  </div>

                  <div className="p-3">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{photo.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{photo.description}</p>
                    
                    <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{photo.date}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewModal({
                            isOpen: true,
                            type: 'galeria',
                            data: {
                              title: photo.title,
                              description: photo.description,
                              category: photo.category,
                              imageUrl: photo.imageUrl,
                              date: photo.date,
                            }
                          })}
                          className="text-slate-500 hover:text-[#004A99] dark:hover:text-sky-400 p-1 cursor-pointer transition"
                          title="Pré-visualizar no site"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-rose-600 hover:text-rose-800 dark:text-rose-400 p-1 cursor-pointer"
                          title="Excluir foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      );
    }

    if (tab === 'redes' && canAccessSocials) {
      return (
        <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Configurar Redes Sociais e Atendimento
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Atualize os links oficiais de transmissão, perfis do Governo de Rondônia e contatos da SEDUC.
            </p>
          </div>

          <form onSubmit={handleSaveSocials} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Canal do YouTube (Transmissões ao vivo)
                </label>
                <input
                  type="url"
                  value={data.socials.youtube}
                  onChange={e => setData({ ...data, socials: { ...data.socials, youtube: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instagram Oficial
                </label>
                <input
                  type="url"
                  value={data.socials.instagram}
                  onChange={e => setData({ ...data, socials: { ...data.socials, instagram: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Página do Facebook
                </label>
                <input
                  type="url"
                  value={data.socials.facebook}
                  onChange={e => setData({ ...data, socials: { ...data.socials, facebook: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp de Suporte / Polos
                </label>
                <input
                  type="text"
                  value={data.socials.whatsapp}
                  onChange={e => setData({ ...data, socials: { ...data.socials, whatsapp: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone da SEDUC
                </label>
                <input
                  type="text"
                  value={data.socials.phone}
                  onChange={e => setData({ ...data, socials: { ...data.socials, phone: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail Institucional
                </label>
                <input
                  type="email"
                  value={data.socials.email}
                  onChange={e => setData({ ...data, socials: { ...data.socials, email: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Endereço Oficial
              </label>
              <input
                type="text"
                value={data.socials.address}
                onChange={e => setData({ ...data, socials: { ...data.socials, address: e.target.value } })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Save size={16} />
                <span>Salvar Links e Contatos</span>
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

    return null;
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060D1A] text-slate-800 dark:text-slate-100 overflow-x-hidden max-w-[100vw]">
      
      {/* ========================================================
          1. SIDEBAR DESKTOP (FIXA E RETRÁTIL COM ACCORDION JOER)
      ======================================================== */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out bg-[#07152B] text-slate-200 border-r border-slate-800 select-none z-30 sticky top-0 h-screen ${
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
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3 scrollbar-thin">
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
        <div className="mt-auto border-t border-slate-800/80 p-3 space-y-2 bg-[#051021]">
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
          <div className="fixed inset-y-0 left-0 w-72 bg-[#07152B] text-slate-200 border-r border-slate-800 flex flex-col z-50 shadow-2xl">
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
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3">
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

            <div className="border-t border-slate-800 p-3 space-y-2 bg-[#051021]">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOPBAR CONTEXTUAL STICKY */}
        <header className="h-16 sticky top-0 z-20 bg-white/95 dark:bg-[#0B1528]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          
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
              <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="hidden sm:inline">Painel Gestor</span>
                <ChevronRight className="h-3.5 w-3.5 hidden sm:inline text-slate-400" />
                <span className="hidden md:inline">{currentConfig.group}</span>
                <ChevronRight className="h-3.5 w-3.5 hidden md:inline text-slate-400" />
                <span className="font-bold text-slate-900 dark:text-white truncate">
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
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 space-y-6">
          
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

              {/* 2. Linha de Indicadores Rápidos (4 Cards no Topo) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
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

                </div>
              </div>

            </div>
          )}

          {/* VISÃO 2: PIPELINE KANBAN (EXCLUSIVO GESTOR) */}
          {currentSection === 'kanban' && canAccessKanban && (
            <div className="w-full">
              <EditorialKanban />
            </div>
          )}

          {/* VISÃO 3: FOTOS & BANNERS DO SITE (VISÃO DEDICADA) */}
          {currentSection === 'fotos' && canAccessPhotos && renderCmsModule('fotos')}

          {/* VISÃO 4: NOTÍCIAS & REPORTAGENS (VISÃO DEDICADA) */}
          {currentSection === 'noticias' && canAccessNews && renderCmsModule('noticias')}

          {/* VISÃO 5: MURAL DE AVISOS (VISÃO DEDICADA) */}
          {currentSection === 'avisos' && canAccessAnnouncements && renderCmsModule('avisos')}

          {/* VISÃO 6: GALERIA FOTOGRÁFICA (VISÃO DEDICADA) */}
          {currentSection === 'galeria' && canAccessGallery && renderCmsModule('galeria')}

          {/* VISÃO 7: REDES SOCIAIS & CONTATOS (VISÃO DEDICADA) */}
          {currentSection === 'redes' && canAccessSocials && renderCmsModule('redes')}

          {/* VISÃO 8: MÉTRICAS & TEXTOS INSTITUCIONAIS (VISÃO DEDICADA) */}
          {currentSection === 'siteInfo' && canAccessSiteInfo && renderCmsModule('siteInfo')}

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
