/**
 * Gerenciamento Seguro de Tokens de Autenticação da API MEDTEC
 * Conforme convenções de tokens descritas em docs/rotas_front.md
 */

import { AuthTokens, TokenPayload } from './types';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const LEGACY_TOKEN_KEY = 'medtec_access_token';
const LEGACY_REFRESH_TOKEN_KEY = 'medtec_refresh_token';

// Cache em memória para acesso síncrono e isolamento
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

type TokenListener = (tokens: AuthTokens | null) => void;
const listeners = new Set<TokenListener>();

export function getStoredAccessToken(): string | null {
  if (memoryAccessToken) return memoryAccessToken;
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
    memoryAccessToken = token;
    return token;
  } catch {
    return null;
  }
}

export function getStoredRefreshToken(): string | null {
  if (memoryRefreshToken) return memoryRefreshToken;
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY);
    memoryRefreshToken = token;
    return token;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: AuthTokens): void {
  memoryAccessToken = tokens.access_token;
  memoryRefreshToken = tokens.refresh_token;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_KEY, tokens.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
      localStorage.setItem(LEGACY_TOKEN_KEY, tokens.access_token);
      localStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, tokens.refresh_token);
    } catch {
      // Ignora erro se localStorage estiver inacessível
    }
  }

  notifyListeners(tokens);
}

export function clearStoredTokens(): void {
  memoryAccessToken = null;
  memoryRefreshToken = null;

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
    } catch {
      // Ignora erro se localStorage estiver inacessível
    }
  }

  notifyListeners(null);
}

/**
 * Registra callback para ser avisado sempre que os tokens mudarem ou forem apagados
 */
export function onTokensChange(listener: TokenListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(tokens: AuthTokens | null): void {
  listeners.forEach((listener) => {
    try {
      listener(tokens);
    } catch (e) {
      console.error('Erro no listener de tokens:', e);
    }
  });
}

/**
 * Decodifica o payload do access_token sem bibliotecas externas
 */
export function decodeAccessToken(token?: string | null): TokenPayload | null {
  const target = token || getStoredAccessToken();
  if (!target || typeof target !== 'string') return null;

  try {
    const parts = target.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verifica se o access_token atual está expirado com base no claim `exp` do JWT
 */
export function isAccessTokenExpired(token?: string | null): boolean {
  const payload = decodeAccessToken(token);
  if (!payload || !payload.exp) return true;

  // Dá margem de 10 segundos de antecedência para evitar race condition
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + 10;
}
