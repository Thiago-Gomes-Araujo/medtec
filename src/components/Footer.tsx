import React from 'react';
import Link from 'next/link';
import { SocialLinks, SiteInfo } from '@/types';
import { 
  Tv, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { InstagramIcon, YoutubeIcon, FacebookIcon } from '@/components/SocialIcons';

interface FooterProps {
  socials: SocialLinks;
  siteInfo: SiteInfo;
}

export default function Footer({ socials, siteInfo }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      
      {/* Faixa Principal do Rodapé */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Coluna 1 & 2: Identidade Oficial */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md">
                <Tv size={20} />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-tight">
                  MED<span className="text-emerald-500">TEC</span> Rondônia
                </span>
                <p className="text-[11px] text-slate-400">
                  Ensino Médio com Mediação Tecnológica
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Projeto educacional inovador instituído pela Lei Estadual nº 3.846/2016 e Portaria nº 928/2025. Promovendo a equidade e o acesso ao Ensino Médio de qualidade em todo o estado de Rondônia.
            </p>

            <div className="pt-2 flex items-center gap-3">
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <InstagramIcon size={15} />
                </a>
              )}
              {socials.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500 hover:text-red-400 flex items-center justify-center transition-colors"
                  title="YouTube"
                >
                  <YoutubeIcon size={15} />
                </a>
              )}
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 hover:text-blue-400 flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <FacebookIcon size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Coluna 3: Navegação Rápida */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#inicio" className="hover:text-emerald-400 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="#sobre" className="hover:text-emerald-400 transition-colors">
                  O Projeto & Legislação
                </Link>
              </li>
              <li>
                <Link href="#metodologia" className="hover:text-emerald-400 transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#avisos" className="hover:text-emerald-400 transition-colors">
                  Mural de Avisos
                </Link>
              </li>
              <li>
                <Link href="#noticias" className="hover:text-emerald-400 transition-colors">
                  Notícias Oficiais
                </Link>
              </li>
              <li>
                <Link href="#galeria" className="hover:text-emerald-400 transition-colors">
                  Galeria de Fotos
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Governamental & Documentos */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              Institucional
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://rondonia.ro.gov.br/seduc/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <span>Portal SEDUC Rondônia</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a 
                  href="https://rondonia.ro.gov.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <span>Governo de Rondônia</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <span className="text-slate-400">Coordenadoria de Mídias Educacionais</span>
              </li>
              <li>
                <span className="text-slate-400">Base Nacional Comum Curricular (BNCC)</span>
              </li>
              <li>
                <span className="text-slate-400">Lei Estadual nº 3.846/2016</span>
              </li>
            </ul>
          </div>

          {/* Coluna 5: Contato Oficial */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              Atendimento SEDUC
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{socials.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-emerald-400 shrink-0" />
                <span>{socials.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-emerald-400 shrink-0" />
                <span>{socials.email}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Faixa Inferior de Copyright e Acesso Admin */}
      <div className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2026 Governo do Estado de Rondônia - Secretaria de Estado da Educação (SEDUC). Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="hover:text-emerald-400 flex items-center gap-1.5 font-medium transition-colors"
            >
              <Lock size={12} />
              <span>Painel Gerenciável (CMS)</span>
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
