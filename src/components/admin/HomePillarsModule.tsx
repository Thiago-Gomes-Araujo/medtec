'use client';

import React, { useState } from 'react';
import {
  Satellite,
  Users,
  HeartHandshake,
  Leaf,
  Tv,
  GraduationCap,
  Radio,
  CheckCircle2,
  ShieldCheck,
  ArrowLeftRight,
  Lock,
  RotateCcw,
  Eye,
  Monitor,
  Smartphone,
  Maximize2,
  X,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Info,
  Sparkles,
  Check,
} from 'lucide-react';
import { useDialogFocus } from '@/components/useDialogFocus';
import {
  createInitialHomePillarsDraft,
  getInitialHomePillarByKey,
  hasHomePillarItemChanges,
  hasHomePillarsChanges,
  HOME_PILLARS_LIMITS,
  moveHomePillarItem,
  PILLAR_ICON_OPTIONS,
  PILLAR_VARIANT_OPTIONS,
  validateHomePillarsDraft,
  type HomePillarItem,
  type HomePillarsSectionDraft,
  type PillarIconName,
  type PillarVariant,
} from '@/lib/admin-home-pillars';

export interface HomePillarsModuleProps {
  initialDraft?: HomePillarsSectionDraft;
  active?: boolean;
}

function renderPillarIcon(icon: PillarIconName, className = 'w-5 h-5') {
  switch (icon) {
    case 'satellite':
      return <Satellite className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'heart-handshake':
      return <HeartHandshake className={className} />;
    case 'leaf':
      return <Leaf className={className} />;
    case 'tv':
      return <Tv className={className} />;
    case 'graduation-cap':
      return <GraduationCap className={className} />;
    default:
      return <Satellite className={className} />;
  }
}

function getVariantClasses(variante: PillarVariant) {
  switch (variante) {
    case 'tecnologia':
      return {
        iconBox:
          'bg-sky-100 dark:bg-cyan-500/10 border-sky-300 dark:border-cyan-500/20 text-[#004A99] dark:text-cyan-400',
        badge:
          'bg-sky-50 dark:bg-sky-950/80 text-[#004A99] dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
        footerPrimary: 'text-emerald-600 dark:text-emerald-400 font-semibold',
        footerSecondary: 'text-[#004A99] dark:text-cyan-300 font-medium',
      };
    case 'inclusao':
      return {
        iconBox:
          'bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/20 text-rose-600 dark:text-rose-400',
        badge:
          'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
        footerPrimary: 'text-slate-500 dark:text-slate-400',
        footerSecondary: 'text-rose-600 dark:text-rose-400 font-semibold',
      };
    case 'sustentabilidade':
      return {
        iconBox:
          'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        badge:
          'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
        footerPrimary: 'text-emerald-600 dark:text-emerald-400 font-semibold',
        footerSecondary: 'text-slate-500 dark:text-slate-400',
      };
    case 'padrao':
    default:
      return {
        iconBox:
          'bg-sky-100 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/20 text-[#004A99] dark:text-sky-400',
        badge:
          'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
        footerPrimary: 'text-[#004A99] dark:text-sky-300 font-semibold',
        footerSecondary: 'text-slate-500 dark:text-slate-400',
      };
  }
}

function renderSectionHeadingTitle(titulo: string) {
  const highlightSuffix = 'inovador no Brasil?';
  const trimmed = titulo.trim() || 'Por que o MEDTEC é um modelo inovador no Brasil?';
  if (trimmed.endsWith(highlightSuffix)) {
    const prefix = trimmed.slice(0, trimmed.length - highlightSuffix.length);
    return (
      <>
        {prefix}
        <span className="text-[#004A99] dark:text-[#00D8FF]">{highlightSuffix}</span>
      </>
    );
  }
  return trimmed;
}

