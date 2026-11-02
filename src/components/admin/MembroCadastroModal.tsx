'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { medtecApi, type PjMembro } from '@/lib/api';
import { formatCpf, isValidCpf, onlyDigits } from '@/lib/projetos-content';
import { useDialogFocus } from '@/components/useDialogFocus';
import { buttonClass, inputClass, labelClass, renderFeedback, useAdminAction } from './communityAdminUi';

// Sem <form>: o modal também abre dentro do formulário do projeto, e formulários não podem ser aninhados.
export default function MembroCadastroModal({ onClose, onCreated }: { onClose: () => void; onCreated: (membro: PjMembro) => void }) {
  const id = useId();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const action = useAdminAction();
  const { dialogRef, overlayRef } = useDialogFocus(true, onClose);
  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nomeRef.current?.focus(); }, []);

  async function save() {
    if (!nome.trim()) { action.setError('Informe o nome do membro.'); return; }
    if (!isValidCpf(cpf)) { action.setError('Informe um CPF válido.'); return; }
    await action.run(async () => {
      onCreated(await medtecApi.membrosProjeto.create({ nome: nome.trim(), cpf: onlyDigits(cpf) }));
    });
  }

  function onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') { event.preventDefault(); void save(); }
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 dark:bg-black/75">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-titulo`} tabIndex={-1} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl dark:bg-[#0B1729]">
        <h3 id={`${id}-titulo`} className="text-base font-bold text-slate-900 dark:text-white">Cadastrar membro</h3>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-nome`} className={labelClass}>Nome (obrigatório)</label>
          <input ref={nomeRef} id={`${id}-nome`} name="membro-cadastro-nome" value={nome} disabled={action.busy} className={inputClass} onChange={event => setNome(event.target.value)} onKeyDown={onEnter} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-cpf`} className={labelClass}>CPF (obrigatório)</label>
          <input id={`${id}-cpf`} name="membro-cadastro-cpf" inputMode="numeric" autoComplete="off" value={cpf} disabled={action.busy} className={inputClass} onChange={event => setCpf(formatCpf(event.target.value))} onKeyDown={onEnter} />
          <p className="text-xs text-slate-600 dark:text-slate-400">O CPF não aparece no site.</p>
        </div>
        {renderFeedback(action.error, action.success)}
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void save()}>{action.busy ? 'Salvando...' : 'Salvar membro'}</button>
          <button type="button" disabled={action.busy} className={buttonClass} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
