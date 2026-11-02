'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjetosPanel from '@/components/admin/ProjetosPanel';

function ProjetosContent() {
  const params = useSearchParams();
  const startNew = params.get('action') === 'new';
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
