import { validateEditorialFields, validateMediaFields } from './admin-community-validation';

/**
 * Modelo, validações e dados iniciais em memória para o módulo
 * administrativo de Professores e Mediadores do MEDTEC.
 *
 * Em conformidade com:
 * - docs/CMS_MAPEAMENTO_CONTEUDOS.md (Seção 7.2)
 * - docs/CMS_CONTRATOS_BACKEND.md (Seções 7.4, 9.2, 9.4, 12.9 e 13)
 */

export type TeacherRole = 'ministrante' | 'mediador';

export type EditorialStatus =
  | 'rascunho'
  | 'em_revisao'
  | 'publicado'
  | 'reprovado'
  | 'despublicado';

export interface TeacherMaterial {
  id?: number;
  titulo: string;
  url: string;
}

export interface TeacherDraft {
  id: number;
  nome: string;
  slug: string;
  codigo_exibicao: string; // Ex.: "DOC-001"
  funcao: TeacherRole;
  rotulo_funcao: string; // "Ministrante", "Mediador", "Mediadora"
  disciplina: string;
  componente_curricular_ids?: number[];
  g_cidade_id: number;
  municipio_nome: string;
  escola_id?: number | null;
  escola_nome: string;
  comunidade?: string;
  tag_territorial?: string; // Ex.: "Capital • Estúdio Central"
  resumo: string; // Prática pedagógica
  entrevista: string; // Entrevista completa
  orientacao_estudantes?: string; // Recomendações aos alunos
  foto_url?: string;
  foto_alt?: string;
  foto_focal_x?: number;
  foto_focal_y?: number;
  termo_imagem_confirmado?: boolean;
  materiais?: TeacherMaterial[];
  destaque_home: boolean;
  posicao_home?: number;
  destaque_metodologia?: boolean;
  posicao: number;
  status: EditorialStatus;
  motivo_reprovacao?: string;
  created_at?: string;
  updated_at?: string;
}

export const TEACHER_FIELD_LIMITS = {
  nome: { min: 3, max: 120 },
  slug: { min: 3, max: 140 },
  disciplina: { min: 2, max: 120 },
  escola_nome: { min: 3, max: 160 },
  comunidade: { min: 2, max: 80 },
  tag_territorial: { min: 2, max: 80 },
  resumo: { min: 20, max: 600 },
  entrevista: { min: 40, max: 4000 },
  orientacao_estudantes: { min: 20, max: 800 },
  posicao: { min: 1, max: Number.MAX_SAFE_INTEGER },
  posicao_home: { min: 1, max: 10 },
} as const;

export interface RondoniaMunicipality {
  id: number;
  nome: string;
}

// Chaves negativas apenas para filtros da demonstração; nunca são FKs Rails.
// O seletor oficial deverá consumir /g_cidades após homologação.
export const DEMO_MUNICIPALITIES: readonly RondoniaMunicipality[] = [
  { id: -1, nome: 'Município fictício A' },
  { id: -2, nome: 'Município fictício B' },
];

