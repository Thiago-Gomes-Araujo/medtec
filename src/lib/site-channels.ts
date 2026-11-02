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

// A API só lista canais ativos: o que ela não devolve foi desativado e não aparece no site.
export function canaisFromApi(canais: { rede: string; valor: string }[]): SocialLinks {
  if (canais.length === 0) return CANAIS_PADRAO;
  const valor = (rede: string) => canais.find(canal => canal.rede === rede)?.valor?.trim() ?? '';
  const link = (rede: string) => { const url = valor(rede); return isLink(url) ? url : ''; };
  return {
    instagram: link('instagram'),
    youtube: link('youtube'),
    facebook: link('facebook'),
    whatsapp: link('whatsapp'),
    email: valor('email'),
    phone: valor('telefone'),
    address: valor('endereco'),
  };
}
