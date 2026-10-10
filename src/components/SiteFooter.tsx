import React from 'react';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-primary-deep text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 text-sm">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-2">
            <p className="font-display text-xl font-bold text-white tracking-tight">
              MEDTEC em Foco · Rondônia
            </p>
            <p className="max-w-xl text-slate-300 leading-relaxed text-sm">
              Ensino Médio com Mediação Tecnológica — Lei Estadual nº 3.846/2016.
              Garantindo o direito universal à educação básica de excelência no campo, nas águas e nas florestas de todo o estado de Rondônia.
            </p>
            <p className="text-xs text-slate-400">
              Secretaria de Estado da Educação de Rondônia (SEDUC-RO) · Palácio Rio Madeira, Porto Velho - RO.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3 text-sm">Navegação Rápida</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Início</Link>
              </li>
              <li>
                <Link href="/professores" className="hover:text-white transition-colors">Professores e Mediadores</Link>
              </li>
              <li>
                <Link href="/alunos" className="hover:text-white transition-colors">Histórias de Alunos</Link>
              </li>
              <li>
                <Link href="/mapa" className="hover:text-white transition-colors">Mapa de Escolas Conectadas</Link>
              </li>
              <li>
                <Link href="/transparencia" className="hover:text-white transition-colors">Portal da Transparência</Link>
              </li>
              <li>
                <Link href="/noticias" className="hover:text-white transition-colors">Notícias e Comunicados</Link>
              </li>
              <li>
                <Link href="/galeria" className="hover:text-white transition-colors">Galeria de Fotos do MEDTEC</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">Perguntas Frequentes (FAQ)</Link>
              </li>
              <li>
                <Link href="/redes" className="hover:text-white transition-colors">Canais de Transmissão e Redes</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3 text-sm">Fontes Oficiais</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>
                <a href="https://rondonia.ro.gov.br/seduc/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  SEDUC Rondônia ↗
                </a>
              </li>
              <li>
                <a href="https://diof.ro.gov.br/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Diário Oficial (DIOF-RO) ↗
                </a>
              </li>
              <li>
                <a href="https://transparencia.ro.gov.br/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Transparência Governo RO ↗
                </a>
              </li>
              <li>
                <a href="https://www.gov.br/inep/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  INEP / Censo Escolar ↗
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-sky-300 hover:text-sky-200 transition-colors">
                  Painel Gestor MEDTEC (Restrito)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Governo do Estado de Rondônia — SEDUC-RO. Todos os direitos reservados.</p>
          <p>Conforme diretrizes da LGPD e do Estatuto da Criança e do Adolescente (ECA).</p>
        </div>
      </div>
    </footer>
  );
}
