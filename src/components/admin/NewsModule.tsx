'use client';

import React, { useState, useImperativeHandle } from 'react';
import { Newspaper, Plus, ArrowLeft, Save, Upload, Eye, Edit3, Trash2, Loader2, AlertCircle } from 'lucide-react';
import type { NewsItem } from '@/types';
import { medtecApi, type NCategoriaNoticia } from '@/lib/api';
import AdminLiveSimulator, { type PreviewContentType, type PreviewItemData } from '@/components/AdminLiveSimulator';

export interface NewsModuleHandle {
  newNews: () => void;
}

interface NewsModuleProps {
  ref?: React.Ref<NewsModuleHandle>;
  effectiveNews: NewsItem[];
  apiNewsCategories: NCategoriaNoticia[];
  loadingNews: boolean;
  errorNews: string | null;
  userSession: { name?: string };
  canPublish: boolean;
  canUnpublish?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  initialNew?: boolean;
  initialEditingNews?: NewsItem;
  onEditNavigation?: (id: string) => void;
  newsViewMode: 'lista' | 'editor';
  setNewsViewMode: React.Dispatch<React.SetStateAction<'lista' | 'editor'>>;
  onRefresh: () => Promise<void>;
  onTogglePublished: (id: string) => Promise<void>;
  onPreview: (preview: { isOpen: boolean; type: PreviewContentType; data: PreviewItemData }) => void;
}

