import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-sky-400/30 dark:border-cyan-500/20 bg-gradient-to-r from-[#05549D] via-[#072F5E] to-[#0A3D73] dark:from-[#040B16] dark:via-[#07162C] dark:to-[#040B16] text-white transition-colors duration-200">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-30 dark:opacity-35" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-sky-400/20 dark:bg-cyan-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 dark:via-cyan-400/40 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-sm">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-300 dark:text-cyan-300">
              Rede Estadual de Rondônia
            </p>
            <p className="font-display text-2xl font-bold tracking-tight text-white dark:text-[#E6F4FF] text-balance">
              MEDTEC Rondônia · SEDUC-RO
            </p>
            <p className="max-w-xl text-sm leading-relaxed text-sky-100/90 dark:text-slate-400 text-pretty [overflow-wrap:anywhere]">
              Ensino Médio com Mediação Tecnológica, Lei Estadual nº 3.846/2016 e Portaria SEDUC nº 928/2025.
              Garantindo o direito universal à educação básica de excelência no campo, nas águas e nas florestas de todo o estado de Rondônia.
            </p>
            <p className="text-xs text-sky-200/80 dark:text-slate-500 [overflow-wrap:anywhere]">
              Governo do Estado de Rondônia | Secretaria de Estado da Educação (SEDUC-RO) - Coordenadoria de Mídias Educacionais. Palácio Rio Madeira, Porto Velho - RO.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 dark:text-cyan-300">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm text-sky-100/90 dark:text-slate-400">
              <li><Link href="/" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Início</Link></li>
              <li><Link href="/#tecnologia" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Tecnologia MEDTEC</Link></li>
              <li><Link href="/#como-funciona" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Como Funciona</Link></li>
              <li><Link href="/avisos" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Mural de Avisos</Link></li>
              <li><Link href="/comunidades" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">O MEDTEC nas Comunidades</Link></li>
              <li><Link href="/noticias" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Notícias e Comunicados</Link></li>
              <li><Link href="/projetos" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Projetos Pedagógicos</Link></li>
              <li><Link href="/acervo" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Acervo Fotográfico</Link></li>
              <li><Link href="/duvidas" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Dúvidas Frequentes (FAQ)</Link></li>
              <li><Link href="/ao-vivo" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Ao Vivo &amp; Redes Oficiais</Link></li>
              <li><Link href="/professores" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Professores e Mediadores</Link></li>
              <li><Link href="/alunos" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Histórias de Alunos</Link></li>
              <li><Link href="/transparencia" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Portal da Transparência</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 dark:text-cyan-300">
              Fontes oficiais
            </h4>
            <ul className="space-y-2 text-sm text-sky-100/90 dark:text-slate-400">
              <li>
                <a href="https://rondonia.ro.gov.br/seduc/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">
                  <span>SEDUC Rondônia</span>
                  <ExternalLink className="h-3 w-3 opacity-75" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="https://diof.ro.gov.br/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">
                  <span>Diário Oficial (DIOF-RO)</span>
                  <ExternalLink className="h-3 w-3 opacity-75" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="https://transparencia.ro.gov.br/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">
                  <span>Transparência Governo RO</span>
                  <ExternalLink className="h-3 w-3 opacity-75" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="https://www.gov.br/inep/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">
                  <span>INEP / Censo Escolar</span>
                  <ExternalLink className="h-3 w-3 opacity-75" aria-hidden="true" />
                </a>
              </li>
              <li className="pt-2 border-t border-sky-400/20 dark:border-white/10">
                <Link href="/admin" className="text-cyan-200 dark:text-cyan-300 hover:text-white font-semibold hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation inline-block">
                  Painel Gestor MEDTEC (Restrito)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-sky-400/25 dark:border-white/10 pt-6 text-xs text-sky-200/80 dark:text-slate-500 sm:flex-row">
          <p>© 2026 Governo do Estado de Rondônia - SEDUC-RO. Todos os direitos reservados.</p>
          <p>Conforme diretrizes da LGPD e do Estatuto da Criança e do Adolescente (ECA).</p>
        </div>
      </div>
    </footer>
  );
}
