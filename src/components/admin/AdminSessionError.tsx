'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from '@/components/admin/adminTheme';

// Sem resposta do servidor não dá para saber se a sessão expirou: oferece repetir antes de pedir login.
export default function AdminSessionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="min-h-screen bg-admin-bg flex flex-col items-center justify-center space-y-4 px-4 text-admin-text">
      <AlertCircle className="w-9 h-9 text-admin-warning" aria-hidden="true" />
      <div className="text-center space-y-1">
        <p className="text-sm font-bold tracking-wide">Não foi possível verificar sua sessão</p>
        <p className="text-xs text-admin-muted">O servidor não respondeu a tempo. Confira sua conexão e tente novamente.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={onRetry} className={adminPrimaryButtonClass}>Tentar novamente</button>
        <Link href="/admin/login" className={adminSecondaryButtonClass}>Ir para o login</Link>
      </div>
    </div>
  );
}
