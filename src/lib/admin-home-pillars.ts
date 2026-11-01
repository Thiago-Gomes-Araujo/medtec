/**
 * MEDTEC — Modelo e Validação em Memória dos Quatro Pilares da Home
 *
 * Origem canônica dos dados iniciais: `src/components/TechAdvantages.tsx` (itens P01–P05
 * documentados em `docs/CMS_MAPEAMENTO_CONTEUDOS.md` e estrutura proposta em
 * `docs/CMS_CONTRATOS_BACKEND.md` §§4.2–4.3).
 *
 * Este módulo é puro e determinístico: não realiza chamadas HTTP, não persiste em disco
 * ou localStorage e não altera a Home pública.
 */

export type PillarIconName =
  | 'satellite'
  | 'users'
  | 'heart-handshake'
  | 'leaf'
  | 'tv'
  | 'graduation-cap';

export type PillarVariant =
  | 'tecnologia'
  | 'padrao'
  | 'inclusao'
  | 'sustentabilidade';

export interface HomePillarItem {
  chave: string;
  posicao: number;
  visivel: boolean;
  titulo: string;
  descricao: string;
  selo: string;
  nota: string;
  complemento: string;
  icone: PillarIconName;
  variante: PillarVariant;
  colSpan: 8 | 4;
}

export interface HomePillarsSectionDraft {
  chave: 'pilares';
  tipo: 'cards';
  ancora: 'tecnologia';
  variante: 'pilares';
  visivel: boolean;
  sobretitulo: string;
  titulo: string;
  descricao: string;
  itens: HomePillarItem[];
}

export type PillarItemFieldErrorKey =
  | 'titulo'
  | 'descricao'
  | 'selo'
  | 'nota'
  | 'complemento'
  | 'icone'
  | 'variante';

export type PillarSectionFieldErrorKey = 'sobretitulo' | 'titulo' | 'descricao';

export interface HomePillarsValidationErrors {
  section: Partial<Record<PillarSectionFieldErrorKey, string>>;
  items: Record<string, Partial<Record<PillarItemFieldErrorKey, string>>>;
  hasErrors: boolean;
  errorMessages: string[];
}

export const HOME_PILLARS_LIMITS = Object.freeze({
  sobretitulo: 140,
  secaoTitulo: 180,
  secaoDescricao: 1000,
  itemTitulo: 180,
  itemDescricao: 1000,
  selo: 100,
  nota: 140,
  complemento: 140,
});

export const PILLAR_ICON_OPTIONS: ReadonlyArray<{
  value: PillarIconName;
  label: string;
}> = Object.freeze([
  { value: 'satellite', label: 'Satélite (Transmissão)' },
  { value: 'users', label: 'Educadores / Comunidade (Mediação)' },
  { value: 'heart-handshake', label: 'Acolhimento / Equidade (Inclusão)' },
  { value: 'leaf', label: 'Folha / Sustentabilidade (NBAZ)' },
  { value: 'tv', label: 'Estúdio de TV / Tela' },
  { value: 'graduation-cap', label: 'Formação / Diplomação' },
]);

export const PILLAR_VARIANT_OPTIONS: ReadonlyArray<{
  value: PillarVariant;
  label: string;
}> = Object.freeze([
  { value: 'tecnologia', label: 'Tecnologia Satelital (Azul / Ciano)' },
  { value: 'padrao', label: 'Apoio Pedagógico (Azul Institucional)' },
  { value: 'inclusao', label: 'Equidade e Inclusão (Rosa)' },
  { value: 'sustentabilidade', label: 'Sustentabilidade e NBAZ (Esmeralda)' },
]);

const ALLOWED_ICONS = new Set<string>(PILLAR_ICON_OPTIONS.map((opt) => opt.value));
const ALLOWED_VARIANTS = new Set<string>(PILLAR_VARIANT_OPTIONS.map((opt) => opt.value));

/**
 * Calcula a largura de coluna no Bento Grid (8-4-4-8) conforme a posição ordinal (1 a 4).
 */
