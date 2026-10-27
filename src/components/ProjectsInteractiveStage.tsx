'use client';

import React, { useState, useEffect } from 'react';
import { ProjectMission } from '@/types';
import ReplicationPassportModal from './ReplicationPassportModal';
import { 
  MapPin, 
  School, 
  BookOpen,
  FileText,
  User,
  ExternalLink,
  Sparkles,
  Download
} from 'lucide-react';

const DEFAULT_TRACKS = [
  'Todas as Áreas',
  'Agroecologia & NBAZ',
  'Ciência na Amazônia',
  'Saberes Indígenas & História',
  'Tecnologia Solar & Robótica',
];

export default function ProjectsInteractiveStage() {
  const [projects, setProjects] = useState<ProjectMission[]>([]);
  const [tracks, setTracks] = useState<string[]>(DEFAULT_TRACKS);
  const [selectedTrack, setSelectedTrack] = useState<string>(DEFAULT_TRACKS[0]);
  const [selectedProject, setSelectedProject] = useState<ProjectMission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      setLoading(true);
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const items: ProjectMission[] = data.items || [];
            setProjects(items);
            if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
              setTracks(['Todas as Áreas', ...data.tracks.filter((t: string) => !t.includes('Todas'))]);
            }
          }
        }
      } catch (err) {
        console.error('Falha ao carregar projetos da API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = selectedTrack.includes('Todas')
    ? projects
    : projects.filter((p) => {
        if (selectedTrack.includes('Agroecologia')) return p.track === 'Agroecologia & NBAZ';
        if (selectedTrack.includes('Ciência')) return p.track === 'Ciência na Amazônia';
        if (selectedTrack.includes('Indígenas')) return p.track === 'Saberes Indígenas & História';
        if (selectedTrack.includes('Solar')) return p.track === 'Tecnologia Solar & Robótica';
        return p.track === selectedTrack;
      });

  const handleOpenPassport = (project: ProjectMission) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Institucional */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#004A99] dark:text-sky-400">
              SEDUC-RO • Coordenadoria de Mídias Educacionais
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Projetos Escolares e Práticas Pedagógicas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Iniciativas de pesquisa, sustentabilidade e tecnologia desenvolvidas por turmas do Ensino Médio com Mediação Tecnológica em Rondônia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132238] px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {projects.length} Projetos Catalogados
            </span>
            <span className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132238] px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              52 Municípios Atendidos
            </span>
          </div>
        </div>

        {/* Filtros de Trilhas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tracks.map((track) => {
            const isSelected = selectedTrack === track;
            return (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ease-out cursor-pointer border active:scale-[0.98] ${
                  isSelected
                    ? 'bg-[#004A99] text-white border-[#004A99] shadow-xs dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                    : 'bg-white dark:bg-[#132238] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{track}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Grade Limpa de Projetos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl bg-slate-200 dark:bg-slate-800 h-96" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-[#132238]">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400 mb-3" />
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            Nenhum projeto encontrado nesta área
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Selecione outra área temática para visualizar as práticas cadastradas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132238] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Fotografia Limpa (sem etiquetas sobrepostas nos cantos) */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Corpo do Card */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#004A99] dark:text-sky-400">
                    <span>{project.track}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">{project.municipality}</span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {project.title}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <p className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                      <School className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400 shrink-0" />
                      <span>{project.school}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{project.mediatorName} ({project.mediatorRole})</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 line-clamp-3">
                    {project.praticaMedtec.description}
                  </p>
                </div>

                {/* Ações e Tags */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.competencias.slice(0, 2).map((comp) => (
                      <span
                        key={comp}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenPassport(project)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#004A99] hover:bg-[#003875] dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 px-3.5 py-2 text-xs font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Ver Roteiro Pedagógico</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes e Replicação */}
      <ReplicationPassportModal
        mission={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
