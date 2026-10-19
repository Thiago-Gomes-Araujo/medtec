import React from 'react';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-sky-400/30 dark:border-cyan-500/20 bg-gradient-to-r from-[#05549D] via-[#072F5E] to-[#0A3D73] dark:from-[#040B16] dark:via-[#07162C] dark:to-[#040B16] text-white transition-colors duration-200">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40 dark:opacity-40" />
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-sky-400/20 dark:bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 dark:via-cyan-400/40 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 text-sm">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-200 dark:text-cyan-300">
              {'// rede estadual'}
            </p>
            <p className="font-display text-2xl font-bold tracking-tight text-white dark:text-[#E6F4FF]">
              MEDTEC em Foco · Rondônia
            </p>
            <p className="max-w-xl text-sm leading-relaxed text-sky-100/90 dark:text-slate-400">
              Ensino Médio com Mediação Tecnológica — Lei Estadual nº 3.846/2016.
              Garantindo o direito universal à educação básica de excelência no campo, nas águas e nas florestas de todo o estado de Rondônia.
            </p>
            <p className="text-xs text-sky-200/80 dark:text-slate-500">
              Secretaria de Estado da Educação de Rondônia (SEDUC-RO) · Palácio Rio Madeira, Porto Velho - RO.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-200 dark:text-cyan-300">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm text-sky-100/90 dark:text-slate-400">
              <li><Link href="/" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Início</Link></li>
              <li><Link href="/#tecnologia" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Tecnologia MEDTEC</Link></li>
              <li><Link href="/#como-funciona" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Como Funciona</Link></li>
              <li><Link href="/avisos" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Mural de Avisos</Link></li>
              <li><Link href="/comunidades" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">O MEDTEC nas Comunidades</Link></li>
              <li><Link href="/noticias" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Notícias e Comunicados</Link></li>
              <li><Link href="/acervo" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Acervo Fotográfico</Link></li>
              <li><Link href="/duvidas" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Dúvidas Frequentes (FAQ)</Link></li>
              <li><Link href="/ao-vivo" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Ao Vivo & Redes Oficiais</Link></li>
              <li><Link href="/professores" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Professores e Mediadores</Link></li>
              <li><Link href="/alunos" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Histórias de Alunos</Link></li>
              <li><Link href="/transparencia" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">Portal da Transparência</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-200 dark:text-cyan-300">
              Fontes oficiais
            </h4>
            <ul className="space-y-2 text-sm text-sky-100/90 dark:text-slate-400">
              <li>
                <a href="https://rondonia.ro.gov.br/seduc/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">
                  SEDUC Rondônia ↗
                </a>
              </li>
              <li>
                <a href="https://diof.ro.gov.br/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">
                  Diário Oficial (DIOF-RO) ↗
                </a>
              </li>
              <li>
                <a href="https://transparencia.ro.gov.br/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">
                  Transparência Governo RO ↗
                </a>
              </li>
              <li>
                <a href="https://www.gov.br/inep/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline transition-colors">
                  INEP / Censo Escolar ↗
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-cyan-200 dark:text-cyan-300 hover:text-white font-medium hover:underline transition-colors">
                  Painel Gestor MEDTEC (Restrito)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-sky-400/25 dark:border-white/10 pt-6 text-xs text-sky-200/80 dark:text-slate-500 sm:flex-row">
          <p>© 2026 Governo do Estado de Rondônia — SEDUC-RO. Todos os direitos reservados.</p>
          <p>Conforme diretrizes da LGPD e do Estatuto da Criança e do Adolescente (ECA).</p>
        </div>
      </div>
    </footer>
  );
}
