import React from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Users, 
  MapPin, 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Sparkles,
  School
} from 'lucide-react';
import { SiteInfo, Stats } from '@/types';

interface HeroProps {
  siteInfo: SiteInfo;
  stats: Stats;
}

export default function Hero({ siteInfo, stats }: HeroProps) {
  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Elementos visuais decorativos de fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.15),transparent_40%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Coluna Texto Principal */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge de Lei e Governo */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs sm:text-sm font-medium backdrop-blur-sm shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-emerald-300">SEDUC Rondônia</span>
              <span>•</span>
              <span>{siteInfo.heroBadge || 'Lei Estadual nº 3.846/2016'}</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {siteInfo.heroTitle.split(' ').slice(0, 3).join(' ')}{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                {siteInfo.heroTitle.split(' ').slice(3).join(' ') || 'com Tecnologia'}
              </span>
            </h1>

            {/* Descrição */}
            <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {siteInfo.heroDescription}
            </p>

            {/* Selo dos Públicos Prioritários */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-emerald-200/90 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Comunidades Ribeirinhas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Terras Indígenas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Populações Quilombolas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Áreas Rurais e Agrícolas
              </span>
            </div>

            {/* Botões de Ação */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                href="#sobre"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Conhecer o Projeto</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="#noticias"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <span>Últimas Notícias</span>
              </Link>

              <Link
                href="#redes"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-semibold text-sm sm:text-base backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <Play size={16} className="fill-amber-300 text-amber-300" />
                <span>Canal ao Vivo</span>
              </Link>
            </div>
          </div>

          {/* Coluna Card Visual e Mídias */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-emerald-600/30 bg-emerald-950/60 p-4 backdrop-blur-xl shadow-2xl">
              <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80" 
                  alt="Estúdios de Transmissão MEDTEC SEDUC Rondônia" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
                  <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Radio size={12} className="animate-pulse" />
                    Transmissão Satelital
                  </div>
                  <h2 className="text-white font-bold text-lg leading-snug">
                    Estúdios Televisivos da SEDUC em Porto Velho
                  </h2>
                  <p className="text-emerald-200 text-xs mt-1">
                    Conectando salas de aula em tempo real com apoio do professor presencial.
                  </p>
                </div>
              </div>

              {/* Destaque rápido no card */}
              <div className="mt-4 p-3 bg-emerald-900/60 rounded-xl border border-emerald-700/40 flex items-center justify-between text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="font-semibold text-white">Metodologia Exclusiva:</span>
                  <span>Prof. Estúdio + Prof. Presencial</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">
                  BNCC + TDIC
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Barra de Métricas / Estatísticas */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Users size={22} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">{stats.studentsCount}</div>
                <div className="text-xs text-emerald-200/80 font-medium">Estudantes Alcançados</div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300">
                <School size={22} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">{stats.schoolsCount}</div>
                <div className="text-xs text-teal-200/80 font-medium">Salas Conectadas</div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                <MapPin size={22} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">{stats.citiesCount}</div>
                <div className="text-xs text-amber-200/80 font-medium">Municípios em Rondônia</div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300">
                <Radio size={22} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">{stats.liveHoursCount}</div>
                <div className="text-xs text-blue-200/80 font-medium">Horas de Transmissão/Ano</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

