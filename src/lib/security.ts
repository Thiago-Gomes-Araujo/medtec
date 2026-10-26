/**
 * Utilitários de Cibersegurança para o MEDTEC Rondônia (SEDUC)
 * Padrões OWASP Top 10 e Higienização de Entradas
 */

const MAX_SEARCH_LENGTH = 100;

// Regex para remoção de tags HTML e SVG maliciosas
const HTML_TAG_REGEX = /<[^>]*>/g;

// Regex para identificação e remoção de esquemas de URL perigosos e pseudo-protocolos
const DANGEROUS_PROTOCOLS_REGEX = /(?:javascript|vbscript|data|file):/gi;

// Regex para manipuladores de eventos inline (ex: onload=, onclick=, onerror=)
const EVENT_HANDLER_REGEX = /\bon\w+\s*=/gi;

// Caracteres e sequências típicas de injeção SQL / NoSQL e quebra de contexto
const INJECTION_PATTERNS_REGEX = /(--|\/\*|\*\/|;|\$|\{|\}|\[|\]|<|>|")/g;

/**
 * Sanitiza e higieniza strings de busca do usuário em tempo real.
 * Previne XSS (Cross-Site Scripting), poluição de parâmetros e injeções de sintaxe.
 *
 * @param input String de entrada do usuário
 * @param maxLength Tamanho máximo permitido (padrão: 100 caracteres)
 * @returns String higienizada e segura para filtragem e renderização
 */
export function sanitizeSearchInput(input: string | null | undefined, maxLength: number = MAX_SEARCH_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // 1. Limita previamente para prevenir ataques de negação de serviço por regex (ReDoS)
  let clean = input.slice(0, maxLength * 2);

  // 2. Remove caracteres de controle ASCII e nulos
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Remove tags HTML e fragmentos XML
  clean = clean.replace(HTML_TAG_REGEX, '');

  // 4. Remove protocolos perigosos
  clean = clean.replace(DANGEROUS_PROTOCOLS_REGEX, '');

  // 5. Remove manipuladores de evento
  clean = clean.replace(EVENT_HANDLER_REGEX, '');

  // 6. Higieniza caracteres perigosos de injeção
  clean = clean.replace(INJECTION_PATTERNS_REGEX, ' ');

  // 7. Normaliza múltiplos espaços em branco para um único espaço
  clean = clean.replace(/\s+/g, ' ').trim();

  // 8. Trunca estritamente no limite máximo configurado
  return clean.slice(0, maxLength);
}
