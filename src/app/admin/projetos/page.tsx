'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ProjectsModule, { type ProjectViewMode, type ProjectsModuleHandle } from '@/components/admin/ProjectsModule';
import { readAdminProjects } from '@/lib/admin-projects';
import { ApiError } from '@/lib/api';
import type { ProjectMission } from '@/types';

// O shell só monta este conteúdo depois de confirmar o acesso de gestor.
function ProjectsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const createNew = params.get('action') === 'new';
  const entryKey = `${router.bfcacheId}:${createNew ? 'new' : 'list'}`;
  const appliedEntry = useRef<string | null>(null);
  const moduleRef = useRef<ProjectsModuleHandle>(null);
  const [projects, setProjects] = useState<ProjectMission[] | null>(null);
  const [viewMode, setViewMode] = useState<ProjectViewMode>('lista');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readVersion, setReadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setLoading(true);
      setError(null);
      try {
        const items = await readAdminProjects(controller.signal);
        if (!controller.signal.aborted) setProjects(items);
      } catch (err) {
        if (!controller.signal.aborted) setError(ApiError.getFriendlyMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [readVersion]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active || loading || projects === null || !moduleRef.current || appliedEntry.current === entryKey) return;
      // Aplica o atalho uma vez por entrada, sem reiniciar o rascunho em recargas.
      appliedEntry.current = entryKey;
      if (createNew) moduleRef.current.newProject();
      else setViewMode('lista');
    });
    return () => { active = false; };
  }, [projects, loading, createNew, entryKey]);

  return (
    <div className="space-y-6">
      {loading && <p role="status" className="text-xs text-slate-500">Carregando projetos...</p>}
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 space-y-2">
          <p>{error}</p>
          <button type="button" disabled={loading} onClick={() => setReadVersion((version) => version + 1)} className="font-bold underline cursor-pointer disabled:opacity-60">
            Tentar novamente
          </button>
        </div>
      )}
      {viewMode === 'editor' && (
        <p role="note" className="text-xs text-slate-500 dark:text-slate-400">
          O rascunho fica apenas em memória e pode ser perdido ao sair desta rota ou atualizar a página.
        </p>
      )}
      {/* Recargas e erros posteriores mantêm o editor e seu estado de upload montados. */}
      {projects !== null && (
        <ProjectsModule ref={moduleRef} projects={projects} viewMode={viewMode} onViewModeChange={setViewMode} />
      )}
    </div>
  );
}

export default function AdminProjetosSubroutePage() {
  return (
    <AdminShell activeSection="projetos">
      {() => (
        <Suspense fallback={<p role="status">Carregando projetos...</p>}>
          <ProjectsContent />
        </Suspense>
      )}
    </AdminShell>
  );
}
