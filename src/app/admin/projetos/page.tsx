'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjetosPanel from '@/components/admin/ProjetosPanel';
import { usePermissoes } from '@/components/admin/usePermissoes';

function ProjetosContent() {
  const params = useSearchParams();
  const { pode } = usePermissoes();
  // O atalho "Novo projeto" só abre o formulário para quem pode criar.
  const startNew = params.get('action') === 'new' && pode('pj_projetos', 'create');
  const membro = params.get('membro');
  const membroId = membro && /^\d+$/.test(membro) ? membro : '';
  return <ProjetosPanel key={`${startNew}:${membroId}`} startNew={startNew} membroId={membroId} />;
}

export default function AdminProjetosSubroutePage() {
  return (
    <Suspense fallback={<p role="status">Carregando projetos...</p>}>
      <ProjetosContent />
    </Suspense>
  );
}
