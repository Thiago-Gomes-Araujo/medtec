export interface StatItem {
  valor: string;
  rotulo: string;
}

export interface Professor {
  id: number;
  nome: string;
  funcao: 'Ministrante' | 'Mediador' | 'Mediadora';
  disciplina: string;
  municipio: string;
  escola: string;
  resumo: string;
  entrevista: string;
}

export interface Aluno {
  id: number;
  nome: string;
  idade: number;
  comunidade: string;
  municipio: string;
  conquista: string;
  categoria: 'Vestibular' | 'Olimpíada' | 'Robótica' | 'Feira de Ciências';
  resumo: string;
}

export interface Escola {
  id: number;
  nome: string;
  municipio: string;
  tipo: 'ribeirinha' | 'rural' | 'indígena' | 'urbana';
  turmas: number;
  alunos: number;
  mediador: string;
  conexao: 'Satélite' | 'Fibra rural' | 'Rádio' | 'Fibra';
}

export interface FonteOficial {
  nome: string;
  url: string;
}

export interface Indicador {
  metrica: string;
  valor: string;
  ano: number;
  data: string;
  fonte: FonteOficial;
}

export interface Contrato {
  item: string;
  valor: string;
  ano: number;
  data: string;
  fonte: FonteOficial;
  status: 'Em execução' | 'Concluído' | 'Executado';
}

export interface Noticia {
  id: number;
  categoria: 'Infraestrutura' | 'Eventos' | 'Pedagógico';
  data: string;
  titulo: string;
  resumo: string;
  img: string;
  conteudo?: string;
}

export type EtapaEditorial = 'Rascunho' | 'Revisão Jurídica/LGPD' | 'Aprovado' | 'Publicado';

export interface ItemEditorial {
  id: number;
  titulo: string;
  tipo: string;
  autor: string;
  etapa: EtapaEditorial;
  anexos: string[];
  atualizado: string;
}

export const statsData: StatItem[] = [
  { valor: '6.000+', rotulo: 'Estudantes atendidos' },
  { valor: '129', rotulo: 'Unidades escolares' },
  { valor: '330', rotulo: 'Turmas ativas' },
  { valor: '52', rotulo: 'Municípios cobertos (100%)' }
];

export const professoresData: Professor[] = [
  {
    id: 1,
    nome: 'Profa. Ana Beatriz Moura',
    funcao: 'Ministrante',
    disciplina: 'Biologia',
    municipio: 'Porto Velho',
    escola: 'Estúdio MEDTEC — SEDUC/RO',
    resumo: 'Transforma o bioma amazônico em laboratório vivo, conectando conteúdos do ENEM à realidade das comunidades ribeirinhas.',
    entrevista: 'Começo cada aula lembrando que do outro lado da tela há estudantes que atravessam rios para chegar à escola. Uso exemplos da floresta, da pesca e da agricultura familiar para tornar a biologia concreta. O retorno dos mediadores é essencial: eles me contam o que funcionou e o que precisa de reforço imediato nas transmissões.'
  },
  {
    id: 2,
    nome: 'Prof. Carlos Henrique Lima',
    funcao: 'Mediador',
    disciplina: 'Mediação presencial',
    municipio: 'Guajará-Mirim',
    escola: 'EEEFM Simón Bolívar (Surpresa)',
    resumo: 'Há 7 anos mediando aulas no distrito de Surpresa, organiza grupos de estudo e acolhe estudantes de comunidades isoladas.',
    entrevista: 'Meu papel não é substituir o ministrante da TV, mas ser a ponte humana. Quando a transmissão termina, tiramos dúvidas, fazemos experimentos com o que temos na comunidade e garantimos que nenhum jovem desista do sonho de concluir o Ensino Médio.'
  },
  {
    id: 3,
    nome: 'Profa. Marta Oro Win',
    funcao: 'Mediadora',
    disciplina: 'Língua Materna e Mediação',
    municipio: 'Cacoal',
    escola: 'EEEFM Indígena Paiter Suruí',
    resumo: 'Articula os saberes tradicionais do povo Suruí com o currículo estadual transmitido ao vivo da capital.',
    entrevista: 'O MEDTEC nos deu autonomia sem apagar nossa identidade. As aulas chegam em alta resolução via satélite, e em sala integramos os conceitos com a nossa língua, história e preservação ambiental.'
  },
  {
    id: 4,
    nome: 'Prof. Ricardo Vasconcelos',
    funcao: 'Ministrante',
    disciplina: 'Matemática',
    municipio: 'Porto Velho',
    escola: 'Estúdio MEDTEC — SEDUC/RO',
    resumo: 'Desenvolve metodologias ativas com gráficos interativos e resolução de problemas práticos do cotidiano rondoniense.',
    entrevista: 'Ensinar matemática para 129 escolas simultaneamente exige dinamismo visual e clareza absoluta. Utilizamos lousas digitais e simulações para que geometria e álgebra façam sentido imediato no dia a dia dos alunos.'
  },
  {
    id: 5,
    nome: 'Profa. Socorro Pinheiro',
    funcao: 'Mediadora',
    disciplina: 'Mediação e Projetos Sociais',
    municipio: 'Porto Velho',
    escola: 'EEEFM Nazaré — Baixo Madeira',
    resumo: 'Mobiliza a comunidade ribeirinha para a permanência escolar e lidera projetos de iniciação científica na várzea.',
    entrevista: 'Mesmo nos meses de seca severa ou de grandes cheias do Rio Madeira, a antena do satélite nos mantém conectados com a SEDUC. Nossos alunos sentem que o Estado está presente na comunidade.'
  },
  {
    id: 6,
    nome: 'Prof. Diego Andrade Rocha',
    funcao: 'Ministrante',
    disciplina: 'História',
    municipio: 'Porto Velho',
    escola: 'Estúdio MEDTEC — SEDUC/RO',
    resumo: 'Produz aulas sobre a Estrada de Ferro Madeira-Mamoré e os ciclos de ocupação regional com acervo histórico rondoniense.',
    entrevista: 'Contar a história de Rondônia para quem vive nela é um privilégio. Cruzamos documentos históricos com as memórias orais dos distritos, criando um senso profundo de pertencimento.'
  }
];

