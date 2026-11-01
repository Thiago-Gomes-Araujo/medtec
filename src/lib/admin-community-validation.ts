// Validações locais de prévia. A autorização e a validação definitiva pertencem ao Rails.
export function validateEditorialFields(
  draft: { slug: string; g_cidade_id: number; posicao: number; destaque_home: boolean; posicao_home?: number },
  limits: Record<string, { min?: number; max: number }>,
  errors: Record<string, string>,
) {
  for (const [key, limit] of Object.entries(limits)) {
    const value: unknown = Reflect.get(draft, key);
    if (value == null || value === '') continue;
    if (typeof value === 'string' && (value.trim().length < (limit.min ?? 0) || value.trim().length > limit.max)) {
      errors[key] = `${key}: informe de ${limit.min ?? 0} a ${limit.max} caracteres.`;
    }
    if (typeof value === 'number' && (!Number.isInteger(value) || value < (limit.min ?? 0) || value > limit.max)) {
      errors[key] = `${key}: informe um inteiro de ${limit.min ?? 0} a ${limit.max}.`;
    }
  }
  if (!Number.isInteger(draft.g_cidade_id) || draft.g_cidade_id < 1) errors.g_cidade_id = 'Selecione um município da base oficial após a integração.';
  if (!Number.isInteger(draft.posicao) || draft.posicao < 1) errors.posicao = 'Informe uma posição inteira a partir de 1.';
  if (draft.destaque_home && (!Number.isInteger(draft.posicao_home) || draft.posicao_home! < 1 || draft.posicao_home! > 10)) errors.posicao_home = 'Informe uma posição de destaque entre 1 e 10.';
}

export function isSafeEditorialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

export function validateMediaFields(draft: { foto_url?: string; foto_alt?: string; materiais?: { titulo: string; url: string }[] }, errors: Record<string, string>) {
  if (draft.foto_url) {
    if (draft.foto_url !== '/hero.jpg' && !isSafeEditorialUrl(draft.foto_url)) errors.foto_url = 'Selecione uma mídia oficial ou uma URL HTTPS válida.';
    if ((draft.foto_alt?.trim().length ?? 0) < 5 || (draft.foto_alt?.trim().length ?? 0) > 180) errors.foto_alt = 'A descrição da foto deve conter de 5 a 180 caracteres.';
  }
  if (draft.materiais && (draft.materiais.length > 5 || draft.materiais.some(material => !material.titulo.trim() || !isSafeEditorialUrl(material.url)))) errors.materiais = 'Selecione até cinco materiais públicos com título e URL HTTPS válida.';
}

export function isCalendarDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
