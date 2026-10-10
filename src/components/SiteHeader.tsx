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
    { to: '/#tecnologia', label: 'Tecnologia & Aulas' },
    { to: '/#como-funciona', label: 'Como Funciona' },
    { to: '/#avisos', label: 'Avisos' },
    { to: '/#mapa', label: 'Comunidades' },
    { to: '/#noticias', label: 'Notícias' },
    { to: '/galeria', label: 'Acervo' },
    { to: '/faq', label: 'Dúvidas' },
    { to: '/redes', label: 'Transmissões' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Brand Logo */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5 group">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-bold text-primary-deep tracking-tight">
              MEDTEC Rondônia
            </span>
            <span className="block truncate text-xs text-muted-foreground font-medium">
              Governo de Rondônia · SEDUC
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.label}
                href={item.to}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-secondary text-primary font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Admin */}
        <div className="hidden lg:flex items-center gap-2">
          {onOpenPitchModal && (
            <button
              onClick={onOpenPitchModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition-colors shadow-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
              Dossiê
            </button>
          )}
          <Link
            href="/admin"
            className="rounded-lg bg-primary hover:bg-primary-deep px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all tracking-wide uppercase"
          >
            Painel Gestor
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="grid gap-1 border-t border-slate-200 px-4 py-3 lg:hidden bg-white">
          {navLinks.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-secondary text-primary font-semibold' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 mt-1 flex flex-col gap-1.5">
            {onOpenPitchModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPitchModal();
                }}
                className="w-full text-left rounded-lg bg-sky-50 text-sky-800 px-3 py-2 text-sm font-medium flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                Dossiê de Aprovação do Projeto
              </button>
            )}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-deep text-center shadow-xs"
            >
              Painel Gestor MEDTEC
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
