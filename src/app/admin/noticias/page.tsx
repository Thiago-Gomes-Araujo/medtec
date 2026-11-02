'use client';

import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { medtecApi, ApiError, type NNoticia, type NCategoriaNoticia, getMediaUrl } from '@/lib/api';
import NewsModule from '@/components/admin/NewsModule';
import { notifyAprovacoesPendentes } from '@/components/admin/useAprovacoesPendentes';
import AdminShell, { type AdminSession } from '@/components/admin/AdminShell';
import type { NewsItem } from '@/types';
import { AdminPreviewModal, type PreviewContentType, type PreviewItemData } from '@/components/AdminLiveSimulator';

function NewsContent({ session }: { session: AdminSession }) {
  const router = useRouter();
  const params = useSearchParams();
  const isNew = params.get('action') === 'new' || ['editor', 'new', 'nova'].includes(params.get('mode') || '');
  const editId = params.get('edit');
  const newsViewMode = isNew || editId ? 'editor' : 'lista';
  const setNewsViewMode: React.Dispatch<React.SetStateAction<'lista' | 'editor'>> = (next) => {
    const mode = typeof next === 'function' ? next(newsViewMode) : next;
    router.push(mode === 'editor' ? '/admin/noticias?action=new' : '/admin/noticias', { scroll: false });
  };
  const [apiNews, setApiNews] = useState<NNoticia[]>([]);
  const [apiNewsCategories, setApiNewsCategories] = useState<NCategoriaNoticia[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);
  // /auth/me supplies the current profile; never infer publishing from isGestor or user IDs.
  const [permissions, setPermissions] = useState<string[]>([]);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean; type: PreviewContentType; data: PreviewItemData;
  }>({ isOpen: false, type: 'noticia', data: {} });

  const loadNewsData = useCallback(async () => {
    setLoadingNews(true);
    setErrorNews(null);
    try {
      const [catsRes, newsRes] = await Promise.all([
        medtecApi.noticias.listCategorias({ page: 'all', 'q[ativo_true]': 1 }),
        medtecApi.noticias.list({ page: 'all' }),
      ]);
      if (!catsRes.success || !Array.isArray(catsRes.data?.items) ||
          !newsRes.success || !Array.isArray(newsRes.data?.items)) {
        throw new Error('Resposta inválida da API de Notícias.');
      }
      setApiNewsCategories(catsRes.data.items);
      setApiNews(newsRes.data.items);
    } catch (err) {
      setErrorNews(ApiError.getFriendlyMessage(err));
    } finally {
      setLoadingNews(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      const user = session.apiUser;
      // These are the documented profile defaults. If the permission matrix is available,
      // replace them with the effective per-user grants (profile OR extra).
      let grants = user?.perfil_nome === 'Administrador'
        ? ['create', 'update', 'destroy', 'publicar', 'despublicar']
        : user?.perfil_nome === 'Gestor' ? ['create', 'update', 'destroy'] : [];
      if (user) {
        try {
          const response = await medtecApi.usuarios.getPermissoesExtras(user.id);
          if (response.success && Array.isArray(response.data)) {
            const newsModule = response.data.find((item) =>
              ['noticias', 'nnoticias'].includes(item.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/gi, '').toLowerCase())
            );
            grants = newsModule?.regras.filter((rule) => rule.do_perfil || rule.extra).map((rule) => rule.acao) || [];
          }
        } catch (err) {
          // Reading the administrative permission matrix may itself be forbidden.
          // Every business operation still requires its own Rails authorization.
          if (!(err instanceof ApiError) || err.status !== 403) grants = [];
        }
      }
      if (!active) return;
      setPermissions(grants);
      await loadNewsData();
    }
    void initialize();
    return () => { active = false; };
  }, [session.apiUser, loadNewsData]);

  // Adaptador de notícias para visualização e formulários
  const effectiveNews: NewsItem[] = useMemo(() => {
    return apiNews.map((n) => ({
      id: String(n.id),
      title: n.titulo,
      slug: n.slug,
      excerpt: n.resumo || '',
      content: n.conteudo,
      coverImage: getMediaUrl(n.imagem_capa),
      author: n.autor_nome,
      category: n.categoria_nome,
      publishedAt: n.data_publicacao,
      folder: n.categoria_nome || 'Geral',
      published: n.status === 'publicada',
      rejected: n.status === 'reprovada',
      rejectionReason: n.motivo_reprovacao || undefined,
      views: 0,
      tags: [],
    }));
  }, [apiNews]);

  const handleTogglePublished = async (id: string) => {
    const current = apiNews.find((item) => item.id === Number(id));
    if (!current) return;
    const action = current.status === 'publicada' ? 'despublicar' : 'publicar';
    if (!permissions.includes(action)) return;
    try {
      await medtecApi.noticias[action](current.id);
      alert(action === 'publicar' ? 'Notícia publicada com sucesso!' : 'Notícia despublicada. Ela retornou à fila de aprovação.');
      notifyAprovacoesPendentes();
      await loadNewsData();
    } catch (err) {
      alert(ApiError.getFriendlyMessage(err));
    }
  };

  return (
    <>
      {!loadingNews && !errorNews && newsViewMode === 'editor' && !(editId ? permissions.includes('update') : permissions.includes('create')) && (
        <p role="alert">Você não possui permissão para esta ação.</p>
      )}
      {!loadingNews && !errorNews && editId && !effectiveNews.some((item) => item.id === editId) ? (
        <p role="alert">Notícia não encontrada. Volte à lista para selecionar um registro existente.</p>
      ) : <NewsModule
        key={`${newsViewMode}:${editId || ''}:${loadingNews ? 'loading' : 'ready'}`}
        initialEditingNews={effectiveNews.find((item) => item.id === editId)}
        onEditNavigation={(id) => router.push(`/admin/noticias?edit=${encodeURIComponent(id)}`, { scroll: false })}
        effectiveNews={effectiveNews}
        apiNewsCategories={apiNewsCategories}
        loadingNews={loadingNews}
        errorNews={errorNews}
        userSession={session}
        canCreate={permissions.includes('create')}
        canEdit={permissions.includes('update')}
        canDelete={permissions.includes('destroy')}
        canPublish={permissions.includes('publicar')}
        canUnpublish={permissions.includes('despublicar')}
        newsViewMode={newsViewMode}
        setNewsViewMode={setNewsViewMode}
        onRefresh={async () => { await loadNewsData(); notifyAprovacoesPendentes(); }}
        onTogglePublished={handleTogglePublished}
        onPreview={setPreviewModal}
      />}
      <AdminPreviewModal
        isOpen={previewModal.isOpen}
        type={previewModal.type}
        data={previewModal.data}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}

export default function AdminNoticiasSubroutePage() {
  return (
    <AdminShell activeSection="noticias">
      {(session) => (
        <Suspense fallback={<p role="status">Carregando notícias...</p>}>
          <NewsContent session={session} />
        </Suspense>
      )}
    </AdminShell>
  );
}
