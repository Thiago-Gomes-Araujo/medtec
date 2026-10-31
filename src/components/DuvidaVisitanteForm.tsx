'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ApiError, medtecApi } from '@/lib/api';

const EMPTY_FORM = { nome: '', email: '', telefone: '', descricao: '' };
type Field = keyof typeof EMPTY_FORM;
const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071324] px-3 py-2 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-400';

export default function DuvidaVisitanteForm() {
  const id = useId();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(false);
  const lifecycle = useRef(0);
  const errorSummary = useRef<HTMLDivElement>(null);
  const focusSummary = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; lifecycle.current += 1; };
  }, []);

  useEffect(() => {
    if (focusSummary.current && (error || Object.values(errors).some(Boolean))) {
      errorSummary.current?.focus();
      focusSummary.current = false;
    }
  }, [error, errors]);

  function change(field: Field, value: string) {
    setValues(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
    setServerErrors([]); setError(null); setSuccess(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !mounted.current) return;
    const invalid: Partial<Record<Field, string>> = {};
    if (!values.nome.trim()) invalid.nome = 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) invalid.email = 'Informe um e-mail válido.';
    if (!values.descricao.trim()) invalid.descricao = 'Descreva sua dúvida.';
    focusSummary.current = Object.keys(invalid).length > 0;
    setErrors(invalid); setServerErrors([]); setError(null); setSuccess(null);
    if (Object.keys(invalid).length) return;
    const generation = lifecycle.current;
    const isCurrent = () => mounted.current && lifecycle.current === generation;
    lock.current = true; setPending(true);
    try {
      const response = await medtecApi.duvidasPublicas.enviarVisitante({
        nome: values.nome.trim(), email: values.email.trim(), telefone: values.telefone.trim() || undefined,
        descricao: values.descricao.trim(),
      });
      if (isCurrent()) { setSuccess(response.message); setValues(EMPTY_FORM); }
    } catch (cause) {
      if (!isCurrent()) return;
      focusSummary.current = true;
      if (cause instanceof ApiError && cause.status === 429) {
        setError('Muitos envios. Aguarde um minuto.');
      } else if (cause instanceof ApiError && cause.status === 422) {
        setError('Não foi possível enviar. Confira os dados informados.');
        setServerErrors(cause.errors.filter(message => typeof message === 'string' && !message.startsWith('http_')));
      } else if (cause instanceof ApiError && cause.status === 0) {
        setError('Não foi possível enviar. Verifique sua conexão e tente novamente.');
      } else {
        setError('Não foi possível confirmar o envio. Tente novamente em instantes.');
      }
    } finally {
      lock.current = false;
      if (isCurrent()) setPending(false);
    }
  }

  return <section aria-labelledby={`${id}-heading`} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1E38] p-4 sm:p-6 space-y-5">
    <header className="space-y-2">
      <h2 id={`${id}-heading`} className="text-lg font-semibold text-slate-900 dark:text-white">Não encontrou sua dúvida?</h2>
      <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">Envie sua pergunta e seus dados de contato para a equipe do MEDTEC.</p>
    </header>

    {(error || Object.values(errors).some(Boolean)) && <div ref={errorSummary} role="alert" tabIndex={-1}
      className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500">
      <p>{error || 'Confira os campos indicados abaixo.'}</p>
      {serverErrors.length > 0 && <ul className="mt-2 list-disc pl-5 space-y-1">{serverErrors.map((message, index) => <li key={index}>{message}</li>)}</ul>}
    </div>}
    {success && <p role="status" className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</p>}
    {pending && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Enviando dúvida...</p>}

    <form aria-label="Enviar dúvida" aria-busy={pending} noValidate onSubmit={submit}>
      <fieldset disabled={pending} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={`${id}-nome`} className="text-sm font-medium text-slate-700 dark:text-slate-200">Nome (obrigatório)</label>
            <input id={`${id}-nome`} name="nome" autoComplete="name" required value={values.nome} className={inputClass}
              aria-invalid={!!errors.nome} aria-describedby={errors.nome ? `${id}-nome-error` : undefined} onChange={event => change('nome', event.target.value)} />
            {errors.nome && <p id={`${id}-nome-error`} className="text-sm text-red-700 dark:text-red-300">{errors.nome}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-email`} className="text-sm font-medium text-slate-700 dark:text-slate-200">E-mail (obrigatório)</label>
            <input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="email" required value={values.email} className={inputClass}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-error` : undefined} onChange={event => change('email', event.target.value)} />
            {errors.email && <p id={`${id}-email-error`} className="text-sm text-red-700 dark:text-red-300">{errors.email}</p>}
          </div>
        </div>
        <div className="max-w-sm space-y-1.5">
          <label htmlFor={`${id}-telefone`} className="text-sm font-medium text-slate-700 dark:text-slate-200">Telefone (opcional)</label>
          <input id={`${id}-telefone`} name="telefone" type="tel" inputMode="tel" autoComplete="tel" value={values.telefone} className={inputClass} onChange={event => change('telefone', event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-descricao`} className="text-sm font-medium text-slate-700 dark:text-slate-200">Sua dúvida (obrigatória)</label>
          <textarea id={`${id}-descricao`} name="descricao" rows={5} required value={values.descricao} className={inputClass}
            aria-invalid={!!errors.descricao} aria-describedby={errors.descricao ? `${id}-descricao-error` : undefined} onChange={event => change('descricao', event.target.value)} />
          {errors.descricao && <p id={`${id}-descricao-error`} className="text-sm text-red-700 dark:text-red-300">{errors.descricao}</p>}
        </div>
        <button type="submit" disabled={pending} className="rounded-lg bg-[#004A99] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#003875] dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
          {pending ? 'Enviando...' : 'Enviar dúvida'}
        </button>
      </fieldset>
    </form>
  </section>;
}
