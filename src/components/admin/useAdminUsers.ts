'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, medtecApi, type Perfil, type Usuario } from '@/lib/api';

// Compartilha a leitura oficial com o gerenciador e os indicadores do painel.
// A autorização de cada operação continua sendo verificada pelo Rails.
// Sem index em perfis, a lista de perfis nem é consultada (evita o 403).
export function useAdminUsers({ enabled, perfis = enabled }: { enabled: boolean; perfis?: boolean }) {
  const [apiUsers, setApiUsers] = useState<Usuario[]>([]);
  const [profiles, setProfiles] = useState<Perfil[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorProfiles, setErrorProfiles] = useState<string | null>(null);
  const usersRequest = useRef(0);
  const profilesRequest = useRef(0);

  const reloadUsers = useCallback(async (): Promise<void> => {
    if (!enabled) return;
    const request = ++usersRequest.current;
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const response = await medtecApi.usuarios.list({ page: 1, per_page: 50 });
      if (!response.success || !Array.isArray(response.data?.items) ||
          !Number.isSafeInteger(response.data.pagination?.total_count) || response.data.pagination.total_count < 0) {
        throw new Error('Resposta inválida da API de Usuários.');
      }
      if (request !== usersRequest.current) return;
      setApiUsers(response.data.items);
      setTotalUsers(response.data.pagination.total_count);
    } catch (error) {
      if (request === usersRequest.current) setErrorUsers(ApiError.getFriendlyMessage(error));
    } finally {
      if (request === usersRequest.current) setLoadingUsers(false);
    }
  }, [enabled]);

  const reloadProfiles = useCallback(async (): Promise<void> => {
    if (!enabled) return;
    if (!perfis) {
      setLoadingProfiles(false);
      return;
    }
    const request = ++profilesRequest.current;
    setLoadingProfiles(true);
    setErrorProfiles(null);
    try {
      const response = await medtecApi.perfis.list({ page: 'all' });
      if (!response.success || !Array.isArray(response.data?.items)) {
        throw new Error('Resposta inválida da API de Perfis.');
      }
      if (request === profilesRequest.current) setProfiles(response.data.items);
    } catch (error) {
      if (request === profilesRequest.current) setErrorProfiles(ApiError.getFriendlyMessage(error));
    } finally {
      if (request === profilesRequest.current) setLoadingProfiles(false);
    }
  }, [enabled, perfis]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) {
        void reloadUsers();
        void reloadProfiles();
      }
    });
    return () => {
      cancelled = true;
      // Ignora leituras antigas, inclusive após desmontagem ou perda de acesso.
      usersRequest.current += 1;
      profilesRequest.current += 1;
    };
  }, [reloadUsers, reloadProfiles]);

  return {
    apiUsers, profiles, totalUsers, loadingUsers, loadingProfiles,
    errorUsers, errorProfiles, reloadUsers, reloadProfiles,
  };
}

export type AdminUsersData = ReturnType<typeof useAdminUsers>;
