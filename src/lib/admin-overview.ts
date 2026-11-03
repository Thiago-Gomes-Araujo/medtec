import { ApiError, medtecApi, pode, type AAviso, type ApiResponse, type NNoticia, type PaginatedData, type SessaoPermissoes } from '@/lib/api';

interface OverviewCollection<T> {
  items: T[];
  total: number;
}

interface OverviewData {
  news: OverviewCollection<NNoticia>;
  avisos: OverviewCollection<AAviso>;
  gallery: { total: number; categories: number | null };
  faqs: { total: number; pending: number; published: number };
  users: number;
  states: number;
}

// Sem index no módulo, a leitura nem é feita: fica sem dado e sem erro, e a tela não mostra o item.
type ReadResult<T> = { data: T; error: null } | { data: null; error: string | null };
type OverviewSnapshot = { [K in keyof OverviewData]: ReadResult<OverviewData[K]> };
interface Resource<T> { data: T | null; loading: boolean; error: string | null }
export type AdminOverviewState = { [K in keyof OverviewData]: Resource<OverviewData[K]> };

export function createInitialOverviewState(): AdminOverviewState {
  const initial = { data: null, loading: true, error: null };
  return { news: { ...initial }, avisos: { ...initial }, gallery: { ...initial },
    faqs: { ...initial }, users: { ...initial }, states: { ...initial } };
}

export function startOverviewLoading(previous: AdminOverviewState): AdminOverviewState {
  const start = <T>(resource: Resource<T>): Resource<T> => ({ ...resource, loading: true, error: null });
  return { news: start(previous.news), avisos: start(previous.avisos), gallery: start(previous.gallery),
    faqs: start(previous.faqs), users: start(previous.users), states: start(previous.states) };
}

export function applyOverviewSnapshot(previous: AdminOverviewState, snapshot: OverviewSnapshot): AdminOverviewState {
  const finish = <T>(resource: Resource<T>, result: ReadResult<T>): Resource<T> => ({
    data: result.error === null ? result.data : resource.data,
    loading: false,
    error: result.error,
  });
  return { news: finish(previous.news, snapshot.news), avisos: finish(previous.avisos, snapshot.avisos),
    gallery: finish(previous.gallery, snapshot.gallery), faqs: finish(previous.faqs, snapshot.faqs),
    users: finish(previous.users, snapshot.users), states: finish(previous.states, snapshot.states) };
}

async function collection<T>(request: Promise<ApiResponse<PaginatedData<T>>>): Promise<OverviewCollection<T>> {
  const response = await request;
  if (!response.success || !Array.isArray(response.data?.items) ||
      !Number.isSafeInteger(response.data.pagination?.total_count) || response.data.pagination.total_count < 0) {
    throw new Error('Resposta inválida dos indicadores da API.');
  }
  return { items: response.data.items, total: response.data.pagination.total_count };
}

async function settle<T>(read: () => Promise<T>): Promise<ReadResult<T>> {
  try { return { data: await read(), error: null }; }
  catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { data: null, error: 'Endpoint ainda não disponível no servidor.' };
    }
    return { data: null, error: ApiError.getFriendlyMessage(error) };
  }
}

