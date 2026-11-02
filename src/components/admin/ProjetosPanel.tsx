'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { getMediaUrl, medtecApi, type ModeracaoStatus, type PjAnexo, type PjMembro, type PjProjeto, type PjProjetoMembro, type PjTema } from '@/lib/api';
import { isHttpsUrl, validateConquistaImage } from '@/lib/community-content';
import { diffProjetoMembros, formatFileSize, getProjetoImageSrc, hasMembroDuplicado, PROJETO_ANEXO_ACCEPT, validateProjetoAnexo, type MembroDraft } from '@/lib/projetos-content';
import FileButton from './FileButton';
import ProjetoMembrosEditor from './ProjetoMembrosEditor';
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
import { notifyProjetosPendentes } from './useProjetosPendentes';

interface ProjetoForm {
  id?: number;
  titulo: string;
  relato: string;
  temaId: string;
  cidadeId: string;
  escolaId: string;
  imagem: File | null;
  imagemPreview: string;
  imagemUrl: string;
  imagemUrlOriginal: string;
  imagemAtual: string;
  anexosAtuais: PjAnexo[];
  anexosNovos: File[];
  membros: MembroDraft[];
  membrosOriginais: PjProjetoMembro[];
  capaErro: string | null;
  anexosErro: string | null;
}

const EMPTY_FORM: ProjetoForm = {
  titulo: '', relato: '', temaId: '', cidadeId: '', escolaId: '', imagem: null, imagemPreview: '', imagemUrl: '',
  imagemUrlOriginal: '', imagemAtual: '', anexosAtuais: [], anexosNovos: [], membros: [], membrosOriginais: [], capaErro: null, anexosErro: null,
};
const readTemas = (signal: AbortSignal) => medtecApi.temasProjeto.list({ page: 'all' }, signal);
const readMembros = (signal: AbortSignal) => medtecApi.membrosProjeto.list({ page: 'all' }, signal);

