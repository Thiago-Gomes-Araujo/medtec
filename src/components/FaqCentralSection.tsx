'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { sanitizeSearchInput } from '@/lib/security';
import {
  Search,
  X,
  Radio,
  Clock,
  GraduationCap,
  Award,
  ArrowUpRight,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  HelpCircle,
  Users,
  Globe,
  Building2
} from 'lucide-react';
import Badge3D from '@/components/Badge3D';
import { motion, AnimatePresence } from 'framer-motion';

import { FaqItem, FaqCategory, FaqPersona } from '@/types';
export type { FaqItem, FaqCategory, FaqPersona };

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    index: '01',
    question: 'O que é a Mediação Tecnológica (MEDTEC) da SEDUC Rondônia?',
    category: 'Metodologia & Aulas ao Vivo',
    personas: ['estudantes', 'mediadores', 'gestores'],
    answer:
      'A Mediação Tecnológica (MEDTEC) é a política pública estruturante do Governo de Rondônia (SEDUC) que democratiza o Ensino Médio em áreas remotas da Amazônia. Professores ministrantes especialistas nos estúdios da Coordenadoria de Mídias Educacionais em Porto Velho produzem e transmitem aulas diárias ao vivo via satélite em alta definição. Em cada sala de aula conectada nas comunidades ribeirinhas, indígenas, quilombolas e assentamentos rurais, um professor mediador presencial acompanha os estudantes, orientando atividades práticas, esclarecendo dúvidas e coordenando projetos pedagógicos locais.',
    actionLink: {
      label: 'CONHECER A TECNOLOGIA E COMO FUNCIONA',
      href: '/#tecnologia',
    },
    tags: ['MEDTEC', 'Aulas ao Vivo', 'Estúdios', 'Sinal Ativo', 'Rondônia'],
  },
  {
    id: 'faq-2',
    index: '02',
    question: 'Qual a diferença entre o Professor Ministrante e o Professor Mediador?',
    category: 'Metodologia & Aulas ao Vivo',
    personas: ['mediadores', 'estudantes'],
    answer:
      'A dinâmica pedagógica do MEDTEC baseia-se na docência compartilhada: o Professor Ministrante atua a partir dos estúdios televisivos centrais da SEDUC na capital Porto Velho, sendo responsável pelo planejamento didático estadual, elaboração de roteiros de aula, recursos audiovisuais e transmissão ao vivo dos conteúdos da BNCC. Já o Professor Mediador atua presencialmente dentro da sala de aula no interior, sendo a referência pedagógica física diária: acolhe a turma, faz a chamada, aplica avaliações formativas, dinamiza oficinas práticas, realiza plantões de dúvidas e acompanha a trajetória individual de cada estudante.',
    actionLink: {
      label: 'CONHECER O CORPO DOCENTE MEDTEC',
      href: '/professores',
    },
    tags: ['Professor Mediador', 'Professor Ministrante', 'Docência', 'Pedagógico'],
  },
  {
    id: 'faq-3',
    index: '03',
    question: 'Como funciona a internet e o sinal de TV nas comunidades isoladas?',
    category: 'Infraestrutura & Satélite',
    personas: ['estudantes', 'gestores'],
    answer:
      'Para vencer os desafios geográficos dos rios e florestas de Rondônia, a SEDUC implementou um sistema robusto de conectividade via satélite operando na Banda Ku de alta disponibilidade. Cada unidade escolar recebe antena receptora parabólica profissional, receptor digital síncrono e Smart TV interativa de 65 polegadas. Mesmo em locais sem cobertura de telefonia móvel ou fibra óptica terrestre, a recepção opera com elevada taxa de sincronismo técnico e disponibilidade contínua. Há ainda nobreaks dedicados e redundância para garantir que as aulas ocorram sem interrupções.',
    actionLink: {
      label: 'VER DETALHES DE INFRAESTRUTURA',
      href: '/noticias',
    },
    tags: ['Antena Banda Ku', 'Satélite', 'Conectividade', 'Smart TV', 'Infraestrutura'],
  },
  {
    id: 'faq-4',
    index: '04',
    question: 'Como os alunos tiram dúvidas durante a transmissão ao vivo?',
    category: 'Metodologia & Aulas ao Vivo',
    personas: ['estudantes', 'mediadores'],
    answer:
      'A comunicação não é passiva: as salas contam com canais bidirecionais de telemetria e interatividade síncrona. Durante as transmissões matutinas, os estudantes elaboram perguntas que o professor mediador encaminha em tempo real ao estúdio central via chat pedagógico dedicado e aplicativo da SEDUC. O professor ministrante no estúdio visualiza as indagações no teleprompter e as responde ao vivo no ar para todas as turmas do estado, promovendo uma rica troca de experiências entre jovens de diferentes municípios.',
    actionLink: {
      label: 'VER TRANSMISSÕES E HORÁRIOS AO VIVO',
      href: '/ao-vivo',
    },
    tags: ['Interatividade', 'Dúvidas ao Vivo', 'Chat Pedagógico', 'Teleprompter'],
  },
  {
    id: 'faq-5',
    index: '05',
    question: 'Onde os alunos e mediadores acessam os materiais didáticos e apostilas em PDF?',
    category: 'Metodologia & Aulas ao Vivo',
    personas: ['mediadores', 'estudantes'],
    answer:
      'Todos os materiais curriculares, apostilas didáticas, guias de estudos e roteiros de atividades em PDF são disponibilizados antecipadamente na plataforma do MEDTEC, no Painel Gestor e no Mural de Avisos da SEDUC. Isso inclui tanto os componentes da Formação Geral Básica (Matemática, Linguagens, Humanas e Natureza) quanto os Itinerários Formativos profissionalizantes regionais, como o componente NBAZ (Noções Básicas de Agroecologia e Zootecnia).',
    actionLink: {
      label: 'ACESSAR MURAL DE AVISOS E DOCUMENTOS',
      href: '/avisos',
    },
    tags: ['Material em PDF', 'Apostilas', 'NBAZ', 'Agroecologia', 'Mural'],
  },
  {
    id: 'faq-6',
    index: '06',
    question: 'Quais localidades e municípios de Rondônia são atendidos pelo programa?',
    category: 'Comunidades & Matrículas',
    personas: ['estudantes', 'gestores'],
    answer:
      'O MEDTEC possui cobertura homologada em 100% dos 52 municípios de Rondônia, alcançando mais de 320 unidades e extensões escolares, 330 turmas síncronas e mais de 6.000 estudantes ativos. Entre as localidades emblemáticas atendidas estão o Baixo Madeira (distritos fluviais de Nazaré, Calama e São Carlos), comunidades quilombolas do Vale do Guaporé (como Pedras Negras), aldeias indígenas de Cacoal e Ji-Paraná (Paiter Suruí e Arara), e assentamentos rurais em Ariquemes e Vilhena.',
    actionLink: {
      label: 'EXPLORAR MAPA DE ESCOLAS CONECTADAS',
      href: '/mapa',
    },
    tags: ['52 Municípios', 'Baixo Madeira', 'Comunidades', 'Ribeirinhos', 'Indígenas'],
  },
  {
    id: 'faq-7',
    index: '07',
    question: 'Qual a base legal que regulamenta o ensino pelo MEDTEC em Rondônia?',
    category: 'Legislação & Diretrizes',
    personas: ['gestores'],
    answer:
      'O programa é amparado pela Lei Estadual nº 3.846/2016 e regulamentado pela Portaria SEDUC nº 928/2025 e pareceres normativos do Conselho Estadual de Educação de Rondônia (CEE-RO). O modelo atende estritamente à Lei de Diretrizes e Bases da Educação Nacional (LDB nº 9.394/1996) e às diretrizes da Base Nacional Comum Curricular (BNCC). O diploma expedido tem exata equivalência e validade legal nacional com qualquer escola regular pública ou privada do país.',
    actionLink: {
      label: 'CONSULTAR BASE LEGAL NA TRANSPARÊNCIA',
      href: '/transparencia',
    },
    tags: ['Lei 3.846/2016', 'Legislação', 'Diploma', 'BNCC', 'MEC', 'CEE-RO'],
  },
  {
    id: 'faq-8',
    index: '08',
    question: 'O que a escola deve fazer em caso de instabilidade climática ou queda do sinal satelital?',
    category: 'Infraestrutura & Satélite',
    personas: ['mediadores', 'gestores'],
    answer:
      'A SEDUC adota um protocolo operacional de contingência padrão em todas as salas: caso fortes tempestades ou intempéries amazônicas interfiram momentaneamente no sinal da Banda Ku, o professor mediador ativa o banco de conteúdos armazenados localmente e aplica o roteiro de aprendizagem impresso. Simultaneamente, o mediador comunica o Núcleo de Suporte Tecnológico da SEDUC via canal de atendimento ou rádio. Assim que a estabilidade é restabelecida, os dados de presença e frequência são ressincronizados.',
    actionLink: {
      label: 'ACESSAR CANAIS DE SUPORTE',
      href: '/redes',
    },
    tags: ['Contingência', 'Queda de Sinal', 'Suporte Técnico', 'Protocolo'],
  },
  {
    id: 'faq-9',
    index: '09',
    question: 'Como solicitar a abertura de uma turma do MEDTEC em uma nova localidade rural ou ribeirinha?',
    category: 'Comunidades & Matrículas',
    personas: ['gestores', 'estudantes'],
    answer:
      'A solicitação de implantação de uma nova extensão ou turma de Mediação Tecnológica deve ser encaminhada pela liderança comunitária ou associação local à Coordenadoria Regional de Educação (CRE) responsável pelo município. A equipe técnica da SEDUC realiza então uma visita de viabilidade geográfica e vistoria estrutural do espaço escolar, com levantamento de demanda mínima de jovens em idade escolar para a instalação do kit satelital.',
    actionLink: {
      label: 'VER POLOS REGIONAIS NO MAPA',
      href: '/comunidades',
    },
    tags: ['Nova Turma', 'Matrículas', 'CRE', 'Abertura de Sala', 'Comunidade'],
  },
  {
    id: 'faq-10',
    index: '10',
    question: 'Os estudantes do MEDTEC participam do ENEM, vestibulares e feiras científicas?',
    category: 'Comunidades & Matrículas',
    personas: ['estudantes'],
    answer:
      'Sim, com histórico de expressivo destaque acadêmico! Os estudantes do MEDTEC contam com o cronograma especial "Aulões Reta Final ENEM" transmitidos aos sábados com foco nas matrizes do INEP, além de simulados digitais e orientação vocacional. Os alunos também inscrevem e apresentam projetos inovadores na Feira Cultural e Científica Estadual do MEDTEC e concorrem a vagas nas principais universidades públicas do país (UNIR, IFRO, UFAM) pelo SISU e PROUNI.',
    actionLink: {
      label: 'VER CONQUISTAS DOS ALUNOS',
      href: '/alunos',
    },
    tags: ['Certificação ENEM', 'Vestibular', 'SISU', 'Feira Científica', 'Juventude'],
  },
];

