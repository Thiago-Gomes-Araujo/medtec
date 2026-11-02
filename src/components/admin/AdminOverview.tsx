'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, ExternalLink, Plus } from 'lucide-react';
import OverviewStats, { type OverviewStatsIndicators } from '@/components/admin/OverviewStats';
import type { ProjetosResumo } from '@/components/admin/useProjetosResumo';
import { adminCardClass, adminLinkClass, adminPrimaryButtonClass, adminSecondaryButtonClass } from '@/components/admin/adminTheme';
import { SECTION_CONFIG, type AdminSection, type buildAdminMenu } from '@/lib/admin-navigation';

export interface PendenciaEstado {
  count: number | null;
  error: string | null;
}

export interface AdminOverviewPendencias {
  /** O mesmo total mostrado no item Aprovações do menu. */
  aprovacoes: PendenciaEstado;
  duvidas: PendenciaEstado;
  relatos: PendenciaEstado;
}

export interface AdminOverviewProps {
  indicators: OverviewStatsIndicators;
  /** A mesma árvore do menu: quem não tem acesso ao item também não vê o cartão. */
  menu: ReturnType<typeof buildAdminMenu>;
  userName?: string;
  /** Ausente quando a sessão não consulta a API, como no acesso local. */
  pendencias?: AdminOverviewPendencias;
  totalEstados?: number | null;
  projetosResumo?: ProjetosResumo;
  bannersTotal?: { count: number | null; error: string | null };
  onCreateNews: () => void;
}

const plural = (value: number, singular: string, varios: string) => `${value} ${value === 1 ? singular : varios}`;

function AttentionRow({ value, title, detail, href, action }: { value: number; title: string; detail: string; href: string; action: string }) {
  return (
    <li className="flex items-center gap-3 border-l-4 border-l-admin-warning-strong px-3 py-2.5">
      <span className="w-9 shrink-0 text-center text-xl font-bold leading-none text-admin-text">{value}</span>
      <p className="min-w-0 flex-1 text-sm text-admin-text">
        <span className="font-semibold">{title}</span>{' '}
        <span className="text-xs text-admin-muted">{detail}</span>
      </p>
      <Link href={href} aria-label={`${action}: ${title}`} className={`${adminSecondaryButtonClass} shrink-0`}>{action}</Link>
    </li>
  );
}

function AttentionSkeleton() {
  return (
    <li aria-hidden="true" className="flex items-center gap-3 border-l-4 border-l-admin-border px-3 py-2.5">
      <span className="h-6 w-9 shrink-0 rounded bg-admin-surface-muted animate-pulse motion-reduce:animate-none" />
      <span className="h-4 flex-1 rounded bg-admin-surface-muted animate-pulse motion-reduce:animate-none" />
      <span className="h-8 w-20 shrink-0 rounded-lg bg-admin-surface-muted animate-pulse motion-reduce:animate-none" />
    </li>
  );
}

