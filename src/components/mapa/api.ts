import { escolasData, Escola } from '@/data/medtecData';
import { PontoMapa, FiltrosMapa, Coordenada } from './types';

// Hub Emissor Central da SEDUC (Porto Velho - Rondônia)
export const HUB_SEDUC_COORDENADAS: Coordenada = [-8.7619, -63.9039];

/**
 * Converte coordenadas em formato texto ("-8.03° S", "-62.86° W") ou numérico em float
 */
export function parseCoordenada(valor?: string | number): number | null {
  if (valor === undefined || valor === null) return null;
  if (typeof valor === 'number') return isNaN(valor) ? null : valor;

  // Remove caracteres que não sejam dígitos, sinal de menos ou ponto
  const limpo = valor
    .replace(/[°º]/g, '')
    .replace(/\s+/g, '')
    .trim();

  // Verifica se tem 'S' ou 'W' para garantir que seja negativo se ainda não tiver o sinal
  const isSouthOrWest = /[SWsw]$/.test(limpo);
  const numStr = limpo.replace(/[NSEWnsew]/g, '');
  const parsed = parseFloat(numStr);

  if (isNaN(parsed)) return null;

  if (isSouthOrWest && parsed > 0) {
    return -parsed;
  }
  return parsed;
}

/**
 * Normaliza a base de dados de escolas para o formato PontoMapa exigido pelo mapa.
 * Remove automaticamente pontos com coordenadas inválidas (Regra 5 do guia).
 */
export function normalizarEscolas(dados: Escola[] = escolasData): PontoMapa[] {
  const pontos: PontoMapa[] = [];

  for (const escola of dados) {
    const lat = parseCoordenada(escola.lat);
    const lng = parseCoordenada(escola.lon);

    // Validação estrita de coordenadas geográficas válidas para Rondônia / Brasil
    if (lat !== null && lng !== null && lat < 0 && lng < 0) {
      pontos.push({
        id: escola.id,
        nome: escola.nome,
        latitude: lat,
        longitude: lng,
        municipio: escola.municipio,
        tipo: escola.tipo,
        turmas: escola.turmas,
        alunos: escola.alunos,
        mediador: escola.mediador,
        conexao: escola.conexao,
        comunidade: escola.comunidade,
        distanciaKm: escola.distanciaKm,
        statusSinal: escola.statusSinal,
        nodeId: escola.nodeId,
      });
    }
  }

  return pontos;
}

/**
 * Aplica os filtros selecionados sobre a lista de pontos
 */
export function filtrarPontosMapa(
  pontos: PontoMapa[],
  filtros: FiltrosMapa
): PontoMapa[] {
  return pontos.filter((ponto) => {
    const matchMunicipio =
      !filtros.municipio ||
      filtros.municipio === 'Todos' ||
      ponto.municipio === filtros.municipio;

    const matchTipo =
      !filtros.tipo || filtros.tipo === 'todas' || ponto.tipo === filtros.tipo;

    const matchBusca =
      !filtros.busca ||
      ponto.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      ponto.municipio.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      (ponto.comunidade &&
        ponto.comunidade.toLowerCase().includes(filtros.busca.toLowerCase()));

    return matchMunicipio && matchTipo && matchBusca;
  });
}
