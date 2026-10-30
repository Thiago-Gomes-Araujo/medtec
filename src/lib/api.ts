/**
 * Módulo Central de Integração com a API Backend Oficial MEDTEC Rondônia
 * Re-exporta a arquitetura modularizada definida em src/lib/api/
 *
 * Mantém 100% de compatibilidade com os imports existentes:
 * import { medtecApi, apiFetch, getMediaUrl, ... } from '@/lib/api';
 */

export * from './api/index';
export { default } from './api/index';
