'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { medtecApi, Estado } from '@/lib/api';
import EstadosCidadesModule from '@/components/admin/EstadosCidadesModule';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminEstadosCidadesSubroutePage() {
  const [apiEstados, setApiEstados] = useState<Estado[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);

  const loadEstadosData = useCallback(async () => {
    setLoadingEstados(true);
    try {
      const res = await medtecApi.estados.list({ page: 'all' });
      if (res.success && res.data?.items) {
        setApiEstados(res.data.items);
      }
    } catch (err) {
      console.warn('API v1: Erro ao listar estados na subrota /admin/estados-cidades:', err);
    } finally {
      setLoadingEstados(false);
    }
  }, []);

  useEffect(() => {
    void loadEstadosData();
  }, [loadEstadosData]);

  return (
    <AdminShell
      activeSection="estadosCidades"
      badges={{ estadosCidades: apiEstados.length > 0 ? apiEstados.length : undefined }}
    >
      <EstadosCidadesModule
        apiEstados={apiEstados}
        setApiEstados={setApiEstados}
        loadingEstados={loadingEstados}
      />
    </AdminShell>
  );
}
