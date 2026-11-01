'use client';

import React, { useState, useEffect } from 'react';
import { medtecApi, Estado } from '@/lib/api';
import EstadosCidadesModule from '@/components/admin/EstadosCidadesModule';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminEstadosCidadesSubroutePage() {
  const [apiEstados, setApiEstados] = useState<Estado[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchEstados = async () => {
      try {
        const res = await medtecApi.estados.list({ page: 'all' });
        if (active && res.success && res.data?.items) {
          setApiEstados(res.data.items);
        }
      } catch (err) {
        console.warn('API v1: Erro ao listar estados na subrota /admin/estados-cidades:', err);
      } finally {
        if (active) setLoadingEstados(false);
      }
    };

    void fetchEstados();
    return () => {
      active = false;
    };
  }, []);

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
