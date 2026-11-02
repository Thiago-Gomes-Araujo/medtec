'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { medtecApi, type PjMembro } from '@/lib/api';
import { formatCpf, isValidCpf, maskCpf, onlyDigits, type MembroDraft } from '@/lib/projetos-content';
import MembroCadastroModal from './MembroCadastroModal';
import { buttonClass, inputClass, labelClass, renderFeedback, useAdminAction } from './communityAdminUi';

// Busca o membro pelo CPF: se existir, é reutilizado; se não, é cadastrado antes de entrar no projeto.
export default function ProjetoMembrosEditor({ value, onChange }: { value: MembroDraft[]; onChange: (next: MembroDraft[]) => void }) {
  const id = useId();
  const [cpf, setCpf] = useState('');
  const [funcao, setFuncao] = useState('');
  const [encontrado, setEncontrado] = useState<PjMembro | null>(null);
  const [nomeNovo, setNomeNovo] = useState<string | null>(null);
  const [cadastrando, setCadastrando] = useState(false);
  const action = useAdminAction();

  function changeCpf(next: string) {
    setCpf(formatCpf(next)); setEncontrado(null); setNomeNovo(null);
  }

  async function buscar() {
    if (!isValidCpf(cpf)) { action.setError('Informe um CPF válido.'); return; }
    setEncontrado(null); setNomeNovo(null);
    await action.run(async () => {
      const response = await medtecApi.membrosProjeto.list({ page: 1, per_page: 1, 'q[cpf_eq]': onlyDigits(cpf) });
      const membro = response.data.items[0];
      if (!membro) { setNomeNovo(''); return; }
      if (value.some(item => item.pj_membro_id === membro.id)) throw new Error(`${membro.nome} já está neste projeto.`);
      setEncontrado(membro);
    });
  }

  async function adicionar() {
    if (!funcao.trim()) { action.setError('Informe a função do membro neste projeto.'); return; }
    if (!encontrado && !nomeNovo?.trim()) { action.setError('Informe o nome do membro.'); return; }
    await action.run(async () => {
      const membro = encontrado ?? await medtecApi.membrosProjeto.create({ nome: nomeNovo!.trim(), cpf: onlyDigits(cpf) });
      onChange([...value, { pj_membro_id: membro.id, nome: membro.nome, cpf: membro.cpf, funcao: funcao.trim() }]);
      setCpf(''); setFuncao(''); setEncontrado(null); setNomeNovo(null);
      return `${membro.nome} incluído. Salve o projeto para confirmar.`;
    });
  }

  function membroCadastrado(membro: PjMembro) {
    setCadastrando(false);
    onChange([...value, { pj_membro_id: membro.id, nome: membro.nome, cpf: membro.cpf, funcao: '' }]);
    action.setSuccess(`${membro.nome} cadastrado e incluído. Informe a função e salve o projeto.`);
  }

  // Dentro do formulário do projeto, Enter não pode salvar o projeto inteiro.
  function onEnter(event: KeyboardEvent, run: () => void) {
    if (event.key === 'Enter') { event.preventDefault(); run(); }
  }

  const prontoParaAdicionar = encontrado !== null || nomeNovo !== null;

  return (
    <fieldset className="space-y-3">
      <legend className={labelClass}>Membros (opcional)</legend>
      {value.length > 0 && <ul aria-label="Membros do projeto" className="divide-y divide-slate-200 dark:divide-slate-800">
        {value.map(item => <li key={item.pj_membro_id} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <p className="min-w-0 break-words text-sm text-slate-900 dark:text-white">{item.nome} <span className="block text-xs text-slate-600 dark:text-slate-400">CPF {maskCpf(item.cpf)}</span></p>
          <input name={`membro-funcao-${item.pj_membro_id}`} aria-label={`Função de ${item.nome}`} required value={item.funcao} className={inputClass}
            onChange={event => onChange(value.map(entry => entry.pj_membro_id === item.pj_membro_id ? { ...entry, funcao: event.target.value } : entry))} />
          <button type="button" aria-label={`Remover ${item.nome} do projeto`} className={buttonClass}
            onClick={() => onChange(value.filter(entry => entry.pj_membro_id !== item.pj_membro_id))}>Remover</button>
        </li>)}
      </ul>}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div className="space-y-1.5">
          <label htmlFor={`${id}-cpf`} className={labelClass}>CPF do membro</label>
          <input id={`${id}-cpf`} name="membro-busca-cpf" inputMode="numeric" autoComplete="off" value={cpf} className={inputClass}
            onChange={event => changeCpf(event.target.value)} onKeyDown={event => onEnter(event, () => void buscar())} />
        </div>
        <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void buscar()}>Buscar CPF</button>
        <button type="button" disabled={action.busy} className={buttonClass} onClick={() => { action.setError(null); action.setSuccess(null); setCadastrando(true); }}>Cadastrar membro</button>
      </div>

      {prontoParaAdicionar && <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        {encontrado
          ? <p className="text-sm text-slate-900 dark:text-white">{encontrado.nome} <span className="block text-xs text-slate-600 dark:text-slate-400">Já cadastrado</span></p>
          : <div className="space-y-1.5">
            <label htmlFor={`${id}-nome`} className={labelClass}>Nome (CPF sem cadastro)</label>
            <input id={`${id}-nome`} name="membro-novo-nome" value={nomeNovo ?? ''} className={inputClass} onChange={event => setNomeNovo(event.target.value)} onKeyDown={event => onEnter(event, () => void adicionar())} />
          </div>}
        <div className="space-y-1.5">
          <label htmlFor={`${id}-funcao`} className={labelClass}>Função neste projeto</label>
          <input id={`${id}-funcao`} name="membro-nova-funcao" value={funcao} className={inputClass} onChange={event => setFuncao(event.target.value)} onKeyDown={event => onEnter(event, () => void adicionar())} />
        </div>
        <button type="button" disabled={action.busy} className={buttonClass} onClick={() => void adicionar()}>Adicionar ao projeto</button>
      </div>}
      {renderFeedback(action.error, action.success)}
      {cadastrando && <MembroCadastroModal onClose={() => setCadastrando(false)} onCreated={membroCadastrado} />}
    </fieldset>
  );
}
