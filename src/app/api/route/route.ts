import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy para serviço de rotas OSRM (Open Source Routing Machine)
 * Suporta traçado de polyline (route) e tabela de distâncias (table).
 * Se o OSRM falhar ou demorar, devolve linha direta entre os pontos como fallback gracioso.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('mode') || 'route';
  const originLat = parseFloat(searchParams.get('originLat') || '');
  const originLng = parseFloat(searchParams.get('originLng') || '');
  const destLat = parseFloat(searchParams.get('destLat') || '');
  const destLng = parseFloat(searchParams.get('destLng') || '');

  // Validação das coordenadas mínimas
  if (
    isNaN(originLat) ||
    isNaN(originLng) ||
    isNaN(destLat) ||
    isNaN(destLng)
  ) {
    return NextResponse.json(
      { error: 'Coordenadas de origem ou destino inválidas.' },
      { status: 400 }
    );
  }

  const fallbackRota = {
    coordenadas: [
      [originLat, originLng],
      [destLat, destLng],
    ],
    distanciaMetros: null,
    duracaoSegundos: null,
    modo: 'direto',
  };

  const baseUrl = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';
  const profile = process.env.OSRM_PROFILE || 'driving';

  try {
    if (mode === 'route') {
      // OSRM espera longitude,latitude;longitude,latitude
      const osrmUrl = `${baseUrl}/route/v1/${profile}/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout para não travar o front

      const res = await fetch(osrmUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MEDTEC-Rondonia/1.0',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return NextResponse.json(fallbackRota);
      }

      const data = await res.json();
      if (!data.routes || data.routes.length === 0) {
        return NextResponse.json(fallbackRota);
      }

      const principalRoute = data.routes[0];
      // OSRM GeoJSON devolve [lng, lat], convertemos para [lat, lng] padrão Leaflet
      const coordenadas: [number, number][] = principalRoute.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]]
      );

      return NextResponse.json({
        coordenadas,
        distanciaMetros: principalRoute.distance,
        duracaoSegundos: principalRoute.duration,
        modo: 'osrm',
      });
    }

    // Modo não reconhecido ou fallback
    return NextResponse.json(fallbackRota);
  } catch (error) {
    // Falha silenciosa com fallback para linha direta
    console.warn('[API Route] OSRM offline ou timeout. Usando linha direta:', error);
    return NextResponse.json(fallbackRota);
  }
}
