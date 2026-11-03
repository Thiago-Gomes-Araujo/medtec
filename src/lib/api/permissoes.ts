/**
 * Permissões do usuário logado, lidas do GET /auth/me (ROTAS_FRONT.md, seção 5).
 * Servem só para a tela: a API continua conferindo cada requisição.
 */

import type { AcaoPermissao, AuthUser, Permissoes } from './types';

export interface SessaoPermissoes {
  admin: boolean;
  permissoes: Permissoes;
}

// Sem /auth/me (ex.: login local ADMIN_USER), nenhuma permissão.
export const SEM_PERMISSOES: SessaoPermissoes = Object.freeze({ admin: false, permissoes: Object.freeze({}) as Permissoes });

let atual: SessaoPermissoes = SEM_PERMISSOES;
const listeners = new Set<() => void>();

// Aceita só o formato documentado; qualquer outro valor vira "sem permissão".
export function lerPermissoes(user: Partial<Pick<AuthUser, 'admin' | 'permissoes'>> | null | undefined): SessaoPermissoes {
  const fonte = user?.permissoes;
  const permissoes: Permissoes = {};
  if (fonte && typeof fonte === 'object' && !Array.isArray(fonte)) {
    for (const [modulo, acoes] of Object.entries(fonte)) {
      if (Array.isArray(acoes)) permissoes[modulo] = acoes.filter((acao): acao is string => typeof acao === 'string');
    }
  }
  return { admin: user?.admin === true, permissoes };
}

function publicar(proxima: SessaoPermissoes) {
  atual = proxima;
  listeners.forEach((listener) => listener());
}

export function definirPermissoes(user: Partial<Pick<AuthUser, 'admin' | 'permissoes'>> | null | undefined): void {
  publicar(lerPermissoes(user));
}

export function limparPermissoes(): void {
  if (atual !== SEM_PERMISSOES) publicar(SEM_PERMISSOES);
}

export function obterPermissoes(): SessaoPermissoes {
  return atual;
}

export function onPermissoesChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Helper único das telas: `pode('n_noticias', 'publicar')`. */
export function pode(modulo: string, acao: AcaoPermissao, sessao: SessaoPermissoes = atual): boolean {
  return sessao.permissoes[modulo]?.includes(acao) ?? false;
}
