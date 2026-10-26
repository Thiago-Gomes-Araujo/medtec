'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Satellite, 
  Users, 
  Leaf, 
  HeartHandshake,
  Radio,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Check,
  ArrowLeftRight
} from 'lucide-react';

export default function TechAdvantages() {
  const [activeMatrix, setActiveMatrix] = useState<'regular' | 'diferenciada'>('regular');

  const regularComponents = [
    {
      tag: 'BNCC • Linguagens',
      title: 'Linguagens & Tecnologias',
      desc: 'Língua Portuguesa, Literatura, Produção Textual, Arte e Inglês aplicados à comunicação crítica e preparação intensiva para o ENEM.',
      badge: 'Obrigatório'
    },
    {
      tag: 'BNCC • Matemática',
      title: 'Matemática & Aplicações',
      desc: 'Álgebra, geometria espacial, estatística, raciocínio lógico e matemática financeira integrados à tomada de decisão cotidiana.',
      badge: 'Obrigatório'
    },
    {
      tag: 'BNCC • Ciências da Natureza',
      title: 'Ciências da Natureza',
      desc: 'Física, Química e Biologia investigando ecossistemas, biomas amazônicos, equilíbrio ambiental e processos biotecnológicos.',
      badge: 'Obrigatório'
    },
    {
      tag: 'BNCC • Ciências Humanas',
      title: 'Ciências Humanas & Sociais',
      desc: 'História, Geografia, Sociologia e Filosofia com ênfase na identidade, formação territorial de Rondônia e cidadania participativa.',
      badge: 'Obrigatório'
    }
  ];

  const differentiatedComponents = [
    {
      tag: 'Inovação • Portaria SEDUC 928/2025',
      title: 'Agroecologia (NBAZ)',
      desc: 'Noções Básicas de Agroecologia e Zootecnia, manejo sustentável do solo, preservação de sementes crioulas e agricultura familiar.',
      badge: 'Exclusivo MEDTEC'
    },
    {
      tag: 'Protagonismo • Projeto de Vida',
      title: 'Projeto de Vida',
      desc: 'Orientação vocacional contínua, planejamento de carreira, ética, competências socioemocionais e visão de futuro no território.',
      badge: 'Empreendedorismo'
    },
    {
      tag: 'Tecnologia • Laboratório Vivo',
      title: 'Iniciação Científica & Robótica',
      desc: 'Desenvolvimento de sensores de irrigação, automação solar com microcontroladores e biometria comunitária aplicada a rios e matas.',
      badge: 'Laboratório Vivo'
    },
    {
      tag: 'Território • Saberes Regionais',
      title: 'Saberes Amazônicos & Povos',
      desc: 'Cartografia digital de territórios tradicionais, valorização das memórias orais e salvaguarda cultural de comunidades originárias.',
      badge: 'Patrimônio Regional'
    }
  ];

  const currentComponents = activeMatrix === 'regular' ? regularComponents : differentiatedComponents;

  return (
    <section id="tecnologia" className="relative scroll-mt-20 py-20 sm:py-28 bg-[#F0F4F8] dark:bg-[#040B16] transition-colors duration-200">
      <div id="pilares" className="absolute -top-24 pointer-events-none" aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ================= 1. CABEÇALHO DA SEÇÃO ================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-100 dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-500/20 text-[#05549D] dark:text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-[#0284C7] dark:text-cyan-400" />
            <span>Pilares da Mediação Tecnológica • Lei Estadual nº 3.846/2016</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-display text-balance">
            Por que o MEDTEC é um modelo <span className="text-[#004A99] dark:text-[#00D8FF]">inovador no Brasil?</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto text-pretty">
            Unindo tecnologia satelital de ponta à presença de professores mediadores para garantir o direito à educação pública de qualidade.
          </p>
        </div>

        {/* ================= 2. BENTO GRID DOS 4 PILARES ESTRATÉGICOS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          
          {/* CARD 1: TRANSMISSÃO AO VIVO (Col Span 8) */}
          <div className="lg:col-span-8 group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4 sm:p-5 transition-colors duration-150 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-cyan-500/10 border border-sky-300 dark:border-cyan-500/20 text-[#05549D] dark:text-cyan-400 flex items-center justify-center transition-colors">
                  <Satellite className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-200 font-mono text-[11px] font-bold border border-cyan-200 dark:border-cyan-500/30">
                  <Radio className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                  Transmissão Satelital
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors duration-150">
                Transmissão Ao Vivo em Tempo Real via Satélite
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                Aulas dinâmicas geradas nos estúdios centrais de TV da SEDUC em Porto Velho, com link satelital dedicado de alta disponibilidade para comunidades remotas.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-dashed border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Latência Controlada • Banda C / Ku
              </span>
              <span className="text-[#05549D] dark:text-cyan-300 font-bold tabular-nums inline-flex items-center gap-1">
                Porto Velho <ArrowLeftRight className="w-3 h-3 text-sky-600 dark:text-cyan-300" /> 52 Municípios
              </span>
            </div>
          </div>

          {/* CARD 2: PROFESSOR MEDIADOR PRESENCIAL (Col Span 4) */}
          <div className="lg:col-span-4 group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4 sm:p-5 transition-colors duration-150 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/20 text-[#05549D] dark:text-sky-400 flex items-center justify-center transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 tabular-nums">
                  Apoio Humano 100%
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors duration-150">
                Professor Mediador Presencial
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                Cada turma conta diariamente com um educador em sala para acolher os alunos, dinamizar exercícios práticos e tirar dúvidas em tempo real.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-dashed border-slate-200 dark:border-white/10 text-[11px] font-semibold text-[#05549D] dark:text-sky-300 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Plantão ativo durante as transmissões</span>
            </div>
          </div>

          {/* CARD 3: EQUIDADE E INCLUSÃO GEOGRÁFICA (Col Span 4) */}
          <div className="lg:col-span-4 group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4 sm:p-5 transition-colors duration-150 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                  Universalização
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors duration-150">
                Equidade &amp; Inclusão Geográfica
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                Educação pública de excelência onde as escolas tradicionais não chegavam: aldeias indígenas, ribeirinhos, assentamentos e quilombos de Rondônia.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-dashed border-slate-200 dark:border-white/10 font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Ribeirinhos • Indígenas • Rurais</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold tabular-nums">100% Gratuito</span>
            </div>
          </div>

          {/* CARD 4: SUSTENTABILIDADE & ITINERÁRIO NBAZ (Col Span 8) */}
          <div className="lg:col-span-8 group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4 sm:p-5 transition-colors duration-150 shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                  <Leaf className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  Itinerário NBAZ • SEDUC
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors duration-150">
                Matriz BNCC + Agroecologia &amp; Sustentabilidade
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                O MEDTEC alia a Formação Geral Básica ao componente curricular inovador <strong>NBAZ (Agroecologia e Zootecnia)</strong> e Projeto de Vida.
              </p>
            </div>

            {/* Garantia de Diplomação Rodapé */}
            <div className="mt-5 pt-3 border-t border-dashed border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Diploma Oficial SEDUC/Censo Escolar
              </span>
              <span>Portaria SEDUC nº 928/2025</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

        </div>

        {/* ================= 3. BLOCO INTEGRADO: MATRIZ CURRICULAR INTERATIVA ================= */}
        <div className="rounded-xl bg-white dark:bg-[#0C1E38] border border-slate-200/90 dark:border-[#1A365D] p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-6">
          
          {/* Header do Bloco com Alternador Funcional */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#05549D] dark:text-[#00D8FF] uppercase tracking-wider">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Base Legal: Portaria SEDUC nº 928/2025 &amp; Lei nº 3.846/2016</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
                Formação Geral Básica + Itinerários Formativos
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                Alterne entre as matrizes curriculares e visualize a integração entre as diretrizes nacionais da BNCC e a vocação socioambiental de Rondônia.
              </p>
            </div>

            {/* Alternador de Matrizes */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#061224] border border-slate-200 dark:border-[#1A365D] self-start lg:self-center shrink-0">
              <button
                type="button"
                onClick={() => setActiveMatrix('regular')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                  activeMatrix === 'regular'
                    ? 'bg-[#004A99] text-white shadow-sm dark:bg-[#00D8FF] dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Matriz Regular (BNCC)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMatrix('diferenciada')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ease-out cursor-pointer touch-manipulation select-none active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#004A99] dark:focus-visible:ring-[#00D8FF] ${
                  activeMatrix === 'diferenciada'
                    ? 'bg-[#004A99] text-white shadow-sm dark:bg-[#00D8FF] dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Matriz Diferenciada (Rondônia)</span>
              </button>
            </div>
          </div>

          {/* Sub-cards da Matriz com Transição Fluida */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMatrix}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {currentComponents.map((item) => (
                <div
                  key={item.title}
                  className="group relative flex flex-col justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#061224] border border-slate-200/80 dark:border-[#1A365D] hover:border-[#004A99]/50 dark:hover:border-cyan-400/50 hover:shadow-sm transition-all duration-200 ease-out"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-cyan-300/80 uppercase tracking-wider truncate">
                        {item.tag}
                      </span>
                    </div>

                    <h4 className="font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors duration-150 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                    <span>Grade 2026</span>
                    <span>100% Carga Horária</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
