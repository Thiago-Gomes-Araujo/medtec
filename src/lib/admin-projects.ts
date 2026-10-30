import type { ProjectMission } from '@/types';

export function getLegacyProjectsHref(params: URLSearchParams): string | null {
  const section = params.get('tab') || params.get('section');
  if (section !== 'projetos') return null;
  return params.get('action') === 'new' ? '/admin/projetos?action=new' : '/admin/projetos';
}

// Mantém a leitura administrativa legada, sem usar o handler público vazio.
export async function readAdminProjects(signal?: AbortSignal): Promise<ProjectMission[]> {
  const response = await fetch('/api/data', { method: 'GET', cache: 'no-store', signal });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar os projetos (HTTP ${response.status}).`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Resposta inválida da leitura administrativa de Projetos.');
  }
  if (!payload || typeof payload !== 'object' ||
      !('projects' in payload) || !Array.isArray(payload.projects)) {
    throw new Error('Resposta inválida da leitura administrativa de Projetos.');
  }

  // Preserva o formato ProjectMission já usado, sem migrar registros nesta etapa.
  return payload.projects as ProjectMission[];
}
