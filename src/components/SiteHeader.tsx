'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Menu, X, ShieldCheck } from 'lucide-react';

interface SiteHeaderProps {
  onOpenPitchModal?: () => void;
}

export default function SiteHeader({ onOpenPitchModal }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { to: '/', label: 'Início' },
    { to: '/#tecnologia', label: 'Tecnologia' },
    { to: '/#como-funciona', label: 'Como Funciona' },
    { to: '/#avisos', label: 'Avisos' },
    { to: '/#mapa', label: 'Comunidades' },
    { to: '/#noticias', label: 'Notícias' },
    { to: '/galeria', label: 'Acervo' },
    { to: '/faq', label: 'Dúvidas' },
    { to: '/redes', label: 'Ao vivo' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-400/20 bg-[#050b16]/80 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 group">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-sky-600 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.45)] group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]">
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan-300 opacity-70" />
            </span>
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-bold tracking-tight text-white">
              MEDTEC Rondônia
            </span>
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/80">
              SEDUC · Sinal ativo
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.label}
                href={item.to}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-cyan-400/15 text-cyan-200'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {onOpenPitchModal && (
            <button
              onClick={onOpenPitchModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/20 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
              Dossiê
            </button>
          )}
          <Link
            href="/admin"
            className="rounded-lg bg-gradient-to-r from-cyan-300 to-sky-500 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all hover:brightness-110"
          >
            Painel Gestor
          </Link>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
            className="rounded-lg border border-cyan-400/30 p-2 text-cyan-100 hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="grid gap-1 border-t border-cyan-400/15 bg-[#050b16] px-4 py-3 lg:hidden">
          {navLinks.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-1 flex flex-col gap-1.5 border-t border-white/10 pt-2">
            {onOpenPitchModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPitchModal();
                }}
                className="flex w-full items-center gap-2 rounded-lg bg-cyan-400/10 px-3 py-2 text-left text-sm font-medium text-cyan-100"
              >
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                Dossiê de Aprovação do Projeto
              </button>
            )}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-gradient-to-r from-cyan-300 to-sky-500 px-3 py-2 text-center text-sm font-bold text-slate-950"
            >
              Painel Gestor MEDTEC
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