export const alunosData: Aluno[] = [
  {
    id: 1,
    nome: 'Larissa Gomes',
    idade: 17,
    comunidade: 'Distrito de Nazaré (ribeirinha)',
    municipio: 'Porto Velho',
    conquista: 'Aprovada em Medicina na UNIR',
    categoria: 'Vestibular',
    resumo: 'Estudou pelas aulas do MEDTEC no distrito às margens do Rio Madeira e conquistou vaga direta no curso de Medicina através do ENEM.'
  },
  {
    id: 2,
    nome: 'Pedro Henrique Souza',
    idade: 16,
    comunidade: 'Linha 184 (rural)',
    municipio: 'Vilhena',
    conquista: 'Medalha de prata na OBMEP',
    categoria: 'Olimpíada',
    resumo: 'Filho de pequenos agricultores da Linha 184, destacou-se nacionalmente na Olimpíada Brasileira de Matemática das Escolas Públicas com reforço das aulas de estúdio.'
  },
  {
    id: 3,
    nome: 'Equipe Robótica Jamari',
    idade: 17,
    comunidade: 'Distrito de Triunfo (rural)',
    municipio: 'Candeias do Jamari',
    conquista: '1º lugar na Feira Estadual de Ciências',
    categoria: 'Robótica',
    resumo: 'Desenvolveram protótipo funcional de sensor de umidade de solo de baixo custo para otimizar irrigação na agricultura familiar do Cone Sul.'
  },
  {
    id: 4,
    nome: 'Ana Clara Suruí',
    idade: 18,
    comunidade: 'Aldeia Lapetanha (indígena)',
    municipio: 'Cacoal',
    conquista: 'Projeto selecionado na FEBRACE',
    categoria: 'Feira de Ciências',
    resumo: 'Pesquisa sobre catalogação e sustentabilidade de plantas medicinais tradicionais apresentada na Feira Brasileira de Ciências e Engenharia da USP.'
  },
  {
    id: 5,
    nome: 'Mateus Oliveira',
    idade: 17,
    comunidade: 'Vila Calama (ribeirinha)',
    municipio: 'Porto Velho',
    conquista: 'Aprovado em Eng. Florestal (IFRO)',
    categoria: 'Vestibular',
    resumo: 'Primeiro jovem de sua família a ingressar no ensino superior público, inspirado pelas aulas de biologia e ciências da natureza do MEDTEC.'
  },
  {
    id: 6,
    nome: 'Beatriz Lopes',
    idade: 16,
    comunidade: 'Assentamento Margarida Alves',
    municipio: 'Nova União',
    conquista: 'Menção honrosa na OBA',
    categoria: 'Olimpíada',
    resumo: 'Apaixonada por astronomia e ciências espaciais, construiu um telescópio caseiro com sua turma sob orientação do professor mediador.'
  }
];

