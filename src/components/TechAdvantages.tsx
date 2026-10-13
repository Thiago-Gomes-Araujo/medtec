'use client';

import React from 'react';
import { 
  Zap, 
  Satellite, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  Leaf, 
  ArrowDown,
  MonitorPlay,
  HeartHandshake
} from 'lucide-react';

export default function TechAdvantages() {
  const advantages = [
    {
      title: 'Transmissão Ao Vivo em Tempo Real',
      desc: 'Aulas interativas geradas diretamente dos estúdios centrais de TV em Porto Velho com recursos 4K e tecnologia satelital.',
      icon: <Satellite className="w-8 h-8 text-blue-700" />,
      tag: 'Alta Definição'
    },
    {
      title: 'Professor Mediador Presencial',
      desc: 'Cada turma conta com um professor em sala para dinamizar o aprendizado, tirar dúvidas e acompanhar a evolução dos alunos.',
      icon: <Users className="w-8 h-8 text-blue-700" />,
      tag: 'Apoio Humano'
    },
    {
      title: 'Equidade e Inclusão Geográfica',
      desc: 'Educação pública de excelência nas comunidades ribeirinhas, terras indígenas, assentamentos rurais e quilombolas.',
      icon: <HeartHandshake className="w-8 h-8 text-blue-700" />,
      tag: 'Alcance 100%'
    },
    {
      title: 'Matriz BNCC + Itinerários Inovadores',
      desc: 'Formação Geral Básica completa somada a componentes como Projeto de Vida e NBAZ (Agroecologia e Zootecnia).',
      icon: <Leaf className="w-8 h-8 text-blue-700" />,
      tag: 'Sustentabilidade'
    },
    {
      title: 'Material Pedagógico Integrado',
      desc: 'Apostilas, cadernos de atividades e conteúdos digitais alinhados às tendências das TDICs e avaliações do SAEB e ENEM.',
      icon: <GraduationCap className="w-8 h-8 text-blue-700" />,
      tag: 'Foco no Futuro'
    },
    {
      title: 'Legalidade e Certificação Oficial',
      desc: 'Diploma oficial do Ensino Médio expedido pelo Governo do Estado de Rondônia e SEDUC (Lei Estadual nº 3.846/2016).',
      icon: <ShieldCheck className="w-8 h-8 text-blue-700" />,
      tag: 'Reconhecimento'
    }
  ];

  return (
    <section id="tecnologia" className="relative py-24">
      
      {/* Indicador de Rolagem Flutuante */}
      <div className="-mt-12 sm:-mt-14 mb-10 flex justify-center relative z-30">
        <a 
          href="#tecnologia" 
          className="group flex items-center justify-center relative cursor-pointer"
          aria-label="Rolar para baixo"
        >
          <span className="relative h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center">
            <span className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute h-full w-full bg-[#05549D]/40 rounded-full blur-xl animate-ping" />
            </span>
            <div className="w-12 h-12 rounded-full bg-white shadow-2xl border border-blue-100 flex items-center justify-center group-hover:scale-125 transition-transform">
              <ArrowDown className="h-6 w-6 text-blue-700 animate-bounce" />
            </div>
          </span>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-primary border border-blue-100 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">
            Pilares da Mediação Tecnológica
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-6">
            Por que o MEDTEC é um modelo <span className="gradient-text">inovador no Brasil?</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Unindo tecnologia satelital de ponta à presença calorosa de professores mediadores para garantir que nenhum jovem rondoniense fique para trás.
          </p>
        </div>

        {/* Grid de Cards com Linha Expansível no Hover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {advantages.map((item, idx) => (
            <div
              key={idx}
              className="glow-card group relative flex flex-col justify-between rounded-3xl border border-white/80 bg-white/80 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300"
            >
              <div>
                {/* Ícone Tech com fundo translúcido */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-primary transition-colors">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Linha Inferior Gradiente que expande no hover */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-sky-400 rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

