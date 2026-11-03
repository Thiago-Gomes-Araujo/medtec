/**
 * Serviço de Autenticação da API MEDTEC
 * Conforme especificações de docs/rotas_front.md seção 5
 */

import { apiFetch, reloadPermissions } from '../client';
import { definirPermissoes, limparPermissoes } from '../permissoes';
import { ApiResponse, AuthTokens, AuthUser, TokenPayload } from '../types';
import {
  setStoredTokens,
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  decodeAccessToken,
  isAccessTokenExpired,
} from '../tokens';

export const authService = {
  /**
   * Realiza login com CPF e senha na API Backend
   * Endpoint: POST /auth/login
   */
  async login(cpf: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const cleanCpf = cpf.trim();
    const cleanPassword = password;

    const res = await apiFetch<ApiResponse<AuthTokens>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ cpf: cleanCpf, password: cleanPassword }),
      skipAuth: true,
    });

    if (res.success && res.data) {
      setStoredTokens(res.data);
      // O login não devolve as permissões: elas vêm do /auth/me.
      await reloadPermissions(res.data.access_token);
    }

    return res;
  },

  /**
   * Renova o par de tokens (access_token + refresh_token)
   * Endpoint: POST /auth/refresh_token
   */
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const currentRefreshToken = getStoredRefreshToken();
    if (!currentRefreshToken) {
      clearStoredTokens();
      throw new Error('Refresh token não encontrado no armazenamento local.');
    }

    const res = await apiFetch<ApiResponse<AuthTokens>>('/auth/refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: currentRefreshToken }),
      skipAuth: true,
    });

    if (res.success && res.data) {
      setStoredTokens(res.data);
      await reloadPermissions(res.data.access_token);
    }

    return res;
  },

  /**
   * Obtém os dados cadastrais e perfil do usuário logado
   * Endpoint: GET /auth/me
   */
  async me(): Promise<ApiResponse<AuthUser>> {
    const res = await apiFetch<ApiResponse<AuthUser>>('/auth/me', { method: 'GET' });
    // Toda leitura do usuário logado atualiza o que a tela pode mostrar.
    if (res.success && res.data) definirPermissoes(res.data);
    return res;
  },

  /**
   * Encerra a sessão no backend e limpa o armazenamento local de tokens
   * Endpoint: DELETE /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiFetch<ApiResponse<null>>('/auth/logout', { method: 'DELETE' });
    } finally {
      clearStoredTokens();
      limparPermissoes();
    }
  },

  /**
   * Retorna o access_token armazenado atualmente
   */
  getAccessToken(): string | null {
    return getStoredAccessToken();
  },

  /**
   * Retorna o refresh_token armazenado atualmente
   */
  getRefreshToken(): string | null {
    return getStoredRefreshToken();
  },

  /**
   * Decodifica e retorna os dados do payload do JWT sem consultar a API
   */
  getDecodedToken(): TokenPayload | null {
    return decodeAccessToken();
  },

  /**
   * Verifica se o usuário possui access_token válido e não expirado
   */
  isAuthenticated(): boolean {
    const token = getStoredAccessToken();
    return !!token && !isAccessTokenExpired(token);
  },

  /**
   * Apaga tokens armazenados
   */
  clearTokens(): void {
    clearStoredTokens();
  },
};
