'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  GraduationCap,
  Medal,
  Cpu,
  FlaskConical,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  Building2,
  Search,
  Plus,
  RotateCcw,
  Eye,
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
  createInitialStudentsList,
  createEmptyStudentDraft,
  hasStudentChanges,
  validateStudentDraft,
  generateStudentSlug,
  STUDENT_CATEGORIES,
  STUDENT_FIELD_LIMITS,
  type StudentDraft,
  type StudentCategory,
  type LgpdStatus,
  type EditorialStatus,
} from '@/lib/admin-students';
import { DEMO_MUNICIPALITIES } from '@/lib/admin-teachers';

export interface StudentsAdminModuleProps {
  initialStudents?: StudentDraft[];
}

function CategoryIcon({ categoria, className = 'w-4 h-4' }: { categoria: StudentCategory; className?: string }) {
  switch (categoria) {
    case 'Vestibular':
      return <GraduationCap className={className} />;
    case 'Olimpíada':
      return <Medal className={className} />;
    case 'Robótica':
      return <Cpu className={className} />;
    case 'Feira de Ciências':
      return <FlaskConical className={className} />;
    default:
      return <Award className={className} />;
  }
}

function getCategoryColor(categoria: StudentCategory) {
  switch (categoria) {
    case 'Vestibular':
      return {
        badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
        badgeText: 'text-[#004A99] dark:text-[#38BDF8]',
        badgeBorder: 'border-sky-200 dark:border-sky-800/50',
      };
    case 'Olimpíada':
      return {
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
        badgeText: 'text-amber-800 dark:text-amber-300',
        badgeBorder: 'border-amber-200 dark:border-amber-800/50',
      };
    case 'Robótica':
      return {
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badgeText: 'text-emerald-800 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800/50',
      };
    case 'Feira de Ciências':
      return {
        badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
        badgeText: 'text-teal-800 dark:text-teal-300',
        badgeBorder: 'border-teal-200 dark:border-teal-800/50',
      };
    default:
      return {
        badgeBg: 'bg-slate-50 dark:bg-slate-800/40',
        badgeText: 'text-slate-800 dark:text-slate-200',
        badgeBorder: 'border-slate-200 dark:border-slate-700',
      };
  }
}

