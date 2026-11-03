'use client';

import Link from 'next/link';
import { useCallback, useId, useState, type FormEvent } from 'react';
import { SECTION_CONFIG } from '@/lib/admin-navigation';
import { medtecApi, type PjMembro } from '@/lib/api';
import { formatCpf, isValidCpf, maskCpf, onlyDigits } from '@/lib/projetos-content';
import MembroCadastroModal from './MembroCadastroModal';
import { buttonClass, inputClass, labelClass, panelClass, renderFeedback, renderPagination, useAdminAction, useApiList } from './communityAdminUi';
import { usePermissoes } from './usePermissoes';

// O membro é reaproveitado entre projetos; a função fica no vínculo de cada projeto.
export default function MembrosProjetoPanel() {
  const id = useId();
  const [page, setPage] = useState(1);
  const [inputs, setInputs] = useState({ nome: '', cpf: '' });
  const [filters, setFilters] = useState({ nome: '', cpf: '' });
  const [form, setForm] = useState<{ id: number; nome: string; cpf: string } | null>(null);
  const [cadastrando, setCadastrando] = useState(false);
  const [deleting, setDeleting] = useState<PjMembro | null>(null);
  const read = useCallback((signal: AbortSignal) => medtecApi.membrosProjeto.list({
    page, per_page: 10, 'q[nome_cont]': filters.nome || undefined, 'q[cpf_eq]': filters.cpf || undefined,
  }, signal), [page, filters]);
  const { items, pagination, loading, error, reload } = useApiList<PjMembro>(read);
  const action = useAdminAction();
  const { pode } = usePermissoes();
  const blocked = action.busy || form !== null || deleting !== null || cadastrando;

  function search(event: FormEvent) {
    event.preventDefault();
    const cpf = onlyDigits(inputs.cpf);
    if (cpf && !isValidCpf(cpf)) { action.setError('Informe um CPF válido para buscar.'); return; }
    action.setError(null);
    setFilters({ nome: inputs.nome.trim(), cpf });
    setPage(1);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!form.nome.trim()) { action.setError('Informe o nome do membro.'); return; }
    if (!isValidCpf(form.cpf)) { action.setError('Informe um CPF válido.'); return; }
    const data = { nome: form.nome.trim(), cpf: onlyDigits(form.cpf) };
    const saved = await action.run(async () => {
      await medtecApi.membrosProjeto.update(form.id, data);
      return 'Membro salvo com sucesso.';
    });
    if (saved) { setForm(null); reload(); }
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await medtecApi.membrosProjeto.delete(deleting.id);
      return `${deleting.nome} excluído.`;
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
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Membros de projeto</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Cada pessoa é cadastrada uma vez. O CPF não aparece no site.</p>
        </div>
        {pode('pj_membros', 'create') && <button type="button" disabled={blocked || loading} className={buttonClass} onClick={() => {
          setCadastrando(true); action.setError(null); action.setSuccess(null);
        }}>Cadastrar membro</button>}
      </header>

      <form aria-label="Filtrar membros" className="grid gap-3 sm:grid-cols-3" onSubmit={search}>
        <input name="membro-busca-nome" aria-label="Buscar por nome" placeholder="Buscar por nome" value={inputs.nome} className={inputClass} onChange={event => setInputs({ ...inputs, nome: event.target.value })} />
        <input name="membro-busca-cpf" aria-label="Buscar por CPF" placeholder="Buscar por CPF" inputMode="numeric" value={inputs.cpf} className={inputClass} onChange={event => setInputs({ ...inputs, cpf: formatCpf(event.target.value) })} />
        <button type="submit" className={buttonClass}>Buscar</button>
      </form>

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando membros...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {renderFeedback(action.error, action.success)}

      {cadastrando && <MembroCadastroModal onClose={() => setCadastrando(false)} onCreated={membro => {
        setCadastrando(false); action.setSuccess(`${membro.nome} cadastrado.`); reload();
      }} />}

      {form && <form onSubmit={save} aria-label="Editar membro" className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4">
        <fieldset disabled={action.busy} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-nome`} className={labelClass}>Nome (obrigatório)</label>
              <input id={`${id}-nome`} name="membro-nome" required value={form.nome} className={inputClass} onChange={event => setForm({ ...form, nome: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-cpf`} className={labelClass}>CPF (obrigatório)</label>
              <input id={`${id}-cpf`} name="membro-cpf" required inputMode="numeric" autoComplete="off" value={form.cpf} className={inputClass} onChange={event => setForm({ ...form, cpf: formatCpf(event.target.value) })} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClass}>{action.busy ? 'Salvando...' : 'Salvar membro'}</button>
            <button type="button" className={buttonClass} onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </fieldset>
      </form>}

      {deleting && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        <p>Excluir <strong className="break-words">{deleting.nome}</strong>? Membro que está em algum projeto não pode ser excluído.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => setDeleting(null)}>Cancelar exclusão</button>
        </div>
      </div>}

      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhum membro encontrado.</p>}
      {!loading && !error && items.length > 0 && <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-label="Membros cadastrados">
        {items.map(item => <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.nome}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">CPF {maskCpf(item.cpf)}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href={`${SECTION_CONFIG.projetos.href}?membro=${item.id}`} aria-label={`Ver projetos de ${item.nome}`} className={buttonClass}>Ver projetos</Link>
            {pode('pj_membros', 'update') && <button type="button" disabled={blocked} aria-label={`Editar ${item.nome}`} className={buttonClass} onClick={() => {
              setForm({ id: item.id, nome: item.nome, cpf: formatCpf(item.cpf) }); action.setError(null); action.setSuccess(null);
            }}>Editar</button>}
            {pode('pj_membros', 'destroy') && <button type="button" disabled={blocked} aria-label={`Excluir ${item.nome}`} className={buttonClass} onClick={() => setDeleting(item)}>Excluir</button>}
          </div>
        </li>)}
      </ul>}
      {!error && renderPagination('Paginação de membros', 'membros', pagination, page, loading || blocked, setPage)}
    </section>
  );
}
