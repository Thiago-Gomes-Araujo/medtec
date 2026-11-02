'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Plus, ExternalLink, Newspaper, Lightbulb, Megaphone, Presentation, Images,
  ClipboardCheck, Settings, BarChart3, Share2, UserCog, HelpCircle, ChevronRight, ArrowRight, type LucideIcon } from 'lucide-react';
import OverviewStats, { type OverviewStatsIndicators } from '@/components/admin/OverviewStats';
import type { ProjetosResumo } from '@/components/admin/useProjetosResumo';
import { adminBadgeClass, adminCardClass, adminFocusClass, adminPrimaryButtonClass, adminSecondaryButtonClass } from '@/components/admin/adminTheme';
import type { NNoticia } from '@/lib/api';

export interface AdminOverviewProps {
  indicators: OverviewStatsIndicators;
  userName?: string;
  latestNews?: Pick<NNoticia, 'titulo' | 'data_publicacao' | 'autor_nome'>;
  announcementTitle?: string;
  canAccessKanban: boolean;
  duvidasPendentes?: { count: number | null; error: string | null };
  projetosResumo?: ProjetosResumo;
  bannersTotal?: { count: number | null; error: string | null };
  onOpenNews: () => void;
  onCreateNews: () => void;
  onOpenKanban: () => void;
}

const FALHA = 'Não foi possível carregar agora';

function ModuleCard({ title, icon: Icon, badge, description, children, actions }: {
  title: string; icon: LucideIcon; badge?: ReactNode; description: string; children?: ReactNode; actions: ReactNode;
}) {
  return (
    <div className={`${adminCardClass} p-5 flex flex-col justify-between space-y-4`}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon className="h-4 w-4 shrink-0 text-admin-muted" aria-hidden="true" />
            <h4 className="font-semibold text-sm text-admin-text">{title}</h4>
          </div>
          {badge !== undefined && <span className={adminBadgeClass}>{badge}</span>}
        </div>
        <p className="text-xs text-admin-muted leading-relaxed">{description}</p>
        {children}
      </div>
      {actions}
    </div>
  );
}

function ModuleNote({ label, children, detail }: { label: string; children: ReactNode; detail?: ReactNode }) {
  return (
    <div className="p-3 rounded-lg bg-admin-surface-muted space-y-1">
      <span className="text-[11px] font-semibold text-admin-muted block">{label}</span>
      <p className="text-xs font-semibold text-admin-text line-clamp-2">{children}</p>
      {detail && <p className="text-[11px] text-admin-muted pt-0.5">{detail}</p>}
    </div>
  );
}

function OpenLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={`${adminSecondaryButtonClass} w-full`}>
      <span>{children}</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function ShortcutLink({ href, icon: Icon, children }: { href: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <Link href={href} className={`w-full px-3 py-1.5 rounded-lg bg-admin-surface-muted text-xs font-semibold text-admin-text flex items-center justify-between transition hover:underline cursor-pointer ${adminFocusClass}`}>
      <span className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
        <span>{children}</span>
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
    </Link>
  );
}

