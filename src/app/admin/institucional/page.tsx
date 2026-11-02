'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import SiteInfoModule from '@/components/admin/SiteInfoModule';
import HomePillarsModule from '@/components/admin/HomePillarsModule';
import AdminShell from '@/components/admin/AdminShell';
import {
  AdminPreviewModal,
  type PreviewItemData,
  type PreviewContentType,
} from '@/components/AdminLiveSimulator';
import { fetchWithTimeout } from '@/lib/api';
import type { DatabaseSchema } from '@/types';

function SiteInfoWorkspace() {
  const [data, setData] = useState<DatabaseSchema | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState<string | null>(null);

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    type: PreviewContentType;
    data: PreviewItemData;
  }>({
    isOpen: false,
    type: 'siteInfo',
    data: {},
  });

  const [readVersion, setReadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setLoadingData(true);
      setErrorData(null);
      try {
        const res = await fetchWithTimeout('/api/data', { cache: 'no-store', signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Falha ao carregar dados institucionais (HTTP ${res.status}).`);
        }
        const json = (await res.json()) as DatabaseSchema;
        if (!controller.signal.aborted) {
          setData(json);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setErrorData(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar as informações institucionais.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingData(false);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [readVersion]);

  if (loadingData) {
    return (
      <div
        role="status"
        className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3"
      >
        <Loader2 className="h-6 w-6 animate-spin text-[#004A99] dark:text-sky-400" />
        <span className="text-xs font-medium">Carregando informações institucionais...</span>
      </div>
    );
  }

  if (errorData || !data) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-700 dark:text-rose-300 space-y-2"
      >
        <p>{errorData || 'Dados institucionais indisponíveis no momento.'}</p>
        <button
          type="button"
          onClick={() => setReadVersion((version) => version + 1)}
          className="font-bold underline cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
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
      <AdminPreviewModal
        isOpen={previewModal.isOpen}
        type={previewModal.type}
        data={previewModal.data}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}

function InstitucionalWorkspace() {
  const [section, setSection] = useState<'pilares' | 'indicadores'>('pilares');
  const [indicadoresMounted, setIndicadoresMounted] = useState(false);

  const handleSelectSection = (next: 'pilares' | 'indicadores') => {
    if (next === 'indicadores') {
      setIndicadoresMounted(true);
    }
    setSection(next);
  };

  return (
    <div className="space-y-6">
      <nav
        aria-label="Seções de Conteúdo Institucional e da Home"
        className="flex flex-wrap gap-2"
      >
        {(['pilares', 'indicadores'] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={section === key}
            onClick={() => handleSelectSection(key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer ${
              section === key
                ? 'bg-[#004A99] text-white'
                : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {key === 'pilares'
              ? 'Quatro Pilares da Home'
              : 'Textos do Hero e Indicadores'}
          </button>
        ))}
      </nav>

      {/* Ambos os módulos permanecem montados após abertura para preservar o rascunho em memória ao alternar abas. */}
      <div hidden={section !== 'pilares'}>
        <HomePillarsModule active={section === 'pilares'} />
      </div>

      {(indicadoresMounted || section === 'indicadores') && (
        <div hidden={section !== 'indicadores'}>
          <SiteInfoWorkspace />
        </div>
      )}
    </div>
  );
}

export default function AdminInstitucionalSubroutePage() {
  return (
    <AdminShell activeSection="siteInfo">
      {() => <InstitucionalWorkspace />}
    </AdminShell>
  );
}
