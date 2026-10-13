'use client';

import React from 'react';
import {
  X,
  CheckCircle2,
  Award,
  Satellite,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  GraduationCap,
  Sparkles,
  Printer
} from 'lucide-react';

interface PresentationPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PresentationPitchModal({ isOpen, onClose }: PresentationPitchModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Top Header */}
        <div className="flex items-center gap-2.5 text-xs font-semibold text-sky-800 bg-sky-50 rounded-full px-3 py-1 w-fit border border-sky-200">
          <Sparkles className="h-3.5 w-3.5 text-sky-600" />
          Dossiê Executivo de Apresentação & Aprovação Governamental
        </div>

        <div className="mt-3">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            MEDTEC em Foco: Mediação Tecnológica em Rondônia
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
            Síntese estratégica para homologação e aprovação institucional. Projeto estruturante da SEDUC-RO que democratiza o Ensino Médio de excelência em todos os 52 municípios rondonienses.
          </p>
        </div>

        {/* Key Decision Pillars */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Pillar 1 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Satellite className="h-4 w-4" />
              1. Eficiência da Arquitetura Tecnológica
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Transmissão centralizada a partir de estúdios digitais em Porto Velho com recepção via satélite de banda Ku. Reduz custos de deslocamento docente garantindo a mesma matriz curricular e professores especialistas para 129 unidades escolares.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-sky-700 font-semibold text-sm">
              <TrendingUp className="h-4 w-4" />
              2. Indicadores Educacionais Superiores
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Taxa de aprovação consolidada de <strong>87,4%</strong> e abandono contido em apenas <strong>3,1%</strong>. Alunos com medalhas na OBMEP, projetos na FEBRACE e aprovação direta em Medicina e Engenharias públicas.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <GraduationCap className="h-4 w-4" />
              3. O Modelo da Dupla Docência
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Não se trata de EAD isolado: o professor <em>Ministrante</em> conduz a teoria ao vivo e o professor <em>Mediador</em> presencial atua lado a lado com os estudantes na sala, sanando dúvidas e promovendo acolhimento humano.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
              <FileCheck className="h-4 w-4" />
              4. Rigor Legal e Transparência Pública
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Base fundada na Lei Estadual nº 3.846/2016. Todos os contratos de satélite e kits registrados no PNCP e Portal da Transparência RO. Uso de imagem de estudantes sob termos estritos de conformidade LGPD e ECA.
            </p>
          </div>
        </div>

        {/* Vital Metrics Comparison */}
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-display font-semibold text-primary text-sm mb-3">
            Impacto Mensurável no Estado de Rondônia
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
              <p className="font-display text-xl font-bold text-primary">6.000+</p>
              <p className="text-[11px] text-slate-500">Jovens Atendidos</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
              <p className="font-display text-xl font-bold text-sky-600">52 / 52</p>
              <p className="text-[11px] text-slate-500">Municípios (100%)</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
              <p className="font-display text-xl font-bold text-primary">129</p>
              <p className="text-[11px] text-slate-500">Unidades Escolares</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
              <p className="font-display text-xl font-bold text-sky-600">87,4%</p>
              <p className="text-[11px] text-slate-500">Taxa de Sucesso</p>
            </div>
          </div>
        </div>

        {/* Conclusion & Signoff */}
        <div className="mt-6 rounded-xl bg-slate-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-sky-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-sm">Parecer Técnico: Favorável à Aprovação</p>
              <p className="text-slate-300">Viabilidade comprovada, metas do Plano Estadual de Educação (PEE) atendidas com excelência.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir Dossiê
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition-colors"
            >
              Concluir Revisão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
