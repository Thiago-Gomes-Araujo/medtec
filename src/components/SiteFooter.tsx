'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Phone, Mail, MapPin } from 'lucide-react';
import { useSiteChannels } from '@/components/SiteChannelsProvider';

export default function SiteFooter() {
  const { phone, email, address } = useSiteChannels();

  return (
    <footer className="relative mt-20 border-t border-slate-200 dark:border-slate-800 bg-[#004A99] dark:bg-[#08152B] text-white transition-colors duration-200">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-sm">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-2">
            <Link
              href="/"
              aria-label="Voltar para a página inicial do MEDTEC Rondônia"
              className="group inline-block cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white rounded-lg p-1 -ml-1 transition-opacity hover:opacity-95"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-200 dark:text-sky-300">
                Rede Estadual de Rondônia
              </p>
              <p className="font-display text-2xl font-bold tracking-tight text-white dark:text-[#E6F4FF] text-balance group-hover:text-sky-200 transition-colors">
                MEDTEC Rondônia · SEDUC-RO
              </p>
            </Link>
            <p className="max-w-xl text-sm leading-relaxed text-sky-100/90 dark:text-slate-300 text-pretty [overflow-wrap:anywhere]">
              Ensino Médio com Mediação Tecnológica, Lei Estadual nº 3.846/2016 e Portaria SEDUC nº 928/2025.
              Garantindo o direito universal à educação básica de excelência no campo, nas águas e nas florestas de todo o estado de Rondônia.
            </p>
            <div className="space-y-1 text-xs text-sky-200/90 dark:text-slate-400 [overflow-wrap:anywhere]">
              <p className="flex items-center gap-1.5">
                <MapPin size={13} className="shrink-0 text-sky-300" />
                <span>{address || 'Governo do Estado de Rondônia | SEDUC-RO - Coordenadoria de Mídias Educacionais.'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} className="shrink-0 text-sky-300" />
                    <span>{phone}</span>
                  </p>
                )}
                {email && (
                  <p className="flex items-center gap-1.5">
                    <Mail size={13} className="shrink-0 text-sky-300" />
                    <span>{email}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-sky-200 dark:text-sky-300">
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
              <li><Link href="/ao-vivo" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Vídeo-Aulas &amp; Redes Oficiais</Link></li>
              <li><Link href="/professores" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Professores e Mediadores</Link></li>
              <li><Link href="/alunos" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Histórias de Alunos</Link></li>
              <li><Link href="/transparencia" className="inline-block hover:text-cyan-200 dark:hover:text-cyan-300 hover:underline active:scale-[0.98] transition-all duration-150 ease-out touch-manipulation">Portal da Transparência</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-sky-200 dark:text-sky-300">
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

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-sky-400/25 dark:border-white/10 pt-6 text-xs text-sky-200/80 dark:text-slate-400 sm:flex-row">
          <p>© 2026 Governo do Estado de Rondônia - SEDUC-RO. Todos os direitos reservados.</p>
          <p>Conforme diretrizes da LGPD e do Estatuto da Criança e do Adolescente (ECA).</p>
        </div>
      </div>
    </footer>
  );
}
