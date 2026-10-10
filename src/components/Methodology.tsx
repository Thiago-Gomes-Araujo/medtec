import React from 'react';
import { 
  Tv, 
  Satellite, 
  Users2, 
  GraduationCap, 
  Layers, 
  Sparkles, 
  BookMarked,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function Methodology() {
  const steps = [
    {
      step: '01',
      title: 'Estúdios Televisivos da SEDUC',
      desc: 'Professores especialistas elaboram aulas com recursos audiovisuais modernos e transmitem ao vivo direto de Porto Velho.',
      icon: <Tv className="text-emerald-600" size={24} />,
      badge: 'Porto Velho'
    },
    {
      step: '02',
      title: 'Transmissão Satelital & IP',
      desc: 'O sinal chega instantaneamente a escolas estaduais e municipais em todos os 52 municípios de Rondônia.',
      icon: <Satellite className="text-teal-600" size={24} />,
      badge: 'Tempo Real'
    },
    {
      step: '03',
      title: 'Professor Mediador Presencial',
      desc: 'Um professor capacitado acompanha a turma na sala de aula, dinamiza discussões, orienta atividades e esclarece dúvidas.',
      icon: <Users2 className="text-amber-600" size={24} />,
      badge: 'Na Comunidade'
    },
    {
      step: '04',
      title: 'Aprendizagem Significativa',
      desc: 'Formação alinhada à BNCC com foco no protagonismo juvenil, resolução de problemas e desenvolvimento regional sustentável.',
      icon: <GraduationCap className="text-blue-600" size={24} />,
      badge: 'Futuro & Cidadania'
    }
  ];

  const subjects = [
    { name: 'Linguagens e suas Tecnologias', type: 'Formação Básica' },
    { name: 'Matemática e suas Tecnologias', type: 'Formação Básica' },
    { name: 'Ciências da Natureza', type: 'Formação Básica' },
    { name: 'Ciências Humanas e Sociais', type: 'Formação Básica' },
    { name: 'Projeto de Vida', type: 'Itinerário Formativo' },
    { name: 'Agroecologia e Zootecnia (NBAZ)', type: 'Itinerário Formativo' },
    { name: 'Trilhas de Aprofundamento', type: 'Itinerário Formativo' },
    { name: 'Eletivas & Pós-Médio', type: 'Itinerário Formativo' },
  ];

  return (
    <section id="metodologia" className="py-20 bg-slate-50 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Layers size={14} className="text-teal-600" />
            <span>Engrenagem Pedagógica Inovadora</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Como Funciona a Mediação Tecnológica?
          </h2>
          
          <p className="text-base text-slate-600 leading-relaxed">
            Uma ponte digital e humana entre os estúdios de produção e as salas de aula em comunidades tradicionais, unindo o melhor da tecnologia à proximidade pedagógica.
          </p>
        </div>

        {/* 4 Etapas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((s) => (
            <div 
              key={s.step}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    {s.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-200 font-mono">
                    {s.step}
                  </span>
                </div>
                
                <div className="inline-block px-2 py-0.5 mb-2 rounded bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                  {s.badge}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2">
                  {s.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Matrizes Curriculares & Portaria nº 928/2025 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                <BookMarked size={16} />
                <span>Portaria SEDUC nº 928 de 20 de janeiro de 2025</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Estrutura das Matrizes Curriculares
              </h3>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                O MEDTEC/RO oferece aos estudantes uma formação integral combinando a Base Nacional Comum Curricular aos novos Itinerários Formativos vocacionados para Rondônia.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <CheckCircle size={14} className="text-emerald-600" />
                Matriz Regular
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                <Sparkles size={14} className="text-amber-600" />
                Matriz Diferenciada
              </span>
            </div>
          </div>

          {/* Grid de Componentes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            {subjects.map((sub, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {sub.type}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">
                  {sub.name}
                </h4>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