export function getBentoColSpanForPosition(posicao: number): 8 | 4 {
  return posicao === 1 || posicao === 4 ? 8 : 4;
}

const INITIAL_HOME_PILLARS_DRAFT: HomePillarsSectionDraft = {
  chave: 'pilares',
  tipo: 'cards',
  ancora: 'tecnologia',
  variante: 'pilares',
  visivel: true,
  sobretitulo: 'Pilares da Mediação Tecnológica • Lei Estadual nº 3.846/2016',
  titulo: 'Por que o MEDTEC é um modelo inovador no Brasil?',
  descricao:
    'Unindo tecnologia satelital de ponta à presença de professores mediadores para garantir o direito à educação pública de qualidade.',
  itens: [
    {
      chave: 'transmissao-satelital',
      posicao: 1,
      visivel: true,
      titulo: 'Transmissão Ao Vivo em Tempo Real via Satélite',
      descricao:
        'Aulas dinâmicas geradas nos estúdios centrais de TV da SEDUC em Porto Velho, com link satelital dedicado de alta disponibilidade para comunidades remotas.',
      selo: 'Transmissão Satelital',
      nota: 'Latência Controlada • Banda C / Ku',
      complemento: 'Porto Velho ↔ 52 Municípios',
      icone: 'satellite',
      variante: 'tecnologia',
      colSpan: 8,
    },
    {
      chave: 'professor-mediador-presencial',
      posicao: 2,
      visivel: true,
      titulo: 'Professor Mediador Presencial',
      descricao:
        'Cada turma conta diariamente com um educador em sala para acolher os alunos, dinamizar exercícios práticos e tirar dúvidas em tempo real.',
      selo: 'Apoio Humano 100%',
      nota: 'Plantão ativo durante as transmissões',
      complemento: '',
      icone: 'users',
      variante: 'padrao',
      colSpan: 4,
    },
    {
      chave: 'equidade-inclusao-geografica',
      posicao: 3,
      visivel: true,
      titulo: 'Equidade & Inclusão Geográfica',
      descricao:
        'Educação pública de excelência onde as escolas tradicionais não chegavam: aldeias indígenas, ribeirinhos, assentamentos e quilombos de Rondônia.',
      selo: 'Universalização',
      nota: 'Ribeirinhos • Indígenas • Rurais',
      complemento: '100% Gratuito',
      icone: 'heart-handshake',
      variante: 'inclusao',
      colSpan: 4,
    },
    {
      chave: 'matriz-bncc-agroecologia',
      posicao: 4,
      visivel: true,
      titulo: 'Matriz BNCC + Agroecologia & Sustentabilidade',
      descricao:
        'O MEDTEC alia a Formação Geral Básica ao componente curricular inovador NBAZ (Agroecologia e Zootecnia) e Projeto de Vida.',
      selo: 'Itinerário NBAZ • SEDUC',
      nota: 'Diploma Oficial SEDUC/Censo Escolar',
      complemento: 'Portaria SEDUC nº 928/2025',
      icone: 'leaf',
      variante: 'sustentabilidade',
      colSpan: 8,
    },
  ],
};

/**
 * Cria uma cópia profunda do estado inicial dos Quatro Pilares extraído de `TechAdvantages.tsx`.
 */
export function createInitialHomePillarsDraft(): HomePillarsSectionDraft {
  return {
    ...INITIAL_HOME_PILLARS_DRAFT,
    itens: INITIAL_HOME_PILLARS_DRAFT.itens.map((item) => ({ ...item })),
  };
}

/**
 * Retorna uma cópia do pilar original correspondente à `chave` informada, ou `null` se inexistente.
 */
export function getInitialHomePillarByKey(chave: string): HomePillarItem | null {
  const found = INITIAL_HOME_PILLARS_DRAFT.itens.find((item) => item.chave === chave);
  return found ? { ...found } : null;
}

/**
 * Reordena um pilar para cima ou para baixo na lista e recalcula `posicao` (1..N) e `colSpan` no Bento Grid.
 */