export default function AdminOverview({
  indicators, userName, latestNews, announcementTitle,
  canAccessKanban, duvidasPendentes, projetosResumo, bannersTotal, onOpenNews, onCreateNews, onOpenKanban,
}: AdminOverviewProps) {
  const {
    loadingNews, errorNews, totalNews, apiNewsDraftCount,
    loadingAvisos, errorAvisos, totalAvisos, apiAvisosAtivosCount,
    loadingFotos, errorFotos, totalFotos,
    loadingFaqs, errorFaqs, totalFaqs, apiFaqsPendingCount, apiFaqsPublishedCount,
    usersCountLabel,
  } = indicators;
  const projetosSemDados = !projetosResumo || !!projetosResumo.error;
  const bannersLabel = !bannersTotal || bannersTotal.error ? 'Indisponível'
    : bannersTotal.count === null ? 'Carregando...' : `${bannersTotal.count} banner${bannersTotal.count === 1 ? '' : 's'}`;

  return (
    <div className="space-y-6">
      <div className={`${adminCardClass} p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-admin-text">
            Olá, {userName}
          </h2>
          <p className="text-xs text-admin-muted">
            Veja o resumo do site e escolha o que deseja fazer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button type="button" onClick={onCreateNews} className={adminPrimaryButtonClass}>
            <Plus className="h-3.5 w-3.5" />
            <span>Nova notícia</span>
          </button>
          <Link href="/admin/projetos?action=new" className={adminPrimaryButtonClass}>
            <Plus className="h-3.5 w-3.5" />
            <span>Novo projeto</span>
          </Link>
          <Link href="/" target="_blank" rel="noopener noreferrer" className={adminSecondaryButtonClass}>
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Ver o site</span>
          </Link>
        </div>
      </div>

      <OverviewStats indicators={indicators} projetosResumo={projetosResumo} onOpenNews={onOpenNews} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-admin-border pb-2">
          <h3 className="text-sm font-semibold text-admin-text">O que você deseja gerenciar agora?</h3>
          <span className="text-xs text-admin-muted">Escolha uma área para abrir</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ModuleCard title="Notícias" icon={Newspaper}
            badge={loadingNews ? 'Carregando...' : errorNews ? 'Indisponível' : `${totalNews} notícias`}
            description="Depois de aprovadas, as notícias aparecem na página “Notícias” do site."
            actions={
              <button type="button" onClick={onOpenNews} className={`${adminSecondaryButtonClass} w-full`}>
                <span>Abrir Notícias</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }>
            <ModuleNote label="Última publicação:"
              detail={!loadingNews && !errorNews && latestNews ? [latestNews.data_publicacao, latestNews.autor_nome].filter(Boolean).join(' • ') : undefined}>
              {loadingNews ? 'Carregando...' : errorNews ? FALHA : (latestNews?.titulo || 'Nenhuma notícia publicada ainda')}
            </ModuleNote>
          </ModuleCard>

          <ModuleCard title="Projetos" icon={Lightbulb}
            badge={projetosSemDados ? 'Indisponível' : projetosResumo?.total === null ? 'Carregando...' : `${projetosResumo?.total} projeto${projetosResumo?.total === 1 ? '' : 's'}`}
            description="Cadastre projetos com tema, relato, capa, anexos e membros, e acompanhe a aprovação."
            actions={
              <div className="flex items-center gap-2">
                <div className="flex-1"><OpenLink href="/admin/projetos">Abrir Projetos</OpenLink></div>
                <Link href="/admin/projetos?action=new" title="Cadastrar novo projeto" className={adminPrimaryButtonClass}>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Novo</span>
                </Link>
              </div>
            }>
            <ModuleNote label="Situação dos projetos:">
              {projetosSemDados ? 'Indisponível nesta sessão' : projetosResumo?.total === null ? 'Carregando...'
                : `${projetosResumo?.published} publicado${projetosResumo?.published === 1 ? '' : 's'} · ${projetosResumo?.pending} aguardando`}
            </ModuleNote>
          </ModuleCard>

          <ModuleCard title="Avisos" icon={Megaphone}
            badge={loadingAvisos ? 'Carregando...' : errorAvisos ? 'Indisponível' : `${totalAvisos} avisos`}
            description="Publique comunicados oficiais. Os avisos ativos aparecem em destaque na página inicial do site."
            actions={<OpenLink href="/admin/avisos">Abrir Avisos</OpenLink>}>
            <ModuleNote label="Último comunicado urgente:"
              detail={loadingAvisos ? 'Carregando...' : errorAvisos ? 'Indisponível' : `${apiAvisosAtivosCount} avisos no site`}>
              {loadingAvisos ? 'Carregando...' : errorAvisos ? FALHA : (announcementTitle || 'Sem comunicados urgentes no momento')}
            </ModuleNote>
          </ModuleCard>

          <ModuleCard title="Banners" icon={Presentation} badge={bannersLabel}
            description="Cadastre, troque e exclua as imagens que aparecem no fundo do topo da página inicial do site."
            actions={<OpenLink href="/admin/banners">Abrir Banners</OpenLink>}>
            <ModuleNote label="No site agora:">{bannersLabel}</ModuleNote>
          </ModuleCard>

          <ModuleCard title="Galeria de fotos" icon={Images}
            badge={loadingFotos ? 'Carregando...' : errorFotos ? 'Indisponível' : `${totalFotos} fotos`}
            description="As fotos enviadas aqui aparecem na página “Galeria” do site, com as salas de aula, os estúdios e as feiras escolares."
            actions={<OpenLink href="/admin/galeria">Abrir Galeria de fotos</OpenLink>}>
            <ModuleNote label="Fotos cadastradas:">
              {loadingFotos ? 'Carregando...' : errorFotos ? FALHA : `${totalFotos} fotos no site`}
            </ModuleNote>
          </ModuleCard>

          <ModuleCard title="Aprovações" icon={ClipboardCheck}
            badge={loadingNews ? 'Carregando...' : errorNews ? 'Indisponível' : `${apiNewsDraftCount} notícia${apiNewsDraftCount === 1 ? '' : 's'}`}
            description="Veja as notícias e os demais conteúdos enviados que estão aguardando aprovação, e publique ou recuse cada um."
            actions={
              <button type="button" disabled={!canAccessKanban} onClick={onOpenKanban} className={`${adminSecondaryButtonClass} w-full`}>
                <span>Abrir Aprovações</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }>
            <ModuleNote label="Notícias aguardando:">
              {loadingNews ? 'Carregando...' : errorNews ? FALHA : `${apiNewsDraftCount} notícia${apiNewsDraftCount === 1 ? '' : 's'} aguardando aprovação`}
            </ModuleNote>
          </ModuleCard>

          <ModuleCard title="Configurações" icon={Settings} badge={`${usersCountLabel} usuários`}
            description="Atualize os números do site, os links das redes sociais e as pessoas com acesso ao painel."
            actions={<OpenLink href="/admin/institucional">Abrir Configurações</OpenLink>}>
            <div className="space-y-1.5 pt-1">
              <ShortcutLink href="/admin/institucional" icon={BarChart3}>Números do site</ShortcutLink>
              <ShortcutLink href="/admin/redes" icon={Share2}>Redes sociais</ShortcutLink>
              <ShortcutLink href="/admin/usuarios" icon={UserCog}>Usuários e acessos ({usersCountLabel})</ShortcutLink>
            </div>
          </ModuleCard>

          <ModuleCard title="Perguntas frequentes" icon={HelpCircle}
            badge={loadingFaqs ? 'Carregando...' : errorFaqs ? 'Indisponível' : `${totalFaqs} dúvida${totalFaqs === 1 ? '' : 's'}`}
            description="Cadastre e edite as perguntas e respostas da Central de Dúvidas do site."
            actions={<OpenLink href="/admin/faq">Abrir Perguntas frequentes</OpenLink>}>
            <ModuleNote label="Situação das perguntas:"
              detail={loadingFaqs ? 'Carregando...' : errorFaqs ? 'Indisponível' : undefined}>
              {loadingFaqs ? 'Carregando...' : errorFaqs ? `${FALHA} (${errorFaqs})` : totalFaqs === 0 ? 'Nenhuma dúvida cadastrada até o momento'
                : `${apiFaqsPublishedCount} publicada${apiFaqsPublishedCount === 1 ? '' : 's'} · ${apiFaqsPendingCount} aguardando aprovação`}
            </ModuleNote>
            {duvidasPendentes && (
              <p className="text-xs font-semibold text-admin-text">
                <Link href="/admin/faq/publico" className="underline">Dúvidas do público</Link> sem resposta:{' '}
                {duvidasPendentes.error ? 'indisponível' : duvidasPendentes.count ?? 'carregando...'}
              </p>
            )}
          </ModuleCard>
        </div>
      </div>
    </div>
  );
}
