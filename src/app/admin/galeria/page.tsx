'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ApiError, medtecApi, FotoGaleria, CategoriaGaleria } from '@/lib/api';
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

  const handleReloadGallery = useCallback(async () => {
    setLoadingFotos(true);
    setErrorFotos(null);
    try {
      const [catsRes, fotosRes] = await Promise.all([
        medtecApi.categoriasGaleria.list({ page: 'all' }),
        medtecApi.fotosGaleria.list({ page: 'all' }),
      ]);
      if (!catsRes.success || !Array.isArray(catsRes.data?.items) ||
          !fotosRes.success || !Array.isArray(fotosRes.data?.items)) {
        throw new Error('Resposta inválida da API de Galeria.');
      }
      setApiCategorias(catsRes.data.items);
      setApiFotos(fotosRes.data.items);
    } catch (err) {
      setErrorFotos(ApiError.getFriendlyMessage(err));
    } finally {
      setLoadingFotos(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchGalleryInitial = async () => {
      try {
        const [catsRes, fotosRes] = await Promise.all([
          medtecApi.categoriasGaleria.list({ page: 'all' }),
          medtecApi.fotosGaleria.list({ page: 'all' }),
        ]);
        if (!active) return;
        if (!catsRes.success || !Array.isArray(catsRes.data?.items) ||
            !fotosRes.success || !Array.isArray(fotosRes.data?.items)) {
          throw new Error('Resposta inválida da API de Galeria.');
        }
        setErrorFotos(null);
        setApiCategorias(catsRes.data.items);
        setApiFotos(fotosRes.data.items);
      } catch (err) {
        if (!active) return;
        setErrorFotos(ApiError.getFriendlyMessage(err));
      } finally {
        if (active) setLoadingFotos(false);
      }
    };

    void fetchGalleryInitial();
    return () => {
      active = false;
    };
  }, []);

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
        onReload={handleReloadGallery}
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
