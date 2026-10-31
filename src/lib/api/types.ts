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