const CATEGORIES: { label: FaqCategory }[] = [
  { label: 'Todas as Dúvidas' },
  { label: 'Metodologia & Aulas ao Vivo' },
  { label: 'Infraestrutura & Satélite' },
  { label: 'Comunidades & Matrículas' },
  { label: 'Legislação & Diretrizes' },
];

interface FaqCentralSectionProps {
  initialFaqs?: FaqItem[];
}

export default function FaqCentralSection({ initialFaqs }: FaqCentralSectionProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>(
    initialFaqs && initialFaqs.length > 0 ? initialFaqs : FAQ_DATA
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<FaqPersona>('todos');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('Todas as Dúvidas');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'sim' | 'nao'>>({});

  useEffect(() => {
    if (initialFaqs && initialFaqs.length > 0) {
      return;
    }
    let isMounted = true;
    fetch('/api/faqs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.items && isMounted && data.items.length > 0) {
          setFaqs(data.items);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [initialFaqs]);

  // Atalho de teclado ESC para limpar a busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtro de persona e busca
  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      // Filtro de persona
      const matchPersona =
        selectedPersona === 'todos' || item.personas.includes(selectedPersona);

      // Filtro de categoria
      const matchCategory =
        selectedCategory === 'Todas as Dúvidas' || item.category === selectedCategory;

      // Filtro de texto
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term) ||
        item.tags.some((t) => t.toLowerCase().includes(term));

      return matchPersona && matchCategory && matchSearch;
    });
  }, [faqs, selectedPersona, selectedCategory, searchTerm]);

  // Contagem dinâmica por categoria respeitando persona e busca
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Todas as Dúvidas': faqs.filter(
        (item) => selectedPersona === 'todos' || item.personas.includes(selectedPersona)
      ).length,
    };

    CATEGORIES.forEach((cat) => {
      if (cat.label === 'Todas as Dúvidas') return;
      const count = faqs.filter((item) => {
        const matchPersona =
          selectedPersona === 'todos' || item.personas.includes(selectedPersona);
        return matchPersona && item.category === cat.label;
      }).length;
      counts[cat.label] = count;
    });

    return counts;
  }, [faqs, selectedPersona]);

  const handleFeedback = (faqId: string, tipo: 'sim' | 'nao') => {
    setFeedbackGiven((prev) => ({ ...prev, [faqId]: tipo }));
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag.replace('#', ''));
  };

  return (
    <div className="relative w-full bg-[#F8FAFC] dark:bg-[#0B1528] text-slate-800 dark:text-slate-100 transition-colors">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-10">

        {/* BARRA DE BUSCA INSTITUCIONAL */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:p-3 shadow-xs space-y-3">
          <div className="relative flex items-center rounded-lg border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 sm:px-6 py-3.5 transition-colors focus-within:border-[#004A99] dark:focus-within:border-sky-500">
            <Search className="h-5 w-5 text-[#004A99] dark:text-sky-400 shrink-0 mr-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
              maxLength={100}
              placeholder="Digite sua dúvida, componente curricular ou palavra-chave..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="ml-2 inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <span>Limpar</span>
                <X className="h-3 w-3" />
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">ESC</kbd>
                <span>para limpar</span>
              </span>
            )}
          </div>

          {/* Tags de Pesquisa Rápida */}
          <div className="flex flex-wrap items-center gap-2 px-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Sugestões:
            </span>
            {[
              'Antena Banda Ku',
              'Professor Mediador',
              'Certificação ENEM',
              'Horários das Aulas',
              'Material Didático',
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:border-[#004A99] dark:hover:border-sky-500 hover:text-[#004A99] dark:hover:text-sky-300 transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 2. CARDS DE PRINCIPAIS DÚVIDAS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#004A99] dark:text-sky-400" />
            <h2 className="text-xs uppercase tracking-wider text-[#004A99] dark:text-sky-400 font-semibold">
              Principais Perguntas e Respostas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 01: Horários */}
            <div className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-[#004A99] dark:hover:border-sky-500 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#004A99] dark:text-sky-400">
                    Turno Matutino
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[#004A99] dark:text-sky-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition-colors">
                  Horários de Transmissão
                </h3>

                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  As aulas ao vivo iniciam pontualmente às <strong>07h30</strong> (turno matutino), transmitidas diretamente dos estúdios da SEDUC em Porto Velho.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Transmissão Homologada</span>
              </div>
            </div>

            {/* Card 02: Mediador */}
            <div className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-[#004A99] dark:hover:border-sky-500 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#004A99] dark:text-sky-400">
                    Presencial Diário
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[#004A99] dark:text-sky-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition-colors">
                  Papel do Mediador
                </h3>

                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Toda sala conectada conta com um <strong>professor mediador presencial</strong> para apoiar os alunos diariamente nas atividades, oficinas práticas e dúvidas.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1.5 font-medium">
                <Users className="h-3.5 w-3.5" />
                <span>Docência Compartilhada Estado-Escola</span>
              </div>
            </div>

            {/* Card 03: Validade */}
            <div className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-[#004A99] dark:hover:border-sky-500 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Reconhecimento Oficial
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                    <Award className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition-colors">
                  Validade e Certificação
                </h3>

                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  O Ensino Médio pelo MEDTEC possui exatamente a <strong>mesma validade legal e certificação oficial</strong> da rede estadual regular (Lei Estadual 3.846/2016).
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Acesso pleno ao ENEM e Ensino Superior</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* 3. LAYOUT SPLIT-SCREEN (12 COLUNAS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUNA ESQUERDA (4 COLS: PERSONAS E ÍNDICE) */}
          <aside className="lg:col-span-4 sticky top-28 space-y-6">
            
            {/* Bloco 1: Seletor de Perfil */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Público Alvo
                </span>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: 'todos', label: 'Todos os Públicos', icon: <Globe className="w-3.5 h-3.5" /> },
                  { id: 'estudantes', label: 'Estudantes & Famílias', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                  { id: 'mediadores', label: 'Professores Mediadores', icon: <Users className="w-3.5 h-3.5" /> },
                  { id: 'gestores', label: 'Gestores & Institucional', icon: <Building2 className="w-3.5 h-3.5" /> },
                ].map((item) => {
                  const isSelected = selectedPersona === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPersona(item.id as FaqPersona)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border border-[#004A99] dark:border-sky-500 bg-sky-50 dark:bg-slate-800 text-[#004A99] dark:text-sky-300 font-semibold shadow-xs'
                          : 'border border-transparent bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <Badge3D size="xs" variant={isSelected ? 'solid' : 'subtle'} icon={item.icon} />
                        <span className="truncate">{item.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloco 2: Índice de Categorias */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Categorias
                </span>
                <span className="text-xs text-[#004A99] dark:text-sky-400 font-semibold">
                  {filteredFaqs.length} itens
                </span>
              </div>

              <div className="space-y-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.label;
                  const count = categoryCounts[cat.label] || 0;

                  return (
                    <button
                      key={cat.label}
                      onClick={() => setSelectedCategory(cat.label)}
                      className={`w-full text-left rounded-lg px-3.5 py-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border border-[#004A99] dark:border-sky-500 bg-sky-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                          : 'border border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.label}</span>
                      <span
                        className={`text-xs font-semibold shrink-0 ${
                          isSelected ? 'text-[#004A99] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suporte */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Radio className="h-4 w-4" />
                <span>Atendimento Pedagógico e Técnico</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Suporte ativo durante todo o turno letivo matutino das escolas.
              </p>
            </div>

          </aside>

          {/* COLUNA DIREITA (8 COLS: ACORDEÕES) */}
          <main className="lg:col-span-8 space-y-4">
            
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Respostas: {selectedCategory} ({filteredFaqs.length})
              </span>
              {searchTerm && (
                <span className="text-xs text-[#004A99] dark:text-sky-400 font-medium">
                  Buscando por: &ldquo;{searchTerm}&rdquo;
                </span>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-12 text-center">
                <HelpCircle className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Nenhuma dúvida localizada para os critérios de busca selecionados.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Todas as Dúvidas');
                    setSelectedPersona('todos');
                  }}
                  className="mt-4 text-xs text-[#004A99] dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Restaurar filtros e ver todas as perguntas
                </button>
              </div>
            ) : (
              filteredFaqs.map((item) => {
                const isOpen = openFaqId === item.id;
                const feedback = feedbackGiven[item.id];

                return (
                  <motion.div
                    key={item.id}
                    layout
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'border-[#004A99] dark:border-sky-500 bg-white dark:bg-slate-900 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* CABEÇALHO DA PERGUNTA */}
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                      className="w-full p-4 sm:p-5 text-left cursor-pointer flex items-start justify-between gap-3"
                      aria-expanded={isOpen}
                    >
                      <div className="space-y-1.5 flex-1 pr-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2 py-0.5 text-xs text-[#004A99] dark:text-sky-300 font-semibold">
                            {item.category}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-semibold leading-snug text-slate-900 dark:text-slate-100 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition-colors">
                          {item.question}
                        </h3>
                      </div>

                      {/* Botão + / − */}
                      <div
                        className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold transition-all ${
                          isOpen
                            ? 'border-[#004A99] dark:border-sky-500 bg-sky-50 dark:bg-slate-800 text-[#004A99] dark:text-sky-300'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {isOpen ? '−' : '+'}
                      </div>
                    </button>

                    {/* CORPO DA RESPOSTA */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-dashed border-slate-200 dark:border-[#1A365D] bg-slate-50/70 dark:bg-[#071326]/60"
                        >
                          <div className="p-4 sm:p-5 space-y-4">
                            {/* Texto Explicativo em Voz Conversacional e Fluida */}
                            <p className="text-xs sm:text-sm font-normal leading-relaxed text-slate-700 dark:text-[#E6F4FF]/85">
                              {item.answer}
                            </p>

                            {/* Tags de Contexto */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {item.tags.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="rounded border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:text-[#6482A6]"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            {/* BARRA DE AÇÃO CONTEXTUAL & FEEDBACK */}
                            <div className="pt-3 border-t border-dashed border-slate-200 dark:border-[#1A365D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Atalho direto para a página do sistema */}
                              {item.actionLink?.href && item.actionLink?.label ? (
                                <Link
                                  href={item.actionLink.href}
                                  className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#0284C7] dark:text-[#00D8FF] hover:underline transition-colors"
                                >
                                  <span>{item.actionLink.label}</span>
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                              ) : <div />}

                              {/* Mini-botão de Feedback */}
                              <div className="flex items-center gap-2 font-mono text-xs">
                                {feedback ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px]">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Feedback registrado!</span>
                                  </span>
                                ) : (
                                  <>
                                    <span className="text-slate-500 dark:text-[#6482A6] text-[11px]">
                                      Útil?
                                    </span>
                                    <button
                                      onClick={() => handleFeedback(item.id, 'sim')}
                                      className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                      <span>Sim</span>
                                    </button>
                                    <button
                                      onClick={() => handleFeedback(item.id, 'nao')}
                                      className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                      <span>Não</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}

          </main>

        </div>

        {/* ========================================================
            5. RODAPÉ DE SUPORTE DIRETO ("CONSOLE DE ATENDIMENTO SEDUC")
        ======================================================== */}
        <div className="rounded-xl bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#00D8FF]/30 p-4 sm:p-5 shadow-xs dark:shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Esquerda: Informações Técnicas */}
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-[#004A99] dark:text-sky-400">
                <span className="font-semibold tracking-wider uppercase">
                  Suporte Ativo: Coordenadoria de Mídias Educacionais
                </span>
              </div>

              <h3 className="font-display text-base sm:text-lg font-semibold leading-snug text-slate-900 dark:text-[#E6F4FF]">
                Não encontrou sua dúvida? Fale com a equipe técnica ou pedagógica.
              </h3>

              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
                O Núcleo de Tecnologia e a Coordenadoria de Mídias Educacionais da SEDUC atendem diariamente os professores mediadores, escolas polos e famílias rondonienses.
              </p>
            </div>

            {/* Direita: Botões de Ação */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#05549D] dark:bg-[#040B16] border border-[#0284C7] dark:border-[#00D8FF] px-4 py-2 text-xs font-mono font-semibold text-white dark:text-[#E6F4FF] hover:bg-[#0284C7] dark:hover:bg-[#00D8FF] dark:hover:text-[#040B16] transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none"
              >
                <span>Acessar Painel Gestor</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/avisos"
                className="rounded-lg border border-slate-300 dark:border-[#E6F4FF]/40 px-3.5 py-2 text-xs font-mono font-semibold text-slate-700 dark:text-[#E6F4FF] hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                Ver Avisos Oficiais
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