export function moveHomePillarItem(
  items: readonly HomePillarItem[],
  index: number,
  direction: 'up' | 'down',
): HomePillarItem[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || index >= items.length || targetIndex < 0 || targetIndex >= items.length) {
    return items.map((item) => ({ ...item }));
  }
  const next = items.map((item) => ({ ...item }));
  const temp = next[index];
  next[index] = next[targetIndex];
  next[targetIndex] = temp;

  return next.map((item, idx) => {
    const posicao = idx + 1;
    return {
      ...item,
      posicao,
      colSpan: getBentoColSpanForPosition(posicao),
    };
  });
}

/**
 * Verifica se um card específico sofreu alterações em relação ao seu estado original no código.
 */
export function hasHomePillarItemChanges(item: HomePillarItem): boolean {
  const original = INITIAL_HOME_PILLARS_DRAFT.itens.find((orig) => orig.chave === item.chave);
  if (!original) return true;
  return (
    item.titulo !== original.titulo ||
    item.descricao !== original.descricao ||
    item.selo !== original.selo ||
    item.nota !== original.nota ||
    item.complemento !== original.complemento ||
    item.icone !== original.icone ||
    item.variante !== original.variante ||
    item.visivel !== original.visivel ||
    item.posicao !== original.posicao
  );
}

/**
 * Verifica se o rascunho da seção dos Quatro Pilares possui qualquer diferença em relação ao estado original.
 */
