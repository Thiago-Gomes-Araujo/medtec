'use client';

import { useCallback, useId, useState, type FormEvent } from 'react';
import type { ApiResponse, PaginatedData } from '@/lib/api';
import { buttonClass, inputClass, labelClass, panelClass, renderFeedback, renderPagination, useAdminAction, useApiList } from './communityAdminUi';

interface TaxonomyItem {
  id: number;
  nome: string;
  slug: string;
  ativo: boolean;
}

interface TaxonomyInput {
  nome: string;
  slug?: string;
  ativo?: boolean;
}

export interface TaxonomyService {
  list(params: Record<string, unknown>, signal?: AbortSignal): Promise<ApiResponse<PaginatedData<TaxonomyItem>>>;
  create(data: TaxonomyInput): Promise<TaxonomyItem>;
  update(id: number, data: Partial<TaxonomyInput>): Promise<TaxonomyItem>;
  delete(id: number): Promise<void>;
}

// CRUD comum a disciplinas e categorias de conquista: mesmos campos e regras.
export default function CommunityTaxonomyManager({ heading, singular, plural, deleteHint, service }: {
  heading: string;
  singular: string;
  plural: string;
  deleteHint: string;
  service: TaxonomyService;
}) {
  const id = useId();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ id?: number; nome: string; slug: string; ativo: boolean } | null>(null);
  const [deleting, setDeleting] = useState<TaxonomyItem | null>(null);
  const read = useCallback((signal: AbortSignal) => service.list({ page, per_page: 10 }, signal), [page, service]);
  const { items, pagination, loading, error, reload } = useApiList<TaxonomyItem>(read);
  const action = useAdminAction();
  const blocked = action.busy || form !== null || deleting !== null;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!form.nome.trim()) { action.setError(`Informe o nome da ${singular}.`); return; }
    const data = { nome: form.nome.trim(), slug: form.slug.trim() || undefined, ativo: form.ativo };
    const saved = await action.run(async () => {
      if (form.id) await service.update(form.id, data);
      else await service.create(data);
      return `${heading}: registro salvo com sucesso.`;
    });
    if (saved) { setForm(null); reload(); }
  }

  async function toggle(item: TaxonomyItem) {
    const saved = await action.run(async () => {
      await service.update(item.id, { ativo: !item.ativo });
      return item.ativo ? `${item.nome} desativada.` : `${item.nome} ativada.`;
    });
    if (saved) reload();
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await service.delete(deleting.id);
      return `${deleting.nome} excluída.`;
    });
    setDeleting(null);
    if (removed) {
      if (items.length === 1 && page > 1) setPage(page - 1);
      else reload();
    }
  }

  return (
    <section aria-labelledby={`${id}-heading`} className={panelClass}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">{heading}</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Cada ação exige permissão do seu perfil.</p>
        </div>
        <button type="button" disabled={blocked || loading} className={buttonClass} onClick={() => {
          setForm({ nome: '', slug: '', ativo: true }); action.setError(null); action.setSuccess(null);
        }}>{`Nova ${singular}`}</button>
      </header>

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando {plural}...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {renderFeedback(action.error, action.success)}

      {form && <form onSubmit={save} aria-label={form.id ? `Editar ${singular}` : `Criar ${singular}`} className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4">
        <fieldset disabled={action.busy} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-nome`} className={labelClass}>Nome (obrigatório)</label>
              <input id={`${id}-nome`} name="taxonomy-nome" required value={form.nome} className={inputClass} onChange={event => setForm({ ...form, nome: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-slug`} className={labelClass}>Slug (opcional)</label>
              <input id={`${id}-slug`} name="taxonomy-slug" value={form.slug} className={inputClass} onChange={event => setForm({ ...form, slug: event.target.value })} />
              <p className="text-xs text-slate-600 dark:text-slate-400">Em branco, é gerado a partir do nome.</p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input name="taxonomy-ativo" type="checkbox" checked={form.ativo} onChange={event => setForm({ ...form, ativo: event.target.checked })} /> Ativa (inativa some do site)
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClass}>{action.busy ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" className={buttonClass} onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </fieldset>
      </form>}

      {deleting && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        <p>Excluir <strong className="break-words">{deleting.nome}</strong>? {deleteHint}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => setDeleting(null)}>Cancelar exclusão</button>
        </div>
      </div>}

      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhum registro cadastrado.</p>}
      {!loading && !error && items.length > 0 && <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-label={heading}>
        {items.map(item => <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.nome}</h3>
            <p className="break-all text-xs text-slate-600 dark:text-slate-400">{item.slug} · {item.ativo ? 'Ativa' : 'Inativa'}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" disabled={blocked} aria-label={`Editar ${item.nome}`} className={buttonClass} onClick={() => setForm({ id: item.id, nome: item.nome, slug: item.slug, ativo: item.ativo })}>Editar</button>
            <button type="button" disabled={blocked} aria-label={`${item.ativo ? 'Desativar' : 'Ativar'} ${item.nome}`} className={buttonClass} onClick={() => void toggle(item)}>{item.ativo ? 'Desativar' : 'Ativar'}</button>
            <button type="button" disabled={blocked} aria-label={`Excluir ${item.nome}`} className={buttonClass} onClick={() => setDeleting(item)}>Excluir</button>
          </div>
        </li>)}
      </ul>}
      {!error && renderPagination(`Paginação de ${plural}`, plural, pagination, page, loading || blocked, setPage)}
    </section>
  );
}
