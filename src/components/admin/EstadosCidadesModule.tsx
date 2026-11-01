'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Loader2,
  Edit3,
  Trash2,
  Search,
  X,
  Save,
} from 'lucide-react';
import { medtecApi, Estado, Cidade } from '@/lib/api';

export interface EstadosCidadesModuleProps {
  apiEstados: Estado[];
  setApiEstados: React.Dispatch<React.SetStateAction<Estado[]>>;
  loadingEstados: boolean;
}

export default function EstadosCidadesModule({
  apiEstados,
  setApiEstados,
  loadingEstados,
}: EstadosCidadesModuleProps) {
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(
    () => apiEstados[0]?.id ?? null
  );
  const [apiCidades, setApiCidades] = useState<Cidade[]>([]);
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

  const effectiveEstadoId =
    selectedEstadoId && apiEstados.some(est => est.id === selectedEstadoId)
      ? selectedEstadoId
      : (apiEstados[0]?.id ?? null);

  // Carrega cidades do estado selecionado
  useEffect(() => {
    if (!effectiveEstadoId) return;
    let isMounted = true;
    const fetchCidades = async () => {
      setLoadingCidades(true);
      try {
        const res = await medtecApi.cidades.list({
          'q[g_estado_id_eq]': effectiveEstadoId,
          page: 'all',
        });
        if (isMounted && res.success && res.data?.items) {
          setApiCidades(res.data.items);
        }
      } catch (err) {
        console.warn('API v1: Erro ao carregar cidades:', err);
      } finally {
        if (isMounted) setLoadingCidades(false);
      }
    };
    void fetchCidades();
    return () => {
      isMounted = false;
    };
  }, [effectiveEstadoId]);

  // Handlers de Estado
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
        setApiEstados(prev => prev.map(est => (est.id === updated.id ? updated : est)));
      } else {
        const created = await medtecApi.estados.create({
          nome: estadoForm.nome,
          sigla_uf: estadoForm.sigla_uf.toUpperCase(),
          codigo_ibge: estadoForm.codigo_ibge,
        });
        setApiEstados(prev => [...prev, created]);
        if (!effectiveEstadoId) setSelectedEstadoId(created.id);
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
      alert(
        `Não foi possível excluir: ${
          errorData.message || errorData.errors?.join(', ') || 'O estado possui cidades vinculadas'
        }`
      );
    }
  };

  // Handlers de Município
  const handleSaveCidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveEstadoId) {
      alert('Selecione um estado antes de cadastrar uma cidade.');
      return;
    }
    setSavingCidade(true);
    setCidadeError('');
    try {
      if (editingCidade) {
        const updated = await medtecApi.cidades.update(editingCidade.id, {
          g_estado_id: effectiveEstadoId,
          nome: cidadeForm.nome,
          codigo_ibge: cidadeForm.codigo_ibge,
        });
        setApiCidades(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      } else {
        const created = await medtecApi.cidades.create({
          g_estado_id: effectiveEstadoId,
          nome: cidadeForm.nome,
          codigo_ibge: cidadeForm.codigo_ibge,
        });
        setApiCidades(prev => [...prev, created]);
      }
      setShowCidadeModal(false);
      setEditingCidade(null);
      setCidadeForm({ g_estado_id: effectiveEstadoId, nome: '', codigo_ibge: '' });
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

  const selectedEstado = apiEstados.find(e => e.id === effectiveEstadoId);
  const displayCidades = effectiveEstadoId ? apiCidades : [];
  const filteredCidades = displayCidades.filter(
    c =>
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
                const isSelected = est.id === effectiveEstadoId;
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
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
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
                disabled={!effectiveEstadoId}
                onClick={() => {
                  if (!effectiveEstadoId) return;
                  setEditingCidade(null);
                  setCidadeForm({ g_estado_id: effectiveEstadoId, nome: '', codigo_ibge: '' });
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
          ) : !effectiveEstadoId ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Selecione um estado na coluna ao lado para visualizar os municípios.
            </div>
          ) : filteredCidades.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              {cidadeSearch
                ? 'Nenhum município encontrado com este filtro.'
                : 'Nenhum município cadastrado neste estado.'}
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
                    onChange={e =>
                      setEstadoForm({ ...estadoForm, sigla_uf: e.target.value.toUpperCase() })
                    }
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
