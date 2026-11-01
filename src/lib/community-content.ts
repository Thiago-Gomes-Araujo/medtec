import { ApiError, getMediaUrl } from '@/lib/api';

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

export function relatoErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.isRateLimited()) return 'Muitos envios. Aguarde um minuto.';
  if (error instanceof ApiError && error.isNotFound()) return 'Este professor não está mais disponível no portfólio.';
  return communityErrorMessage(error);
}
