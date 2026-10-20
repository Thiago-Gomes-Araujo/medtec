'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ExternalLink, 
  HelpCircle, 
  ShieldCheck, 
  Radio, 
  GraduationCap, 
  Users, 
  ArrowRight,
  Headphones,
  CheckCircle2
} from 'lucide-react';

interface HomeQuickAccessCTAProps {
  onOpenPitchModal?: () => void;
}

export default function HomeQuickAccessCTA({ onOpenPitchModal }: HomeQuickAccessCTAProps) {
  return (
    <section className="relative py-20 sm:py-28 bg-white dark:bg-[#061224] transition-colors duration-200 border-t border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Card Principal em Glassmorphism com Efeito Aeroespacial */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#05549D] via-[#072F5E] to-[#0A3D73] dark:from-[#07162C] dark:via-[#0C1E38] dark:to-[#040D1A] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-white/10">
          
          {/* Focos e Luzes de Fundo */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

          {/* Cantoneiras Técnicas Sutis */}
          <div className="pointer-events-none absolute left-4 top-4 h-4 w-4 border-l-2 border-t-2 border-cyan-400/60" />
          <div className="pointer-events-none absolute right-4 top-4 h-4 w-4 border-r-2 border-t-2 border-cyan-400/60" />
          <div className="pointer-events-none absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-cyan-400/60" />
          <div className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-cyan-400/60" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Texto de Impacto */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-[#07162C]/70 px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-200 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>GOVERNO DE RONDÔNIA • SEDUC // SINAL ATIVO</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                Pronto para se conectar com a{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-white bg-clip-text text-transparent">
                  educação do futuro?
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
                Seja você estudante, professor mediador, gestor educacional ou pesquisador, acesse os canais oficiais do programa e confira os dados consolidados do MEDTEC.
              </p>

              {/* Badges de Garantia */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1.5 text-cyan-200">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Diploma Regular Estadual
                </span>
                <span className="text-white/20">•</span>
                <span className="inline-flex items-center gap-1.5 text-cyan-200">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Lei Estadual nº 3.846/2016
                </span>
                <span className="text-white/20">•</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  100% Gratuito
                </span>
              </div>
            </div>

            {/* Ações / Botões Rápidos */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Botão de Dossiê Pitch Modal */}
              {onOpenPitchModal && (
                <button
                  type="button"
                  onClick={onOpenPitchModal}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-400 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-950" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-extrabold leading-tight">Ver Dossiê do MEDTEC</p>
                      <p className="text-[11px] font-mono text-slate-800">Apresentação institucional completa</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              )}

              {/* Botão do Painel Gestor */}
              <Link
                href="/painel-gestor"
                className="group flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all cursor-pointer backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold leading-tight">Painel Gestor &amp; Salas</p>
                    <p className="text-[11px] font-mono text-slate-300">Acesso para mediadores e coordenadores</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-cyan-300 transition-colors" />
              </Link>

              {/* Links de Apoio */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/duvidas"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#040D1A]/50 hover:bg-[#040D1A]/80 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Dúvidas &amp; FAQ</span>
                </Link>

                <Link
                  href="/transparencia"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#040D1A]/50 hover:bg-[#040D1A]/80 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Transparência</span>
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
