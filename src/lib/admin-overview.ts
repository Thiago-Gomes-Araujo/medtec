import { ApiError, medtecApi, type AAviso, type ApiResponse, type NNoticia, type PaginatedData } from '@/lib/api';
import type { DatabaseSchema } from '@/types';

interface OverviewCollection<T> {
  items: T[];
  total: number;
}

interface OverviewData {
  news: OverviewCollection<NNoticia>;
  avisos: OverviewCollection<AAviso>;
  gallery: { total: number; categories: number };
  users: number;
  states: number;
  legacy: DatabaseSchema;
}

type ReadResult<T> = { data: T; error: null } | { data: null; error: string };
type OverviewSnapshot = { [K in keyof OverviewData]: ReadResult<OverviewData[K]> };
interface Resource<T> { data: T | null; loading: boolean; error: string | null }
export type AdminOverviewState = { [K in keyof OverviewData]: Resource<OverviewData[K]> };

export function createInitialOverviewState(): AdminOverviewState {
  const initial = { data: null, loading: true, error: null };
  return { news: { ...initial }, avisos: { ...initial }, gallery: { ...initial },
    users: { ...initial }, states: { ...initial }, legacy: { ...initial } };
}

export function startOverviewLoading(previous: AdminOverviewState): AdminOverviewState {
  const start = <T>(resource: Resource<T>): Resource<T> => ({ ...resource, loading: true, error: null });
  return { news: start(previous.news), avisos: start(previous.avisos), gallery: start(previous.gallery),
    users: start(previous.users), states: start(previous.states), legacy: start(previous.legacy) };
}

export function applyOverviewSnapshot(previous: AdminOverviewState, snapshot: OverviewSnapshot): AdminOverviewState {
  const finish = <T>(resource: Resource<T>, result: ReadResult<T>): Resource<T> => ({
    data: result.error === null ? result.data : resource.data,
    loading: false,
    error: result.error,
  });
  return { news: finish(previous.news, snapshot.news), avisos: finish(previous.avisos, snapshot.avisos),
    gallery: finish(previous.gallery, snapshot.gallery), users: finish(previous.users, snapshot.users),
    states: finish(previous.states, snapshot.states), legacy: finish(previous.legacy, snapshot.legacy) };
}

async function collection<T>(request: Promise<ApiResponse<PaginatedData<T>>>): Promise<OverviewCollection<T>> {
  const response = await request;
  if (!response.success || !Array.isArray(response.data?.items) ||
      !Number.isSafeInteger(response.data.pagination?.total_count) || response.data.pagination.total_count < 0) {
    throw new Error('Resposta inválida dos indicadores da API.');
  }
  return { items: response.data.items, total: response.data.pagination.total_count };
}

async function readLegacyOverview(): Promise<DatabaseSchema> {
  const response = await fetch('/api/data', { method: 'GET', cache: 'no-store' });
  if (!response.ok) throw new Error(`Não foi possível carregar os dados legados do painel (HTTP ${response.status}).`);
  const value: unknown = await response.json();
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Resposta inválida dos dados legados do painel.');
  }
  const data = value as Partial<DatabaseSchema>;
  if (!data.siteInfo || !data.stats || !data.socials || !Array.isArray(data.banners) ||
      !Array.isArray(data.news) || !Array.isArray(data.gallery) || !Array.isArray(data.announcements) ||
      (data.projects !== undefined && !Array.isArray(data.projects)) ||
      (data.faqs !== undefined && !Array.isArray(data.faqs))) {
    throw new Error('Resposta inválida dos dados legados do painel.');
  }
  // Mantém o formato legado compartilhado com os blocos antigos, sem migrar registros.
  return data as DatabaseSchema;
}

async function settle<T>(read: () => Promise<T>): Promise<ReadResult<T>> {
  try { return { data: await read(), error: null }; }
  catch (error) { return { data: null, error: ApiError.getFriendlyMessage(error) }; }
}

// O chamador confirma o acesso antes da leitura; a autorização definitiva continua no Rails.
async function readOverview(authorized: boolean): Promise<OverviewSnapshot | null> {
  if (!authorized) return null;
  const [news, avisos, gallery, users, states, legacy] = await Promise.all([
    settle(() => collection(medtecApi.noticias.list({ page: 'all' }))),
    settle(() => collection(medtecApi.avisos.list({ page: 'all' }))),
    settle(async () => {
      const [photos, categories] = await Promise.all([
        collection(medtecApi.fotosGaleria.list({ page: 1, per_page: 1 })),
        collection(medtecApi.categoriasGaleria.list({ page: 1, per_page: 1 })),
      ]);
      return { total: photos.total, categories: categories.total };
    }),
    settle(async () => (await collection(medtecApi.usuarios.list({ page: 1, per_page: 1 }))).total),
    settle(async () => (await collection(medtecApi.estados.list({ page: 1, per_page: 1 }))).total),
    settle(readLegacyOverview),
  ]);
  return { news, avisos, gallery, users, states, legacy };
}

// Uma leitura em andamento por proprietário, compartilhada por chamadas concorrentes.
export function createAdminOverviewLoader() {
  let pending: Promise<OverviewSnapshot | null> | null = null;
  return (authorized: boolean): Promise<OverviewSnapshot | null> => {
    if (!authorized) return Promise.resolve(null);
    if (pending) return pending;
    pending = readOverview(true).finally(() => { pending = null; });
    return pending;
  };
}

export function getOverviewMetrics(state: AdminOverviewState) {
  const news = state.news.data?.items || [];
  const avisos = state.avisos.data?.items || [];
  const legacy = state.legacy.data;
  return {
    totalNews: state.news.data?.total ?? null,
    apiNewsPublishedCount: news.filter((item) => item.status === 'publicada').length,
    apiNewsDraftCount: news.filter((item) => item.status === 'aguardando').length,
    apiAvisosAtivosCount: avisos.filter((item) => item.ativo).length,
    apiAvisosUrgentesCount: avisos.filter((item) => item.ativo &&
      (item.a_tipo_aviso?.slug === 'urgente' || item.a_tipo_aviso?.nome?.toLowerCase().includes('urgente'))).length,
    totalAvisos: state.avisos.data?.total ?? null,
    totalFotos: state.gallery.data?.total ?? null,
    totalCategorias: state.gallery.data?.categories ?? null,
    totalEstados: state.states.error ? null : state.states.data,
    totalUsers: state.users.data,
    usersCountLabel: state.users.loading ? '...' : state.users.error ? 'Indisponível' : (state.users.data ?? '—'),
    projectsCount: legacy?.projects?.length || 0,
    projectMunicipalities: new Set((legacy?.projects || []).map((project) => project.municipality)).size,
    bannersCount: legacy?.banners?.length || 0,
    faqsCount: legacy?.faqs?.length || 0,
  };
}
