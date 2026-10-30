'use client';

import Link from 'next/link';
import { ExternalLink, LogOut } from 'lucide-react';

export interface MobileDrawerFooterProps {
  /** Nome exibido, já resolvido pelo consumidor a partir da sessão. */
  userName?: string;
  /** Rótulo do perfil, já resolvido pelo consumidor a partir da sessão. */
  roleLabel: string;
  onLogout: () => void;
}

/**
 * Rodapé visual da gaveta mobile administrativa: link do portal público,
 * identificação do usuário e botão de saída. Não conhece sessão, permissões
 * ou navegação; recebe os textos prontos e o callback de logout.
 */
export default function MobileDrawerFooter({ userName, roleLabel, onLogout }: MobileDrawerFooterProps) {
  return (
    <div className="shrink-0 border-t border-slate-800 p-3 space-y-2 bg-[#051021]">
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs"
      >
        <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
        <span>Ver Portal Público</span>
      </Link>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {userName}
          </p>
          <p className="text-[10px] text-slate-400">
            {roleLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-rose-400 p-1.5 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
