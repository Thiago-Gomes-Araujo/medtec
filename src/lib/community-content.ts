import { ApiError, getMediaUrl } from '@/lib/api';

// Falha de API nas seções públicas vira um aviso discreto, sem mensagem de erro.
export const COMMUNITY_COMING_SOON = {
  title: 'Em breve',
  professores: 'O quadro de professores e mediadores estará disponível em breve.',
  conquistas: 'As histórias dos estudantes estarão disponíveis em breve.',
  projetos: 'Os projetos pedagógicos das escolas estarão disponíveis em breve.',
  galeria: 'O acervo fotográfico estará disponível em breve.',
  transparencia: 'Os indicadores e contratos oficiais estarão disponíveis em breve.',
};

export const CONQUISTA_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const CONQUISTA_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// Iniciais montadas pelo front a partir do nome: primeira e última palavra.
export function getNameInitials(name: string): string {
  const parts = name.replace(/^(Prof\.|Profa\.)\s*/i, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// `imagem` é o arquivo enviado (caminho no servidor); `imagem_url` é o link externo.
export function getConquistaImageSrc(item: { imagem?: string | null; imagem_url?: string | null }): string {
  return getMediaUrl(item.imagem || item.imagem_url);
}

export function validateConquistaImage(file: File): string | null {
  if (!CONQUISTA_IMAGE_TYPES.includes(file.type)) return 'A imagem deve ser PNG, JPG ou WEBP.';
  if (file.size > CONQUISTA_IMAGE_MAX_BYTES) return 'A imagem deve ter até 5 MB.';
  return null;
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

// 422 mostra as mensagens de validação da API; o restante segue o padrão do projeto.
export function communityErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 422) {
    const messages = error.errors.filter(message => !message.startsWith('http_'));
    return (messages.length > 0 ? messages : [error.message]).join(' · ');
  }
  return ApiError.getFriendlyMessage(error);
}

// O e-mail vem de formulário público: a codificação impede que ele acrescente cabeçalhos ao mailto.
export const mailtoHref = (email: string) => `mailto:${encodeURIComponent(email).replace('%40', '@')}`;
export const telHref = (telefone: string) => `tel:${telefone.replace(/[^\d+]/g, '')}`;

export function dateLabel(value: string | null): string {
  if (!value) return 'Não informado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data não informada'
    : date.toLocaleString('pt-BR', { timeZone: 'America/Porto_Velho' });
}

export function relatoErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.isRateLimited()) return 'Muitos envios. Aguarde um minuto.';
  if (error instanceof ApiError && error.isNotFound()) return 'Este professor não está mais disponível no portfólio.';
  return communityErrorMessage(error);
}

// Máscara de digitação: (DD) 9999-9999 com 10 dígitos e (DD) 99999-9999 com 11.
export function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  const corpo = digits.slice(2);
  const prefixo = digits.length === 11 ? 5 : 4;
  return corpo.length <= prefixo ? `(${digits.slice(0, 2)}) ${corpo}` : `(${digits.slice(0, 2)}) ${corpo.slice(0, prefixo)}-${corpo.slice(prefixo)}`;
}
