'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O diploma do Ensino Médio com Mediação Tecnológica é válido em todo o Brasil?',
      a: 'Sim, com total validade nacional. O MEDTEC é um programa oficial instituído pela Lei Estadual nº 3.846/2016 e segue rigorosamente as diretrizes curriculares do MEC e da BNCC. Os estudantes formados recebem o diploma regular do Ensino Médio da rede estadual de ensino de Rondônia e podem prestar o ENEM, concursos públicos e vestibulares de qualquer faculdade.'
    },
    {
      q: 'Como funcionam as aulas se não há sinal de internet tradicional na comunidade?',
      a: 'A SEDUC equipa as salas com kits completos de recepção satelital e banda larga de alta velocidade. As aulas são transmitidas ao vivo via satélite diretamente dos estúdios televisivos em Porto Velho. Além disso, há armazenamento local de segurança caso ocorra qualquer instabilidade meteorológica passageira.'
    },
    {
      q: 'Qual é o papel do Professor Mediador Presencial em sala de aula?',
      a: 'O Professor Mediador é a peça-chave humana do projeto. Ele está fisicamente presente todos os dias em sala de aula, orienta a turma antes e depois da transmissão, esclarece dúvidas, dinamiza oficinas práticas, aplica provas e atua como tutor e mentor direto de cada aluno.'
    },
    {
      q: 'Quais comunidades têm prioridade no atendimento do MEDTEC?',
      a: 'O programa é voltado especialmente para estudantes que vivem em terras indígenas, comunidades ribeirinhas (como as bacias do Rio Madeira, Guaporé e Mamoré), comunidades remanescentes de quilombos, pequenas áreas rurais e assentamentos agroecológicos distantes dos polos urbanos.'
    },
    {
      q: 'O que é o componente curricular NBAZ nos Itinerários Formativos?',
      a: 'NBAZ significa "Noções Básicas de Agroecologia e Zootecnia". É um componente inovador introduzido pela SEDUC que conecta o aprendizado escolar às práticas sustentáveis de cultivo, preservação ambiental e produção agropecuária familiar da Amazônia rondoniense.'
    },
    {
      q: 'Como os estudantes interagem com os professores nos estúdios durante a aula?',
      a: 'As salas conectadas contam com canais bidirecionais de interação. Por meio de enquetes digitais, áudio e mensagens monitoradas pelo professor mediador, os alunos das salas em qualquer município de Rondônia podem fazer perguntas ao vivo que são respondidas na hora pelos professores nos estúdios de TV.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-[#00875a] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">
            Tire suas dúvidas
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Perguntas <span className="gradient-text">Frequentes</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Entenda como a mediação tecnológica garante educação de qualidade mesmo nas regiões mais distantes de Rondônia.
          </p>
        </div>

        {/* Lista de Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'border-blue-200 bg-blue-50/40 shadow-lg shadow-blue-100/50' 
                    : 'border-gray-200 bg-white hover:border-blue-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-4">
                    <span 
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                        isOpen 
                          ? 'bg-[#00875a] text-white' 
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span 
                      className={`font-bold text-base sm:text-lg transition-colors ${
                        isOpen ? 'text-[#00875a]' : 'text-gray-900'
                      }`}
                    >
                      {faq.q}
                    </span>
                  </span>

                  <span 
                    className={`shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen 
                        ? 'bg-[#00875a] text-white rotate-180' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <ChevronDown size={20} />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 animate-in fade-in duration-200">
                    <div className="pl-13 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-blue-100/60 pt-4">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Box Inferior de Dúvida / Suporte */}
        <div className="mt-14 text-center p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00875a] to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 text-white">
            <HelpCircle size={30} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ainda tem dúvidas sobre o MEDTEC?</h3>
          <p className="text-sm text-gray-600 max-w-md mb-6">
            Nossa equipe da Coordenadoria de Mídias Educacionais da SEDUC está pronta para orientar sua escola ou polo.
          </p>
          <a
            href="#redes"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00875a] to-sky-600 text-white font-bold text-sm shadow-md hover:scale-105 transition-all"
          >
            <MessageCircle size={16} />
            <span>Falar com o Suporte da SEDUC</span>
          </a>
        </div>

      </div>
    </section>
  );
}
