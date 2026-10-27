'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  ShieldCheck,
  Printer,
  Satellite,
  Users,
  Building2,
  Activity,
  MapPin,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowDown,
  Tv,
  CheckCircle2,
  GraduationCap,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ExecutiveDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: number;
}

export default function ExecutiveDossierModal({
  isOpen,
  onClose,
  initialTab = 0
}: ExecutiveDossierModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  // Padrão oficial React para sincronizar estado derivado de prop durante render
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  // Fecha com a tecla ESC e trava o scroll do body
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 0, code: '01', label: 'Resumo Executivo', icon: Sparkles },
    { id: 1, code: '02', label: 'Arquitetura Satelital', icon: Satellite },
    { id: 2, code: '03', label: 'Alcance Territorial (52 Municípios)', icon: MapPin },
    { id: 3, code: '04', label: 'Amparo Legal & Normativas', icon: FileText }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
          {/* Backdrop Escuro com Blur Raycast/Linear */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#020611]/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Command Center Split-Screen */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-cyan-400/30 bg-[#040B16]/95 dark:bg-[#040B16]/95 text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ================= 1. HEADER TÉCNICO DO MODAL ================= */}
            <div className="flex items-center justify-between border-b border-[#1A365D] bg-[#07162C]/80 px-5 py-3.5 sm:px-6">
              {/* Esquerda: Ícone de Escudo + Código Monoespaçado */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_12px_rgba(0,216,255,0.25)]">
                  <ShieldCheck className="h-4 w-4 text-[#00D8FF]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] sm:text-xs font-semibold tracking-wider text-cyan-200">
                    DOSSIÊ INSTITUCIONAL • SEDUC-RO (PORTARIA 928/2025)
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    GOVERNO DO ESTADO DE RONDÔNIA • GESTÃO PÚBLICA
                  </p>
                </div>
              </div>

              {/* Direita: Badge Documento Oficial + Botão ESC */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981] animate-pulse" />
                  DOCUMENTO OFICIAL
                </span>

                <button
                  onClick={onClose}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-[#1A365D] bg-[#0C1E38]/80 px-2.5 py-1 font-mono text-xs text-slate-300 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-white transition-all duration-150 ease-out active:scale-[0.92] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
                  title="Fechar (ESC)"
                  aria-label="Fechar modal"
                >
                  <span className="text-[10px] text-slate-400 group-hover:text-cyan-300">ESC</span>
                  <X className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                </button>
              </div>
            </div>

            {/* ================= 2. CORPO EM 2 COLUNAS (SIDEBAR 30% + ÁREA 70%) ================= */}
            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-[440px]">
              {/* SIDEBAR ESQUERDA (Menu de Abas - 30% / 4 colunas em md) */}
              <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[#1A365D] bg-[#0C1E38]/50 p-3 sm:p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shrink-0">
                <p className="hidden md:block px-2.5 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
                  Navegação Estratégica
                </p>

                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ease-out cursor-pointer whitespace-nowrap md:whitespace-normal w-full touch-manipulation select-none active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#00D8FF] ${
                        isActive
                          ? 'border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-transparent text-white shadow-[inset_0_0_15px_rgba(0,216,255,0.12)]'
                          : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#00D8FF] shadow-[0_0_8px_#00D8FF]" />
                      )}
                      <span className={`font-mono text-[11px] font-bold tabular-nums ${isActive ? 'text-[#00D8FF]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {tab.code}
                      </span>
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className="text-xs font-semibold leading-tight">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}

                {/* Box de status na sidebar */}
                <div className="hidden md:block mt-auto pt-4 border-t border-[#1A365D]/60 px-2 font-mono text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-cyan-300 mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>SEDUC-RO • CME</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    Transmissões síncronas via satélite com acompanhamento pedagógico contínuo.
                  </p>
                </div>
              </div>

              {/* ÁREA PRINCIPAL DIREITA (Conteúdo Dinâmico - 70% / 8 colunas em md) */}
              <div className="md:col-span-8 p-5 sm:p-7 overflow-y-auto max-h-[62vh] sm:max-h-[65vh]">
                
                {/* ================= ABA 01: RESUMO EXECUTIVO ================= */}
                {activeTab === 0 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] text-cyan-300 mb-2 font-semibold">
                        SÍNTESE INSTITUCIONAL
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                        Síntese Estratégica do MEDTEC Rondônia
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        O <strong className="text-white">Ensino Médio com Mediação Tecnológica</strong> é uma política pública estruturante de Rondônia que conecta professores especialistas em estúdio central de Porto Velho a estudantes em salas remotas, garantindo equidade de oportunidades educacionais e o acompanhamento diário do professor mediador presencial.
                      </p>
                    </div>

                    {/* Bento Grid 2x2 com os 4 KPIs Oficiais */}
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300/80 font-bold mb-2.5">
                        Indicadores Consolidados (KPIs Oficiais)
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* KPI 1 */}
                        <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/40 via-[#07162C]/70 to-[#040D1A] p-3.5 transition-all hover:border-cyan-400/40">
                          <div className="flex items-center justify-between text-slate-400 mb-1.5">
                            <Users className="h-4 w-4 text-[#00D8FF]" />
                            <span className="font-mono text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              +15k FORMADOS
                            </span>
                          </div>
                          <p className="font-display text-2xl font-black text-white tabular-nums">+15.000</p>
                          <p className="text-xs font-semibold text-cyan-200 mt-0.5">Estudantes Atendidos</p>
                          <p className="text-[10px] text-slate-400 mt-1">Impacto direto no ensino público estadual.</p>
                        </div>

                        {/* KPI 2 */}
                        <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/40 via-[#07162C]/70 to-[#040D1A] p-3.5 transition-all hover:border-cyan-400/40">
                          <div className="flex items-center justify-between text-slate-400 mb-1.5">
                            <Building2 className="h-4 w-4 text-sky-400" />
                            <span className="font-mono text-[9px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded">
                              PÓLOS
                            </span>
                          </div>
                          <p className="font-display text-2xl font-black text-white tabular-nums">320+</p>
                          <p className="text-xs font-semibold text-cyan-200 mt-0.5">Unidades Escolares</p>
                          <p className="text-[10px] text-slate-400 mt-1">Salas conectadas na rede urbana e rural.</p>
                        </div>

                        {/* KPI 3 */}
                        <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/40 via-[#07162C]/70 to-[#040D1A] p-3.5 transition-all hover:border-cyan-400/40">
                          <div className="flex items-center justify-between text-slate-400 mb-1.5">
                            <Activity className="h-4 w-4 text-emerald-400" />
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                          </div>
                          <p className="font-display text-2xl font-black text-white tabular-nums">330</p>
                          <p className="text-xs font-semibold text-cyan-200 mt-0.5">Turmas Ativas</p>
                          <p className="text-[10px] text-slate-400 mt-1">Transmissão diária no horário letivo síncrono.</p>
                        </div>

                        {/* KPI 4 */}
                        <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/40 via-[#07162C]/70 to-[#040D1A] p-3.5 transition-all hover:border-cyan-400/40">
                          <div className="flex items-center justify-between text-slate-400 mb-1.5">
                            <MapPin className="h-4 w-4 text-[#00D8FF]" />
                            <span className="font-mono text-[9px] font-bold text-cyan-300 tabular-nums">100% COBERTURA</span>
                          </div>
                          <p className="font-display text-2xl font-black text-white tabular-nums">52</p>
                          <p className="text-xs font-semibold text-cyan-200 mt-0.5">Municípios Cobertos</p>
                          <p className="text-[10px] text-slate-400 mt-1">Universalização do acesso do Baixo Madeira ao Cone Sul.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= ABA 02: ARQUITETURA SATELITAL ================= */}
                {activeTab === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 font-mono text-[10px] text-sky-300 mb-2 font-semibold">
                        FLUXO TECNOLÓGICO SÍNCRONO
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                        Arquitetura de Transmissão Satelital
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Diferente de plataformas web convencionais sujeitas à instabilidade de rede terrestre, o sinal do MEDTEC opera em canal dedicado via satélite na <strong className="text-cyan-300">Banda Ku</strong>, garantindo altíssima disponibilidade em florestas densas e regiões remotas.
                      </p>
                    </div>

                    {/* Diagrama Visual em 3 Etapas */}
                    <div className="space-y-3">
                      {/* Etapa 1 */}
                      <div className="relative rounded-xl border border-cyan-500/20 bg-[#07162C]/80 p-4 transition-all hover:border-cyan-400/40">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-[#00D8FF]">
                            <Tv className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                              ETAPA 01 • ORIGEM DO CONTEÚDO
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">
                              1. Estúdio Central PVH (Produção 4K)
                            </h4>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              Estúdios digitais sediados em Porto Velho, com bancadas multimídia, lousas eletrônicas e professores especialistas ministrando aulas ao vivo com apoio de pedagogos.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Conector Seta */}
                      <div className="flex justify-center -my-1">
                        <span className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-400/80 bg-[#0C1E38] px-3 py-0.5 rounded-md border border-cyan-500/20">
                          <ArrowDown className="h-2.5 w-2.5 text-cyan-400" /> Transmissão Direta de Estúdio
                        </span>
                      </div>

                      {/* Etapa 2 */}
                      <div className="relative rounded-xl border border-sky-500/20 bg-[#07162C]/80 p-4 transition-all hover:border-sky-400/40">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10 text-sky-400">
                            <Satellite className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                              ETAPA 02 • DISTRIBUIÇÃO VIA SATÉLITE
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">
                              2. Transmissão Via Satélite Banda Ku
                            </h4>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              Sinal transmitido para satélite geoestacionário com cobertura contínua sobre a Amazônia Ocidental, garantindo estabilidade e disponibilidade técnica imune a rompimentos terrestres de fibra óptica.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Conector Seta */}
                      <div className="flex justify-center -my-1">
                        <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/80 bg-[#0C1E38] px-3 py-0.5 rounded-md border border-emerald-500/20">
                          <ArrowDown className="h-2.5 w-2.5 text-emerald-400" /> Downlink e Mediação Humana
                        </span>
                      </div>

                      {/* Etapa 3 */}
                      <div className="relative rounded-xl border border-emerald-500/20 bg-[#07162C]/80 p-4 transition-all hover:border-emerald-400/40">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                              ETAPA 03 • PONTA EDUCACIONAL
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">
                              3. Sala Conectada + Professor Mediador Presencial
                            </h4>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              Antena parabólica e receptor na escola remota com televisor UHD. O Professor Mediador presencial atua lado a lado com os alunos, tirando dúvidas em tempo real e orientando exercícios práticos.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= ABA 03: ALCANCE TERRITORIAL ================= */}
                {activeTab === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] text-cyan-300 mb-2 font-semibold">
                        MAPEAMENTO TERRITORIAL RONDONIENSE
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                        Universalização nos 52 Municípios
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        O MEDTEC elimina a barreira do isolamento geográfico na Amazônia, alcançando comunidades que historicamente dependiam de deslocamentos fluviais ou terrestres de dias para ter acesso ao Ensino Médio.
                      </p>
                    </div>

                    {/* Destaques de Comunidades Atendidas */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-[#07162C]/70 p-3.5">
                        <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs mb-1">
                          <span className="h-2 w-2 rounded-full bg-cyan-400" />
                          Comunidades Ribeirinhas
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Atendimento contínuo ao longo das calhas dos rios Madeira, Guaporé e Mamoré (como Nazaré, Calama, São Carlos e comunidades extrativistas).
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#07162C]/70 p-3.5">
                        <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs mb-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Povos Indígenas
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Pólos estruturados com materiais adaptados respeitando as etnias Paiter Suruí, Karitiana, Arara e demais povos originários de Rondônia.
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#07162C]/70 p-3.5">
                        <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs mb-1">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          Comunidades Quilombolas
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Garantia do direito pleno à educação formal nas comunidades históricas de Pedras Negras, Jesus, Santo Antônio e distritos rurais.
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#07162C]/70 p-3.5">
                        <div className="flex items-center gap-2 text-sky-300 font-semibold text-xs mb-1">
                          <span className="h-2 w-2 rounded-full bg-sky-400" />
                          Assentamentos e Linhas Rurais
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Jovens agricultores e moradores do campo concluem o Ensino Médio em sua própria localidade sem abandonar as atividades familiares.
                        </p>
                      </div>
                    </div>

                    {/* Botão de mapa de escolas */}
                    <div className="pt-2">
                      <Link
                        href="/mapa"
                        onClick={onClose}
                        className="group inline-flex items-center gap-2 rounded-lg bg-[#004A99] dark:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white dark:text-slate-950 shadow-sm transition-all hover:opacity-90 active:scale-[0.97] touch-manipulation select-none"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Abrir Mapa de Escolas</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* ================= ABA 04: AMPARO LEGAL & NORMATIVAS ================= */}
                {activeTab === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] text-cyan-300 mb-2 font-semibold">
                        SEGURANÇA JURÍDICA E MARCO LEGAL
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                        Amparo Legal e Normativas Oficiais
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        O MEDTEC opera sob estrito arcabouço normativo estadual e nacional, com homologação pelo Conselho Estadual de Educação de Rondônia (CEE-RO) e pleno alinhamento à LDB.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {/* Ficha 1 */}
                      <div className="rounded-xl border border-cyan-500/30 bg-[#07162C]/80 p-4">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-cyan-300">
                            LEI ESTADUAL Nº 3.846/2016
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            VIGENTE
                          </span>
                        </div>
                        <p className="text-xs text-white font-semibold">
                          Criação do Ensino Médio com Mediação Tecnológica em Rondônia
                        </p>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          Institui oficialmente a Mediação Tecnológica como modalidade da rede estadual para garantir a oferta de Ensino Médio em localidades desprovidas de infraestrutura docente tradicional.
                        </p>
                      </div>

                      {/* Ficha 2 */}
                      <div className="rounded-xl border border-sky-500/30 bg-[#07162C]/80 p-4">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-sky-300">
                            PORTARIA SEDUC Nº 928/2025
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            DIRETRIZ PEDAGÓGICA
                          </span>
                        </div>
                        <p className="text-xs text-white font-semibold">
                          Normas de Funcionamento, Atribuições e Dupla Docência
                        </p>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          Regulamenta o regime de transmissão síncrona dos estúdios centrais, a carga horária interativa e as atribuições conjuntas entre professores ministrantes e mediadores.
                        </p>
                      </div>

                      {/* Ficha 3 */}
                      <div className="rounded-xl border border-white/10 bg-[#07162C]/80 p-4">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-slate-200">
                            BNCC & ITINERÁRIOS FORMATIVOS (NBAZ)
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            MEC / CNE
                          </span>
                        </div>
                        <p className="text-xs text-white font-semibold">
                          Novo Ensino Médio Adaptado à Realidade Amazônica
                        </p>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          Matriz curricular estruturada com ênfase em Linguagens, Matemática, Ciências Humanas e da Natureza, integrando eletivas de sustentabilidade, agroecologia e tecnologia regional.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ================= 3. FOOTER DE AÇÃO DO MODAL ================= */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-dashed border-[#1A365D] bg-[#07162C]/90 px-5 py-3.5 sm:px-6">
              {/* Status à esquerda */}
              <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-slate-400 text-center sm:text-left">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>ATUALIZADO EM OUTUBRO/2026 • COORDENADORIA DE MÍDIAS EDUCACIONAIS</span>
              </div>

              {/* Botões à direita */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1A365D] bg-[#0C1E38]/80 px-3.5 py-2 font-mono text-xs font-semibold text-slate-200 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-white transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-300 cursor-pointer whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-300" />
                  <span>BAIXAR DOSSIÊ EM PDF</span>
                </button>

                <Link
                  href="/transparencia"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(0,216,255,0.3)] hover:brightness-110 transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-300 cursor-pointer whitespace-nowrap"
                >
                  <span>ACESSAR TRANSPARÊNCIA</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
