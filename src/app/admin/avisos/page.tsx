'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ApiError, medtecApi, AAviso, ATipoAviso } from '@/lib/api';
import AnnouncementsModule from '@/components/admin/AnnouncementsModule';
import AdminShell from '@/components/admin/AdminShell';
import { PreviewItemData, PreviewContentType } from '@/components/AdminLiveSimulator';

export default function AdminAvisosSubroutePage() {
  const [apiAvisos, setApiAvisos] = useState<AAviso[]>([]);
  const [apiTiposAviso, setApiTiposAviso] = useState<ATipoAviso[]>([]);
  const [loadingAvisos, setLoadingAvisos] = useState(true);
  const [errorAvisos, setErrorAvisos] = useState<string | null>(null);

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    type: PreviewContentType;
    data: PreviewItemData;
  }>({
    isOpen: false,
    type: 'aviso',
    data: {},
  });

  const handleReloadAvisos = useCallback(async () => {
    setLoadingAvisos(true);
    setErrorAvisos(null);
    try {
      const [tiposRes, avisosRes] = await Promise.all([
        medtecApi.tiposAviso.list({ page: 'all' }),
        medtecApi.avisos.list({ page: 'all' }),
      ]);
      if (!tiposRes.success || !Array.isArray(tiposRes.data?.items) ||
          !avisosRes.success || !Array.isArray(avisosRes.data?.items)) {
        throw new Error('Resposta inválida da API de Avisos.');
      }
      setApiTiposAviso(tiposRes.data.items);
      setApiAvisos(avisosRes.data.items);
    } catch (err) {
      setErrorAvisos(ApiError.getFriendlyMessage(err));
    } finally {
      setLoadingAvisos(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchAvisosInitial = async () => {
      try {
        const [tiposRes, avisosRes] = await Promise.all([
          medtecApi.tiposAviso.list({ page: 'all' }),
          medtecApi.avisos.list({ page: 'all' }),
        ]);
        if (!active) return;
        if (!tiposRes.success || !Array.isArray(tiposRes.data?.items) ||
            !avisosRes.success || !Array.isArray(avisosRes.data?.items)) {
          throw new Error('Resposta inválida da API de Avisos.');
        }
        setErrorAvisos(null);
        setApiTiposAviso(tiposRes.data.items);
        setApiAvisos(avisosRes.data.items);
      } catch (err) {
        if (!active) return;
        setErrorAvisos(ApiError.getFriendlyMessage(err));
      } finally {
        if (active) setLoadingAvisos(false);
      }
    };

    void fetchAvisosInitial();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell
      activeSection="avisos"
      badges={{ avisos: apiAvisos.length }}
      previewModalState={previewModal}
      setPreviewModalState={setPreviewModal}
    >
      <AnnouncementsModule
        apiAvisos={apiAvisos}
        setApiAvisos={setApiAvisos}
        apiTiposAviso={apiTiposAviso}
        setApiTiposAviso={setApiTiposAviso}
        loadingAvisos={loadingAvisos}
        errorAvisos={errorAvisos}
        onReload={handleReloadAvisos}
        onPreview={(avisoData) =>
          setPreviewModal({
            isOpen: true,
            type: 'aviso',
            data: avisoData,
          })
        }
      />
    </AdminShell>
  );
}
