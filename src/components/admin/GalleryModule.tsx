'use client';

import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Layers,
  Upload,
  Save,
  Eye,
  Edit3,
  Trash2,
  Loader2,
  Filter,
  AlertCircle,
} from 'lucide-react';
import {
  medtecApi,
  FotoGaleria,
  CategoriaGaleria,
  getMediaUrl,
} from '@/lib/api';
import FileButton from './FileButton';
import AdminLiveSimulator, { PreviewGalleryData } from '@/components/AdminLiveSimulator';

export interface GalleryModuleProps {
  apiFotos: FotoGaleria[];
  setApiFotos: React.Dispatch<React.SetStateAction<FotoGaleria[]>>;
  apiCategorias: CategoriaGaleria[];
  setApiCategorias: React.Dispatch<React.SetStateAction<CategoriaGaleria[]>>;
  loadingFotos?: boolean;
  errorFotos?: string | null;
  onReload?: () => Promise<void>;
  onPreview: (data: PreviewGalleryData) => void;
}

interface GalleryFormState {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  categoria_galeria_id?: number;
  date: string;
}

export default function GalleryModule({
  apiFotos,
  setApiFotos,
  apiCategorias,
  setApiCategorias,
  loadingFotos = false,
  errorFotos = null,
  onPreview,
  onReload,
}: GalleryModuleProps) {
  // Modos de visualização internos da Galeria
  const [galleryViewMode, setGalleryViewMode] = useState<'lista' | 'editor'>('lista');
  const [categoriaSelection, setSelectedCategoriaId] = useState<number | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  // Filtro por categoria na listagem
  const [filterCategoriaId, setFilterCategoriaId] = useState<number | 'all'>('all');

  // Formulário de Foto
  const [galleryForm, setGalleryForm] = useState<GalleryFormState>({
    title: '',
    description: '',
    imageUrl: '',
    category: 'Salas de Aula',
    date: 'Outubro 2026',
  });

  // Gerenciador de Categorias
  const [showCategoriaManager, setShowCategoriaManager] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaGaleria | null>(null);
  const [savingCategoria, setSavingCategoria] = useState(false);
  const [categoriaForm, setCategoriaForm] = useState({
    nome: '',
    slug: '',
    posicao: 0,
    ativo: true,
  });

  // Na edição, permite manter a opção original inativa que ainda existe na API.
  const originalCategoriaId = apiFotos.find(item => item.id === editingPhotoId)?.categoria_galeria_id;
  const categoriaOptions = apiCategorias.filter(item => Number.isSafeInteger(item.id) && item.id > 0 &&
    (item.ativo === true || (Boolean(editingPhotoId) && item.id === originalCategoriaId)));
  const selectedCategoriaId = categoriaOptions.find(item => item.id === categoriaSelection)?.id ??
    categoriaOptions.find(item => item.ativo === true)?.id ?? categoriaOptions[0]?.id ?? null;
  const selectionBlocked = loadingFotos || Boolean(errorFotos) || selectedCategoriaId === null;

  // Handlers de Abertura / Reset
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
    setSelectedCategoriaId(null);
    setGalleryViewMode('editor');
  };

  const handleEditPhoto = (foto: FotoGaleria) => {
    const numId = Number(foto.id);
    setEditingPhotoId(isNaN(numId) ? null : numId);
    setGalleryFile(null);
    const displayImg = foto.imagem
      ? getMediaUrl(foto.imagem)
      : foto.imagem_url || '';

    setGalleryForm({
      title: foto.titulo,
      description: foto.descricao || '',
      imageUrl: displayImg,
      category: foto.categoria_galeria?.nome || 'Salas de Aula',
      categoria_galeria_id: foto.categoria_galeria_id,
      date: 'Outubro 2026',
    });

    setSelectedCategoriaId(foto.categoria_galeria_id ?? null);
    setGalleryViewMode('editor');
  };

  // Salvar Foto (Upload multipart ou JSON imagem_url)
  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingPhoto) return;
    if (selectionBlocked || selectedCategoriaId === null) {
      alert('Carregue e selecione uma categoria válida antes de salvar.');
      return;
    }
    if (!galleryForm.title?.trim()) {
      alert('Informe o título da foto.');
      return;
    }
    if (!galleryFile && !galleryForm.imageUrl?.trim()) {
      alert('Selecione um arquivo de foto do computador ou informe um link externo direto.');
      return;
    }

    setSavingPhoto(true);
    try {
      const catId = selectedCategoriaId;

      let savedFoto: FotoGaleria | null = null;
      try {
        if (galleryFile) {
          // Formato 1: Upload multipart/form-data
          const form = new FormData();
          form.append('foto_galeria[titulo]', galleryForm.title.trim());
          form.append('foto_galeria[categoria_galeria_id]', String(catId));
          form.append('foto_galeria[descricao]', galleryForm.description?.trim() || '');
          form.append('foto_galeria[imagem]', galleryFile);

          if (editingPhotoId) {
            savedFoto = await medtecApi.fotosGaleria.update(editingPhotoId, form);
          } else {
            savedFoto = await medtecApi.fotosGaleria.create(form);
          }
        } else if (galleryForm.imageUrl) {
          // Formato 2: Imagem por URL externa (JSON)
          const payload = {
            foto_galeria: {
              titulo: galleryForm.title.trim(),
              categoria_galeria_id: catId,
              descricao: galleryForm.description?.trim() || '',
              imagem_url: galleryForm.imageUrl.trim(),
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
        alert(`Erro na API oficial: ${err.message || err.errors?.join(', ') || 'Falha ao salvar foto'}`);
        return; // Interrompe imediatamente; não prossegue com falso sucesso
      }

      if (savedFoto) {
        setApiFotos(prev =>
          editingPhotoId
            ? prev.map(f => (f.id === savedFoto!.id ? savedFoto! : f))
            : [savedFoto!, ...prev]
        );
        alert(
          editingPhotoId
            ? 'Foto atualizada com sucesso na API oficial!'
            : 'Foto cadastrada com sucesso na API oficial!'
        );
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
      setSavingPhoto(false);
    }
  };

  // Excluir Foto
  const handleDeletePhoto = async (id: number) => {
    if (!confirm('Deseja excluir esta foto da galeria?')) return;

    try {
      await medtecApi.fotosGaleria.delete(id);
      setApiFotos(prev => prev.filter(f => f.id !== id));
      alert('Foto excluída com sucesso da API oficial.');
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Erro ao excluir foto na API oficial: ${errorData.message || errorData.errors?.join(', ') || 'Falha'}`);
    }
  };

  // CRUD Categorias da Galeria
  const handleSaveCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaForm.nome.trim() || !categoriaForm.slug.trim()) {
      alert('Informe o nome e o slug da categoria.');
      return;
    }
    setSavingCategoria(true);
    try {
      if (editingCategoria) {
        const updated = await medtecApi.categoriasGaleria.update(editingCategoria.id, categoriaForm);
        setApiCategorias(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      } else {
        const created = await medtecApi.categoriasGaleria.create(categoriaForm);
        setApiCategorias(prev => [...prev, created]);
      }
      setEditingCategoria(null);
      setCategoriaForm({ nome: '', slug: '', posicao: 0, ativo: true });
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Erro ao salvar Categoria: ${errorData.message || errorData.errors?.join(', ') || 'Erro'}`);
    } finally {
      setSavingCategoria(false);
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

  const displayFotosCount = apiFotos.length;
  const selectedCatObj = categoriaOptions.find(c => c.id === selectedCategoriaId);

  // Fotos filtradas para a exibição na lista
  const filteredFotos = apiFotos.filter(photo => {
    if (filterCategoriaId === 'all') return true;
    return photo.categoria_galeria_id === filterCategoriaId;
  });

  return (
    <div className="space-y-6">
      {/* Alerta de Erro de Conexão com a API se houver */}
      {errorFotos && (
        <div role="alert" className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{errorFotos}</span>
          {onReload && <button type="button" disabled={loadingFotos} onClick={() => void onReload()}
            className="ml-auto underline font-bold cursor-pointer disabled:opacity-50">Tentar novamente</button>}
        </div>
      )}

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
          <form
            onSubmit={handleSaveCategoria}
            className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3"
          >
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
                    const autoSlug = val
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '_')
                      .replace(/(^_|_$)/g, '');
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
                  disabled={savingCategoria}
                  className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer flex-1 flex items-center justify-center gap-1.5"
                >
                  {savingCategoria ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>{editingCategoria ? 'Atualizar' : 'Salvar Categoria'}</span>
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
            {apiCategorias.map(cat => (
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

            <form aria-label="Formulário de foto" onSubmit={handleSavePhoto} className="space-y-5">
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
                      name="titulo"
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
                      aria-label="Categoria da galeria"
                      name="categoria_galeria_id"
                      disabled={loadingFotos || Boolean(errorFotos) || savingPhoto}
                      value={selectedCategoriaId ?? ''}
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
                      {categoriaOptions.length === 0 ? (
                        <option value="">Nenhuma categoria disponível</option>
                      ) : (
                        categoriaOptions.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.nome} ({item.slug}){item.ativo ? '' : ' — inativa (atual)'}
                          </option>
                        ))
                      )}
                    </select>
                    {!loadingFotos && !errorFotos && categoriaOptions.length === 0 &&
                      <p role="status" className="mt-2 text-xs text-amber-700 dark:text-amber-300">Cadastre ou ative uma categoria para continuar.</p>}
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
                    <FileButton
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setGalleryFile(file);
                          setGalleryForm(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
                        }
                      }}
                    >
                      <Upload size={16} />
                      <span className="break-all">{galleryFile ? `Arquivo: ${galleryFile.name}` : 'Selecionar Imagem do Computador'}</span>
                    </FileButton>
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
                      name="imagem_url"
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
                  disabled={savingPhoto || selectionBlocked}
                  className="px-6 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  {savingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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
              onOpenFullscreen={() =>
                onPreview({
                  title: galleryForm.title || 'Título da Fotografia no Acervo',
                  description: galleryForm.description || 'Breve contextualização da imagem da sala de aula ou comunidade atendida.',
                  category: selectedCatObj?.nome || galleryForm.category || 'Salas de Aula',
                  imageUrl: galleryForm.imageUrl,
                  date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                })
              }
            />
          </div>
        </div>
      )}

      {/* Grid de Fotos Existentes */}
      {galleryViewMode === 'lista' && (
        <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Fotos no Acervo da Galeria ({displayFotosCount})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Fotografias e registros oficiais catalogados na API Rails v1.
              </p>
            </div>

            {/* Filtro por Categoria */}
            {apiCategorias.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400 shrink-0" />
                <select
                  value={filterCategoriaId}
                  onChange={e => setFilterCategoriaId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#004A99]"
                >
                  <option value="all">Todas as Categorias ({apiFotos.length})</option>
                  {apiCategorias.map(cat => {
                    const countInCat = apiFotos.filter(f => f.categoria_galeria_id === cat.id).length;
                    return (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome} ({countInCat})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {loadingFotos ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#004A99]" />
              <span>Carregando fotografias do acervo...</span>
            </div>
          ) : errorFotos ? (
            <p className="p-8 text-center text-sm text-slate-500">Listagem indisponível. Tente carregar novamente.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFotos.length === 0 ? (
                <div className="col-span-full p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                  {filterCategoriaId === 'all'
                    ? 'Nenhuma foto cadastrada no acervo oficial da API.'
                    : 'Nenhuma foto cadastrada nesta categoria.'}
                </div>
              ) : (
                filteredFotos.map(photo => {
                  const photoTitle = photo.titulo;
                  const photoDesc = photo.descricao || '';
                  const photoCat = photo.categoria_galeria?.nome || 'Galeria';
                  const photoImg = photo.imagem
                    ? getMediaUrl(photo.imagem)
                    : photo.imagem_url || '';
                  const photoDate = new Date(photo.created_at).toLocaleDateString('pt-BR');

                  return (
                    <div
                      key={photo.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-[#060D1A] flex flex-col justify-between group"
                    >
                      <div className="relative h-40 bg-slate-200 dark:bg-slate-900">
                        {photoImg ? (
                          <img
                            src={photoImg}
                            alt={photoTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            Sem imagem
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                          {photoCat}
                        </span>
                      </div>

                      <div className="p-3">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {photoTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {photoDesc}
                        </p>

                        <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">{photoDate}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                onPreview({
                                  title: photoTitle,
                                  description: photoDesc,
                                  category: photoCat,
                                  imageUrl: photoImg,
                                  date: photoDate,
                                })
                              }
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
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
