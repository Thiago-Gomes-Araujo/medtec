'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  Radio, 
  MapPin, 
  Sparkles,
  School,
  FileText,
  Lightbulb,
  Package
} from 'lucide-react';
import { ProjectMission } from '@/data/projectsData';

interface ReplicationPassportModalProps {
  mission: ProjectMission | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReplicationPassportModal({
  mission,
  isOpen,
  onClose
}: ReplicationPassportModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mission) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3500);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-2xl overflow-hidden z-10 transition-colors"
          >
            {/* Top Bar / Header */}
            <div className="relative border-b border-slate-200/90 dark:border-[#1A365D] bg-gradient-to-r from-sky-50 via-slate-50 to-blue-50/50 dark:from-[#061224] dark:via-[#091B33] dark:to-[#0C1E38] px-6 py-5 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest uppercase rounded-md px-2.5 py-0.5 bg-[#004A99]/10 dark:bg-cyan-400/10 text-[#004A99] dark:text-[#00D8FF] border border-[#004A99]/20 dark:border-cyan-400/30">
                      <Package className="h-3 w-3" />
                      <span>Passaporte de Replicação Pedagógica</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {mission.missionCode} • {mission.track}
                    </span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#E6F4FF] leading-snug text-balance">
                    {mission.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <School className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />
                      {mission.school}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />
                      {mission.municipality} • {mission.typology}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-150 ease-out cursor-pointer shrink-0 touch-manipulation select-none active:scale-[0.92] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-300"
                  aria-label="Fechar roteiro"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
              
              {/* Banner Resumo de Carga Horária e Integração */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-sky-200 dark:border-cyan-500/25 bg-sky-50/70 dark:bg-[#07162C] p-4 text-center">
                  <span className="block font-mono text-[10px] uppercase font-bold text-[#004A99] dark:text-cyan-300">
                    DURAÇÃO ESTIMADA
                  </span>
                  <span className="mt-1 block font-display text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    4 Semanas
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">
                    16 horas de atividades práticas
                  </span>
                </div>

                <div className="rounded-2xl border border-sky-200 dark:border-cyan-500/25 bg-sky-50/70 dark:bg-[#07162C] p-4 text-center">
                  <span className="block font-mono text-[10px] uppercase font-bold text-[#004A99] dark:text-cyan-300">
                    MEDIAÇÃO SÍNCRONA
                  </span>
                  <span className="mt-1 block font-display text-2xl font-black text-slate-900 dark:text-white">
                    Estúdio + Campo
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    SEDUC Porto Velho + Sala Conectada
                  </span>
                </div>

                <div className="rounded-2xl border border-sky-200 dark:border-cyan-500/25 bg-sky-50/70 dark:bg-[#07162C] p-4 text-center">
                  <span className="block font-mono text-[10px] uppercase font-bold text-[#004A99] dark:text-cyan-300">
                    COMPATIBILIDADE BNCC
                  </span>
                  <span className="mt-1 block font-display text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    100% Alinhado
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Itinerários Formativos & NBAZ
                  </span>
                </div>
              </div>

              {/* Seção 1: Lista de Materiais Necessários */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
                  <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-white">
                    1. MATERIAIS & INSUMOS NECESSÁRIOS
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mission.replicationGuide.materials.map((mat, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-slate-50/80 dark:bg-[#08182E] p-3 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#00D8FF] shrink-0 mt-0.5" />
                      <span className="leading-snug text-pretty">{mat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção 2: Cronograma de Aplicação em 4 Semanas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
                  <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-white">
                    2. CRONOGRAMA DE APLICAÇÃO (INTEGRAÇÃO ESTÚDIO & CAMPO)
                  </h4>
                </div>

                <div className="space-y-3">
                  {mission.replicationGuide.timeline.map((step) => (
                    <div
                      key={step.week}
                      className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#08182E]/90 p-4 sm:p-5 space-y-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#004A99] dark:text-[#00D8FF]">
                          {step.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 tabular-nums">
                          Fase {step.week} de 4
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                        <div className="rounded-xl p-3 bg-sky-50/50 dark:bg-[#0C2444]/40 border border-sky-100 dark:border-cyan-500/20">
                          <p className="font-mono text-[10px] uppercase font-bold text-[#004A99] dark:text-cyan-300 mb-1 flex items-center gap-1.5">
                            <Radio className="h-3 w-3" />
                            Transmissão do Estúdio (Porto Velho)
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
                            {step.studioAction}
                          </p>
                        </div>

                        <div className="rounded-xl p-3 bg-emerald-50/50 dark:bg-[#06241E]/40 border border-emerald-100 dark:border-emerald-500/20">
                          <p className="font-mono text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3" />
                            Prática Presencial Mediada (Comunidade)
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
                            {step.fieldAction}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção 3: Depoimento Oficial & Dica de Ouro de Bancada */}
              <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-[#1A180E] p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-mono text-xs uppercase font-bold text-amber-900 dark:text-amber-200">
                    DICA DE BANCADA • {mission.mediatorName} ({mission.mediatorRole})
                  </span>
                </div>
                <p className="text-xs sm:text-sm italic text-amber-950 dark:text-amber-100/90 leading-relaxed text-pretty">
                  &ldquo;{mission.replicationGuide.pedagogicalTip}&rdquo;
                </p>
              </div>

            </div>

            {/* Bottom Actions Footer */}
            <div className="border-t border-slate-200/90 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <FileText className="h-4 w-4 text-sky-600 dark:text-cyan-400" />
                <span>Documento oficial homologado pela Coordenadoria de Mídias Educacionais (SEDUC-RO)</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97]"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ease-out flex items-center justify-center gap-2 cursor-pointer shadow-sm touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                    downloadSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 hover:bg-[#05549D] dark:hover:bg-cyan-300'
                  }`}
                >
                  {downloading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Gerando PDF Estruturado...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Guia Baixado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Baixar Guia Completo em PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