export function generateTeacherSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(prof\.|profa\.|dr\.|dra\.)\s*/i, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTeacherInitials(name: string): string {
  const parts = name.replace(/^(Prof\.|Profa\.|Dr\.|Dra\.)\s*/i, '').trim().split(' ');
  if (parts.length === 0 || !parts[0]) return 'PR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Exemplos sintéticos para revisão da interface, sem pessoas ou vínculos reais. */
export const INITIAL_TEACHERS_CATALOG: readonly TeacherDraft[] = [
  {
    ...createEmptyTeacherDraft(1), nome: 'Docente fictício A', slug: 'docente-ficticio-a',
    funcao: 'ministrante', rotulo_funcao: 'Ministrante', disciplina: 'Matemática',
    g_cidade_id: -1, municipio_nome: 'Município fictício A', escola_nome: 'Escola de demonstração A',
    resumo: 'Exemplo fictício de prática pedagógica com atividades colaborativas em sala.',
    entrevista: 'Entrevista inteiramente fictícia para demonstrar a leitura do perfil e sua trajetória pedagógica.',
    orientacao_estudantes: 'Orientação fictícia: organize uma rotina de estudos e compartilhe suas dúvidas.',
    destaque_home: true, posicao_home: 1,
  },
  {
    ...createEmptyTeacherDraft(2), nome: 'Docente fictício B', slug: 'docente-ficticio-b',
    disciplina: 'Ciências da Natureza', g_cidade_id: -2, municipio_nome: 'Município fictício B',
    escola_nome: 'Escola de demonstração B',
    resumo: 'Exemplo fictício de acompanhamento presencial e investigação científica em grupo.',
    entrevista: 'Relato fictício de mediação presencial, utilizado exclusivamente para avaliar o formulário administrativo.',
  },
];

export function createInitialTeachersList(): TeacherDraft[] {
  return INITIAL_TEACHERS_CATALOG.map((t) => ({
    ...t,
    materiais: t.materiais ? t.materiais.map((m) => ({ ...m })) : [],
  }));
}

export function createEmptyTeacherDraft(nextId = 1): TeacherDraft {
  return {
    id: nextId,
    nome: '',
    slug: '',
    codigo_exibicao: `DOC-${String(nextId).padStart(3, '0')}`,
    funcao: 'mediador',
    rotulo_funcao: 'Mediador',
    disciplina: '',
    g_cidade_id: 0,
    municipio_nome: '',
    escola_id: null,
    escola_nome: '',
    comunidade: '',
    tag_territorial: '',
    resumo: '',
    entrevista: '',
    orientacao_estudantes: '',
    foto_url: '',
    foto_alt: '',
    foto_focal_x: 50,
    foto_focal_y: 50,
    termo_imagem_confirmado: false,
    materiais: [],
    destaque_home: false,
    posicao_home: 1,
    destaque_metodologia: false,
    posicao: nextId,
    status: 'rascunho',
  };
}

export function hasTeacherChanges(current: TeacherDraft, original: TeacherDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(original);
}

export interface TeacherValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  summary: string[];
}

