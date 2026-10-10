'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Users, 
  MapPin, 
  Radio, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  Play, 
  Sparkles,
  School,
  Wifi,
  Satellite,
  Compass,
  Zap
} from 'lucide-react';
import { SiteInfo, Stats } from '@/types';

interface HeroProps {
  siteInfo: SiteInfo;
  stats: Stats;
}

export default function Hero({ siteInfo, stats }: HeroProps) {
  return (
    <section id="topo" className="relative overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-20 lg:pb-28">
      {/* Background Futurista com Gradiente Oficial SEDUC Rondônia */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00875a] via-sky-600 to-blue-800 pointer-events-none" />

      {/* Orbs de Luz e Partículas Futuristas (Estilo Matricula Online) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[750px] h-[750px] rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-sky-400/10 blur-3xl" />
        
        {/* Partículas flutuantes com animação */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 rounded-full bg-amber-400/50 animate-float" />
        <div className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full bg-white/20 animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-5 h-5 rounded-full bg-emerald-400/40 animate-float" style={{ animationDelay: '2.5s' }} />

        {/* Grade Quadriculada Tecnológica */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        
        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Coluna Texto Principal */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Live Beacon / Status Satelital */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/25 backdrop-blur-md text-white text-xs sm:text-sm font-semibold shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="font-bold text-emerald-300">Sinal Conectado</span>
              <span className="text-white/40">•</span>
              <span className="text-white/90">Ensino Médio com Mediação Tecnológica</span>
            </div>

            {/* Título Principal Futurista */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              A Educação do Futuro{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sky-200 to-amber-300">
                Chega a Todo Canto de Rondônia
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-lg md:text-xl text-white/90 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {siteInfo.heroDescription}
            </p>

            {/* Selos dos Públicos Atendidos */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs font-semibold text-white/90">
              <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/20 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-300" />
                Ribeirinhos & Indígenas
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/20 flex items-center gap-1.5">
                <Compass size={14} className="text-sky-300" />
                Quilombolas & Rurais
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/20 flex items-center gap-1.5">
                <Zap size={14} className="text-emerald-300" />
                Lei Estadual nº 3.846/2016
              </span>
            </div>

            {/* Botões de Ação estilo Matrícula Online SEDUC */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                href="#como-funciona"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-900 font-extrabold text-sm sm:text-base shadow-2xl hover:bg-white/90 hover:scale-105 transition-all duration-300"
              >
                <span>Como Funciona o MEDTEC</span>
                <ArrowRight size={18} className="text-blue-700" />
              </Link>

              <Link
                href="#noticias"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 font-bold text-sm sm:text-base hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <span>Avisos & Notícias</span>
              </Link>

              <Link
                href="#redes"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl hover:bg-amber-300 hover:scale-105 transition-all duration-300"
              >
                <Play size={16} className="fill-slate-950" />
                <span>Canal ao Vivo</span>
              </Link>
            </div>

          </div>

          {/* Coluna Card Visual: Interface Holográfica dos Estúdios de TV */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl p-5 bg-white/10 backdrop-blur-xl border border-white/25 shadow-2xl overflow-hidden group">
              
              {/* Moldura de TV / Satélite */}
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-950">
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80" 
                  alt="Estúdio de Transmissão MEDTEC SEDUC Rondônia" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />

                {/* Overlay Tecnológico */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                      <Radio size={12} className="animate-pulse" />
                      Ao Vivo • Estúdio Porto Velho
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 text-emerald-400 text-[10px] font-mono border border-emerald-500/40">
                      SINAL SAT • 4K
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white font-extrabold text-lg leading-snug">
                      Coordenadoria de Mídias Educacionais
                    </h3>
                    <p className="text-sky-200 text-xs mt-1">
                      Aulas interativas transmitidas simultaneamente para salas conectadas em todo o estado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status de Conexão Rápido */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-white text-xs">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2.5">
                  <Satellite size={18} className="text-sky-300 shrink-0" />
                  <div>
                    <div className="font-bold text-white">52 Municípios</div>
                    <div className="text-[10px] text-white/70">Cobertura estadual 100%</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2.5">
                  <Wifi size={18} className="text-emerald-300 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Professor Mediador</div>
                    <div className="text-[10px] text-white/70">Apoio presencial diário</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Métricas Futuristas (Estilo Cards Flutuantes de Matrícula Online) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white group hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
                <Users size={22} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">{stats.studentsCount}</div>
                <div className="text-xs text-white/80 font-medium">Estudantes Formados</div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white group hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center font-bold">
                <School size={22} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">{stats.schoolsCount}</div>
                <div className="text-xs text-white/80 font-medium">Salas Conectadas</div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white group hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                <MapPin size={22} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">{stats.citiesCount}</div>
                <div className="text-xs text-white/80 font-medium">Municípios em Rondônia</div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white group hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center font-bold">
                <Radio size={22} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">{stats.liveHoursCount}</div>
                <div className="text-xs text-white/80 font-medium">Horas de Transmissão</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Divisor Ondulado SVG Futurista (Exatamente igual ao do matriculaonline.seduc.ro.gov.br) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none" style={{ bottom: '-1px' }}>
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-auto block" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white"
          />
        </svg>
      </div>

    </section>
  );
}
