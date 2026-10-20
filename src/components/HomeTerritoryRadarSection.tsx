'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Satellite, 
  ArrowRight, 
  Compass, 
  CheckCircle2, 
  School, 
  Users, 
  Waves,
  Trees,
  Cpu
} from 'lucide-react';

export default function HomeTerritoryRadarSection() {
  const hubs = [
    {
      region: 'Baixo Madeira & Rios',
      polo: 'Calama, Nazaré & São Carlos',
      type: 'Comunidades Ribeirinhas',
      icon: Waves,
      color: 'text-cyan-500 dark:text-cyan-400',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
      desc: 'Salas conectadas em margens de rios onde o acesso só é possível por barco. Antenas parabólicas com redundância de sinal para o inverno amazônico.'
    },
    {
      region: 'Vale do Guaporé & Fronteira',
      polo: 'Guajará-Mirim & Costa Marques',
      type: 'Povos Originários & Fronteira',
      icon: Trees,
      color: 'text-emerald-500 dark:text-emerald-400',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      desc: 'Atendimento a aldeias indígenas e distritos fronteiriços, valorizando tradições ancestrais e garantindo o Ensino Médio sem evasão territorial.'
    },
    {
      region: 'Polo Central & Café',
      polo: 'Cacoal, Pimenta Bueno & Ji-Paraná',
      type: 'Terras Indígenas & Saberes Suruí',
      icon: Cpu,
      color: 'text-sky-500 dark:text-sky-400',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
      desc: 'Projetos de cartografia digital comunitária, bioeconomia e sustentabilidade desenvolvidos por jovens dos povos da floresta.'
    },
    {
      region: 'Zona da Mata & Cone Sul',
      polo: 'Rolim de Moura, Colorado & Vilhena',
      type: 'Assentamentos & Agroecologia',
      icon: School,
      color: 'text-amber-500 dark:text-amber-400',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
      desc: 'Laboratórios vivos de automação solar e hidroponia integrados à agricultura familiar e à matriz BNCC + componente NBAZ.'
    }
  ];

  return (
    <section id="territorio-radar" className="relative scroll-mt-20 py-20 sm:py-28 bg-[#F0F4F8] dark:bg-[#040B16] transition-colors duration-200 border-t border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Cabeçalho */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-cyan-950/60 border border-sky-300 dark:border-cyan-400/30 text-[#004A99] dark:text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-[0.2em] shadow-xs">
              <Compass className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
              <span>RADAR TERRITORIAL // 52 MUNICÍPIOS DE RONDÔNIA</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-display">
              Do Rio Madeira às Fronteiras: <span className="gradient-text">Presença em Todo o Estado</span>
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              O MEDTEC assegura o direito constitucional à educação de qualidade onde a fibra óptica não alcança: 129 unidades escolares em aldeias indígenas, comunidades ribeirinhas, quilombos e assentamentos rurais.
            </p>
          </div>

          <Link
            href="/mapa"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#004A99] hover:bg-[#003B7A] dark:bg-[#00D8FF] dark:hover:bg-cyan-300 text-white dark:text-slate-950 text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap self-start lg:self-auto shrink-0"
          >
            <MapPin className="h-4 w-4" />
            <span>Abrir Mapa Interativo de Escolas</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Bento Grid dos 4 Polos Emblemáticos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <div
                key={hub.region}
                className="group relative flex flex-col justify-between rounded-3xl bg-slate-50 dark:bg-[#0C1E38] border border-slate-200/90 dark:border-[#1A365D] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#004A99]/50 dark:hover:border-cyan-400/50"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-[#1A365D] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                      <Icon className={`w-5 h-5 ${hub.color}`} />
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${hub.badgeColor}`}>
                      {hub.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors">
                      {hub.region}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-cyan-300/80 mt-0.5">
                      Polo: {hub.polo}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {hub.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-[#1A365D] flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Sinal Ativo
                  </span>
                  <span>Porto Velho ⇄ Satélite</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Faixa Inferior de Telemetria Geográfica */}
        <div className="rounded-3xl border border-sky-200/80 dark:border-cyan-500/20 bg-gradient-to-r from-sky-50 via-white to-sky-50 dark:from-[#081528] dark:via-[#0C1E38] dark:to-[#081528] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <Satellite className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Quer localizar a sala conectada mais próxima no seu município?
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Consulte turmas, coordenadas geográficas de antenas, professores mediadores e quantitativo de alunos em tempo real.
              </p>
            </div>
          </div>

          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#061224] text-[#004A99] dark:text-[#00D8FF] hover:bg-slate-100 dark:hover:bg-[#0A1A30] border border-sky-300 dark:border-cyan-500/30 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <span>Ver Lista Completa das 129 Escolas</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
