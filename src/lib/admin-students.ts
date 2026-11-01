import { validateEditorialFields, validateMediaFields, isCalendarDate } from './admin-community-validation';

/**
 * Modelo, validações, regras de conformidade LGPD / ECA e dados iniciais
 * em memória para o módulo administrativo de Alunos que Inspiram do MEDTEC.
 *
 * Em conformidade com:
 * - docs/CMS_MAPEAMENTO_CONTEUDOS.md (Seção 7.2)
 * - docs/CMS_CONTRATOS_BACKEND.md (Seções 7.5, 9.2, 9.4, 12.10 e 13)
 * - Lei Federal nº 13.709/2018 (LGPD, Art. 14)
 * - Lei Federal nº 8.069/1990 (ECA, Art. 17)
 */

export type StudentCategory =
  | 'Vestibular'
  | 'Olimpíada'
  | 'Robótica'
  | 'Feira de Ciências';

export type LgpdSignatarioVinculo =
  | 'mae'
  | 'pai'
  | 'responsavel_legal'
  | 'titular_maior';

export type LgpdStatus =
  | 'pendente'
  | 'verificado'
  | 'expirado'
  | 'revogado';

export type EditorialStatus =
  | 'rascunho'
  | 'em_revisao'
  | 'publicado'
  | 'reprovado'
  | 'despublicado';

export interface StudentConsentLgpd {
  menor_de_idade: boolean;
  nome_signatario: string;
  vinculo_signatario: LgpdSignatarioVinculo;
  documento_signatario_mascarado?: string; // Ex.: "***.456.789-**"
  termo_anexado: boolean; // Indicador de arquivo presente sem armazenar documento real
  termo_arquivo_nome?: string; // Nome textual de referência, somente referência devolvida pelo futuro serviço privado
  autoriza_nome_relato: boolean;
  autoriza_imagem_foto: boolean;
  autoriza_exibicao_home: boolean;
  data_assinatura: string;
  validade_ate?: string;
  status_lgpd: LgpdStatus;
  verificado_em?: string;
  revogado_em?: string;
  motivo_revogacao?: string;
}

export interface StudentDraft {
  id: number;
  nome_exibicao: string;
  slug: string;
  idade_referencia?: number;
  exibir_idade: boolean;
  categoria: StudentCategory;
  conquista: string;
  ano_conquista?: number;
  serie_turma?: string;
  g_cidade_id: number;
  municipio_nome: string;
  escola_id?: number | null;
  escola_nome: string;
  comunidade: string;
  resumo: string; // Citação/síntese da trajetória
  relato_completo?: string; // Depoimento completo
  professor_mediador_nome?: string;
  materiais?: { titulo: string; url: string }[];
  foto_url?: string;
  foto_alt?: string;
  destaque_pagina: boolean; // Destaque Territorial (topo de /alunos)
  destaque_home: boolean;
  posicao_home?: number;
  posicao: number;
  status: EditorialStatus;
  motivo_reprovacao?: string;
  consentimento_lgpd: StudentConsentLgpd;
  created_at?: string;
  updated_at?: string;
}

export const STUDENT_FIELD_LIMITS = {
  nome_exibicao: { min: 3, max: 120 },
  slug: { min: 3, max: 140 },
  idade_referencia: { min: 10, max: 99 },
  conquista: { min: 5, max: 160 },
  escola_nome: { min: 3, max: 160 },
  comunidade: { min: 2, max: 120 },
  resumo: { min: 20, max: 600 },
  relato_completo: { min: 40, max: 4000 },
  posicao: { min: 1, max: Number.MAX_SAFE_INTEGER },
  posicao_home: { min: 1, max: 10 },
} as const;

export const STUDENT_CATEGORIES: readonly StudentCategory[] = Object.freeze([
  'Vestibular',
  'Olimpíada',
  'Robótica',
  'Feira de Ciências',
]);