function renderComplementoContent(complemento: string, variante: PillarVariant) {
  const trimmed = complemento.trim();
  if (!trimmed) return null;
  if (trimmed.includes('↔')) {
    const [left, right] = trimmed.split('↔').map((part) => part.trim());
    return (
      <span className="inline-flex items-center gap-1">
        <span>{left}</span>
        <ArrowLeftRight
          className={`w-3 h-3 ${
            variante === 'tecnologia'
              ? 'text-sky-600 dark:text-cyan-300'
              : 'text-current'
          }`}
        />
        <span>{right}</span>
      </span>
    );
  }
  return <span>{trimmed}</span>;
}

export interface HomePillarsPreviewRendererProps {
  draft: HomePillarsSectionDraft;
  device: 'desktop' | 'mobile';
  selectedKey?: string;
  onSelectCard?: (chave: string) => void;
}

export function HomePillarsPreviewRenderer({
  draft,
  device,
  selectedKey,
  onSelectCard,
}: HomePillarsPreviewRendererProps) {
  const visibleItems = draft.itens.filter((item) => item.visivel);

  return (
    <div
      aria-label="Pré-visualização da seção Quatro Pilares da Home"
      className="rounded-2xl bg-[#F0F4F8] dark:bg-[#040B16] p-4 sm:p-6 transition-colors duration-200 space-y-8 border border-slate-200/80 dark:border-slate-800/80"
    >
      {/* 1. Cabeçalho Fiel ao TechAdvantages.tsx */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5">
        <p className="text-xs sm:text-sm font-semibold text-[#004A99] dark:text-sky-400">
          {draft.sobretitulo.trim() || 'Pilares da Mediação Tecnológica • Lei Estadual nº 3.846/2016'}
        </p>

        <h3
          className={`${
            device === 'mobile' ? 'text-xl' : 'text-2xl sm:text-3xl'
          } font-bold text-slate-900 dark:text-white tracking-tight leading-tight font-display text-balance`}
        >
          {renderSectionHeadingTitle(draft.titulo)}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto text-pretty">
          {draft.descricao.trim() ||
            'Unindo tecnologia satelital de ponta à presença de professores mediadores para garantir o direito à educação pública de qualidade.'}
        </p>
      </div>

      {/* 2. Bento Grid Fiel ao TechAdvantages.tsx */}
      {visibleItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Todos os pilares estão ocultos na pré-visualização. Marque ao menos um card como visível para exibir a grade.
        </div>
      ) : (
        <div
          className={
            device === 'mobile'
              ? 'grid grid-cols-1 gap-4'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4'
          }
        >
          {visibleItems.map((item) => {
            const styles = getVariantClasses(item.variante);
            const isSelected = selectedKey === item.chave;
            const spanClass =
              device === 'mobile'
                ? 'col-span-1'
                : item.colSpan === 8
                ? 'lg:col-span-8'
                : 'lg:col-span-4';

            return (
              <div
                key={item.chave}
                onClick={onSelectCard ? () => onSelectCard(item.chave) : undefined}
                className={`${spanClass} group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-white dark:bg-[#0C1E38] p-4 sm:p-5 transition-all duration-150 shadow-sm ${
                  isSelected
                    ? 'border-[#004A99] dark:border-[#00D8FF] ring-2 ring-[#004A99]/20 dark:ring-[#00D8FF]/25'
                    : 'border-slate-200/90 dark:border-[#1A365D]'
                } ${onSelectCard ? 'cursor-pointer' : ''}`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-3.5">
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${styles.iconBox}`}
                    >
                      {renderPillarIcon(item.icone, 'w-5 h-5')}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${styles.badge}`}
                    >
                      {item.variante === 'tecnologia' && (
                        <Radio className="w-3.5 h-3.5 text-[#004A99] dark:text-sky-400" />
                      )}
                      <span>{item.selo.trim() || 'Selo do pilar'}</span>
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[#004A99] dark:group-hover:text-cyan-300 transition-colors duration-150">
                    {item.titulo.trim() || 'Título do pilar'}
                  </h4>

                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {item.descricao.trim() || 'Descrição do pilar.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className={`inline-flex items-center gap-1.5 ${styles.footerPrimary}`}>
                    {item.variante === 'tecnologia' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                    {item.variante === 'padrao' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                    {item.variante === 'sustentabilidade' && (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    )}
                    <span>{item.nota.trim() || 'Nota de rodapé'}</span>
                  </span>

                  {item.complemento.trim() && (
                    <span className={styles.footerSecondary}>
                      {renderComplementoContent(item.complemento, item.variante)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HomePillarsModule({ initialDraft }: HomePillarsModuleProps) {
  const [draft, setDraft] = useState<HomePillarsSectionDraft>(() =>
    initialDraft ? { ...initialDraft, itens: initialDraft.itens.map((i) => ({ ...i })) } : createInitialHomePillarsDraft(),
  );
  const [selectedKey, setSelectedKey] = useState<string>(
    () => draft.itens[0]?.chave ?? 'transmissao-satelital',
  );
  const [mobileTab, setMobileTab] = useState<'editar' | 'previa'>('editar');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const { dialogRef, overlayRef } = useDialogFocus(
    fullscreenOpen,
    () => setFullscreenOpen(false),
    '#home-pillars-fullscreen-trigger',
  );

  const validation = validateHomePillarsDraft(draft);
  const isDirty = hasHomePillarsChanges(draft);

  const selectedIndex = draft.itens.findIndex((item) => item.chave === selectedKey);
  const selectedItem: HomePillarItem =
    draft.itens[selectedIndex >= 0 ? selectedIndex : 0] ?? draft.itens[0];
  const selectedItemErrors = validation.items[selectedItem.chave] ?? {};
  const isSelectedItemDirty = hasHomePillarItemChanges(selectedItem);

  const updateSectionField = (
    field: 'sobretitulo' | 'titulo' | 'descricao',
    value: string,
  ) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSelectedItem = <K extends keyof HomePillarItem>(
    field: K,
    value: HomePillarItem[K],
  ) => {
    setDraft((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.chave === selectedItem.chave ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    setDraft((prev) => ({
      ...prev,
      itens: moveHomePillarItem(prev.itens, index, direction),
    }));
  };

  const handleRestoreSelectedCard = () => {
    const original = getInitialHomePillarByKey(selectedItem.chave);
    if (!original) return;
    setDraft((prev) => ({
      ...prev,
      itens: prev.itens.map((item) =>
        item.chave === selectedItem.chave
          ? {
              ...original,
              posicao: item.posicao,
              colSpan: item.colSpan,
            }
          : item,
      ),
    }));
  };

  const handleRestoreAll = () => {
    const fresh = createInitialHomePillarsDraft();
    setDraft(fresh);
    setSelectedKey(fresh.itens[0].chave);
  };

  return (
    <div className="space-y-6">
      {/* 1. Aviso Obrigatório de Edição Temporária em Memória */}
      <div
        role="note"
        className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Modo de Simulação em Memória — Alterações Temporárias (Não Publicadas)
            </p>
            <p className="text-amber-800/90 dark:text-amber-200/85 leading-relaxed">
              Você pode editar títulos, descrições, selos, notas de rodapé, ícones e ordem dos Quatro Pilares da Home para validar a pré-visualização. As alterações ficam apenas na memória desta aba, não modificam a Home pública e serão descartadas ao atualizar a página até a disponibilização dos endpoints Rails (<code className="font-mono">PATCH /api/v1/cms/paginas/:id</code> e <code className="font-mono">PATCH /api/v1/cms/paginas/:id/publicar</code>).
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-[11px] font-bold shrink-0 self-start sm:self-center">
          <span
            className={`h-2 w-2 rounded-full ${
              isDirty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span>{isDirty ? 'Rascunho modificado em memória' : 'Valores originais do código'}</span>
        </span>
      </div>

      {/* 2. Barra de Controles de Escrita (Bloqueados) e Restauração */}
      <div className="rounded-2xl bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#004A99] dark:text-sky-400">
              Conteúdos do Site • Página Inicial (Seção: Pilares)
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              #tecnologia / #pilares
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Editor dos Quatro Pilares Estratégicos da Home
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Origem atual: componente <code className="font-mono">TechAdvantages.tsx</code> (4 cards em Bento Grid 8-4-4-8).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            aria-label="Restaurar valores originais"
            onClick={handleRestoreAll}
            disabled={!isDirty}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071324] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar valores originais</span>
          </button>

          <button
            type="button"
            aria-label="Salvar rascunho (Aguardando API)"
            disabled={true}
            title="Aguardando contrato Rails PATCH /api/v1/cms/paginas/:id"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold cursor-not-allowed opacity-75"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Salvar rascunho (Aguardando API)</span>
          </button>

          <button
            type="button"
            aria-label="Publicar na Home (Indisponível)"
            disabled={true}
            title="Aguardando contrato Rails PATCH /api/v1/cms/paginas/:id/publicar"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-300 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 text-xs font-bold cursor-not-allowed opacity-75"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Publicar na Home (Indisponível)</span>
          </button>
        </div>
      </div>

      {/* 3. Resumo de Validação (quando houver campos inválidos) */}
      {validation.hasErrors && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/35 p-4 text-xs text-rose-800 dark:text-rose-200 space-y-2"
        >
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              Corrija {validation.errorMessages.length}{' '}
              {validation.errorMessages.length === 1
                ? 'pendência de validação'
                : 'pendências de validação'}{' '}
              no formulário:
            </span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {validation.errorMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Alternador Mobile: Editar vs Pré-visualizar */}
      <div
        role="group"
        aria-label="Modo de visualização em telas menores"
        className="flex xl:hidden rounded-xl bg-slate-200/80 dark:bg-[#0B1729] p-1 border border-slate-200 dark:border-slate-800"
      >
        <button
          type="button"
          aria-pressed={mobileTab === 'editar'}
          onClick={() => setMobileTab('editar')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            mobileTab === 'editar'
              ? 'bg-[#004A99] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Editar Pilares ({draft.itens.length})
        </button>
        <button
          type="button"
          aria-pressed={mobileTab === 'previa'}
          onClick={() => setMobileTab('previa')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            mobileTab === 'previa'
              ? 'bg-[#004A99] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pré-visualizar Layout Público
        </button>
      </div>

      {/* 5. Área Principal: Editor (Esquerda) + Prévia Fiel (Direita) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: CABEÇALHO DA SEÇÃO + LISTA DE PILARES + FORMULÁRIO DO CARD */}
        <div
          className={`xl:col-span-6 space-y-6 ${
            mobileTab === 'previa' ? 'hidden xl:block' : 'block'
          }`}
        >
          {/* 5.1. Cabeçalho da Seção (P01) */}
          <section
            aria-labelledby="heading-secao-pilares"
            className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3
                  id="heading-secao-pilares"
                  className="text-sm font-black text-slate-900 dark:text-white"
                >
                  1. Cabeçalho da Seção de Pilares (P01)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Textos introdutórios exibidos acima dos quatro cards na página inicial.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-sky-950/50 text-[#004A99] dark:text-sky-300 font-bold border border-blue-200/70 dark:border-sky-800/60">
                Seção: pilares
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="pilares-secao-sobretitulo"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Sobretítulo e Referência Legal
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {draft.sobretitulo.length}/{HOME_PILLARS_LIMITS.sobretitulo}
                  </span>
                </div>
                <input
                  id="pilares-secao-sobretitulo"
                  name="secao_sobretitulo"
                  type="text"
                  value={draft.sobretitulo}
                  aria-invalid={Boolean(validation.section.sobretitulo)}
                  onChange={(e) => updateSectionField('sobretitulo', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                />
                {validation.section.sobretitulo && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    {validation.section.sobretitulo}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="pilares-secao-titulo"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Título Principal da Seção
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {draft.titulo.length}/{HOME_PILLARS_LIMITS.secaoTitulo}
                  </span>
                </div>
                <input
                  id="pilares-secao-titulo"
                  name="secao_titulo"
                  type="text"
                  value={draft.titulo}
                  aria-invalid={Boolean(validation.section.titulo)}
                  onChange={(e) => updateSectionField('titulo', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold"
                />
                {validation.section.titulo && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    {validation.section.titulo}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="pilares-secao-descricao"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Descrição Introdutória da Seção
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {draft.descricao.length}/{HOME_PILLARS_LIMITS.secaoDescricao}
                  </span>
                </div>
                <textarea
                  id="pilares-secao-descricao"
                  name="secao_descricao"
                  rows={2}
                  value={draft.descricao}
                  aria-invalid={Boolean(validation.section.descricao)}
                  onChange={(e) => updateSectionField('descricao', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                />
                {validation.section.descricao && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    {validation.section.descricao}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 5.2. Seletor e Ordenação dos 4 Cards (P02–P05) */}
          <section
            aria-labelledby="heading-lista-pilares"
            className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3
                  id="heading-lista-pilares"
                  className="text-sm font-black text-slate-900 dark:text-white"
                >
                  2. Quatro Pilares Estratégicos (P02–P05)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Selecione um pilar para editar seus campos ou altere a ordem de exibição no Bento Grid.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                4 cards
              </span>
            </div>

            <div className="space-y-2" role="list" aria-label="Lista ordenada dos quatro pilares">
              {draft.itens.map((item, idx) => {
                const isSelected = item.chave === selectedItem.chave;
                const itemHasError = Boolean(validation.items[item.chave]);
                const itemDirty = hasHomePillarItemChanges(item);

                return (
                  <div
                    key={item.chave}
                    role="listitem"
                    className={`rounded-xl border p-3 transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#004A99] dark:border-[#00D8FF] bg-blue-50/50 dark:bg-sky-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#071324]'
                    }`}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedKey(item.chave)}
                      className="flex-1 min-w-0 text-left flex items-center gap-3 cursor-pointer"
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected
                            ? 'bg-[#004A99] text-white dark:bg-[#00D8FF] dark:text-slate-950'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {idx + 1}º
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.titulo.trim() || '(Sem título)'}
                          </span>
                          {!item.visivel && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Oculto
                            </span>
                          )}
                          {itemDirty && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                              Editado
                            </span>
                          )}
                          {itemHasError && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                              Inválido
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Selo: {item.selo.trim() || '—'} • Coluna {item.colSpan}/12
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveItem(idx, 'up')}
                        aria-label={`Mover pilar ${idx + 1} para cima`}
                        title="Mover para cima"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1729] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === draft.itens.length - 1}
                        onClick={() => handleMoveItem(idx, 'down')}
                        aria-label={`Mover pilar ${idx + 1} para baixo`}
                        title="Mover para baixo"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1729] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 5.3. Formulário Detalhado do Pilar Selecionado */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#004A99] dark:text-sky-400">
                    Editando Pilar {selectedItem.posicao} de {draft.itens.length}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedItem.titulo.trim() || 'Pilar selecionado'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Chave: {selectedItem.chave} • Grade: {selectedItem.colSpan}/12 colunas
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="pilar_visivel"
                      checked={selectedItem.visivel}
                      onChange={(e) => updateSelectedItem('visivel', e.target.checked)}
                      className="rounded border-slate-300 text-[#004A99] focus:ring-[#004A99]"
                    />
                    <span>Visível na prévia</span>
                  </label>

                  <button
                    type="button"
                    aria-label="Restaurar este card"
                    onClick={handleRestoreSelectedCard}
                    disabled={!isSelectedItemDirty}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071324] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Restaurar este card</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Título do Card */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label
                      htmlFor="pilar-campo-titulo"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Título do Pilar
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedItem.titulo.length}/{HOME_PILLARS_LIMITS.itemTitulo}
                    </span>
                  </div>
                  <input
                    id="pilar-campo-titulo"
                    name="pilar_titulo"
                    type="text"
                    value={selectedItem.titulo}
                    aria-invalid={Boolean(selectedItemErrors.titulo)}
                    onChange={(e) => updateSelectedItem('titulo', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold"
                  />
                  {selectedItemErrors.titulo && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {selectedItemErrors.titulo}
                    </p>
                  )}
                </div>

                {/* Selo / Badge Superior */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label
                      htmlFor="pilar-campo-selo"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Selo Superior (Badge)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedItem.selo.length}/{HOME_PILLARS_LIMITS.selo}
                    </span>
                  </div>
                  <input
                    id="pilar-campo-selo"
                    name="pilar_selo"
                    type="text"
                    value={selectedItem.selo}
                    aria-invalid={Boolean(selectedItemErrors.selo)}
                    onChange={(e) => updateSelectedItem('selo', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                  />
                  {selectedItemErrors.selo && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {selectedItemErrors.selo}
                    </p>
                  )}
                </div>

                {/* Ícone Semântico */}
                <div>
                  <label
                    htmlFor="pilar-campo-icone"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Ícone do Pilar
                  </label>
                  <select
                    id="pilar-campo-icone"
                    name="pilar_icone"
                    value={selectedItem.icone}
                    aria-invalid={Boolean(selectedItemErrors.icone)}
                    onChange={(e) =>
                      updateSelectedItem('icone', e.target.value as PillarIconName)
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                  >
                    {PILLAR_ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedItemErrors.icone && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {selectedItemErrors.icone}
                    </p>
                  )}
                </div>

                {/* Descrição do Pilar */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label
                      htmlFor="pilar-campo-descricao"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Descrição do Pilar
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedItem.descricao.length}/{HOME_PILLARS_LIMITS.itemDescricao}
                    </span>
                  </div>
                  <textarea
                    id="pilar-campo-descricao"
                    name="pilar_descricao"
                    rows={3}
                    value={selectedItem.descricao}
                    aria-invalid={Boolean(selectedItemErrors.descricao)}
                    onChange={(e) => updateSelectedItem('descricao', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                  />
                  {selectedItemErrors.descricao && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {selectedItemErrors.descricao}
                    </p>
                  )}
                </div>

                {/* Rodapé Principal (Nota Esquerda) */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label
                      htmlFor="pilar-campo-nota"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Rodapé Principal (Nota)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedItem.nota.length}/{HOME_PILLARS_LIMITS.nota}
                    </span>
                  </div>
                  <input
                    id="pilar-campo-nota"
                    name="pilar_nota"
                    type="text"
                    value={selectedItem.nota}
                    aria-invalid={Boolean(selectedItemErrors.nota)}
                    onChange={(e) => updateSelectedItem('nota', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                  />
                  {selectedItemErrors.nota && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {selectedItemErrors.nota}
                    </p>
                  )}
                </div>

                {/* Rodapé Complementar (Direita) */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label
                      htmlFor="pilar-campo-complemento"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Complemento de Rodapé (Opcional)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedItem.complemento.length}/{HOME_PILLARS_LIMITS.complemento}
                    </span>
                  </div>
                  <input
                    id="pilar-campo-complemento"
                    name="pilar_complemento"
                    type="text"
                    placeholder="Ex: Porto Velho ↔ 52 Municípios, 100% Gratuito, Portaria..."
                    value={selectedItem.complemento}
                    aria-invalid={Boolean(selectedItemErrors.complemento)}
                    onChange={(e) => updateSelectedItem('complemento', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                  />
                  {selectedItemErrors.complemento && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {selectedItemErrors.complemento}
                    </p>
                  )}
                </div>

                {/* Variante Visual */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="pilar-campo-variante"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Variante Visual do Card
                  </label>
                  <select
                    id="pilar-campo-variante"
                    name="pilar_variante"
                    value={selectedItem.variante}
                    aria-invalid={Boolean(selectedItemErrors.variante)}
                    onChange={(e) =>
                      updateSelectedItem('variante', e.target.value as PillarVariant)
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                  >
                    {PILLAR_VARIANT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedItemErrors.variante && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {selectedItemErrors.variante}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO FIEL AO LAYOUT PÚBLICO */}
        <div
          className={`xl:col-span-6 xl:sticky xl:top-24 space-y-3 ${
            mobileTab === 'editar' ? 'hidden xl:block' : 'block'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
                <span>Pré-visualização Fiel da Home (TechAdvantages)</span>
              </span>
            </div>

            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Prévia em memória (Não publicado)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                <Check className="h-3 w-3" />
                <span>Idêntico ao código atual</span>
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] shadow-md overflow-hidden flex flex-col">
            {/* Barra de Navegador da Prévia */}
            <div className="bg-slate-100 dark:bg-[#050D19] border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  <Lock className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">medtec.ro.gov.br/#pilares</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                <div
                  role="group"
                  aria-label="Dispositivo da pré-visualização"
                  className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-800/80 p-0.5 text-[11px] font-bold"
                >
                  <button
                    type="button"
                    aria-label="Computador"
                    aria-pressed={previewDevice === 'desktop'}
                    onClick={() => setPreviewDevice('desktop')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-[#0B1729] text-[#004A99] dark:text-[#00D8FF] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Monitor className="h-3 w-3" />
                    <span>Computador</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Celular"
                    aria-pressed={previewDevice === 'mobile'}
                    onClick={() => setPreviewDevice('mobile')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-[#0B1729] text-[#004A99] dark:text-[#00D8FF] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" />
                    <span>Celular</span>
                  </button>
                </div>

                <button
                  id="home-pillars-fullscreen-trigger"
                  type="button"
                  onClick={() => setFullscreenOpen(true)}
                  aria-label="Expandir prévia dos pilares em tela cheia"
                  title="Expandir simulação em tela cheia"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1729] text-slate-600 dark:text-slate-300 hover:text-[#004A99] dark:hover:text-[#00D8FF] transition cursor-pointer shadow-xs"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Corpo da Prévia */}
            <div className="p-3 sm:p-4 bg-[#F0F4F8] dark:bg-[#030914] max-h-[720px] overflow-y-auto">
              <div
                className={
                  previewDevice === 'mobile'
                    ? 'max-w-[360px] mx-auto bg-white dark:bg-[#061224] rounded-2xl shadow-xl border border-slate-300 dark:border-slate-700 p-2 overflow-hidden'
                    : 'w-full'
                }
              >
                <HomePillarsPreviewRenderer
                  draft={draft}
                  device={previewDevice}
                  selectedKey={selectedItem.chave}
                  onSelectCard={(chave) => setSelectedKey(chave)}
                />
              </div>
            </div>

            <div className="px-3 py-2 bg-slate-50 dark:bg-[#050D19] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-sky-500" />
                <span>Clique em qualquer card na prévia para selecioná-lo no editor</span>
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {previewDevice === 'mobile' ? 'Visualização Mobile (360px)' : 'Bento Grid Desktop (12 col)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Modal de Pré-visualização em Tela Cheia */}
      {fullscreenOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex flex-col bg-slate-950/85 backdrop-blur-md"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Pré-visualização em tela cheia dos Quatro Pilares da Home"
            tabIndex={-1}
            className="flex-1 flex flex-col overflow-hidden focus:outline-hidden"
          >
            <div className="bg-[#050E1D] border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#004A99] flex items-center justify-center text-white font-bold text-xs">
                  RO
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black tracking-wide">
                    Pré-visualização em Tela Cheia • Quatro Pilares da Home
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Simulação fiel à seção pública TechAdvantages.tsx (rascunho temporário em memória).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg bg-slate-800 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    aria-pressed={previewDevice === 'desktop'}
                    onClick={() => setPreviewDevice('desktop')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-[#004A99] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span>Computador</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={previewDevice === 'mobile'}
                    onClick={() => setPreviewDevice('mobile')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-[#004A99] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Celular (360px)</span>
                  </button>
                </div>

                <button
                  type="button"
                  aria-label="Fechar Prévia"
                  onClick={() => setFullscreenOpen(false)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Fechar Prévia</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F0F4F8] dark:bg-[#040B16]">
              <div
                className={`mx-auto transition-all duration-300 ${
                  previewDevice === 'mobile' ? 'max-w-[360px]' : 'max-w-6xl'
                }`}
              >
                <HomePillarsPreviewRenderer
                  draft={draft}
                  device={previewDevice}
                  selectedKey={selectedItem.chave}
                  onSelectCard={(chave) => setSelectedKey(chave)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
