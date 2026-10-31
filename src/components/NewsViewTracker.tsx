'use client';

/**
 * Rastreamento de visualizações desativado no portal público:
 * o contrato oficial da API Rails não prevê endpoint de incremento de visualizações,
 * evitando requisições artificiais ou gravação local em sessionStorage.
 */
export function recordNewsView(_id: string) {
  void _id;
}

export default function NewsViewTracker(_props: { id: string }) {
  void _props;
  return null;
}
