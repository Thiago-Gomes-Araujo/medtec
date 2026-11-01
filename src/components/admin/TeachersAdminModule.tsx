'use client';

import { useCallback, useId, useState, type FormEvent } from 'react';
import { medtecApi, type ModeracaoStatus, type PDisciplina, type PProfessor, type PRelato } from '@/lib/api';
import CommunityTaxonomyManager from './CommunityTaxonomyManager';
import {
  buttonClass,
  inputClass,
  labelClass,
  panelClass,
  renderFeedback,
  renderModerationButtons,
  renderPagination,
  renderStatusBadge,
  useAdminAction,
  useApiList,
  useEscolaOptions,
  type ModeracaoAction,
} from './communityAdminUi';

type Section = 'professores' | 'disciplinas' | 'relatos';
const SECTION_LABEL: Record<Section, string> = { professores: 'Professores', disciplinas: 'Disciplinas', relatos: 'Relatos dos alunos' };

interface ProfessorForm {
  id?: number;
  nome: string;
  cidadeId: string;
  escolaId: string;
  pratica: string;
  ativo: boolean;
  disciplinaIds: number[];
}

const EMPTY_FORM: ProfessorForm = { nome: '', cidadeId: '', escolaId: '', pratica: '', ativo: true, disciplinaIds: [] };
const readDisciplinas = (signal: AbortSignal) => medtecApi.disciplinasProfessor.list({ page: 'all' }, signal);

