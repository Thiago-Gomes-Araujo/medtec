'use client';

import React from 'react';
import {
  Share2,
  Save,
  Loader2,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, FacebookIcon } from '@/components/SocialIcons';
import type { CanalContato } from '@/lib/api';
import type { SocialLinks } from '@/types';

export interface SocialChannelsModuleProps {
  apiCanais: CanalContato[];
  setApiCanais: React.Dispatch<React.SetStateAction<CanalContato[]>>;
  defaultSocials?: SocialLinks;
  onSave: (e: React.FormEvent) => Promise<void>;
  saving: boolean;
}

export default function SocialChannelsModule({
  apiCanais,
  setApiCanais,
  defaultSocials,
  onSave,
  saving,
}: SocialChannelsModuleProps) {
  const FIXED_REDES_CONFIG = [
    {
      rede: 'youtube' as const,
      label: 'YouTube (Canal Oficial)',
      desc: 'Transmissões ao vivo, videoaulas e eventos',
      icon: YoutubeIcon,
      placeholder: 'https://www.youtube.com/@SeducRondonia',
      defaultVal: defaultSocials?.youtube || '',
    },
    {
      rede: 'instagram' as const,
      label: 'Instagram Oficial',
      desc: 'Publicações, stories e novidades da rede estadual',
      icon: InstagramIcon,
      placeholder: 'https://instagram.com/seducro',
      defaultVal: defaultSocials?.instagram || '',
    },
    {
      rede: 'facebook' as const,
      label: 'Facebook Oficial',
      desc: 'Página institucional do Governo de Rondônia',
      icon: FacebookIcon,
      placeholder: 'https://facebook.com/seducro',
      defaultVal: defaultSocials?.facebook || '',
    },
    {
      rede: 'whatsapp' as const,
      label: 'WhatsApp de Suporte / Polos',
      desc: 'Canal direto para atendimento pedagógico e técnico',
      icon: MessageSquare,
      placeholder: 'https://wa.me/5569999998888 ou 69999998888',
      defaultVal: defaultSocials?.whatsapp || '',
    },
    {
      rede: 'telefone' as const,
      label: 'Telefone da SEDUC',
      desc: 'Central de atendimento telefônico oficial',
      icon: Phone,
      placeholder: '(69) 3216-5300',
      defaultVal: defaultSocials?.phone || '',
    },
    {
      rede: 'email' as const,
      label: 'E-mail Institucional',
      desc: 'Endereço para dúvidas, protocolos e comunicados',
      icon: Mail,
      placeholder: 'contato@seduc.ro.gov.br',
      defaultVal: defaultSocials?.email || '',
    },
    {
      rede: 'endereco' as const,
      label: 'Endereço Oficial',
      desc: 'Localização física da sede da SEDUC / Palácio Rio Madeira',
      icon: MapPin,
      placeholder: 'Av. Farquar, 2986 - Bairro Pedrinhas, Palácio Rio Madeira, Porto Velho - RO',
      defaultVal: defaultSocials?.address || '',
    },
  ];

  const updateCanal = (rede: string, field: 'valor' | 'posicao' | 'ativo', val: string | number | boolean) => {
    setApiCanais(prev => {
      const idx = prev.findIndex(c => c.rede === rede);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], [field]: val };
        return copy;
      }
      const cfg = FIXED_REDES_CONFIG.find(c => c.rede === rede);
      const newEntry: CanalContato = {
        id: 0,
        rede: rede as CanalContato['rede'],
        valor: field === 'valor' ? String(val) : (cfg?.defaultVal || ''),
        posicao: field === 'posicao' ? Number(val) : (FIXED_REDES_CONFIG.findIndex(c => c.rede === rede) + 1),
        ativo: field === 'ativo' ? Boolean(val) : true,
      };
      return [...prev, newEntry];
    });
  };

  return (
    <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Share2 size={18} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Canais Oficiais de Contato e Redes Sociais (/canais_contato)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure os 7 canais fixos da API Backend v1. Cada canal possui valor, ordem de exibição (posição) e controle de visibilidade (ativo).
          </p>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div className="space-y-3">
          {FIXED_REDES_CONFIG.map((item, index) => {
            const canal = apiCanais.find(c => c.rede === item.rede);
            const valor = canal?.valor !== undefined ? canal.valor : item.defaultVal;
            const posicao = canal?.posicao !== undefined ? canal.posicao : (index + 1);
            const ativo = canal?.ativo !== undefined ? canal.ativo : true;
            const IconComponent = item.icon;

            return (
              <div
                key={item.rede}
                className={`p-4 rounded-xl border transition-all ${
                  ativo
                    ? 'bg-slate-50/70 dark:bg-[#060D1A] border-slate-200 dark:border-slate-800'
                    : 'bg-slate-100/40 dark:bg-[#060D1A]/40 border-dashed border-slate-200 dark:border-slate-800/60 opacity-70'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        ativo
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {item.label}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          rede: &quot;{item.rede}&quot;
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={ativo}
                        onChange={e => updateCanal(item.rede, 'ativo', e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          ativo ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                            ativo ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          ativo ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {ativo ? 'Visível no Portal' : 'Oculto'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-10">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Valor / Link / Contato
                    </label>
                    <input
                      type="text"
                      value={valor}
                      onChange={e => updateCanal(item.rede, 'valor', e.target.value)}
                      placeholder={item.placeholder}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071324] text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Posição
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={posicao}
                      onChange={e => updateCanal(item.rede, 'posicao', parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071324] text-slate-900 dark:text-slate-100 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400">
            Os canais ativos serão sincronizados automaticamente com o rodapé e o botão flutuante.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#003875] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Salvar 7 Canais na API Backend</span>
          </button>
        </div>
      </form>
    </div>
  );
}
