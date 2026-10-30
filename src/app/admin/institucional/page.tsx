'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import SiteInfoModule from '@/components/admin/SiteInfoModule';
import AdminShell from '@/components/admin/AdminShell';
import { PreviewItemData, PreviewContentType } from '@/components/AdminLiveSimulator';
import type { DatabaseSchema } from '@/types';

export default function AdminInstitucionalSubroutePage() {
  const [data, setData] = useState<DatabaseSchema | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    type: PreviewContentType;
    data: PreviewItemData;
  }>({
    isOpen: false,
    type: 'siteInfo',
    data: {},
  });

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados institucionais de /api/data:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <AdminShell
      activeSection="siteInfo"
      previewModalState={previewModal}
      setPreviewModalState={setPreviewModal}
    >
      {loadingData || !data ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#004A99] dark:text-sky-400" />
          <span className="text-xs font-medium">Carregando informações institucionais...</span>
        </div>
      ) : (
        <SiteInfoModule
          data={data}
          setData={setData}
          onPreview={(siteData) =>
            setPreviewModal({
              isOpen: true,
              type: 'siteInfo',
              data: siteData as unknown as PreviewItemData,
            })
          }
        />
      )}
    </AdminShell>
  );
}
