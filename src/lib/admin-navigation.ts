import {
  Award,
  BarChart3,
  ClipboardCheck,
  FolderKanban,
  GraduationCap,
  Headphones,
  HelpCircle,
  Images,
  Lightbulb,
  MapPin,
  Megaphone,
  MessagesSquare,
  Newspaper,
  Presentation,
  Settings,
  Share2,
  UserCog,
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
    title: 'Início',
    subtitle: 'Resumo do site e atalhos para o que você mais usa.',
    href: '/admin',
  },
  noticias: {
    group: 'Conteúdo do site',
    title: 'Notícias',
    subtitle: 'Aqui você escreve novas matérias, escolhe a foto de capa e edita notícias já publicadas no portal.',
    href: '/admin/noticias',
  },
  projetos: {
    group: 'Conteúdo do site',
    title: 'Projetos',
    subtitle: 'Cadastre os projetos das escolas com tema, relato, capa, anexos e membros, e acompanhe a aprovação.',
    href: '/admin/projetos',
  },
  projetosTemas: {
    group: 'Conteúdo do site',
    title: 'Temas de projeto',
    subtitle: 'Cadastre e organize os temas usados nos projetos pedagógicos.',
    href: '/admin/projetos/temas',
  },
  projetosMembros: {
    group: 'Conteúdo do site',
    title: 'Membros de projeto',
    subtitle: 'Cadastre as pessoas que participam dos projetos. O CPF não aparece no site.',
    href: '/admin/projetos/membros',
  },
  projetosAprovacao: {
    group: 'Conteúdo do site',
    title: 'Aprovação de projetos',
    subtitle: 'Confira os projetos aguardando e publique ou reprove cada um.',
    href: '/admin/projetos/aprovacao',
  },
  duvidas: {
    group: 'Conteúdo do site',
    title: 'Perguntas frequentes',
    subtitle: 'Cadastre, edite e organize as perguntas e respostas que aparecem na Central de Dúvidas do portal.',
    href: '/admin/faq',
  },
  duvidasPublico: {
    group: 'Conteúdo do site',
    title: 'Dúvidas do público',
    subtitle: 'Acompanhe as dúvidas enviadas pelo site e registre o atendimento feito por e-mail ou telefone.',
    href: '/admin/faq/publico',
  },
  avisos: {
    group: 'Conteúdo do site',
    title: 'Avisos',
    subtitle: 'Use esta área para postar comunicados oficiais, calendários e avisos urgentes para as escolas.',
    href: '/admin/avisos',
  },
  fotos: {
    group: 'Conteúdo do site',
    title: 'Banners',
    subtitle: 'Gerencie as imagens grandes que passam no topo da Página Inicial do site.',
    href: '/admin/banners',
  },
  galeria: {
    group: 'Conteúdo do site',
    title: 'Galeria de fotos',
    subtitle: 'Envie fotografias das salas de aula, estúdios e projetos realizados nos municípios.',
    href: '/admin/galeria',
  },
  professores: {
    group: 'Conteúdo do site',
    title: 'Professores',
    subtitle: 'Cadastre e gerencie os perfis docentes de ministrantes e mediadores, disciplinas e relatos.',
    href: '/admin/professores',
  },
  professoresDisciplinas: {
    group: 'Conteúdo do site',
    title: 'Disciplinas dos Professores',
    subtitle: 'Cadastre e organize as disciplinas vinculadas aos perfis docentes.',
    href: '/admin/professores/disciplinas',
  },
  professoresRelatos: {
    group: 'Conteúdo do site',
    title: 'Relatos sobre Professores',
    subtitle: 'Modere os relatos enviados pelos alunos antes de aparecerem no site.',
    href: '/admin/professores/relatos',
  },
  alunos: {
    group: 'Conteúdo do site',
    title: 'Alunos que Inspiram',
    subtitle: 'Cadastre, publique e gerencie as conquistas dos estudantes e suas categorias.',
    href: '/admin/alunos',
  },
  alunosCategorias: {
    group: 'Conteúdo do site',
    title: 'Categorias de conquista',
    subtitle: 'Cadastre e organize as categorias usadas nas conquistas dos estudantes.',
    href: '/admin/alunos/categorias',
  },
  kanban: {
    group: 'Atendimento',
    title: 'Aprovações',
    subtitle: 'Veja o que está aguardando aprovação e publique ou recuse cada item.',
    href: '/admin/kanban',
  },
  siteInfo: {
    group: 'Configurações',
    title: 'Números do site',
    subtitle: 'Atualize a quantidade oficial de estudantes, escolas, turmas e municípios atendidos.',
    href: '/admin/institucional',
  },
  redes: {
    group: 'Configurações',
    title: 'Redes sociais',
    subtitle: 'Atualize os links oficiais de transmissão, redes sociais e canais de atendimento.',
    href: '/admin/redes',
  },
  usuarios: {
    group: 'Configurações',
    title: 'Usuários e acessos',
    subtitle: 'Cadastre operadores por CPF, redefina senhas e gerencie permissões de acesso ao sistema.',
    href: '/admin/usuarios',
  },
  estadosCidades: {
    group: 'Configurações',
    title: 'Estados e municípios',
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
  /** Esconde o item de quem tem este outro acesso: evita dois itens para a mesma tarefa. */
  hiddenWithAccess?: AdminMenuAccess;
  label: string;
  tooltip: string;
  /** Frase simples do que a tela faz, mostrada no Início. */
  summary: string;
  icon: LucideIcon;
}

interface AdminMenuFolder {
  id: string;
  label: string;
  icon: LucideIcon;
  items: AdminMenuItem[];
}

