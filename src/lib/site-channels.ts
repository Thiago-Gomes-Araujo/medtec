import type { SocialLinks } from '@/types';

// Link oficial do canal, usado se a API não responder. Vazio esconde os botões de YouTube.
export const YOUTUBE_URL_OFICIAL = '';

// Valores de reserva, usados só quando a API não responde ou não devolve nenhum canal.
export const CANAIS_PADRAO: SocialLinks = {
  instagram: 'https://www.instagram.com/governoro/',
  youtube: YOUTUBE_URL_OFICIAL,
  facebook: 'https://www.facebook.com/governoderondonia',
  whatsapp: '',
  email: 'mediacaotecnologica@seduc.ro.gov.br',
  phone: '(69) 3216-5300',
  address: 'Palácio Rio Madeira, Porto Velho - RO',
};

const isLink = (value: string) => /^https?:\/\//i.test(value);

// Números de exemplo do seed e dos dados locais: nunca vão para o site como se fossem oficiais.
const WHATSAPP_DE_EXEMPLO = ['5569911112222', '5569999999999'];

// Aceita o número, com ou sem máscara, ou um link wa.me. O que não for um número brasileiro não vira botão.
export function whatsappHref(value: string): string {
  const texto = value.trim();
  let digitos = '';
  if (isLink(texto)) {
    try {
      const url = new URL(texto);
      if (url.hostname.replace(/^www\./, '') !== 'wa.me') return '';
      digitos = url.pathname.replace(/\D/g, '');
    } catch { return ''; }
  } else if (!/[^\d\s()+.-]/.test(texto)) {
    digitos = texto.replace(/\D/g, '');
  }
  const nacional = digitos.length >= 12 && digitos.startsWith('55') ? digitos.slice(2) : digitos;
  if (!/^[1-9]\d{9,10}$/.test(nacional) || WHATSAPP_DE_EXEMPLO.includes(`55${nacional}`)) return '';
  return `https://wa.me/55${nacional}`;
}

// A API só lista canais ativos: o que ela não devolve foi desativado e não aparece no site.
export function canaisFromApi(canais: { rede: string; valor: string }[]): SocialLinks {
  if (canais.length === 0) return CANAIS_PADRAO;
  const valor = (rede: string) => canais.find(canal => canal.rede === rede)?.valor?.trim() ?? '';
  const link = (rede: string) => { const url = valor(rede); return isLink(url) ? url : ''; };
  return {
    instagram: link('instagram'),
    youtube: link('youtube'),
    facebook: link('facebook'),
    whatsapp: whatsappHref(valor('whatsapp')),
    email: valor('email'),
    phone: valor('telefone'),
    address: valor('endereco'),
  };
}
