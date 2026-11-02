/**
 * Ponto Central de Exportação do Módulo de Integração com a API Backend MEDTEC
 * Concentra cliente HTTP, autenticação, gerenciamento de tokens, erros e serviços por domínio.
 */

import { apiFetch, getApiBaseUrl, getApiServerUrl, getMediaUrl, API_BASE_URL, API_SERVER_URL } from './client';
import { ApiError } from './errors';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  decodeAccessToken,
  isAccessTokenExpired,
  onTokensChange,
} from './tokens';

import { authService } from './services/auth.service';
import { usuariosService } from './services/usuarios.service';
import { perfisService } from './services/perfis.service';
import { estadosService, cidadesService } from './services/geografia.service';
import { avisosService, tiposAvisoService } from './services/avisos.service';
import { categoriasGaleriaService, fotosGaleriaService } from './services/galeria.service';
import { canaisService } from './services/canais.service';
import { noticiasService } from './services/noticias.service';
import { categoriasDuvidaService, duvidasService, duvidasVisitanteService, duvidasPublicasService } from './services/duvidas.service';
import { escolasService } from './services/escolas.service';
import { disciplinasProfessorService, professoresService, relatosService, professoresPublicosService } from './services/professores.service';
import { categoriasConquistaService, conquistasService, conquistasPublicasService } from './services/conquistas.service';
import { temasProjetoService, membrosProjetoService, projetosService, projetosPublicosService } from './services/projetos.service';
import { bannersService, bannersPublicosService } from './services/banners.service';

export const medtecApi = {
  // Autenticação e Sessão (/auth)
  auth: {
    login: authService.login,
    refreshToken: authService.refreshToken,
    me: authService.me,
    logout: authService.logout,
    getTokens: authService.getAccessToken,
    getAccessToken: authService.getAccessToken,
    getRefreshToken: authService.getRefreshToken,
    getDecodedToken: authService.getDecodedToken,
    isAuthenticated: authService.isAuthenticated,
    clearTokens: authService.clearTokens,
  },

  // Usuários e Permissões Extras (/usuarios)
  usuarios: usuariosService,

  // Perfis e Permissões (/perfis)
  perfis: perfisService,

  // Dados Geográficos (/g_estados e /g_cidades)
  estados: estadosService,
  cidades: cidadesService,

  // Avisos e Tipos de Aviso (/a_avisos e /a_tipos_aviso)
  avisos: avisosService,
  tiposAviso: tiposAvisoService,

  // Galeria de Fotos e Categorias (/fotos_galeria e /categorias_galeria)
  categoriasGaleria: categoriasGaleriaService,
  fotosGaleria: fotosGaleriaService,

  // Canais de Contato (/canais_contato)
  canaisContato: canaisService,

  // Notícias e Fila Editorial (Contrato Previsto)
  noticias: noticiasService,

  // Categorias de Dúvidas (/d_categorias_duvida)
  categoriasDuvida: categoriasDuvidaService,
  duvidas: duvidasService,
  duvidasVisitante: duvidasVisitanteService,
  duvidasPublicas: duvidasPublicasService,

  // Escolas para os selects do CMS (/escolas)
  escolas: escolasService,

  // Professores, disciplinas e relatos (/p_professores, /p_disciplinas e /p_relatos)
  disciplinasProfessor: disciplinasProfessorService,
  professores: professoresService,
  relatos: relatosService,
  professoresPublicos: professoresPublicosService,

  // Conquistas dos alunos (/c_conquistas_aluno e /c_categorias_conquista_aluno)
  categoriasConquista: categoriasConquistaService,
  conquistas: conquistasService,
  conquistasPublicas: conquistasPublicasService,

  // Projetos pedagógicos (/pj_projetos, /pj_temas e /pj_membros)
  temasProjeto: temasProjetoService,
  membrosProjeto: membrosProjetoService,
  projetos: projetosService,
  projetosPublicos: projetosPublicosService,

  // Banners do carrossel da home (/b_banners)
  banners: bannersService,
  bannersPublicos: bannersPublicosService,
};

// Exportações de infraestrutura e utilitários
export {
  apiFetch,
  getApiBaseUrl,
  getApiServerUrl,
  getMediaUrl,
  API_BASE_URL,
  API_SERVER_URL,
  ApiError,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  decodeAccessToken,
  isAccessTokenExpired,
  onTokensChange,
};

// Re-exporta todos os tipos da API
export * from './types';
export * from './errors';
export * from './tokens';
export * from './client';

export default medtecApi;
