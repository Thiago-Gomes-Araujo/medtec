import type { FaqItem } from '@/types';

// Compatibilidade dos dois identificadores usados nos links administrativos.
export function getLegacyFaqHref(params: URLSearchParams): string | null {
  const section = params.get('tab') || params.get('section');
  return section === 'duvidas' || section === 'faq' ? '/admin/faq' : null;
}

// Preserva a fonte administrativa legada até existir contrato Rails de FAQ.
// /api/faqs é um handler público vazio e não substitui esta leitura.
export async function readAdminFaqs(signal?: AbortSignal): Promise<FaqItem[]> {
  const response = await fetch('/api/data', { method: 'GET', cache: 'no-store', signal });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar o FAQ (HTTP ${response.status}).`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Resposta inválida da leitura administrativa do FAQ.');
  }
  if (!payload || typeof payload !== 'object' ||
      !('faqs' in payload) || !Array.isArray(payload.faqs)) {
    throw new Error('Resposta inválida da leitura administrativa do FAQ.');
  }

  // Usa o formato FaqItem já adotado pela leitura anterior, sem migrar registros.
  return payload.faqs as FaqItem[];
}
