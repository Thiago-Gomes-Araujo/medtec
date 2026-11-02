'use client';

import Image from 'next/image';
import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { medtecApi, type BBanner } from '@/lib/api';
import { isHttpsUrl, validateConquistaImage } from '@/lib/community-content';
import { buttonClass, inputClass, panelClass, renderFeedback, useAdminAction, useApiList } from './communityAdminUi';

interface BannerForm {
  id?: number;
  numero?: number;
  atual?: string;
  modo: 'upload' | 'link';
  imagem: File | null;
  imagemUrl: string;
}

const NEW_FORM: BannerForm = { modo: 'upload', imagem: null, imagemUrl: '' };
const readBanners = (signal: AbortSignal) => medtecApi.banners.list({ page: 'all' }, signal);
// A API já devolve URL completa: não passa por getMediaUrl.
const imageOf = (banner: BBanner) => banner.imagem || banner.imagem_url || '';

export default function BannersPanel() {
  const id = useId();
  const { items, pagination, loading, error, reload } = useApiList<BBanner>(readBanners);
  const [form, setForm] = useState<BannerForm | null>(null);
  const [deleting, setDeleting] = useState<{ banner: BBanner; numero: number } | null>(null);
  const action = useAdminAction();
  const blocked = action.busy || form !== null || deleting !== null;

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
    const imagemUrl = form.imagemUrl.trim();
    if (form.modo === 'upload' && !form.imagem) { action.setError('Selecione a imagem do banner.'); return; }
    if (form.modo === 'link' && !isHttpsUrl(imagemUrl)) { action.setError('Informe um link HTTPS válido para a imagem.'); return; }
    const data = form.modo === 'upload' ? { imagem: form.imagem! } : { imagem_url: imagemUrl };
    const saved = await action.run(async () => {
      if (form.id) await medtecApi.banners.update(form.id, data);
      else await medtecApi.banners.create(data);
      return form.id ? 'Imagem do banner trocada.' : 'Banner cadastrado.';
    });
    if (saved) { setForm(null); reload(); }
  }

  async function remove() {
    if (!deleting) return;
    const removed = await action.run(async () => {
      await medtecApi.banners.delete(deleting.banner.id);
      return 'Banner excluído.';
    });
    setDeleting(null);
    if (removed) reload();
  }

  return (
    <section aria-labelledby={`${id}-heading`} className={panelClass}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-heading`} className="text-base font-bold text-slate-900 dark:text-white">Banners da página inicial</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">O carrossel mostra todos os banners, na ordem do cadastro. Use artes largas; o texto fica desenhado na imagem.</p>
        </div>
        <button type="button" disabled={blocked || loading} className={buttonClass} onClick={() => {
          setForm(NEW_FORM); action.setError(null); action.setSuccess(null);
        }}>Novo banner</button>
      </header>

      {loading && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Carregando banners...</p>}
      {error && <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
        <p>{error}</p>
        <button type="button" disabled={loading} className={buttonClass} onClick={reload}>Tentar novamente</button>
      </div>}
      {renderFeedback(action.error, action.success)}

      {form && <form onSubmit={save} aria-label={form.id ? `Trocar imagem do banner ${form.numero}` : 'Cadastrar banner'} className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4">
        {form.id && <p role="note" className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-xs font-bold text-amber-900 dark:text-amber-200">A nova imagem substitui a anterior, que não pode ser recuperada.</p>}
        {form.atual && <Image unoptimized src={form.atual} alt={`Imagem atual do banner ${form.numero}`} width={320} height={100} className="rounded-lg object-cover" />}
        <fieldset disabled={action.busy} className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-200">
            <label className="flex items-center gap-2"><input type="radio" name="banner-modo" value="upload" checked={form.modo === 'upload'} onChange={() => setForm({ ...form, modo: 'upload' })} /> Enviar arquivo</label>
            <label className="flex items-center gap-2"><input type="radio" name="banner-modo" value="link" checked={form.modo === 'link'} onChange={() => setForm({ ...form, modo: 'link', imagem: null })} /> Usar link</label>
          </div>
          {form.modo === 'upload'
            ? <input name="banner-imagem" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Arquivo do banner (PNG, JPG ou WEBP, até 5 MB)" className="block text-sm text-slate-700 dark:text-slate-200" onChange={chooseFile} />
            : <input name="banner-imagem-url" type="url" aria-label="Link da imagem do banner" placeholder="https://..." value={form.imagemUrl} className={inputClass} onChange={event => setForm({ ...form, imagemUrl: event.target.value })} />}
          <p className="text-xs text-slate-600 dark:text-slate-400">PNG, JPG ou WEBP, até 5 MB, ou link HTTPS.</p>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClass}>{action.busy ? 'Salvando...' : form.id ? 'Trocar imagem' : 'Salvar banner'}</button>
            <button type="button" className={buttonClass} onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </fieldset>
      </form>}

      {deleting && <div role="group" aria-label="Confirmar exclusão" className="space-y-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        <p>Excluir o banner {deleting.numero}? Ele sai do site.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void remove()}>Confirmar exclusão</button>
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => setDeleting(null)}>Cancelar exclusão</button>
        </div>
      </div>}

      {!loading && !error && pagination && items.length === 0 && <p className="py-6 text-sm text-slate-600 dark:text-slate-400">Nenhum banner cadastrado. Sem banners, a home mostra só o topo institucional.</p>}
      {!loading && !error && items.length > 0 && <ul aria-label="Banners cadastrados" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => {
          const numero = index + 1;
          return <li key={item.id} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <Image unoptimized src={imageOf(item)} alt={`Banner ${numero}`} width={640} height={200} className="aspect-[16/5] w-full bg-slate-100 object-contain dark:bg-slate-900" />
            <div className="flex flex-wrap items-center justify-between gap-2 p-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Banner {numero}</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={blocked} aria-label={`Trocar imagem do banner ${numero}`} className={buttonClass} onClick={() => {
                  setForm({ ...NEW_FORM, id: item.id, numero, atual: imageOf(item) }); action.setError(null); action.setSuccess(null);
                }}>Trocar imagem</button>
                <button type="button" disabled={blocked} aria-label={`Excluir banner ${numero}`} className={buttonClass} onClick={() => {
                  setDeleting({ banner: item, numero }); action.setError(null); action.setSuccess(null);
                }}>Excluir</button>
              </div>
            </div>
          </li>;
        })}
      </ul>}
    </section>
  );
}
