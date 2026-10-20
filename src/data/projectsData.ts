export interface ReplicationWeek {
  week: number;
  title: string;
  studioAction: string;
  fieldAction: string;
}

export interface ProjectMission {
  id: string;
  number: string; // '01', '02', etc.
  missionCode: string; // 'MISSÃO #01'
  title: string;
  shortTitle: string;
  track: 'Agroecologia & NBAZ' | 'Ciência na Amazônia' | 'Saberes Indígenas & História' | 'Tecnologia Solar & Robótica';
  territory: string;
  typology: string;
  municipality: string;
  school: string;
  mediatorName: string;
  mediatorRole: string;
  mediatorInitials: string;
  studentCohort: string;
  seal: string;
  image: string;
  initialApplause: number;
  desafioLocal: {
    title: string;
    description: string;
  };
  praticaMedtec: {
    title: string;
    description: string;
  };
  impactoGerado: {
    title: string;
    metric: string;
    description: string;
  };
  competencias: string[];
  quote: string;
  replicationGuide: {
    materials: string[];
    timeline: ReplicationWeek[];
    pedagogicalTip: string;
  };
}

export const PROJECTS_DATA: ProjectMission[] = [
  {
    id: 'missao-01-agroflorestas-nazare',
    number: '01',
    missionCode: 'MISSÃO #01',
    title: 'Sistemas Agroflorestais & Hortas Suspensas em Jirau',
    shortTitle: 'Hortas em Jirau & Agrofloresta',
    track: 'Agroecologia & NBAZ',
    territory: 'Baixo Madeira • Distrito de Nazaré',
    typology: 'Comunidade Ribeirinha Fluvial',
    municipality: 'Porto Velho',
    school: 'EEEFM Nazaré',
    mediatorName: 'Profª Francisca Ribeiro',
    mediatorRole: 'Bióloga & Professora Mediadora',
    mediatorInitials: 'FR',
    studentCohort: '2º Ano EM • 38 Alunos Conectados',
    seal: '🏆 DESTAQUE FEIRA CULTURAL MEDTEC',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    initialApplause: 142,
    desafioLocal: {
      title: 'Inundações sazonais destruindo plantios tradicionais no solo',
      description: 'Durante a cheia histórica do Rio Madeira, os canteiros convencionais eram submersos, gerando escassez severa de vegetais frescos na merenda escolar por até 4 meses.'
    },
    praticaMedtec: {
      title: 'Aulas de Biologia via Satélite + Engenharia Ribeirinha de Jirau',
      description: 'Estúdios de Porto Velho transmitiram conteúdos de fisiologia vegetal e compostagem. Na sala conectada, os alunos desenharam e ergueram canteiros elevados de madeira reaproveitada com biofertilizante de casca de castanha.'
    },
    impactoGerado: {
      title: 'Segurança Alimentar Escolar e Multiplicação Familiar',
      metric: '+65% na merenda',
      description: 'Abastecimento contínuo de couve, coentro e chicória o ano inteiro para 100% dos alunos e adoção do modelo de jirau por 42 famílias ribeirinhas do distrito.'
    },
    competencias: ['Itinerário NBAZ', 'Lei Estadual nº 3.846/2016', 'Agroecologia Fluvial', 'Sustentabilidade Amazônica'],
    quote: 'A mediação tecnológica permitiu que a ciência das transmissões em alta definição do estúdio descesse diretamente para as mãos e canteiros dos nossos jovens ribeirinhos.',
    replicationGuide: {
      materials: [
        'Madeira de manejo ou sobras certificadas para estrutura do jirau (altura de 1,60m)',
        'Sombrite 50% para proteção contra insolação amazônica intensa',
        'Cascas de castanha-do-brasil e folhas decompostas para compostagem orgânica',
        'Tubos PVC perfurados para microdrenagem das caixas de cultivo'
      ],
      timeline: [
        {
          week: 1,
          title: 'Semana 01 • Diagnóstico de Solo & Aula Síncrona',
          studioAction: 'Transmissão interativa do Estúdio MEDTEC sobre nutrientes do solo e cheias amazônicas.',
          fieldAction: 'Mapeamento do nível máximo de água dos últimos 5 anos no pátio da escola com a turma.'
        },
        {
          week: 2,
          title: 'Semana 02 • Coleta de Biomassa & Montagem Estrutural',
          studioAction: 'Telemetria e chat com dúvidas sobre proporção de composto orgânico e aeração.',
          fieldAction: 'Construção coletiva dos jiraus elevados com apoio de carpinteiros da comunidade local.'
        },
        {
          week: 3,
          title: 'Semana 03 • Semeadura e Monitoramento Digital',
          studioAction: 'Apresentação de técnicas de semeadura direta e consorciação de espécies.',
          fieldAction: 'Plantio de hortaliças regionais e registro diário de germinação em planilhas da escola.'
        },
        {
          week: 4,
          title: 'Semana 04 • Primeira Colheita & Degustação Pedagógica',
          studioAction: 'Transmissão ao vivo do estúdio compartilhando os resultados de Nazaré com todas as escolas.',
          fieldAction: 'Inserção das hortaliças na merenda escolar e entrega de mudas para as famílias ribeirinhas.'
        }
      ],
      pedagogicalTip: 'Envolva sempre os pais e anciãos da comunidade na escolha da altura do jirau; o conhecimento ancestral sobre o repiquete do rio é o maior aliado do rigor científico.'
    }
  },
  {
    id: 'missao-02-etnoecologia-paiter-surui',
    number: '02',
    missionCode: 'MISSÃO #02',
    title: 'Etnoecologia & Cartografia Digital Paiter Suruí',
    shortTitle: 'Cartografia Digital & Saberes Suruí',
    track: 'Saberes Indígenas & História',
    territory: 'T.I. Sete de Setembro • Aldeia Linha 9',
    typology: 'Território Indígena Ancestral',
    municipality: 'Cacoal',
    school: 'EEEFM Indígena Sertanista José do Carmo',
    mediatorName: 'Prof. Uraan Suruí',
    mediatorRole: 'Pedagogo Intercultural Indígena',
    mediatorInitials: 'US',
    studentCohort: '1º e 2º Ano EM • 29 Estudantes Indígenas',
    seal: '★ PRÁTICA CERTIFICADA BNCC & SABERES ANCESTRAIS',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    initialApplause: 198,
    desafioLocal: {
      title: 'Perda progressiva de topônimos sagrados e botânica medicinal',
      description: 'O avanço das tecnologias descontextualizadas afastava jovens dos relatos dos anciãos (paiterey), arriscando o esquecimento de nomes de nascentes e ervas em língua Tupi-Mondé.'
    },
    praticaMedtec: {
      title: 'Geografia via Satélite + Aplicativos Móveis GPS Offline',
      description: 'Aulas de Cartografia e História Regional do estúdio orientaram saídas a campo. Com celulares offline e receptores GPS, os estudantes caminharam com os anciãos marcando coordenadas e gravando pronúncias.'
    },
    impactoGerado: {
      title: 'Atlas Etnobotânico Digital e Proteção Territorial',
      metric: '140 espécies mapeadas',
      description: '140 espécies catalogadas com nome científico, uso medicinal tradicional e áudio bilíngue, servindo de material didático próprio para todas as escolas indígenas de Rondônia.'
    },
    competencias: ['Educação Escolar Indígena', 'Cartografia Social', 'Preservação Linguística Tupi-Mondé', 'Tecnologias Geoespaciais'],
    quote: 'O MEDTEC nos deu a antena de satélite para olhar o mundo, e nós usamos a tecnologia para registrar as raízes sagradas que sustentam a nossa floresta.',
    replicationGuide: {
      materials: [
        'Smartphones ou tablets escolares com app de GPS offline instalado (OpenDataKit / OsmAnd)',
        'Gravador de voz para registro de fonemas com anciãos falantes nativos',
        'Prensas botânicas de madeira e papel jornal para herborização preliminar',
        'Projetor da sala conectada para validação coletiva do mapa com a comunidade'
      ],
      timeline: [
        {
          week: 1,
          title: 'Semana 01 • Metodologia da Cartografia Social',
          studioAction: 'Aula magna sobre sistemas de coordenadas, fusos e soberania de dados territoriais.',
          fieldAction: 'Roda de conversa com lideranças indígenas na aldeia para autorização e planejamento de rotas.'
        },
        {
          week: 2,
          title: 'Semana 02 • Expedição Etnobotânica em Trilha',
          studioAction: 'Plantão tira-dúvidas síncrono sobre classificação taxonômica básica.',
          fieldAction: 'Caminhada monitorada de 8km coletando amostras e gravando causos em língua materna.'
        },
        {
          week: 3,
          title: 'Semana 03 • Digitalização e Plotagem Geoespacial',
          studioAction: 'Demonstração em tela dos estúdios de como exportar arquivos KML para o Google Earth.',
          fieldAction: 'Alunos inserem pontos de interesse e fotos no computador conectado da sala MEDTEC.'
        },
        {
          week: 4,
          title: 'Semana 04 • Entrega do Mapa em Assembleia',
          studioAction: 'Transmissão estadual exibindo o mapa interativo aos técnicos da SEDUC e UNIR.',
          fieldAction: 'Apresentação do mapa impresso plastificado para o conselho dos mais velhos da aldeia.'
        }
      ],
      pedagogicalTip: 'O consentimento livre, prévio e informado da comunidade indígena deve nortear cada etapa; plantas de uso ritual secreto não devem ter sua localização exata exposta publicamente.'
    }
  },
  {
    id: 'missao-03-monitoramento-igarape-guajara',
    number: '03',
    missionCode: 'MISSÃO #03',
    title: 'Monitoramento Participativo de Igarapés e Bacia do Mamoré',
    shortTitle: 'Qualidade da Água & Bacia do Mamoré',
    track: 'Ciência na Amazônia',
    territory: 'Comunidade do Iata • Rio Mamoré',
    typology: 'Fronteira Fluvial Brasil-Bolívia',
    municipality: 'Guajará-Mirim',
    school: 'EEEFM Rocha Leal',
    mediatorName: 'Prof. Marcos Aurélio Benício',
    mediatorRole: 'Químico & Professor Mediador',
    mediatorInitials: 'MB',
    studentCohort: '3º Ano EM • 44 Alunos Conectados',
    seal: '🔬 MENÇÃO HONROSA OLIMPÍADA DE CIÊNCIAS RO',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
    initialApplause: 115,
    desafioLocal: {
      title: 'Turbidez e contaminação de águas em áreas de fronteira',
      description: 'Chuvas torrenciais e descarte inadequado de efluentes afetavam as fontes de captação de água doce de famílias ribeirinhas e pequenos agricultores fronteiriços.'
    },
    praticaMedtec: {
      title: 'Química Analítica Transmitida + Kits Colorimétricos de Bancada',
      description: 'O professor ministrante em Porto Velho ensinou reações indicadoras com extrato de repolho roxo e kits de teste colorimétrico. A turma do Iata monitorou 12 nascentes no entorno da escola quinzenalmente.'
    },
    impactoGerado: {
      title: 'Rede de Sentinela Hídrica e Ações com a Defesa Civil',
      metric: '12 nascentes protegidas',
      description: 'Criação de um painel de telemetria hídrica comunitária, com reflorestamento de 2.000m² de mata ciliar e eliminação de pontos críticos de assoreamento.'
    },
    competencias: ['Química Ambiental', 'Educação para o Clima', 'Gestão de Recursos Hídricos', 'Iniciação Científica Escolar'],
    quote: 'Os alunos deixaram de ser apenas receptores de fórmulas químicas abstratas para se tornarem cientistas ambientais que defendem a água da sua própria comunidade.',
    replicationGuide: {
      materials: [
        'Frascos de vidro âmbar esterilizados para coleta de água de superfície',
        'Kits de teste rápido de pH, turbidez e oxigênio dissolvido',
        'Disco Secchi artesanal (disco preto e branco com trena de peso)',
        'Caderneta hidrológica impermeável para registro de temperatura e pluviosidade'
      ],
      timeline: [
        {
          week: 1,
          title: 'Semana 01 • Fundamentos de Parâmetros da Água',
          studioAction: 'Transmissão síncrona sobre resolução CONAMA 357 e ciclo hidrológico amazônico.',
          fieldAction: 'Delimitação dos pontos amostrais ao longo do igarapé com os alunos mediadores.'
        },
        {
          week: 2,
          title: 'Semana 02 • Protocolo de Coleta Asséptica',
          studioAction: 'Demonstração passo a passo do manuseio de pipetas e reagentes nos estúdios centrais.',
          fieldAction: 'Primeira rodada de coletas em campo respeitando o protocolo de segurança microbiológica.'
        },
        {
          week: 3,
          title: 'Semana 03 • Análise Estatística e Gráficos de Tendência',
          studioAction: 'Aula ao vivo integrando Matemática e Química para cálculo de médias e desvio-padrão.',
          fieldAction: 'Construção de mural comparativo com as cores das reações para visualização de toda a escola.'
        },
        {
          week: 4,
          title: 'Semana 04 • Seminário Comunitário da Bacia',
          studioAction: 'Conexão ao vivo de vídeo entre o Iata e a equipe de meio ambiente da SEDUC.',
          fieldAction: 'Apresentação dos dados para a associação de moradores com sugestão de plantio de mudas.'
        }
      ],
      pedagogicalTip: 'Promova sempre a coleta no mesmo horário solar para garantir comparabilidade térmica dos dados de oxigênio dissolvido.'
    }
  },
  {
    id: 'missao-04-estacao-solar-calama',
    number: '04',
    missionCode: 'MISSÃO #04',
    title: 'Estação Solar Fotovoltaica & Irrigação por Microcontrolador',
    shortTitle: 'Automação Solar & Robótica Verde',
    track: 'Tecnologia Solar & Robótica',
    territory: 'Distrito de Calama • Foz do Rio Ji-Paraná',
    typology: 'Ribeirinha Isolada & Sem Rede Conectada',
    municipality: 'Porto Velho',
    school: 'EEEFM General Osório',
    mediatorName: 'Prof. Carlos Eduardo Santana',
    mediatorRole: 'Físico & Professor Mediador',
    mediatorInitials: 'CS',
    studentCohort: '2º e 3º Ano EM • 32 Alunos Conectados',
    seal: '⚡ INOVAÇÃO ENERGÉTICA SUSTENTÁVEL',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    initialApplause: 230,
    desafioLocal: {
      title: 'Interrupções severas de energia a diesel paralisando viveiros',
      description: 'No distrito isolado de Calama, as oscilações do gerador fóssil interrompiam o bombeamento de água para mudas de açaí e castanha da horta escolar, gerando perda constante.'
    },
    praticaMedtec: {
      title: 'Aulas de Robótica via Satélite + Montagem de Circuitos Fotovoltaicos',
      description: 'O professor do estúdio transmitiu lógica de programação e circuitos elétricos em corrente contínua. Com placas solares de 50W e placas Arduino, a turma construiu um sistema automatizado de gotejamento acionado por umidade.'
    },
    impactoGerado: {
      title: 'Independência Fóssil e Irrigação Automática 24 Horas',
      metric: '-80L diesel/mês',
      description: 'Economia comprovada de combustível para a escola, funcionamento 100% autônomo com energia solar e certificação de 32 jovens em manutenção básica fotovoltaica.'
    },
    competencias: ['Eletrodinâmica & Física Aplicada', 'Programação de Microcontroladores', 'Transição Energética Justa', 'Robótica Sustentável'],
    quote: 'Quando o aluno de Calama vê uma placa de silício gerando água para o canteiro sem queimar uma gota de diesel, ele compreende na prática que o futuro da Amazônia é solar.',
    replicationGuide: {
      materials: [
        'Painel solar fotovoltaico monocristalino de 50W ou 100W',
        'Controlador de carga solar 12V e bateria estacionária selada ciclo profundo',
        'Placa microcontroladora compatível com Arduino Uno / Nano + módulo relé 5V',
        'Sensor resistivo de umidade do solo e minibomba d’água submersível 12V'
      ],
      timeline: [
        {
          week: 1,
          title: 'Semana 01 • Princípios do Efeito Fotoelétrico',
          studioAction: 'Transmissão sobre semicondutores, irradiação solar na Amazônia e cálculo de consumo.',
          fieldAction: 'Medição da incidência de sol no pátio e cálculo do ângulo ideal de inclinação da placa.'
        },
        {
          week: 2,
          title: 'Semana 02 • Lógica de Automação & Código Aberto',
          studioAction: 'Passo a passo no estúdio projetando o algoritmo condicional (SE umidade < 30% ENTÃO ligar bomba).',
          fieldAction: 'Compilação e upload do código no microcontrolador no computador da sala de aula.'
        },
        {
          week: 3,
          title: 'Semana 03 • Integração de Hidráulica e Potência Elétrica',
          studioAction: 'Instruções de segurança contra curto-circuito e instalação de fusíveis automotivos.',
          fieldAction: 'Instalação da fiação selada contra umidade amazônica e mangueiras de microgotejamento.'
        },
        {
          week: 4,
          title: 'Semana 04 • Teste de Stress & Painel de Monitoramento',
          studioAction: 'Teleconferência com engenheiros elétricos da capital avaliando a telemetria do sistema.',
          fieldAction: 'Simulação de seca no solo e acionamento automático da bomba na presença dos pais.'
        }
      ],
      pedagogicalTip: 'Utilize caixas estanques de passagem elétrica com silicone nas conexões para impedir que insetos e a umidade relativa de 90% danifiquem os circuitos.'
    }
  },
  {
    id: 'missao-05-piscicultura-jiparana',
    number: '05',
    missionCode: 'MISSÃO #05',
    title: 'Piscicultura Sustentável e Biometria de Pirarucu e Tambaqui',
    shortTitle: 'Biometria de Peixes & Nutrição',
    track: 'Agroecologia & NBAZ',
    territory: 'Linha 206 • Gleba Riachuelo',
    typology: 'Assentamento Rural & Agricultura Familiar',
    municipality: 'Ji-Paraná',
    school: 'EEEFM Juscelino Kubitschek',
    mediatorName: 'Profª Mariana Guimarães',
    mediatorRole: 'Engenheira Agrônoma & Mediadora',
    mediatorInitials: 'MG',
    studentCohort: '1º Ano EM • 35 Alunos Conectados',
    seal: '🌱 PRÁTICA AGROECOLÓGICA DE IMPACTO',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    initialApplause: 164,
    desafioLocal: {
      title: 'Mortalidade precoce de alevinos e ração inadequada em represas',
      description: 'Produtores familiares da gleba enfrentavam perdas de até 40% nos tanques de tambaqui por desconhecimento de taxas de estocagem e manejo alimentar correto.'
    },
    praticaMedtec: {
      title: 'Zootecnia Básica Transmitida + Planilhas Digitais de Conversão',
      description: 'Aulas interativas ensinaram cálculo de biomassa e horários ideais de arraçoamento. A turma instalou tanque-rede didático na represa da escola para biometria semanal com ictiômetro e balança digital.'
    },
    impactoGerado: {
      title: 'Aumento de Sobrevivência e Cooperativismo Juvenil',
      metric: '-35% mortalidade',
      description: 'Redução expressiva na perda de peixes, produção de 1,8 tonelada na safra escolar e repasse de metodologia técnica para 5 cooperativas de piscicultores de Ji-Paraná.'
    },
    competencias: ['Piscicultura de Água Doce', 'Biometria Animal', 'Matemática Financeira Rural', 'NBAZ Sustentável'],
    quote: 'Ver os filhos de agricultores calculando a conversão alimentar com precisão milimétrica uniu a sabedoria do campo à ciência zootécnica mais moderna.',
    replicationGuide: {
      materials: [
        'Tanque-rede flutuante de malha 15mm para confinamento didático de alevinos',
        'Balança digital de precisão com bacia plástica para pesagem úmida rápida',
        'Ictiômetro ou régua milimetrada impermeável para medição de comprimento padrão',
        'Termômetro digital de coluna de água para monitoramento de oxigênio e temperatura'
      ],
      timeline: [
        {
          week: 1,
          title: 'Semana 01 • Fisiologia de Peixes Nativos da Bacia Amazônica',
          studioAction: 'Transmissão sobre curvas de crescimento de Tambaqui (Colossoma macropomum) e Pirarucu.',
          fieldAction: 'Instalação e fixação do tanque-rede no ponto mais arejado da represa escolar.'
        },
        {
          week: 2,
          title: 'Semana 02 • Povoamento & Cálculo de Densidade de Carga',
          studioAction: 'Exercícios práticos de densidade de estocagem (peixes por m³) via satélite.',
          fieldAction: 'Aclimatação e soltura monitorada de 200 alevinos sob supervisão da mediadora.'
        },
        {
          week: 3,
          title: 'Semana 03 • Primeira Biometria por Amostragem',
          studioAction: 'Demonstração de tabela dinâmica de ganho de peso diário (GPD) na tela do estúdio.',
          fieldAction: 'Captura com puçá, pesagem de 20 exemplares e cálculo da taxa de ração para os 7 dias seguintes.'
        },
        {
          week: 4,
          title: 'Semana 04 • Dia de Campo com Piscicultores da Região',
          studioAction: 'Entrevista ao vivo no estúdio com extensionistas da EMATER-RO analisando os dados da turma.',
          fieldAction: 'Alunos ministram oficina técnica prática para os pais e vizinhos produtores da linha.'
        }
      ],
      pedagogicalTip: 'A biometria deve ser realizada sempre nas primeiras horas da manhã antes de alimentar o lote, reduzindo o estresse dos peixes e o risco de asfixia.'
    }
  },
  {
    id: 'missao-06-estrada-ferro-madeira-mamore',
    number: '06',
    missionCode: 'MISSÃO #06',
    title: 'Mapeamento Memória Viva da Estrada de Ferro Madeira-Mamoré',
    shortTitle: 'Memória Oral da Ferrovia do Diabo',
    track: 'Saberes Indígenas & História',
    territory: 'Santo Antônio & Teunha • Rio Madeira',
    typology: 'Patrimônio Histórico & Cultura Regional',
    municipality: 'Porto Velho',
    school: 'EEEFM Barão do Solimões',
    mediatorName: 'Prof. Tiago Vasconcelos',
    mediatorRole: 'Historiador & Professor Mediador',
    mediatorInitials: 'TV',
    studentCohort: '3º Ano EM • 41 Alunos Conectados',
    seal: '📻 PATRIMÔNIO IMATERIAL & HISTÓRIA ORAL',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    initialApplause: 178,
    desafioLocal: {
      title: 'Apagamento da memória oral de trabalhadores ferroviários e ribeirinhos',
      description: 'Com o falecimento dos antigos operários e seringueiros, narrativas sobre a resistência de afro-antilhanos e indígenas na construção da ferrovia estavam desaparecendo dos currículos escolares.'
    },
    praticaMedtec: {
      title: 'Metodologia de História Oral + Oficinas de Podcasting e Edição',
      description: 'O estúdio da Coordenadoria de Mídias ministrou técnicas de gravação, roteiro radiofônico e entrevista antropológica. Os estudantes entrevistaram 18 octogenários e familiares, resgatando canções, causos e memórias.'
    },
    impactoGerado: {
      title: 'Acervo Sonoro Público e Tombamento Imaterial Escolar',
      metric: '18 podcasts gravados',
      description: '18 episódios de podcasts históricos editados pelos próprios alunos, disponibilizados na plataforma pública da SEDUC e incorporados ao acervo permanente da Fundação Cultural de Rondônia.'
    },
    competencias: ['História de Rondônia & Amazônia', 'Metodologia de História Oral', 'Comunicação Multimídia Escolar', 'Preservação Patrimonial'],
    quote: 'Quando os estudantes colocam os fones e gravam a voz trêmula de quem ajudou a erguer nossa história nos trilhos, a disciplina de História ganha vida e pulso real.',
    replicationGuide: {
      materials: [
        'Gravadores digitais portáteis ou smartphones com microfones de lapela conectados',
        'Termos de cessão de direitos de voz e imagem para pesquisa escolar (LGPD)',
        'Fones de ouvido para monitoramento acústico direto durante as entrevistas',
        'Software livre de edição de áudio (Audacity) nos computadores conectados da escola'
      ],
      timeline: [
        {
          week: 1,
          title: 'Semana 01 • Ética na História Oral & Roteirização',
          studioAction: 'Transmissão ao vivo sobre elaboração de perguntas abertas e escuta sensível com historiadores.',
          fieldAction: 'Construção coletiva do roteiro de perguntas e contato prévio com famílias de ferroviários.'
        },
        {
          week: 2,
          title: 'Semana 02 • Gravação de Campo & Coleta Iconográfica',
          studioAction: 'Oficina técnica remota ensinando a evitar ruídos de vento e posicionar o microfone.',
          fieldAction: 'Visitas domiciliares para gravação de depoimentos e digitalização de fotos antigas com celular.'
        },
        {
          week: 3,
          title: 'Semana 03 • Decupagem, Sonoplastia e Montagem',
          studioAction: 'Aula prática síncrona demonstrando cortes de áudio, trilhas sonoras regionais e equalização.',
          fieldAction: 'Duplas de alunos editam os episódios inserindo ambientações sonoras da floresta e do apito do trem.'
        },
        {
          week: 4,
          title: 'Semana 04 • Audição Coletiva & Lançamento no Acervo',
          studioAction: 'Transmissão especial tocando trechos dos podcasts para todas as escolas da rede estadual.',
          fieldAction: 'Sessão solene de audição na escola com entrega de certificados de homenagem aos entrevistados.'
        }
      ],
      pedagogicalTip: 'Nunca interrompa o silêncio do entrevistado idoso; muitas vezes é nas pausas e suspiros que emergem as memórias mais profundas e transformadoras.'
    }
  }
];

export const TRACK_OPTIONS = [
  '⚡ Todas as Missões (06)',
  '🌱 Agroecologia & NBAZ',
  '🔬 Ciência na Amazônia',
  '🏺 Saberes Indígenas & História',
  '🤖 Tecnologia Solar & Robótica'
] as const;
