import { FaqItem } from '@/types';

export const FAQS_DATA: FaqItem[] = [
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