export default function TeachersAdminModule() {
  const [section, setSection] = useState<Section>('professores');
  return (
    <div className="space-y-6">
      <nav aria-label="Seções de professores" className="flex flex-wrap gap-2">
        {(Object.keys(SECTION_LABEL) as Section[]).map(key => <button key={key} type="button" aria-pressed={section === key} onClick={() => setSection(key)}
          className={`rounded-xl px-4 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer ${section === key
            ? 'bg-[#004A99] text-white' : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          {SECTION_LABEL[key]}
        </button>)}
      </nav>
      {section === 'professores' && <ProfessoresPanel />}
      {section === 'disciplinas' && <CommunityTaxonomyManager heading="Disciplinas" singular="disciplina" plural="disciplinas"
        deleteHint="Disciplina ligada a professor não pode ser excluída; nesse caso, desative-a." service={medtecApi.disciplinasProfessor} />}
      {section === 'relatos' && <RelatosPanel />}
    </div>
  );
}

export function ProfessoresPanel() {
  const id = useId();
  const [page, setPage] = useState(1);
  const [buscaInput, setBuscaInput] = useState('');
  const [filters, setFilters] = useState({ busca: '', disciplinaId: '', cidadeId: '', somenteAtivos: false });
  const [form, setForm] = useState<ProfessorForm | null>(null);
  const [deleting, setDeleting] = useState<PProfessor | null>(null);

  const read = useCallback((signal: AbortSignal) => medtecApi.professores.list({
    page, per_page: 10,
    'q[nome_cont]': filters.busca || undefined,
    'q[p_disciplinas_id_eq]': filters.disciplinaId || undefined,
    'q[escola_g_cidade_id_eq]': filters.cidadeId || undefined,
    'q[ativo_true]': filters.somenteAtivos ? 1 : undefined,
  }, signal), [page, filters]);
  const { items, pagination, loading, error, reload } = useApiList<PProfessor>(read);
  const disciplinas = useApiList<PDisciplina>(readDisciplinas);
  const escolas = useEscolaOptions(form?.cidadeId ?? '');
  const action = useAdminAction();
  const blocked = action.busy || form !== null || deleting !== null;

  function updateFilters(next: Partial<typeof filters>) {
    setFilters(current => ({ ...current, ...next }));
    setPage(1);
  }

  async function edit(item: PProfessor) {
    await action.run(async () => {
      const value = await medtecApi.professores.get(item.id);
      setForm({
        id: value.id, nome: value.nome, cidadeId: '', escolaId: String(value.escola_id),
        pratica: value.pratica_pedagogica, ativo: value.ativo, disciplinaIds: value.p_disciplina_ids,
      });
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!form.nome.trim() || !form.pratica.trim() || !form.escolaId) { action.setError('Informe nome, escola e prática pedagógica.'); return; }
    if (form.disciplinaIds.length === 0) { action.setError('Selecione ao menos uma disciplina.'); return; }
    const data = {
      nome: form.nome.trim(), escola_id: Number(form.escolaId), pratica_pedagogica: form.pratica.trim(),
      ativo: form.ativo, p_disciplina_ids: form.disciplinaIds,
    };
    const saved = await action.run(async () => {
      if (form.id) await medtecApi.professores.update(form.id, data);
      else await medtecApi.professores.create(data);
      return 'Professor salvo com sucesso.';
    });
    if (saved) { setForm(null); reload(); }
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await medtecApi.professores.delete(deleting.id);
      return 'Professor excluído.';
    });
    setDeleting(null);
    if (removed) {
      if (items.length === 1 && page > 1) setPage(page - 1);
      else reload();
    }
  }

  // Disciplina inativa já vinculada continua marcável para não sumir da edição.
  const disciplinaOptions = disciplinas.items.filter(item => item.ativo || form?.disciplinaIds.includes(item.id));

  return (
    <section aria-labelledby={`${id}-heading`} className={panelClass}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Professores e Mediadores</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Gerenciamento editorial do corpo docente: professores ministrantes no estúdio SEDUC e mediadores presenciais nas salas de aula de Rondônia. O município exibido no site vem da escola. Cada ação exige permissão do seu perfil.</p>
        </div>
        <button type="button" disabled={blocked || loading} className={buttonClass} onClick={() => {
          setForm(EMPTY_FORM); action.setError(null); action.setSuccess(null);
        }}>Novo professor</button>
      </header>

      <form aria-label="Filtrar professores" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={event => { event.preventDefault(); updateFilters({ busca: buscaInput.trim() }); }}>
        <input name="professor-busca" aria-label="Buscar por nome" placeholder="Buscar por nome" value={buscaInput} className={inputClass} onChange={event => setBuscaInput(event.target.value)} />
        <select name="professor-filtro-disciplina" aria-label="Filtrar por disciplina" value={filters.disciplinaId} className={inputClass} onChange={event => updateFilters({ disciplinaId: event.target.value })}>
          <option value="">Todas as disciplinas</option>
          {disciplinas.items.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        <select name="professor-filtro-cidade" aria-label="Filtrar por município" value={filters.cidadeId} className={inputClass} onChange={event => updateFilters({ cidadeId: event.target.value })}>
          <option value="">Todos os municípios</option>
          {escolas.cidades.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
          <input name="professor-filtro-ativos" type="checkbox" checked={filters.somenteAtivos} onChange={event => updateFilters({ somenteAtivos: event.target.checked })} /> Somente ativos
        </label>
        <button type="submit" className={buttonClass}>Buscar</button>
      </form>

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando professores...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {renderFeedback(action.error, action.success)}

      {form && <form onSubmit={save} aria-label={form.id ? 'Editar professor' : 'Criar professor'} className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4">
        <fieldset disabled={action.busy} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor={`${id}-nome`} className={labelClass}>Nome (obrigatório)</label>
            <input id={`${id}-nome`} name="professor-nome" required value={form.nome} className={inputClass} onChange={event => setForm({ ...form, nome: event.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-cidade`} className={labelClass}>Município (só filtra as escolas)</label>
              <select id={`${id}-cidade`} name="professor-cidade" value={form.cidadeId} className={inputClass} onChange={event => setForm({ ...form, cidadeId: event.target.value, escolaId: '' })}>
                <option value="">Todos os municípios</option>
                {escolas.cidades.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-escola`} className={labelClass}>Escola (obrigatório)</label>
              <select id={`${id}-escola`} name="professor-escola" required value={form.escolaId} disabled={escolas.loading} className={inputClass} onChange={event => setForm({ ...form, escolaId: event.target.value })}>
                <option value="">{escolas.loading ? 'Carregando escolas...' : 'Selecione a escola'}</option>
                {escolas.escolas.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
              {escolas.error && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{escolas.error}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-pratica`} className={labelClass}>Prática pedagógica (obrigatório)</label>
            <textarea id={`${id}-pratica`} name="professor-pratica" required rows={3} value={form.pratica} className={inputClass} onChange={event => setForm({ ...form, pratica: event.target.value })} />
          </div>
          <fieldset className="space-y-2">
            <legend className={labelClass}>Disciplinas (ao menos uma)</legend>
            {disciplinas.error && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{disciplinas.error}</p>}
            <div className="flex flex-wrap gap-3">
              {disciplinaOptions.map(item => <label key={item.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input name={`professor-disciplina-${item.id}`} type="checkbox" checked={form.disciplinaIds.includes(item.id)} onChange={event => setForm({
                  ...form,
                  disciplinaIds: event.target.checked ? [...form.disciplinaIds, item.id] : form.disciplinaIds.filter(value => value !== item.id),
                })} /> {item.nome}
              </label>)}
              {!disciplinas.loading && disciplinaOptions.length === 0 && <p className="text-xs text-slate-600 dark:text-slate-400">Cadastre uma disciplina ativa na aba Disciplinas.</p>}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input name="professor-ativo" type="checkbox" checked={form.ativo} onChange={event => setForm({ ...form, ativo: event.target.checked })} /> Ativo (inativo some do site)
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClass}>{action.busy ? 'Salvando...' : 'Salvar professor'}</button>
            <button type="button" className={buttonClass} onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </fieldset>
      </form>}

      {deleting && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        <p>Excluir <strong className="break-words">{deleting.nome}</strong>? Os relatos deste professor também serão excluídos.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => setDeleting(null)}>Cancelar exclusão</button>
        </div>
      </div>}

      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhum professor encontrado.</p>}
      {!loading && !error && items.length > 0 && <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-label="Professores cadastrados">
        {items.map(item => <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.nome}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{item.escola_nome} · {item.cidade_nome} · {item.ativo ? 'Ativo' : 'Inativo'}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{item.disciplinas.map(disciplina => disciplina.nome).join(', ')}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" disabled={blocked} aria-label={`Editar ${item.nome}`} className={buttonClass} onClick={() => void edit(item)}>Editar</button>
            <button type="button" disabled={blocked} aria-label={`Excluir ${item.nome}`} className={buttonClass} onClick={() => setDeleting(item)}>Excluir</button>
          </div>
        </li>)}
      </ul>}
      {!error && renderPagination('Paginação de professores', 'professores', pagination, page, loading || blocked, setPage)}
    </section>
  );
}

