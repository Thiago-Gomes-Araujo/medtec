'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  Tv, 
  BookOpen, 
  Bell, 
  Newspaper, 
  Image as ImageIcon, 
  Share2, 
  Lock, 
  ExternalLink,
  Phone
} from 'lucide-react';
import { InstagramIcon, YoutubeIcon, FacebookIcon } from '@/components/SocialIcons';
import { SocialLinks } from '@/types';

interface HeaderProps {
  socials?: SocialLinks;
}

export default function Header({ socials }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Barra Governamental Superior */}
      <div className="bg-emerald-900 text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-wide text-emerald-300">GOVERNO DO ESTADO DE RONDÔNIA</span>
            <span className="hidden sm:inline text-emerald-400/50">|</span>
            <span className="hidden sm:inline text-emerald-200">SEDUC - Secretaria de Estado da Educação</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-emerald-200/80">Coordenadoria de Mídias Educacionais</span>
            {socials && (
              <div className="flex items-center gap-3">
                {socials.instagram && (
                  <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors" title="Instagram">
                    <InstagramIcon size={14} />
                  </a>
                )}
                {socials.youtube && (
                  <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors" title="YouTube">
                    <YoutubeIcon size={14} />
                  </a>
                )}
                {socials.facebook && (
                  <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors" title="Facebook">
                    <FacebookIcon size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Identidade Visual / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
            <Tv size={22} className="text-emerald-200" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                MED<span className="text-emerald-600">TEC</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">RO</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Mediação Tecnológica de Rondônia
            </span>
          </div>
        </Link>

        {/* Links de navegação Desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="#inicio" className="hover:text-emerald-700 transition-colors">
            Início
          </Link>
          <Link href="#sobre" className="hover:text-emerald-700 transition-colors">
            O Projeto
          </Link>
          <Link href="#metodologia" className="hover:text-emerald-700 transition-colors">
            Como Funciona
          </Link>
          <Link href="#avisos" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
            <Bell size={14} className="text-amber-500" />
            Avisos
          </Link>
          <Link href="#noticias" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
            <Newspaper size={14} className="text-emerald-600" />
            Notícias
          </Link>
          <Link href="#galeria" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
            <ImageIcon size={14} className="text-teal-600" />
            Galeria
          </Link>
          <Link href="#redes" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
            <Share2 size={14} className="text-blue-600" />
            Redes Sociais
          </Link>
        </nav>

        {/* Botão Admin / Painel */}
        <div className="hidden sm:flex items-center gap-3">
          <Link 
            href="/admin" 
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 transition-all shadow-xs"
          >
            <Lock size={13} className="text-slate-500" />
            <span>Painel Gestor</span>
          </Link>
        </div>

        {/* Botão Hambúrguer Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
          aria-label="Abrir Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2 text-base font-medium text-slate-700">
            <Link 
              href="#inicio" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700"
            >
              Início
            </Link>
            <Link 
              href="#sobre" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700"
            >
              O Projeto
            </Link>
            <Link 
              href="#metodologia" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700"
            >
              Como Funciona
            </Link>
            <Link 
              href="#avisos" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
            >
              <span>Avisos e Comunicados</span>
              <Bell size={16} className="text-amber-500" />
            </Link>
            <Link 
              href="#noticias" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
            >
              <span>Notícias</span>
              <Newspaper size={16} className="text-emerald-600" />
            </Link>
            <Link 
              href="#galeria" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
            >
              <span>Galeria de Fotos</span>
              <ImageIcon size={16} className="text-teal-600" />
            </Link>
            <Link 
              href="#redes" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
            >
              <span>Redes Sociais e Canais</span>
              <Share2 size={16} className="text-blue-600" />
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link 
              href="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-emerald-800 transition"
            >
              <Lock size={15} />
              Acessar Painel Gerenciável
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
