'use client';

import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { medtecApi, ApiError, type NNoticia, type NCategoriaNoticia, getMediaUrl } from '@/lib/api';
import NewsModule from '@/components/admin/NewsModule';
import { notifyAprovacoesPendentes } from '@/components/admin/useAprovacoesPendentes';
import AdminShell, { type AdminSession } from '@/components/admin/AdminShell';
import { usePermissoes } from '@/components/admin/usePermissoes';
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
  // Cada botão segue a ação liberada no /auth/me para n_noticias.
  const { pode } = usePermissoes();
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
      await Promise.resolve();
      if (active) await loadNewsData();
    }
    void initialize();
    return () => { active = false; };
  }, [loadNewsData]);

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
    if (!pode('n_noticias', action)) return;
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
      {!loadingNews && !errorNews && newsViewMode === 'editor' && !(editId ? pode('n_noticias', 'update') : pode('n_noticias', 'create')) && (
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
        canCreate={pode('n_noticias', 'create')}
        canEdit={pode('n_noticias', 'update')}
        canDelete={pode('n_noticias', 'destroy')}
        canPublish={pode('n_noticias', 'publicar')}
        canUnpublish={pode('n_noticias', 'despublicar')}
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
