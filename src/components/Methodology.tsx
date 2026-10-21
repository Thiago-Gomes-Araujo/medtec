'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Satellite, 
  Users2, 
  GraduationCap, 
  Layers,
  ChevronDown,
  Sparkles,
  MapPin,
  ArrowRight,
  School,
  CheckCircle2,
  HeartHandshake,
  Compass
} from 'lucide-react';

export default function Methodology() {
  const steps = [
    {
      step: '01',
      title: 'Produção nos Estúdios',
      desc: 'Professores especialistas elaboram e gravam aulas com recursos de mídia digital e teleprompters nos estúdios da SEDUC em Porto Velho.',
      icon: <Tv className="w-7 h-7 text-[#004A99] dark:text-[#00D8FF]" />
    },
    {
      step: '02',
      title: 'Transmissão Satelital & IP',
      desc: 'O sinal chega em tempo real nas escolas através de antenas receptoras e internet veloz mesmo nos locais mais isolados de Rondônia.',
      icon: <Satellite className="w-7 h-7 text-[#004A99] dark:text-[#00D8FF]" />
    },
    {
      step: '03',
      title: 'Professor Mediador',
      desc: 'Na sala de aula, o professor presencial acolhe a turma, esclarece dúvidas, dinamiza exercícios práticos e avalia o aprendizado.',
      icon: <Users2 className="w-7 h-7 text-[#004A99] dark:text-[#00D8FF]" />
    },
    {
      step: '04',
      title: 'Itinerários & Agroecologia',
      desc: 'Estudantes desenvolvem projetos reais de sustentabilidade com o componente NBAZ, Projeto de Vida e trilhas da BNCC.',
      icon: <Layers className="w-7 h-7 text-[#004A99] dark:text-[#00D8FF]" />
    },
    {
      step: '05',
      title: 'Conclusão & Futuro',
      desc: 'O aluno conclui o Ensino Médio com diploma regular estadual, preparado para o mercado de trabalho, agronegócio familiar e universidades.',
      icon: <GraduationCap className="w-7 h-7 text-[#004A99] dark:text-[#00D8FF]" />
    }
  ];

  const educators = [
    {
      name: 'Profa. Ana Beatriz',
      role: 'Ministrante Estúdio PVH',
      subject: 'Linguagens & Tecnologias',
      initials: 'AB',
      tag: 'Capital • Estúdio Central'
    },
    {
      name: 'Prof. Carlos Henrique',
      role: 'Mediador Guajará-Mirim',
      subject: 'Acompanhamento & Robótica',
      initials: 'CH',
      tag: 'Fronteira • Vale do Guaporé'
    },
    {
      name: 'Profa. Marta Oro Win',
      role: 'Mediadora Cacoal',
      subject: 'Saberes Indígenas & NBAZ',
      initials: 'MO',
      tag: 'Aldeias • Povos Originários'
    }
  ];

  return (
    <section id="como-funciona" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28 bg-white dark:bg-[#061224] transition-colors duration-200">
      
      {/* Luzes decorativas sutis de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/50 dark:bg-cyan-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-100/50 dark:bg-sky-900/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-20">
        
        {/* ================= 1. CABEÇALHO DA SEÇÃO ================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-cyan-950/60 text-[#004A99] dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/20 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
            <span>PASSO A PASSO TECNOLÓGICO // FLUXO INTEGRADO</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-display text-balance">
            Como funciona a dinâmica do <span className="text-[#004A99] dark:text-[#00D8FF]">MEDTEC Rondônia?</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto text-pretty">
            Uma ponte viva entre a produção televisiva de alta tecnologia e o acolhimento humano na sala de aula das comunidades tradicionais e rurais.
          </p>
        </div>

        {/* ================= 2. PIPELINE DOS 5 PASSOS COM LINHA ANIMADA ================= */}
        <div className="relative">
          
          {/* Linha tracejada horizontal com pulso luminoso no desktop */}
          <div className="pointer-events-none absolute left-10 right-10 top-[60px] z-0 hidden lg:block h-[2px]">
            {/* Linha tracejada base */}
            <div className="w-full h-full border-b border-dashed border-[#004A99]/30 dark:border-[#00D8FF]/30" />
            
            {/* Pulso luminoso animado percorrendo do Passo 01 ao Passo 05 */}
            <div className="absolute top-[-3px] left-0 h-2 w-24 bg-gradient-to-r from-transparent via-[#004A99] dark:via-[#00D8FF] to-transparent rounded-full blur-[1px] animate-[pulseLine_4s_ease-in-out_infinite]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch relative z-10">
            {steps.map((item, idx) => (
              <div key={item.step} className="relative group h-full">
                <div className="glow-card relative flex min-h-[320px] w-full flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-6 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-1.5 hover:border-[#004A99] dark:hover:border-[#00D8FF] shadow-sm hover:shadow-xl dark:shadow-md">
                  
                  <div>
                    {/* Topo: Número e Ícone */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#004A99] to-[#0284C7] dark:from-[#00D8FF] dark:to-[#0284C7] flex items-center justify-center text-white dark:text-[#040B16] font-black font-mono text-sm shadow-md group-hover:scale-110 transition-transform duration-200 ease-out tabular-nums">
                        {item.step}
                      </span>

                      <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-[#061224] border border-slate-200/60 dark:border-[#1A365D] flex items-center justify-center group-hover:bg-[#004A99]/10 dark:group-hover:bg-[#00D8FF]/10 transition-colors duration-150">
                        {item.icon}
                      </div>
                    </div>

                    {/* Textos */}
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors duration-150 font-display text-balance">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed text-pretty">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Micro rodapé */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#1A365D] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Etapa Síncrona</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ativa</span>
                  </div>

                </div>

                {/* Seta no Mobile entre os cards */}
                {idx < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-2 text-sky-500">
                    <ChevronDown size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* ================= 3. BLOCO INTEGRADO: QUEM FAZ ACONTECER NA PONTA ================= */}
        <div className="rounded-3xl bg-slate-50 dark:bg-[#0C1E38] border border-slate-200/90 dark:border-[#1A365D] p-6 sm:p-8 lg:p-10 shadow-sm dark:shadow-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Coluna da Esquerda (7 cols): Educadores em Destaque */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#004A99] dark:text-[#00D8FF] uppercase tracking-wider mb-1">
                  <Users2 className="h-4 w-4" />
                  <span>QUEM FAZ ACONTECER NA PONTA // DA CAPITAL ÀS COMUNIDADES</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-balance">
                  Corpo Docente Especialista &amp; Professores Mediadores
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 text-pretty">
                  A força do MEDTEC une os ministrantes do estúdio central de TV ao educador presencial em sala, garantindo vínculo humano e dinamização pedagógica diária.
                </p>
              </div>

              {/* 3 Mini-Perfis de Educadores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {educators.map((edu) => (
                  <div
                    key={edu.name}
                    className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-[#061224] border border-slate-200/80 dark:border-[#1A365D] hover:border-[#004A99]/50 dark:hover:border-cyan-400/50 transition-all duration-150 ease-out shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        {/* Avatar suave em azul institucional */}
                        <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-cyan-950/80 border border-sky-300 dark:border-cyan-400/40 text-[#004A99] dark:text-[#00D8FF] flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                          {edu.initials}
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#0C1E38] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 truncate max-w-[120px]">
                          {edu.tag}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                          {edu.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-[#004A99] dark:text-[#00D8FF] mt-0.5">
                          {edu.role}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {edu.subject}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna da Direita (5 cols): Atalho para o Radar Territorial */}
            <div className="lg:col-span-5 h-full">
              <div className="h-full rounded-2xl bg-gradient-to-br from-[#004A99] via-[#053D7A] to-[#0A2540] dark:from-[#061224] dark:via-[#091E3A] dark:to-[#040D1A] text-white p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-md border border-cyan-400/20">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                      <Compass className="h-3.5 w-3.5" />
                      REDE ESTADUAL CONECTADA
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold tabular-nums">
                      100% Cobertura
                    </span>
                  </div>

                  <h4 className="font-display text-lg sm:text-xl font-bold leading-tight text-balance">
                    Presente nos 52 Municípios de Rondônia
                  </h4>

                  <p className="text-xs text-slate-200 leading-relaxed text-pretty">
                    129 unidades escolares garantindo ensino regular gratuito para comunidades ribeirinhas, indígenas, quilombolas e rurais isoladas.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Indicadores rápidos */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 font-mono text-xs">
                    <div>
                      <p className="text-cyan-300 font-black text-lg tabular-nums">6.000+</p>
                      <p className="text-[10px] text-slate-300">Jovens Atendidos</p>
                    </div>
                    <div>
                      <p className="text-cyan-300 font-black text-lg tabular-nums">129 Polos</p>
                      <p className="text-[10px] text-slate-300">Salas Conectadas</p>
                    </div>
                  </div>

                  {/* Botão de Ação Direto */}
                  <Link
                    href="/mapa"
                    className="group flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-[#00D8FF] transition-all duration-150 ease-out shadow-sm cursor-pointer min-h-[44px] touch-manipulation select-none active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-300"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#004A99]" />
                      <span>Explorar Radar de Escolas Conectadas</span>
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                  </Link>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
