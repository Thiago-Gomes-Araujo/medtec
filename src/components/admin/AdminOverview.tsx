'use client';

import Link from 'next/link';
import { Plus, ExternalLink, Newspaper, Lightbulb, Megaphone, Presentation, Images,
  CheckCircle2, SlidersHorizontal, BarChart3, Share2, UserCog, HelpCircle, ChevronRight, ArrowRight } from 'lucide-react';
import OverviewStats, { type OverviewStatsIndicators } from '@/components/admin/OverviewStats';
import type { NNoticia } from '@/lib/api';

export interface AdminOverviewProps {
  indicators: OverviewStatsIndicators;
  userName?: string;
  latestNews?: Pick<NNoticia, 'titulo' | 'data_publicacao' | 'autor_nome'>;
  announcementTitle?: string;
  canAccessKanban: boolean;
  onOpenNews: () => void;
  onCreateNews: () => void;
  onOpenKanban: () => void;
}

export default function AdminOverview({
  indicators, userName, latestNews, announcementTitle,
  canAccessKanban, onOpenNews, onCreateNews, onOpenKanban,
}: AdminOverviewProps) {
  const {
    loadingNews, errorNews, totalNews, apiNewsDraftCount,
    loadingAvisos, errorAvisos, totalAvisos, apiAvisosAtivosCount,
    loadingFotos, errorFotos, totalFotos,
    loadingFaqs, errorFaqs, totalFaqs, apiFaqsPendingCount, apiFaqsPublishedCount,
    usersCountLabel,
  } = indicators;

  return (
    <div className="space-y-6">

      {/* 1. Cabeçalho Compacto de Boas-Vindas */}
      <div className="rounded-2xl bg-gradient-to-r from-[#071731] via-[#0B254E] to-[#0A3066] text-white p-5 sm:p-6 border border-slate-700/60 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Central administrativa MEDTEC</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            Painel do Gestor • Central Executiva CMS
          </h2>
          <p className="text-xs text-slate-300">
            SEDUC-RO • Olá, <strong className="text-white">{userName}</strong>. Selecione um módulo abaixo para gerenciar publicações, triagem e governança.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/admin/projetos?action=new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Novo Projeto</span>
          </Link>

          <button
            type="button"
            onClick={onCreateNews}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Nova Notícia</span>
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition"
          >
            <ExternalLink className="h-3.5 w-3.5 text-sky-300" />
            <span>Ver Portal Público</span>
          </Link>
        </div>
      </div>

      <OverviewStats indicators={indicators} onOpenNews={onOpenNews} />

      {/* 3. Grade Principal de Módulos do Sistema (6 Launcher Cards com linguagem 100% didática) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            O que você deseja gerenciar agora?
          </h3>
          <span className="text-xs text-slate-400">
            Clique em um módulo para abrir seu espaço de trabalho
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Módulo 01: Notícias e Matérias */}
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                    <Newspaper className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Notícias e Matérias
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                  {loadingNews ? 'Carregando...' : errorNews ? 'Indisponível' : `${totalNews} matérias`}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tudo o que você publicar aqui aparecerá imediatamente na página &ldquo;Notícias&rdquo; e na grade principal do site oficial.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Última publicação no ar:
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                  {loadingNews ? 'Carregando...' : errorNews ? 'Falha de comunicação com a API' : (latestNews?.titulo || 'Nenhuma notícia publicada ainda')}
                </p>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  {!loadingNews && !errorNews && latestNews
                    ? [latestNews.data_publicacao, latestNews.autor_nome].filter(Boolean).join(' • ') : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenNews}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Abrir Notícias e Matérias</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Módulo: Projetos Pedagógicos e Práticas Escolares */}
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-500/40 transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Projetos Pedagógicos
                  </h4>
                </div>
                <span className="max-w-36 shrink-0 text-right text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200/80 dark:border-amber-800/80">
                  Indisponível — sem integração oficial
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Cadastre e edite práticas escolares de campo, trilhas temáticas curriculares, docentes mediadores e guias de replicação pedagógica.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Prática em destaque:
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                  Indisponível — sem integração oficial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/admin/projetos"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Abrir Projetos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/admin/projetos?action=new"
                className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Cadastrar Novo Projeto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Novo</span>
              </Link>
            </div>
          </div>

          {/* Módulo 02: Avisos e Comunicados */}
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Avisos e Comunicados
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                  {loadingAvisos ? 'Carregando...' : errorAvisos ? 'Indisponível' : `${totalAvisos} avisos`}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Use esta área para postar comunicados oficiais. Todos os avisos ativos aparecem com destaque na Página Inicial do portal.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Último comunicado urgente ativo:
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                  {loadingAvisos ? 'Carregando...' : errorAvisos ? 'Falha de comunicação com a API' : (announcementTitle || 'Sem comunicados urgentes no momento')}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                  {loadingAvisos ? 'Carregando...' : errorAvisos ? 'Indisponível' : `${apiAvisosAtivosCount} avisos em exibição no portal`}
                </p>
              </div>
            </div>

            <Link
              href="/admin/avisos"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Abrir Avisos e Comunicados</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Módulo 03: Banners da Página Inicial */}
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                    <Presentation className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Banners da Página Inicial
                  </h4>
                </div>
                <span className="max-w-36 shrink-0 text-right text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                  Indisponível — sem integração oficial
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Troque as imagens grandes que passam no carrossel de entrada da Página Inicial do portal, fotos de estúdio e transmissão ao vivo.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Carrossel & Transmissão:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                  Indisponível — sem integração oficial
                </p>
              </div>
            </div>

            <Link
              href="/admin/banners"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Trocar Banners da Home</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Módulo 04: Galeria de Fotos */}
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                    <Images className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Galeria de Fotos
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                  {loadingFotos ? 'Carregando...' : errorFotos ? 'Indisponível' : `${totalFotos} fotos`}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Todas as fotos enviadas aqui aparecem na aba pública &ldquo;Galeria&rdquo;, destacando as salas de aula, estúdios e feiras escolares nos municípios.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Acervo Pedagógico de Rondônia:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                  {loadingFotos ? 'Carregando...' : errorFotos ? 'Falha de comunicação com a API' : `${totalFotos} fotos catalogadas no acervo oficial da API Rails v1.`}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                  Fotos públicas visíveis no portal
                </p>
              </div>
            </div>

            <Link
              href="/admin/galeria"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Abrir Galeria de Fotos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Módulo 05: Fila de Aprovação (Passo a Passo) */}
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Fila de Aprovação (Passo a Passo)
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                  {loadingNews ? '...' : errorNews ? 'Indisponível' : `${apiNewsDraftCount} pendentes`}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Acompanhe o fluxo de reportagens: triagem em rascunho, validação jurídica/LGPD e aprovação final para publicação oficial no site.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Triagem & Governança Editorial:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                  {loadingNews ? 'Carregando...' : errorNews ? 'Falha de comunicação com a API' : `${apiNewsDraftCount} matéria${apiNewsDraftCount === 1 ? '' : 's'} no fluxo de triagem e governança editorial.`}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                  Fluxo: Rascunho ➔ Revisão ➔ Publicado
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!canAccessKanban}
              onClick={onOpenKanban}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Abrir Fila de Aprovação</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Módulo 06: Dados, Contatos e Equipe */}
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Dados, Contatos e Equipe
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                  {usersCountLabel} operadores
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Atualize a quantidade oficial de alunos e escolas no rodapé, links de redes sociais/WhatsApp e cadastre operadores por CPF.
              </p>

              <div className="space-y-1.5 pt-1">
                <Link
                  href="/admin/institucional"
                  className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071324] hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200/60 dark:hover:border-blue-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                    <span>Números de Alunos e Escolas</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition" />
                </Link>
                <Link
                  href="/admin/redes"
                  className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071324] hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200/60 dark:hover:border-blue-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                    <span>Redes Sociais e WhatsApp</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition" />
                </Link>
                <Link
                  href="/admin/usuarios"
                  className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071324] hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200/60 dark:hover:border-blue-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <UserCog className="h-3.5 w-3.5 text-[#004A99] dark:text-sky-400" />
                    <span>Gerenciar Equipe e Senhas ({usersCountLabel})</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#004A99] dark:group-hover:text-sky-400 transition" />
                </Link>
              </div>
            </div>

            <Link
              href="/admin/institucional"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Gerenciar Dados e Configurações</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Módulo: Central de Dúvidas Frequentes (FAQ) */}
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#004A99]/40 transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-[#004A99] dark:text-sky-400 border border-sky-100/60 dark:border-sky-900/40 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Dúvidas Frequentes (FAQ)
                  </h4>
                </div>
                <span className="max-w-36 shrink-0 text-right text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80">
                  {loadingFaqs ? 'Carregando...' : errorFaqs ? 'Indisponível' : `${totalFaqs} dúvida${totalFaqs === 1 ? '' : 's'}`}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Cadastre e edite perguntas e respostas oficiais da SEDUC sobre aulas ao vivo, sinal satelital, professores mediadores e certificação.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Central de Respostas Oficiais:
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                  {loadingFaqs
                    ? 'Carregando...'
                    : errorFaqs
                    ? `Falha de comunicação com a API (${errorFaqs})`
                    : totalFaqs === 0
                    ? 'Nenhuma dúvida cadastrada até o momento'
                    : `${apiFaqsPublishedCount} publicada${apiFaqsPublishedCount === 1 ? '' : 's'} · ${apiFaqsPendingCount} aguardando aprovação`}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                  {loadingFaqs
                    ? 'Carregando...'
                    : errorFaqs
                    ? 'Indisponível'
                    : `${totalFaqs} registro${totalFaqs === 1 ? '' : 's'} no catálogo oficial`}
                </p>
              </div>
            </div>

            <Link
              href="/admin/faq"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Abrir Central de Dúvidas</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
