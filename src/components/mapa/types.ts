export interface PontoMapa {
  id: string | number;
  nome: string;
  latitude: number;
  longitude: number;
  municipio: string;
  tipo: 'ribeirinha' | 'rural' | 'indígena' | 'urbana';
  turmas: number;
  alunos: number;
  mediador: string;
  conexao: string;
  comunidade?: string;
  distanciaKm?: number;
  statusSinal?: string;
  nodeId?: string;
}

export type Coordenada = [number, number];

export interface FiltrosMapa {
  municipio: string;
  tipo: string;
  busca?: string;
}

export interface EstatisticasMapa {
  totalEscolas: number;
  turmas: number;
  alunos: number;
}

export interface RotaResposta {
  coordenadas: Coordenada[];
  distanciaMetros?: number;
  duracaoSegundos?: number;
  modo: 'osrm' | 'direto';
}
