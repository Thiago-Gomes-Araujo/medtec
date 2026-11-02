'use client';

import React from 'react';
import { SocialLinks } from '@/types';
import { 
  ExternalLink, 
  Share2, 
  Globe
} from 'lucide-react';
import { 
  InstagramIcon, 
  YoutubeIcon, 
  FacebookIcon, 
  WhatsAppIcon 
} from '@/components/SocialIcons';
import { useSiteChannels } from '@/components/SiteChannelsProvider';

interface SocialSectionProps {
  socials?: SocialLinks;
  showHeader?: boolean;
  loading?: boolean;
  unavailable?: boolean;
  error?: string | null;
}

export default function SocialSection({
  socials: propSocials,
  showHeader = false,
  loading = false,
  unavailable = false,
  error = null,
}: SocialSectionProps) {
  const channels = useSiteChannels();
  const socials = propSocials ?? channels;
  const whatsappUrl = socials.whatsapp?.trim() || '';

  return (
    <section id="redes" className="py-6 bg-transparent text-slate-900 dark:text-white relative overflow-hidden transition-colors">
      <div className="relative max-w-7xl mx-auto">
        
        {/* Cabeçalho Opcional (Omitido por padrão para evitar duplicação com PageHeader) */}
        {showHeader && (
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-100 dark:bg-blue-900/60 border border-sky-300 dark:border-sky-500/30 text-[#004A99] dark:text-[#00D8FF] text-xs font-bold uppercase tracking-wider">
              <Share2 size={13} />
              <span>Canais Oficiais &amp; Comunidade Digital</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance font-display">
              Acompanhe o MEDTEC nas Redes Sociais
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
              Conecte-se conosco no YouTube, Instagram, Facebook e WhatsApp.
            </p>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-10 text-center"
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Carregando canais oficiais...
            </p>
          </div>
        ) : (
          <>
            {(unavailable || error) && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-[#0C1E38] p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
              >
                {error || 'A consulta dinâmica de canais está temporariamente indisponível. Confira abaixo os canais institucionais oficiais da SEDUC-RO.'}
              </div>
            )}

            {/* Grid dos Cards de Redes Sociais Compactos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Card YouTube */}
              {socials.youtube && (
              <div className="bg-white dark:bg-[#0C1E38] hover:bg-slate-50 dark:hover:bg-[#0E2444] rounded-xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#1A365D] shadow-xs hover:shadow-md transition-all duration-200 ease-out flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-500 flex items-center justify-center transition-colors">
                      <YoutubeIcon size={22} />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold border border-red-200 dark:border-transparent">
                      Ao Vivo
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 text-balance leading-snug">
                    Canal no YouTube
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2 text-pretty">
                    Aulas síncronas ao vivo, revisões do ENEM e programas especiais gravados nos estúdios da SEDUC.
                  </p>
                </div>

                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-150 ease-out shadow-xs active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <span>Inscrever-se no Canal</span>
                  <ExternalLink size={13} />
                </a>
              </div>
              )}

              {/* Card Instagram */}
              {socials.instagram && (
              <div className="bg-white dark:bg-[#0C1E38] hover:bg-slate-50 dark:hover:bg-[#0E2444] rounded-xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#1A365D] shadow-xs hover:shadow-md transition-all duration-200 ease-out flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-[#004A99] dark:text-[#00D8FF] flex items-center justify-center transition-colors">
                      <InstagramIcon size={22} />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-500/10 text-[#004A99] dark:text-[#00D8FF] text-[11px] font-bold border border-sky-200 dark:border-transparent">
                      @governoro
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 text-balance leading-snug">
                    Instagram Oficial
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2 text-pretty">
                    Bastidores dos estúdios centrais, rotina dos estudantes nas salas conectadas e comunicados rápidos.
                  </p>
                </div>

                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-150 ease-out shadow-xs active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <span>Seguir no Instagram</span>
                  <ExternalLink size={13} />
                </a>
              </div>
              )}

              {/* Card Facebook */}
              {socials.facebook && (
              <div className="bg-white dark:bg-[#0C1E38] hover:bg-slate-50 dark:hover:bg-[#0E2444] rounded-xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#1A365D] shadow-xs hover:shadow-md transition-all duration-200 ease-out flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors">
                      <FacebookIcon size={22} />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[11px] font-bold border border-blue-200 dark:border-transparent">
                      Comunidade
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 text-balance leading-snug">
                    Página no Facebook
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2 text-pretty">
                    Notícias institucionais, eventos educacionais estaduais e prestação de contas à comunidade.
                  </p>
                </div>

                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-150 ease-out shadow-xs active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span>Acompanhar no Facebook</span>
                  <ExternalLink size={13} />
                </a>
              </div>
              )}

              {/* Card WhatsApp */}
              {(whatsappUrl || socials.phone) && (
              <div className="bg-white dark:bg-[#0C1E38] hover:bg-slate-50 dark:hover:bg-[#0E2444] rounded-xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#1A365D] shadow-xs hover:shadow-md transition-all duration-200 ease-out flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                      <WhatsAppIcon size={22} />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-transparent">
                      Suporte Escolar
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 text-balance leading-snug">
                    Canal do WhatsApp
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2 text-pretty">
                    Suporte técnico-pedagógico direto para gestores escolares, polos e professores mediadores.
                  </p>
                </div>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-150 ease-out shadow-xs active:scale-[0.97] touch-manipulation select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <span>Falar no WhatsApp</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <p className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs text-center">
                    Telefone SEDUC: {socials.phone}
                  </p>
                )}
              </div>
              )}

            </div>
          </>
        )}

        {/* Banner do Portal Oficial do Governo de Rondônia Compacto */}
        <div className="mt-8 bg-white dark:bg-[#0C1E38] border border-slate-200/90 dark:border-[#1A365D] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 dark:bg-[#004A99]/20 rounded-xl text-[#004A99] dark:text-[#00D8FF] shrink-0">
              <Globe size={22} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white font-display text-balance">
                Portal Oficial da Secretaria de Estado da Educação de Rondônia
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 text-pretty line-clamp-1">
                rondonia.ro.gov.br/seduc/programas-e-projetos/projetos/conheca-o-projeto/
              </p>
            </div>
          </div>

          <a
            href="https://rondonia.ro.gov.br/seduc/programas-e-projetos/projetos/conheca-o-projeto/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
          >
            <span>Ver no Portal SEDUC</span>
            <ExternalLink size={13} />
          </a>
        </div>

      </div>
    </section>
  );
}