export function generateStudentSlug(conquista: string, nome: string): string {
  const base = `${nome}-${conquista}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.slice(0, 140).replace(/-+$/, '');
}

/** Exemplos sintéticos. Não incluem responsáveis, documentos ou autorizações reais. */
export const INITIAL_STUDENTS_CATALOG: readonly StudentDraft[] = STUDENT_CATEGORIES.map((categoria, index) => ({
  ...createEmptyStudentDraft(index + 1), nome_exibicao: `Estudante fictício ${index + 1}`,
  slug: `estudante-ficticio-${index + 1}`, categoria,
  conquista: `Conquista fictícia — ${categoria}`, g_cidade_id: index % 2 ? -2 : -1,
  municipio_nome: index % 2 ? 'Município fictício B' : 'Município fictício A',
  escola_nome: `Escola de demonstração ${index + 1}`, comunidade: 'Comunidade fictícia',
  resumo: 'História inteiramente fictícia para avaliar a apresentação de uma conquista estudantil.',
  relato_completo: 'Esta trajetória é um exemplo sintético, sem correspondência com estudantes, resultados ou instituições reais.',
  destaque_pagina: index === 0, destaque_home: index === 0,
}));

export function createInitialStudentsList(): StudentDraft[] {
  return INITIAL_STUDENTS_CATALOG.map((s) => ({
    ...s,
    consentimento_lgpd: { ...s.consentimento_lgpd },
  }));
}

export function createEmptyStudentDraft(nextId = 1): StudentDraft {
  return {
    id: nextId,
    nome_exibicao: '',
    slug: '',
    idade_referencia: undefined,
    exibir_idade: false,
    categoria: 'Vestibular',
    conquista: '',
    ano_conquista: 2026,
    serie_turma: '3ª Série do Ensino Médio',
    g_cidade_id: 0,
    municipio_nome: '',
    escola_id: null,
    escola_nome: '',
    comunidade: '',
    resumo: '',
    relato_completo: '',
    professor_mediador_nome: '',
    foto_url: '',
    foto_alt: '',
    destaque_pagina: false,
    destaque_home: false,
    posicao_home: 1,
    posicao: nextId,
    status: 'rascunho',
    consentimento_lgpd: {
      menor_de_idade: true,
      nome_signatario: '',
      vinculo_signatario: 'mae',
      documento_signatario_mascarado: '',
      termo_anexado: false,
      autoriza_nome_relato: false,
      autoriza_imagem_foto: false,
      autoriza_exibicao_home: false,
      data_assinatura: '',
      status_lgpd: 'pendente',
    },
  };
}

export function hasStudentChanges(current: StudentDraft, original: StudentDraft): boolean {
  return JSON.stringify(current) !== JSON.stringify(original);
}

export interface StudentValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  summary: string[];
  lgpdBlocked: boolean;
}

export function validateStudentDraft(draft: StudentDraft, referenceDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Porto_Velho', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())): StudentValidationResult {
  const errors: Record<string, string> = {};
  let lgpdBlocked = false;

  const trimmedNome = draft.nome_exibicao.trim();
  if (!trimmedNome) {
    errors.nome_exibicao = 'O nome de exibição do estudante é obrigatório.';
  } else if (trimmedNome.length < STUDENT_FIELD_LIMITS.nome_exibicao.min || trimmedNome.length > STUDENT_FIELD_LIMITS.nome_exibicao.max) {
    errors.nome_exibicao = `O nome deve conter de ${STUDENT_FIELD_LIMITS.nome_exibicao.min} a ${STUDENT_FIELD_LIMITS.nome_exibicao.max} caracteres.`;
  }

  const trimmedSlug = draft.slug.trim();
  if (!trimmedSlug) {
    errors.slug = 'O identificador amigável (slug) é obrigatório.';
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
    errors.slug = 'O slug deve conter apenas letras minúsculas, números e hífens.';
  } else if (trimmedSlug.length < STUDENT_FIELD_LIMITS.slug.min || trimmedSlug.length > STUDENT_FIELD_LIMITS.slug.max) {
    errors.slug = `O slug deve conter de ${STUDENT_FIELD_LIMITS.slug.min} a ${STUDENT_FIELD_LIMITS.slug.max} caracteres.`;
  }

  const trimmedConquista = draft.conquista.trim();
  if (!trimmedConquista) {
    errors.conquista = 'O título da conquista de destaque é obrigatório.';
  } else if (trimmedConquista.length < STUDENT_FIELD_LIMITS.conquista.min || trimmedConquista.length > STUDENT_FIELD_LIMITS.conquista.max) {
    errors.conquista = `A conquista deve conter de ${STUDENT_FIELD_LIMITS.conquista.min} a ${STUDENT_FIELD_LIMITS.conquista.max} caracteres.`;
  }

  const trimmedEscola = draft.escola_nome.trim();
  if (!trimmedEscola && !draft.escola_id) {
    errors.escola_nome = 'A escola estadual ou polo do estudante é obrigatório.';
  } else if (trimmedEscola && (trimmedEscola.length < STUDENT_FIELD_LIMITS.escola_nome.min || trimmedEscola.length > STUDENT_FIELD_LIMITS.escola_nome.max)) {
    errors.escola_nome = `A escola deve conter de ${STUDENT_FIELD_LIMITS.escola_nome.min} a ${STUDENT_FIELD_LIMITS.escola_nome.max} caracteres.`;
  }

  const trimmedComunidade = draft.comunidade.trim();
  if (!trimmedComunidade) {
    errors.comunidade = 'A comunidade de origem é obrigatória (ex.: Distrito, Aldeia, Linha Rural).';
  } else if (trimmedComunidade.length < STUDENT_FIELD_LIMITS.comunidade.min || trimmedComunidade.length > STUDENT_FIELD_LIMITS.comunidade.max) {
    errors.comunidade = `A comunidade deve conter de ${STUDENT_FIELD_LIMITS.comunidade.min} a ${STUDENT_FIELD_LIMITS.comunidade.max} caracteres.`;
  }

  const trimmedResumo = draft.resumo.trim();
  if (!trimmedResumo) {
    errors.resumo = 'O resumo/depoimento da trajetória é obrigatório.';
  } else if (trimmedResumo.length < STUDENT_FIELD_LIMITS.resumo.min || trimmedResumo.length > STUDENT_FIELD_LIMITS.resumo.max) {
    errors.resumo = `O resumo deve conter de ${STUDENT_FIELD_LIMITS.resumo.min} a ${STUDENT_FIELD_LIMITS.resumo.max} caracteres.`;
  }

  // Validações de foto
  if (draft.foto_url && draft.foto_url.trim()) {
    if (!draft.foto_alt || !draft.foto_alt.trim()) {
      errors.foto_alt = 'A descrição da fotografia (alt) é obrigatória para acessibilidade.';
    }
    if (!draft.consentimento_lgpd.autoriza_imagem_foto) {
      errors.autoriza_imagem_foto = 'Para exibir fotografia é obrigatório haver consentimento expresso no Termo LGPD.';
      lgpdBlocked = true;
    }
  }

  // Validações estritas de conformidade LGPD e ECA
  const lgpd = draft.consentimento_lgpd;

  if (draft.destaque_home && !lgpd.autoriza_exibicao_home) {
    errors.autoriza_exibicao_home = 'Para destacar na Home é obrigatória a autorização de exibição de capa no Termo LGPD.';
    lgpdBlocked = true;
  }

  if (lgpd.status_lgpd === 'revogado') {
    errors.status_lgpd = 'O consentimento deste estudante foi revogado. O registro não pode ser publicado.';
    lgpdBlocked = true;
  } else if (lgpd.status_lgpd === 'expirado') {
    errors.status_lgpd = 'O termo de autorização expirou a data de validade. Necessária renovação antes de publicar.';
    lgpdBlocked = true;
  } else if (draft.status === 'publicado' && lgpd.status_lgpd !== 'verificado') {
    errors.status_lgpd = 'Para publicar, a equipe jurídica/editorial deve confirmar a verificação do termo LGPD assinado.';
    lgpdBlocked = true;
  }

  if (draft.status === 'em_revisao' || draft.status === 'publicado') {
    if (!lgpd.termo_anexado) {
      errors.termo_anexado = 'O Termo de Autorização LGPD/ECA assinado deve estar digitalizado e verificado para envio à revisão ou publicação.';
      lgpdBlocked = true;
    }

    if (!lgpd.nome_signatario || !lgpd.nome_signatario.trim()) {
      errors.nome_signatario = 'O nome completo do responsável legal (ou titular maior) signatário é obrigatório.';
      lgpdBlocked = true;
    }

    if (!lgpd.autoriza_nome_relato) {
      errors.autoriza_nome_relato = 'O termo deve autorizar expressamente a veiculação do nome e relato educacional.';
      lgpdBlocked = true;
    }
  }

  validateEditorialFields(draft, STUDENT_FIELD_LIMITS, errors);
  if (!STUDENT_CATEGORIES.includes(draft.categoria)) errors.categoria = 'Selecione uma categoria válida.';
  if (draft.ano_conquista != null && (!Number.isInteger(draft.ano_conquista) || draft.ano_conquista < 2016 || draft.ano_conquista > 2100)) errors.ano_conquista = 'Informe um ano entre 2016 e 2100.';
  if (draft.serie_turma && (draft.serie_turma.trim().length < 2 || draft.serie_turma.trim().length > 60)) errors.serie_turma = 'A série/turma deve conter de 2 a 60 caracteres.';
  if (draft.exibir_idade && draft.idade_referencia == null) errors.idade_referencia = 'Informe a idade para exibi-la.';
  validateMediaFields(draft, errors);

  const today = referenceDate;
  if (lgpd.data_assinatura && (!isCalendarDate(lgpd.data_assinatura) || lgpd.data_assinatura > today)) {
    errors.data_assinatura = 'A assinatura deve ter data válida e não futura.';
    lgpdBlocked = true;
  }
  if (lgpd.validade_ate && (!isCalendarDate(lgpd.validade_ate) || lgpd.validade_ate < today || lgpd.validade_ate < lgpd.data_assinatura)) {
    errors.validade_ate = 'A autorização está vencida ou tem validade inválida.';
    lgpdBlocked = true;
  }
  if (['em_revisao', 'publicado'].includes(draft.status)) {
    if (!lgpd.data_assinatura) { errors.data_assinatura = 'Informe a data da assinatura.'; lgpdBlocked = true; }
    if (lgpd.nome_signatario.trim().length < 5 || lgpd.nome_signatario.trim().length > 140) { errors.nome_signatario = 'O signatário deve conter de 5 a 140 caracteres.'; lgpdBlocked = true; }
    const permitted = lgpd.menor_de_idade ? ['mae', 'pai', 'responsavel_legal'] : ['titular_maior'];
    if (!permitted.includes(lgpd.vinculo_signatario)) { errors.vinculo_signatario = 'O vínculo do signatário é incompatível com a titularidade.'; lgpdBlocked = true; }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    summary: Object.values(errors),
    lgpdBlocked,
  };
}