export default function NewsModule({ ref, effectiveNews, apiNewsCategories, loadingNews, errorNews,
  userSession, canPublish, canUnpublish = canPublish, canCreate = false, canEdit = false,
  canDelete = false, initialNew = false, initialEditingNews, onEditNavigation, newsViewMode, setNewsViewMode, onRefresh: loadApiData,
  onTogglePublished: handleTogglePublished, onPreview: setPreviewModal }: NewsModuleProps) {
  const [newsFolder, setNewsFolder] = useState('Todas');
  const [saving, setSaving] = useState(false);
  const [selectedNewsCategoriaId, setSelectedNewsCategoriaId] = useState<number | null>(() => apiNewsCategories.find(c => c.nome === initialEditingNews?.category)?.id || apiNewsCategories[0]?.id || null);
  const [newsCoverFile, setNewsCoverFile] = useState<File | null>(null);
  const [newsCoverUrl, setNewsCoverUrl] = useState('');
  // Estado para formulário de Notícia (novo ou edição)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(initialEditingNews || null);
  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>(() => initialEditingNews ? { ...initialEditingNews } : {
    title: '',
    category: apiNewsCategories[0]?.nome || 'Pedagógico',
    author: userSession.name || 'Equipe MEDTEC / SEDUC',
    coverImage: '',
    excerpt: '',
    content: '',
    featured: false,
    urgent: false,
    folder: 'Geral',
    published: false,
    publishedAt: initialNew ? new Date().toLocaleDateString('en-CA') : '',
  });

  // Funções de Gestão de Notícias (/n_noticias)
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNews ? !canEdit : !canCreate) return;
    if (loadingNews || errorNews) {
      alert('Aguarde o carregamento válido das notícias e categorias oficiais.');
      return;
    }
    if (!newsForm.title?.trim()) {
      alert('Informe o título da notícia.');
      return;
    }
    if (!newsForm.content?.trim()) {
      alert('Informe o conteúdo da notícia.');
      return;
    }

    const catId = selectedNewsCategoriaId || apiNewsCategories[0]?.id;
    if (!catId) {
      alert('Não há categoria oficial disponível para salvar a notícia.');
      return;
    }

    setSaving(true);
    try {
      if (newsCoverFile) {
        const formData = new FormData();
        formData.append('n_noticia[titulo]', newsForm.title.trim());
        formData.append('n_noticia[n_categoria_noticia_id]', String(catId));
        formData.append('n_noticia[conteudo]', newsForm.content.trim());
        if (newsForm.excerpt?.trim()) {
          formData.append('n_noticia[resumo]', newsForm.excerpt.trim());
        }
        if (newsForm.publishedAt?.trim()) {
          formData.append('n_noticia[data_publicacao]', newsForm.publishedAt.trim());
        }
        formData.append('n_noticia[imagem_capa]', newsCoverFile);

        if (editingNews && Number(editingNews.id)) {
          await medtecApi.noticias.update(Number(editingNews.id), formData);
        } else {
          await medtecApi.noticias.create(formData);
        }
      } else {
        const payload = {
          n_noticia: {
            titulo: newsForm.title.trim(),
            conteudo: newsForm.content.trim(),
            n_categoria_noticia_id: catId,
            resumo: newsForm.excerpt?.trim() || undefined,
            data_publicacao: newsForm.publishedAt?.trim() || undefined,
            // Omitir preserva o anexo; reenviar sua URL pode apagá-lo no Rails.
            imagem_capa_url: newsCoverUrl.trim() && newsCoverUrl.trim() !== editingNews?.coverImage?.trim()
              ? newsCoverUrl.trim() : undefined,
          },
        };

        if (editingNews && Number(editingNews.id)) {
          await medtecApi.noticias.update(Number(editingNews.id), payload);
        } else {
          await medtecApi.noticias.create(payload);
        }
      }

      const successMessage = editingNews
        ? 'Notícia atualizada com sucesso no backend!'
        : 'Notícia cadastrada com sucesso! Ela foi enviada para a fila de aprovação.';

      setEditingNews(null);
      setNewsCoverFile(null);
      setNewsCoverUrl('');
      setNewsForm({
        title: '',
        category: 'Pedagógico',
        author: userSession.name || 'SEDUC-RO',
        coverImage: '',
        excerpt: '',
        content: '',
        featured: false,
        urgent: false,
        folder: 'Geral',
        published: false,
        publishedAt: '',
      });
      setNewsFolder('Todas');
      setNewsViewMode('lista');
      await loadApiData();

      setTimeout(() => {
        alert(successMessage);
      }, 50);
    } catch (err: unknown) {
      const error = err as { errors?: string[]; message?: string };
      alert('Erro ao salvar notícia: ' + (error?.errors?.join(', ') || error?.message || 'Falha na comunicação com o backend.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!canDelete) return;
    const numId = Number(id);
    if (!numId) return;

    if (!confirm('Deseja realmente excluir esta notícia do sistema?')) return;

    try {
      await medtecApi.noticias.delete(numId);
      alert('Notícia excluída com sucesso.');
      await loadApiData();
    } catch (err: unknown) {
      const error = err as { errors?: string[]; message?: string };
      alert('Erro ao excluir notícia: ' + (error?.errors?.join(', ') || error?.message || 'Falha na operação.'));
    }
  };

  const handleEditNews = (item: NewsItem) => {
    if (!canEdit) return;
    if (onEditNavigation) {
      onEditNavigation(item.id);
      return;
    }
    setEditingNews(item);
    setNewsForm({ ...item });
    setNewsCoverFile(null);
    setNewsCoverUrl('');
    const cat = apiNewsCategories.find(c => c.nome === item.category);
    if (cat) {
      setSelectedNewsCategoriaId(cat.id);
    }
    setNewsViewMode('editor');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleNewNews = () => {
    if (!canCreate) return;
    setEditingNews(null);
    setNewsCoverFile(null);
    setNewsCoverUrl('');
    setNewsForm({
      title: '',
      category: apiNewsCategories[0]?.nome || 'Pedagógico',
      author: userSession.name || 'SEDUC-RO',
      coverImage: '',
      excerpt: '',
      content: '',
      featured: false,
      urgent: false,
      folder: 'Geral',
      published: false,
      publishedAt: new Date().toISOString().slice(0, 10),
    });
    if (apiNewsCategories.length > 0) {
      setSelectedNewsCategoriaId(apiNewsCategories[0].id);
    }
    setNewsViewMode('editor');
  };

  const newsFolders = Array.from(new Set(effectiveNews.map((item) => item.folder?.trim() || 'Geral'))).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
  const publishedCount = effectiveNews.filter(n => n.published).length;
  const draftCount = effectiveNews.filter(n => !n.published && !n.rejected).length;

  // Keep dashboard shortcuts and drafts working while switching sections.
  useImperativeHandle(ref, () => ({ newNews: handleNewNews }));

  return (
        <div className="space-y-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">Pasta, destaque e urgência estão indisponíveis: não possuem persistência no contrato oficial da API.</p>
          {loadingNews && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3" role="status">
              <Loader2 className="h-6 w-6 animate-spin text-[#004A99] dark:text-sky-400" />
              <span className="text-xs font-medium">Carregando notícias da API oficial...</span>
            </div>
          )}
          {errorNews && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorNews}</span>
            </div>
          )}
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
                <span>Todas as Notícias ({effectiveNews.length})</span>
              </button>

              <button
                type="button"
                disabled={!canCreate}
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

            {newsViewMode === 'lista' && canCreate ? (
              <button
                type="button"
                disabled={!canCreate || loadingNews || !!errorNews}
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
                  setNewsCoverFile(null);
                  setNewsCoverUrl('');
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
          {newsViewMode === 'editor' && !loadingNews && !errorNews && (editingNews ? canEdit : canCreate) && (
          <div key="news-editor-view" className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
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
                  setNewsCoverFile(null);
                  setNewsCoverUrl('');
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

            {editingNews?.rejected && (
              <section aria-label="Motivo da reprovação" className="mb-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-amber-950 dark:text-amber-100">
                <h3 className="text-sm font-bold">Motivo da reprovação</h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                  {editingNews.rejectionReason?.trim() ? editingNews.rejectionReason : 'Motivo de reprovação não informado pela API.'}
                </p>
              </section>
            )}

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
                        Categoria *
                      </label>
                      <select
                        value={selectedNewsCategoriaId || apiNewsCategories[0]?.id || ''}
                        onChange={e => {
                          const id = Number(e.target.value);
                          setSelectedNewsCategoriaId(id);
                          const cat = apiNewsCategories.find(c => c.id === id);
                          if (cat) setNewsForm(prev => ({ ...prev, category: cat.nome }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99]"
                      >
                        {apiNewsCategories.length > 0 ? (
                          apiNewsCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nome}
                            </option>
                          ))
                        ) : (
                          <option value="">Nenhuma categoria oficial disponível</option>
                        )}
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
                        disabled
                        title="Sem persistência no contrato Rails; agrupamento da lista usa a categoria."
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
                        Fluxo Editorial do Backend
                      </label>
                      <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {editingNews
                          ? 'Ao salvar edições, a situação é reavaliada pelo backend.'
                          : 'Novas notícias entram em "Aguardando aprovação" até publicação.'}
                      </div>
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
                        1. Fazer upload do computador (multipart):
                      </span>
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#060D1A] border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#004A99] rounded-xl cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#004A99] transition">
                        <Upload size={16} />
                        <span className="truncate max-w-[200px]">
                          {newsCoverFile ? newsCoverFile.name : 'Escolher foto do PC'}
                        </span>
                        <input
                          type="file"
                          name="imagem_capa"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewsCoverFile(file);
                              setNewsCoverUrl('');
                              setNewsForm(prev => ({ ...prev, coverImage: URL.createObjectURL(file) }));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                        2. Ou informar um novo link de imagem:
                      </span>
                      <input
                        type="url"
                        name="imagem_capa_url"
                        aria-label="Nova URL da capa"
                        value={newsCoverUrl}
                        disabled={!!newsCoverFile}
                        onChange={e => {
                          setNewsCoverFile(null);
                          setNewsCoverUrl(e.target.value);
                          setNewsForm({ ...newsForm, coverImage: e.target.value.trim() || editingNews?.coverImage || '' });
                        }}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs text-slate-900 dark:text-slate-100 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {editingNews && <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sem um novo arquivo ou link, a capa atual será mantida. Este formulário não remove a capa existente.
                  </p>}

                  {newsForm.coverImage && (
                    <div className="pt-2 flex items-center gap-3">
                      <img
                        src={newsForm.coverImage}
                        alt="Preview"
                        className="w-20 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                      <span className="text-xs text-[#004A99] dark:text-sky-400 font-medium truncate max-w-sm">
                        Foto selecionada: {newsCoverFile ? newsCoverFile.name : newsForm.coverImage}
                      </span>
                      {newsCoverFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewsCoverFile(null);
                            setNewsCoverUrl('');
                            setNewsForm(prev => ({ ...prev, coverImage: editingNews?.coverImage || '' }));
                          }}
                          className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                        >
                          Remover arquivo
                        </button>
                      )}
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
                        disabled
                        readOnly
                        value={userSession.name || 'Usuário Autenticado'}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Definido automaticamente pela API a partir da conta logada.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Data de Publicação
                      </label>
                      <input
                        type="date"
                        value={newsForm.publishedAt}
                        onChange={e => setNewsForm({ ...newsForm, publishedAt: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        disabled
                        title="Sem persistência no contrato Rails"
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
                        disabled
                        title="Sem persistência no contrato Rails"
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
                      disabled={saving || loadingNews || !!errorNews || (editingNews ? !canEdit : !canCreate)}
                      className="px-6 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Save size={16} />
                      <span>{editingNews ? 'Salvar Edição da Notícia' : 'Enviar para Aprovação'}</span>
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
          {newsViewMode === 'lista' && !loadingNews && !errorNews && (
          <div key="news-list-view" className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Notícias por pasta ({effectiveNews.length})
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
                Todas ({effectiveNews.length})
              </button>
              {newsFolders.map((folder) => {
                const total = effectiveNews.filter((item) => (item.folder || 'Geral') === folder).length;
                const live = effectiveNews.filter(
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

            {effectiveNews.length === 0 ? (
              <div className="py-14 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 dark:bg-[#071324]/50">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Newspaper className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Nenhuma notícia cadastrada no momento.
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    As matérias e reportagens publicadas ou enviadas para aprovação aparecerão listadas aqui.
                  </p>
                </div>
                {canCreate && <button
                  type="button"
                  disabled={!canCreate || loadingNews || !!errorNews}
                onClick={handleNewNews}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar Primeira Notícia</span>
                </button>}
              </div>
            ) : (
              <div className="space-y-6">
                {newsFolders
                  .filter((folder) => newsFolder === 'Todas' || folder === newsFolder)
                  .map((folder) => {
                    const items = effectiveNews.filter((item) => (item.folder || 'Geral') === folder);
                    if (items.length === 0) return null;
                    const live = items.filter((item) => item.published !== false).length;
                    return (
                      <section key={folder}>
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">{folder}</h4>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {`${live} ${live === 1 ? 'publicada' : 'publicadas'} · ${items.length - live} ${items.length - live === 1 ? 'rascunho' : 'rascunhos'}`}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                          {items.map((item, idx) => (
                            <div key={item.id ? `news-row-${item.id}` : `news-row-idx-${idx}`} className="py-4 px-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                      item.rejected
                                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                        : item.published === false
                                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    }`}>
                                      {item.rejected
                                        ? 'Recusada'
                                        : item.published === false
                                          ? 'Aguardando aprovação'
                                          : 'Publicada'}
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
                                  disabled={item.published ? !canUnpublish : !canPublish}
                                  title={(item.published ? !canUnpublish : !canPublish) ? 'Esta ação exige permissão específica na API.' : undefined}
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
                                  disabled={!canEdit}
                                  onClick={() => handleEditNews(item)}
                                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-600 dark:text-slate-300 hover:text-primary transition cursor-pointer"
                                  title="Editar notícia"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  type="button"
                                  disabled={!canDelete}
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
            )}
          </div>
          )}
        </div>
  );
}
