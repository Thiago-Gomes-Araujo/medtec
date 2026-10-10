import React from 'react';
import { SocialLinks } from '@/types';
import { 
  MessageCircle, 
  ExternalLink, 
  Share2, 
  Tv, 
  Users, 
  BellRing,
  Globe
} from 'lucide-react';
import { 
  InstagramIcon, 
  YoutubeIcon, 
  FacebookIcon, 
  WhatsAppIcon 
} from '@/components/SocialIcons';

interface SocialSectionProps {
  socials: SocialLinks;
}

export default function SocialSection({ socials }: SocialSectionProps) {
  return (
    <section id="redes" className="py-20 bg-gradient-to-b from-slate-900 to-emerald-950 text-white relative overflow-hidden">
      {/* Luzes de fundo */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Share2 size={14} />
            <span>Canais Oficiais & Comunidade Digital</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Acompanhe o MEDTEC nas Redes Sociais
          </h2>
          
          <p className="text-base text-slate-300 leading-relaxed">
            Conecte-se conosco no YouTube, Instagram, Facebook e WhatsApp. Receba novidades, assista aulas transmitidas e veja o dia a dia da educação rondoniense.
          </p>
        </div>

        {/* Grid dos Cards de Redes Sociais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card YouTube */}
          <div className="bg-slate-800/80 hover:bg-slate-800 rounded-3xl p-6 border border-red-500/20 shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <YoutubeIcon size={26} />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">
                  Ao Vivo
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Canal no YouTube
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Assista a aulas ao vivo, revisões para o ENEM, materiais complementares e programas especiais gravados nos estúdios da SEDUC.
              </p>
            </div>

            <a
              href={socials.youtube || 'https://www.youtube.com/@SeducRondonia'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-red-900/40"
            >
              <span>Inscrever-se no Canal</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Card Instagram */}
          <div className="bg-slate-800/80 hover:bg-slate-800 rounded-3xl p-6 border border-pink-500/20 shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <InstagramIcon size={26} />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold">
                  @governoro
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Instagram Oficial
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Fotos dos bastidores dos estúdios, rotina dos estudantes nas aldeias e comunidades rurais, enquetes e comunicados rápidos.
              </p>
            </div>

            <a
              href={socials.instagram || 'https://www.instagram.com/governoro/'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Seguir no Instagram</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Card Facebook */}
          <div className="bg-slate-800/80 hover:bg-slate-800 rounded-3xl p-6 border border-blue-500/20 shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FacebookIcon size={26} />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                  Comunidade
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Página no Facebook
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Notícias institucionais, eventos educacionais estaduais e interação com as famílias e comunidades de todo o estado.
              </p>
            </div>

            <a
              href={socials.facebook || 'https://www.facebook.com/governoderondonia'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>Acompanhar no Facebook</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Card WhatsApp */}
          <div className="bg-slate-800/80 hover:bg-slate-800 rounded-3xl p-6 border border-emerald-500/20 shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <WhatsAppIcon size={26} />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  Suporte Escolar
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                Canal do WhatsApp
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Atendimento e suporte técnico-pedagógico direto para os gestores escolares, polos e professores mediadores em campo.
              </p>
            </div>

            <a
              href={socials.whatsapp || 'https://wa.me/5569999999999'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-950/50"
            >
              <span>Falar no WhatsApp</span>
              <ExternalLink size={14} />
            </a>
          </div>

        </div>

        {/* Banner do Portal Oficial do Governo de Rondônia */}
        <div className="mt-12 bg-emerald-900/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-300 shrink-0">
              <Globe size={28} />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">
                Portal Oficial da Secretaria de Estado da Educação de Rondônia
              </h4>
              <p className="text-xs text-emerald-200 mt-0.5">
                Acesse a página do projeto em: rondonia.ro.gov.br/seduc/programas-e-projetos/projetos/conheca-o-projeto/
              </p>
            </div>
          </div>

          <a
            href="https://rondonia.ro.gov.br/seduc/programas-e-projetos/projetos/conheca-o-projeto/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-md"
          >
            <span>Ver Página no Portal Oficial</span>
            <ExternalLink size={14} />
          </a>
        </div>

      </div>
    </section>
  );
}

