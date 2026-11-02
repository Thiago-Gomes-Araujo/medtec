'use client';

import dynamic from 'next/dynamic';

// Botão flutuante decorativo: sai do JS inicial de todas as rotas do layout raiz.
export default dynamic(() => import('@/components/FloatingSocialRotator'), { ssr: false });
