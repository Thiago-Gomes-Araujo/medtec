import { getMediaUrl, type PjProjetoMembro, type PjProjetoMembroAttribute } from '@/lib/api';

export const PROJETO_ANEXO_MAX_BYTES = 10 * 1024 * 1024;
const PROJETO_ANEXO_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/webp',
];
// Alguns navegadores não informam o tipo de arquivos Office: a extensão decide nesse caso.
const PROJETO_ANEXO_EXTENSION = /\.(pdf|docx?|xlsx?|pptx?|png|jpe?g|webp)$/i;
export const PROJETO_ANEXO_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp';

export function validateProjetoAnexo(file: File): string | null {
  const allowed = file.type ? PROJETO_ANEXO_TYPES.includes(file.type) : PROJETO_ANEXO_EXTENSION.test(file.name);
  if (!allowed) return `${file.name}: deve ser PDF, Word, Excel, PowerPoint ou imagem (PNG, JPG ou WEBP).`;
  if (file.size > PROJETO_ANEXO_MAX_BYTES) return `${file.name}: deve ter até 10 MB.`;
  return null;
}

// `imagem_url` vem primeiro: o painel o limpa ao trocar por arquivo, e a API não remove um arquivo já enviado.
export function getProjetoImageSrc(item: { imagem?: string | null; imagem_url?: string | null }): string {
  return getMediaUrl(item.imagem_url || item.imagem);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index++) sum += Number(cpf[index]) * (length + 1 - index);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

// Máscara de digitação: aceita CPF incompleto.
export function formatCpf(value: string): string {
  return onlyDigits(value).slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

// Listagens mostram só os dígitos centrais; o CPF completo aparece apenas ao editar o membro.
export function maskCpf(value: string): string {
  const cpf = onlyDigits(value);
  return cpf.length === 11 ? `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**` : '***';
}

export interface MembroDraft {
  pj_membro_id: number;
  nome: string;
  cpf: string;
  funcao: string;
}

export function hasMembroDuplicado(membros: Pick<MembroDraft, 'pj_membro_id'>[]): boolean {
  return new Set(membros.map(item => item.pj_membro_id)).size !== membros.length;
}

// O vínculo é localizado pelo membro: quem sai e volta na mesma edição mantém o vínculo original.
export function diffProjetoMembros(originais: PjProjetoMembro[], atuais: MembroDraft[]): PjProjetoMembroAttribute[] {
  const changes: PjProjetoMembroAttribute[] = [];
  for (const atual of atuais) {
    const funcao = atual.funcao.trim();
    const original = originais.find(item => item.pj_membro_id === atual.pj_membro_id);
    if (!original) changes.push({ pj_membro_id: atual.pj_membro_id, funcao });
    else if (original.funcao !== funcao) changes.push({ id: original.id, funcao });
  }
  for (const original of originais) {
    if (!atuais.some(item => item.pj_membro_id === original.pj_membro_id)) changes.push({ id: original.id, _destroy: true });
  }
  return changes;
}
