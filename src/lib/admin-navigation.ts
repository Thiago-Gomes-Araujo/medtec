export type AdminSection =
  | 'visaoGeral'
  | 'kanban'
  | 'fotos'
  | 'noticias'
  | 'avisos'
  | 'galeria'
  | 'redes'
  | 'siteInfo'
  | 'usuarios'
  | 'projetos'
  | 'duvidas'
  | 'estadosCidades';

export const SECTION_CONFIG: Record<
  AdminSection,
  { group: string; title: string; subtitle: string; href: string }
> = {
  visaoGeral: {
    group: 'Início',
    title: 'Início (Resumo do Painel)',
    subtitle: 'Visão executiva unificada, indicadores em tempo real e atalhos didáticos de acesso rápido.',
    href: '/admin',
  },
  noticias: {
    group: 'Publicações do Site',
    title: 'Notícias e Matérias',
    subtitle: 'Aqui você escreve novas matérias, escolhe a foto de capa e edita notícias já publicadas no portal.',
    href: '/admin/noticias',
  },
  projetos: {
    group: 'Publicações do Site',
    title: 'Projetos Pedagógicos e Práticas Escolares',
    subtitle: 'Cadastre, edite e gerencie os projetos pedagógicos, práticas de campo e missões escolares dos 52 municípios.',
    href: '/admin/projetos',
  },
  duvidas: {
    group: 'Publicações do Site',
    title: 'Dúvidas Frequentes (FAQ)',
    subtitle: 'Cadastre, edite e organize as perguntas e respostas que aparecem na Central de Dúvidas do portal.',
    href: '/admin/faq',
  },
  avisos: {
    group: 'Publicações do Site',
    title: 'Avisos e Comunicados',
    subtitle: 'Use esta área para postar comunicados oficiais, calendários e avisos urgentes para as escolas.',
    href: '/admin/avisos',
  },
  fotos: {
    group: 'Publicações do Site',
    title: 'Banners da Página Inicial',
    subtitle: 'Gerencie as imagens grandes que passam no topo da Página Inicial do site.',
    href: '/admin/banners',
  },
  galeria: {
    group: 'Publicações do Site',
    title: 'Galeria de Fotos',
    subtitle: 'Envie fotografias das salas de aula, estúdios e projetos realizados nos municípios.',
    href: '/admin/galeria',
  },
  kanban: {
    group: 'Aprovação e Revisão',
    title: 'Fila de Aprovação (Passo a Passo)',
    subtitle: 'Acompanhe as reportagens em rascunho, envie para revisão e publique oficialmente no portal.',
    href: '/admin/kanban',
  },
  siteInfo: {
    group: 'Dados e Contatos do Site',
    title: 'Números de Alunos e Escolas',
    subtitle: 'Atualize a quantidade oficial de estudantes, escolas, turmas e municípios atendidos.',
    href: '/admin/institucional',
  },
  redes: {
    group: 'Dados e Contatos do Site',
    title: 'Redes Sociais e WhatsApp',
    subtitle: 'Atualize os links oficiais de transmissão, redes sociais e canais de atendimento.',
    href: '/admin/redes',
  },
  usuarios: {
    group: 'Usuários e Acessos',
    title: 'Gerenciar Equipe e Senhas',
    subtitle: 'Cadastre operadores por CPF, redefina senhas e gerencie permissões de acesso ao sistema.',
    href: '/admin/usuarios',
  },
  estadosCidades: {
    group: 'Dados e Contatos do Site',
    title: 'Estados e Municípios',
    subtitle: 'Cadastre e gerencie a base de unidades federativas (UF) e municípios atendidos pelo MEDTEC.',
    href: '/admin/estados-cidades',
  },
};

// Início permanece uma seleção local no dashboard; somente os módulos redirecionam.
export const SECTION_HREFS = new Map<AdminSection, string>([
  ['fotos', SECTION_CONFIG.fotos.href],
  ['projetos', SECTION_CONFIG.projetos.href],
  ['duvidas', SECTION_CONFIG.duvidas.href],
  ['usuarios', SECTION_CONFIG.usuarios.href],
  ['kanban', SECTION_CONFIG.kanban.href],
  ['noticias', SECTION_CONFIG.noticias.href],
  ['avisos', SECTION_CONFIG.avisos.href],
  ['galeria', SECTION_CONFIG.galeria.href],
  ['estadosCidades', SECTION_CONFIG.estadosCidades.href],
  ['siteInfo', SECTION_CONFIG.siteInfo.href],
  ['redes', SECTION_CONFIG.redes.href],
]);
