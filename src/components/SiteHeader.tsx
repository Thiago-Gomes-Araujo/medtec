'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown, 
  ExternalLink,
  Moon,
  Sun,
  Radio,
  Building2,
  Users,
  ScrollText,
  Satellite
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExecutiveDossierModal from './ExecutiveDossierModal';

interface SiteHeaderProps {
  onOpenPitchModal?: () => void;
}

// Helpers para sincronização segura do tema via useSyncExternalStore
function subscribeTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getThemeSnapshot(): boolean {
  try {
    return localStorage.getItem('medtec-theme') !== 'light';
  } catch {
    return true;
  }
}

function getServerThemeSnapshot(): boolean {
  return true;
}

export default function SiteHeader({ onOpenPitchModal }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inicioDropdownOpen, setInicioDropdownOpen] = useState(false);
  const [dossieOpen, setDossieOpen] = useState(false);
  const [dossieInitialTab, setDossieInitialTab] = useState(0);

  // Sincronização limpa do tema com localStorage sem acionar cascading render
  const isDarkMode = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Aplica classe no documentElement conforme o tema atual
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } catch {
      // Ignora erro em ambientes restritos
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    try {
      const nextTheme = isDarkMode ? 'light' : 'dark';
      localStorage.setItem('medtec-theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Ignora erro
    }
  };

  // Fecha o dropdown se clicar fora ou pressionar ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setInicioDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setInicioDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
    }, 200);
  };

  const handleOpenDossie = (tabIndex = 0) => {
    setDossieInitialTab(tabIndex);
    setInicioDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onOpenPitchModal) {
      onOpenPitchModal();
    }
    setDossieOpen(true);
  };

  const handleNavClick = (to: string, e?: React.MouseEvent) => {
    setInicioDropdownOpen(false);
    setMobileMenuOpen(false);

    if (to.startsWith('/#')) {
      const id = to.replace('/#', '');
      if (pathname === '/') {
        if (e) e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (id === 'inicio') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        router.push(to);
      }
    } else if (to === '/') {
      if (pathname === '/') {
        if (e) e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/');
      }
    } else {
      router.push(to);
    }
  };

  // Atalhos rápidos do Popover Início direcionando para as respectivas páginas e seções
  const megaMenuShortcuts = [
    {
      title: 'Página Inicial',
      desc: 'Visão geral da plataforma e telemetria de Rondônia.',
      icon: Radio,
      target: '/',
    },
    {
      title: 'Professores & Mediadores',
      desc: 'Docentes ministrantes e mediadores presenciais nas salas.',
      icon: Users,
      target: '/professores',
    },
    {
      title: 'Alunos que Inspiram',
      desc: 'Histórias de sucesso, olimpíadas e futuro dos alunos.',
      icon: GraduationCap,
      target: '/alunos',
    },
    {
      title: 'Pilares & Metodologia',
      desc: 'Como funciona a dinâmica do MEDTEC e matriz curricular.',
      icon: Building2,
      target: '/#tecnologia',
    },
    {
      title: 'Transmissões Ao Vivo',
      desc: 'Aulas ao vivo, estúdios centrais e redes oficiais.',
      icon: Satellite,
      target: '/ao-vivo',
    },
  ];

  // Links da Pílula Unificada Central (Zona 2)
  const dockLinks = [
    { to: '/noticias', label: 'Notícias' },
    { to: '/avisos', label: 'Avisos' },
    { to: '/galeria', label: 'Galeria' },
    { to: '/mapa', label: 'Mapa' },
    { to: '/duvidas', label: 'Dúvidas' },
    { to: '/transparencia', label: 'Transparência' },
  ];

  const isLinkActive = (to: string) => {
    if (to === '/') return pathname === '/';
    if (to === '/galeria') return pathname === '/galeria' || pathname === '/acervo';
    if (to === '/mapa') return pathname === '/mapa' || pathname === '/comunidades';
    if (to === '/duvidas') return pathname === '/duvidas' || pathname === '/faq';
    if (to.startsWith('/#')) return false;
    return pathname === to || pathname.startsWith(to + '/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-cyan-500/15 bg-white/85 dark:bg-[#040D1A]/90 backdrop-blur-xl transition-colors duration-200 shadow-xs dark:shadow-none">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 dark:via-cyan-400/40 to-transparent" />
        
        {/* ================= 3-ZONE LAYOUT CONTAINER (ESQUERDA / CENTRO / DIREITA) ================= */}
        <div className="w-full flex items-center justify-between gap-4 px-4 sm:px-8 py-2.5">
          
          {/* ================= ZONA 1 (ESQUERDA — IDENTIDADE FIXA À ESQUERDA) ================= */}
          <div className="flex items-center justify-start flex-1 min-w-0">
            <Link href="/" className="flex min-w-0 items-center gap-3 group shrink-0">
              <span className="relative grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,216,255,0.35)] group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#00D8FF]">
                  <span className="absolute inset-0 animate-ping rounded-full bg-cyan-300 opacity-75" />
                </span>
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-display text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-200 transition-colors whitespace-nowrap">
                  MEDTEC Rondônia
                </span>
                <span className="block truncate font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#05549D] dark:text-cyan-300/80 font-semibold whitespace-nowrap">
                  SEDUC • SINAL ATIVO
                </span>
              </span>
            </Link>
          </div>

          {/* ================= ZONA 2 (CENTRO — PÍLULA DE NAVEGAÇÃO CENTRALIZADA) ================= */}
          <nav className="hidden lg:flex items-center justify-center shrink-0">
            <div className="flex items-center gap-0.5 rounded-full border border-slate-200/90 dark:border-[#1A365D] bg-slate-100/80 dark:bg-[#0C1E38]/60 px-2 py-1 backdrop-blur-md shadow-xs dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-colors">
              
              {/* ITEM 1: INÍCIO COM MEGA-MENU POPOVER */}
              <div 
                ref={dropdownRef} 
                className="relative flex items-center"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className={`inline-flex items-center rounded-full text-xs font-semibold tracking-wide transition-all ${
                    pathname === '/' || inicioDropdownOpen
                      ? 'bg-sky-500/15 text-[#05549D] border border-sky-400/40 dark:bg-cyan-400/15 dark:text-cyan-300 dark:shadow-[inset_0_0_10px_rgba(0,216,255,0.2)] dark:border-cyan-400/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <Link
                    href="/"
                    onClick={(e) => {
                      handleNavClick('/', e);
                    }}
                    className="pl-2.5 pr-1 py-1 inline-flex items-center cursor-pointer whitespace-nowrap"
                  >
                    <span>Início</span>
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setInicioDropdownOpen(!inicioDropdownOpen);
                    }}
                    className="pr-2 py-1 pl-0.5 cursor-pointer flex items-center text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 transition-colors"
                    aria-expanded={inicioDropdownOpen}
                    aria-label="Abrir menu de início"
                  >
                    <ChevronDown 
                      className={`h-3 w-3 transition-transform duration-200 ${
                        inicioDropdownOpen ? 'rotate-180 text-sky-600 dark:text-cyan-300' : 'text-slate-400'
                      }`} 
                    />
                  </button>
                </div>

                {/* ================= MEGA-MENU FLUTUANTE (ESTILO STRIPE / VERCEL) ================= */}
                <AnimatePresence>
                  {inicioDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute left-0 top-full pt-2 z-50 w-[640px]"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white/95 dark:bg-[#061020]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-colors">
                        
                        <div className="grid grid-cols-12 gap-4">
                          
                          {/* COLUNA ESQUERDA (CARD DESTAQUE — 40% / 5 colunas) */}
                          <div className="col-span-5 flex flex-col justify-between rounded-xl border border-sky-200 dark:border-cyan-500/20 bg-gradient-to-br from-sky-50 via-slate-50 to-blue-50 dark:from-[#0C2444] dark:via-[#08182E] dark:to-[#040E1B] p-4 text-left transition-colors">
                            <div>
                              {/* Badge de Sinal */}
                              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 dark:border-cyan-400/30 bg-sky-100/80 dark:bg-cyan-400/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#05549D] dark:text-cyan-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-cyan-400 shadow-[0_0_6px_#00D8FF] animate-pulse" />
                                SINAL ATIVO • BANDA KU
                              </div>

                              <div className="mt-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-300 dark:border-cyan-400/30 bg-sky-100 dark:bg-cyan-400/10 text-[#05549D] dark:text-cyan-300 mb-2">
                                  <Satellite className="h-4 w-4 text-[#05549D] dark:text-[#00D8FF]" />
                                </div>
                                <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                                  Arquitetura MEDTEC RO
                                </h4>
                                <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                  Transmissão síncrona em 4K UHD gerada nos estúdios centrais em Porto Velho e distribuída via satélite para os 52 municípios rondonienses.
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-cyan-500/20 flex items-center justify-between gap-2">
                              <Link
                                href="/ao-vivo"
                                onClick={(e) => handleNavClick('/ao-vivo', e)}
                                className="group flex items-center gap-1.5 text-[11px] font-semibold text-[#05549D] dark:text-cyan-300 hover:text-sky-700 dark:hover:text-white transition-colors cursor-pointer"
                              >
                                <span>Ver Transmissão Ao Vivo</span>
                                <span className="text-sky-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform">→</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleOpenDossie(1)}
                                className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-cyan-200 cursor-pointer"
                              >
                                [Dossiê]
                              </button>
                            </div>
                          </div>

                          {/* COLUNA DIREITA (ATALHOS RÁPIDOS — 60% / 7 colunas) */}
                          <div className="col-span-7 flex flex-col justify-between">
                            <div className="mb-2 flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#05549D] dark:text-cyan-300/80">
                                {'// PÁGINAS & SEÇÕES DO MEDTEC'}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{megaMenuShortcuts.length} itens</span>
                            </div>

                            <div className="grid gap-1.5">
                              {megaMenuShortcuts.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.title}
                                    href={item.target}
                                    onClick={(e) => handleNavClick(item.target, e)}
                                    className="group flex items-start gap-3 rounded-xl p-2 text-left transition-all hover:bg-slate-100 dark:hover:bg-white/5 hover:border-sky-300 dark:hover:border-cyan-400/30 border border-transparent cursor-pointer w-full"
                                  >
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-cyan-400/20 bg-slate-100 dark:bg-cyan-400/10 text-sky-600 dark:text-[#00D8FF] transition-transform group-hover:scale-105 group-hover:border-sky-400 dark:group-hover:border-cyan-400/50">
                                      <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-200 transition-colors leading-tight">
                                        {item.title}
                                      </p>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-tight">
                                        {item.desc}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DEMAIS LINKS CENTRAIS */}
              {dockLinks.map((item) => {
                const active = isLinkActive(item.to);
                return (
                  <Link
                    key={item.label}
                    href={item.to}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                      active
                        ? 'bg-sky-500/15 text-[#05549D] border border-sky-400/40 dark:bg-cyan-400/15 dark:text-cyan-300 dark:shadow-[inset_0_0_10px_rgba(0,216,255,0.2)] dark:border-cyan-400/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* LINK AO VIVO (PULSANTE) */}
              <Link
                href="/ao-vivo"
                onClick={(e) => handleNavClick('/ao-vivo', e)}
                className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all whitespace-nowrap ml-0.5 ${
                  pathname === '/ao-vivo' || pathname === '/redes'
                    ? 'border border-rose-500/50 bg-rose-500/20 text-rose-600 dark:text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                    : 'border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:border-rose-500/60 hover:bg-rose-500/20'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
                <span>Ao Vivo</span>
              </Link>

            </div>
          </nav>

          {/* ================= ZONA 3 (DIREITA — AÇÕES DE COMANDO FIXAS À DIREITA) ================= */}
          <div className="hidden lg:flex items-center justify-end flex-1 gap-2.5 shrink-0">
            
            {/* 1. BOTÃO DE TEMA COMPACTO (APENAS ÍCONE) */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 dark:border-cyan-500/25 bg-slate-100 dark:bg-[#0C1E38]/60 text-slate-700 dark:text-slate-200 hover:border-sky-400 dark:hover:border-cyan-400/50 hover:bg-slate-200 dark:hover:bg-cyan-500/10 transition-all cursor-pointer backdrop-blur-sm shadow-xs"
              title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label="Alternar tema de cores"
            >
              {isDarkMode ? (
                <Moon className="h-4 w-4 text-cyan-300 transition-transform hover:rotate-12" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500 transition-transform hover:rotate-45" />
              )}
            </button>

            {/* 2. BOTÃO DOSSIÊ EXECUTIVO */}
            <button
              onClick={() => handleOpenDossie(0)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-cyan-400/30 bg-slate-100 dark:bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-cyan-200 hover:bg-slate-200 dark:hover:bg-cyan-400/20 hover:border-slate-400 dark:hover:border-cyan-400/50 transition-all cursor-pointer backdrop-blur-sm whitespace-nowrap"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-300" />
              <span>Dossiê</span>
            </button>

            {/* 3. CTA PAINEL GESTOR */}
            <Link
              href="/admin"
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-[0_0_20px_rgba(0,216,255,0.35)] transition-all hover:brightness-110 hover:shadow-[0_0_28px_rgba(0,216,255,0.6)] whitespace-nowrap"
            >
              <span>Painel Gestor</span>
              <ExternalLink className="h-3 w-3 opacity-75 group-hover:translate-x-0.5 transition-transform" />
            </Link>

          </div>

          {/* ================= CONTROLES MOBILE ================= */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Botão de Tema Mobile */}
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-500/20 bg-[#0C1E38]/60 text-cyan-300"
            >
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
            </button>

            <Link
              href="/ao-vivo"
              onClick={(e) => handleNavClick('/ao-vivo', e)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-bold text-rose-300"
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
                {'// Início & Páginas Estruturantes'}
              </p>
              {megaMenuShortcuts.map((sec) => {
                const Icon = sec.icon;
                return (
                  <Link
                    key={sec.title}
                    href={sec.target}
                    onClick={(e) => {
                      handleNavClick(sec.target, e);
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-xs font-medium text-slate-200 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 shrink-0 text-cyan-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{sec.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{sec.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Links Centrais Mobile */}
            <div className="grid gap-1 pt-1">
              <p className="px-3 pt-1 font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {'// Navegação Geral'}
              </p>
              {dockLinks.map((item) => {
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
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Ações Mobile */}
            <div className="pt-2 flex flex-col gap-2 border-t border-white/10">
              <button
                onClick={() => handleOpenDossie(0)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-2.5 text-xs font-semibold text-cyan-200 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                <span>Dossiê Institucional</span>
              </button>

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 px-3.5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-slate-950 shadow-md"
              >
                <span>Acessar Painel Gestor</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* ================= MODAL EXECUTIVO DOSSIÊ DO PROJETO ================= */}
      <ExecutiveDossierModal
        isOpen={dossieOpen}
        onClose={() => setDossieOpen(false)}
        initialTab={dossieInitialTab}
      />
    </>
  );
}
