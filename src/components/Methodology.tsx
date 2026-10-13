'use client';

import React from 'react';
import { 
  Tv, 
  Satellite, 
  Users2, 
  GraduationCap, 
  CheckCircle, 
  ChevronDown,
  Layers,
  Sparkles,
  BookMarked,
  ArrowRight
} from 'lucide-react';

export default function Methodology() {
  const steps = [
    {
      step: '01',
      title: 'Produção nos Estúdios',
      desc: 'Professores especialistas elaboram e gravam aulas com recursos de mídia digital e teleprompters nos estúdios da SEDUC em Porto Velho.',
      icon: <Tv className="w-8 h-8 text-primary" />
    },
    {
      step: '02',
      title: 'Transmissão Satelital & IP',
      desc: 'O sinal chega em tempo real nas escolas através de antenas receptoras e internet veloz mesmo nos locais mais isolados de Rondônia.',
      icon: <Satellite className="w-8 h-8 text-primary" />
    },
    {
      step: '03',
      title: 'Professor Mediador',
      desc: 'Na sala de aula, o professor presencial acolhe a turma, esclarece dúvidas, dinamiza exercícios práticos e avalia o aprendizado.',
      icon: <Users2 className="w-8 h-8 text-primary" />
    },
    {
      step: '04',
      title: 'Itinerários & Agroecologia',
      desc: 'Estudantes desenvolvem projetos reais de sustentabilidade com o componente NBAZ, Projeto de Vida e trilhas da BNCC.',
      icon: <Layers className="w-8 h-8 text-primary" />
    },
    {
      step: '05',
      title: 'Conclusão & Futuro',
      desc: 'O aluno conclui o Ensino Médio com diploma regular estadual, preparado para o mercado de trabalho, agronegócio familiar e universidades.',
      icon: <GraduationCap className="w-8 h-8 text-primary" />
    }
  ];

  return (
    <section id="como-funciona" className="relative overflow-hidden py-24">
      
      {/* Luzes decorativas de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-100/60 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-primary border border-blue-100 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">
            Passo a Passo Tecnológico
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-6">
            Como funciona a dinâmica do <span className="gradient-text">MEDTEC Rondônia?</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Uma ponte viva entre a produção televisiva de alta tecnologia e o acolhimento humano na sala de aula das comunidades tradicionais e rurais.
          </p>
        </div>

        {/* Linha Horizontal e Grid de 5 Passos */}
        <div className="relative">
          
          {/* Linha de Conexão Horizontal Desktop */}
          <div className="pointer-events-none absolute left-6 right-6 top-[52%] z-0 hidden h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent lg:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-6 items-stretch relative z-10">
            {steps.map((item, idx) => (
              <div key={item.step} className="relative group h-full">
                <div className="glow-card relative flex min-h-[340px] w-full flex-col justify-start rounded-3xl border border-white/80 bg-white/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300">
                  
                  {/* Badge Numérico Flutuante */}
                  <div className="absolute -top-5 left-8 w-11 h-11 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>

                  {/* Ícone Circular Centralizado */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center mx-auto mb-4 mt-6 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>

                  {/* Textos */}
                  <div className="flex flex-col items-center text-center mt-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Seta no Mobile entre os cards */}
                {idx < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-3 text-sky-500">
                    <ChevronDown size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Quadro das Matrizes Curriculares (Portaria nº 928/2025) */}
        <div className="mt-20 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                <BookMarked size={16} />
                <span>Base Legal: Portaria SEDUC nº 928/2025 & Lei nº 3.846/2016</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Formação Geral Básica + Itinerários Formativos
              </h3>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                O programa conta com duas matrizes curriculares adaptadas, alinhadas à BNCC e às necessidades socioambientais da juventude rondoniense.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-primary text-xs font-bold border border-blue-200">
                <CheckCircle size={14} className="text-primary" />
                Matriz Regular
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
                <Sparkles size={14} className="text-sky-600" />
                Matriz Diferenciada
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-300 transition-all">
              <span className="text-[10px] font-bold text-slate-500 uppercase">BNCC</span>
              <h4 className="font-bold text-sm text-slate-900 mt-1">Linguagens & Tecnologias</h4>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-300 transition-all">
              <span className="text-[10px] font-bold text-slate-500 uppercase">BNCC</span>
              <h4 className="font-bold text-sm text-slate-900 mt-1">Matemática & Aplicações</h4>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-300 transition-all">
              <span className="text-[10px] font-bold text-sky-600 uppercase">Inovação</span>
              <h4 className="font-bold text-sm text-slate-900 mt-1">Agroecologia (NBAZ)</h4>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-300 transition-all">
              <span className="text-[10px] font-bold text-primary uppercase">Protagonismo</span>
              <h4 className="font-bold text-sm text-slate-900 mt-1">Projeto de Vida</h4>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
