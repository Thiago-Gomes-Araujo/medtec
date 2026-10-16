'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown, 
  Megaphone, 
  Newspaper, 
  Image as ImageIcon, 
  HelpCircle,
  ExternalLink,
  Home,
  Satellite,
  Layers,
  MapPin,
  Radio
} from 'lucide-react';

interface SiteHeaderProps {
  onOpenPitchModal?: () => void;
}

export default function SiteHeader({ onOpenPitchModal }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inicioDropdownOpen, setInicioDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setInicioDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setInicioDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setInicioDropdownOpen(false);
    }, 180);
  };

  // Seções da Página Inicial (dentro do botão Início, se estende ao passar o mouse)
  const inicioSections = [
    {
      to: '/#inicio',
      label: 'Início',
      desc: 'Transmissão ao vivo, estúdios e dados gerais',
      icon: <Home className="h-4 w-4 text-cyan-400" />
    },
    {
      to: '/#tecnologia',
      label: 'Tecnologia',
      desc: 'Pilares da mediação e conexão via satélite',
      icon: <Satellite className="h-4 w-4 text-sky-400" />
    },
    {
      to: '/#como-funciona',
      label: 'Como Funciona',
      desc: 'Metodologia e dinâmica síncrona em 5 passos',
      icon: <Layers className="h-4 w-4 text-emerald-400" />
    },
    {
      to: '/#ao-vivo',
      label: 'Transmissões & Redes',
      desc: 'Aulas ao vivo, grade de horários e canais oficiais',
      icon: <Radio className="h-4 w-4 text-rose-400" />
    },
  ];

  // Links que ficam fora (diretamente visíveis no cabeçalho)
  const directLinks = [
    {
      to: '/avisos',
      label: 'Mural de Avisos',
      icon: <Megaphone className="h-3.5 w-3.5" />
    },
    {
      to: '/noticias',
      label: 'Notícias & Coberturas',
      icon: <Newspaper className="h-3.5 w-3.5" />
    },
    {
      to: '/acervo',
      label: 'Acervo Fotográfico',
      icon: <ImageIcon className="h-3.5 w-3.5" />
    },
    {
      to: '/comunidades',
      label: 'Comunidades',
      icon: <MapPin className="h-3.5 w-3.5" />
    },
    {
      to: '/duvidas',
      label: 'Dúvidas Frequentes',
      icon: <HelpCircle className="h-3.5 w-3.5" />
    },
  ];

  const handleNavClick = (to: string) => {
    setInicioDropdownOpen(false);
    setMobileMenuOpen(false);
    if (to.startsWith('/#') && pathname === '/') {
      const id = to.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isLinkActive = (to: string) => {
    if (to === '/') return pathname === '/';
    if (to === '/comunidades') return pathname === '/comunidades' || pathname === '/mapa';
    if (to === '/duvidas') return pathname === '/duvidas' || pathname === '/faq';
    if (to.startsWith('/#')) return false;
    return pathname === to || pathname.startsWith(to + '/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#040D1A]/85 backdrop-blur-md transition-all">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        
        {/* ================= LOGO ESQUERDA ================= */}
        <Link href="/" className="flex min-w-0 items-center gap-3 group">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-slate-950 shadow-[0_0_24px_rgba(0,216,255,0.4)] group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00D8FF]">
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan-300 opacity-75" />
            </span>
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-bold tracking-tight text-white group-hover:text-cyan-200 transition-colors">
              MEDTEC Rondônia
            </span>
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/80 font-medium">
              SEDUC • SINAL ATIVO
            </span>
          </span>
        </Link>

        {/* ================= LINKS CENTRO (DESKTOP) ================= */}
        <nav className="hidden items-center gap-1.5 lg:flex">
          
          {/* ================= BOTÃO INÍCIO COM DROPDOWN AO PASSAR O MOUSE ================= */}
          <div 
            ref={dropdownRef} 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center">
              <Link
                href="/#inicio"
                onClick={() => handleNavClick('/#inicio')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  pathname === '/' || inicioDropdownOpen
                    ? 'bg-cyan-400/10 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.15)] border border-cyan-400/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>Início</span>
                <ChevronDown 
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    inicioDropdownOpen ? 'rotate-180 text-cyan-300' : 'text-slate-400'
                  }`} 
                />
              </Link>
            </div>

            {/* Menu Popover Flutuante (Estende-se ao passar o mouse) */}
            {inicioDropdownOpen && (
              <div 
                className="absolute left-0 top-full pt-1.5 w-84 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="rounded-2xl border border-cyan-500/20 bg-[#07162C]/95 p-2 shadow-2xl backdrop-blur-xl">
                  <div className="p-2 border-b border-white/5 flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300/80 font-bold">
                      {'// PÁGINA INICIAL • SEÇÕES'}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">4 seções</span>
                  </div>
                  <div className="grid gap-1 pt-1.5">
                    {inicioSections.map((sec) => (
                      <Link
                        key={sec.to}
                        href={sec.to}
                        onClick={() => handleNavClick(sec.to)}
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-white/5 hover:border-cyan-400/30 border border-transparent"
                      >
                        <div className="mt-0.5 rounded-lg border border-white/10 bg-white/5 p-2 transition-transform group-hover:scale-105 group-hover:border-cyan-400/30">
                          {sec.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white group-hover:text-cyan-200 transition-colors">
                            {sec.label}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {sec.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= LINKS EXTERNOS (FORA DO MENU) ================= */}
          {directLinks.map((item) => {
            const active = isLinkActive(item.to);
            return (
              <Link
                key={item.label}
                href={item.to}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                  active
                    ? 'bg-cyan-400/10 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.15)] border border-cyan-400/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* ================= LINK AO VIVO ================= */}
          <Link
            href="/#ao-vivo"
            onClick={() => handleNavClick('/#ao-vivo')}
            className={`group ml-1 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              pathname === '/ao-vivo' || pathname === '/redes'
                ? 'border-rose-500/50 bg-rose-500/20 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:border-rose-500/60 hover:bg-rose-500/20'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            <span>Ao Vivo</span>
          </Link>
        </nav>

        {/* ================= AÇÕES DA DIREITA ================= */}
        <div className="hidden lg:flex items-center gap-2.5">
          {onOpenPitchModal && (
            <button
              onClick={onOpenPitchModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20 hover:border-cyan-400/50 transition-all cursor-pointer backdrop-blur-sm whitespace-nowrap"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
              <span>Dossiê</span>
            </button>
          )}

          <Link
            href="/admin"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-[0_0_24px_rgba(0,216,255,0.4)] transition-all hover:brightness-110 hover:shadow-[0_0_32px_rgba(0,216,255,0.6)] whitespace-nowrap"
          >
            <span>Painel Gestor</span>
            <ExternalLink className="h-3 w-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* ================= BOTÃO MOBILE ================= */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/ao-vivo"
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-300"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
            <span>Ao Vivo</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu de navegação"
            className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-2 text-cyan-200 hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ================= MENU MOBILE EXPANSÍVEL ================= */}
      {mobileMenuOpen && (
        <nav className="border-t border-cyan-500/15 bg-[#040D1A]/95 backdrop-blur-2xl px-4 py-4 lg:hidden max-h-[85vh] overflow-y-auto space-y-3">
          
          {/* Submenu da Página Inicial */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3 space-y-1">
            <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-300 font-bold">
              {'// Início & Seções'}
            </p>
            {inicioSections.map((sec) => (
              <Link
                key={sec.to}
                href={sec.to}
                onClick={() => handleNavClick(sec.to)}
                className="flex items-center gap-3 rounded-xl p-2 text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors"
              >
                <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 shrink-0">
                  {sec.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white">{sec.label}</p>
                  <p className="text-[10px] text-slate-400 truncate">{sec.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Links Externos Mobile */}
          <div className="grid gap-1 pt-1">
            <p className="px-3 pt-1 font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {'// Páginas Oficiais'}
            </p>
            {directLinks.map((item) => {
              const active = isLinkActive(item.to);
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    active ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="text-cyan-400">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Ações Mobile */}
          <div className="pt-2 flex flex-col gap-2 border-t border-white/10">
            {onOpenPitchModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPitchModal();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-2.5 text-xs font-semibold text-cyan-200 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                <span>Dossiê Institucional</span>
              </button>
            )}

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 px-3.5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-slate-950 shadow-md"
            >
              <span>Acessar Painel Gestor</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
