'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DatabaseSchema, NewsItem, AnnouncementItem, GalleryItem } from '@/types';
import { 
  Tv, 
  LayoutDashboard, 
  Newspaper, 
  Bell, 
  Image as ImageIcon, 
  Share2, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Upload, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  Search,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import EditorialKanban from '@/components/EditorialKanban';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DatabaseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'noticias' | 'avisos' | 'galeria' | 'redes' | 'siteInfo'>('noticias');
  const [mainView, setMainView] = useState<'kanban' | 'cms'>('kanban');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('medtec2025');
  const [loginError, setLoginError] = useState('');

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
    publishedAt: '',
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

  // Carrega dados iniciais e verifica sessão
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const authRes = await fetch('/api/auth');
      if (authRes.ok) {
        setIsLoggedIn(true);
        const res = await fetch('/api/data');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
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
    } catch (err) {
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
      // Editar
      updatedNews = updatedNews.map(item => 
        item.id === editingNews.id 
          ? ({ ...item, ...newsForm } as NewsItem)
          : item
      );
    } else {
      // Criar nova
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
        tags: ['MEDTEC', 'SEDUC-RO'],
      };
      updatedNews.unshift(newItem);
    }

    const newData: DatabaseSchema = { ...data, news: updatedNews };
    persistData(newData);

    // Reset form
    setEditingNews(null);
    setNewsForm({
      title: '',
      category: 'Pedagógico',
      author: 'Equipe MEDTEC / SEDUC',
      coverImage: '',
      excerpt: '',
      content: '',
      featured: false,
      publishedAt: '',
    });
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
    window.scrollTo({ top: 300, behavior: 'smooth' });
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

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setIsLoggedIn(true);
        fetchData();
      } else {
        setLoginError(resData.error || 'Credenciais inválidas');
      }
    } catch {
      setLoginError('Falha ao conectar.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800">
      <SiteHeader />

      <PageHeader
        eyebrow="Acesso restrito (simulação)"
        title="Painel Editorial SEDUC-RO"
        text="Todo conteúdo passa por Rascunho → Revisão Jurídica/LGPD → Aprovado → Publicado."
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 w-full">
        {/* Main View Switcher */}
        <div className="flex border-b border-slate-200 mb-8 gap-3">
          <button
            onClick={() => setMainView('kanban')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              mainView === 'kanban'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Pipeline Editorial (Kanban & LGPD)
          </button>
          <button
            onClick={() => setMainView('cms')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              mainView === 'cms'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Gerenciador Geral de Notícias & Portal CMS
          </button>
        </div>

        {mainView === 'kanban' && (
          <div className="pb-16">
            <EditorialKanban />
          </div>
        )}

        {mainView === 'cms' && (!isLoggedIn || !data) && (
          <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white shadow-md">
              <Tv size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Autenticação de Gestor SEDUC
            </h3>
            <p className="text-xs text-slate-500">
              Entre com suas credenciais para gerenciar notícias, galeria e comunicados salvos em disco.
            </p>

            {loginError && (
              <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {loginError}
              </div>
            )}

            <form onSubmit={handleInlineLogin} className="space-y-3 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-700">Usuário</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Senha</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-lg bg-primary text-white font-semibold text-xs shadow hover:opacity-90 transition-opacity"
              >
                Acessar Gerenciador CMS
              </button>
            </form>
          </div>
        )}

        {mainView === 'cms' && isLoggedIn && data && (
          <div className="space-y-6 pb-16">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span className="text-xs font-semibold text-slate-700">Gestor Autenticado: admin (SEDUC)</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Encerrar Sessão
              </button>
            </div>
      <header className="bg-slate-900 text-white px-6 py-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-md">
              <Tv size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Painel de Gestão CMS
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">
                  MEDTEC RO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerencie Notícias, Galeria, Avisos e Redes Sociais com persistência em disco
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 transition"
            >
              <Eye size={14} />
              <span>Ver Site Público</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alerta de Feedback de Salvamento */}
      {saveSuccess && (
        <div className="bg-primary text-white text-xs font-bold py-2.5 px-6 text-center flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle size={16} />
          <span>Alterações salvas com sucesso no banco de dados!</span>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-2 pt-3">
          <button
            onClick={() => setActiveTab('noticias')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'noticias'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Newspaper size={16} />
            <span>Notícias ({data.news.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('avisos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'avisos'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell size={16} />
            <span>Avisos ({data.announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('galeria')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'galeria'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon size={16} />
            <span>Galeria de Fotos ({data.gallery.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('redes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'redes'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Share2 size={16} />
            <span>Redes Sociais & Contatos</span>
          </button>

          <button
            onClick={() => setActiveTab('siteInfo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'siteInfo'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings size={16} />
            <span>Métricas & Textos Institucionais</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal da Aba */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        
        {/* ================= ABA NOTÍCIAS ================= */}
        {activeTab === 'noticias' && (
          <div className="space-y-8">
            {/* Formulário de Criação / Edição */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {editingNews ? 'Editar Notícia' : 'Publicar Nova Notícia'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Insira título, texto completo e escolha uma foto do seu computador ou via link.
                  </p>
                </div>
                {editingNews && (
                  <button
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
                        publishedAt: '',
                      });
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveNews} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Título da Notícia *</label>
                    <input
                      type="text"
                      required
                      value={newsForm.title}
                      onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                      placeholder="Ex: Polo ribeirinho recebe novos computadores do MEDTEC..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                    <select
                      value={newsForm.category}
                      onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Autor da Publicação</label>
                    <input
                      type="text"
                      value={newsForm.author}
                      onChange={e => setNewsForm({ ...newsForm, author: e.target.value })}
                      placeholder="Ex: Assessoria de Comunicação SEDUC"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Data de Publicação</label>
                    <input
                      type="text"
                      value={newsForm.publishedAt}
                      onChange={e => setNewsForm({ ...newsForm, publishedAt: e.target.value })}
                      placeholder="Ex: 10/10/2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                {/* Upload e URL da Imagem de Capa */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Foto de Capa da Notícia</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">1. Fazer upload do computador:</span>
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-slate-300 hover:border-primary rounded-xl cursor-pointer text-xs font-semibold text-slate-700 hover:text-primary transition">
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
                      <span className="text-[11px] text-slate-500 block mb-1">2. Ou colar link direto de imagem:</span>
                      <input
                        type="url"
                        value={newsForm.coverImage}
                        onChange={e => setNewsForm({ ...newsForm, coverImage: e.target.value })}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {newsForm.coverImage && (
                    <div className="pt-2 flex items-center gap-3">
                      <img
                        src={newsForm.coverImage}
                        alt="Preview"
                        className="w-20 h-14 rounded-lg object-cover border border-slate-200 shadow-xs"
                      />
                      <span className="text-xs text-primary font-medium truncate max-w-sm">
                        Foto selecionada: {newsForm.coverImage}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resumo Curto (Exibido no card)</label>
                  <input
                    type="text"
                    value={newsForm.excerpt}
                    onChange={e => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                    placeholder="Breve resumo da matéria em 1 ou 2 frases..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Conteúdo Completo da Notícia *</label>
                  <textarea
                    rows={6}
                    required
                    value={newsForm.content}
                    onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                    placeholder="Escreva aqui os parágrafos completos da notícia..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newsForm.featured}
                    onChange={e => setNewsForm({ ...newsForm, featured: e.target.checked })}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="featured" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Destacar notícia na página inicial
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Save size={16} />
                    <span>{editingNews ? 'Salvar Edição' : 'Publicar Notícia'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Listagem de Notícias Cadastradas */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-lg font-black text-slate-900">
                Notícias Cadastradas ({data.news.length})
              </h3>

              <div className="divide-y divide-slate-100">
                {data.news.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-16 h-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.publishedAt}
                          </span>
                          {item.featured && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800">
                              Destaque
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{item.excerpt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleEditNews(item)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-primary transition"
                        title="Editar notícia"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                        title="Excluir notícia"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA AVISOS ================= */}
        {activeTab === 'avisos' && (
          <div className="space-y-8">
            {/* Criar Aviso */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-1">Adicionar Comunicado ou Aviso</h2>
              <p className="text-xs text-slate-500 mb-6">
                Aparecerá com destaque no topo do portal com alerta colorido.
              </p>

              <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Título do Aviso *</label>
                    <input
                      type="text"
                      required
                      value={announcementForm.title}
                      onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      placeholder="Ex: Suspensão de transmissões na data..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nível de Urgência</label>
                    <select
                      value={announcementForm.type}
                      onChange={e => setAnnouncementForm({ ...announcementForm, type: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="aviso">Aviso Importante (Amarelo)</option>
                      <option value="urgente">Urgente (Vermelho)</option>
                      <option value="informativo">Informativo (Azul)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Conteúdo do Aviso *</label>
                  <textarea
                    rows={3}
                    required
                    value={announcementForm.content}
                    onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    placeholder="Detalhes e orientações para as escolas e alunos..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Texto do Botão / Link (Opcional)</label>
                    <input
                      type="text"
                      value={announcementForm.linkText}
                      onChange={e => setAnnouncementForm({ ...announcementForm, linkText: e.target.value })}
                      placeholder="Ex: Baixar Edital"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">URL de Destino</label>
                    <input
                      type="text"
                      value={announcementForm.linkUrl}
                      onChange={e => setAnnouncementForm({ ...announcementForm, linkUrl: e.target.value })}
                      placeholder="Ex: #secao ou https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <Plus size={16} />
                  <span>Cadastrar Aviso</span>
                </button>
              </form>
            </div>

            {/* Lista de Avisos */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-lg font-black text-slate-900">
                Avisos Atuais ({data.announcements.length})
              </h3>

              <div className="divide-y divide-slate-100">
                {data.announcements.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.type === 'urgente' 
                            ? 'bg-rose-100 text-rose-800' 
                            : item.type === 'aviso'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-xs text-slate-400">{item.date}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.active ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {item.active ? 'Ativo na Home' : 'Oculto'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 max-w-2xl">{item.content}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAnnouncementActive(item.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition"
                      >
                        {item.active ? 'Ocultar' : 'Exibir'}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(item.id)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA GALERIA ================= */}
        {activeTab === 'galeria' && (
          <div className="space-y-8">
            {/* Upload de Foto */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-1">Adicionar Foto à Galeria</h2>
              <p className="text-xs text-slate-500 mb-6">
                Faça upload de fotos das salas de aula conectadas, estúdios ou eventos da SEDUC.
              </p>

              <form onSubmit={handleSavePhoto} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Título / Legenda da Foto *</label>
                    <input
                      type="text"
                      required
                      value={galleryForm.title}
                      onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      placeholder="Ex: Turma da E.E.E.F.M no Rio Madeira acompanhando aula"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Categoria da Foto</label>
                    <select
                      value={galleryForm.category}
                      onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="Salas de Aula">Salas de Aula</option>
                      <option value="Estúdios">Estúdios de TV</option>
                      <option value="Comunidades">Comunidades & Aldeias</option>
                      <option value="Eventos">Eventos & Feiras</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Breve</label>
                  <input
                    type="text"
                    value={galleryForm.description}
                    onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    placeholder="Breve contextualização da imagem..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                {/* Upload ou URL */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">1. Enviar do computador:</span>
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-slate-300 hover:border-primary rounded-xl cursor-pointer text-xs font-semibold text-slate-700 hover:text-primary transition">
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
                      <span className="text-[11px] text-slate-500 block mb-1">2. Ou URL da imagem:</span>
                      <input
                        type="url"
                        value={galleryForm.imageUrl}
                        onChange={e => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {galleryForm.imageUrl && (
                    <div className="pt-2 flex items-center gap-3">
                      <img
                        src={galleryForm.imageUrl}
                        alt="Preview"
                        className="w-24 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <span className="text-xs text-primary font-semibold truncate max-w-sm">
                        Imagem carregada com sucesso!
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <Plus size={16} />
                  <span>Adicionar à Galeria</span>
                </button>
              </form>
            </div>

            {/* Grid de Fotos Existentes */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-lg font-black text-slate-900">
                Fotos na Galeria ({data.gallery.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.gallery.map((photo) => (
                  <div key={photo.id} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between group">
                    <div className="relative h-40 bg-slate-200">
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
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{photo.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{photo.description}</p>
                      
                      <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{photo.date}</span>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                          title="Excluir foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA REDES SOCIAIS ================= */}
        {activeTab === 'redes' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Configurar Redes Sociais e Atendimento</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atualize os links oficiais de transmissão, perfis do Governo de Rondônia e contatos da SEDUC.
              </p>
            </div>

            <form onSubmit={handleSaveSocials} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Canal do YouTube (Transmissões ao vivo)</label>
                  <input
                    type="url"
                    value={data.socials.youtube}
                    onChange={e => setData({ ...data, socials: { ...data.socials, youtube: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Oficial</label>
                  <input
                    type="url"
                    value={data.socials.instagram}
                    onChange={e => setData({ ...data, socials: { ...data.socials, instagram: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Página do Facebook</label>
                  <input
                    type="url"
                    value={data.socials.facebook}
                    onChange={e => setData({ ...data, socials: { ...data.socials, facebook: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp de Suporte / Polos</label>
                  <input
                    type="text"
                    value={data.socials.whatsapp}
                    onChange={e => setData({ ...data, socials: { ...data.socials, whatsapp: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone da SEDUC</label>
                  <input
                    type="text"
                    value={data.socials.phone}
                    onChange={e => setData({ ...data, socials: { ...data.socials, phone: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Institucional</label>
                  <input
                    type="email"
                    value={data.socials.email}
                    onChange={e => setData({ ...data, socials: { ...data.socials, email: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Endereço Oficial</label>
                <input
                  type="text"
                  value={data.socials.address}
                  onChange={e => setData({ ...data, socials: { ...data.socials, address: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <Save size={16} />
                  <span>Salvar Links e Contatos</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= ABA CONFIGURAÇÕES E TEXTOS ================= */}
        {activeTab === 'siteInfo' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Textos Institucionais & Métricas</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Altere os títulos, slogans e números exibidos na página inicial do MEDTEC.
              </p>
            </div>

            <div className="space-y-6">
              {/* Métricas */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-800">Números e Métricas de Alcance (Hero)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Estudantes Formados/Atendidos</label>
                    <input
                      type="text"
                      value={data.stats.studentsCount}
                      onChange={e => setData({ ...data, stats: { ...data.stats, studentsCount: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Salas Conectadas</label>
                    <input
                      type="text"
                      value={data.stats.schoolsCount}
                      onChange={e => setData({ ...data, stats: { ...data.stats, schoolsCount: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Municípios Atendidos</label>
                    <input
                      type="text"
                      value={data.stats.citiesCount}
                      onChange={e => setData({ ...data, stats: { ...data.stats, citiesCount: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Horas de Transmissão</label>
                    <input
                      type="text"
                      value={data.stats.liveHoursCount}
                      onChange={e => setData({ ...data, stats: { ...data.stats, liveHoursCount: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Textos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Título do Hero</label>
                  <input
                    type="text"
                    value={data.siteInfo.heroTitle}
                    onChange={e => setData({ ...data, siteInfo: { ...data.siteInfo, heroTitle: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descrição do Hero</label>
                  <textarea
                    rows={2}
                    value={data.siteInfo.heroDescription}
                    onChange={e => setData({ ...data, siteInfo: { ...data.siteInfo, heroDescription: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Referência Legal / Legislação</label>
                  <input
                    type="text"
                    value={data.siteInfo.lawText}
                    onChange={e => setData({ ...data, siteInfo: { ...data.siteInfo, lawText: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={() => persistData(data)}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
              >
                <Save size={16} />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>
        )}

      </main>

      </div>
      )}
      </div>

      <SiteFooter />
    </div>
  );
}