export function validateTeacherDraft(draft: TeacherDraft): TeacherValidationResult {
  const errors: Record<string, string> = {};
  const summary: string[] = [];

  const trimmedNome = draft.nome.trim();
  if (!trimmedNome) {
    errors.nome = 'O nome de exibição do docente é obrigatório.';
    summary.push('Informe o nome de exibição.');
  } else if (trimmedNome.length < TEACHER_FIELD_LIMITS.nome.min) {
    errors.nome = `O nome deve conter ao menos ${TEACHER_FIELD_LIMITS.nome.min} caracteres.`;
    summary.push('Nome muito curto.');
  } else if (trimmedNome.length > TEACHER_FIELD_LIMITS.nome.max) {
    errors.nome = `O nome deve conter no máximo ${TEACHER_FIELD_LIMITS.nome.max} caracteres.`;
    summary.push('Nome excede o limite permitido.');
  }

  const trimmedSlug = draft.slug.trim();
  if (!trimmedSlug) {
    errors.slug = 'O identificador amigável (slug) é obrigatório.';
    summary.push('Informe o slug do perfil.');
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
    errors.slug = 'O slug deve conter apenas letras minúsculas, números e hífens.';
    summary.push('Formato de slug inválido.');
  }

  const trimmedDisciplina = draft.disciplina.trim();
  if (!trimmedDisciplina) {
    errors.disciplina = 'A disciplina ou especialidade é obrigatória.';
    summary.push('Informe a disciplina/especialidade.');
  } else if (trimmedDisciplina.length > TEACHER_FIELD_LIMITS.disciplina.max) {
    errors.disciplina = `A disciplina não pode ultrapassar ${TEACHER_FIELD_LIMITS.disciplina.max} caracteres.`;
    summary.push('Disciplina excede o limite.');
  }

  const trimmedEscola = draft.escola_nome.trim();
  if (!trimmedEscola && !draft.escola_id) {
    errors.escola_nome = 'A unidade escolar ou estúdio de lotação é obrigatório.';
    summary.push('Informe a unidade de lotação.');
  } else if (trimmedEscola.length > TEACHER_FIELD_LIMITS.escola_nome.max) {
    errors.escola_nome = `O nome da unidade não pode ultrapassar ${TEACHER_FIELD_LIMITS.escola_nome.max} caracteres.`;
    summary.push('Nome da unidade excede o limite.');
  }

  const trimmedResumo = draft.resumo.trim();
  if (!trimmedResumo) {
    errors.resumo = 'O resumo da prática pedagógica é obrigatório.';
    summary.push('Informe o resumo da prática pedagógica.');
  } else if (trimmedResumo.length < TEACHER_FIELD_LIMITS.resumo.min) {
    errors.resumo = `O resumo deve conter ao menos ${TEACHER_FIELD_LIMITS.resumo.min} caracteres (atualmente ${trimmedResumo.length}).`;
    summary.push('Resumo da prática pedagógica muito curto.');
  } else if (trimmedResumo.length > TEACHER_FIELD_LIMITS.resumo.max) {
    errors.resumo = `O resumo não pode ultrapassar ${TEACHER_FIELD_LIMITS.resumo.max} caracteres (atualmente ${trimmedResumo.length}).`;
    summary.push('Resumo da prática pedagógica excede o limite.');
  }

  const trimmedEntrevista = draft.entrevista.trim();
  if (!trimmedEntrevista) {
    errors.entrevista = 'O depoimento/entrevista completa é obrigatório.';
    summary.push('Informe o texto da entrevista.');
  } else if (trimmedEntrevista.length < TEACHER_FIELD_LIMITS.entrevista.min) {
    errors.entrevista = `A entrevista deve conter ao menos ${TEACHER_FIELD_LIMITS.entrevista.min} caracteres (atualmente ${trimmedEntrevista.length}).`;
    summary.push('Texto da entrevista muito curto.');
  } else if (trimmedEntrevista.length > TEACHER_FIELD_LIMITS.entrevista.max) {
    errors.entrevista = `A entrevista não pode ultrapassar ${TEACHER_FIELD_LIMITS.entrevista.max} caracteres.`;
    summary.push('Texto da entrevista excede o limite.');
  }

  if (draft.foto_url && draft.foto_url.trim()) {
    if (!draft.foto_alt || !draft.foto_alt.trim()) {
      errors.foto_alt = 'O texto alternativo da foto é obrigatório para acessibilidade.';
      summary.push('Informe a descrição de acessibilidade (alt) da fotografia.');
    }
    if (!draft.termo_imagem_confirmado) {
      errors.termo_imagem_confirmado = 'É necessário confirmar a autorização institucional de uso de imagem do servidor público.';
      summary.push('Confirme a autorização de uso de imagem.');
    }
  }

  validateEditorialFields(draft, TEACHER_FIELD_LIMITS, errors);
  if (!['ministrante', 'mediador'].includes(draft.funcao)) errors.funcao = 'Selecione uma função válida.';
  if (draft.rotulo_funcao && (draft.rotulo_funcao.trim().length < 3 || draft.rotulo_funcao.trim().length > 60)) errors.rotulo_funcao = 'O rótulo deve conter de 3 a 60 caracteres.';
  if (!draft.escola_id && (draft.escola_nome.trim().length < 3 || draft.escola_nome.trim().length > 160)) errors.escola_nome = 'Informe a escola (3 a 160 caracteres).';
  if (draft.componente_curricular_ids && (draft.componente_curricular_ids.length > 10 || draft.componente_curricular_ids.some(id => !Number.isInteger(id) || id < 1))) errors.componente_curricular_ids = 'Selecione até dez componentes oficiais.';
  validateMediaFields(draft, errors);
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    summary: [...new Set([...summary, ...Object.values(errors)])],
  };
}
