import React from 'react';
import { 
  Satellite, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  Leaf, 
  ArrowDown,
  HeartHandshake,
  Radio,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function TechAdvantages() {
  return (
    <section id="tecnologia" className="relative pt-6 pb-28 bg-[#F0F4F8] dark:bg-[#040B16] transition-colors duration-200">
      
      {/* ================= INDICADOR DE ROLAGEM FLUTUANTE NA TRANSIÇÃO ================= */}
      <div className="-mt-14 mb-16 flex justify-center relative z-20">
        <a 
          href="#tecnologia" 
          className="group flex items-center justify-center relative cursor-pointer"
          aria-label="Rolar para os pilares tecnológicos"
        >
          <span className="relative h-20 w-20 flex items-center justify-center">
            {/* Anéis luminosos de pulso */}
            <span className="absolute inset-0 rounded-full bg-cyan-400/30 blur-md animate-ping" />
            <span className="absolute inset-1 rounded-full bg-sky-500/20 blur-sm" />
            
            {/* Botão circular central */}
            <div className="relative w-12 h-12 rounded-full bg-[#05549D] dark:bg-[#040D1A] border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(0,216,255,0.4)] flex items-center justify-center group-hover:scale-115 group-hover:border-cyan-300 transition-all duration-300">
              <ArrowDown className="h-5 w-5 text-white dark:text-cyan-300 animate-bounce" />
            </div>
          </span>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= CABEÇALHO DA SEÇÃO ================= */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-500/20 text-[#05549D] dark:text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="h-3.5 w-3.5 text-[#0284C7] dark:text-cyan-400" />
            <span>PILARES DA MEDIAÇÃO TECNOLÓGICA // LEI Nº 3.846/2016</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Por que o MEDTEC é um modelo <span className="gradient-text">inovador no Brasil?</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Unindo tecnologia satelital de ponta à presença calorosa de professores mediadores para garantir que nenhum jovem rondoniense fique para trás.
          </p>
        </div>

        {/* ================= BENTO GRID MODERNO DOS PILARES ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* BENTO 1: DESTAQUE PRINCIPAL (Col Span 8) - Transmissão Satelital */}
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

            {/* Widget Interno Estilo Telemetria */}
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

            {/* Linha decorativa animada na base */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>

          {/* BENTO 2: PROFESSOR MEDIADOR (Col Span 4) */}
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

          {/* BENTO 3: EQUIDADE E INCLUSÃO GEOGRÁFICA (Col Span 4) */}
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
                Equidade & Inclusão Geográfica
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

          {/* BENTO 4: ITINERÁRIO NBAZ E AGROECOLOGIA (Col Span 8) */}
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
                Matriz BNCC + Agroecologia & Sustentabilidade Amazônica
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                O MEDTEC alia a Formação Geral Básica completa ao componente curricular inovador <strong>NBAZ (Noções Básicas de Agroecologia e Zootecnia)</strong> e Projeto de Vida, capacitando os jovens para o agronegócio familiar sustentável e preservação da biodiversidade.
              </p>
            </div>

            {/* Tags dos Componentes Curriculares */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-[#1A365D] flex flex-wrap items-center gap-2">
              {['BNCC Completa', 'Agroecologia Familiar', 'Zootecnia Sustentável', 'Projeto de Vida', 'Preparação ENEM'].map((t) => (
                <span key={t} className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  {t}
                </span>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>

          {/* BENTO 5: MATERIAL DIDÁTICO E TDICs (Col Span 6) */}
          <div className="lg:col-span-6 glow-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#0284C7] dark:hover:border-cyan-400/80 shadow-sm dark:shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/20 text-[#05549D] dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-all">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  Foco no Futuro
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors">
                Material Pedagógico Integrado & TDICs
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Apostilas impressas distribuídas gratuitamente, cadernos digitais interativos e videoaulas alinhadas às tendências das Tecnologias Digitais da Informação e Comunicação (TDICs).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1A365D] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Alinhamento SAEB / ENEM</span>
              <span className="font-semibold text-[#05549D] dark:text-cyan-300">Kits Multimídia em Sala</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>

          {/* BENTO 6: LEGALIDADE E CERTIFICAÇÃO (Col Span 6) */}
          <div className="lg:col-span-6 glow-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#0284C7] dark:hover:border-cyan-400/80 shadow-sm dark:shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-all">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  Validade Nacional
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#0284C7] dark:group-hover:text-cyan-300 transition-colors">
                Legalidade e Certificação Oficial do Estado
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Diploma oficial do Ensino Médio expedido pelo Governo do Estado de Rondônia e pela SEDUC-RO, com registro oficial no Censo Escolar/INEP e total conformidade com a Lei Estadual nº 3.846/2016.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1A365D] flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <span>Lei Estadual nº 3.846/2016</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">Diplomação Garantida</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>

        </div>

      </div>
    </section>
  );
}