export function RelatosPanel() {
  const id = useId();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ModeracaoStatus | ''>('aguardando');
  const [deleting, setDeleting] = useState<PRelato | null>(null);
  const read = useCallback((signal: AbortSignal) => medtecApi.relatos.list({
    page, per_page: 10, 'q[n_status_noticia_slug_eq]': status || undefined,
  }, signal), [page, status]);
  const { items, pagination, loading, error, reload } = useApiList<PRelato>(read);
  const action = useAdminAction();
  const blocked = action.busy || deleting !== null;

  async function moderate(item: PRelato, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.relatos[operation](item.id);
      return operation === 'publicar' ? 'Relato publicado.' : operation === 'reprovar' ? 'Relato reprovado.' : 'Relato retirado do site.';
    });
    if (done) reload();
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await medtecApi.relatos.delete(deleting.id);
      return 'Relato excluído.';
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
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Relatos dos alunos</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Enviados pelo site. E-mail e telefone são visíveis só aqui, nunca no site.</p>
        </div>
        <select name="relato-filtro-status" aria-label="Filtrar por situação" value={status} className={`${inputClass} sm:w-56`} onChange={event => { setStatus(event.target.value as ModeracaoStatus | ''); setPage(1); }}>
          <option value="">Todas as situações</option>
          <option value="aguardando">Aguardando</option>
          <option value="publicada">Publicada</option>
          <option value="reprovada">Reprovada</option>
        </select>
      </header>

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando relatos...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {renderFeedback(action.error, action.success)}

      {deleting && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        <p>Excluir o relato de <strong className="break-words">{deleting.nome}</strong>?</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => setDeleting(null)}>Cancelar exclusão</button>
        </div>
      </div>}

      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhum relato encontrado.</p>}
      {!loading && !error && items.length > 0 && <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-label="Relatos recebidos">
        {items.map(item => <li key={item.id} className="space-y-2 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.nome}</h3>
            {renderStatusBadge(item.status, item.status_nome)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Sobre {item.professor_nome} · {item.email} · {item.telefone}</p>
          <p className="whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{item.texto}</p>
          <div className="flex flex-wrap gap-2">
            {renderModerationButtons(item.status, `relato de ${item.nome}`, blocked, operation => void moderate(item, operation))}
            <button type="button" disabled={blocked} aria-label={`Excluir relato de ${item.nome}`} className={buttonClass} onClick={() => setDeleting(item)}>Excluir</button>
          </div>
        </li>)}
      </ul>}
      {!error && renderPagination('Paginação de relatos', 'relatos', pagination, page, loading || blocked, setPage)}
    </section>
  );
}
