/**
 * Tipos e Interfaces da API Backend Oficial MEDTEC Rondônia (Rails API v1)
 * Especificação e contratos definidos em: docs/rotas_front.md / ROTAS_FRONT.md
 */

// ============================================================================
// Envelopes e Respostas Padrão da API
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
  erro_bruto?: string;
  timestamp?: string;
}

// ============================================================================
// Autenticação e Sessão
// ============================================================================

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthUser {
  id: number;
  nome: string;
  cpf: string;
  ativo: boolean;
  perfil_id: number;
  perfil_nome: string;
}

export interface TokenPayload {
  user_id: number;
  perfil_id: number;
  perfil_nome: string;
  usuario_ativo: boolean;
  iat: number;
  exp: number;
  jti: string;
}

// ============================================================================
// Usuários e Perfis
// ============================================================================

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  ativo: boolean;
  perfil_id: number;
  perfil_nome?: string;
  created_at: string;
  updated_at: string;
}

export interface UsuarioCreateInput {
  nome: string;
  cpf: string;
  password: string;
  perfil_id: number;
  ativo?: boolean;
}

export interface UsuarioUpdateInput {
  nome?: string;
  cpf?: string;
  password?: string;
  perfil_id?: number;
  ativo?: boolean;
}

export interface Perfil {
  id: number;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PerfilInput {
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
}

export interface RegraPermissao {
  id: number;
  acao: string;
  descricao: string;
  marcada: boolean;
}

export interface ModuloPermissoes {
  id: number;
  nome: string;
  regras: RegraPermissao[];
}

export interface RegraExtra {
  id: number;
  acao: string;
  descricao: string;
  do_perfil: boolean;
  extra: boolean;
  concedido_por: string | null;
}

export interface ModuloPermissoesExtras {
  id: number;
  nome: string;
  regras: RegraExtra[];
}

// ============================================================================
// Dados Geográficos (Estados e Cidades)
// ============================================================================

export interface Estado {
  id: number;
  nome: string;
  sigla_uf: string;
  codigo_ibge?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EstadoInput {
  nome: string;
  sigla_uf: string;
  codigo_ibge?: string | null;
}

export interface Cidade {
  id: number;
  nome: string;
  codigo_ibge?: string | null;
  g_estado_id: number;
  created_at?: string;
  updated_at?: string;
  g_estado?: Estado;
}

export interface CidadeInput {
  g_estado_id: number;
  nome: string;
  codigo_ibge?: string | null;
}

// ============================================================================
// Avisos e Comunicados Oficiais
// ============================================================================

export interface ATipoAviso {
  id: number;
  nome: string;
  slug: string;
  cor: string;
  posicao: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ATipoAvisoInput {
  nome: string;
  slug: string;
  cor: string;
  posicao?: number;
  ativo?: boolean;
}

export interface AAviso {
  id: number;
  titulo: string;
  a_tipo_aviso_id: number;
  conteudo: string;
  link_texto?: string | null;
  link_url?: string | null;
  ativo: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  a_tipo_aviso?: ATipoAviso;
}

export interface AAvisoInput {
  titulo: string;
  a_tipo_aviso_id: number;
  conteudo: string;
  link_texto?: string | null;
  link_url?: string | null;
  ativo?: boolean;
}

// DTO do site: não contém identificador, ativo ou associação do CMS.
export interface AvisoPublico {
  titulo: string;
  conteudo: string;
  link_texto: string | null;
  link_url: string | null;
  tipo_nome: string;
  tipo_slug: string;
  tipo_cor: string;
  created_at: string;
}

export interface PublicoAvisosParams {
  page?: number | 'all';
  per_page?: number;
  tipo?: string;
}

// Categorias de dúvidas — contrato ROTAS_NOVAS_AVISOS_DUVIDAS.md.
export interface DCategoriaDuvida {
  id: number;
  nome: string;
  slug: string;
  ativo: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DCategoriaDuvidaInput {
  nome: string;
  slug?: string;
  ativo?: boolean;
}

export type DuvidaStatus = 'aguardando' | 'reprovada' | 'publicada';

export interface DDuvida {
  id: number;
  pergunta: string;
  resposta: string;
  d_categoria_duvida_id: number;
  categoria_nome: string;
  n_status_noticia_id: number;
  status: DuvidaStatus;
  status_nome: string;
  autor_id: number;
  autor_nome: string;
  avaliado_por_id: number | null;
  avaliado_por_nome: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DDuvidaInput {
  d_categoria_duvida_id: number;
  pergunta: string;
  resposta: string;
}

export interface DDuvidaVisitante {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  descricao: string;
  respondida: boolean;
  respondida_por_id: number | null;
  respondida_por_nome: string | null;
  respondida_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface DuvidaPublica {
  id: number;
  pergunta: string;
  resposta: string;
  categoria_nome: string;
  categoria_slug: string;
}

export interface CategoriaDuvidaPublica {
  nome: string;
  slug: string;
}

export interface PublicoDuvidasParams {
  categoria?: string;
  busca?: string;
  page?: number;
  per_page?: number;
}

export interface DuvidaVisitantePublicaInput {
  nome: string;
  email: string;
  telefone?: string;
  descricao: string;
}

// ============================================================================
// Professores, relatos e conquistas (docs/ROTAS_PROFESSORES.md e
// docs/ROTAS_CONQUISTAS_ALUNO.md)
// ============================================================================

export type ModeracaoStatus = 'aguardando' | 'reprovada' | 'publicada';

export interface Escola {
  id: number;
  nome: string;
  inep: string | null;
  g_cidade_id: number;
  cidade_nome: string;
}

export interface PDisciplina {
  id: number;
  nome: string;
  slug: string;
  ativo: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PDisciplinaInput {
  nome: string;
  slug?: string;
  ativo?: boolean;
}

export interface PProfessor {
  id: number;
  nome: string;
  pratica_pedagogica: string;
  ativo: boolean;
  escola_id: number;
  escola_nome: string;
  cidade_nome: string;
  p_disciplina_ids: number[];
  disciplinas: { id: number; nome: string }[];
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PProfessorInput {
  nome: string;
  escola_id: number;
  pratica_pedagogica: string;
  ativo?: boolean;
  p_disciplina_ids: number[];
}

export interface PRelato {
  id: number;
  p_professor_id: number;
  professor_nome: string;
  nome: string;
  email: string;
  telefone: string;
  texto: string;
  n_status_noticia_id: number;
  status: ModeracaoStatus;
  status_nome: string;
  avaliado_por_id: number | null;
  avaliado_por_nome: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisciplinaPublica {
  nome: string;
  slug: string;
}

export interface ProfessorPublico {
  id: number;
  nome: string;
  pratica_pedagogica: string;
  escola_nome: string;
  cidade_nome: string;
  disciplinas: DisciplinaPublica[];
}

export interface RelatoPublico {
  nome: string;
  texto: string;
  created_at: string;
}

export interface ProfessorPublicoDetalhe extends ProfessorPublico {
  relatos: RelatoPublico[];
}

export interface PublicoProfessoresParams {
  disciplina?: string;
  cidade?: number;
  busca?: string;
  page?: number | 'all';
  per_page?: number;
}

export interface RelatoPublicoInput {
  nome: string;
  email: string;
  telefone: string;
  texto: string;
}

export interface CCategoriaConquista {
  id: number;
  nome: string;
  slug: string;
  ativo: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CCategoriaConquistaInput {
  nome: string;
  slug?: string;
  ativo?: boolean;
}

export interface CConquistaAluno {
  id: number;
  nome_aluno: string;
  titulo: string;
  relato: string;
  c_categoria_conquista_aluno_id: number;
  categoria_nome: string;
  escola_id: number;
  escola_nome: string;
  cidade_nome: string;
  imagem_url: string | null;
  imagem: string | null;
  n_status_noticia_id: number;
  status: ModeracaoStatus;
  status_nome: string;
  autor_id: number | null;
  autor_nome: string | null;
  avaliado_por_id: number | null;
  avaliado_por_nome: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CConquistaAlunoInput {
  nome_aluno: string;
  titulo: string;
  relato: string;
  c_categoria_conquista_aluno_id: number;
  escola_id: number;
  imagem?: File;
  imagem_url?: string;
}

export interface ConquistaPublica {
  id: number;
  nome_aluno: string;
  titulo: string;
  relato: string;
  categoria_nome: string;
  categoria_slug: string;
  escola_nome: string;
  cidade_nome: string;
  imagem: string | null;
  imagem_url: string | null;
  created_at: string;
}

export interface CategoriaConquistaPublica {
  nome: string;
  slug: string;
}

export interface PublicoConquistasParams {
  categoria?: string;
  cidade?: number;
  busca?: string;
  page?: number | 'all';
  per_page?: number;
}

// ============================================================================
// Galeria de Fotos
// ============================================================================

export interface CategoriaGaleria {
  id: number;
  nome: string;
  slug: string;
  posicao: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaGaleriaInput {
  nome: string;
  slug: string;
  posicao?: number;
  ativo?: boolean;
}

export interface FotoGaleria {
  id: number;
  titulo: string;
  categoria_galeria_id: number;
  descricao?: string | null;
  imagem_url?: string | null;
  imagem?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  categoria_galeria?: CategoriaGaleria;
}

export interface FotoGaleriaJsonInput {
  foto_galeria: {
    titulo: string;
    categoria_galeria_id: number;
    descricao?: string | null;
    imagem_url?: string | null;
  };
}

// ============================================================================
// Canais de Contato Institucionais
// ============================================================================

export type CanalRedeFixa =
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'whatsapp'
  | 'telefone'
  | 'email'
  | 'endereco'
  | string;

export interface CanalContato {
  id?: number;
  rede: CanalRedeFixa;
  valor: string;
  posicao: number;
  ativo: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CanalContatoInput {
  id?: number;
  rede: CanalRedeFixa;
  valor?: string;
  posicao?: number;
  ordem?: number;
  ativo?: boolean;
}

// ============================================================================
// Notícias (Contratos Oficiais Rails API v1 - ROTAS_FRONT.md seções 18 e 19)
// ============================================================================

export type NNoticiaStatusSlug = 'aguardando' | 'reprovada' | 'publicada' | string;

export interface NNoticia {
  id: number;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string;
  data_publicacao: string;
  n_categoria_noticia_id: number;
  categoria_nome: string;
  n_status_noticia_id: number;
  status: NNoticiaStatusSlug;
  status_nome: string;
  motivo_reprovacao: string | null;
  autor_id: number;
  autor_nome: string;
  avaliado_por_id: number | null;
  avaliado_por_nome: string | null;
  imagem_capa: string | null;
  created_at: string;
  updated_at: string;
}

export interface NNoticiaInput {
  titulo: string;
  conteudo: string;
  n_categoria_noticia_id: number;
  data_publicacao?: string;
  imagem_capa_url?: string;
  resumo?: string;
}

export interface NCategoriaNoticia {
  id: number;
  nome: string;
  slug: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NCategoriaNoticiaInput {
  nome: string;
  slug: string;
  ativo?: boolean;
}

export interface NStatusNoticia {
  id: number;
  nome: string;
  slug: string;
}

export interface NoticiaPublica {
  slug: string;
  titulo: string;
  resumo: string | null;
  conteudo: string;
  data_publicacao: string;
  categoria_nome: string;
  categoria_slug: string;
  autor_nome: string;
  imagem_capa: string | null;
}

export interface CategoriaPublica {
  nome: string;
  slug: string;
}

export interface PublicoNoticiasParams {
  categoria?: string;
  busca?: string;
  page?: number | 'all';
  per_page?: number;
  [key: string]: unknown;
}

// Adaptador retrocompatível
export interface NoticiaApi {
  id: number | string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagem_capa?: string | null;
  autor?: string;
  categoria_id?: number;
  categoria_nome?: string;
  data_publicacao?: string;
  destaque?: boolean;
  urgente?: boolean;
  publicado?: boolean;
  visualizacoes?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Parâmetros de Busca e Filtros
// ============================================================================

export type QueryFilterValue = string | number | boolean | null | undefined | (string | number)[];

export interface QueryParams {
  page?: number | 'all';
  per_page?: number;
  limit?: number;
  items?: number;
  q?: Record<string, QueryFilterValue>;
  [key: string]: unknown;
}

// Projetos pedagógicos — contrato docs/ROTAS_PROJETOS.md.
export interface PjTema {
  id: number;
  nome: string;
  slug: string;
  ativo: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PjTemaInput {
  nome: string;
  slug?: string;
  ativo?: boolean;
}

export interface PjMembro {
  id: number;
  nome: string;
  cpf: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PjMembroInput {
  nome: string;
  cpf: string;
}

export interface PjAnexo {
  id: number;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
}

// `id` é o do vínculo com o projeto; `pj_membro_id` é o do membro.
export interface PjProjetoMembro {
  id: number;
  pj_membro_id: number;
  nome: string;
  cpf: string;
  funcao: string;
}

export interface PjProjeto {
  id: number;
  titulo: string;
  relato: string;
  pj_tema_id: number;
  tema_nome: string;
  escola_id: number;
  escola_nome: string;
  cidade_nome: string;
  imagem_url: string | null;
  imagem: string | null;
  anexos: PjAnexo[];
  membros: PjProjetoMembro[];
  n_status_noticia_id: number;
  status: ModeracaoStatus;
  status_nome: string;
  autor_id: number | null;
  autor_nome: string | null;
  avaliado_por_id: number | null;
  avaliado_por_nome: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Novo vínculo, troca de função ou saída do projeto: só o que muda é enviado.
export type PjProjetoMembroAttribute =
  | { pj_membro_id: number; funcao: string }
  | { id: number; funcao: string }
  | { id: number; _destroy: true };

export interface PjProjetoInput {
  titulo: string;
  relato: string;
  pj_tema_id: number;
  escola_id: number;
  imagem?: File;
  imagem_url?: string;
  anexos?: File[];
  pj_projeto_membros_attributes?: PjProjetoMembroAttribute[];
}

export interface ProjetoPublico {
  id: number;
  titulo: string;
  relato: string;
  tema_nome: string;
  tema_slug: string;
  escola_nome: string;
  cidade_nome: string;
  imagem: string | null;
  imagem_url: string | null;
  created_at: string;
}

export interface ProjetoPublicoDetalhe extends ProjetoPublico {
  membros: { nome: string; funcao: string }[];
  anexos: PjAnexo[];
}

export interface TemaProjetoPublico {
  nome: string;
  slug: string;
}

export interface PublicoProjetosParams {
  tema?: string;
  cidade?: number;
  busca?: string;
  page?: number | 'all';
  per_page?: number;
}

// Banners da home — contrato docs/ROTAS_BANNERS.md. `imagem` já vem como URL completa.
export interface BBanner {
  id: number;
  imagem: string | null;
  imagem_url: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export type BBannerInput = { imagem: File; imagem_url?: never } | { imagem_url: string; imagem?: never };

export interface BannerPublico {
  id: number;
  imagem: string;
}

// Galeria do site: `imagem` é um caminho do arquivo enviado ou o link externo.
export interface FotoGaleriaPublica {
  id: number;
  titulo: string;
  descricao: string | null;
  imagem: string | null;
  categoria_nome: string | null;
  categoria_slug: string | null;
}

export interface PublicoGaleriaParams {
  categoria?: string;
  page?: number | 'all';
  per_page?: number;
}
