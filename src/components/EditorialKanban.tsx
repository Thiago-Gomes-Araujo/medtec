'use client';

import React, { useState, useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  FileText,
  Paperclip,
  Clock,
  FileCheck,
  Loader2,
  ExternalLink,
  Search,
  AlertCircle,
  X,
  XCircle,
  Inbox
} from 'lucide-react';
import { NewsItem } from '@/types';
import { ApiError } from '@/lib/api';

interface AuditLog {
  data: string;
  acao: string;
  titulo: string;
}

interface EditorialKanbanProps {
  news: NewsItem[];
  onApproveNews: (newsId: string) => Promise<boolean>;
  onRejectNews: (newsId: string, reason: string) => Promise<boolean>;
  loading?: boolean;
  error?: string | null;
  canApprove?: boolean;
  canReject?: boolean;
}

export default function EditorialKanban({
  news: allNews,
  onApproveNews,
  onRejectNews,
  loading = false,
  error = null,
  canApprove = false,
  canReject = false,
}: EditorialKanbanProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'pendentes' | 'publicadas' | 'recusadas' | 'todas' | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; item: NewsItem | null }>({
    isOpen: false,
    item: null,
  });
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; item: NewsItem | null }>({
    isOpen: false,
    item: null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [historico, setHistorico] = useState<AuditLog[]>([
    {
      data: new Date().toLocaleDateString('pt-BR'),
      acao: 'Painel Carregado',
      titulo: 'Sincronização com o CMS Central',
    },
  ]);

  // Contagens para os filtros
  const pendingNews = useMemo(() => allNews.filter((n) => n.published === false && !n.rejected), [allNews]);
  const publishedNews = useMemo(() => allNews.filter((n) => n.published !== false), [allNews]);
  const rejectedNews = useMemo(() => allNews.filter((n) => n.rejected === true), [allNews]);

  // Por padrão exibe 'todas' para que nenhuma notícia pareça ter desaparecido,
  // mantendo os contadores destacados em cada aba
  const activeFilter = selectedFilter ?? 'todas';

  // Filtra as notícias conforme busca e aba ativa
  const filteredNews = useMemo(() => {
    return allNews.filter((item) => {
      // Filtro de status
      if (activeFilter === 'pendentes' && (item.published !== false || item.rejected)) return false;
      if (activeFilter === 'publicadas' && item.published === false) return false;
      if (activeFilter === 'recusadas' && !item.rejected) return false;

      // Filtro de busca textual
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesAuthor = item.author?.toLowerCase().includes(query);
        return matchesTitle || matchesCategory || matchesAuthor;
      }

      return true;
    });
  }, [allNews, activeFilter, searchQuery]);

  // Execução da aprovação com persistência real
  const handleConfirmApproval = async () => {
    const item = confirmModal.item;
    if (!item || !canApprove || loading || error || approvingId || rejectingId) return;

    setApprovingId(item.id);
    setConfirmModal({ isOpen: false, item: null });

    try {
      const success = await onApproveNews(item.id);
      if (success) {
        // Registra evento no histórico de auditoria
        setHistorico((prev) => [
          {
            data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
            acao: 'Notícia Aprovada e Publicada',
            titulo: item.title,
          },
          ...prev,
        ]);

        setFeedback({
          type: 'success',
          message: `A notícia "${item.title}" foi aprovada e publicada oficialmente com sucesso!`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: 'Não foi possível aprovar a notícia. Verifique as permissões editoriais ou a conexão.',
        });
      }
    } catch (err) {
      console.error('Erro ao aprovar notícia:', err);
      setFeedback({
        type: 'error',
        message: ApiError.getFriendlyMessage(err),
      });
    } finally {
      setApprovingId(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Execução da recusa com persistência
  const handleConfirmReject = async () => {
    const item = rejectModal.item;
    if (!item || !canReject || loading || error || approvingId || rejectingId) return;

    if (!rejectReason || !rejectReason.trim()) {
      setFeedback({
        type: 'error',
        message: 'É obrigatório informar o motivo da reprovação da notícia.',
      });
      return;
    }

    setRejectingId(item.id);
    setRejectModal({ isOpen: false, item: null });

    try {
      const success = await onRejectNews(item.id, rejectReason.trim());
      if (success) {
        setHistorico((prev) => [
          {
            data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
            acao: 'Notícia Recusada',
            titulo: item.title,
          },
          ...prev,
        ]);

        setFeedback({
          type: 'success',
          message: `A notícia "${item.title}" foi recusada com sucesso.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: 'Não foi possível recusar a notícia. Verifique as permissões editoriais ou a conexão.',
        });
      }
    } catch (err) {
      console.error('Erro ao recusar notícia:', err);
      setFeedback({
        type: 'error',
        message: ApiError.getFriendlyMessage(err),
      });
    } finally {
      setRejectingId(null);
      setRejectReason('');
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center py-16 text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#004A99] dark:text-sky-400" />
        <span className="text-sm font-medium">Carregando notícias para aprovação...</span>
      </div>
    );
  }

  if (error) {
    return <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>;
  }

  return (
    <div className="space-y-8">
      {/* ========================================================
          FEEDBACK TOAST / ALERTA
      ======================================================== */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <p className="text-xs sm:text-sm font-semibold truncate">{feedback.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          1. FILTRO E BUSCA DE NOTÍCIAS PARA APROVAÇÃO
      ======================================================== */}
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#004A99] dark:text-sky-400" />
              <span>Decisão Editorial do Gestor</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Analise as reportagens cadastradas pela equipe e decida pela aprovação direta para publicação no portal oficial.
            </p>
          </div>

          {/* Abas Rápidas de Status */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#071324] border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedFilter('pendentes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'pendentes'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Pendentes</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeFilter === 'pendentes' ? 'bg-amber-700/50 text-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {pendingNews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('publicadas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'publicadas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Publicadas</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeFilter === 'publicadas' ? 'bg-emerald-800/50 text-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {publishedNews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('recusadas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'recusadas'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Recusadas</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeFilter === 'recusadas' ? 'bg-rose-800 text-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {rejectedNews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('todas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'todas'
                  ? 'bg-[#004A99] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Todas</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeFilter === 'todas' ? 'bg-blue-900/50 text-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {allNews.length}
              </span>
            </button>
          </div>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por título, autor ou categoria da reportagem..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#004A99]/30 dark:focus:ring-sky-500/30"
          />
        </div>
      </div>

      {/* ========================================================
          2. LISTA COMPACTA DE NOTÍCIAS PARA DECISÃO DO GESTOR
      ======================================================== */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div key="empty-state" className="bg-white dark:bg-[#0B1528] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center">
            <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              <span>{allNews.length === 0 ? 'Fila editorial aguardando matérias' : 'Nenhuma notícia encontrada'}</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-md">
              <span>
                {allNews.length === 0
                  ? 'A fila editorial exibirá as matérias enviadas para avaliação pelo CMS.'
                  : activeFilter === 'pendentes'
                  ? 'Não há matérias pendentes de avaliação no momento.'
                  : 'Nenhuma matéria corresponde aos filtros ou termos pesquisados.'}
              </span>
            </p>
            {allNews.length > 0 && activeFilter === 'pendentes' && (
              <button
                type="button"
                onClick={() => setSelectedFilter('todas')}
                className="mt-4 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                <span>Ver todas as notícias publicadas</span>
              </button>
            )}
          </div>
        ) : (
          filteredNews.map((item, idx) => {
            const isPublished = item.published !== false;
            const isCurrentlyApproving = approvingId === item.id;
            const hasAttachments = Boolean(item.coverImage);

            return (
              <div
                key={item.id ? `news-item-${item.id}` : `news-item-idx-${idx}`}
                className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-[#004A99]/40 dark:hover:border-sky-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Informações da Notícia */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge de Categoria */}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.category || 'Notícia'}
                    </span>

                    {/* Situação Atual */}
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Aprovada e Publicada</span>
                      </span>
                    ) : item.rejected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        <span>Recusada pelo Gestor</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>Pendente de Aprovação</span>
                      </span>
                    )}

                    {/* Data */}
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {item.publishedAt ? `Data: ${item.publishedAt}` : 'Data não informada'}
                    </span>
                  </div>

                  {/* Título Principal */}
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>

                  {/* Resumo do Conteúdo */}
                  {item.excerpt && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}

                  {/* Metadados: Autor e Indicador de Anexo */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Responsável: <strong className="font-semibold text-slate-700 dark:text-slate-300">{item.author || 'Redação SEDUC'}</strong>
                    </span>

                    {hasAttachments ? (
                      <span className="inline-flex items-center gap-1 text-[#004A99] dark:text-sky-400 font-medium">
                        <Paperclip className="w-3 h-3" />
                        <span>1 imagem/documento anexado</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Sem anexos</span>
                    )}
                  </div>
                </div>

                {/* Área de Ação Editorial do Gestor */}
                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80 shrink-0">
                  {isPublished ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Disponível no Portal</span>
                      </span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        Aprovada pelo gestor
                      </p>
                    </div>
                  ) : item.rejected ? (
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-800/60">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Recusada</span>
                      </span>
                      {canApprove && (
                        <button
                          type="button"
                          onClick={() => setConfirmModal({ isOpen: true, item })}
                          className="text-[11px] font-semibold text-[#004A99] dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Reavaliar e aprovar
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {/* Botão Recusar */}
                      <button
                        type="button"
                        disabled={rejectingId === item.id || isCurrentlyApproving || !canReject}
                        onClick={() => {
                          setRejectReason('');
                          setRejectModal({ isOpen: true, item });
                        }}
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold transition shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Recusar notícia"
                      >
                        {rejectingId === item.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Recusando...</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span>Recusar</span>
                          </>
                        )}
                      </button>

                      {/* Botão Aprovar Notícia */}
                      <button
                        type="button"
                        disabled={isCurrentlyApproving || rejectingId === item.id || !canApprove}
                        onClick={() => setConfirmModal({ isOpen: true, item })}
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Aprovar e publicar imediatamente no portal"
                      >
                        {isCurrentlyApproving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Aprovando...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Aprovar notícia</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          3. SEÇÃO SECUNDÁRIA: DOCUMENTOS ANEXADOS & AUDITORIA
      ======================================================== */}
      <div className="grid gap-6 lg:grid-cols-2 items-start pt-4 border-t border-slate-200/80 dark:border-slate-800">
        {/* TABELA COMPACTA DE DOCUMENTOS */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#004A99] dark:text-sky-400" />
              <span>Documentos e Anexos Auditados</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {allNews.filter((n) => n.coverImage).length} anexos
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1528] shadow-xs">
            <div className="overflow-x-auto max-h-[340px] overflow-y-auto scrollbar-thin">
              <table className="w-full min-w-[500px] text-xs text-left">
                <thead className="sticky top-0 bg-slate-50 dark:bg-[#071324] text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 z-10">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Notícia</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Link do Anexo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {allNews.length === 0 ? (
                    <tr key="empty-anexos">
                      <td colSpan={3} className="py-4 px-3 text-center text-slate-400 italic">
                        <span>Nenhum anexo encontrado.</span>
                      </td>
                    </tr>
                  ) : (
                    allNews.map((item, idx) => {
                      const anexo = item.coverImage;
                      const isUrl = anexo?.startsWith('http://') || anexo?.startsWith('https://');
                      const displayName = anexo && anexo.length > 26
                        ? `${anexo.substring(0, 14)}...${anexo.substring(anexo.length - 8)}`
                        : anexo;

                      return (
                        <tr key={item.id ? `anexo-${item.id}` : `anexo-idx-${idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100 max-w-[180px] truncate">
                          {item.title}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.published !== false
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}>
                            {item.published !== false ? 'Publicada' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {anexo ? (
                            isUrl ? (
                              <a
                                href={anexo}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Abrir anexo original: ${anexo}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 hover:text-[#004A99] dark:text-slate-300 font-mono text-[10px] max-w-[200px]"
                              >
                                <Paperclip className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                <span className="truncate">{displayName}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                              </a>
                            ) : (
                              <span
                                title={anexo}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] max-w-[200px]"
                              >
                                <FileCheck className="w-2.5 h-2.5 shrink-0 text-[#004A99]" />
                                <span className="truncate">{displayName}</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 italic">Sem anexo</span>
                          )}
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TIMELINE DE AUDITORIA */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#004A99] dark:text-sky-400" />
              <span>Histórico de Aprovação e Auditoria</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {historico.length} registros
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1528] p-4 shadow-xs">
            <ol className="space-y-3 max-h-[308px] overflow-y-auto scrollbar-thin pr-1">
              {historico.map((log, idx) => (
                <li
                  key={idx}
                  className="border-l-2 border-[#004A99] dark:border-sky-400 pl-3 py-1 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 rounded-r-lg"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.acao}</p>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.data}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={log.titulo}>
                    {log.titulo}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MODAL DE CONFIRMAÇÃO EXPLÍCITA ANTES DE APROVAR
      ======================================================== */}
      {confirmModal.isOpen && confirmModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#004A99] dark:text-sky-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Confirmar Aprovação
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ação restrita a usuários com permissão editorial
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, item: null })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Notícia a ser aprovada:
              </span>
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-snug">
                {confirmModal.item.title}
              </p>
              <p className="text-[11px] text-slate-500">
                Categoria: {confirmModal.item.category || 'Geral'} · Autor: {confirmModal.item.author || 'SEDUC'}
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Ao confirmar a aprovação, a notícia será <strong>veiculada oficialmente no portal público</strong> do MEDTEC Rondônia e ficará visível para toda a rede de ensino.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, item: null })}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!canApprove || !!approvingId || !!rejectingId}
                onClick={handleConfirmApproval}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Sim, aprovar notícia</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================
          5. MODAL DE CONFIRMAÇÃO EXPLÍCITA DE RECUSA
      ======================================================== */}
      {rejectModal.isOpen && rejectModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Confirmar Recusa da Notícia
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ação editorial do Gestor Geral
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, item: null })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Notícia a ser recusada:
              </span>
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-snug">
                {rejectModal.item.title}
              </p>
              <p className="text-[11px] text-slate-500">
                Categoria: {rejectModal.item.category || 'Geral'} · Autor: {rejectModal.item.author || 'SEDUC'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rejectReasonInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Motivo da recusa (opcional para orientar a equipe):
              </label>
              <textarea
                id="rejectReasonInput"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex.: Necessita revisão do texto, verificar fontes ou adequar imagem..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/50 resize-none"
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              A notícia <strong>não será veiculada</strong> no portal público e permanecerá registrada como recusada na gestão editorial.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, item: null })}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!canReject || !!approvingId || !!rejectingId}
                onClick={handleConfirmReject}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Sim, recusar notícia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

