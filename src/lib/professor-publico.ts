import { fetchWithTimeout, getApiBaseUrl } from '@/lib/api/client';

// O Proxy segura a resposta enquanto consulta: tempo curto e, na dúvida, quem decide é a página.
const PROFESSOR_CHECK_TIMEOUT_MS = 2000;

export function isValidProfessorId(id: string): boolean {
  return /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));
}

export function getProfessorPathId(pathname: string): string | null {
  return pathname.match(/^\/professores\/([^/]+)$/)?.[1] ?? null;
}

/**
 * Só o 404 da API conta como inexistente: API fora do ar ou lenta não pode virar "página não encontrada".
 */
export async function isProfessorMissing(id: string): Promise<boolean> {
  if (!isValidProfessorId(id)) return true;
  try {
    const response = await fetchWithTimeout(
      `${getApiBaseUrl()}/publico/p_professores/${id}`,
      { method: 'GET', credentials: 'omit', cache: 'no-store' },
      PROFESSOR_CHECK_TIMEOUT_MS
    );
    await response.body?.cancel();
    return response.status === 404;
  } catch {
    return false;
  }
}