export function hasHomePillarsChanges(
  draft: HomePillarsSectionDraft,
  baseline: HomePillarsSectionDraft = INITIAL_HOME_PILLARS_DRAFT,
): boolean {
  if (
    draft.sobretitulo !== baseline.sobretitulo ||
    draft.titulo !== baseline.titulo ||
    draft.descricao !== baseline.descricao ||
    draft.visivel !== baseline.visivel ||
    draft.itens.length !== baseline.itens.length
  ) {
    return true;
  }

  for (let i = 0; i < draft.itens.length; i += 1) {
    const current = draft.itens[i];
    const orig = baseline.itens[i];
    if (
      !orig ||
      current.chave !== orig.chave ||
      current.posicao !== orig.posicao ||
      current.visivel !== orig.visivel ||
      current.titulo !== orig.titulo ||
      current.descricao !== orig.descricao ||
      current.selo !== orig.selo ||
      current.nota !== orig.nota ||
      current.complemento !== orig.complemento ||
      current.icone !== orig.icone ||
      current.variante !== orig.variante
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Valida em memória os campos do cabeçalho da seção e dos quatro pilares conforme
 * as regras de `docs/CMS_CONTRATOS_BACKEND.md` (§§3.1, 4.2 e 4.3).
 */
export function validateHomePillarsDraft(
  draft: HomePillarsSectionDraft,
): HomePillarsValidationErrors {
  const section: Partial<Record<PillarSectionFieldErrorKey, string>> = {};
  const items: Record<string, Partial<Record<PillarItemFieldErrorKey, string>>> = {};
  const errorMessages: string[] = [];

  const sobretitulo = draft.sobretitulo.trim();
  if (!sobretitulo) {
    section.sobretitulo = 'O sobretítulo da seção é obrigatório.';
    errorMessages.push(section.sobretitulo);
  } else if (sobretitulo.length > HOME_PILLARS_LIMITS.sobretitulo) {
    section.sobretitulo = `O sobretítulo deve ter no máximo ${HOME_PILLARS_LIMITS.sobretitulo} caracteres.`;
    errorMessages.push(section.sobretitulo);
  }

  const secaoTitulo = draft.titulo.trim();
  if (!secaoTitulo) {
    section.titulo = 'O título principal da seção é obrigatório.';
    errorMessages.push(section.titulo);
  } else if (secaoTitulo.length > HOME_PILLARS_LIMITS.secaoTitulo) {
    section.titulo = `O título da seção deve ter no máximo ${HOME_PILLARS_LIMITS.secaoTitulo} caracteres.`;
    errorMessages.push(section.titulo);
  }

  const secaoDescricao = draft.descricao.trim();
  if (!secaoDescricao) {
    section.descricao = 'A descrição introdutória da seção é obrigatória.';
    errorMessages.push(section.descricao);
  } else if (secaoDescricao.length > HOME_PILLARS_LIMITS.secaoDescricao) {
    section.descricao = `A descrição da seção deve ter no máximo ${HOME_PILLARS_LIMITS.secaoDescricao} caracteres.`;
    errorMessages.push(section.descricao);
  }

  draft.itens.forEach((item, index) => {
    const itemErrors: Partial<Record<PillarItemFieldErrorKey, string>> = {};
    const labelPrefix = `Pilar ${index + 1}`;

    const titulo = item.titulo.trim();
    if (!titulo) {
      itemErrors.titulo = 'O título do pilar é obrigatório.';
      errorMessages.push(`${labelPrefix}: ${itemErrors.titulo}`);
    } else if (titulo.length > HOME_PILLARS_LIMITS.itemTitulo) {
      itemErrors.titulo = `O título do pilar deve ter no máximo ${HOME_PILLARS_LIMITS.itemTitulo} caracteres.`;
      errorMessages.push(`${labelPrefix}: ${itemErrors.titulo}`);
    }

    const descricao = item.descricao.trim();
    if (!descricao) {
      itemErrors.descricao = 'A descrição do pilar é obrigatória.';
      errorMessages.push(`${labelPrefix}: ${itemErrors.descricao}`);
    } else if (descricao.length > HOME_PILLARS_LIMITS.itemDescricao) {
      itemErrors.descricao = `A descrição do pilar deve ter no máximo ${HOME_PILLARS_LIMITS.itemDescricao} caracteres.`;
      errorMessages.push(`${labelPrefix}: ${itemErrors.descricao}`);
    }

    const selo = item.selo.trim();
    if (!selo) {
      itemErrors.selo = 'O selo (badge superior) é obrigatório.';
      errorMessages.push(`${labelPrefix}: ${itemErrors.selo}`);
    } else if (selo.length > HOME_PILLARS_LIMITS.selo) {
      itemErrors.selo = `O selo deve ter no máximo ${HOME_PILLARS_LIMITS.selo} caracteres.`;
      errorMessages.push(`${labelPrefix}: ${itemErrors.selo}`);
    }

    const nota = item.nota.trim();
    if (!nota) {
      itemErrors.nota = 'A nota de rodapé principal é obrigatória.';
      errorMessages.push(`${labelPrefix}: ${itemErrors.nota}`);
    } else if (nota.length > HOME_PILLARS_LIMITS.nota) {
      itemErrors.nota = `A nota de rodapé deve ter no máximo ${HOME_PILLARS_LIMITS.nota} caracteres.`;
      errorMessages.push(`${labelPrefix}: ${itemErrors.nota}`);
    }

    const complemento = item.complemento.trim();
    if (complemento.length > HOME_PILLARS_LIMITS.complemento) {
      itemErrors.complemento = `O complemento de rodapé deve ter no máximo ${HOME_PILLARS_LIMITS.complemento} caracteres.`;
      errorMessages.push(`${labelPrefix}: ${itemErrors.complemento}`);
    }

    if (!ALLOWED_ICONS.has(item.icone)) {
      itemErrors.icone = 'Selecione um ícone válido do catálogo.';
      errorMessages.push(`${labelPrefix}: ${itemErrors.icone}`);
    }

    if (!ALLOWED_VARIANTS.has(item.variante)) {
      itemErrors.variante = 'Selecione uma variante visual válida.';
      errorMessages.push(`${labelPrefix}: ${itemErrors.variante}`);
    }

    if (Object.keys(itemErrors).length > 0) {
      items[item.chave] = itemErrors;
    }
  });

  return {
    section,
    items,
    hasErrors: errorMessages.length > 0,
    errorMessages,
  };
}
