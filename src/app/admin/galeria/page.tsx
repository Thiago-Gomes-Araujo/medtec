'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { medtecApi, FotoGaleria, CategoriaGaleria } from '@/lib/api';
import GalleryModule from '@/components/admin/GalleryModule';
import AdminShell from '@/components/admin/AdminShell';
import { PreviewItemData, PreviewContentType } from '@/components/AdminLiveSimulator';

export default function AdminGaleriaSubroutePage() {
  const [apiFotos, setApiFotos] = useState<FotoGaleria[]>([]);
  const [apiCategorias, setApiCategorias] = useState<CategoriaGaleria[]>([]);
  const [loadingFotos, setLoadingFotos] = useState(true);
  const [errorFotos, setErrorFotos] = useState<string | null>(null);

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    type: PreviewContentType;
    data: PreviewItemData;
  }>({
    isOpen: false,
    type: 'galeria',
    data: {},
  });

  const loadGalleryData = useCallback(async () => {
    setLoadingFotos(true);
    setErrorFotos(null);
    try {
      const [catsRes, fotosRes] = await Promise.all([
        medtecApi.categoriasGaleria.list({ page: 'all' }),
        medtecApi.fotosGaleria.list({ page: 'all' }),
      ]);
      if (catsRes.success && catsRes.data?.items) {
        setApiCategorias(catsRes.data.items);
      }
      if (fotosRes.success && fotosRes.data?.items) {
        setApiFotos(fotosRes.data.items);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar galeria/categorias na subrota /admin/galeria:', err);
      setErrorFotos('Falha ao comunicar com a API oficial da Galeria.');
    } finally {
      setLoadingFotos(false);
    }
  }, []);

  useEffect(() => {
    void loadGalleryData();
  }, [loadGalleryData]);

  return (
    <AdminShell
      activeSection="galeria"
      badges={{ galeria: apiFotos.length }}
      previewModalState={previewModal}
      setPreviewModalState={setPreviewModal}
    >
      <GalleryModule
        apiFotos={apiFotos}
        setApiFotos={setApiFotos}
        apiCategorias={apiCategorias}
        setApiCategorias={setApiCategorias}
        loadingFotos={loadingFotos}
        errorFotos={errorFotos}
        onPreview={(photoData) =>
          setPreviewModal({
            isOpen: true,
            type: 'galeria',
            data: photoData,
          })
        }
      />
    </AdminShell>
  );
}
