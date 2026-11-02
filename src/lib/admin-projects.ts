export function getLegacyProjectsHref(params: URLSearchParams): string | null {
  const section = params.get('tab') || params.get('section');
  if (section !== 'projetos') return null;
  return params.get('action') === 'new' ? '/admin/projetos?action=new' : '/admin/projetos';
}
