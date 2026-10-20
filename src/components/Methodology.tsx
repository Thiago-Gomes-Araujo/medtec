import React from 'react';
import { 
  Tv, 
  Satellite, 
  Users2, 
  GraduationCap, 
  ChevronDown,
  Layers
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
    <section id="como-funciona" className="relative scroll-mt-20 overflow-hidden py-24 bg-white dark:bg-[#061224] transition-colors duration-200">
      
      {/* Luzes decorativas de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/60 dark:bg-cyan-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-100/60 dark:bg-sky-900/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 bg-sky-50 dark:bg-cyan-950/60 text-[#05549D] dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/20 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">
            Passo a Passo Tecnológico
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Como funciona a dinâmica do <span className="gradient-text">MEDTEC Rondônia?</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Uma ponte viva entre a produção televisiva de alta tecnologia e o acolhimento humano na sala de aula das comunidades tradicionais e rurais.
          </p>
        </div>

        {/* Linha Horizontal e Grid de 5 Passos */}
        <div className="relative">
          
          {/* Linha de Conexão Horizontal Desktop */}
          <div className="pointer-events-none absolute left-6 right-6 top-[52%] z-0 hidden h-px bg-gradient-to-r from-transparent via-[#0284C7] dark:via-cyan-400 to-transparent lg:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-6 items-stretch relative z-10">
            {steps.map((item, idx) => (
              <div key={item.step} className="relative group h-full">
                <div className="glow-card relative flex min-h-[340px] w-full flex-col justify-start rounded-3xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#0284C7] dark:hover:border-cyan-400 shadow-sm dark:shadow-md">
                  
                  {/* Badge Numérico Flutuante */}
                  <div className="absolute -top-5 left-8 w-11 h-11 bg-gradient-to-br from-[#05549D] to-[#0284C7] dark:from-[#00D8FF] dark:to-[#0284C7] rounded-2xl flex items-center justify-center text-white dark:text-[#040B16] font-black shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>

                  {/* Ícone Circular Centralizado */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 dark:from-[#061224] dark:to-[#0C1E38] border border-slate-200/60 dark:border-[#1A365D] flex items-center justify-center mx-auto mb-4 mt-6 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>

                  {/* Textos */}
                  <div className="flex flex-col items-center text-center mt-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#0284C7] dark:group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
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

      </div>
    </section>
  );
}