// As dicas também alimentam a busca: citam as telas que ficam em abas dentro de cada módulo.
const ADMIN_MENU: AdminMenuFolder[] = [
  {
    id: 'conteudo',
    label: 'Conteúdo do site',
    icon: FolderKanban,
    items: [
      { section: 'noticias', access: 'noticias', label: 'Notícias', tooltip: 'Criar e editar notícias e matérias', summary: 'Escreva e publique as notícias do site.', icon: Newspaper },
      { section: 'avisos', access: 'avisos', label: 'Avisos', tooltip: 'Publicar avisos e comunicados', summary: 'Publique comunicados e avisos urgentes.', icon: Megaphone },
      { section: 'fotos', access: 'fotos', label: 'Banners', tooltip: 'Trocar as imagens do topo da página inicial', summary: 'Troque as imagens do topo da página inicial.', icon: Presentation },
      { section: 'galeria', access: 'galeria', label: 'Galeria de fotos', tooltip: 'Adicionar fotos das escolas', summary: 'Adicione fotos das escolas e dos eventos.', icon: Images },
      { section: 'projetos', access: 'projetos', label: 'Projetos', tooltip: 'Projetos das escolas, temas e membros', summary: 'Cadastre os projetos das escolas.', icon: Lightbulb },
      { section: 'professores', access: 'professores', label: 'Professores', tooltip: 'Professores e mediadores, disciplinas e relatos dos alunos', summary: 'Cadastre professores e modere os relatos dos alunos.', icon: GraduationCap },
      { section: 'alunos', access: 'alunos', label: 'Alunos que Inspiram', tooltip: 'Conquistas dos alunos e categorias', summary: 'Mostre as conquistas dos alunos.', icon: Award },
      { section: 'duvidas', access: 'duvidas', label: 'Perguntas frequentes', tooltip: 'Perguntas e respostas do site (FAQ) e categorias', summary: 'Mantenha as respostas da Central de Dúvidas.', icon: HelpCircle },
    ],
  },
  {
    id: 'atendimento',
    label: 'Atendimento',
    icon: Headphones,
    items: [
      { section: 'duvidasPublico', access: 'duvidas', label: 'Dúvidas do público', tooltip: 'Ver e registrar o atendimento das dúvidas enviadas pelo site', summary: 'Veja as dúvidas enviadas pelo site e registre o atendimento.', icon: MessagesSquare },
      { section: 'kanban', access: 'kanban', label: 'Aprovações', tooltip: 'Notícias, projetos, conquistas e relatos aguardando aprovação', summary: 'Publique ou recuse o que está aguardando.', icon: ClipboardCheck },
      // Quem aprova projetos, mas não tem a Fila, chega direto à aprovação de projetos.
      { section: 'projetosAprovacao', access: 'projetos', hiddenWithAccess: 'kanban', label: 'Aprovações', tooltip: 'Projetos aguardando aprovação', summary: 'Publique ou recuse os projetos que estão aguardando.', icon: ClipboardCheck },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    items: [
      { section: 'siteInfo', access: 'siteInfo', label: 'Números do site', tooltip: 'Quantidade de alunos, escolas e textos institucionais', summary: 'Atualize os totais de alunos e escolas.', icon: BarChart3 },
      { section: 'redes', access: 'redes', label: 'Redes sociais', tooltip: 'Links de YouTube, Instagram, WhatsApp e contatos', summary: 'Atualize os links das redes sociais e os contatos.', icon: Share2 },
      { section: 'estadosCidades', access: 'estadosCidades', label: 'Estados e municípios', tooltip: 'Cadastrar estados (UF) e municípios', summary: 'Cadastre os estados e os municípios atendidos.', icon: MapPin },
      { section: 'usuarios', access: 'usuarios', label: 'Usuários e acessos', tooltip: 'Cadastrar a equipe por CPF, senhas e permissões', summary: 'Cadastre a equipe e defina os acessos.', icon: UserCog },
    ],
  },
];

// Telas que ficam em abas: o menu destaca o módulo delas.
const MENU_PARENT: Partial<Record<AdminSection, AdminSection>> = {
  projetosTemas: 'projetos',
  projetosMembros: 'projetos',
  projetosAprovacao: 'projetos',
  professoresDisciplinas: 'professores',
  professoresRelatos: 'professores',
  alunosCategorias: 'alunos',
};

export function getFolderIdForSection(section: AdminSection): string | null {
  const inMenu = (target: AdminSection) => ADMIN_MENU.find(folder => folder.items.some(item => item.section === target))?.id;
  return inMenu(section) ?? (MENU_PARENT[section] ? inMenu(MENU_PARENT[section]) ?? null : null);
}

export function getActiveMenuSection(section: AdminSection, folders: { items: { section: AdminSection; visible: boolean }[] }[]): AdminSection {
  const visible = folders.some(folder => folder.items.some(item => item.section === section && item.visible));
  return visible ? section : MENU_PARENT[section] ?? section;
}

// Contadores de pendência aparecem em âmbar; os totais ficam neutros.
export const PENDING_BADGE_SECTIONS: ReadonlySet<AdminSection> = new Set<AdminSection>(['duvidasPublico', 'kanban', 'projetosAprovacao', 'professores']);

// Fonte única da árvore da sidebar; cada tela informa as próprias permissões e contadores.
export function buildAdminMenu(
  access: Record<AdminMenuAccess, boolean>,
  badges: Partial<Record<AdminSection, number | string>> = {},
) {
  return ADMIN_MENU.map(folder => {
    const items = folder.items.map(({ access: rule, hiddenWithAccess, ...item }) => ({
      ...item,
      href: SECTION_CONFIG[item.section].href,
      badge: badges[item.section],
      visible: access[rule] && !(hiddenWithAccess && access[hiddenWithAccess]),
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