export const escolasData: Escola[] = [
  {
    id: 1,
    nome: 'EEEFM Simón Bolívar — Distrito de Surpresa',
    municipio: 'Guajará-Mirim',
    tipo: 'ribeirinha',
    turmas: 6,
    alunos: 112,
    mediador: 'Prof. Carlos Henrique Lima',
    conexao: 'Satélite'
  },
  {
    id: 2,
    nome: 'EEEFM Nazaré — Baixo Madeira',
    municipio: 'Porto Velho',
    tipo: 'ribeirinha',
    turmas: 4,
    alunos: 78,
    mediador: 'Profa. Socorro Pinheiro',
    conexao: 'Satélite'
  },
  {
    id: 3,
    nome: 'EEEFM Rio Branco — Extensão Calama',
    municipio: 'Porto Velho',
    tipo: 'ribeirinha',
    turmas: 3,
    alunos: 54,
    mediador: 'Prof. Edson Batista',
    conexao: 'Satélite'
  },
  {
    id: 4,
    nome: 'EEEFM Juscelino Kubitschek — Extensão Rural',
    municipio: 'Ji-Paraná',
    tipo: 'rural',
    turmas: 5,
    alunos: 96,
    mediador: 'Prof. Raimundo Nonato Silva',
    conexao: 'Fibra rural'
  },
  {
    id: 5,
    nome: 'EEEFM Marechal Rondon — Linha 184',
    municipio: 'Vilhena',
    tipo: 'rural',
    turmas: 4,
    alunos: 71,
    mediador: 'Profa. Kátia Regina Alves',
    conexao: 'Rádio'
  },
  {
    id: 6,
    nome: 'EEEFM Indígena Paiter Suruí',
    municipio: 'Cacoal',
    tipo: 'indígena',
    turmas: 3,
    alunos: 48,
    mediador: 'Profa. Marta Oro Win',
    conexao: 'Satélite'
  },
  {
    id: 7,
    nome: 'EEEFM Cora Coralina — Distrito de Rio Pardo',
    municipio: 'Ariquemes',
    tipo: 'rural',
    turmas: 5,
    alunos: 89,
    mediador: 'Prof. Antônio Ferraz',
    conexao: 'Fibra rural'
  },
  {
    id: 8,
    nome: 'EEEFM Tancredo Neves — Anexo Urbano',
    municipio: 'Ariquemes',
    tipo: 'urbana',
    turmas: 2,
    alunos: 41,
    mediador: 'Profa. Lúcia Medeiros',
    conexao: 'Fibra'
  },
  {
    id: 9,
    nome: 'EEEFM Castelo Branco — Anexo Vila Nova',
    municipio: 'Vilhena',
    tipo: 'urbana',
    turmas: 3,
    alunos: 63,
    mediador: 'Prof. Rafael Tenório',
    conexao: 'Fibra'
  }
];

export const municipiosList = [
  'Porto Velho',
  'Ji-Paraná',
  'Guajará-Mirim',
  'Vilhena',
  'Cacoal',
  'Ariquemes'
] as const;

export const geoPositions: Record<string, [number, number]> = {
  'Porto Velho': [30, 18],
  'Guajará-Mirim': [14, 48],
  'Ariquemes': [46, 36],
  'Ji-Paraná': [60, 52],
  'Cacoal': [66, 64],
  'Vilhena': [80, 84]
};

