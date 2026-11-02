'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F9] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main id="conteudo-principal" className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 sm:px-6">
        <div className="w-full max-w-xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#004A99]/10 dark:bg-[#00D8FF]/10 text-[#004A99] dark:text-[#00D8FF] border border-[#004A99]/20 dark:border-[#00D8FF]/20 text-xs font-mono font-semibold tracking-wider uppercase mb-6">
            <AlertCircle className="w-4 h-4" strokeWidth={1.75} />
            <span>Erro inesperado</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight leading-tight text-slate-900 dark:text-white mb-4">
            Algo deu errado nesta página
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto mb-8">
            Não foi possível exibir este conteúdo agora. Tente novamente em instantes ou volte ao início do portal MEDTEC Rondônia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white font-medium text-sm transition-colors duration-150 shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
              <span>Tentar novamente</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-[#0C1E38] hover:bg-slate-50 dark:hover:bg-[#132A4D] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1A365D] font-medium text-sm transition-colors duration-150"
            >
              <Home className="w-4 h-4" strokeWidth={1.75} />
              <span>Início</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