export default function StudentsAdminModule({ initialStudents }: StudentsAdminModuleProps) {
  // Catálogo de estudantes em memória
  const [students, setStudents] = useState<StudentDraft[]>(() =>
    initialStudents ? structuredClone(initialStudents) : createInitialStudentsList()
  );

  const [baselineStudents, setBaselineStudents] = useState<StudentDraft[]>(() =>
    initialStudents ? structuredClone(initialStudents) : createInitialStudentsList()
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const editingStudent = useMemo(() => {
    return students.find((s) => s.id === editingId) || null;
  }, [students, editingId]);

  const originalStudent = useMemo(() => {
    return baselineStudents.find((s) => s.id === editingId) || null;
  }, [baselineStudents, editingId]);

  // Aba ativa dentro do formulário de edição
  const [formSubTab, setFormSubTab] = useState<'trajetoria' | 'lgpd'>('trajetoria');

  // Filtros da listagem
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'todas' | StudentCategory>('todas');
  const [filterCity, setFilterCity] = useState<number | 'todos'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | EditorialStatus>('todos');
  const [filterLgpd, setFilterLgpd] = useState<'todos' | LgpdStatus>('todos');
  const [filterHighlight, setFilterHighlight] = useState<'todos' | 'topo' | 'home'>('todos');

  // Modal de prévia
  const [previewStudent, setPreviewStudent] = useState<StudentDraft | null>(null);
  const [previewTab, setPreviewTab] = useState<'destaque_topo' | 'card_grade' | 'modal_completo' | 'mural_home'>('destaque_topo');

  const { dialogRef: previewDialogRef, overlayRef: previewOverlayRef } = useDialogFocus(
    !!previewStudent,
    () => setPreviewStudent(null)
  );

  const [feedback, setFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Filtragem da lista
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterCategory !== 'todas' && s.categoria !== filterCategory) return false;
      if (filterCity !== 'todos' && s.g_cidade_id !== filterCity) return false;
      if (filterStatus !== 'todos' && s.status !== filterStatus) return false;
      if (filterLgpd !== 'todos' && s.consentimento_lgpd.status_lgpd !== filterLgpd) return false;
      if (filterHighlight === 'topo' && !s.destaque_pagina) return false;
      if (filterHighlight === 'home' && !s.destaque_home) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.nome_exibicao.toLowerCase().includes(q);
        const matchesAchieve = s.conquista.toLowerCase().includes(q);
        const matchesCommunity = s.comunidade.toLowerCase().includes(q);
        const matchesSchool = s.escola_nome.toLowerCase().includes(q);
        const matchesCity = s.municipio_nome.toLowerCase().includes(q);
        return matchesName || matchesAchieve || matchesCommunity || matchesSchool || matchesCity;
      }

      return true;
    });
  }, [students, filterCategory, filterCity, filterStatus, filterLgpd, filterHighlight, searchQuery]);

  // Contadores analíticos
  const stats = useMemo(() => {
    return {
      total: students.length,
      publicados: students.filter((s) => s.status === 'publicado').length,
      destaquesTopo: students.filter((s) => s.destaque_pagina).length,
      destaquesHome: students.filter((s) => s.destaque_home).length,
      lgpdVerificados: students.filter((s) => s.consentimento_lgpd.status_lgpd === 'verificado').length,
      emRevisao: students.filter((s) => s.status === 'em_revisao').length,
    };
  }, [students]);

  // Atualização do estudante em edição
  const updateCurrentStudent = (fields: Partial<StudentDraft>) => {
    if (!editingId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === editingId) {
          const updated = { ...s, ...fields };
          if (fields.conquista && (!s.slug || s.slug === generateStudentSlug(s.conquista, s.nome_exibicao))) {
            updated.slug = generateStudentSlug(fields.conquista, s.nome_exibicao);
          }
          return updated;
        }
        return s;
      })
    );
  };

  // Restauração do estudante aos dados de baseline
  const handleRestoreCurrent = () => {
    if (!originalStudent || !editingId) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === editingId ? structuredClone(originalStudent) : s))
    );
    setFeedback({
      type: 'info',
      message: `Alterações da história de "${originalStudent.nome_exibicao}" foram descartadas.`,
    });
  };

  // Restauração de todo o catálogo
  const handleResetCatalog = () => {
    const fresh = initialStudents ? structuredClone(initialStudents) : createInitialStudentsList();
    setStudents(fresh);
    setBaselineStudents(structuredClone(fresh));
    setEditingId(null);
    setFeedback({
      type: 'success',
      message: 'Catálogo de histórias de alunos restaurado aos exemplos fictícios da demonstração.',
    });
  };

  // Novo estudante
  const handleCreateNew = () => {
    const maxId = students.reduce((max, s) => Math.max(max, s.id), 0);
    const newStudent = createEmptyStudentDraft(maxId + 1);
    setStudents((prev) => [newStudent, ...prev]);
    setBaselineStudents((prev) => [newStudent, ...prev]);
    setEditingId(newStudent.id);
    setFormSubTab('trajetoria');
  };

  const validation = useMemo(() => {
    if (!editingStudent) return { isValid: true, errors: {}, summary: [], lgpdBlocked: false };
    return validateStudentDraft(editingStudent);
  }, [editingStudent]);

  const isCurrentDirty = useMemo(() => {
    if (!editingStudent || !originalStudent) return false;
    return hasStudentChanges(editingStudent, originalStudent);
  }, [editingStudent, originalStudent]);

  return (
    <div className="space-y-6 min-w-0 break-words">
      {/* ========================================================
          1. CABEÇALHO DO MÓDULO & AVISO LGPD/ECA
      ======================================================== */}
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                  <span>Alunos que Inspiram</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Aguardando integração oficial
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Protagonismo estudantil: aprovações em vestibulares, medalhas científicas, robótica e feiras sustentáveis de estudantes de Rondônia.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {editingStudent ? (
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
                  aria-label="Nova História"
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova História</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Banner de Aviso de Conformidade LGPD e Backend */}
        <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-950/20 p-3.5 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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
      {!editingStudent ? (
        /* ================= VISTA DA LISTAGEM ================= */
        <div className="space-y-6">
          {/* Cards de Resumo Analítico */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total de Histórias</span>
              <span className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-1 block">
                {stats.total}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-emerald-600">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Publicadas no Portal</span>
              <span className="text-xl sm:text-2xl font-bold font-display text-emerald-700 dark:text-emerald-400 mt-1 block">
                {stats.publicados}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-[#004A99]">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Destaque Territorial (/alunos)</span>
              <span className="text-xl sm:text-2xl font-bold font-display text-[#004A99] dark:text-[#38BDF8] mt-1 block">
                {stats.destaquesTopo}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-amber-500">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Mural da Home</span>
              <span className="text-xl sm:text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1 block">
                {stats.destaquesHome}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-teal-600">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Termos LGPD Verificados</span>
              <span className="text-xl sm:text-2xl font-bold font-display text-teal-700 dark:text-teal-400 mt-1 block">
                {stats.lgpdVerificados}
              </span>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
              {/* Campo de Busca */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="student-search"
                  type="text"
                  name="student-search" aria-label="Buscar histórias fictícias"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar protagonista, conquista, escola..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Filtro por Categoria */}
              <div>
                <select id="students-filterCategory" aria-label="Filtrar por categoria" name="students-filterCategory"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as 'todas' | StudentCategory)}
                  className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                  <option value="todas">Categorias</option>
                  {STUDENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Município */}
              <div>
                <select id="students-filterCity" aria-label="Filtrar por município" name="students-filterCity"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                  <option value="todos">Municípios</option>
                  {DEMO_MUNICIPALITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Status LGPD */}
              <div>
                <select id="students-filterLgpd" aria-label="Filtrar por autorização" name="students-filterLgpd"
                  value={filterLgpd}
                  onChange={(e) => setFilterLgpd(e.target.value as 'todos' | LgpdStatus)}
                  className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                  <option value="todos">LGPD: Todos</option>
                  <option value="verificado">LGPD: Verificado</option>
                  <option value="pendente">LGPD: Pendente</option>
                  <option value="expirado">LGPD: Expirado</option>
                  <option value="revogado">LGPD: Revogado</option>
                </select>
              </div>

              {/* Filtro por Status Editorial */}
              <div>
                <select id="students-filterStatus" aria-label="Filtrar por status editorial" name="students-filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'todos' | EditorialStatus)}
                  className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                  <option value="todos">Status: Todos</option>
                  <option value="publicado">Publicados</option>
                  <option value="em_revisao">Em Revisão</option>
                  <option value="rascunho">Rascunhos</option>
                  <option value="reprovado">Reprovados</option>
                  <option value="despublicado">Despublicados</option>
                </select>
              </div>

              {/* Filtro por Destaque */}
              <div>
                <select id="students-filterHighlight" aria-label="Filtrar por destaque" name="students-filterHighlight"
                  value={filterHighlight}
                  onChange={(e) => setFilterHighlight(e.target.value as 'todos' | 'topo' | 'home')}
                  className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500">
                  <option value="todos">Destaques: Todos</option>
                  <option value="topo">Topo /alunos</option>
                  <option value="home">Mural Home</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Histórias de Alunos */}
          <div className="space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-[#0B1528]">
                <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Nenhuma história de aluno encontrada
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Tente alterar os termos da busca ou redefinir os filtros de categoria e município.
                </p>
              </div>
            ) : (
              filteredStudents.map((aluno) => {
                const theme = getCategoryColor(aluno.categoria);
                const isLgpdVerified = aluno.consentimento_lgpd.status_lgpd === 'verificado';

                return (
                  <div
                    key={aluno.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1528] shadow-2xs hover:border-emerald-500/40 dark:hover:border-emerald-400/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Informações Principais */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Ícone de Categoria */}
                      <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}>
                        <CategoryIcon categoria={aluno.categoria} className="w-6 h-6" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {aluno.conquista}
                          </h3>

                          {/* Categoria */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}>
                            {aluno.categoria}
                          </span>

                          {/* Selo LGPD */}
                          {isLgpdVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Autorização pendente — exemplo fictício</span>
                            </span>
                          ) : aluno.consentimento_lgpd.status_lgpd === 'revogado' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                              <ShieldAlert className="w-3 h-3" />
                              <span>Consentimento Revogado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                              <Clock className="w-3 h-3" />
                              <span>Termo Pendente</span>
                            </span>
                          )}

                          {/* Destaque Topo */}
                          {aluno.destaque_pagina && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#004A99] text-white">
                              <span>Destaque Territorial (/alunos)</span>
                            </span>
                          )}

                          {/* Destaque Home */}
                          {aluno.destaque_home && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Mural Home #{aluno.posicao_home || 1}</span>
                            </span>
                          )}
                        </div>

                        {/* Protagonista e Linha Territorial */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {aluno.nome_exibicao}
                            {aluno.exibir_idade && aluno.idade_referencia ? ` (${aluno.idade_referencia} anos)` : ''}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            {aluno.comunidade} • {aluno.municipio_nome}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            {aluno.escola_nome}
                          </span>
                        </div>

                        {/* Resumo da Trajetória */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 pt-1 leading-relaxed italic">
                          “{aluno.resumo}”
                        </p>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                      <button
                        type="button"
                        aria-label={`Prévia da história de ${aluno.nome_exibicao}`}
                        onClick={() => {
                          setPreviewStudent(aluno);
                          setPreviewTab('destaque_topo');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Prévia</span>
                      </button>

                      <button
                        type="button"
                        aria-label={`Editar história de ${aluno.nome_exibicao}`}
                        onClick={() => {
                          setEditingId(aluno.id);
                          setFormSubTab('trajetoria');
                        }}
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
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <CategoryIcon categoria={editingStudent.categoria} className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                  Editando: {editingStudent.conquista || 'Nova História'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span>Protagonista: <strong className="text-slate-800 dark:text-slate-200">{editingStudent.nome_exibicao || 'Não informado'}</strong></span>
                  <span>• Categoria: <strong>{editingStudent.categoria}</strong></span>
                  {isCurrentDirty && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
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
                  setPreviewStudent(editingStudent);
                  setPreviewTab('destaque_topo');
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
                title="Aguardando implementação do endpoint Rails PATCH /cms/historias_alunos/:id"
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
            const sample = createInitialStudentsList()[0];
            updateCurrentStudent({ ...structuredClone(sample), id: editingStudent.id, posicao: editingStudent.posicao });
          }} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Preencher exemplo fictício</button>

          {/* Abas Internas do Formulário: Trajetória vs. Conformidade LGPD */}
          <div role="group" aria-label="Seções do formulário" className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
            <button
              type="button"
              aria-label="Aba Trajetória"
              aria-pressed={formSubTab === 'trajetoria'} onClick={() => setFormSubTab('trajetoria')}
              className={`pb-2.5 px-3.5 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                formSubTab === 'trajetoria'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>1. Trajetória, Conquista e Origem</span>
            </button>

            <button
              type="button"
              aria-label="Aba Conformidade LGPD & ECA"
              aria-pressed={formSubTab === 'lgpd'} onClick={() => setFormSubTab('lgpd')}
              className={`pb-2.5 px-3.5 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                formSubTab === 'lgpd'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>2. Conformidade LGPD & ECA (Termo de Autorização)</span>
              {editingStudent.consentimento_lgpd.status_lgpd === 'verificado' ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          </div>

          <button type="button" disabled aria-label="Publicar" title="Aguardando integração oficial" className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-500 cursor-not-allowed">Publicar — indisponível</button>

          {/* Sumário de Erros de Validação (se houver) */}
          {!validation.isValid && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Pendências para validação da história estudantil:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {validation.summary.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ================= CONTEÚDO DA SUB-ABA 1: TRAJETÓRIA ================= */}
          {formSubTab === 'trajetoria' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna 1: Identificação da Conquista e Estudante */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Dados da Conquista e Protagonista</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="students-conquista" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Título Principal da Conquista *
                      </label>
                      <input id="students-conquista" name="students-conquista"
                        type="text"
                        value={editingStudent.conquista}
                        placeholder="Ex.: 1º Lugar em Medicina — UNIR ou Medalha de Prata na OBMEP"
                        className={`w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border ${
                          validation.errors.conquista ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'
                        } text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 focus:ring-2 focus:ring-emerald-500/30`}
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                      {validation.errors.conquista && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{validation.errors.conquista}</p>
                      )}
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Categoria da Conquista *
                      </label>
                      <div role="group" aria-label="Categoria da conquista" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {STUDENT_CATEGORIES.map((cat) => {
                          const isSelected = editingStudent.categoria === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              aria-pressed={isSelected} aria-label={`Categoria ${cat}`} onClick={() => updateCurrentStudent({ categoria: cat })}
                              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold'
                                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <CategoryIcon categoria={cat} className="w-4 h-4" />
                              <span className="text-[11px] truncate w-full">{cat}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="students-nome_exibicao" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nome Autorizado para Divulgação Pública *
                      </label>
                      <input id="students-nome_exibicao" name="students-nome_exibicao"
                        type="text"
                        value={editingStudent.nome_exibicao}
                        placeholder="Estudante fictício"
                        className={`w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border ${
                          validation.errors.nome_exibicao ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'
                        } text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500`}
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Identificador amigável (slug)
                      <input name="students-slug" readOnly value={editingStudent.slug} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 dark:bg-slate-900" />
                    </label>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="students-idade_referencia" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Idade Editorial na Época (10 a 99)
                        </label>
                        <input id="students-idade_referencia" name="students-idade_referencia"
                          type="number"
                          min={10}
                          max={99}
                          value={editingStudent.idade_referencia || ''}
                          onChange={(e) => updateCurrentStudent({ idade_referencia: Number(e.target.value) || undefined })}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                        />
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input id="students-field-2" name="students-field-2"
                            type="checkbox"
                            checked={editingStudent.exibir_idade}
                            onChange={(e) => updateCurrentStudent({ exibir_idade: e.target.checked })}
                            className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300">
                            Exibir idade no portal público
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
                      <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Privacidade de Menores:</strong> Data de nascimento <strong>nunca</strong> é coletada nem exibida nos contratos públicos do MEDTEC.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="students-ano_conquista" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Ano da Conquista
                        </label>
                        <input id="students-ano_conquista" name="students-ano_conquista"
                          type="number"
                          value={editingStudent.ano_conquista || 2026}
                          onChange={(e) => updateCurrentStudent({ ano_conquista: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="students-serie_turma" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Série / Turma
                        </label>
                        <input id="students-serie_turma" name="students-serie_turma"
                          type="text"
                          value={editingStudent.serie_turma || ''}
                          placeholder="Ex.: 3ª Série do Ensino Médio"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                         readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção Origem Territorial */}
                <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <MapPin className="w-4 h-4 text-[#004A99] dark:text-[#38BDF8]" />
                    <span>Origem Territorial e Escola Polo</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="students-g_cidade_id" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Município Polo (Rondônia) *
                      </label>
                      <select id="students-g_cidade_id" aria-label="Município (demonstração)" name="students-g_cidade_id"
                        value={editingStudent.g_cidade_id}
                        onChange={(e) => {
                          const cityId = Number(e.target.value);
                          const cityObj = DEMO_MUNICIPALITIES.find((c) => c.id === cityId);
                          updateCurrentStudent({
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
                      <label htmlFor="students-comunidade" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Comunidade de Origem *
                      </label>
                      <input id="students-comunidade" name="students-comunidade"
                        type="text"
                        value={editingStudent.comunidade}
                        placeholder="Ex.: Distrito de Iata • Comunidade Ribeirinha ou Aldeia Sagarana"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>

                    <div>
                      <label htmlFor="students-escola_nome" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Unidade Escolar Polo do MEDTEC *
                      </label>
                      <input id="students-escola_nome" name="students-escola_nome"
                        type="text"
                        value={editingStudent.escola_nome}
                        placeholder="Ex.: E.E.E.F.M. Simon Bolívar"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>

                    <div>
                      <label htmlFor="students-professor_mediador_nome" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Professor Mediador Orientador
                      </label>
                      <input id="students-professor_mediador_nome" name="students-professor_mediador_nome"
                        type="text"
                        value={editingStudent.professor_mediador_nome || ''}
                        placeholder="Ex.: Prof. Carlos Henrique Mendes"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Narrativa, Foto e Destaques */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Quote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Narrativa e Depoimento da Conquista</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Resumo da Trajetória / Citação Principal *
                        </label>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {editingStudent.resumo.length}/{STUDENT_FIELD_LIMITS.resumo.max}
                        </span>
                      </div>
                      <textarea id="students-resumo" name="students-resumo" aria-label="resumo" readOnly
                        rows={3}
                        value={editingStudent.resumo}
                        placeholder="Depoimento em aspas do estudante sobre como as aulas ao vivo e a mediação apoiaram sua conquista..."
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="students-relato_completo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Relato Completo de Trajetória (Modal Detalhado)
                      </label>
                      <textarea id="students-relato_completo" name="students-relato_completo"
                        rows={5}
                        value={editingStudent.relato_completo || ''}
                        placeholder="Texto expandido para o modal de leitura completa..."
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 resize-none"
                       readOnly title="Entrada de dados pessoais bloqueada nesta demonstração"/>
                    </div>

                    <CommunityDemoMedia photo={editingStudent.foto_url} materials={editingStudent.materiais} onChange={updateCurrentStudent} />
                  </div>
                </div>

                {/* Seção Destaques e Posição */}
                <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Destaques e Posicionamento Visual</span>
                  </h3>

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Ordem na listagem
                      <input name="students-posicao" type="number" min={1} value={editingStudent.posicao} onChange={event => updateCurrentStudent({ posicao: Number(event.target.value) })} className="ml-3 w-20 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:bg-slate-900" />
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input id="students-field-3" name="students-field-3"
                        type="checkbox"
                        checked={editingStudent.destaque_pagina}
                        onChange={(e) => updateCurrentStudent({ destaque_pagina: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Destaque Territorial no topo da página /alunos
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Exibe esta história no card panorâmico de topo de Alunos que Inspiram.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input id="students-field-4" name="students-field-4"
                        type="checkbox"
                        checked={editingStudent.destaque_home}
                        onChange={(e) => updateCurrentStudent({ destaque_home: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Destacar no Mural da Comunidade Escolar na Home (#comunidade-escolar)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Requer autorização expressa no termo LGPD para exibição na capa do portal.
                        </span>
                      </div>
                    </label>

                    {editingStudent.destaque_home && (
                      <div className="flex items-center gap-3 pl-4">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Posição no Mural da Home (1 a 10):</span>
                        <input id="students-posicao_home" name="students-posicao_home" aria-label="Posição na Home"
                          type="number"
                          min={1}
                          max={10}
                          value={editingStudent.posicao_home || 1}
                          onChange={(e) => updateCurrentStudent({ posicao_home: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {formSubTab === 'lgpd' && (
            <section aria-label="Indicadores de autorização" className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0B1528] space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Conformidade e autorização — aguardando integração oficial</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum consentimento foi verificado. O Rails deverá conferir termo privado, signatário, vínculo, assinatura, validade e escopos antes de autorizar qualquer divulgação.</p>
              <dl className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700 dark:text-slate-200">
                {[
                  ['Status da autorização', 'Pendente de integração'],
                  ['Termo privado', 'Não recebido'],
                  ['Nome e relato', 'Não confirmado'],
                  ['Uso de imagem', 'Não confirmado'],
                  ['Destaque na Home', 'Não confirmado'],
                  ['Assinatura e validade', 'Não verificadas'],
                ].map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd>{value}</dd></div>)}
              </dl>
              <p className="text-sm text-slate-600 dark:text-slate-300">Nome e documento do responsável, datas, protocolos e arquivos privados não são coletados nesta demonstração.</p>
              <div className="flex flex-wrap gap-3">
                {['Anexar termo privado', 'Visualizar termo', 'Validar Termo LGPD', 'Revogar Consentimento'].map(label => <button key={label} type="button" disabled aria-label={label} title="Aguardando integração oficial e permissão específica" className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-500 cursor-not-allowed">{label}</button>)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ========================================================
          3. MODAL DE PRÉ-VISUALIZAÇÃO FIEL DO COMPONENTE PÚBLICO
      ======================================================== */}
      {previewStudent && (
        <div
          ref={previewOverlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            ref={previewDialogRef}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-label={`Prévia de ${previewStudent.conquista}`}
            className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Topo do Modal */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#071324]/70 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  <Eye className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    Prévia: {previewStudent.conquista}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Protagonista: {previewStudent.nome_exibicao} • {previewStudent.categoria}
                  </p>
                </div>
              </div>

              {/* Seletor de Superfície */}
              <div role="group" aria-label="Formato da prévia" className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-[11px] font-semibold">
                <button
                  type="button"
                  aria-pressed={previewTab === 'destaque_topo'} onClick={() => setPreviewTab('destaque_topo')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'destaque_topo'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                 aria-label="Destaque Territorial">
                  Destaque Territorial
                </button>
                <button
                  type="button"
                  aria-pressed={previewTab === 'card_grade'} onClick={() => setPreviewTab('card_grade')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'card_grade'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                 aria-label="Card da Grade">
                  Card da Grade
                </button>
                <button
                  type="button"
                  aria-pressed={previewTab === 'modal_completo'} onClick={() => setPreviewTab('modal_completo')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'modal_completo'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                 aria-label="Modal Completo">
                  Modal Completo
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
              </div>

              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Fechar prévia"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo da Prévia */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-[#071324]/30">
              {/* TAB 1: DESTAQUE TERRITORIAL (PANORÂMICO DE TOPO) */}
              {previewTab === 'destaque_topo' && (
                <StudentPanoramicCardPreview student={previewStudent} />
              )}              {/* TAB 2: CARD DA GRADE REGULAR */}
              {previewTab === 'card_grade' && (
                <StudentGridCardPreview student={previewStudent} />
              )}

              {/* TAB 3: MODAL DE TRAJETÓRIA COMPLETA */}
              {previewTab === 'modal_completo' && (
                <StudentTrajectoryModalPreview student={previewStudent} />
              )}

              {/* TAB 4: MURAL DA HOME */}
              {previewTab === 'mural_home' && (
                <StudentHomeMuralPreview student={previewStudent} />
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0B1528] shrink-0">
              <span className="text-xs text-slate-500">
                Demonstração fictícia — sem autorização ou publicação oficial
              </span>
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
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

export function StudentPanoramicCardPreview({ student }: { student: StudentDraft }) {
  return (
    <div className="max-w-3xl mx-auto">
      <CommunityDemoPhoto url={student.foto_url} alt={student.foto_alt} />
      {student.materiais?.map((material, index) => <p key={index} className="p-3 text-sm">{material.titulo}</p>)}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        Prévia do destaque territorial
      </p>
      <article className="rounded-2xl border-2 border-[#004A99]/20 dark:border-[#00D8FF]/30 bg-white dark:bg-[#0C1E38] shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-br from-slate-50 to-white dark:from-[#061224] dark:to-[#0C1E38] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#1A365D]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#004A99] text-white">
                  Destaque Territorial
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  <CategoryIcon categoria={student.categoria} className="h-3.5 w-3.5" />
                  <span>{student.categoria}</span>
                </span>
              </div>

              <div className="mt-4 flex items-start gap-3.5">
                <div className="p-3 rounded-xl shrink-0 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  <CategoryIcon categoria={student.categoria} className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {student.conquista}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    Conquista viabilizada pela Mediação Tecnológica SEDUC-RO
                  </p>
                </div>
              </div>

              <div className="mt-4 relative bg-white dark:bg-[#061224] p-4 rounded-xl border border-slate-200/90 dark:border-[#1A365D]">
                <Quote className="h-5 w-5 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  “{student.resumo}”
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-[#1A365D]/80 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm sm:base text-slate-900 dark:text-white">
                  {student.nome_exibicao}
                </h3>
                <p className="text-xs text-slate-500">
                  Estudante MEDTEC
                  {student.exibir_idade && student.idade_referencia ? ` • ${student.idade_referencia} anos` : ""}
                </p>
              </div>
              <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Autorização pendente — exemplo fictício</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-slate-50/60 dark:bg-[#061224]/60">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Origem & Rota Territorial
              </span>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#004A99] shrink-0 mt-0.5" />
                  <span><strong>Comunidade:</strong> {student.comunidade}</span>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>Município Polo:</strong> {student.municipio_nome}</span>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>Escola:</strong> {student.escola_nome}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function StudentGridCardPreview({ student }: { student: StudentDraft }) {
  return (
    <div className="max-w-sm mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1E38] p-5 shadow-xs space-y-3">
      <CommunityDemoPhoto url={student.foto_url} alt={student.foto_alt} />
      {student.materiais?.map((material, index) => <p key={index} className="p-3 text-sm">{material.titulo}</p>)}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {student.categoria}
        </span>
        <span className="text-[10px] text-amber-800 dark:text-amber-300 flex items-center gap-1 font-semibold">
          <Clock className="w-3 h-3" />
          Autorização pendente
        </span>
      </div>

      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
        {student.conquista}
      </h4>

      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed italic">
        “{student.resumo}”
      </p>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{student.nome_exibicao}</p>
          <p className="text-[11px] text-slate-500">{student.municipio_nome}</p>
        </div>
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Ver história →
        </span>
      </div>
    </div>
  );
}

export function StudentTrajectoryModalPreview({
  student,
  onClose,
}: {
  student: StudentDraft;
  onClose?: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto rounded-xl bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4">
      <CommunityDemoPhoto url={student.foto_url} alt={student.foto_alt} />
      {student.materiais?.map((material, index) => <p key={index} className="p-3 text-sm">{material.titulo}</p>)}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
            Protagonismo Estudantil
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {student.categoria}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white leading-tight">
        {student.conquista}
      </h3>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061224] p-3 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900 dark:text-white">
            {student.nome_exibicao}
            {student.exibir_idade && student.idade_referencia ? ` (${student.idade_referencia} anos)` : ""}
          </span>
          <span className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Autorização pendente
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {student.comunidade} • {student.municipio_nome}, Rondônia
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#061224] p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
        “{student.relato_completo || student.resumo}”
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300">
        <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          Demonstração fictícia. Nenhuma autorização foi recebida ou verificada. A divulgação oficial dependerá da conferência do termo privado no Rails.
        </span>
      </div>
    </div>
  );
}

export function StudentHomeMuralPreview({ student }: { student: StudentDraft }) {
  return (
    <div className="max-w-md mx-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#061224]/60 p-4 shadow-2xs space-y-2.5">
      <CommunityDemoPhoto url={student.foto_url} alt={student.foto_alt} />
      {student.materiais?.map((material, index) => <p key={index} className="p-3 text-sm">{material.titulo}</p>)}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-md px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CategoryIcon categoria={student.categoria} className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200 truncate">
            {student.conquista}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded shrink-0">
          {student.categoria}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
          {student.nome_exibicao}
        </h4>
        <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1 shrink-0">
          <Clock className="h-3 w-3" />
          <span>Autorização pendente — exemplo fictício</span>
        </span>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <MapPin className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
        <span className="truncate">{student.comunidade} • {student.municipio_nome}</span>
      </p>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 italic">
        “{student.resumo}”
      </p>
    </div>
  );
}
