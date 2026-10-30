'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { medtecApi, CanalContato } from '@/lib/api';
import SocialChannelsModule from '@/components/admin/SocialChannelsModule';
import AdminShell from '@/components/admin/AdminShell';
import type { SocialLinks } from '@/types';

export default function AdminRedesSubroutePage() {
  const [apiCanais, setApiCanais] = useState<CanalContato[]>([]);
  const [defaultSocials, setDefaultSocials] = useState<SocialLinks | undefined>(undefined);
  const [loadingCanais, setLoadingCanais] = useState(true);
  const [savingCanais, setSavingCanais] = useState(false);

  const loadCanaisData = useCallback(async () => {
    setLoadingCanais(true);
    try {
      const [canaisRes, dataRes] = await Promise.allSettled([
        medtecApi.canaisContato.list({ page: 'all' }),
        fetch('/api/data').then((res) => (res.ok ? res.json() : null)),
      ]);

      if (canaisRes.status === 'fulfilled' && canaisRes.value.success && canaisRes.value.data?.items) {
        setApiCanais(canaisRes.value.data.items);
      }

      if (dataRes.status === 'fulfilled' && dataRes.value?.socials) {
        setDefaultSocials(dataRes.value.socials);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar canais de contato na subrota /admin/redes:', err);
    } finally {
      setLoadingCanais(false);
    }
  }, []);

  useEffect(() => {
    void loadCanaisData();
  }, [loadCanaisData]);

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCanais(true);
    try {
      const fixedKeys = ['youtube', 'instagram', 'facebook', 'whatsapp', 'telefone', 'email', 'endereco'] as const;
      const payload = fixedKeys.map((rede, idx) => {
        const found = apiCanais.find((c) => c.rede === rede);
        const fallbackValue =
          rede === 'youtube'
            ? defaultSocials?.youtube || ''
            : rede === 'instagram'
            ? defaultSocials?.instagram || ''
            : rede === 'facebook'
            ? defaultSocials?.facebook || ''
            : rede === 'whatsapp'
            ? defaultSocials?.whatsapp || ''
            : rede === 'telefone'
            ? defaultSocials?.phone || ''
            : rede === 'email'
            ? defaultSocials?.email || ''
            : defaultSocials?.address || '';
        return {
          rede,
          valor: found?.valor !== undefined && found.valor !== '' ? found.valor : fallbackValue,
          posicao: found?.posicao !== undefined ? Number(found.posicao) : idx + 1,
          ativo: found?.ativo !== undefined ? Boolean(found.ativo) : true,
        };
      });

      const res = await medtecApi.canaisContato.updateMany(payload);
      if (res.success && res.data) {
        setApiCanais(res.data);
      }

      alert('Canais de atendimento e redes oficiais salvos com sucesso na API oficial!');
    } catch (err: unknown) {
      const errorData = err as { message?: string; errors?: string[] };
      alert(
        `Erro ao salvar canais na API oficial: ${
          errorData.message || errorData.errors?.join(', ') || 'Falha na requisição'
        }`
      );
    } finally {
      setSavingCanais(false);
    }
  };

  return (
    <AdminShell activeSection="redes">
      {loadingCanais ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#004A99] dark:text-sky-400" />
          <span className="text-xs font-medium">Carregando canais oficiais de contato...</span>
        </div>
      ) : (
        <SocialChannelsModule
          apiCanais={apiCanais}
          setApiCanais={setApiCanais}
          defaultSocials={defaultSocials}
          onSave={handleSaveSocials}
          saving={savingCanais}
        />
      )}
    </AdminShell>
  );
}
