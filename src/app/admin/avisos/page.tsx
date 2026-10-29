'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { medtecApi, AAviso, ATipoAviso } from '@/lib/api';
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

  const loadAvisosData = useCallback(async () => {
    setLoadingAvisos(true);
    setErrorAvisos(null);
    try {
      const [tiposRes, avisosRes] = await Promise.all([
        medtecApi.tiposAviso.list({ page: 'all' }),
        medtecApi.avisos.list({ page: 'all' }),
      ]);
      if (tiposRes.success && tiposRes.data?.items) {
        setApiTiposAviso(tiposRes.data.items);
      }
      if (avisosRes.success && avisosRes.data?.items) {
        setApiAvisos(avisosRes.data.items);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar avisos/tipos na subrota /admin/avisos:', err);
      setErrorAvisos('Falha ao comunicar com a API oficial de Avisos.');
    } finally {
      setLoadingAvisos(false);
    }
  }, []);

  useEffect(() => {
    void loadAvisosData();
  }, [loadAvisosData]);

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
