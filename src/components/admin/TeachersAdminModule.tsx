'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Presentation,
  Tv,
  School,
  BookOpen,
  MapPin,
  Building2,
  Search,
  Plus,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  ChevronLeft,
  X,
  Quote,
  Info,
} from 'lucide-react';
import CommunityDemoMedia, { CommunityDemoPhoto } from './CommunityDemoMedia';
import { useDialogFocus } from '@/components/useDialogFocus';
import {
  createInitialTeachersList,
  createEmptyTeacherDraft,
  hasTeacherChanges,
  validateTeacherDraft,
  generateTeacherSlug,
  getTeacherInitials,
  DEMO_MUNICIPALITIES,
  TEACHER_FIELD_LIMITS,
  type TeacherDraft,
  type TeacherRole,
  type EditorialStatus,
} from '@/lib/admin-teachers';

export interface TeachersAdminModuleProps {
  initialTeachers?: TeacherDraft[];
}

export default function TeachersAdminModule({ initialTeachers }: TeachersAdminModuleProps) {
  // Estado principal da lista de professores em memória
  const [teachers, setTeachers] = useState<TeacherDraft[]>(() =>
    initialTeachers ? structuredClone(initialTeachers) : createInitialTeachersList()
  );

  // Snapshot inicial para restauração e detecção de alterações
  const [baselineTeachers, setBaselineTeachers] = useState<TeacherDraft[]>(() =>
    initialTeachers ? structuredClone(initialTeachers) : createInitialTeachersList()
  );

  // Professor atualmente selecionado para edição (null = exibindo lista)
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingTeacher = useMemo(() => {
    return teachers.find((t) => t.id === editingId) || null;
  }, [teachers, editingId]);

  const originalTeacher = useMemo(() => {
    return baselineTeachers.find((t) => t.id === editingId) || null;
  }, [baselineTeachers, editingId]);

  // Filtros da listagem
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'todas' | TeacherRole>('todas');
  const [filterCity, setFilterCity] = useState<number | 'todos'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | EditorialStatus>('todos');
  const [filterHome, setFilterHome] = useState<'todos' | 'sim' | 'nao'>('todos');

  // Modal de pré-visualização
  const [previewTeacher, setPreviewTeacher] = useState<TeacherDraft | null>(null);
  const [previewTab, setPreviewTab] = useState<'card_diretorio' | 'gaveta_entrevista' | 'mural_home' | 'metodologia'>('card_diretorio');

  const { dialogRef: previewDialogRef, overlayRef: previewOverlayRef } = useDialogFocus(
    !!previewTeacher,
    () => setPreviewTeacher(null)
  );

  // Feedbacks visuais transitórios
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Filtragem da lista
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (filterRole !== 'todas' && t.funcao !== filterRole) return false;
      if (filterCity !== 'todos' && t.g_cidade_id !== filterCity) return false;
      if (filterStatus !== 'todos' && t.status !== filterStatus) return false;
      if (filterHome === 'sim' && !t.destaque_home) return false;
      if (filterHome === 'nao' && t.destaque_home) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = t.nome.toLowerCase().includes(q);
        const matchesSubject = t.disciplina.toLowerCase().includes(q);
        const matchesSchool = t.escola_nome.toLowerCase().includes(q);
        const matchesCity = t.municipio_nome.toLowerCase().includes(q);
        const matchesCode = t.codigo_exibicao.toLowerCase().includes(q);
        return matchesName || matchesSubject || matchesSchool || matchesCity || matchesCode;
      }

      return true;
    });
  }, [teachers, filterRole, filterCity, filterStatus, filterHome, searchQuery]);

  // Contadores analíticos
  const stats = useMemo(() => {
    return {
      total: teachers.length,
      ministrantes: teachers.filter((t) => t.funcao === 'ministrante').length,
      mediadores: teachers.filter((t) => t.funcao === 'mediador').length,
      destaqueHome: teachers.filter((t) => t.destaque_home).length,
      publicados: teachers.filter((t) => t.status === 'publicado').length,
      emRevisao: teachers.filter((t) => t.status === 'em_revisao').length,
    };
  }, [teachers]);

  // Operações de atualização do professor em edição
  const updateCurrentTeacher = (fields: Partial<TeacherDraft>) => {
    if (!editingId) return;
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === editingId) {
          const updated = { ...t, ...fields };
          // Se o nome foi alterado e o slug não foi customizado manualmente, atualiza o slug
          if (fields.nome && (!t.slug || t.slug === generateTeacherSlug(t.nome))) {
            updated.slug = generateTeacherSlug(fields.nome);
          }
          return updated;
        }
        return t;
      })
    );
  };

  // Restaura o professor em edição aos dados de baseline
  const handleRestoreCurrent = () => {
    if (!originalTeacher || !editingId) return;
    setTeachers((prev) =>
      prev.map((t) => (t.id === editingId ? structuredClone(originalTeacher) : t))
    );
    setFeedback({
      type: 'info',
      message: `Alterações do docente "${originalTeacher.nome}" foram descartadas e os dados originais restaurados.`,
    });
  };

  // Restaura toda a lista ao catálogo inicial
  const handleResetCatalog = () => {
    const fresh = initialTeachers ? structuredClone(initialTeachers) : createInitialTeachersList();
    setTeachers(fresh);
    setBaselineTeachers(structuredClone(fresh));
    setEditingId(null);
    setFeedback({
      type: 'success',
      message: 'Catálogo de professores restaurado aos exemplos fictícios da demonstração.',
    });
  };

  // Cria um novo docente em memória
  const handleCreateNew = () => {
    const maxId = teachers.reduce((max, t) => Math.max(max, t.id), 0);
    const newDocente = createEmptyTeacherDraft(maxId + 1);
    setTeachers((prev) => [newDocente, ...prev]);
    setBaselineTeachers((prev) => [newDocente, ...prev]);
    setEditingId(newDocente.id);
  };

  // Validação do professor atual
  const validation = useMemo(() => {
    if (!editingTeacher) return { isValid: true, errors: {}, summary: [] };
    return validateTeacherDraft(editingTeacher);
  }, [editingTeacher]);

  const isCurrentDirty = useMemo(() => {
    if (!editingTeacher || !originalTeacher) return false;
    return hasTeacherChanges(editingTeacher, originalTeacher);
  }, [editingTeacher, originalTeacher]);

  return (
    <div className="space-y-6 min-w-0 break-words">
      {/* ========================================================
          1. CABEÇALHO DO MÓDULO & AVISO INSTITUCIONAL DE STATUS
      ======================================================== */}
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#004A99] dark:text-[#38BDF8] border border-sky-200 dark:border-sky-800/50">
                <Presentation className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                  <span>Professores e Mediadores</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                    Aguardando integração oficial
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gerenciamento editorial do corpo docente: professores ministrantes no estúdio SEDUC e mediadores presenciais nas salas de aula de Rondônia.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {editingTeacher ? (
              <button
                type="button"
                aria-label="Voltar à Listagem"
                onClick={() => setEditingId(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar à Listagem</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  aria-label="Restaurar demonstração"
                  onClick={handleResetCatalog}
                  title="Restaurar lista para os valores de referência"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar demonstração</span>
                </button>
                <button
                  type="button"
                  aria-label="Novo Docente"
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Docente</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Banner de Aviso de Integração Backend */}
        <div className="rounded-xl border border-sky-200/80 dark:border-sky-800/40 bg-sky-50/70 dark:bg-sky-950/20 p-3.5 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#004A99] dark:text-[#38BDF8] shrink-0 mt-0.5" />
          <div className="leading-relaxed space-y-1">
            <p><strong>Aguardando integração oficial.</strong> Listagem e prévias usam apenas exemplos fictícios. Nenhum registro oficial foi carregado.</p>
            <p>Esta demonstração não salva, publica, aprova ou revoga conteúdo. As alterações são descartadas ao sair ou recarregar. Não informe dados pessoais reais.</p>
            <p>Campos de identificação e textos pessoais estão bloqueados. Use “Preencher exemplo fictício” para avaliar cadastro, edição, validação e restauração sem coletar dados reais.</p>
          </div>
        </div>

        {/* Feedback toast transitório */}
        {feedback && (
          <div role="status" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {feedback.message}
            </span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          2. MODO LISTAGEM OU MODO FORMULÁRIO DE EDIÇÃO
      ======================================================== */}
      {!editingTeacher ? (
        /* ================= VISTA DA LISTAGEM ================= */
        <div className="space-y-6">
          {/* Cards de Resumo Analítico */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total de Docentes</span>
              <span className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-1 block">
                {stats.total}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-[#004A99]">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Ministrantes (Estúdio PVH)</span>
              <span className="text-xl sm:text-2xl font-bold font-display text-[#004A99] dark:text-[#38BDF8] mt-1 block">
                {stats.ministrantes}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-teal-600">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Mediadores (Salas de Aula)</span>
              <span className="text-xl sm:text-2xl font-bold font-display text-teal-700 dark:text-teal-400 mt-1 block">
                {stats.mediadores}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-amber-500">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Destaques no Mural da Home</span>
              <span className="text-xl sm:text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1 block">
                {stats.destaqueHome}
              </span>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Campo de Busca */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="teacher-search"
                  type="text"
                  name="teacher-search" aria-label="Buscar docentes fictícios"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, disciplina, escola, município..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 focus:ring-2 focus:ring-[#004A99]/30"
                />
              </div>

              {/* Filtro por Função */}
              <div>
                <select id="teachers-filterRole" aria-label="Filtrar por função" name="teachers-filterRole"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'todas' | TeacherRole)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                  <option value="todas">Todas as Funções</option>
                  <option value="ministrante">Ministrantes (Estúdio)</option>
                  <option value="mediador">Mediadores (Escolas)</option>
                </select>
              </div>

              {/* Filtro por Município */}
              <div>
                <select id="teachers-filterCity" aria-label="Filtrar por município" name="teachers-filterCity"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                  <option value="todos">Todos os Municípios</option>
                  {DEMO_MUNICIPALITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Status */}
              <div>
                <select id="teachers-filterStatus" aria-label="Filtrar por status editorial" name="teachers-filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'todos' | EditorialStatus)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                  <option value="todos">Status: Todos</option>
                  <option value="publicado">Publicados</option>
                  <option value="em_revisao">Em Revisão</option>
                  <option value="rascunho">Rascunhos</option>
                  <option value="reprovado">Reprovados</option>
                  <option value="despublicado">Despublicados</option>
                </select>
              </div>

              {/* Filtro por Destaque na Home */}
              <div>
                <select id="teachers-filterHome" aria-label="Filtrar por destaque na Home" name="teachers-filterHome"
                  value={filterHome}
                  onChange={(e) => setFilterHome(e.target.value as 'todos' | 'sim' | 'nao')}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                  <option value="todos">Home: Todos</option>
                  <option value="sim">Em Destaque na Home</option>
                  <option value="nao">Sem Destaque na Home</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Docentes */}
          <div className="space-y-3">
            {filteredTeachers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-[#0B1528]">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Nenhum docente encontrado
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Tente alterar os termos da busca ou redefinir os filtros de função e município.
                </p>
              </div>
            ) : (
              filteredTeachers.map((docente) => {
                const isMinistrante = docente.funcao === 'ministrante';
                return (
                  <div
                    key={docente.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1528] shadow-2xs hover:border-[#004A99]/40 dark:hover:border-sky-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Informações Principais */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Avatar Quadrado com Iniciais ou Foto */}
                      <div
                        className={`w-12 h-12 rounded-xl text-white font-bold text-sm grid place-items-center shrink-0 shadow-2xs ${
                          isMinistrante ? 'bg-[#004A99]' : 'bg-[#0F766E]'
                        }`}
                      >
                        {getTeacherInitials(docente.nome)}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {docente.nome}
                          </h3>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {docente.codigo_exibicao}
                          </span>

                          {/* Papel */}
                          {isMinistrante ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-[#004A99] dark:text-[#38BDF8] border border-sky-200 dark:border-sky-800/50">
                              <Tv className="w-3 h-3" />
                              <span>Ministrante • Estúdio</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50">
                              <School className="w-3 h-3" />
                              <span>Mediação Presencial</span>
                            </span>
                          )}

                          {/* Status */}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              docente.status === 'publicado'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : docente.status === 'em_revisao'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : docente.status === 'reprovado'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {docente.status}
                          </span>

                          {/* Destaque Home */}
                          {docente.destaque_home && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Mural Home #{docente.posicao_home || 1}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            {docente.disciplina}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            {docente.escola_nome}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            {docente.municipio_nome}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 pt-1 leading-relaxed">
                          {docente.resumo}
                        </p>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                      <button
                        type="button"
                        aria-label={`Prévia do perfil de ${docente.nome}`}
                        onClick={() => {
                          setPreviewTeacher(docente);
                          setPreviewTab('card_diretorio');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Prévia</span>
                      </button>

                      <button
                        type="button"
                        aria-label={`Editar perfil de ${docente.nome}`}
                        onClick={() => setEditingId(docente.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-2xs cursor-pointer active:scale-[0.98]"
                      >
                        <span>Editar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ================= VISTA DO FORMULÁRIO DE EDIÇÃO ================= */
        <div className="space-y-6">
          {/* Barra Superior de Status da Edição */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                {editingTeacher.codigo_exibicao}
              </span>
              <div>
                <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                  Editando: {editingTeacher.nome || 'Novo Docente'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span>Status: <strong className="uppercase">{editingTeacher.status}</strong></span>
                  {isCurrentDirty && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      • Alterações não salvas (em memória)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!isCurrentDirty}
                aria-label="Restaurar"
                onClick={handleRestoreCurrent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar</span>
              </button>

              <button
                type="button"
                aria-label="Pré-visualizar"
                onClick={() => {
                  setPreviewTeacher(editingTeacher);
                  setPreviewTab('card_diretorio');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pré-visualizar</span>
              </button>

              {/* Botões com trava indicativa de integração pendente */}
              <button
                type="button"
                disabled
                aria-label="Salvar rascunho — aguardando integração"
                title="Aguardando implementação do endpoint Rails PATCH /cms/docentes/:id"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs font-semibold cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Salvar rascunho — indisponível</span>
              </button>

              <button
                type="button"
                disabled
                title="Aguardando liberação de envio para Fila de Revisão"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs font-semibold cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Enviar para Revisão</span>
              </button>
            </div>
          </div>

          <button type="button" aria-label="Preencher exemplo fictício" onClick={() => {
            const sample = createInitialTeachersList()[0];
            updateCurrentTeacher({ ...structuredClone(sample), id: editingTeacher.id, posicao: editingTeacher.posicao });
          }} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Preencher exemplo fictício</button>

          <button type="button" disabled aria-label="Publicar" title="Aguardando integração oficial" className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-500 cursor-not-allowed">Publicar — indisponível</button>

          {/* Sumário de Erros de Validação (se houver) */}
          {!validation.isValid && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Pendências para validação do perfil docente:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {validation.summary.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Formulário em Seções */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ================= COLUNA 1: IDENTIFICAÇÃO E LOTAÇÃO ================= */}
            <div className="space-y-6">
              {/* Seção 1: Identificação */}
              <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Users className="w-4 h-4 text-[#004A99] dark:text-[#38BDF8]" />
                  <span>1. Identificação e Função Pedagógica</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="teachers-nome" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nome de Exibição do Docente *
                    </label>
                    <input id="teachers-nome" name="teachers-nome"
                      type="text"
                      value={editingTeacher.nome}
                      placeholder="Docente fictício"
                      className={`w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border ${
                        validation.errors.nome ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'
                      } text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 focus:ring-2 focus:ring-[#004A99]/30`}
                     readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    {validation.errors.nome && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{validation.errors.nome}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="teachers-slug" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Identificador Amigável (Slug) *
                      </label>
                      <input id="teachers-slug" name="teachers-slug"
                        type="text"
                        value={editingTeacher.slug}
                        placeholder="docente-ficticio"
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>

                    <div>
                      <label htmlFor="teachers-codigo_exibicao" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Código de Exibição
                      </label>
                      <input id="teachers-codigo_exibicao" name="teachers-codigo_exibicao"
                        type="text"
                        readOnly
                        value={editingTeacher.codigo_exibicao}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Seleção do Papel Docente */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Papel Pedagógico no MEDTEC *
                    </label>
                    <div role="group" aria-label="Função docente" className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        aria-label="Docente Ministrante" aria-pressed={editingTeacher.funcao === 'ministrante'}
                        onClick={() => updateCurrentTeacher({ funcao: 'ministrante', rotulo_funcao: 'Ministrante' })}
                        className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                          editingTeacher.funcao === 'ministrante'
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-[#004A99] dark:border-[#38BDF8] text-[#004A99] dark:text-[#38BDF8]'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <Tv className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold leading-tight">Docente Ministrante</p>
                          <p className="text-[10px] opacity-80 mt-0.5">Estúdio Central SEDUC / Transmissão Satelital</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        aria-label="Professor Mediador" aria-pressed={editingTeacher.funcao === 'mediador'}
                        onClick={() => updateCurrentTeacher({ funcao: 'mediador', rotulo_funcao: 'Mediador' })}
                        className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                          editingTeacher.funcao === 'mediador'
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-600 dark:border-teal-400 text-teal-800 dark:text-teal-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <School className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold leading-tight">Professor Mediador</p>
                          <p className="text-[10px] opacity-80 mt-0.5">Mediação Presencial nas Salas Conectadas</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="teachers-rotulo_funcao" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Rótulo de Apresentação (Flexão)
                      </label>
                      <input id="teachers-rotulo_funcao" name="teachers-rotulo_funcao"
                        type="text"
                        value={editingTeacher.rotulo_funcao}
                        placeholder="Ex.: Ministrante, Mediadora"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>

                    <div>
                      <label htmlFor="teachers-disciplina" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Disciplina / Especialidade *
                      </label>
                      <input id="teachers-disciplina"
                        type="text"
                        name="teacher-disciplina"
                        value={editingTeacher.disciplina}
                        placeholder="Ex.: Linguagens e Suas Tecnologias"
                        className={`w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border ${
                          validation.errors.disciplina ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'
                        } text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500`}
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Lotação Territorial */}
              <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>2. Lotação Territorial e Unidade Escolar</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="teachers-g_cidade_id" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Município Polo de Atuação (Rondônia) *
                    </label>
                    <select id="teachers-g_cidade_id" aria-label="Município (demonstração)" name="teachers-g_cidade_id"
                      value={editingTeacher.g_cidade_id}
                      onChange={(e) => {
                        const cityId = Number(e.target.value);
                        const cityObj = DEMO_MUNICIPALITIES.find((c) => c.id === cityId);
                        updateCurrentTeacher({
                          g_cidade_id: cityId,
                          municipio_nome: cityObj ? cityObj.nome : '',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                      <option value={0}>Aguardando município oficial</option>
                      {DEMO_MUNICIPALITIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="teachers-escola_nome" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Unidade Escolar / Estúdio Central *
                    </label>
                    <input id="teachers-escola_nome" name="teachers-escola_nome"
                      type="text"
                      value={editingTeacher.escola_nome}
                      placeholder="Ex.: Estúdio Central SEDUC-RO ou E.E.E.F.M. Simon Bolívar"
                      className={`w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border ${
                        validation.errors.escola_nome ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'
                      } text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500`}
                     readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => updateCurrentTeacher({ escola_nome: 'Estúdio Central SEDUC-RO — Porto Velho' })}
                        className="text-[10px] text-[#004A99] dark:text-[#38BDF8] hover:underline cursor-pointer"
                      >
                        + Estúdio Central
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="teachers-comunidade" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Comunidade / Localidade
                      </label>
                      <input id="teachers-comunidade" name="teachers-comunidade"
                        type="text"
                        value={editingTeacher.comunidade || ''}
                        placeholder="Ex.: Aldeia Sagarana, Setor Rural"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>

                    <div>
                      <label htmlFor="teachers-tag_territorial" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tag Territorial Curta (Metodologia Home)
                      </label>
                      <input id="teachers-tag_territorial" name="teachers-tag_territorial"
                        type="text"
                        value={editingTeacher.tag_territorial || ''}
                        placeholder="Ex.: Fronteira • Vale do Guaporé"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= COLUNA 2: PRÁTICA PEDAGÓGICA, FOTO E DESTAQUES ================= */}
            <div className="space-y-6">
              {/* Seção 3: Conteúdo e Entrevista */}
              <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>3. Prática Pedagógica e Entrevista</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Resumo da Prática Pedagógica (Card Público) *
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {editingTeacher.resumo.length}/{TEACHER_FIELD_LIMITS.resumo.max}
                      </span>
                    </div>
                    <textarea id="teachers-resumo" name="teachers-resumo" aria-label="resumo" readOnly
                      rows={3}
                      value={editingTeacher.resumo}
                      placeholder="Síntese da prática em sala de aula ou estúdio..."
                      className={`w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border ${
                        validation.errors.resumo ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'
                      } text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 resize-none`}
                    />
                    {validation.errors.resumo && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{validation.errors.resumo}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Entrevista Completa com o(a) Docente (Gaveta e Modal) *
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {editingTeacher.entrevista.length}/{TEACHER_FIELD_LIMITS.entrevista.max}
                      </span>
                    </div>
                    <textarea id="teachers-entrevista" name="teachers-entrevista" aria-label="entrevista" readOnly
                      rows={5}
                      value={editingTeacher.entrevista}
                      placeholder="Depoimento na íntegra sobre a experiência pedagógica com a mediação tecnológica..."
                      className={`w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border ${
                        validation.errors.entrevista ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'
                      } text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 resize-none`}
                    />
                    {validation.errors.entrevista && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{validation.errors.entrevista}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="teachers-orientacao_estudantes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Orientações aos Estudantes (Gaveta Lateral)
                    </label>
                    <textarea id="teachers-orientacao_estudantes" name="teachers-orientacao_estudantes"
                      rows={2}
                      value={editingTeacher.orientacao_estudantes || ''}
                      placeholder="Recomendações diretas aos alunos sobre como aproveitar melhor a disciplina..."
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 resize-none"
                     readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                  </div>
                </div>
              </div>

              {/* Seção 4: Retrato Oficial e Destaques */}
              <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>4. Imagem, Destaques na Home e Ordenação</span>
                </h3>

                <div className="space-y-3">
                  <CommunityDemoMedia photo={editingTeacher.foto_url} materials={editingTeacher.materiais} onChange={updateCurrentTeacher} />
                  <p className="text-xs text-slate-600 dark:text-slate-300">Autorização de imagem: aguardando verificação oficial. Nenhum termo é recebido nesta interface.</p>

                  {/* Controles de Destaque na Home e Posição */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input id="teachers-field-2" name="teachers-field-2"
                        type="checkbox"
                        checked={editingTeacher.destaque_home}
                        onChange={(e) => updateCurrentTeacher({ destaque_home: e.target.checked })}
                        className="rounded text-[#004A99] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Destacar no Mural da Comunidade Escolar na Home (#comunidade-escolar)
                      </span>
                    </label>

                    {editingTeacher.destaque_home && (
                      <div className="flex items-center gap-3 pl-6">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Posição no Mural (1 a 10):</span>
                        <input id="teachers-posicao_home" name="teachers-posicao_home" aria-label="Posição na Home"
                          type="number"
                          min={1}
                          max={10}
                          value={editingTeacher.posicao_home || 1}
                          onChange={(e) => updateCurrentTeacher({ posicao_home: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-center"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input id="teachers-field-3" name="teachers-field-3"
                        type="checkbox"
                        checked={Boolean(editingTeacher.destaque_metodologia)}
                        onChange={(e) => updateCurrentTeacher({ destaque_metodologia: e.target.checked })}
                        className="rounded text-[#004A99] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Exibir nos mini-perfis do bloco Metodologia da Home (#como-funciona)
                      </span>
                    </label>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Ordem na Listagem de Professores (/professores):
                      </span>
                      <input id="teachers-posicao" name="teachers-posicao" aria-label="Posição na listagem"
                        type="number"
                        min={1}
                        value={editingTeacher.posicao}
                        onChange={(e) => updateCurrentTeacher({ posicao: Number(e.target.value) })}
                        className="w-20 px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. MODAL DE PRÉ-VISUALIZAÇÃO FIEL DO COMPONENTE PÚBLICO
      ======================================================== */}
      {previewTeacher && (
        <div
          ref={previewOverlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            ref={previewDialogRef}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-label={`Prévia do perfil de ${previewTeacher.nome}`}
            className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Topo do Modal de Prévia */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#071324]/70 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-[#004A99] dark:text-[#38BDF8]">
                  <Eye className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    Pré-visualização do Perfil: {previewTeacher.nome}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Prévia visual com dados fictícios
                  </p>
                </div>
              </div>

              {/* Seletor de Superfície */}
              <div role="group" aria-label="Formato da prévia" className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-[11px] font-semibold">
                <button
                  type="button"
                  aria-pressed={previewTab === 'card_diretorio'} onClick={() => setPreviewTab('card_diretorio')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'card_diretorio'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Card /professores
                </button>
                <button
                  type="button"
                  aria-pressed={previewTab === 'gaveta_entrevista'} onClick={() => setPreviewTab('gaveta_entrevista')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'gaveta_entrevista'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                 aria-label="Gaveta Lateral">
                  Gaveta Lateral
                </button>
                <button
                  type="button"
                  aria-pressed={previewTab === 'mural_home'} onClick={() => setPreviewTab('mural_home')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'mural_home'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                 aria-label="Mural Home">
                  Mural Home
                </button>
                <button
                  type="button"
                  aria-pressed={previewTab === 'metodologia'} onClick={() => setPreviewTab('metodologia')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'metodologia'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Metodologia Home
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTeacher(null)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Fechar pré-visualização"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo da Prévia */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-[#071324]/30">
              {/* TAB 1: CARD DO DIRETÓRIO /professores */}
              {previewTab === 'card_diretorio' && (
                <div className="max-w-2xl mx-auto">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Superfície: Grade de Docentes em /professores (TeacherProfiles.tsx)
                  </p>
                  <TeacherCardPublicPreview teacher={previewTeacher} />
                </div>
              )}

              {/* TAB 2: GAVETA LATERAL DE ENTREVISTA */}
              {previewTab === 'gaveta_entrevista' && (
                <TeacherInterviewModalPublicPreview teacher={previewTeacher} />
              )}

              {/* TAB 3: MURAL DA HOME */}
              {previewTab === 'mural_home' && (
                <TeacherHomeMuralPublicPreview teacher={previewTeacher} />
              )}

              {/* TAB 4: METODOLOGIA HOME */}
              {previewTab === 'metodologia' && (
                <TeacherMethodologyMiniProfilePublicPreview teacher={previewTeacher} />
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0B1528] shrink-0">
              <span className="text-xs text-slate-500">
                Demonstração fictícia — alterações temporárias
              </span>
              <button
                type="button"
                onClick={() => setPreviewTeacher(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-[#00D8FF] text-white dark:text-slate-950 text-xs font-bold transition hover:bg-slate-800 cursor-pointer"
              >
                Fechar Prévia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TeacherCardPublicPreview({ teacher }: { teacher: TeacherDraft }) {
  return (
    <article
      className={`group flex flex-col sm:flex-row rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-sm overflow-hidden ${
        teacher.funcao === 'ministrante'
          ? 'border-l-4 border-l-[#004A99] dark:border-l-[#38BDF8]'
          : 'border-l-4 border-l-[#0F766E] dark:border-l-[#2DD4BF]'
      }`}
    >

      <div className="sm:w-56 shrink-0 p-5 bg-slate-50/70 dark:bg-[#061224]/70 border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-[#1A365D]/80 flex flex-col justify-between">
        <div>
          <div
            className={`grid h-14 w-14 place-items-center rounded-lg font-display text-lg font-bold text-white shadow-xs ${
              teacher.funcao === 'ministrante' ? 'bg-[#004A99]' : 'bg-[#0F766E]'
            }`}
          >
            {getTeacherInitials(teacher.nome)}
          </div>
          <h3 className="mt-3 font-display font-bold text-slate-900 dark:text-white text-base leading-snug">
            {teacher.nome || 'Nome do Docente'}
          </h3>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] text-slate-800 dark:text-slate-200">
            <BookOpen className="h-3 w-3 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{teacher.disciplina || 'Disciplina'}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-[#1A365D]/60">
          {teacher.funcao === 'ministrante' ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/40 text-[#004A99] dark:text-[#38BDF8] border border-sky-200 dark:border-sky-800/50">
              <Tv className="h-3.5 w-3.5 shrink-0" />
              <span>Docente Ministrante • Estúdio SEDUC</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#2DD4BF] border border-teal-200 dark:border-teal-800/50">
              <School className="h-3.5 w-3.5 shrink-0" />
              <span>Mediação Presencial • Unidade Escolar</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 p-5 flex flex-col justify-between">
      <CommunityDemoPhoto url={teacher.foto_url} alt={teacher.foto_alt} />
      {teacher.materiais?.map((material, index) => <p key={index} className="p-3 text-sm">{material.titulo}</p>)}
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-[#1A365D]/60">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>{teacher.escola_nome || 'Unidade Escolar'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>{teacher.municipio_nome || 'Município'}</span>
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Prática Pedagógica
            </span>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {teacher.resumo || 'Descrição da prática pedagógica...'}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A365D]/60 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            ID: {teacher.codigo_exibicao}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#004A99] dark:text-[#38BDF8]">
            <span>Ler entrevista completa</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function TeacherInterviewModalPublicPreview({
  teacher,
  onClose,
}: {
  teacher: TeacherDraft;
  onClose?: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto rounded-xl bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] p-6 shadow-md space-y-4">
      <CommunityDemoPhoto url={teacher.foto_url} alt={teacher.foto_alt} />
      {teacher.materiais?.map((material, index) => <p key={index} className="p-3 text-sm">{material.titulo}</p>)}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Entrevista e Prática Pedagógica</h4>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gaveta"
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div
          className={`w-14 h-14 rounded-lg font-bold text-lg text-white grid place-items-center shadow-xs ${
            teacher.funcao === 'ministrante' ? 'bg-[#004A99]' : 'bg-[#0F766E]'
          }`}
        >
          {getTeacherInitials(teacher.nome)}
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {teacher.nome}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {teacher.disciplina} • {teacher.rotulo_funcao}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061224] p-3 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span><strong>Lotação:</strong> {teacher.escola_nome}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span><strong>Município:</strong> {teacher.municipio_nome}, Rondônia</span>
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
          <Quote className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
          Entrevista Completa com o(a) Docente
        </span>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#061224] p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
          “{teacher.entrevista || 'Texto da entrevista...'}”
        </div>
      </div>

      {teacher.orientacao_estudantes && (
        <div>
          <strong className="block text-xs text-slate-900 dark:text-white mb-1">
            Recomendações aos Estudantes:
          </strong>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {teacher.orientacao_estudantes}
          </p>
        </div>
      )}
    </div>
  );
}

export function TeacherHomeMuralPublicPreview({ teacher }: { teacher: TeacherDraft }) {
  return (
    <div className="max-w-md mx-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#061224]/60 p-4 shadow-2xs">
      <CommunityDemoPhoto url={teacher.foto_url} alt={teacher.foto_alt} />
      {teacher.materiais?.map((material, index) => <p key={index} className="p-3 text-sm">{material.titulo}</p>)}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-md text-white font-bold text-sm grid place-items-center shrink-0 shadow-2xs ${
              teacher.funcao === 'ministrante' ? 'bg-[#004A99]' : 'bg-[#0F766E]'
            }`}
          >
            {getTeacherInitials(teacher.nome)}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              {teacher.nome}
            </h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <BookOpen className="h-3 w-3 text-slate-500 dark:text-slate-400" />
              {teacher.disciplina}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-[#004A99] dark:text-[#38BDF8] border border-sky-200 dark:border-sky-800/50">
          {teacher.funcao === 'ministrante' ? 'Ministrante • PVH' : 'Mediação • Escola'}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
        <span className="truncate">{teacher.escola_nome} • {teacher.municipio_nome}</span>
      </div>

      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
        {teacher.resumo}
      </p>
    </div>
  );
}

export function TeacherMethodologyMiniProfilePublicPreview({ teacher }: { teacher: TeacherDraft }) {
  return (
    <div className="max-w-xs mx-auto p-3.5 rounded-xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-[#1A365D] shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-cyan-950/80 border border-sky-300 dark:border-cyan-400/40 text-[#004A99] dark:text-[#00D8FF] flex items-center justify-center font-bold text-xs">
          {getTeacherInitials(teacher.nome)}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0C1E38] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 truncate max-w-[120px]">
          {teacher.tag_territorial || teacher.municipio_nome}
        </span>
      </div>
      <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
        {teacher.nome}
      </h4>
      <p className="text-[11px] font-semibold text-[#004A99] dark:text-[#00D8FF] mt-0.5">
        {teacher.funcao === 'ministrante' ? 'Ministrante Estúdio PVH' : `Mediador(a) ${teacher.municipio_nome}`}
      </p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
        {teacher.disciplina}
      </p>
    </div>
  );
}
