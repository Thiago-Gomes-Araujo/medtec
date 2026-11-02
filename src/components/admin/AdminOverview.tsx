'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, ExternalLink, Plus } from 'lucide-react';
import OverviewStats, { type OverviewStatsIndicators } from '@/components/admin/OverviewStats';
import type { ProjetosResumo } from '@/components/admin/useProjetosResumo';
import { adminCardClass, adminLinkClass, adminPrimaryButtonClass, adminSecondaryButtonClass } from '@/components/admin/adminTheme';
import { SECTION_CONFIG, type AdminSection, type buildAdminMenu } from '@/lib/admin-navigation';

export interface AdminOverviewPendencias {
  /** O mesmo total mostrado no item Aprovações do menu. */
  aprovacoes: number | null;
  duvidas: number | null;
  relatos: number | null;
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

function AttentionCard({ value, title, detail, href, action }: { value: number; title: string; detail: string; href: string; action: string }) {
  return (
    <div className={`${adminCardClass} flex items-center justify-between gap-4 border-l-4 border-l-admin-warning-strong p-4`}>
      <div className="min-w-0">
        <p className="text-3xl font-bold leading-none text-admin-text">{value}</p>
        <h4 className="mt-2 text-sm font-semibold text-admin-text">{title}</h4>
        <p className="text-xs text-admin-muted">{detail}</p>
      </div>
      <Link href={href} aria-label={`${action}: ${title}`} className={`${adminSecondaryButtonClass} shrink-0`}>{action}</Link>
    </div>
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

  const cards = [
    aprovacoes && { key: 'aprovacoes', value: pendencias?.aprovacoes ?? null, title: 'Aprovações', detail: 'aguardando aprovação', href: aprovacoes.href, action: 'Revisar' },
    canSee('duvidasPublico') && { key: 'duvidas', value: pendencias?.duvidas ?? null, title: 'Dúvidas do público', detail: 'sem resposta', href: SECTION_CONFIG.duvidasPublico.href, action: 'Responder' },
    canSee('professores') && { key: 'relatos', value: pendencias?.relatos ?? null, title: 'Relatos', detail: 'aguardando moderação', href: SECTION_CONFIG.professoresRelatos.href, action: 'Moderar' },
  ].filter(card => !!card);
  const pendentes = cards.filter(card => card.value !== null && card.value > 0);
  // "Tudo em dia" só com todos os totais confirmados: carregando ou com falha, nada é afirmado.
  const tudoEmDia = !!pendencias && cards.every(card => card.value === 0);

  // Só o que o Resumo não mostra: pendências e detalhes, nunca os mesmos totais.
  const contadores: Partial<Record<AdminSection, string | null>> = {
    noticias: loadingNews || errorNews || apiNewsDraftCount == null ? null : `${apiNewsDraftCount} aguardando`,
    avisos: loadingAvisos || errorAvisos || apiAvisosAtivosCount == null ? null : plural(apiAvisosAtivosCount, 'ativo', 'ativos'),
    galeria: loadingFotos || errorFotos || totalCategorias == null ? null : plural(totalCategorias, 'categoria', 'categorias'),
    projetos: projetosResumo?.pending == null || projetosResumo.error ? null : `${projetosResumo.pending} aguardando`,
    professores: pendencias?.relatos == null ? null : plural(pendencias.relatos, 'relato aguardando', 'relatos aguardando'),
    duvidas: loadingFaqs || errorFaqs || apiFaqsPendingCount == null ? null : `${apiFaqsPendingCount} aguardando`,
    duvidasPublico: pendencias?.duvidas == null ? null : `${pendencias.duvidas} sem resposta`,
    kanban: pendencias?.aprovacoes == null ? null : plural(pendencias.aprovacoes, 'pendente', 'pendentes'),
    projetosAprovacao: pendencias?.aprovacoes == null ? null : plural(pendencias.aprovacoes, 'pendente', 'pendentes'),
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

      <section aria-labelledby="inicio-atencao" className="space-y-3">
        <h3 id="inicio-atencao" className="text-sm font-semibold text-admin-text">Precisa da sua atenção</h3>
        {pendentes.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendentes.map(card => (
              <AttentionCard key={card.key} value={card.value as number} title={card.title} detail={card.detail} href={card.href} action={card.action} />
            ))}
          </div>
        )}
        {pendentes.length === 0 && tudoEmDia && (
          <p role="status" className={`${adminCardClass} flex items-center gap-2 p-4 text-sm font-semibold text-admin-success`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Tudo em dia</span>
          </p>
        )}
        {pendentes.length === 0 && !tudoEmDia && (
          <p role="status" className={`${adminCardClass} p-4 text-sm text-admin-muted`}>
            {pendencias ? 'Não foi possível confirmar as pendências agora.' : 'Entre com seu CPF para ver as pendências.'}
          </p>
        )}
      </section>

      <section aria-labelledby="inicio-resumo" className="space-y-3">
        <h3 id="inicio-resumo" className="text-sm font-semibold text-admin-text">Resumo do site</h3>
        <OverviewStats indicators={indicators} projetosResumo={projetosResumo} bannersTotal={bannersTotal} />
      </section>

      <section aria-labelledby="inicio-gerenciar" className="space-y-5">
        <h3 id="inicio-gerenciar" className="text-sm font-semibold text-admin-text">Gerenciar</h3>
        {menu.filter(folder => folder.visible).map(folder => (
          <div key={folder.id} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-admin-muted">{folder.label}</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {folder.items.filter(item => item.visible).map(item => {
                const Icon = item.icon;
                const contador = contadores[item.section];
                return (
                  <div key={item.section} className={`${adminCardClass} flex flex-col justify-between gap-3 p-4`}>
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-admin-accent-soft text-admin-accent">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                          <h5 className="text-sm font-semibold text-admin-text">{item.label}</h5>
                          {contador && <span className="text-[11px] text-admin-muted">{contador}</span>}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-admin-muted">{item.summary}</p>
                      </div>
                    </div>
                    <Link href={item.href} aria-label={`Abrir ${item.label}`} className={`${adminLinkClass} self-end`}>
                      <span>Abrir</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
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