export const fontesOficiais = {
  seduc: { nome: 'SEDUC/RO', url: 'https://rondonia.ro.gov.br/seduc/' },
  doe: { nome: 'Diário Oficial do Estado de RO', url: 'https://diof.ro.gov.br/' },
  pncp: { nome: 'PNCP — Portal Nacional de Contratações', url: 'https://pncp.gov.br/' },
  transp: { nome: 'Portal da Transparência RO', url: 'https://transparencia.ro.gov.br/' },
  inep: { nome: 'INEP / Censo Escolar', url: 'https://www.gov.br/inep/' }
};

export const indicadoresData: Indicador[] = [
  { metrica: 'Estudantes matriculados no MEDTEC', valor: '6.214', ano: 2026, data: '31/03/2026', fonte: fontesOficiais.seduc },
  { metrica: 'Taxa de aprovação (Ensino Médio MEDTEC)', valor: '87,4%', ano: 2025, data: '15/02/2026', fonte: fontesOficiais.inep },
  { metrica: 'Taxa de abandono escolar', valor: '3,1%', ano: 2025, data: '15/02/2026', fonte: fontesOficiais.inep },
  { metrica: 'Unidades escolares atendidas', valor: '129', ano: 2026, data: '31/03/2026', fonte: fontesOficiais.seduc },
  { metrica: 'Turmas ativas', valor: '330', ano: 2026, data: '31/03/2026', fonte: fontesOficiais.seduc },
  { metrica: 'Taxa de aprovação (Ensino Médio MEDTEC)', valor: '84,9%', ano: 2024, data: '20/02/2025', fonte: fontesOficiais.inep },
  { metrica: 'Estudantes matriculados no MEDTEC', valor: '5.980', ano: 2024, data: '31/03/2024', fonte: fontesOficiais.seduc },
  { metrica: 'Professores mediadores em exercício', valor: '342', ano: 2026, data: '31/03/2026', fonte: fontesOficiais.doe }
];

export const contratosData: Contrato[] = [
  { item: 'Contrato de conectividade via satélite (lote 1)', valor: 'R$ 8.420.000,00', ano: 2026, data: '12/01/2026', fonte: fontesOficiais.pncp, status: 'Em execução' },
  { item: 'Aquisição de kits de transmissão e TVs 65"', valor: 'R$ 2.135.400,00', ano: 2025, data: '03/09/2025', fonte: fontesOficiais.pncp, status: 'Concluído' },
  { item: 'Folha de pagamento — professores mediadores', valor: 'R$ 31.780.000,00', ano: 2025, data: '31/12/2025', fonte: fontesOficiais.transp, status: 'Executado' },
  { item: 'Manutenção do estúdio de produção de aulas', valor: 'R$ 640.000,00', ano: 2026, data: '20/02/2026', fonte: fontesOficiais.doe, status: 'Em execução' },
  { item: 'Transporte escolar fluvial — Baixo Madeira', valor: 'R$ 1.912.300,00', ano: 2024, data: '15/03/2024', fonte: fontesOficiais.transp, status: 'Executado' }
];

