'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { obterPermissoes, onPermissoesChange, pode as podeEm, type AcaoPermissao } from '@/lib/api';

// Menu, guardas e botões releem a tela quando um novo /auth/me muda as permissões.
// O servidor nunca recebe permissões: o mesmo leitor serve de snapshot inicial.
export function usePermissoes() {
  const sessao = useSyncExternalStore(onPermissoesChange, obterPermissoes, obterPermissoes);
  const pode = useCallback((modulo: string, acao: AcaoPermissao) => podeEm(modulo, acao, sessao), [sessao]);
  return { admin: sessao.admin, permissoes: sessao.permissoes, sessao, pode };
}
