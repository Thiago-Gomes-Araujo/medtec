'use client';

import { useCallback, useEffect, useId, useState, type FocusEvent } from 'react';
import { medtecApi, type PjMembro } from '@/lib/api';
import { maskCpf, type MembroDraft } from '@/lib/projetos-content';
import MembroCadastroModal from './MembroCadastroModal';
import { buttonClass, inputClass, labelClass, renderFeedback, renderPagination, useAdminAction, useApiList } from './communityAdminUi';

const BUSCA_ESPERA_MS = 300;

// Escolhe o membro por nome, na listagem paginada da API; a função é pedida na linha de cada membro.
export default function ProjetoMembrosEditor({ value, onChange }: { value: MembroDraft[]; onChange: (next: MembroDraft[]) => void }) {
  const id = useId();
  const [termo, setTermo] = useState('');
  const [busca, setBusca] = useState({ nome: '', page: 1 });
  const [aberto, setAberto] = useState(false);
  const [recemIncluido, setRecemIncluido] = useState<number | null>(null);
  const [cadastrando, setCadastrando] = useState(false);
  const action = useAdminAction();
  const read = useCallback((signal: AbortSignal) => medtecApi.membrosProjeto.list({
    page: busca.page, per_page: 10, 'q[nome_cont]': busca.nome || undefined,
  }, signal), [busca]);
  const membros = useApiList<PjMembro>(read);

  // A digitação espera uma pausa para não consultar a API a cada tecla.
  useEffect(() => {
    const nome = termo.trim();
    const timer = setTimeout(() => setBusca(current => current.nome === nome ? current : { nome, page: 1 }), BUSCA_ESPERA_MS);
    return () => clearTimeout(timer);
  }, [termo]);

  function incluir(membro: PjMembro, mensagem: string) {
    if (value.some(item => item.pj_membro_id === membro.id)) return;
    onChange([...value, { pj_membro_id: membro.id, nome: membro.nome, cpf: membro.cpf, funcao: '' }]);
    setRecemIncluido(membro.id);
    action.setError(null);
    action.setSuccess(mensagem);
  }

  function selecionar(membro: PjMembro) {
    incluir(membro, `${membro.nome} incluído. Informe a função e salve o projeto.`);
    setTermo('');
    setAberto(false);
  }

  function membroCadastrado(membro: PjMembro) {
    setCadastrando(false);
    incluir(membro, `${membro.nome} cadastrado e incluído. Informe a função e salve o projeto.`);
    membros.reload();
  }

  function fecharAoSair(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setAberto(false);
  }

  return (
    <fieldset className="space-y-3">
      <legend className={labelClass}>Membros (opcional)</legend>
      {value.length > 0 && <ul aria-label="Membros do projeto" className="divide-y divide-slate-200 dark:divide-slate-800">
        {value.map(item => <li key={item.pj_membro_id} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <p className="min-w-0 break-words text-sm text-slate-900 dark:text-white">{item.nome} <span className="block text-xs text-slate-600 dark:text-slate-400">CPF {maskCpf(item.cpf)}</span></p>
          <input name={`membro-funcao-${item.pj_membro_id}`} aria-label={`Função de ${item.nome}`} placeholder="Função neste projeto" required autoFocus={item.pj_membro_id === recemIncluido} value={item.funcao} className={inputClass}
            onChange={event => onChange(value.map(entry => entry.pj_membro_id === item.pj_membro_id ? { ...entry, funcao: event.target.value } : entry))} />
          <button type="button" aria-label={`Remover ${item.nome} do projeto`} className={buttonClass}
            onClick={() => onChange(value.filter(entry => entry.pj_membro_id !== item.pj_membro_id))}>Remover</button>
        </li>)}
      </ul>}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="relative space-y-1.5" onBlur={fecharAoSair}>
          <label htmlFor={`${id}-busca`} className={labelClass}>Adicionar membro</label>
          <input id={`${id}-busca`} name="membro-busca-nome" type="search" autoComplete="off" placeholder="Buscar por nome" value={termo} className={inputClass}
            onFocus={() => setAberto(true)}
            onChange={event => { setTermo(event.target.value); setAberto(true); }}
            onKeyDown={event => {
              // Dentro do formulário do projeto, Enter não pode salvar o projeto inteiro.
              if (event.key === 'Enter') event.preventDefault();
              if (event.key === 'Escape') setAberto(false);
            }} />
          {/* Sem o preventDefault, o campo perde o foco antes do clique e a lista fecha sem selecionar. */}
          {aberto && <div className="absolute z-20 mt-1 max-h-80 w-full space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-[#071324]" onMouseDown={event => event.preventDefault()}>
            {membros.loading && <p role="status" className="p-2 text-xs text-slate-600 dark:text-slate-400">Carregando membros...</p>}
            {membros.error && <div role="alert" className="space-y-2 p-2 text-xs text-red-700 dark:text-red-300">
              <p>{membros.error}</p>
              <button type="button" className={buttonClass} aria-label="Recarregar membros" onClick={membros.reload}>Tentar novamente</button>
            </div>}
            {!membros.loading && !membros.error && membros.items.length === 0 && <p className="p-2 text-xs text-slate-600 dark:text-slate-400">Nenhum membro encontrado. Use &quot;Cadastrar membro&quot;.</p>}
            {!membros.loading && !membros.error && membros.items.length > 0 && <ul aria-label="Membros encontrados">
              {membros.items.map(membro => {
                const incluido = value.some(item => item.pj_membro_id === membro.id);
                return <li key={membro.id}>
                  <button type="button" disabled={incluido} aria-label={incluido ? `${membro.nome} já está no projeto` : `Adicionar ${membro.nome}`} className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white dark:hover:bg-slate-800" onClick={() => selecionar(membro)}>
                    {membro.nome}
                    <span className="block text-xs text-slate-600 dark:text-slate-400">CPF {maskCpf(membro.cpf)}{incluido ? ' · já está no projeto' : ''}</span>
                  </button>
                </li>;
              })}
            </ul>}
            {!membros.error && renderPagination('Paginação da busca de membros', 'membros', membros.pagination, busca.page, membros.loading, page => setBusca(current => ({ ...current, page })))}
          </div>}
        </div>
        <button type="button" className={buttonClass} onClick={() => { action.setError(null); action.setSuccess(null); setCadastrando(true); }}>Cadastrar membro</button>
      </div>
      {renderFeedback(action.error, action.success)}
      {cadastrando && <MembroCadastroModal onClose={() => setCadastrando(false)} onCreated={membroCadastrado} />}
    </fieldset>
  );
}
