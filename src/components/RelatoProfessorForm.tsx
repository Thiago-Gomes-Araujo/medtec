'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { ApiError, medtecApi } from '@/lib/api';
import { formatTelefone, relatoErrorMessage } from '@/lib/community-content';

const EMPTY_FORM = { nome: '', email: '', telefone: '', texto: '' };
const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071324] px-3 py-2 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-400';
const labelClass = 'text-xs font-semibold text-slate-700 dark:text-slate-200';

export default function RelatoProfessorForm({ professorId, professorNome }: { professorId: number; professorNome: string }) {
  const id = useId();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const lock = useRef(false);

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setValues(current => ({ ...current, [field]: value }));
    setSuccess(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    const data = { nome: values.nome.trim(), email: values.email.trim(), telefone: values.telefone.replace(/\D/g, ''), texto: values.texto.trim() };
    const problems = [
      !data.nome && 'Informe o nome do aluno.',
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && 'Informe um e-mail válido.',
      !/^\d{10,11}$/.test(data.telefone) && 'Informe o telefone com DDD (10 ou 11 dígitos).',
      !data.texto && 'Escreva o seu relato.',
    ].filter((problem): problem is string => Boolean(problem));
    setErrors(problems);
    setSuccess(null);
    if (problems.length > 0) return;

    lock.current = true;
    setPending(true);
    try {
      const response = await medtecApi.professoresPublicos.enviarRelato(professorId, data);
      setValues(EMPTY_FORM);
      setSuccess(response.message);
    } catch (cause) {
      // A API devolve cada mensagem de validação em `errors`.
      setErrors(cause instanceof ApiError && cause.isValidationError() && cause.errors.some(message => !message.startsWith('http_'))
        ? cause.errors.filter(message => !message.startsWith('http_'))
        : [relatoErrorMessage(cause)]);
    } finally {
      lock.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate aria-label={`Enviar relato sobre ${professorNome}`} className="space-y-4 rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-5 sm:p-6">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Deixe seu relato</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">O nome do aluno aparece com o relato depois de aprovado. E-mail e telefone não são exibidos no site.</p>
      </div>
      {errors.length > 0 && <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-red-700 dark:text-red-300">
        {errors.map(message => <li key={message}>{message}</li>)}
      </ul>}
      {success && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>}
      <fieldset disabled={pending} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor={`${id}-nome`} className={labelClass}>Nome do aluno</label>
            <input id={`${id}-nome`} name="relato-nome" autoComplete="name" value={values.nome} className={inputClass} onChange={event => update('nome', event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-email`} className={labelClass}>E-mail</label>
            <input id={`${id}-email`} name="relato-email" type="email" autoComplete="email" value={values.email} className={inputClass} onChange={event => update('email', event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-telefone`} className={labelClass}>Telefone com DDD</label>
            <input id={`${id}-telefone`} name="relato-telefone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="(DD) 99999-9999" value={values.telefone} className={inputClass} onChange={event => update('telefone', formatTelefone(event.target.value))} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-texto`} className={labelClass}>Relato</label>
          <textarea id={`${id}-texto`} name="relato-texto" rows={5} value={values.texto} className={inputClass} onChange={event => update('texto', event.target.value)} />
        </div>
        <button type="submit" className="rounded-md bg-[#004A99] hover:bg-[#003875] text-white dark:bg-[#00D8FF] dark:text-slate-950 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-50">
          {pending ? 'Enviando...' : 'Enviar relato'}
        </button>
      </fieldset>
    </form>
  );
}
