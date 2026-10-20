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
  Compass,
  Cpu,
  Sprout,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function TechAdvantages() {
  const [activeMatrix, setActiveMatrix] = useState<'regular' | 'diferenciada'>('regular');

  const regularComponents = [
    {
      tag: 'BNCC // LINGUAGENS',
      title: 'Linguagens & Tecnologias',
      desc: 'Língua Portuguesa, Literatura, Produção Textual, Arte e Inglês aplicados à comunicação crítica e preparação intensiva para o ENEM.',
      badge: 'Obrigatório'
    },
    {
      tag: 'BNCC // EXATAS',
      title: 'Matemática & Aplicações',
      desc: 'Álgebra, geometria espacial, estatística, raciocínio lógico e matemática financeira integrados à tomada de decisão cotidiana.',
      badge: 'Obrigatório'
    },
    {
      tag: 'BNCC // NATUREZA',
      title: 'Ciências da Natureza',
      desc: 'Física, Química e Biologia investigando ecossistemas, biomas amazônicos, equilíbrio ambiental e processos biotecnológicos.',
      badge: 'Obrigatório'
    },
    {
      tag: 'BNCC // HUMANAS',
      title: 'Ciências Humanas & Sociais',
      desc: 'História, Geografia, Sociologia e Filosofia com ênfase na identidade, formação territorial de Rondônia e cidadania participativa.',
      badge: 'Obrigatório'
    }
  ];

  const differentiatedComponents = [
    {
      tag: 'INOVAÇÃO // PORTARIA 928/2025',
      title: 'Agroecologia (NBAZ)',
      desc: 'Noções Básicas de Agroecologia e Zootecnia, manejo sustentável do solo, preservação de sementes crioulas e agricultura familiar.',
      badge: 'Exclusivo MEDTEC'
    },
    {
      tag: 'PROTAGONISMO // CIDADANIA',
      title: 'Projeto de Vida',
      desc: 'Orientação vocacional contínua, planejamento de carreira, ética, competências socioemocionais e visão de futuro no território.',
      badge: 'Empreendedorismo'
    },
    {
      tag: 'TECNOLOGIA // PRÁTICA',
      title: 'Iniciação Científica & Robótica',
      desc: 'Desenvolvimento de sensores de irrigação, automação solar com microcontroladores e biometria comunitária aplicada a rios e matas.',
      badge: 'Laboratório Vivo'
    },
    {
      tag: 'TERRITÓRIO // IDENTIDADE',
      title: 'Saberes Amazônicos & Povos',
      desc: 'Cartografia digital de territórios tradicionais, valorização das memórias orais e salvaguarda cultural de comunidades originárias.',
      badge: 'Patrimônio Regional'
    }
  ];

  const currentComponents = activeMatrix === 'regular' ? regularComponents : differentiatedComponents;

  return (
    <section id="tecnologia" className="relative scroll-mt-20 py-20 sm:py-28 bg-[#F0F4F8] dark:bg-[#040B16] transition-colors duration-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ================= 1. CABEÇALHO DA SEÇÃO ================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-500/20 text-[#05549D] dark:text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="h-3.5 w-3.5 text-[#0284C7] dark:text-cyan-400" />
            <span>PILARES DA MEDIAÇÃO TECNOLÓGICA // LEI Nº 3.846/2016</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-display">
            Por que o MEDTEC é um modelo <span className="gradient-text">inovador no Brasil?</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Unindo tecnologia satelital de ponta à presença calorosa de professores mediadores para garantir que nenhum jovem rondoniense fique para trás.
          </p>
        </div>

        {/* ================= 2. BENTO GRID DOS 4 PILARES ESTRATÉGICOS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* CARD 1: TRANSMISSÃO AO VIVO (Col Span 8) */}
          <div className="lg:col-span-8 glow-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-gradient-to-br from-white via-white to-sky-50/60 dark:from-[#0C1E38] dark:via-[#0C1E38] dark:to-[#081528] p-8 sm:p-9 transition-all duration-300 hover:-translate-y-1 hover:border-[#0284C7] dark:hover:border-cyan-400/80 shadow-sm dark:shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-cyan-500/10 border border-sky-300 dark:border-cyan-500/20 text-[#05549D] dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                  <Satellite className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-200 font-mono text-xs font-bold border border-cyan-200 dark:border-cyan-500/30">
                    <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                    Uplink 4K Ultra HD
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#061224] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1A365D]">
                    Estúdio Porto Velho
                  </span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors">
                Transmissão Ao Vivo em Tempo Real via Satélite
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Aulas dinâmicas e interativas geradas diretamente dos estúdios centrais de TV da Coordenadoria de Mídias Educacionais (SEDUC) em Porto Velho, com link satelital dedicado de alta disponibilidade para comunidades onde a internet convencional não chega.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#1A365D] flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  Latência Controlada
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>Banda C / Ku & IP Rural</span>
              </div>
              <span className="text-[#05549D] dark:text-cyan-300 font-bold">Porto Velho ⇄ 52 Municípios</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>

          {/* CARD 2: PROFESSOR MEDIADOR PRESENCIAL (Col Span 4) */}
          <div className="lg:col-span-4 glow-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#0284C7] dark:hover:border-cyan-400/80 shadow-sm dark:shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/20 text-[#05549D] dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-all">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30">
                  Apoio Humano 100%
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors">
                Professor Mediador Presencial
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Cada turma conta diariamente com um educador em sala de aula para acolher os alunos, dinamizar exercícios práticos, orientar pesquisas e tirar dúvidas em tempo real.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1A365D] text-xs font-semibold text-[#05549D] dark:text-sky-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Plantão ativo durante as transmissões</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>

          {/* CARD 3: EQUIDADE E INCLUSÃO GEOGRÁFICA (Col Span 4) */}
          <div className="lg:col-span-4 glow-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#0284C7] dark:hover:border-cyan-400/80 shadow-sm dark:shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-all">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                  Universalização
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors">
                Equidade &amp; Inclusão Geográfica
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Educação pública de excelência onde as escolas tradicionais não conseguiam chegar: aldeias indígenas, comunidades ribeirinhas, assentamentos e quilombos de Rondônia.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1A365D] font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Ribeirinhos • Indígenas • Rurais</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">100% Gratuito</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>

          {/* CARD 4: SUSTENTABILIDADE & ITINERÁRIO NBAZ (Col Span 8) */}
          <div className="lg:col-span-8 glow-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-gradient-to-br from-white via-white to-emerald-50/50 dark:from-[#0C1E38] dark:via-[#0C1E38] dark:to-[#071a28] p-8 sm:p-9 transition-all duration-300 hover:-translate-y-1 hover:border-[#0284C7] dark:hover:border-cyan-400/80 shadow-sm dark:shadow-xl">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-all">
                  <Leaf className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Itinerário NBAZ
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#061224] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1A365D]">
                    Portaria SEDUC nº 928/2025
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors">
                Matriz BNCC + Agroecologia &amp; Sustentabilidade Amazônica
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                O MEDTEC alia a Formação Geral Básica completa ao componente curricular inovador <strong>NBAZ (Noções Básicas de Agroecologia e Zootecnia)</strong> e Projeto de Vida, capacitando os jovens para o agronegócio familiar sustentável e preservação da biodiversidade.
              </p>
            </div>

            {/* Tags e Garantia de Diplomação */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-[#1A365D] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {['BNCC Completa', 'Agroecologia Familiar', 'Zootecnia Sustentável', 'Projeto de Vida'].map((t) => (
                  <span key={t} className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    {t}
                  </span>
                ))}
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Diploma Oficial SEDUC/Censo
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>

        </div>

        {/* ================= 3. BLOCO INTEGRADO: MATRIZ CURRICULAR INTERATIVA ================= */}
        <div className="rounded-3xl bg-white dark:bg-[#0C1E38] border border-slate-200/90 dark:border-[#1A365D] p-6 sm:p-10 shadow-lg dark:shadow-2xl space-y-8">
          
          {/* Header do Bloco com Alternador Funcional */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-[#1A365D]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#05549D] dark:text-[#00D8FF] uppercase tracking-wider">
                <BookOpen className="h-4 w-4" />
                <span>Base Legal: Portaria SEDUC nº 928/2025 &amp; Lei nº 3.846/2016</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
                Formação Geral Básica + Itinerários Formativos
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                Alterne entre as matrizes curriculares e visualize a integração entre as diretrizes nacionais da BNCC e a vocação socioambiental de Rondônia.
              </p>
            </div>

            {/* Alternador de Matrizes */}
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-[#061224] border border-slate-200 dark:border-[#1A365D] self-start lg:self-center shrink-0">
              <button
                type="button"
                onClick={() => setActiveMatrix('regular')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMatrix === 'regular'
                    ? 'bg-[#004A99] text-white shadow-md dark:bg-[#00D8FF] dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>Matriz Regular (BNCC)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMatrix('diferenciada')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMatrix === 'diferenciada'
                    ? 'bg-[#004A99] text-white shadow-md dark:bg-[#00D8FF] dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Matriz Diferenciada (Rondônia)</span>
              </button>
            </div>
          </div>

          {/* Sub-cards da Matriz com Transição Fluida */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMatrix}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {currentComponents.map((item) => (
                <div
                  key={item.title}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-50 dark:bg-[#061224] border border-slate-200/80 dark:border-[#1A365D] hover:border-[#004A99]/50 dark:hover:border-cyan-400/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-cyan-300/80 uppercase tracking-wider">
                        {item.tag}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white dark:bg-[#0C1E38] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1A365D]">
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Grade Curricular 2026</span>
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
