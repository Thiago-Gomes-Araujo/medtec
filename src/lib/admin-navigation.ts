import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FolderKanban,
  GraduationCap,
  HelpCircle,
  Images,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageSquareQuote,
  MessagesSquare,
  Newspaper,
  Presentation,
  Share2,
  Shapes,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  UserCog,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

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
  | 'projetosTemas'
  | 'projetosMembros'
  | 'projetosAprovacao'
  | 'duvidas'
  | 'duvidasPublico'
  | 'estadosCidades'
  | 'professores'
  | 'professoresDisciplinas'
  | 'professoresRelatos'
  | 'alunos'
  | 'alunosCategorias';

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
    title: 'Projetos Pedagógicos',
    subtitle: 'Cadastre os projetos das escolas com tema, relato, capa, anexos e membros, e acompanhe a aprovação.',
    href: '/admin/projetos',
  },
  projetosTemas: {
    group: 'Publicações do Site',
    title: 'Temas de Projeto',
    subtitle: 'Cadastre e organize os temas usados nos projetos pedagógicos.',
    href: '/admin/projetos/temas',
  },
  projetosMembros: {
    group: 'Publicações do Site',
    title: 'Membros de Projeto',
    subtitle: 'Cadastre as pessoas que participam dos projetos. O CPF não aparece no site.',
    href: '/admin/projetos/membros',
  },
  projetosAprovacao: {
    group: 'Publicações do Site',
    title: 'Aprovação de Projetos',
    subtitle: 'Confira os projetos aguardando e publique ou reprove cada um.',
    href: '/admin/projetos/aprovacao',
  },
  duvidas: {
    group: 'Publicações do Site',
    title: 'Dúvidas Frequentes (FAQ)',
    subtitle: 'Cadastre, edite e organize as perguntas e respostas que aparecem na Central de Dúvidas do portal.',
    href: '/admin/faq',
  },
  duvidasPublico: {
    group: 'Publicações do Site',
    title: 'Dúvidas do público',
    subtitle: 'Acompanhe as dúvidas enviadas pelo site e registre o atendimento feito por e-mail ou telefone.',
    href: '/admin/faq/publico',
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
  professores: {
    group: 'Publicações do Site',
    title: 'Professores e Mediadores',
    subtitle: 'Cadastre e gerencie os perfis docentes de ministrantes e mediadores, disciplinas e relatos.',
    href: '/admin/professores',
  },
  professoresDisciplinas: {
    group: 'Publicações do Site',
    title: 'Disciplinas dos Professores',
    subtitle: 'Cadastre e organize as disciplinas vinculadas aos perfis docentes.',
    href: '/admin/professores/disciplinas',
  },
  professoresRelatos: {
    group: 'Publicações do Site',
    title: 'Relatos sobre Professores',
    subtitle: 'Modere os relatos enviados pelos alunos antes de aparecerem no site.',
    href: '/admin/professores/relatos',
  },
  alunos: {
    group: 'Publicações do Site',
    title: 'Alunos que Inspiram',
    subtitle: 'Cadastre, publique e gerencie as conquistas dos estudantes e suas categorias.',
    href: '/admin/alunos',
  },
  alunosCategorias: {
    group: 'Publicações do Site',
    title: 'Categorias de Conquista',
    subtitle: 'Cadastre e organize as categorias usadas nas conquistas dos estudantes.',
    href: '/admin/alunos/categorias',
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
  ['projetosTemas', SECTION_CONFIG.projetosTemas.href],
  ['projetosMembros', SECTION_CONFIG.projetosMembros.href],
  ['projetosAprovacao', SECTION_CONFIG.projetosAprovacao.href],
  ['duvidas', SECTION_CONFIG.duvidas.href],
  ['duvidasPublico', SECTION_CONFIG.duvidasPublico.href],
  ['usuarios', SECTION_CONFIG.usuarios.href],
  ['kanban', SECTION_CONFIG.kanban.href],
  ['noticias', SECTION_CONFIG.noticias.href],
  ['avisos', SECTION_CONFIG.avisos.href],
  ['galeria', SECTION_CONFIG.galeria.href],
  ['estadosCidades', SECTION_CONFIG.estadosCidades.href],
  ['professores', SECTION_CONFIG.professores.href],
  ['professoresDisciplinas', SECTION_CONFIG.professoresDisciplinas.href],
  ['professoresRelatos', SECTION_CONFIG.professoresRelatos.href],
  ['alunos', SECTION_CONFIG.alunos.href],
  ['alunosCategorias', SECTION_CONFIG.alunosCategorias.href],
  ['siteInfo', SECTION_CONFIG.siteInfo.href],
  ['redes', SECTION_CONFIG.redes.href],
]);

export type AdminMenuAccess =
  | 'noticias'
  | 'projetos'
  | 'duvidas'
  | 'avisos'
  | 'fotos'
  | 'galeria'
  | 'professores'
  | 'alunos'
  | 'kanban'
  | 'siteInfo'
  | 'redes'
  | 'estadosCidades'
  | 'usuarios';

interface AdminMenuItem {
  section: AdminSection;
  access: AdminMenuAccess;
  label: string;
  tooltip: string;
  icon: LucideIcon;
}

interface AdminMenuFolder {
  id: string;
  label: string;
  icon: LucideIcon;
  items: AdminMenuItem[];
}