export default function ProjetosPanel({ startNew = false, membroId = '' }: { startNew?: boolean; membroId?: string } = {}) {
  const id = useId();
  const [page, setPage] = useState(1);
  const [titulo, setTitulo] = useState('');
  const [filters, setFilters] = useState({ titulo: '', temaId: '', cidadeId: '', escolaId: '', membroId, status: '' as ModeracaoStatus | '' });
  const [form, setForm] = useState<ProjetoForm | null>(startNew ? EMPTY_FORM : null);
  const [deleting, setDeleting] = useState<PjProjeto | null>(null);
  const [removingAnexo, setRemovingAnexo] = useState<PjAnexo | null>(null);

  const read = useCallback((signal: AbortSignal) => medtecApi.projetos.list({
    page, per_page: 10,
    'q[titulo_cont]': filters.titulo || undefined,
    'q[pj_tema_id_eq]': filters.temaId || undefined,
    'q[escola_id_eq]': filters.escolaId || undefined,
    'q[escola_g_cidade_id_eq]': filters.cidadeId || undefined,
    'q[pj_membros_id_eq]': filters.membroId || undefined,
    'q[n_status_noticia_slug_eq]': filters.status || undefined,
  }, signal), [page, filters]);
  const { items, pagination, loading, error, reload } = useApiList<PjProjeto>(read);
  const temas = useApiList<PjTema>(readTemas);
  const membros = useApiList<PjMembro>(readMembros);
  const escolasFiltro = useEscolaOptions(filters.cidadeId);
  const escolasForm = useEscolaOptions(form?.cidadeId ?? '');
  const action = useAdminAction();
  const blocked = action.busy || form !== null || deleting !== null;
  const imagemPreview = form?.imagemPreview;

  // A prévia do arquivo escolhido é local: a URL é liberada ao trocar a escolha ou fechar o formulário.
  useEffect(() => () => { if (imagemPreview) URL.revokeObjectURL(imagemPreview); }, [imagemPreview]);

  function updateFilters(next: Partial<typeof filters>) {
    setFilters(current => ({ ...current, ...next }));
    setPage(1);
  }

  async function edit(item: PjProjeto) {
    await action.run(async () => {
      const value = await medtecApi.projetos.get(item.id);
      setForm({
        ...EMPTY_FORM, id: value.id, titulo: value.titulo, relato: value.relato, temaId: String(value.pj_tema_id), escolaId: String(value.escola_id),
        imagemUrl: value.imagem_url ?? '', imagemUrlOriginal: value.imagem_url ?? '', imagemAtual: getProjetoImageSrc(value),
        anexosAtuais: value.anexos, membrosOriginais: value.membros,
        membros: value.membros.map(({ pj_membro_id, nome, cpf, funcao }) => ({ pj_membro_id, nome, cpf, funcao })),
      });
    });
  }

  // Arquivo e link são alternativos: escolher um descarta o outro.
  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    if (!form) return;
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = validateConquistaImage(file);
    if (problem) { setForm({ ...form, capaErro: problem }); return; }
    setForm({ ...form, imagem: file, imagemPreview: URL.createObjectURL(file), imagemUrl: '', capaErro: null });
  }

  // Desfaz só a escolha ainda não salva: a capa atual continua no projeto.
  function removeCapaEscolhida() {
    if (!form) return;
    setForm({ ...form, imagem: null, imagemPreview: '', imagemUrl: form.imagemUrlOriginal, capaErro: null });
  }

  function chooseAnexos(event: ChangeEvent<HTMLInputElement>) {
    if (!form) return;
    const files = Array.from(event.target.files ?? []);
    const problems = files.map(validateProjetoAnexo).filter(Boolean);
    const known = (file: File) => form.anexosNovos.some(item => item.name === file.name && item.size === file.size);
    setForm({ ...form, anexosErro: problems.length > 0 ? problems.join(' ') : null, anexosNovos: [...form.anexosNovos, ...files.filter(file => !validateProjetoAnexo(file) && !known(file))] });
    event.target.value = '';
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!form.titulo.trim() || !form.relato.trim() || !form.temaId || !form.escolaId) {
      action.setError('Informe título, relato, tema e escola.');
      return;
    }
    const imagemUrl = form.imagemUrl.trim();
    if (imagemUrl && !isHttpsUrl(imagemUrl)) { action.setError('Informe um link HTTPS válido para a capa.'); return; }
    if (form.membros.some(item => !item.funcao.trim())) { action.setError('Informe a função de cada membro.'); return; }
    if (hasMembroDuplicado(form.membros)) { action.setError('O mesmo membro foi informado mais de uma vez.'); return; }
    // O link só vai quando muda; escolher um arquivo limpa o link antigo.
    const trocaLink = imagemUrl !== form.imagemUrlOriginal;
    const data = {
      titulo: form.titulo.trim(), relato: form.relato.trim(), pj_tema_id: Number(form.temaId), escola_id: Number(form.escolaId),
      imagem: form.imagem ?? undefined,
      imagem_url: trocaLink ? imagemUrl : undefined,
      anexos: form.anexosNovos,
      pj_projeto_membros_attributes: diffProjetoMembros(form.membrosOriginais, form.membros),
    };
    const saved = await action.run(async () => {
      const value = form.id ? await medtecApi.projetos.update(form.id, data) : await medtecApi.projetos.create(data);
      return `Projeto salvo. Situação: ${value.status_nome}.`;
    });
    if (saved) { setForm(null); reload(); notifyProjetosPendentes(); }
  }

  async function removeAnexo() {
    if (!form?.id || !removingAnexo) return;
    const anexo = removingAnexo;
    const projetoId = form.id;
    const removed = await action.run(async () => {
      await medtecApi.projetos.removerAnexo(projetoId, anexo.id);
      return `Anexo ${anexo.nome} removido.`;
    });
    setRemovingAnexo(null);
    if (removed) setForm(current => current && { ...current, anexosAtuais: current.anexosAtuais.filter(item => item.id !== anexo.id) });
  }

  async function moderate(item: PjProjeto, operation: ModeracaoAction) {
    const done = await action.run(async () => {
      await medtecApi.projetos[operation](item.id);
      return operation === 'publicar' ? 'Projeto publicado.' : operation === 'reprovar' ? 'Projeto reprovado.' : 'Projeto retirado do site.';
    });
    if (done) { reload(); notifyProjetosPendentes(); }
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await medtecApi.projetos.delete(deleting.id);
      return 'Projeto excluído.';
    });
    setDeleting(null);
    if (removed) {
      notifyProjetosPendentes();
      if (items.length === 1 && page > 1) setPage(page - 1);
      else reload();
    }
  }

  const temaOptions = temas.items.filter(item => item.ativo || String(item.id) === form?.temaId);
  const linkEscolhido = form?.imagemUrl.trim() ?? '';
  const linkMudou = !!form && !form.imagem && linkEscolhido !== form.imagemUrlOriginal;
  const novaCapa = form?.imagemPreview || (linkMudou && isHttpsUrl(linkEscolhido) ? linkEscolhido : '');

  return (
    <section aria-labelledby={`${id}-heading`} className={panelClass}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Projetos pedagógicos</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">O site mostra só os publicados. A cidade vem da escola.</p>
        </div>
        <button type="button" disabled={blocked || loading} className={buttonClass} onClick={() => {
          setForm(EMPTY_FORM); action.setError(null); action.setSuccess(null);
        }}>Novo projeto</button>
      </header>

      <form aria-label="Filtrar projetos" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={event => {
        event.preventDefault(); updateFilters({ titulo: titulo.trim() });
      }}>
        <input name="projeto-busca-titulo" aria-label="Buscar por título" placeholder="Buscar por título" value={titulo} className={inputClass} onChange={event => setTitulo(event.target.value)} />
        <select name="projeto-filtro-tema" aria-label="Filtrar por tema" value={filters.temaId} className={inputClass} onChange={event => updateFilters({ temaId: event.target.value })}>
          <option value="">Todos os temas</option>
          {temas.items.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        <select name="projeto-filtro-cidade" aria-label="Filtrar por município" value={filters.cidadeId} className={inputClass} onChange={event => updateFilters({ cidadeId: event.target.value, escolaId: '' })}>
          <option value="">Todos os municípios</option>
          {escolasFiltro.cidades.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        <select name="projeto-filtro-escola" aria-label="Filtrar por escola" value={filters.escolaId} className={inputClass} onChange={event => updateFilters({ escolaId: event.target.value })}>
          <option value="">Todas as escolas</option>
          {escolasFiltro.escolas.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        <select name="projeto-filtro-membro" aria-label="Filtrar por membro" value={filters.membroId} className={inputClass} onChange={event => updateFilters({ membroId: event.target.value })}>
          <option value="">Todos os membros</option>
          {membros.items.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        <select name="projeto-filtro-status" aria-label="Filtrar por situação" value={filters.status} className={inputClass} onChange={event => updateFilters({ status: event.target.value as ModeracaoStatus | '' })}>
          <option value="">Todas as situações</option>
          <option value="aguardando">Aguardando</option>
          <option value="publicada">Publicada</option>
          <option value="reprovada">Reprovada</option>
        </select>
        <button type="submit" className={buttonClass}>Buscar</button>
      </form>

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando projetos...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {renderFeedback(action.error, action.success)}

      {form && <form onSubmit={save} aria-label={form.id ? 'Editar projeto' : 'Criar projeto'} className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4">
        <div role="note" className="space-y-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200">
          <p>O site mostra o nome e a função dos membros. A API não registra consentimento: confirme a autorização de divulgação e guarde o termo fora deste sistema.</p>
          {!form.id && <p className="font-bold">Pelo contrato da API, Gestor e Administrador publicam no site ao salvar, sem passar pela aprovação.</p>}
        </div>
        <fieldset disabled={action.busy} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-titulo`} className={labelClass}>Título (obrigatório)</label>
              <input id={`${id}-titulo`} name="projeto-titulo" required value={form.titulo} className={inputClass} onChange={event => setForm({ ...form, titulo: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-tema`} className={labelClass}>Tema (obrigatório)</label>
              <select id={`${id}-tema`} name="projeto-tema" required value={form.temaId} className={inputClass} onChange={event => setForm({ ...form, temaId: event.target.value })}>
                <option value="">Selecione o tema</option>
                {temaOptions.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
              {temas.error && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{temas.error}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-relato`} className={labelClass}>Relato do projeto (obrigatório)</label>
            <textarea id={`${id}-relato`} name="projeto-relato" required rows={5} value={form.relato} className={inputClass} onChange={event => setForm({ ...form, relato: event.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-cidade`} className={labelClass}>Município (só filtra as escolas)</label>
              <select id={`${id}-cidade`} name="projeto-cidade" value={form.cidadeId} className={inputClass} onChange={event => setForm({ ...form, cidadeId: event.target.value, escolaId: '' })}>
                <option value="">Todos os municípios</option>
                {escolasForm.cidades.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${id}-escola`} className={labelClass}>Escola (obrigatório)</label>
              <select id={`${id}-escola`} name="projeto-escola" required value={form.escolaId} disabled={escolasForm.loading} className={inputClass} onChange={event => setForm({ ...form, escolaId: event.target.value })}>
                <option value="">{escolasForm.loading ? 'Carregando escolas...' : 'Selecione a escola'}</option>
                {escolasForm.escolas.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
              {escolasForm.error && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{escolasForm.error}</p>}
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className={labelClass}>Capa (opcional)</legend>
            <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
              <FileButton name="projeto-imagem" accept="image/png,image/jpeg,image/webp" onChange={chooseImage}>Escolher imagem</FileButton>
              <input name="projeto-imagem-url" type="url" aria-label="Link da capa" placeholder="Ou cole um link https://..." value={form.imagemUrl} className={inputClass} onChange={event => setForm({ ...form, imagem: null, imagemPreview: '', imagemUrl: event.target.value, capaErro: null })} />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">PNG, JPG ou WEBP, até 5 MB, ou link HTTPS.</p>
            {form.capaErro && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{form.capaErro}</p>}
            {linkEscolhido && !isHttpsUrl(linkEscolhido) && <p className="text-xs text-red-700 dark:text-red-300">A prévia só aparece com um link HTTPS válido.</p>}
            {novaCapa
              ? <figure className="space-y-1">
                <Image unoptimized src={novaCapa} alt="Prévia da nova capa" width={160} height={90} className="rounded-lg object-cover" />
                <figcaption className="break-all text-xs text-slate-600 dark:text-slate-400">{form.imagem ? `${form.imagem.name} (${formatFileSize(form.imagem.size)}). ` : ''}Prévia: a capa só muda ao salvar o projeto.</figcaption>
              </figure>
              : form.imagemAtual && <Image unoptimized src={form.imagemAtual} alt="Capa atual do projeto" width={160} height={90} className="rounded-lg object-cover" />}
            {(form.imagem || linkMudou) && <button type="button" className={buttonClass} onClick={removeCapaEscolhida}>Remover escolha</button>}
          </fieldset>

          <fieldset className="space-y-2">
            <legend className={labelClass}>Anexos (opcional)</legend>
            <div>
              <FileButton name="projeto-anexos" multiple accept={PROJETO_ANEXO_ACCEPT} onChange={chooseAnexos}>Adicionar arquivos</FileButton>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">PDF, Word, Excel, PowerPoint, PNG, JPG ou WEBP, até 10 MB cada.{form.id ? ' Os novos se somam aos atuais.' : ''}</p>
            {form.anexosErro && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{form.anexosErro}</p>}
            {form.anexosAtuais.length > 0 && <ul aria-label="Anexos atuais" className="divide-y divide-slate-200 dark:divide-slate-800">
              {form.anexosAtuais.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <a href={getMediaUrl(item.url)} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all text-slate-900 underline dark:text-white">{item.nome} ({formatFileSize(item.tamanho)})</a>
                <button type="button" aria-label={`Remover anexo ${item.nome}`} className={buttonClass} onClick={() => setRemovingAnexo(item)}>Remover</button>
              </li>)}
            </ul>}
            {removingAnexo && <div role="group" aria-label="Confirmar remoção do anexo" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
              <p>Remover o anexo <strong className="break-all">{removingAnexo.nome}</strong>? O arquivo é apagado na hora, mesmo sem salvar o projeto.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={buttonClass} onClick={() => void removeAnexo()}>Confirmar remoção</button>
                <button type="button" className={buttonClass} onClick={() => setRemovingAnexo(null)}>Manter anexo</button>
              </div>
            </div>}
            {form.anexosNovos.length > 0 && <ul aria-label="Anexos a enviar" className="divide-y divide-slate-200 dark:divide-slate-800">
              {form.anexosNovos.map(item => <li key={`${item.name}-${item.size}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="min-w-0 break-all">{item.name} ({formatFileSize(item.size)})</span>
                <button type="button" aria-label={`Retirar ${item.name}`} className={buttonClass} onClick={() => setForm({ ...form, anexosNovos: form.anexosNovos.filter(entry => entry !== item) })}>Retirar</button>
              </li>)}
            </ul>}
          </fieldset>

          <ProjetoMembrosEditor value={form.membros} onChange={next => setForm(current => current && { ...current, membros: next })} />

          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClass}>{action.busy ? 'Salvando...' : 'Salvar projeto'}</button>
            <button type="button" className={buttonClass} onClick={() => { setForm(null); setRemovingAnexo(null); }}>Cancelar</button>
          </div>
        </fieldset>
      </form>}

      {deleting && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        <p>Excluir o projeto <strong className="break-words">{deleting.titulo}</strong>?</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => setDeleting(null)}>Cancelar exclusão</button>
        </div>
      </div>}

      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhum projeto encontrado.</p>}
      {!loading && !error && items.length > 0 && <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-label="Projetos cadastrados">
        {items.map(item => <li key={item.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{item.titulo}</h3>
              {renderStatusBadge(item.status, item.status_nome)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{item.tema_nome} · {item.escola_nome} · {item.cidade_nome}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {item.membros.length} {item.membros.length === 1 ? 'membro' : 'membros'} · {item.anexos.length} {item.anexos.length === 1 ? 'anexo' : 'anexos'}
              {item.autor_nome ? ` · Autor: ${item.autor_nome}` : ''}{item.avaliado_por_nome ? ` · Avaliado por: ${item.avaliado_por_nome}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {renderModerationButtons(item.status, item.titulo, blocked, operation => void moderate(item, operation))}
            {item.status === 'publicada' && <Link href={`/projetos/${item.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${item.titulo} no site`} className={buttonClass}>Ver no site</Link>}
            <button type="button" disabled={blocked} aria-label={`Editar ${item.titulo}`} className={buttonClass} onClick={() => void edit(item)}>Editar</button>
            <button type="button" disabled={blocked} aria-label={`Excluir ${item.titulo}`} className={buttonClass} onClick={() => setDeleting(item)}>Excluir</button>
          </div>
        </li>)}
      </ul>}
      {!error && renderPagination('Paginação de projetos', 'projetos', pagination, page, loading || blocked, setPage)}
    </section>
  );
}
