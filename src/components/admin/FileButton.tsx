'use client';

import type { ChangeEventHandler, ReactNode } from 'react';
import { buttonClass } from './communityAdminUi';

interface FileButtonProps {
  children: ReactNode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  name?: string;
  accept?: string;
  multiple?: boolean;
  /** Nome do arquivo escolhido, quando a tela não o mostra de outra forma. */
  selected?: string;
}

// O reset do Tailwind 4 apaga o botão nativo do input de arquivo: o rótulo faz esse papel, e o input segue acessível pelo teclado.
export default function FileButton({ children, onChange, name, accept, multiple, selected }: FileButtonProps) {
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-2">
      <label className={`${buttonClass} relative inline-flex max-w-full items-center gap-2 focus-within:ring-2 focus-within:ring-sky-400 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50`}>
        {children}
        <input type="file" name={name} accept={accept} multiple={multiple} className="sr-only" onChange={onChange} />
      </label>
      {selected && <span className="min-w-0 break-all text-xs text-slate-600 dark:text-slate-400">{selected}</span>}
    </span>
  );
}
