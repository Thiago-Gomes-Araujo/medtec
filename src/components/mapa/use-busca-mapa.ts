'use client';

import { useState, useMemo, useEffect } from 'react';
import { FiltrosMapa, EstatisticasMapa, RotaResposta } from './types';
import { normalizarEscolas, filtrarPontosMapa, HUB_SEDUC_COORDENADAS } from './api';
import { buscarRota } from './rota';

export function useBuscaMapa() {
  const [filtros, setFiltros] = useState<FiltrosMapa>({
    municipio: 'Todos',
    tipo: 'todas',
    busca: '',
  });

  const [selectedIdState, setSelectedId] = useState<string | number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [rotaAtiva, setRotaAtiva] = useState<RotaResposta | null>(null);
  const [carregandoRota, setCarregandoRota] = useState(false);

  // Normalização inicial dos dados (elimina itens sem coordenadas válidas)
  const todosPontos = useMemo(() => normalizarEscolas(), []);

  // Filtragem reativa
  const pontosFiltrados = useMemo(() => {
    return filtrarPontosMapa(todosPontos, filtros);
  }, [todosPontos, filtros]);

  // Estatísticas dinâmicas (KPIs)
  const estatisticas: EstatisticasMapa = useMemo(() => {
    return pontosFiltrados.reduce(
      (acc, curr) => ({
        totalEscolas: acc.totalEscolas + 1,
        turmas: acc.turmas + curr.turmas,
        alunos: acc.alunos + curr.alunos,
      }),
      { totalEscolas: 0, turmas: 0, alunos: 0 }
    );
  }, [pontosFiltrados]);

  // Garante que o ID selecionado seja válido na lista atual (sem causar cascading renders)
  const selectedId = useMemo(() => {
    if (pontosFiltrados.length === 0) return null;
    if (
      selectedIdState !== null &&
      pontosFiltrados.some((p) => p.id === selectedIdState)
    ) {
      return selectedIdState;
    }
    return pontosFiltrados[0].id;
  }, [pontosFiltrados, selectedIdState]);

  // Ponto atualmente selecionado
  const pontoSelecionado = useMemo(() => {
    if (selectedId === null) return null;
    return pontosFiltrados.find((p) => p.id === selectedId) || null;
  }, [pontosFiltrados, selectedId]);

  // Ponto sob hover
  const pontoHovered = useMemo(() => {
    if (hoveredId === null) return null;
    return pontosFiltrados.find((p) => p.id === hoveredId) || null;
  }, [pontosFiltrados, hoveredId]);

  // Ponto ativo para exibição de rota / telemetria (hover tem prioridade temporária, ou selecionado)
  const pontoAtivo = pontoHovered || pontoSelecionado;

  // Atualização da rota entre o Hub SEDUC em Porto Velho e o ponto ativo
  useEffect(() => {
    let isMounted = true;

    async function atualizarRota() {
      if (!pontoAtivo) {
        setRotaAtiva(null);
        return;
      }

      setCarregandoRota(true);

      const destinoCoord: [number, number] = [
        pontoAtivo.latitude,
        pontoAtivo.longitude,
      ];

      try {
        const resultado = await buscarRota(HUB_SEDUC_COORDENADAS, destinoCoord);
        if (isMounted) {
          setRotaAtiva(resultado);
        }
      } catch {
        if (isMounted) {
          setRotaAtiva({
            coordenadas: [HUB_SEDUC_COORDENADAS, destinoCoord],
            modo: 'direto',
          });
        }
      } finally {
        if (isMounted) {
          setCarregandoRota(false);
        }
      }
    }

    atualizarRota();

    return () => {
      isMounted = false;
    };
  }, [pontoAtivo]);

  return {
    filtros,
    setFiltros,
    pontos: pontosFiltrados,
    totalPontos: todosPontos.length,
    selectedId,
    setSelectedId,
    hoveredId,
    setHoveredId,
    pontoSelecionado,
    pontoHovered,
    pontoAtivo,
    rotaAtiva,
    carregandoRota,
    estatisticas,
    hubCoordenadas: HUB_SEDUC_COORDENADAS,
  };
}
