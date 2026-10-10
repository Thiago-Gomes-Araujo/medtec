'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  Tv, 
  Radio, 
  Bell, 
  Newspaper, 
  Image as ImageIcon, 
  Share2, 
  Lock, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { InstagramIcon, YoutubeIcon, FacebookIcon, WhatsAppIcon } from '@/components/SocialIcons';
import { SocialLinks } from '@/types';

interface HeaderProps {
  socials?: SocialLinks;
}

export default function Header({ socials }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/10 shadow-xl py-3' 
          : 'bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Oficial Rondônia SEDUC + MEDTEC */}
          <Link href="/" className="group flex items-center gap-3 shrink-0">
            {/* Ícone Tech com Glow */}
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#00875a] via-[#0284c7] to-[#05549d] flex items-center justify-center text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
                <Tv size={22} className="text-white drop-shadow-md" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-white drop-shadow-md">
                  MED<span className="text-sky-400">TEC</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
                  RO • TECH
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-300 hidden sm:block tracking-wide">
                Governo de Rondônia • SEDUC
              </span>
            </div>
          </Link>

          {/* Links de navegação Desktop (estilo matriculaonline com bolinha ping) */}
          <nav className="hidden xl:flex items-center gap-1">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 transition-all"
            >
              Início
            </Link>

            <Link 
              href="#tecnologia" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 transition-all group"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Tecnologia & Aulas</span>
            </Link>

            <Link 
              href="#como-funciona" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 transition-all"
            >
              <span>Como Funciona</span>
            </Link>

            <Link 
              href="#avisos" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell size={14} className="text-amber-400" />
              <span>Avisos</span>
            </Link>

            <Link 
              href="#noticias" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 transition-all"
            >
              <Newspaper size={14} className="text-sky-400" />
              <span>Notícias</span>
            </Link>

            <Link 
              href="#faq" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 transition-all"
            >
              <span>Dúvidas</span>
            </Link>
          </nav>

          {/* Botões de Ação na Direita */}
          <div className="flex items-center gap-3">
            {/* Redes Sociais Compactas */}
            {socials && (
              <div className="hidden md:flex items-center gap-2 border-r border-white/20 pr-3">
                {socials.youtube && (
                  <a 
                    href={socials.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-600/80 text-white transition-all backdrop-blur-sm" 
                    title="Canal do YouTube"
                  >
                    <YoutubeIcon size={15} />
                  </a>
                )}
                {socials.instagram && (
                  <a 
                    href={socials.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-lg bg-white/10 hover:bg-pink-600/80 text-white transition-all backdrop-blur-sm" 
                    title="Instagram"
                  >
                    <InstagramIcon size={15} />
                  </a>
                )}
                {socials.whatsapp && (
                  <a 
                    href={socials.whatsapp} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-lg bg-white/10 hover:bg-emerald-600/80 text-white transition-all backdrop-blur-sm" 
                    title="WhatsApp"
                  >
                    <WhatsAppIcon size={15} />
                  </a>
                )}
              </div>
            )}

            {/* Botão de Transmissão / Ao Vivo */}
            <a
              href="#tecnologia"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border-2 border-white/30 backdrop-blur-sm bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all shadow-md"
            >
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span>Transmissões</span>
            </a>

            {/* Botão Painel Gestor CMS */}
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-105 transition-all"
            >
              <Lock size={14} />
              <span className="hidden sm:inline">Painel Gestor</span>
              <span className="sm:hidden">Admin</span>
            </Link>

            {/* Menu Mobile Hambúrguer */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-white bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 mt-3 space-y-4 shadow-2xl animate-in slide-in-from-top-4">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-white">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between"
            >
              <span>Início</span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
            <Link 
              href="#tecnologia" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Tecnologia & Aulas
              </span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
            <Link 
              href="#como-funciona" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between"
            >
              <span>Como Funciona</span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
            <Link 
              href="#avisos" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between"
            >
              <span>Mural de Avisos</span>
              <Bell size={16} className="text-amber-400" />
            </Link>
            <Link 
              href="#noticias" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between"
            >
              <span>Notícias</span>
              <Newspaper size={16} className="text-sky-400" />
            </Link>
            <Link 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between"
            >
              <span>Perguntas Frequentes (FAQ)</span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link 
              href="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/20"
            >
              <Lock size={16} />
              Acessar Painel Gerenciável
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
