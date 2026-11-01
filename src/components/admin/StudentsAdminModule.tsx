'use client';

import Image from 'next/image';
import { useCallback, useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { medtecApi, type CCategoriaConquista, type CConquistaAluno, type ModeracaoStatus } from '@/lib/api';
import { getConquistaImageSrc, isHttpsUrl, validateConquistaImage } from '@/lib/community-content';
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

type Section = 'conquistas' | 'categorias';

interface ConquistaForm {
  id?: number;
  nomeAluno: string;
  titulo: string;
  relato: string;
  categoriaId: string;
  cidadeId: string;
  escolaId: string;
  imagemModo: 'upload' | 'link';
  imagem: File | null;
  imagemUrl: string;
  imagemAtual: string;
}

const EMPTY_FORM: ConquistaForm = {
  nomeAluno: '', titulo: '', relato: '', categoriaId: '', cidadeId: '', escolaId: '',
  imagemModo: 'upload', imagem: null, imagemUrl: '', imagemAtual: '',
};
const readCategorias = (signal: AbortSignal) => medtecApi.categoriasConquista.list({ page: 'all' }, signal);

export default function StudentsAdminModule() {
  const [section, setSection] = useState<Section>('conquistas');
  return (
    <div className="space-y-6">
      <nav aria-label="Seções de conquistas" className="flex flex-wrap gap-2">
        {(['conquistas', 'categorias'] as const).map(key => <button key={key} type="button" aria-pressed={section === key} onClick={() => setSection(key)}
          className={`rounded-xl px-4 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer ${section === key
            ? 'bg-[#004A99] text-white' : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          {key === 'conquistas' ? 'Conquistas' : 'Categorias'}
        </button>)}
      </nav>
      {section === 'conquistas' && <ConquistasPanel />}
      {section === 'categorias' && <CommunityTaxonomyManager heading="Categorias de conquista" singular="categoria" plural="categorias"
        deleteHint="Categoria com conquistas não pode ser excluída; nesse caso, desative-a." service={medtecApi.categoriasConquista} />}
    </div>
  );
}

export function ConquistasPanel() {
  const id = useId();
  const [page, setPage] = useState(1);
  const [inputs, setInputs] = useState({ nome: '', titulo: '' });
  const [filters, setFilters] = useState({ nome: '', titulo: '', categoriaId: '', cidadeId: '', status: '' as ModeracaoStatus | '' });
  const [form, setForm] = useState<ConquistaForm | null>(null);
  const [deleting, setDeleting] = useState<CConquistaAluno | null>(null);

  const read = useCallback((signal: AbortSignal) => medtecApi.conquistas.list({
    page, per_page: 10,
    'q[nome_aluno_cont]': filters.nome || undefined,
    'q[titulo_cont]': filters.titulo || undefined,
    'q[c_categoria_conquista_aluno_id_eq]': filters.categoriaId || undefined,
    'q[escola_g_cidade_id_eq]': filters.cidadeId || undefined,
    'q[n_status_noticia_slug_eq]': filters.status || undefined,
  }, signal), [page, filters]);
  const { items, pagination, loading, error, reload } = useApiList<CConquistaAluno>(read);
  const categorias = useApiList<CCategoriaConquista>(readCategorias);
  const escolas = useEscolaOptions(form?.cidadeId ?? '');
  const action = useAdminAction();
  const blocked = action.busy || form !== null || deleting !== null;

  function updateFilters(next: Partial<typeof filters>) {
    setFilters(current => ({ ...current, ...next }));
    setPage(1);
  }

  async function edit(item: CConquistaAluno) {
    await action.run(async () => {
      const value = await medtecApi.conquistas.get(item.id);
      setForm({
        ...EMPTY_FORM, id: value.id, nomeAluno: value.nome_aluno, titulo: value.titulo, relato: value.relato,
        categoriaId: String(value.c_categoria_conquista_aluno_id), escolaId: String(value.escola_id),
        imagemModo: value.imagem_url ? 'link' : 'upload', imagemUrl: value.imagem_url ?? '', imagemAtual: getConquistaImageSrc(value),
      });
    });
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    if (!form) return;
    const file = event.target.files?.[0] ?? null;
    const problem = file ? validateConquistaImage(file) : null;
    action.setError(problem);
    if (problem) event.target.value = '';
    setForm({ ...form, imagem: problem ? null : file });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!form.nomeAluno.trim() || !form.titulo.trim() || !form.relato.trim() || !form.categoriaId || !form.escolaId) {
      action.setError('Informe aluno, título, relato, categoria e escola.');
      return;
    }
    const imagemUrl = form.imagemModo === 'link' ? form.imagemUrl.trim() : '';
    if (imagemUrl && !isHttpsUrl(imagemUrl)) { action.setError('Informe um link HTTPS válido para a imagem.'); return; }
    const data = {
      nome_aluno: form.nomeAluno.trim(), titulo: form.titulo.trim(), relato: form.relato.trim(),
      c_categoria_conquista_aluno_id: Number(form.categoriaId), escola_id: Number(form.escolaId),
      imagem: form.imagemModo === 'upload' && form.imagem ? form.imagem : undefined,
      imagem_url: imagemUrl || undefined,
    };
    const saved = await action.run(async () => {
      if (form.id) await medtecApi.conquistas.update(form.id, data);
      else await medtecApi.conquistas.create(data);
      return 'Conquista salva com sucesso.';
    });
    if (saved) { setForm(null); reload(); }
  }

  async function moderate(item: CConquistaAluno, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.conquistas[operation](item.id);
      return operation === 'publicar' ? 'Conquista publicada.' : operation === 'reprovar' ? 'Conquista reprovada.' : 'Conquista retirada do site.';
    });
    if (done) reload();
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await medtecApi.conquistas.delete(deleting.id);
      return 'Conquista excluída.';
    });
    setDeleting(null);
    if (removed) {
      if (items.length === 1 && page > 1) setPage(page - 1);
      else reload();
    }
  }

  const categoriaOptions = categorias.items.filter(item => item.ativo || String(item.id) === form?.categoriaId);

  return (
    <section aria-labelledby={`${id}-heading`} className={panelClass}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Conquistas</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">O site mostra só as publicadas. A cidade vem da escola.</p>
        </div>
        <button type="button" disabled={blocked || loading} className={buttonClass} onClick={() => {
          setForm(EMPTY_FORM); action.setError(null); action.setSuccess(null);
        }}>Nova conquista</button>
      </header>

      <form aria-label="Filtrar conquistas" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" onSubmit={event => {
        event.preventDefault(); updateFilters({ nome: inputs.nome.trim(), titulo: inputs.titulo.trim() });
      }}>
        <input name="conquista-busca-nome" aria-label="Buscar por aluno" placeholder="Buscar por aluno" value={inputs.nome} className={inputClass} onChange={event => setInputs({ ...inputs, nome: event.target.value })} />
        <input name="conquista-busca-titulo" aria-label="Buscar por título" placeholder="Buscar por título" value={inputs.titulo} className={inputClass} onChange={event => setInputs({ ...inputs, titulo: event.target.value })} />
        <select name="conquista-filtro-categoria" aria-label="Filtrar por categoria" value={filters.categoriaId} className={inputClass} onChange={event => updateFilters({ categoriaId: event.target.value })}>
          <option value="">Todas as categorias</option>
          {categorias.items.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        <select name="conquista-filtro-cidade" aria-label="Filtrar por município" value={filters.cidadeId} className={inputClass} onChange={event => updateFilters({ cidadeId: event.target.value })}>
          <option value="">Todos os municípios</option>
          {escolas.cidades.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        <select name="conquista-filtro-status" aria-label="Filtrar por situação" value={filters.status} className={inputClass} onChange={event => updateFilters({ status: event.target.value as ModeracaoStatus | '' })}>
          <option value="">Todas as situações</option>
          <option value="aguardando">Aguardando</option>
          <option value="publicada">Publicada</option>
          <option value="reprovada">Reprovada</option>
        </select>
        <button type="submit" className={buttonClass}>Buscar</button>
      </form>

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando conquistas...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {renderFeedback(action.error, action.success)}

      {form && <form onSubmit={save} aria-label={form.id ? 'Editar conquista' : 'Criar conquista'} className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4">
        <p className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200">
          A API não registra consentimento. Antes de salvar, confirme a autorização de divulgação do nome e da imagem do estudante e guarde o termo fora deste sistema.
        </p>
        <fieldset disabled={action.busy} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-aluno`} className={labelClass}>Nome autorizado do aluno (obrigatório)</label>
              <input id={`${id}-aluno`} name="conquista-nome-aluno" required value={form.nomeAluno} className={inputClass} onChange={event => setForm({ ...form, nomeAluno: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-titulo`} className={labelClass}>Título (obrigatório)</label>
              <input id={`${id}-titulo`} name="conquista-titulo" required value={form.titulo} className={inputClass} onChange={event => setForm({ ...form, titulo: event.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-relato`} className={labelClass}>Relato completo (obrigatório)</label>
            <textarea id={`${id}-relato`} name="conquista-relato" required rows={4} value={form.relato} className={inputClass} onChange={event => setForm({ ...form, relato: event.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-categoria`} className={labelClass}>Categoria (obrigatório)</label>
              <select id={`${id}-categoria`} name="conquista-categoria" required value={form.categoriaId} className={inputClass} onChange={event => setForm({ ...form, categoriaId: event.target.value })}>
                <option value="">Selecione a categoria</option>
                {categoriaOptions.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
              {categorias.error && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{categorias.error}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-cidade`} className={labelClass}>Município (só filtra as escolas)</label>
              <select id={`${id}-cidade`} name="conquista-cidade" value={form.cidadeId} className={inputClass} onChange={event => setForm({ ...form, cidadeId: event.target.value, escolaId: '' })}>
                <option value="">Todos os municípios</option>
                {escolas.cidades.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-escola`} className={labelClass}>Escola (obrigatório)</label>
              <select id={`${id}-escola`} name="conquista-escola" required value={form.escolaId} disabled={escolas.loading} className={inputClass} onChange={event => setForm({ ...form, escolaId: event.target.value })}>
                <option value="">{escolas.loading ? 'Carregando escolas...' : 'Selecione a escola'}</option>
                {escolas.escolas.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
              {escolas.error && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{escolas.error}</p>}
            </div>
          </div>
          <fieldset className="space-y-2">
            <legend className={labelClass}>Imagem (opcional)</legend>
            <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-200">
              <label className="flex items-center gap-2"><input type="radio" name="conquista-imagem-modo" value="upload" checked={form.imagemModo === 'upload'} onChange={() => setForm({ ...form, imagemModo: 'upload' })} /> Enviar arquivo</label>
              <label className="flex items-center gap-2"><input type="radio" name="conquista-imagem-modo" value="link" checked={form.imagemModo === 'link'} onChange={() => setForm({ ...form, imagemModo: 'link', imagem: null })} /> Usar link</label>
            </div>
            {form.imagemModo === 'upload'
              ? <input name="conquista-imagem" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Arquivo da imagem (PNG, JPG ou WEBP, até 5 MB)" className="block text-sm text-slate-700 dark:text-slate-200" onChange={chooseFile} />
              : <input name="conquista-imagem-url" type="url" aria-label="Link da imagem" placeholder="https://..." value={form.imagemUrl} className={inputClass} onChange={event => setForm({ ...form, imagemUrl: event.target.value })} />}
            <p className="text-xs text-slate-600 dark:text-slate-400">PNG, JPG ou WEBP, até 5 MB.</p>
            {form.imagemAtual && <Image unoptimized src={form.imagemAtual} alt="Imagem atual da conquista" width={160} height={90} className="rounded-lg object-cover" />}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClass}>{action.busy ? 'Salvando...' : 'Salvar conquista'}</button>
            <button type="button" className={buttonClass} onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </fieldset>
      </form>}

      {deleting && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        <p>Excluir a conquista <strong className="break-words">{deleting.titulo}</strong>?</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => setDeleting(null)}>Cancelar exclusão</button>
        </div>
      </div>}

      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhuma conquista encontrada.</p>}
      {!loading && !error && items.length > 0 && <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-label="Conquistas cadastradas">
        {items.map(item => <li key={item.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.titulo}</h3>
              {renderStatusBadge(item.status, item.status_nome)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{item.nome_aluno} · {item.categoria_nome} · {item.escola_nome} · {item.cidade_nome}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {renderModerationButtons(item.status, item.titulo, blocked, operation => void moderate(item, operation))}
            <button type="button" disabled={blocked} aria-label={`Editar ${item.titulo}`} className={buttonClass} onClick={() => void edit(item)}>Editar</button>
            <button type="button" disabled={blocked} aria-label={`Excluir ${item.titulo}`} className={buttonClass} onClick={() => setDeleting(item)}>Excluir</button>
          </div>
        </li>)}
      </ul>}
      {!error && renderPagination('Paginação de conquistas', 'conquistas', pagination, page, loading || blocked, setPage)}
    </section>
  );
}
