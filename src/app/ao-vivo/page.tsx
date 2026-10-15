import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageHeader from '@/components/PageHeader';
import SocialSection from '@/components/SocialSection';
import { getDatabase } from '@/lib/db';
import initialData from '@/data/initialData.json';
import { SocialLinks } from '@/types';
import { 
  Radio, 
  Satellite, 
  Signal, 
  Tv, 
  Clock, 
  ExternalLink
} from 'lucide-react';

export default async function AoVivoPage() {
  const db = getDatabase();
  const socials = db.socials || (initialData.socials as SocialLinks);

  const schedules = [
    {
      shift: 'Turno Matutino',
      hours: '07h30 às 11h45',
      desc: 'Formação Geral Básica (BNCC) — Linguagens, Matemática, Ciências da Natureza e Humanas.',
      status: 'Transmissão Regular',
    },
    {
      shift: 'Turno Vespertino',
      hours: '13h30 às 17h45',
      desc: 'Itinerários Formativos, Projeto de Vida e Componente NBAZ (Agroecologia e Zootecnia).',
      status: 'Transmissão Regular',
    },
    {
      shift: 'Plantão Pedagógico',
      hours: 'Em tempo real',
      desc: 'Canal de retorno e interação síncrona entre professores ministrantes e mediadores presenciais.',
      status: 'Canal Ativo',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      <main className="flex-1 pb-16">
        <PageHeader
          eyebrow="Transmissões & Mídias Digitais"
          title="Transmissões Ao Vivo & Redes Oficiais"
          text="Aulas ao vivo transmitidas dos estúdios centrais de TV da SEDUC em Porto Velho para centenas de salas conectadas em todo o estado de Rondônia, acompanhadas diariamente por professores mediadores presenciais."
        />

        <div className="mx-auto max-w-7xl px-4 pt-10">
          {/* Console de Transmissão ao Vivo */}
          <div className="relative overflow-hidden rounded-3xl bg-[#050b16] text-white p-6 sm:p-10 border border-cyan-400/30 shadow-2xl mb-12">
            <div className="hero-grid absolute inset-0 opacity-40 pointer-events-none" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    Sinal no Ar · Estúdio Central
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-200">
                    <Satellite className="h-3 w-3" />
                    Satélite & IP
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-300">
                    <Signal className="h-3 w-3" />
                    4K Ultra HD
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Estúdio de Gravação e Transmissão da SEDUC
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  A Coordenadoria de Mídias Educacionais opera estúdios televisivos de alta tecnologia em Porto Velho, transmitindo diariamente aulas síncronas para estudantes em comunidades ribeirinhas, indígenas, quilombolas e assentamentos agrícolas de Rondônia.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href={socials.youtube || 'https://www.youtube.com/@SeducRondonia'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-900/40 transition-all hover:scale-[1.02]"
                  >
                    <Tv className="h-4 w-4" />
                    <span>Assistir Aulas no YouTube</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={socials.whatsapp || 'https://wa.me/5569999999999'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-5 py-3 text-xs sm:text-sm font-semibold text-emerald-300 transition-colors"
                  >
                    <span>Suporte Técnico da Sala</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Grade de Horários */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-mono text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Clock size={14} />
                    Grade Diária de Transmissão
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Segunda a Sexta</span>
                </div>

                {schedules.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-cyan-300/40"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-white">{item.shift}</span>
                      <span className="font-mono text-xs font-semibold text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                        {item.hours}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seção das Redes Sociais Integradas */}
          <SocialSection socials={socials} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
