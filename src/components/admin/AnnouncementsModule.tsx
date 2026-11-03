'use client';

import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Palette,
  Save,
  Eye,
  Edit3,
  Trash2,
  Loader2,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { medtecApi, AAviso, ATipoAviso } from '@/lib/api';
import { usePermissoes } from '@/components/admin/usePermissoes';
import { AnnouncementItem, AnnouncementType } from '@/types';
import AdminLiveSimulator, { PreviewAnnouncementData } from '@/components/AdminLiveSimulator';

export interface AnnouncementsModuleProps {
  apiAvisos: AAviso[];
  setApiAvisos: React.Dispatch<React.SetStateAction<AAviso[]>>;
  apiTiposAviso: ATipoAviso[];
  setApiTiposAviso: React.Dispatch<React.SetStateAction<ATipoAviso[]>>;
  loadingAvisos?: boolean;
  errorAvisos?: string | null;
  initialMode?: 'lista' | 'editor';
  onReload?: () => Promise<void>;
  onPreview: (data: PreviewAnnouncementData) => void;
}

export default function AnnouncementsModule({
  apiAvisos,
  setApiAvisos,
  apiTiposAviso,
  setApiTiposAviso,
  loadingAvisos = false,
  errorAvisos = null,
  initialMode = 'lista',
  onPreview,
  onReload,
}: AnnouncementsModuleProps) {
  // Modos de visualização interna
  const [announcementViewMode, setAnnouncementViewMode] = useState<'lista' | 'editor'>(initialMode);
  const { pode } = usePermissoes();
  const [tipoAvisoSelection, setSelectedTipoAvisoId] = useState<number | null>(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Filtro por tipo de aviso na listagem
  const [filterTipoAvisoId, setFilterTipoAvisoId] = useState<number | 'all'>('all');

  // Formulário de Aviso
  const [announcementForm, setAnnouncementForm] = useState<Partial<AnnouncementItem>>({
    title: '',
    content: '',
    type: 'aviso',
    date: new Date().toLocaleDateString('pt-BR'),
    linkText: '',
    linkUrl: '',
    active: true,
  });

  // Gerenciador de Tipos de Aviso
  const [showTipoAvisoManager, setShowTipoAvisoManager] = useState(false);
  const [editingTipoAviso, setEditingTipoAviso] = useState<ATipoAviso | null>(null);
  const [savingTipoAviso, setSavingTipoAviso] = useState(false);
  const [tipoAvisoForm, setTipoAvisoForm] = useState({
    nome: '',
    slug: '',
    cor: '#004A99',
    posicao: 0,
    ativo: true,
  });

  // Na edição, permite manter a opção original inativa que ainda existe na API.
  const originalTipoAvisoId = apiAvisos.find(item => item.id === editingAnnouncementId)?.a_tipo_aviso_id;
  const tipoAvisoOptions = apiTiposAviso.filter(item => Number.isSafeInteger(item.id) && item.id > 0 &&
    (item.ativo === true || (Boolean(editingAnnouncementId) && item.id === originalTipoAvisoId)));
  const selectedTipoAvisoId = tipoAvisoOptions.find(item => item.id === tipoAvisoSelection)?.id ??
    tipoAvisoOptions.find(item => item.ativo === true)?.id ?? tipoAvisoOptions[0]?.id ?? null;
  const selectionBlocked = loadingAvisos || Boolean(errorAvisos) || selectedTipoAvisoId === null;

  // Handlers de Inicialização / Edição
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
    setSelectedTipoAvisoId(null);
    setAnnouncementViewMode('editor');
  };

  const handleEditAnnouncement = (aviso: AAviso | AnnouncementItem) => {
    const isApi = 'a_tipo_aviso_id' in aviso;
    const numId = Number(aviso.id);
    setEditingAnnouncementId(isNaN(numId) ? null : numId);
    setAnnouncementForm({
      title: 'titulo' in aviso ? aviso.titulo : aviso.title,
      content: 'conteudo' in aviso ? aviso.conteudo : aviso.content,
      type: isApi && aviso.a_tipo_aviso
        ? (aviso.a_tipo_aviso.slug as AnnouncementType)
        : (aviso as AnnouncementItem).type || 'aviso',
      date: 'created_at' in aviso
        ? new Date(aviso.created_at).toLocaleDateString('pt-BR')
        : (aviso as AnnouncementItem).date || new Date().toLocaleDateString('pt-BR'),
      linkText: 'link_texto' in aviso ? (aviso.link_texto || '') : ((aviso as AnnouncementItem).linkText || ''),
      linkUrl: 'link_url' in aviso ? (aviso.link_url || '') : ((aviso as AnnouncementItem).linkUrl || ''),
      active: 'ativo' in aviso ? aviso.ativo !== false : (aviso as AnnouncementItem).active !== false,
    });
    setSelectedTipoAvisoId(isApi ? aviso.a_tipo_aviso_id ?? null : null);
    setAnnouncementViewMode('editor');
  };

  // Salvar Comunicado (API v1)
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingAnnouncement) return;
    if (selectionBlocked || selectedTipoAvisoId === null) {
      alert('Carregue e selecione um tipo de aviso válido antes de salvar.');
      return;
    }
    if (!announcementForm.title?.trim() || !announcementForm.content?.trim()) {
      alert('Informe o título e o conteúdo do comunicado.');
      return;
    }

    setSavingAnnouncement(true);
    try {
      const tipoId = selectedTipoAvisoId;

      let savedAviso: AAviso | null = null;
      try {
        if (editingAnnouncementId) {
          savedAviso = await medtecApi.avisos.update(editingAnnouncementId, {
            titulo: announcementForm.title.trim(),
            a_tipo_aviso_id: tipoId,
            conteudo: announcementForm.content.trim(),
            link_texto: announcementForm.linkText?.trim() || '',
            link_url: announcementForm.linkUrl?.trim() || '',
            ativo: announcementForm.active ?? true,
          });
        } else {
          savedAviso = await medtecApi.avisos.create({
            titulo: announcementForm.title.trim(),
            a_tipo_aviso_id: tipoId,
            conteudo: announcementForm.content.trim(),
            link_texto: announcementForm.linkText?.trim() || '',
            link_url: announcementForm.linkUrl?.trim() || '',
            ativo: announcementForm.active ?? true,
          });
        }
      } catch (apiErr: unknown) {
        const err = apiErr as { message?: string; errors?: string[] };
        console.warn('Erro ao salvar aviso na API v1:', err);
        alert(`Erro na API oficial: ${err.message || err.errors?.join(', ') || 'Falha ao salvar comunicado'}`);
        return; // Interrompe imediatamente; não prossegue com falso sucesso
      }

      if (savedAviso) {
        setApiAvisos(prev =>
          editingAnnouncementId
            ? prev.map(a => (a.id === savedAviso!.id ? savedAviso! : a))
            : [savedAviso!, ...prev]
        );
        alert(
          editingAnnouncementId
            ? 'Comunicado atualizado com sucesso na API oficial!'
            : 'Comunicado cadastrado com sucesso na API oficial!'
        );
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
      setSavingAnnouncement(false);
    }
  };

  // Excluir Comunicado (API v1)
  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Deseja realmente excluir este comunicado oficial?')) return;

    try {
      await medtecApi.avisos.delete(id);
      setApiAvisos(prev => prev.filter(a => a.id !== id));
      alert('Comunicado oficial excluído com sucesso da API.');
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Erro ao excluir na API oficial: ${errorData.message || errorData.errors?.join(', ') || 'Falha na exclusão'}`);
    }
  };

  // Alternar Visibilidade do Comunicado (Ativo/Inativo)
  const handleToggleAnnouncementActive = async (id: number) => {
    const existingApi = apiAvisos.find(a => a.id === id);
    const currentActive = existingApi ? existingApi.ativo : true;
    const newActive = !currentActive;

    try {
      await medtecApi.avisos.update(id, { ativo: newActive });
      setApiAvisos(prev => prev.map(a => (a.id === id ? { ...a, ativo: newActive } : a)));
    } catch (err: unknown) {
      const errorData = err as { message?: string };
      console.warn('Erro ao atualizar ativo na API v1:', err);
      alert(`Erro ao atualizar visibilidade na API: ${errorData?.message || 'Falha'}`);
    }
  };

  // CRUD Tipos de Aviso
  const handleSaveTipoAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoAvisoForm.nome.trim() || !tipoAvisoForm.slug.trim()) {
      alert('Informe o nome e o slug do tipo de aviso.');
      return;
    }
    setSavingTipoAviso(true);
    try {
      if (editingTipoAviso) {
        const updated = await medtecApi.tiposAviso.update(editingTipoAviso.id, tipoAvisoForm);
        setApiTiposAviso(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      } else {
        const created = await medtecApi.tiposAviso.create(tipoAvisoForm);
        setApiTiposAviso(prev => [...prev, created]);
      }
      setEditingTipoAviso(null);
      setTipoAvisoForm({ nome: '', slug: '', cor: '#004A99', posicao: 0, ativo: true });
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(`Erro ao salvar Tipo de Aviso: ${errorData.message || errorData.errors?.join(', ') || 'Erro'}`);
    } finally {
      setSavingTipoAviso(false);
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

  const activeTipo = tipoAvisoOptions.find(t => t.id === selectedTipoAvisoId);
  const displayAvisosCount = apiAvisos.length;

  // Filtragem dos avisos para exibição na lista
  const filteredAvisos = apiAvisos.filter(item => {
    if (filterTipoAvisoId === 'all') return true;
    return item.a_tipo_aviso_id === filterTipoAvisoId;
  });

  return (
    <div className="space-y-6">
      {/* Alerta de erro de conexão com a API se houver */}
      {errorAvisos && (
        <div role="alert" className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{errorAvisos}</span>
          {onReload && <button type="button" disabled={loadingAvisos} onClick={() => void onReload()}
            className="ml-auto underline font-bold cursor-pointer disabled:opacity-50">Tentar novamente</button>}
        </div>
      )}

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

          {pode('a_avisos', 'create') && <button
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
          </button>}

          {(pode('a_tipos_aviso', 'create') || pode('a_tipos_aviso', 'update')) && <button
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
          </button>}
        </div>

        {announcementViewMode === 'lista' && !showTipoAvisoManager && pode('a_avisos', 'create') && (
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
          <form
            onSubmit={handleSaveTipoAviso}
            className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-4"
          >
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
                    const autoSlug = val
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '_')
                      .replace(/(^_|_$)/g, '');
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
                  disabled={savingTipoAviso}
                  className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer flex-1 flex items-center justify-center gap-1.5"
                >
                  {savingTipoAviso ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>{editingTipoAviso ? 'Atualizar' : 'Salvar Tipo'}</span>
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
            {apiTiposAviso.map(tipo => (
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
                  {pode('a_tipos_aviso', 'update') && <button
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
                  </button>}
                  {pode('a_tipos_aviso', 'destroy') && <button
                    type="button"
                    onClick={() => handleDeleteTipoAviso(tipo.id)}
                    className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600"
                    title="Excluir tipo"
                  >
                    <Trash2 size={13} />
                  </button>}
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
              <form aria-label="Formulário de aviso" onSubmit={handleSaveAnnouncement} className="space-y-5">
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
                        name="titulo"
                        value={announcementForm.title || ''}
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
                          aria-label="Tipo de aviso"
                          name="a_tipo_aviso_id"
                          disabled={loadingAvisos || Boolean(errorAvisos) || savingAnnouncement}
                          value={selectedTipoAvisoId ?? ''}
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
                          {tipoAvisoOptions.length === 0 ? (
                            <option value="">Nenhum tipo de aviso disponível</option>
                          ) : (
                            tipoAvisoOptions.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.nome} ({item.slug}){item.ativo ? '' : ' — inativo (atual)'}
                              </option>
                            ))
                          )}
                        </select>
                        {!loadingAvisos && !errorAvisos && tipoAvisoOptions.length === 0 &&
                          <p role="status" className="mt-2 text-xs text-amber-700 dark:text-amber-300">Cadastre ou ative um tipo de aviso para continuar.</p>}
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
                      name="conteudo"
                      value={announcementForm.content || ''}
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
                        value={announcementForm.linkText || ''}
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
                        value={announcementForm.linkUrl || ''}
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
                    disabled={savingAnnouncement || selectionBlocked}
                    className="px-6 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    {savingAnnouncement ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{editingAnnouncementId ? 'Salvar Alterações' : 'Cadastrar Aviso Oficial'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Simulador ao Vivo Fiel */}
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
                onOpenFullscreen={() =>
                  onPreview({
                    title: announcementForm.title || '',
                    content: announcementForm.content || '',
                    type: announcementForm.type || 'aviso',
                    date: new Date().toLocaleDateString('pt-BR'),
                    linkText: announcementForm.linkText || '',
                    linkUrl: announcementForm.linkUrl || '',
                    active: announcementForm.active ?? true,
                    cor: activeTipo?.cor,
                    typeName: activeTipo?.nome,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Lista de Avisos */}
      {announcementViewMode === 'lista' && (
        <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Avisos Atuais ({displayAvisosCount})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comunicados oficiais sincronizados diretamente com a API Rails v1.
              </p>
            </div>

            {/* Filtro por Tipo de Aviso */}
            {apiTiposAviso.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400 shrink-0" />
                <select
                  value={filterTipoAvisoId}
                  onChange={e =>
                    setFilterTipoAvisoId(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#004A99]"
                >
                  <option value="all">Todos os Tipos ({apiAvisos.length})</option>
                  {apiTiposAviso.map(tipo => {
                    const countInTipo = apiAvisos.filter(a => a.a_tipo_aviso_id === tipo.id).length;
                    return (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome} ({countInTipo})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {loadingAvisos ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#004A99]" />
              <span>Carregando comunicados oficiais...</span>
            </div>
          ) : errorAvisos ? (
            <p className="p-8 text-center text-sm text-slate-500">Listagem indisponível. Tente carregar novamente.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAvisos.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                  {filterTipoAvisoId === 'all'
                    ? 'Nenhum aviso cadastrado na base oficial da API.'
                    : 'Nenhum aviso cadastrado para este tipo.'}
                </div>
              ) : (
                filteredAvisos.map(item => {
                  const itemTitle = item.titulo;
                  const itemContent = item.conteudo;
                  const itemDate = new Date(item.created_at).toLocaleDateString('pt-BR');
                  const itemActive = item.ativo !== false;
                  const itemColor = item.a_tipo_aviso?.cor;
                  const itemTypeName = item.a_tipo_aviso?.nome || 'Aviso';

                  return (
                    <div
                      key={item.id}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            style={
                              itemColor
                                ? {
                                    backgroundColor: `${itemColor}20`,
                                    color: itemColor,
                                    borderColor: `${itemColor}50`,
                                  }
                                : undefined
                            }
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
                          >
                            {itemTypeName}
                          </span>
                          <span className="text-xs text-slate-400">{itemDate}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              itemActive
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {itemActive ? 'Ativo na Home' : 'Oculto'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{itemTitle}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">{itemContent}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onPreview({
                              title: itemTitle,
                              content: itemContent,
                              date: itemDate,
                              cor: itemColor,
                              typeName: itemTypeName,
                              active: itemActive,
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-[#004A99] dark:text-[#00D8FF] text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-sky-200 dark:border-sky-800/60"
                          title="Ver prévia deste aviso no mural oficial"
                        >
                          <Eye size={13} />
                          <span className="hidden md:inline">Ver Prévia</span>
                        </button>
                        {pode('a_avisos', 'update') && <button
                          type="button"
                          onClick={() => handleEditAnnouncement(item)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>}
                        {pode('a_avisos', 'update') && <button
                          type="button"
                          onClick={() => handleToggleAnnouncementActive(item.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        >
                          {itemActive ? 'Ocultar' : 'Exibir'}
                        </button>}
                        {pode('a_avisos', 'destroy') && <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(item.id)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>}
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