export const noticiasData: Noticia[] = [
  {
    id: 1,
    categoria: 'Infraestrutura',
    data: '02/10/2026',
    titulo: 'Nova antena amplia sinal em 14 escolas do Baixo Madeira',
    resumo: 'Instalação garante aulas ao vivo estáveis mesmo no período de cheia do rio e intempéries climáticas.',
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=70',
    conteudo: 'A Coordenadoria de Mídias Educacionais concluiu nesta semana a substituição e modernização das antenas parabólicas de recepção de sinal via satélite em 14 escolas ribeirinhas ao longo do Rio Madeira. A nova tecnologia opera com redundância de banda Ku e garante recepção em Full HD mesmo durante fortes temporais característicos do inverno amazônico.'
  },
  {
    id: 2,
    categoria: 'Eventos',
    data: '25/09/2026',
    titulo: 'Feira Cultural MEDTEC reúne estudantes de 30 municípios',
    resumo: 'Apresentações de dança, culinária regional e projetos científicos marcaram a edição estadual de 2026.',
    img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=70',
    conteudo: 'Com polos presenciais e transmissão interativa pelo estúdio central da SEDUC, a Feira Cultural e Científica do MEDTEC reuniu mais de 3.000 jovens de 30 municípios rondonienses. Destaque para estandes de robótica agroecológica e valorização dos saberes dos povos originários e comunidades tradicionais.'
  },
  {
    id: 3,
    categoria: 'Pedagógico',
    data: '18/09/2026',
    titulo: 'Aulões preparatórios para o ENEM começam na próxima semana',
    resumo: 'Transmissões especiais aos sábados com revisão intensiva de Linguagens e Ciências da Natureza.',
    img: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=70',
    conteudo: 'O cronograma especial Reta Final ENEM 2026 contará com 8 sábados letivos de maratona pedagógica ao vivo. Professores ministrantes analisarão as matrizes de referência do INEP com resolução comentada de itens e simulados digitais aplicados com apoio dos mediadores em cada escola.'
  },
  {
    id: 4,
    categoria: 'Pedagógico',
    data: '05/09/2026',
    titulo: 'Formação continuada capacita 120 professores mediadores',
    resumo: 'Curso intensivo aborda metodologias ativas e uso pedagógico integrado de plataformas digitais.',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=70',
    conteudo: 'Realizada no Palácio Rio Madeira e transmitida simultaneamente para as Coordenadorias Regionais de Educação (CREs), a formação aprofundou práticas de tutoria afetiva, avaliação formativa e suporte técnico operacional em sala de aula.'
  },
  {
    id: 5,
    categoria: 'Infraestrutura',
    data: '28/08/2026',
    titulo: 'Escolas indígenas de Cacoal recebem novos equipamentos solares',
    resumo: 'Kits incluem painéis solares para garantir energia estável e ininterrupta durante as transmissões das aulas.',
    img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=70',
    conteudo: 'Em parceria com a Secretaria de Estado do Desenvolvimento Ambiental, escolas estaduais em terras indígenas receberam novos sistemas fotovoltaicos com baterias de lítio de alta durabilidade, assegurando fornecimento elétrico constante para os televisores e receptores de satélite do MEDTEC.'
  },
  {
    id: 6,
    categoria: 'Eventos',
    data: '10/08/2026',
    titulo: 'Olimpíada de Robótica: equipes do MEDTEC sobem ao pódio',
    resumo: 'Três equipes de distritos rurais conquistaram medalhas na etapa estadual com protótipos de automação agrícola.',
    img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=70',
    conteudo: 'Alunos de escolas do campo demonstraram que criatividade e mediação de qualidade superam distâncias geográficas. Os projetos premiados solucionam desafios reais como medição automática de nível de água em poços artesianos e estufas comunitárias.'
  }
];

export const etapasEditoriais: EtapaEditorial[] = [
  'Rascunho',
  'Revisão Jurídica/LGPD',
  'Aprovado',
  'Publicado'
];

export const itensEditoriaisIniciais: ItemEditorial[] = [
  {
    id: 1,
    titulo: 'Perfil: Larissa Gomes — aprovada em Medicina',
    tipo: 'Perfil de aluno',
    autor: 'Ascom SEDUC',
    etapa: 'Revisão Jurídica/LGPD',
    anexos: ['termo_autorizacao_imagem.pdf'],
    atualizado: '09/10/2026'
  },
  {
    id: 2,
    titulo: 'Relatório de indicadores 1º semestre 2026',
    tipo: 'Transparência',
    autor: 'Coord. MEDTEC',
    etapa: 'Aprovado',
    anexos: ['relatorio_s1_2026.pdf', 'planilha_dados.xlsx'],
    atualizado: '08/10/2026'
  },
  {
    id: 3,
    titulo: 'Nova antena no Baixo Madeira',
    tipo: 'Notícia',
    autor: 'Ascom SEDUC',
    etapa: 'Publicado',
    anexos: ['fotos_instalacao.zip'],
    atualizado: '02/10/2026'
  },
  {
    id: 4,
    titulo: 'Entrevista: Profa. Marta Oro Win',
    tipo: 'Perfil de professor',
    autor: 'Equipe Editorial',
    etapa: 'Rascunho',
    anexos: [],
    atualizado: '10/10/2026'
  },
  {
    id: 5,
    titulo: 'Extrato do contrato de conectividade — lote 1',
    tipo: 'Documento oficial',
    autor: 'Gerência Administrativa',
    etapa: 'Revisão Jurídica/LGPD',
    anexos: ['extrato_contrato.pdf', 'publicacao_doe.pdf'],
    atualizado: '07/10/2026'
  }
];
