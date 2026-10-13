'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  Tv, 
  Radio, 
  Satellite,
  Image as ImageIcon,
  HelpCircle,
  Share2,
  Eye,
  ExternalLink,
  X,
  Signal
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TechAdvantages from '@/components/TechAdvantages';
import Methodology from '@/components/Methodology';
import Announcements from '@/components/Announcements';
import TeacherProfiles from '@/components/TeacherProfiles';
import StudentStories from '@/components/StudentStories';
import SchoolMap from '@/components/SchoolMap';
import TransparencySection from '@/components/TransparencySection';
import NewsSection from '@/components/NewsSection';
import GallerySection from '@/components/GallerySection';
import FaqSection from '@/components/FaqSection';
import SocialSection from '@/components/SocialSection';
import PresentationPitchModal from '@/components/PresentationPitchModal';
import initialData from '@/data/initialData.json';
import { DatabaseSchema } from '@/types';
import { statsData } from '@/data/medtecData';

function SectionWrapper({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 pt-24">
      <div className="mb-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-700">
          // {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  const [dbData, setDbData] = useState<DatabaseSchema>(initialData as DatabaseSchema);
  const [profileTab, setProfileTab] = useState<'prof' | 'alunos'>('prof');
  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [activeResourceModal, setActiveResourceModal] = useState<'galeria' | 'faq' | 'redes' | null>(null);

  // Trava scroll da página quando modal de recurso estiver aberto
  useEffect(() => {
    if (activeResourceModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeResourceModal]);

  // Busca dados dinâmicos mais recentes do banco local (CMS)
  useEffect(() => {
    fetch('/api/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) {
          setDbData(json);
        }
      })
      .catch((err) => console.error('Aviso ao sincronizar dados do CMS:', err));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* CABEÇALHO OFICIAL MANTIDO */}
      <SiteHeader onOpenPitchModal={() => setPitchModalOpen(true)} />

      <main className="flex-1 pb-16">
        {/* ================= HERO SECTION (MÓDULO 01 - PDF P. 2) ================= */}
        <section className="relative overflow-hidden bg-[#050b16] text-white">
          <img
            src="/hero.jpg"
            alt="Estudantes em sala do MEDTEC assistindo aula transmitida"
            width={1600}
            height={912}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-hero-overlay" />
          <div className="hero-grid absolute inset-0" />
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-600/30 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-12 lg:py-20">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
                    <span className="relative h-2 w-2 rounded-full bg-cyan-300" />
                  </span>
                  Beacon · 52 municípios
                </span>
                <p className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-200 backdrop-blur-sm">
                  Lei 3.846/2016
                </p>
                <button
                  onClick={() => setPitchModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-white/5 px-3.5 py-1 text-xs font-semibold text-cyan-100 backdrop-blur-sm transition-colors hover:bg-cyan-400/15"
                >
                  <Sparkles className="h-3 w-3 text-cyan-300" />
                  Dossiê do projeto
                </button>
              </div>

              <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                A educação do futuro chega a{' '}
                <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-white bg-clip-text text-transparent">
                  todo canto de Rondônia
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Aulas ao vivo diretamente dos estúdios televisivos da Coordenadoria de Mídias Educacionais em Porto Velho para centenas de salas conectadas em todo o estado de Rondônia, acompanhadas diariamente por professores mediadores presenciais.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                {['Ribeirinhos & Indígenas', 'Quilombolas & Rurais', 'Portaria SEDUC nº 928/2025'].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-200 backdrop-blur-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#tecnologia"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-sky-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.35)] transition-all hover:brightness-110"
                >
                  Como funciona o MEDTEC
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#avisos"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  Avisos e notícias
                </a>
                <button
                  onClick={() => setActiveResourceModal('redes')}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300/40 px-5 py-3 text-sm font-semibold text-cyan-100 backdrop-blur-sm transition-colors hover:bg-cyan-400/15"
                >
                  <Tv className="h-4 w-4" />
                  Canal ao vivo
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="hud-frame relative overflow-hidden rounded-3xl p-4 backdrop-blur-xl sm:p-5">
                <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-cyan-300/80" />
                <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-cyan-300/80" />
                <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-cyan-300/80" />
                <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-cyan-300/80" />

                <div className="mb-4 flex items-center justify-between gap-3 px-2 pt-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                      Console de sinal
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">Estúdio Porto Velho</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                    <Radio className="h-3 w-3 animate-pulse" />
                    Ao vivo
                  </span>
                </div>

                <div className="relative mb-4 h-44 overflow-hidden rounded-2xl sm:h-52">
                  <img
                    src="/hero.jpg"
                    alt="Transmissão do estúdio MEDTEC"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050b16] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-cyan-100">
                    <span className="inline-flex items-center gap-1.5">
                      <Satellite className="h-3.5 w-3.5" />
                      Sat · IP
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Signal className="h-3.5 w-3.5" />
                      4K
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {statsData.map((stat, index) => (
                    <div
                      key={stat.rotulo}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <p className="font-mono text-[10px] text-cyan-300/80">0{index + 1}</p>
                      <p className="mt-1 font-display text-2xl font-bold text-white">{stat.valor}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-300">{stat.rotulo}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MÓDULO 02: VANTAGENS TECNOLÓGICAS DO MEDTEC ================= */}
        <TechAdvantages />

        {/* ================= MÓDULO 04: MURAL OFICIAL DE AVISOS & COMUNICADOS ================= */}
        <Announcements announcements={dbData.announcements} />

        {/* ================= QUEM FAZ ACONTECER: PROFESSORES E ALUNOS ================= */}
        <SectionWrapper 
          id="historias" 
          eyebrow="Perfis Humanizados" 
          title="Quem Faz Acontecer"
          subtitle="Conheça os educadores e estudantes que constroem a história da educação com mediação tecnológica em Rondônia."
        >
          <div className="mb-6 inline-flex gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1 backdrop-blur-sm">
            <button
              onClick={() => setProfileTab('prof')}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                profileTab === 'prof'
                  ? 'bg-slate-950 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.25)]'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Professores e Mediadores
            </button>
            <button
              onClick={() => setProfileTab('alunos')}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                profileTab === 'alunos'
                  ? 'bg-slate-950 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.25)]'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Alunos que Inspiram
            </button>
          </div>

          {profileTab === 'prof' ? <TeacherProfiles /> : <StudentStories />}
        </SectionWrapper>

        {/* ================= MÓDULO 03: METODOLOGIA EM 5 PASSOS (TIMELINE SEDUC) ================= */}
        <Methodology />

        {/* ================= O MEDTEC NAS COMUNIDADES: MAPA INTERATIVO ================= */}
        <SectionWrapper 
          id="mapa" 
          eyebrow="Território & Presença" 
          title="O MEDTEC nas Comunidades"
          subtitle="Explore os pontos conectados em terras indígenas, comunidades ribeirinhas, assentamentos e polos rurais em todo o estado."
        >
          <SchoolMap />
        </SectionWrapper>

        {/* ================= DADOS PÚBLICOS & TRANSPARÊNCIA ================= */}
        <SectionWrapper
          id="transparencia"
          eyebrow="Prestação de Contas"
          title="Transparência e Indicadores Educacionais"
          subtitle="Métricas oficiais, cumprimento de metas do Plano Estadual de Educação (PEE/PNE) e dados orçamentários do programa."
        >
          <TransparencySection />
        </SectionWrapper>

        {/* ================= MÓDULO 05: CENTRAL DE NOTÍCIAS COM BUSCA E FILTROS ================= */}
        <NewsSection news={dbData.news} />

        {/* ================= CENTRAL DE ACESSO RÁPIDO: BOTÕES PARA GALERIA, FAQ E REDES SOCIAIS ================= */}
        <SectionWrapper
          id="recursos"
          eyebrow="Central de Mídias & Apoio"
          title="Recursos, Dúvidas e Canais Oficiais"
          subtitle="Acesse o acervo fotográfico oficial, esclareça dúvidas frequentes e conecte-se aos nossos canais de transmissão e redes sociais através dos botões abaixo."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Galeria de Fotos */}
            <div className="glow-card group flex flex-col justify-between rounded-3xl border border-white/80 bg-white/75 p-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-300">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {dbData.gallery.length} Registros
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                  Galeria do MEDTEC
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Acervo fotográfico oficial das salas de aula no interior, estúdios televisivos em Porto Velho e oficinas pedagógicas.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => setActiveResourceModal('galeria')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-deep px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Acessar Galeria de Fotos</span>
                </button>
                <Link
                  href="/galeria"
                  className="text-center text-xs font-semibold text-slate-500 hover:text-primary py-1 transition-colors"
                >
                  Abrir em página dedicada ↗
                </Link>
              </div>
            </div>

            {/* Card 2: Perguntas Frequentes (FAQ) */}
            <div className="glow-card group flex flex-col justify-between rounded-3xl border border-white/80 bg-white/75 p-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-300">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    6 Tópicos
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                  Perguntas Frequentes (FAQ)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Esclarecimentos sobre a Lei Estadual nº 3.846/2016, validade nacional do diploma, papel do mediador e o itinerário NBAZ.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => setActiveResourceModal('faq')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-deep px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Consultar Dúvidas (FAQ)</span>
                </button>
                <Link
                  href="/faq"
                  className="text-center text-xs font-semibold text-slate-500 hover:text-primary py-1 transition-colors"
                >
                  Abrir em página dedicada ↗
                </Link>
              </div>
            </div>

            {/* Card 3: Acompanhamento pelas Redes Sociais */}
            <div className="glow-card group flex flex-col justify-between rounded-3xl border border-white/80 bg-white/75 p-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-300">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Share2 className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-primary">
                    Ao Vivo
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                  Acompanhe nas Redes Sociais
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Aulas ao vivo no YouTube, bastidores no Instagram, comunidade no Facebook e canal direto de suporte escolar no WhatsApp.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => setActiveResourceModal('redes')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-deep px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Tv className="w-4 h-4" />
                  <span>Ver Redes e Transmissões</span>
                </button>
                <Link
                  href="/redes"
                  className="text-center text-xs font-semibold text-slate-500 hover:text-primary py-1 transition-colors"
                >
                  Abrir em página dedicada ↗
                </Link>
              </div>
            </div>

          </div>
        </SectionWrapper>
      </main>

      {/* RODAPÉ DO SISTEMA */}
      <SiteFooter />

      {/* MODAL INTERATIVO PARA GALERIA, FAQ OU REDES SOCIAIS */}
      {activeResourceModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveResourceModal(null)}
        >
          <div 
            className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar do Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                  {activeResourceModal === 'galeria' && <ImageIcon size={18} />}
                  {activeResourceModal === 'faq' && <HelpCircle size={18} />}
                  {activeResourceModal === 'redes' && <Share2 size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {activeResourceModal === 'galeria' && 'Galeria Fotográfica Oficial MEDTEC'}
                    {activeResourceModal === 'faq' && 'Perguntas Frequentes (FAQ Interativo)'}
                    {activeResourceModal === 'redes' && 'Canais de Transmissão e Redes Sociais'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeResourceModal === 'galeria' && 'Registros de salas, aldeias e estúdios da SEDUC'}
                    {activeResourceModal === 'faq' && 'Esclarecimentos sobre o programa e normas oficiais'}
                    {activeResourceModal === 'redes' && 'YouTube, Instagram, Facebook e WhatsApp'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={activeResourceModal === 'galeria' ? '/galeria' : activeResourceModal === 'faq' ? '/faq' : '/redes'}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <span>Página dedicada</span>
                  <ExternalLink size={13} />
                </Link>
                <button
                  onClick={() => setActiveResourceModal(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Fechar modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal com Scroll Interno */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-6 bg-slate-50">
              {activeResourceModal === 'galeria' && (
                <div className="rounded-2xl overflow-hidden shadow-sm">
                  <GallerySection gallery={dbData.gallery} />
                </div>
              )}
              {activeResourceModal === 'faq' && (
                <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-sm">
                  <FaqSection />
                </div>
              )}
              {activeResourceModal === 'redes' && (
                <div className="rounded-2xl overflow-hidden shadow-sm">
                  <SocialSection socials={dbData.socials} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DOSSIÊ DE APRESENTAÇÃO / PITCH */}
      <PresentationPitchModal
        isOpen={pitchModalOpen}
        onClose={() => setPitchModalOpen(false)}
      />
    </div>
  );
}
