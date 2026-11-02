'use client';

import Link from 'next/link';
import { ExternalLink, LogOut } from 'lucide-react';
import { sidebarIconButtonClass, sidebarPortalLinkClass } from './adminTheme';

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
    <div className="shrink-0 border-t border-admin-border p-3 space-y-2">
      <Link href="/" target="_blank" rel="noopener noreferrer" className={sidebarPortalLinkClass}>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        <span>Ver o site</span>
      </Link>

      <div className="pt-2 border-t border-admin-border flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-admin-text truncate">{userName}</p>
          <p className="text-[11px] text-admin-muted">{roleLabel}</p>
        </div>
        <button type="button" onClick={onLogout} aria-label="Sair do painel" title="Sair do painel" className={sidebarIconButtonClass}>
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
