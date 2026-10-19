/**
 * Executa geocodificação chamando o proxy /api/geocode
 */
export async function buscarCoordenadasPorEndereco(params: {
  logradouro?: string;
  municipio?: string;
  numero?: string;
  bairro?: string;
  uf?: string;
  q?: string;
}): Promise<{ latitude: number; longitude: number } | null> {
  const query = new URLSearchParams();

  if (params.logradouro) query.set('logradouro', params.logradouro);
  if (params.municipio) query.set('municipio', params.municipio);
  if (params.numero) query.set('numero', params.numero);
  if (params.bairro) query.set('bairro', params.bairro);
  if (params.uf) query.set('uf', params.uf);
  if (params.q) query.set('q', params.q);

  try {
    const res = await fetch(`/api/geocode?${query.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return { latitude: data.latitude, longitude: data.longitude };
    }
    return null;
  } catch (err) {
    console.error('Erro ao buscar geocode:', err);
    return null;
  }
}