// Só consulta os módulos com permissão index: os demais dariam 403. A autorização definitiva continua no Rails.
async function readOverview(sessao: SessaoPermissoes): Promise<OverviewSnapshot> {
  const lista = (modulo: string) => pode(modulo, 'index', sessao);
  const when = <T>(modulo: string, read: () => Promise<T>): Promise<ReadResult<T>> =>
    lista(modulo) ? settle(read) : Promise.resolve({ data: null, error: null });
  const [news, avisos, gallery, faqs, users, states] = await Promise.all([
    when('n_noticias', () => collection(medtecApi.noticias.list({ page: 'all' }))),
    when('a_avisos', () => collection(medtecApi.avisos.list({ page: 'all' }))),
    when('fotos_galeria', async () => {
      const [photos, categories] = await Promise.all([
        collection(medtecApi.fotosGaleria.list({ page: 1, per_page: 1 })),
        lista('categorias_galeria') ? collection(medtecApi.categoriasGaleria.list({ page: 1, per_page: 1 })) : null,
      ]);
      return { total: photos.total, categories: categories?.total ?? null };
    }),
    when('d_duvidas', async () => {
      const [all, pending, published] = await Promise.all([
        collection(medtecApi.duvidas.list({ page: 1, per_page: 1 })),
        collection(medtecApi.duvidas.list({ page: 1, per_page: 1, 'q[n_status_noticia_slug_eq]': 'aguardando' })),
        collection(medtecApi.duvidas.list({ page: 1, per_page: 1, 'q[n_status_noticia_slug_eq]': 'publicada' })),
      ]);
      return { total: all.total, pending: pending.total, published: published.total };
    }),
    when('usuarios', async () => (await collection(medtecApi.usuarios.list({ page: 1, per_page: 1 }))).total),
    when('g_estados', async () => (await collection(medtecApi.estados.list({ page: 1, per_page: 1 }))).total),
  ]);
  return { news, avisos, gallery, faqs, users, states };
}

// Uma leitura em andamento por proprietário, compartilhada por chamadas concorrentes.
export function createAdminOverviewLoader() {
  let pending: Promise<OverviewSnapshot> | null = null;
  return (sessao: SessaoPermissoes): Promise<OverviewSnapshot> => {
    if (pending) return pending;
    pending = readOverview(sessao).finally(() => { pending = null; });
    return pending;
  };
}

export function getOverviewMetrics(state: AdminOverviewState) {
  // O cache permanece no estado, mas só uma leitura concluída sem erro é atual.
  const current = <T>(resource: Resource<T>): T | null =>
    resource.loading || resource.error ? null : resource.data;
  const news = current(state.news);
  const avisos = current(state.avisos);
  const gallery = current(state.gallery);
  const faqs = current(state.faqs);
  return {
    totalNews: news?.total ?? null,
    apiNewsPublishedCount: news ? news.items.filter((item) => item.status === 'publicada').length : null,
    apiNewsDraftCount: news ? news.items.filter((item) => item.status === 'aguardando').length : null,
    apiAvisosAtivosCount: avisos ? avisos.items.filter((item) => item.ativo).length : null,
    apiAvisosUrgentesCount: avisos ? avisos.items.filter((item) => item.ativo &&
      (item.a_tipo_aviso?.slug === 'urgente' || item.a_tipo_aviso?.nome?.toLowerCase().includes('urgente'))).length : null,
    totalAvisos: avisos?.total ?? null,
    totalFotos: gallery?.total ?? null,
    totalCategorias: gallery?.categories ?? null,
    totalFaqs: faqs?.total ?? null,
    apiFaqsPendingCount: faqs?.pending ?? null,
    apiFaqsPublishedCount: faqs?.published ?? null,
    totalEstados: current(state.states),
    totalUsers: current(state.users),
    usersCountLabel: state.users.loading ? '...' : state.users.error ? 'Indisponível' : (state.users.data ?? '—'),
  };
}

export function getOverviewHighlights(state: AdminOverviewState) {
  const news = state.news.loading || state.news.error ? undefined : state.news.data?.items[0];
  const avisos = state.avisos.loading || state.avisos.error ? [] : (state.avisos.data?.items || []);
  return {
    latestNews: news ? {
      titulo: news.titulo, data_publicacao: news.data_publicacao, autor_nome: news.autor_nome,
    } : undefined,
    announcementTitle: (avisos.find(a => (a.a_tipo_aviso?.slug === 'urgente' ||
      a.a_tipo_aviso?.nome?.toLowerCase().includes('urgente')) && a.ativo) || avisos[0])?.titulo,
  };
}
