import { Coordenada, RotaResposta } from './types';

/**
 * Consulta a rota entre dois pontos geográficos através do proxy /api/route
 * Em caso de falha ou timeout, devolve traçado direto entre os pontos.
 */
export async function buscarRota(
  origem: Coordenada,
  destino: Coordenada
): Promise<RotaResposta> {
  const [origLat, origLng] = origem;
  const [destLat, destLng] = destino;

  const fallback: RotaResposta = {
    coordenadas: [origem, destino],
    modo: 'direto',
  };

  try {
    const params = new URLSearchParams({
      mode: 'route',
      originLat: origLat.toString(),
      originLng: origLng.toString(),
      destLat: destLat.toString(),
      destLng: destLng.toString(),
    });

    const res = await fetch(`/api/route?${params.toString()}`);
    if (!res.ok) return fallback;

    const data = await res.json();
    if (data.coordenadas && Array.isArray(data.coordenadas)) {
      return {
        coordenadas: data.coordenadas,
        distanciaMetros: data.distanciaMetros,
        duracaoSegundos: data.duracaoSegundos,
        modo: data.modo || 'osrm',
      };
    }

    return fallback;
  } catch (error) {
    console.warn('Erro ao carregar rota OSRM, usando feixe direto:', error);
    return fallback;
  }
}
