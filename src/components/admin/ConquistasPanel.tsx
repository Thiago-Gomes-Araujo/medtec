'use client';

import Image from 'next/image';
import { useCallback, useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { medtecApi, type CCategoriaConquista, type CConquistaAluno, type ModeracaoStatus } from '@/lib/api';
import { getConquistaImageSrc, isHttpsUrl, validateConquistaImage } from '@/lib/community-content';
import { formatFileSize } from '@/lib/projetos-content';
import FileButton from './FileButton';
import { notifyAprovacoesPendentes } from './useAprovacoesPendentes';
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
import { usePermissoes } from './usePermissoes';

interface ConquistaForm {
  id?: number;
  nomeAluno: string;
  titulo: string;
  relato: string;
  categoriaId: string;
  cidadeId: string;
  escolaId: string;
  imagem: File | null;
  imagemPreview: string;
  imagemUrl: string;
  imagemUrlOriginal: string;
  imagemAtual: string;
  imagemErro: string | null;
}

const EMPTY_FORM: ConquistaForm = {
  nomeAluno: '', titulo: '', relato: '', categoriaId: '', cidadeId: '', escolaId: '',
  imagem: null, imagemPreview: '', imagemUrl: '', imagemUrlOriginal: '', imagemAtual: '', imagemErro: null,
};
const readCategorias = (signal: AbortSignal) => medtecApi.categoriasConquista.list({ page: 'all' }, signal);

export default function ConquistasPanel() {
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
  const { pode } = usePermissoes();
  const blocked = action.busy || form !== null || deleting !== null;
  const imagemPreview = form?.imagemPreview;

  // A prévia do arquivo escolhido é local: a URL é liberada ao trocar a escolha ou fechar o formulário.
  useEffect(() => () => { if (imagemPreview) URL.revokeObjectURL(imagemPreview); }, [imagemPreview]);

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
        imagemUrl: value.imagem_url ?? '', imagemUrlOriginal: value.imagem_url ?? '', imagemAtual: getConquistaImageSrc(value),
      });
    });
  }

  // Arquivo e link são alternativos: escolher um descarta o outro.
  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    if (!form) return;
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = validateConquistaImage(file);
    if (problem) { setForm({ ...form, imagemErro: problem }); return; }
    setForm({ ...form, imagem: file, imagemPreview: URL.createObjectURL(file), imagemUrl: '', imagemErro: null });
  }

  // Desfaz só a escolha ainda não salva: a imagem atual continua na conquista.
  function removeImagemEscolhida() {
    if (!form) return;
    setForm({ ...form, imagem: null, imagemPreview: '', imagemUrl: form.imagemUrlOriginal, imagemErro: null });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!form.nomeAluno.trim() || !form.titulo.trim() || !form.relato.trim() || !form.categoriaId || !form.escolaId) {
      action.setError('Informe aluno, título, relato, categoria e escola.');
      return;
    }
    const imagemUrl = form.imagemUrl.trim();
    if (imagemUrl && !isHttpsUrl(imagemUrl)) { action.setError('Informe um link HTTPS válido para a imagem.'); return; }
    const data = {
      nome_aluno: form.nomeAluno.trim(), titulo: form.titulo.trim(), relato: form.relato.trim(),
      c_categoria_conquista_aluno_id: Number(form.categoriaId), escola_id: Number(form.escolaId),
      imagem: form.imagem ?? undefined,
      // O contrato não prevê remover a imagem salva: o link só vai quando há um novo.
      imagem_url: imagemUrl && imagemUrl !== form.imagemUrlOriginal ? imagemUrl : undefined,
    };
    const saved = await action.run(async () => {
      if (form.id) await medtecApi.conquistas.update(form.id, data);
      else await medtecApi.conquistas.create(data);
      return 'Conquista salva com sucesso.';
    });
    if (saved) { setForm(null); reload(); notifyAprovacoesPendentes(); }
  }

  async function moderate(item: CConquistaAluno, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.conquistas[operation](item.id);
      return operation === 'publicar' ? 'Conquista publicada.' : operation === 'reprovar' ? 'Conquista reprovada.' : 'Conquista retirada do site.';
    });
    if (done) { reload(); notifyAprovacoesPendentes(); }
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await medtecApi.conquistas.delete(deleting.id);
      return 'Conquista excluída.';
    });
    setDeleting(null);
    if (removed) {
      notifyAprovacoesPendentes();
      if (items.length === 1 && page > 1) setPage(page - 1);
      else reload();
    }
  }

  const linkEscolhido = form?.imagemUrl.trim() ?? '';
  const linkMudou = !!form && !form.imagem && linkEscolhido !== form.imagemUrlOriginal;
  const novaImagem = form?.imagemPreview || (linkMudou && isHttpsUrl(linkEscolhido) ? linkEscolhido : '');
  const categoriaOptions = categorias.items.filter(item => item.ativo || String(item.id) === form?.categoriaId);

  return (
    <section aria-labelledby={`${id}-heading`} className={panelClass}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Conquistas</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">O site mostra só as publicadas. A cidade vem da escola.</p>
        </div>
        {pode('c_conquistas_aluno', 'create') && <button type="button" disabled={blocked || loading} className={buttonClass} onClick={() => {
          setForm(EMPTY_FORM); action.setError(null); action.setSuccess(null);
        }}>Nova conquista</button>}
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
            <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
              <FileButton name="conquista-imagem" accept="image/png,image/jpeg,image/webp" onChange={chooseFile}>Escolher imagem</FileButton>
              <input name="conquista-imagem-url" type="url" aria-label="Link da imagem" placeholder="Ou cole um link https://..." value={form.imagemUrl} className={inputClass} onChange={event => setForm({ ...form, imagem: null, imagemPreview: '', imagemUrl: event.target.value, imagemErro: null })} />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">PNG, JPG ou WEBP, até 5 MB, ou link HTTPS.</p>
            {form.imagemErro && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{form.imagemErro}</p>}
            {linkEscolhido && !isHttpsUrl(linkEscolhido) && <p className="text-xs text-red-700 dark:text-red-300">A prévia só aparece com um link HTTPS válido.</p>}
            {novaImagem
              ? <figure className="space-y-1">
                <Image unoptimized src={novaImagem} alt="Prévia da nova imagem" width={160} height={90} className="rounded-lg object-cover" />
                <figcaption className="break-all text-xs text-slate-600 dark:text-slate-400">{form.imagem ? `${form.imagem.name} (${formatFileSize(form.imagem.size)}). ` : ''}Prévia: a imagem só muda ao salvar a conquista.</figcaption>
              </figure>
              : form.imagemAtual && <Image unoptimized src={form.imagemAtual} alt="Imagem atual da conquista" width={160} height={90} className="rounded-lg object-cover" />}
            {(form.imagem || linkMudou) && <button type="button" className={buttonClass} onClick={removeImagemEscolhida}>Remover escolha</button>}
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
            {renderModerationButtons(item.status, item.titulo, blocked, operation => void moderate(item, operation), acao => pode('c_conquistas_aluno', acao))}
            {pode('c_conquistas_aluno', 'update') && <button type="button" disabled={blocked} aria-label={`Editar ${item.titulo}`} className={buttonClass} onClick={() => void edit(item)}>Editar</button>}
            {pode('c_conquistas_aluno', 'destroy') && <button type="button" disabled={blocked} aria-label={`Excluir ${item.titulo}`} className={buttonClass} onClick={() => setDeleting(item)}>Excluir</button>}
          </div>
        </li>)}
      </ul>}
      {!error && renderPagination('Paginação de conquistas', 'conquistas', pagination, page, loading || blocked, setPage)}
    </section>
  );
}