const ADMIN_MENU: AdminMenuFolder[] = [
  {
    id: 'publicacoes',
    label: 'Publicações do Site',
    icon: FolderKanban,
    items: [
      { section: 'noticias', access: 'noticias', label: 'Notícias e Matérias', tooltip: 'Criar ou editar reportagens', icon: Newspaper },
      { section: 'projetos', access: 'projetos', label: 'Projetos Pedagógicos', tooltip: 'Cadastrar e gerenciar projetos pedagógicos das escolas', icon: Lightbulb },
      { section: 'projetosTemas', access: 'projetos', label: 'Temas de Projeto', tooltip: 'Cadastrar e gerenciar temas de projeto', icon: Shapes },
      { section: 'projetosMembros', access: 'projetos', label: 'Membros de Projeto', tooltip: 'Cadastrar e gerenciar membros de projeto', icon: UserRound },
      { section: 'projetosAprovacao', access: 'projetos', label: 'Aprovação de Projetos', tooltip: 'Publicar ou reprovar projetos aguardando', icon: ClipboardCheck },
      { section: 'duvidas', access: 'duvidas', label: 'Dúvidas Frequentes (FAQ)', tooltip: 'Cadastrar e gerenciar perguntas frequentes do portal', icon: HelpCircle },
      { section: 'duvidasPublico', access: 'duvidas', label: 'Dúvidas do público', tooltip: 'Ver e registrar o atendimento das dúvidas enviadas pelo site', icon: MessagesSquare },
      { section: 'avisos', access: 'avisos', label: 'Avisos e Comunicados', tooltip: 'Publicar alertas no mural', icon: Megaphone },
      { section: 'fotos', access: 'fotos', label: 'Banners da Página Inicial', tooltip: 'Trocar imagens do topo da Home', icon: Presentation },
      { section: 'galeria', access: 'galeria', label: 'Galeria de Fotos', tooltip: 'Adicionar fotos das escolas', icon: Images },
      { section: 'professores', access: 'professores', label: 'Professores e Mediadores', tooltip: 'Cadastrar e gerenciar perfis docentes', icon: GraduationCap },
      { section: 'professoresDisciplinas', access: 'professores', label: 'Disciplinas', tooltip: 'Cadastrar e gerenciar disciplinas dos professores', icon: BookOpen },
      { section: 'professoresRelatos', access: 'professores', label: 'Relatos dos Alunos', tooltip: 'Moderar relatos enviados sobre os professores', icon: MessageSquareQuote },
      { section: 'alunos', access: 'alunos', label: 'Alunos que Inspiram', tooltip: 'Cadastrar e gerenciar conquistas de alunos', icon: Award },
      { section: 'alunosCategorias', access: 'alunos', label: 'Categorias de Conquista', tooltip: 'Cadastrar e gerenciar categorias de conquista', icon: Tags },
    ],
  },
  {
    id: 'aprovacao',
    label: 'Aprovação e Revisão',
    icon: ShieldCheck,
    items: [
      { section: 'kanban', access: 'kanban', label: 'Fila de Aprovação (Passo a Passo)', tooltip: 'Abre o fluxo Rascunho > Revisão > Publicado', icon: CheckCircle2 },
    ],
  },
  {
    id: 'dados',
    label: 'Dados e Contatos do Site',
    icon: SlidersHorizontal,
    items: [
      { section: 'siteInfo', access: 'siteInfo', label: 'Números de Alunos e Escolas', tooltip: 'Edita os contadores e textos institucionais', icon: BarChart3 },
      { section: 'redes', access: 'redes', label: 'Redes Sociais e WhatsApp', tooltip: 'Edita os links de YouTube, Instagram e suporte', icon: Share2 },
      { section: 'estadosCidades', access: 'estadosCidades', label: 'Estados e Municípios', tooltip: 'Cadastrar e gerenciar estados (UF) e municípios da API', icon: MapPin },
    ],
  },
  {
    id: 'usuarios',
    label: 'Usuários e Acessos',
    icon: UsersRound,
    items: [
      { section: 'usuarios', access: 'usuarios', label: 'Gerenciar Equipe e Senhas', tooltip: 'Abre o cadastro de operadores por CPF', icon: UserCog },
    ],
  },
];

// Fonte única da árvore da sidebar; cada tela informa as próprias permissões e contadores.
export function buildAdminMenu(
  access: Record<AdminMenuAccess, boolean>,
  badges: Partial<Record<AdminSection, number | string>> = {},
) {
  return ADMIN_MENU.map(folder => {
    const items = folder.items.map(({ access: rule, ...item }) => ({
      ...item,
      href: SECTION_CONFIG[item.section].href,
      badge: badges[item.section],
      visible: access[rule],
    }));
    return { ...folder, items, visible: items.some(item => item.visible) };
  });
}

// Navegação interna dos módulos divididos em subrotas.
export const ADMIN_SUBROUTE_GROUPS: { label: string; items: { section: AdminSection; label: string }[] }[] = [
  {
    label: 'Seções de projetos',
    items: [
      { section: 'projetos', label: 'Projetos' },
      { section: 'projetosTemas', label: 'Temas' },
      { section: 'projetosMembros', label: 'Membros' },
      { section: 'projetosAprovacao', label: 'Aprovação' },
    ],
  },
  {
    label: 'Seções de professores',
    items: [
      { section: 'professores', label: 'Professores' },
      { section: 'professoresDisciplinas', label: 'Disciplinas' },
      { section: 'professoresRelatos', label: 'Relatos dos alunos' },
    ],
  },
  {
    label: 'Seções de conquistas',
    items: [
      { section: 'alunos', label: 'Conquistas' },
      { section: 'alunosCategorias', label: 'Categorias' },
    ],
  },
];
