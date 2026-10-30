'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ApiError, type CanalContato } from '@/lib/api';
import SocialChannelsModule from '@/components/admin/SocialChannelsModule';
import AdminShell from '@/components/admin/AdminShell';
import { getChannelChanges, readAdminChannels, saveAdminChannels } from '@/lib/admin-channels';

function ChannelsContent() {
  const [official, setOfficial] = useState<CanalContato[] | null>(null);
  const [apiCanais, setApiCanais] = useState<CanalContato[]>([]);
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [readVersion, setReadVersion] = useState(0);
  const savePending = useRef(false);

  useEffect(() => {
    let active = true;
    async function load() {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      setOfficial(null);
      setReadError(null);
      try {
        const channels = await readAdminChannels();
        if (active) {
          setOfficial(channels);
          setApiCanais(channels);
        }
      } catch (error) {
        if (active) setReadError(ApiError.getFriendlyMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [readVersion]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || readError || !official || savePending.current) return;
    savePending.current = true;
    setSaving(true);
    setSaveError(null);
    setNotice(null);
    try {
      const channels = await saveAdminChannels(official, apiCanais);
      if (channels) {
        setOfficial(channels);
        setApiCanais(channels);
        setNotice('Alterações confirmadas pela API oficial.');
      }
    } catch (error) {
      setSaveError(ApiError.getFriendlyMessage(error));
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  };

  if (loading) return (
    <div role="status" className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-[#004A99] dark:text-sky-400" />
      <span className="text-xs font-medium">Carregando canais oficiais de contato...</span>
    </div>
  );

  if (readError || official === null) return (
    <div role="alert" className="rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 space-y-2">
      <p>{readError || 'Não foi possível carregar os canais oficiais.'}</p>
      <p>A gravação está bloqueada até que os canais sejam carregados com sucesso.</p>
      <button type="button" onClick={() => setReadVersion((version) => version + 1)} className="font-bold underline cursor-pointer">
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {saveError && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{saveError}</p>}
      {notice && <p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}
      <SocialChannelsModule
        apiCanais={apiCanais}
        setApiCanais={(action) => {
          setNotice(null);
          setSaveError(null);
          setApiCanais(action);
        }}
        onSave={handleSave}
        saving={saving}
        canSave={getChannelChanges(official, apiCanais).length > 0}
      />
    </div>
  );
}

export default function AdminRedesSubroutePage() {
  return (
    <AdminShell activeSection="redes">
      {() => <ChannelsContent />}
    </AdminShell>
  );
}
