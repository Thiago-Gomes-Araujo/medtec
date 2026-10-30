'use client';

import React, { useState, useImperativeHandle } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Camera,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  GraduationCap,
  Lightbulb,
  Lock,
  MapPin,
  Plus,
  School,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { ProjectMission, ReplicationWeek } from '@/types';

export type ProjectViewMode = 'lista' | 'editor';

export interface ProjectsModuleHandle {
  newProject: () => void;
}

interface ProjectsModuleProps {
  ref?: React.Ref<ProjectsModuleHandle>;
  projects: ProjectMission[];
  viewMode: ProjectViewMode;
  onViewModeChange: (mode: ProjectViewMode) => void;
}

export default function ProjectsModule({
  ref,
  projects: projectsList,
  viewMode: projectViewMode,
  onViewModeChange: setProjectViewMode,
}: ProjectsModuleProps) {
  // Estado para formulário de Projeto Pedagógico (novo ou edição)
  const [editingProject, setEditingProject] = useState<ProjectMission | null>(null);
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

  const [uploadingImage, setUploadingImage] = useState(false);

  // Upload de capa existente: não persiste os dados do projeto.
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const resData: { url?: string; error?: string } = await res.json();
      if (res.ok && resData.url) {
        setProjectForm(prev => ({ ...prev, image: resData.url }));
      } else {
        alert('Erro ao enviar imagem: ' + (resData.error || 'Erro desconhecido'));
      }
    } catch {
      alert('Falha no upload da foto.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Funções de Gestão de Projetos Pedagógicos
  const handleNewProject = () => {
    const nextNum = String(projectsList.length + 1).padStart(2, '0');
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

  const handleDeleteProject = () => {
    alert('A exclusão de projetos pedagógicos está desabilitada aguardando suporte oficial do backend Rails. Nenhuma gravação local é simulada.');
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    alert('A criação e edição de projetos pedagógicos estão desabilitadas aguardando suporte oficial do backend Rails. A persistência em disco local foi descontinuada para cumprir a diretriz de fonte única de dados.');
  };

  // Mesmo padrão de NewsModule: o atalho externo usa a criação do próprio módulo.
  useImperativeHandle(ref, () => ({ newProject: handleNewProject }));

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
          <strong>Módulo em Homologação Técnica:</strong> As operações de criação, edição e exclusão de projetos pedagógicos estão desabilitadas aguardando suporte oficial do backend Rails. Nenhuma persistência simulada em disco local é utilizada.
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
                            onClick={handleDeleteProject}
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
                          onChange={handleFileUpload}
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
                  title="Aguardando suporte oficial do backend Rails"
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
