import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy de Geocodificação reversa / direta via Nominatim OSM
 * Respeita política de User-Agent do OpenStreetMap
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const logradouro = searchParams.get('logradouro') || '';
  const numero = searchParams.get('numero') || '';
  const bairro = searchParams.get('bairro') || '';
  const municipio = searchParams.get('municipio') || '';
  const uf = searchParams.get('uf') || 'RO';
  const query = searchParams.get('q') || '';

  // Monta a consulta de endereço estruturada
  const enderecoPartes = [
    logradouro && numero ? `${logradouro}, ${numero}` : logradouro,
    bairro,
    municipio,
    uf,
    'Brasil',
  ].filter(Boolean);

  const enderecoCompleto = query || enderecoPartes.join(', ');

  if (!enderecoCompleto.trim()) {
    return NextResponse.json(
      { error: 'Endereço de busca não fornecido.' },
      { status: 400 }
    );
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('q', enderecoCompleto);
    url.searchParams.set('limit', '1');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'MEDTEC-Rondonia-CommunityMap/1.0 (seduc.ro.gov.br)',
      },
      next: { revalidate: 86400 }, // Cache por 24 horas
    });

    if (!response.ok) {
      throw new Error(`Nominatim respondeu com status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Endereço não localizado.', latitude: null, longitude: null },
        { status: 404 }
      );
    }

    const resultado = data[0];
    return NextResponse.json({
      latitude: parseFloat(resultado.lat),
      longitude: parseFloat(resultado.lon),
      display_name: resultado.display_name,
    });
  } catch (error) {
    console.error('[API Geocode] Erro ao consultar Nominatim:', error);
    return NextResponse.json(
      { error: 'Falha temporária no serviço de geocodificação.' },
      { status: 502 }
    );
  }
}
