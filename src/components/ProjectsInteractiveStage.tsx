'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PROJECTS_DATA, 
  TRACK_OPTIONS, 
  ProjectMission 
} from '@/data/projectsData';
import ReplicationPassportModal from './ReplicationPassportModal';
import Badge3D from '@/components/Badge3D';
import { 
  Sparkles, 
  ArrowRight, 
  Package, 
  MapPin, 
  School, 
  Radio, 
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Zap,
  Sprout,
  FlaskConical,
  Landmark,
  Cpu,
  Trophy,
  ThumbsUp
} from 'lucide-react';

export default function ProjectsInteractiveStage() {
  const [selectedTrack, setSelectedTrack] = useState<string>(TRACK_OPTIONS[0]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(PROJECTS_DATA[0].id);
  const [applauseCounts, setApplauseCounts] = useState<{ [id: string]: number }>(() => {
    const initial: { [id: string]: number } = {};
    PROJECTS_DATA.forEach((p) => {
      initial[p.id] = p.initialApplause;
    });
    return initial;
  });
  const [applauseAnimationId, setApplauseAnimationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtragem de projetos pelo dock de trilhas
  const filteredProjects = selectedTrack === 'Todas as Missões (06)'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => {
        if (selectedTrack.includes('Agroecologia')) return p.track === 'Agroecologia & NBAZ';
        if (selectedTrack.includes('Ciência')) return p.track === 'Ciência na Amazônia';
        if (selectedTrack.includes('Indígenas')) return p.track === 'Saberes Indígenas & História';
        if (selectedTrack.includes('Solar')) return p.track === 'Tecnologia Solar & Robótica';
        return true;
      });

  // Projeto selecionado atual
  const currentProject = PROJECTS_DATA.find((p) => p.id === selectedProjectId) || PROJECTS_DATA[0];

  // Alterna o projeto e ajusta a trilha se necessário
  const handleSelectProject = (project: ProjectMission) => {
    setSelectedProjectId(project.id);
  };

  // Avança para a próxima missão circularmente
  const handleNextMission = () => {
    const currentIndex = PROJECTS_DATA.findIndex((p) => p.id === selectedProjectId);
    const nextIndex = (currentIndex + 1) % PROJECTS_DATA.length;
    const nextProject = PROJECTS_DATA[nextIndex];
    setSelectedProjectId(nextProject.id);
  };

  // Incrementa aplausos com micro-feedback
  const handleApplause = (id: string) => {
    setApplauseCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    setApplauseAnimationId(id);
    setTimeout(() => {
      setApplauseAnimationId(null);
    }, 900);
  };

  // Ícones representativos para cada trilha
  const getTrackIcon = (track: string) => {
    if (track.includes('Todas')) return <Zap className="w-3.5 h-3.5 text-[#004A99] dark:text-[#00D8FF]" />;
    if (track.includes('Agroecologia')) return <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    if (track.includes('Ciência')) return <FlaskConical className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
    if (track.includes('Indígenas')) return <Landmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    if (track.includes('Solar') || track.includes('Robótica')) return <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    return <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
  };

  // Ícones temáticos para selos oficiais
  const getSealIcon = (sealText: string) => {
    if (sealText.includes('FEIRA') || sealText.includes('DESTAQUE')) return <Trophy className="w-3.5 h-3.5" />;
    if (sealText.includes('BNCC') || sealText.includes('CERTIFICADA')) return <Award className="w-3.5 h-3.5" />;
    if (sealText.includes('OLIMPÍADA') || sealText.includes('CIÊNCIAS')) return <FlaskConical className="w-3.5 h-3.5" />;
    if (sealText.includes('ENERGÉTICA') || sealText.includes('INOVAÇÃO')) return <Zap className="w-3.5 h-3.5" />;
    if (sealText.includes('AGROECOLÓGICA')) return <Sprout className="w-3.5 h-3.5" />;
    if (sealText.includes('IMATERIAL') || sealText.includes('HISTÓRIA')) return <Radio className="w-3.5 h-3.5" />;
    return <Sparkles className="w-3.5 h-3.5" />;
  };

  // Cores dinâmicas para os nós de trilha
  const getTrackColorClasses = (track: ProjectMission['track']) => {
    switch (track) {
      case 'Agroecologia & NBAZ':
        return {
          dot: 'bg-emerald-500 shadow-[0_0_8px_#10B981]',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
        };
      case 'Ciência na Amazônia':
        return {
          dot: 'bg-cyan-400 shadow-[0_0_8px_#00D8FF]',
          badge: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30'
        };
      case 'Saberes Indígenas & História':
        return {
          dot: 'bg-amber-500 shadow-[0_0_8px_#F59E0B]',
          badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
        };
      case 'Tecnologia Solar & Robótica':
        return {
          dot: 'bg-blue-500 shadow-[0_0_8px_#3B82F6]',
          badge: 'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-500/30'
        };
      default:
        return {
          dot: 'bg-sky-400',
          badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200'
        };
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* ========================================================================= */}
      {/* 1. TOPO COMPACTO COM SELETOR DE TRILHAS EM CÁPSULAS                      */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        
        {/* Header Enxuto com Tag Técnica, Título Display e Placar Técnico */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-[#1A365D]">
          
          <div className="space-y-2 max-w-3xl">
            {/* Tag técnica */}
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#004A99] dark:text-[#00D8FF] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 dark:bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-cyan-400" />
              </span>
              <span>Laboratório Vivo de Inovação Aplicada • SEDUC-RO</span>
            </div>

            {/* Título Display */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-slate-900 dark:text-[#E6F4FF] leading-tight text-balance">
              Missões &amp; Projetos Pedagógicos
            </h1>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 text-pretty max-w-2xl">
              Práticas territoriais reais desenvolvidas por turmas de Ensino Médio com Mediação Tecnológica nas florestas, águas e campos de Rondônia.
            </p>
          </div>

          {/* Placar Técnico Horizontal Compacto */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] px-3.5 py-2 font-mono text-xs shadow-xs tabular-nums">
              <span className="font-bold text-[#004A99] dark:text-[#00D8FF]">84+ Projetos</span>
            </div>
            <div className="rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] px-3.5 py-2 font-mono text-xs shadow-xs tabular-nums">
              <span className="font-bold text-[#004A99] dark:text-[#00D8FF]">30+ Municípios</span>
            </div>
            <div className="rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] px-3.5 py-2 font-mono text-xs shadow-xs tabular-nums">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Prática Comunitária</span>
            </div>
          </div>

        </div>

        {/* Dock de Trilhas Temáticas (Filtros Horizontais em Cápsulas com Ícones 3D) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TRACK_OPTIONS.map((track) => {
            const isSelected = selectedTrack === track;
            return (
              <button
                key={track}
                onClick={() => {
                  setSelectedTrack(track);
                  if (track !== 'Todas as Missões (06)') {
                    const firstMatch = PROJECTS_DATA.find((p) => {
                      if (track.includes('Agroecologia')) return p.track === 'Agroecologia & NBAZ';
                      if (track.includes('Ciência')) return p.track === 'Ciência na Amazônia';
                      if (track.includes('Indígenas')) return p.track === 'Saberes Indígenas & História';
                      if (track.includes('Solar')) return p.track === 'Tecnologia Solar & Robótica';
                      return true;
                    });
                    if (firstMatch) {
                      setSelectedProjectId(firstMatch.id);
                    }
                  }
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ease-out cursor-pointer border touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                  isSelected
                    ? 'bg-[#004A99] text-white border-[#004A99] shadow-sm dark:bg-[#00D8FF] dark:text-slate-950 dark:border-[#00D8FF]'
                    : 'bg-white dark:bg-[#0C1E38] text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-[#1A365D] hover:border-slate-300 dark:hover:border-cyan-400/40 hover:bg-slate-50 dark:hover:bg-[#0F2647]'
                }`}
              >
                <span className="shrink-0">{getTrackIcon(track)}</span>
                <span>{track}</span>
              </button>
            );
          })}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. SEÇÃO PRINCIPAL: PALCO INTERATIVO DE INSPEÇÃO (12 COLUNAS)            */}
      {/* ========================================================================= */}
      <section id="palco-inspecao" className="scroll-mt-24 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Layers className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
            <span>Console de Inspeção • Missão Pedagógica em Detalhe</span>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {PROJECTS_DATA.findIndex((p) => p.id === currentProject.id) + 1} de {PROJECTS_DATA.length}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ======================================================== */}
          {/* COLUNA ESQUERDA (lg:col-span-4 — ÍNDICE DE MISSÕES)     */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <div className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-slate-50/70 dark:bg-[#08182E]/50 p-2.5 space-y-2">
              <span className="block px-2 pt-1 font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Selecione uma missão para inspecionar
              </span>

              {filteredProjects.map((project) => {
                const isCurrent = project.id === currentProject.id;
                const colors = getTrackColorClasses(project.track);

                return (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className={`w-full text-left rounded-2xl p-3.5 transition-all duration-150 ease-out cursor-pointer border flex items-center justify-between gap-3 relative touch-manipulation select-none active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                      isCurrent
                        ? 'bg-[#004A99] text-white border-[#003B7A] shadow-md dark:bg-[#0C1E38] dark:border-[#00D8FF] dark:text-[#E6F4FF] dark:shadow-[0_0_20px_rgba(0,216,255,0.15)]'
                        : 'bg-white dark:bg-[#0A1A30] text-slate-800 dark:text-slate-300 border-slate-200/80 dark:border-[#1A365D] hover:border-slate-300 dark:hover:border-cyan-400/40 hover:bg-slate-50 dark:hover:bg-[#0C2242]'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${colors.dot}`} />
                        <span className={`font-mono text-[10px] font-bold tracking-wider uppercase tabular-nums ${
                          isCurrent ? 'text-cyan-200 dark:text-[#00D8FF]' : 'text-[#004A99] dark:text-cyan-300'
                        }`}>
                          {project.missionCode}
                        </span>
                        <span className={`text-[10px] truncate ${
                          isCurrent ? 'text-white/80 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          • {project.track}
                        </span>
                      </div>

                      <h4 className="font-display text-sm font-bold truncate leading-snug">
                        {project.shortTitle}
                      </h4>

                      <p className={`text-[11px] flex items-center gap-1 truncate ${
                        isCurrent ? 'text-cyan-100 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{project.territory}</span>
                      </p>
                    </div>

                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                      isCurrent ? 'text-cyan-200 dark:text-[#00D8FF] translate-x-0.5' : 'text-slate-400 opacity-60'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUNA DIREITA (lg:col-span-8 — PALCO DE RAIO-X VIVO)   */}
          {/* ======================================================== */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="h-full rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-6 lg:p-8 shadow-xs dark:shadow-md flex flex-col justify-between transition-colors space-y-6"
              >
                
                {/* 1. CABEÇALHO DO PALCO */}
                <div className="space-y-3 pb-5 border-b border-slate-100 dark:border-white/5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Selo Oficial em Badge 3D Volumétrico */}
                      <Badge3D
                        variant="glow"
                        size="sm"
                        icon={getSealIcon(currentProject.seal)}
                      >
                        {currentProject.seal}
                      </Badge3D>

                      <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {currentProject.missionCode} • Polo {currentProject.municipality.toUpperCase()}
                      </span>
                    </div>

                    {/* Botão Interativo "Aplaudir Turma" com microanimação e Badge 3D */}
                    <div className="relative">
                      <button
                        onClick={() => handleApplause(currentProject.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-sky-200 dark:border-cyan-500/30 bg-sky-50 dark:bg-[#07162C] px-3.5 py-1.5 text-xs font-bold text-[#004A99] dark:text-[#00D8FF] hover:bg-sky-100 dark:hover:bg-[#0A2242] active:scale-[0.93] transition-all duration-150 ease-out cursor-pointer shadow-xs touch-manipulation select-none"
                        title="Enviar aplauso oficial para a turma"
                      >
                        <Badge3D size="xs" variant="solid" icon={<ThumbsUp className="w-2.5 h-2.5" />} />
                        <span>Aplaudir Turma</span>
                        <span className="font-mono font-black tabular-nums">
                          {applauseCounts[currentProject.id]}
                        </span>
                      </button>

                      {applauseAnimationId === currentProject.id && (
                        <motion.div
                          initial={{ opacity: 1, y: 0, scale: 0.8 }}
                          animate={{ opacity: 0, y: -24, scale: 1.2 }}
                          transition={{ duration: 0.8 }}
                          className="pointer-events-none absolute -top-4 right-2 inline-flex items-center gap-1 font-mono text-xs font-black text-[#004A99] dark:text-[#00D8FF]"
                        >
                          <span>+1</span>
                          <Sparkles className="w-3.5 h-3.5" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Título Grande */}
                  <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#E6F4FF] leading-snug text-balance">
                    {currentProject.title}
                  </h2>

                  {/* Subtítulo com Escola, Município e Professor Mediador */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 to-[#004A99] dark:from-cyan-400 dark:to-blue-600 flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs">
                        {currentProject.mediatorInitials}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {currentProject.mediatorName}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">({currentProject.mediatorRole})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <School className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400 shrink-0" />
                      <span>{currentProject.school} • {currentProject.municipality} ({currentProject.typology})</span>
                    </div>
                  </div>
                </div>

                {/* 2. VISUAL & PIPELINE DE EXECUÇÃO EM 3 NÓS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Fotografia Principal Emoldurada */}
                  <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-[#1A365D] group aspect-[4/3] bg-slate-900 shadow-sm">
                    <img
                      src={currentProject.image}
                      alt={currentProject.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Badge da Turma Participante */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/20">
                        {currentProject.studentCohort}
                      </span>
                    </div>
                  </div>

                  {/* Linha de Transformação Conectada (3 Etapas Visuais) */}
                  <div className="md:col-span-7 space-y-3">
                    
                    {/* Nó 01: Desafio Local */}
                    <div className="rounded-2xl border border-rose-200/80 dark:border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/15 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>01. Desafio Local (Problema Real)</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-pretty">
                        {currentProject.desafioLocal.description}
                      </p>
                    </div>

                    {/* Nó 02: Prática MEDTEC */}
                    <div className="rounded-2xl border border-sky-200/80 dark:border-cyan-500/20 bg-sky-50/40 dark:bg-cyan-950/15 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-[#004A99] dark:text-[#00D8FF]">
                        <Radio className="h-3.5 w-3.5 shrink-0" />
                        <span>02. Prática MEDTEC (Aula Síncrona + Mediação)</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-pretty">
                        {currentProject.praticaMedtec.description}
                      </p>
                    </div>

                    {/* Nó 03: Impacto Gerado com Métrica em Destaque */}
                    <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                          <span>03. Impacto Gerado (Resultado Concreto)</span>
                        </div>
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-200 tabular-nums">
                          {currentProject.impactoGerado.metric}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-pretty">
                        {currentProject.impactoGerado.description}
                      </p>
                    </div>

                  </div>

                </div>

                {/* 3. BARRA INFERIOR DE AÇÃO E REPLICAÇÃO */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  {/* Competências curriculares */}
                  <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    {currentProject.competencias.map((comp) => (
                      <span
                        key={comp}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10"
                      >
                        #{comp}
                      </span>
                    ))}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-[#1A365D] bg-slate-100 dark:bg-[#0A1A30] px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#122A4E] transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] min-h-[44px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF]"
                    >
                      <Package className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
                      <span>Ver Roteiro de Replicação</span>
                    </button>

                    <button
                      onClick={handleNextMission}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-[#004A99] dark:bg-[#00D8FF] px-4 py-2 text-xs font-bold text-white dark:text-slate-950 hover:bg-[#05549D] dark:hover:bg-cyan-300 transition-all duration-150 ease-out cursor-pointer shadow-xs touch-manipulation select-none active:scale-[0.97] min-h-[44px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF]"
                    >
                      <span>Próxima Missão</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. MODAL PASSAPORTE DE REPLICAÇÃO PEDAGÓGICA                              */}
      {/* ========================================================================= */}
      <ReplicationPassportModal
        mission={currentProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}
