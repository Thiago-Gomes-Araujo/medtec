import React from 'react';
import Link from 'next/link';
import { Home, Newspaper, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F9] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF] overflow-x-hidden max-w-[100vw]">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 sm:px-6">
        <div className="w-full max-w-xl text-center">
          {/* Badge institucional */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#004A99]/10 dark:bg-[#00D8FF]/10 text-[#004A99] dark:text-[#00D8FF] border border-[#004A99]/20 dark:border-[#00D8FF]/20 text-xs font-mono font-semibold tracking-wider uppercase mb-6">
            <AlertCircle className="w-4 h-4" strokeWidth={1.75} />
            <span>Erro 404: Rota Inexistente</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight leading-tight text-slate-900 dark:text-white mb-4">
            Página não encontrada
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto mb-8">
            O endereço que você tentou acessar não existe ou foi movido no portal MEDTEC Rondônia.
          </p>

          {/* Botões de navegação rápida */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white font-medium text-sm transition-colors duration-150 shadow-sm"
            >
              <Home className="w-4 h-4" strokeWidth={1.75} />
              <span>Início</span>
            </Link>

            <Link
              href="/noticias"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-[#0C1E38] hover:bg-slate-50 dark:hover:bg-[#132A4D] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1A365D] font-medium text-sm transition-colors duration-150"
            >
              <Newspaper className="w-4 h-4" strokeWidth={1.75} />
              <span>Notícias</span>
            </Link>

            <Link
              href="/mapa"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-[#0C1E38] hover:bg-slate-50 dark:hover:bg-[#132A4D] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1A365D] font-medium text-sm transition-colors duration-150"
            >
              <MapPin className="w-4 h-4" strokeWidth={1.75} />
              <span>Mapa de Escolas</span>
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-[#004A99] dark:hover:text-[#00D8FF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retornar para o portal principal</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
