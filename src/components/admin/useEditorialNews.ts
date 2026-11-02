'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ApiError, getMediaUrl, medtecApi, type NNoticia } from '@/lib/api';
import type { NewsItem } from '@/types';

interface EditorialPermissions {
  canApprove?: boolean;
  canReject?: boolean;
}

// Uma coleção por montagem: o proprietário decide quando carregar e compartilha
// a mesma leitura oficial com a fila e os indicadores, sem efeitos de busca ocultos.
export function useEditorialNews({ canApprove = false, canReject = false }: EditorialPermissions = {}) {
  const [apiNews, setApiNews] = useState<NNoticia[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);
  const pendingRead = useRef<Promise<void> | null>(null);

  const reload = useCallback((): Promise<void> => {
    if (pendingRead.current) return pendingRead.current;
    setLoadingNews(true);
    setErrorNews(null);
    const request = (async () => {
      try {
        const response = await medtecApi.noticias.list({ page: 'all' });
        if (!response.success || !Array.isArray(response.data?.items)) {
          throw new Error('Resposta inválida da API de Notícias.');
        }
        setApiNews(response.data.items);
      } catch (error) {
        // Não substitui a última leitura válida por [] em caso de falha.
        setErrorNews(ApiError.getFriendlyMessage(error));
      } finally {
        setLoadingNews(false);
        pendingRead.current = null;
      }
    })();
    pendingRead.current = request;
    return request;
  }, []);

  const effectiveNews: NewsItem[] = useMemo(() => apiNews.map((news) => ({
    id: String(news.id),
    title: news.titulo,
    slug: news.slug,
    excerpt: news.resumo || '',
    content: news.conteudo,
    coverImage: getMediaUrl(news.imagem_capa),
    author: news.autor_nome,
    category: news.categoria_nome,
    publishedAt: news.data_publicacao,
    folder: news.categoria_nome || 'Geral',
    published: news.status === 'publicada',
    rejected: news.status === 'reprovada',
    rejectionReason: news.motivo_reprovacao || undefined,
    views: 0,
    tags: [],
  })), [apiNews]);

  const approveNews = useCallback(async (id: string): Promise<boolean> => {
    if (!canApprove) throw new Error('Você não possui permissão para publicar notícias.');
    const newsId = Number(id);
    if (!Number.isSafeInteger(newsId) || newsId <= 0) throw new Error('Notícia inválida.');
    await medtecApi.noticias.publicar(newsId);
    // Uma leitura iniciada antes da mutação não pode ser a atualização pós-decisão.
    await pendingRead.current;
    await reload();
    return true;
  }, [canApprove, reload]);

  const rejectNews = useCallback(async (id: string, reason: string): Promise<boolean> => {
    if (!canReject) throw new Error('Você não possui permissão para reprovar notícias.');
    const newsId = Number(id);
    if (!Number.isSafeInteger(newsId) || newsId <= 0) throw new Error('Notícia inválida.');
    if (!reason.trim()) throw new Error('É obrigatório informar o motivo da reprovação.');
    await medtecApi.noticias.reprovar(newsId, reason.trim());
    await pendingRead.current;
    await reload();
    return true;
  }, [canReject, reload]);

  return { apiNews, effectiveNews, loadingNews, errorNews, reload, approveNews, rejectNews };
}