export default function AdminOverview({
  indicators, menu, userName, pendencias, totalEstados, projetosResumo, bannersTotal, onCreateNews,
}: AdminOverviewProps) {
  const { loadingNews, errorNews, apiNewsDraftCount, loadingAvisos, errorAvisos, apiAvisosAtivosCount,
    loadingFotos, errorFotos, totalCategorias, loadingFaqs, errorFaqs, apiFaqsPendingCount, usersCountLabel } = indicators;
  const visibleItems = menu.flatMap(folder => folder.items.filter(item => item.visible));
  const canSee = (section: AdminSection) => visibleItems.some(item => item.section === section);
  const aprovacoes = visibleItems.find(item => item.section === 'kanban' || item.section === 'projetosAprovacao');

  const sem = { count: null, error: null };
  const cards = [
    aprovacoes && { key: 'aprovacoes', estado: pendencias?.aprovacoes ?? sem, title: 'Aprovações', detail: 'aguardando aprovação', href: aprovacoes.href, action: 'Revisar' },
    canSee('duvidasPublico') && { key: 'duvidas', estado: pendencias?.duvidas ?? sem, title: 'Dúvidas do público', detail: 'sem resposta', href: SECTION_CONFIG.duvidasPublico.href, action: 'Responder' },
    canSee('professores') && { key: 'relatos', estado: pendencias?.relatos ?? sem, title: 'Relatos', detail: 'aguardando moderação', href: SECTION_CONFIG.professoresRelatos.href, action: 'Moderar' },
  ].filter(card => !!card);
  const pendentes = cards.filter(card => (card.estado.count ?? 0) > 0);
  // Falha e carregamento são estados diferentes: a mensagem só aparece quando a leitura falhou de fato.
  const carregando = cards.filter(card => card.estado.count === null && !card.estado.error);
  const falhou = cards.some(card => card.estado.count === null && !!card.estado.error);

  // Só o que o Resumo não mostra: pendências e detalhes, nunca os mesmos totais.
  const contadores: Partial<Record<AdminSection, string | null>> = {
    noticias: loadingNews || errorNews || apiNewsDraftCount == null ? null : `${apiNewsDraftCount} aguardando`,
    avisos: loadingAvisos || errorAvisos || apiAvisosAtivosCount == null ? null : plural(apiAvisosAtivosCount, 'ativo', 'ativos'),
    galeria: loadingFotos || errorFotos || totalCategorias == null ? null : plural(totalCategorias, 'categoria', 'categorias'),
    projetos: projetosResumo?.pending == null || projetosResumo.error ? null : `${projetosResumo.pending} aguardando`,
    professores: pendencias?.relatos.count == null ? null : plural(pendencias.relatos.count, 'relato aguardando', 'relatos aguardando'),
    duvidas: loadingFaqs || errorFaqs || apiFaqsPendingCount == null ? null : `${apiFaqsPendingCount} aguardando`,
    duvidasPublico: pendencias?.duvidas.count == null ? null : `${pendencias.duvidas.count} sem resposta`,
    kanban: pendencias?.aprovacoes.count == null ? null : plural(pendencias.aprovacoes.count, 'pendente', 'pendentes'),
    projetosAprovacao: pendencias?.aprovacoes.count == null ? null : plural(pendencias.aprovacoes.count, 'pendente', 'pendentes'),
    estadosCidades: totalEstados == null ? null : plural(totalEstados, 'estado', 'estados'),
    usuarios: `${usersCountLabel} usuários`,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-admin-text">{userName ? `Olá, ${userName}` : 'Olá'}</h2>
          <p className="text-xs text-admin-muted">Veja o que precisa de atenção e escolha o que deseja fazer.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canSee('noticias') && (
            <button type="button" onClick={onCreateNews} className={adminPrimaryButtonClass}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Nova notícia</span>
            </button>
          )}
          {canSee('projetos') && (
            <Link href="/admin/projetos?action=new" className={adminSecondaryButtonClass}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Novo projeto</span>
            </Link>
          )}
          <Link href="/" target="_blank" rel="noopener noreferrer" className={adminSecondaryButtonClass}>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Ver o site</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="inicio-atencao" className="flex flex-col gap-3">
          <h3 id="inicio-atencao" className="text-sm font-semibold text-admin-text">Precisa da sua atenção</h3>
          {!pendencias ? (
            <p role="status" className={`${adminCardClass} flex-1 p-4 text-sm text-admin-muted`}>Entre com seu CPF para ver as pendências.</p>
          ) : pendentes.length > 0 || carregando.length > 0 ? (
            <div className={`${adminCardClass} flex-1 overflow-hidden`} aria-busy={carregando.length > 0}>
              <ul className="divide-y divide-admin-border">
                {pendentes.map(card => (
                  <AttentionRow key={card.key} value={card.estado.count as number} title={card.title} detail={card.detail} href={card.href} action={card.action} />
                ))}
                {carregando.map(card => <AttentionSkeleton key={card.key} />)}
              </ul>
              {carregando.length > 0 && <p role="status" className="sr-only">Carregando as pendências.</p>}
              {falhou && <p role="alert" className="border-t border-admin-border px-4 py-2 text-xs text-admin-danger">Não foi possível confirmar todas as pendências agora.</p>}
            </div>
          ) : falhou ? (
            <p role="alert" className={`${adminCardClass} flex-1 p-4 text-sm text-admin-danger`}>Não foi possível confirmar as pendências agora.</p>
          ) : (
            <p role="status" className={`${adminCardClass} flex flex-1 items-center gap-2 p-4 text-sm font-semibold text-admin-success`}>
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Tudo em dia</span>
            </p>
          )}
        </section>

        <section aria-labelledby="inicio-resumo" className="flex flex-col gap-3">
          <h3 id="inicio-resumo" className="text-sm font-semibold text-admin-text">Resumo do site</h3>
          <div className="flex-1">
            <OverviewStats indicators={indicators} projetosResumo={projetosResumo} bannersTotal={bannersTotal} />
          </div>
        </section>
      </div>

      <section aria-labelledby="inicio-gerenciar" className="space-y-5">
        <h3 id="inicio-gerenciar" className="text-sm font-semibold text-admin-text">Gerenciar</h3>
        {menu.filter(folder => folder.visible).map(folder => (
          <div key={folder.id} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-admin-muted">{folder.label}</h4>
            <div className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {folder.items.filter(item => item.visible).map(item => {
                const Icon = item.icon;
                const contador = contadores[item.section];
                return (
                  <div key={item.section} className={`${adminCardClass} flex min-h-52 flex-col p-5`}>
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-admin-accent-soft text-admin-accent">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h5 className="mt-3 text-base font-semibold text-admin-text">{item.label}</h5>
                    <p className="mt-1 line-clamp-2 text-sm leading-snug text-admin-muted">{item.summary}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-admin-border pt-3">
                      <span className="min-w-0 text-xs text-admin-muted">{contador}</span>
                      <Link href={item.href} aria-label={`Abrir ${item.label}`} className={`${adminLinkClass} shrink-0`}>
                        <span>Abrir</span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
