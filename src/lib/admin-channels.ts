import { medtecApi, type CanalContato, type CanalContatoInput } from '@/lib/api';

export const ADMIN_CHANNEL_KEYS = ['youtube', 'instagram', 'facebook', 'whatsapp', 'telefone', 'email', 'endereco'] as const;

function isChannel(value: unknown): value is CanalContato {
  if (!value || typeof value !== 'object') return false;
  const channel = value as Partial<CanalContato>;
  return typeof channel.rede === 'string' && typeof channel.valor === 'string' &&
    Number.isSafeInteger(channel.posicao) && typeof channel.ativo === 'boolean';
}

function isChannelList(value: unknown): value is CanalContato[] {
  return Array.isArray(value) && value.every(isChannel) &&
    new Set(value.map((channel) => channel.rede)).size === value.length;
}

export async function readAdminChannels(): Promise<CanalContato[]> {
  const response = await medtecApi.canaisContato.list({ page: 'all' });
  if (!response?.success || !isChannelList(response.data?.items)) {
    throw new Error('Resposta inválida da API de canais de contato.');
  }
  return response.data.items;
}

// Compara com a leitura oficial, sem criar canais que não vieram da API.
export function getChannelChanges(official: CanalContato[] | null, draft: CanalContato[]): CanalContatoInput[] {
  if (!official) return [];
  const changes: CanalContatoInput[] = [];
  for (const rede of ADMIN_CHANNEL_KEYS) {
    const original = official.find((channel) => channel.rede === rede);
    const edited = draft.find((channel) => channel.rede === rede);
    if (!original || !edited) continue;
    const change: CanalContatoInput = { rede };
    if (edited.valor !== original.valor) change.valor = edited.valor;
    if (edited.posicao !== original.posicao) change.posicao = edited.posicao;
    if (edited.ativo !== original.ativo) change.ativo = edited.ativo;
    if (Object.keys(change).length > 1) changes.push(change);
  }
  return changes;
}

export async function saveAdminChannels(official: CanalContato[] | null, draft: CanalContato[]): Promise<CanalContato[] | null> {
  if (!official) throw new Error('Carregue os canais oficiais com sucesso antes de salvar.');
  const changes = getChannelChanges(official, draft);
  if (changes.length === 0) return null;
  for (const change of changes) {
    if (change.valor !== undefined && !change.valor.trim()) {
      throw new Error('O valor de um canal não pode ficar vazio. Para ocultá-lo, desative sua visibilidade.');
    }
    if (change.posicao !== undefined && (!Number.isSafeInteger(change.posicao) || change.posicao < 1 || change.posicao > 99)) {
      throw new Error('Informe uma posição inteira entre 1 e 99.');
    }
  }
  const response = await medtecApi.canaisContato.updateMany(changes);
  if (!response?.success || !isChannelList(response.data) ||
      changes.some((change) => !response.data.some((channel) => channel.rede === change.rede))) {
    throw new Error('A API não confirmou a gravação dos canais alterados. Recarregue a página para conferir os dados.');
  }
  // Aceita resposta completa ou parcial, sem descartar os canais não alterados.
  const updated = response.data;
  return [...official.filter((channel) => !updated.some((item) => item.rede === channel.rede)), ...updated];
}
