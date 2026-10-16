import L from 'leaflet';

// Cache de instâncias do DivIcon para máxima performance de renderização
const iconCache = new Map<string, L.DivIcon>();

interface IconeOptions {
  tipo: 'hub' | 'ribeirinha' | 'rural' | 'indígena' | 'urbana' | string;
  isSelected?: boolean;
  isHovered?: boolean;
}

/**
 * Cria ou retorna do cache um L.divIcon estilizado com SVG de telemetria
 */
export function getPontoIcone({ tipo, isSelected = false, isHovered = false }: IconeOptions): L.DivIcon {
  const cacheKey = `${tipo}_sel:${isSelected ? 1 : 0}_hov:${isHovered ? 1 : 0}`;

  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  // Cores semânticas por tipologia
  let corPrincipal = '#00D8FF'; // Urbana / Padrão
  const corBorda = '#0C1E38';

  if (tipo === 'hub') {
    corPrincipal = '#F43F5E';
  } else if (tipo === 'ribeirinha') {
    corPrincipal = '#38BDF8';
  } else if (tipo === 'indígena') {
    corPrincipal = '#10B981';
  } else if (tipo === 'rural') {
    corPrincipal = '#F59E0B';
  }

  const isAtivo = isSelected || isHovered;
  const tamanho = tipo === 'hub' ? (isAtivo ? 46 : 38) : (isAtivo ? 38 : 30);
  const raioCentral = isAtivo ? 8 : 6;

  const html = `
    <div class="relative flex items-center justify-center pointer-events-auto" style="width: ${tamanho}px; height: ${tamanho}px;">
      ${
        isAtivo
          ? `<div class="absolute inset-0 rounded-full animate-ping opacity-60" style="background-color: ${corPrincipal};"></div>
             <div class="absolute -inset-1 rounded-full border border-dashed opacity-80" style="border-color: ${corPrincipal};"></div>`
          : ''
      }
      ${
        tipo === 'hub'
          ? `<div class="absolute inset-0 rounded-full animate-pulse opacity-40" style="background-color: ${corPrincipal};"></div>`
          : ''
      }
      <div 
        class="relative flex items-center justify-center rounded-full shadow-lg transition-transform duration-200"
        style="
          width: ${tamanho - (isAtivo ? 4 : 6)}px;
          height: ${tamanho - (isAtivo ? 4 : 6)}px;
          background-color: ${corBorda};
          border: 2px solid ${corPrincipal};
          box-shadow: 0 0 ${isAtivo ? '18px' : '8px'} ${corPrincipal}88;
        "
      >
        <span 
          class="rounded-full"
          style="
            width: ${raioCentral * 2}px;
            height: ${raioCentral * 2}px;
            background-color: ${corPrincipal};
            box-shadow: 0 0 10px ${corPrincipal};
          "
        ></span>
      </div>
    </div>
  `;

  const novoIcone = L.divIcon({
    html,
    className: 'medtec-map-marker-custom',
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho / 2],
    popupAnchor: [0, -tamanho / 2],
  });

  iconCache.set(cacheKey, novoIcone);
  return novoIcone;
}

/**
 * Ícone customizado para o agrupamento de clusters do Leaflet
 */
export function criarClusterIcone(cluster: { getChildCount: () => number }): L.DivIcon {
  const count = cluster.getChildCount();
  let size = 36;
  let bgClass = 'bg-[#0C1E38]/90 border-[#00D8FF] text-[#00D8FF]';

  if (count > 10) {
    size = 44;
    bgClass = 'bg-[#0F2647] border-cyan-400 text-white';
  }

  const html = `
    <div class="flex items-center justify-center rounded-full border-2 font-mono font-bold shadow-lg transition-transform hover:scale-110 ${bgClass}" 
         style="width: ${size}px; height: ${size}px; box-shadow: 0 0 16px rgba(0, 216, 255, 0.45); backdrop-filter: blur(4px);">
      <span class="text-xs">${count}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'medtec-cluster-custom',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
