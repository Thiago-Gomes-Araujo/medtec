import React from 'react';
import { 
  ShieldCheck, 
  Compass, 
  Leaf, 
  Cpu, 
  FileText, 
  Award,
  Trees,
  Waves,
  HeartHandshake
} from 'lucide-react';
import { SiteInfo } from '@/types';

interface AboutSectionProps {
  siteInfo: SiteInfo;
}

export default function AboutSection({ siteInfo }: AboutSectionProps) {
  return (
    <section id="sobre" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Topo Institucional */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wider uppercase">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Fundamentação Legal & Compromisso Público</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {siteInfo.aboutTitle}
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {siteInfo.aboutText}
          </p>

          <div className="pt-2">
            <span className="inline-block px-4 py-2 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 font-semibold border border-slate-200">
              📜 {siteInfo.lawText}
            </span>
          </div>
        </div>

        {/* Três Pilares Centrais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-emerald-50/60 to-white p-8 rounded-2xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-sm">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Equidade e Permanência
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              O projeto viabiliza o acesso ao Ensino Médio de qualidade sem que o jovem precise abandonar sua família ou comunidade de origem para estudar na zona urbana.
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50/60 to-white p-8 rounded-2xl border border-teal-100 shadow-xs hover:border-teal-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-6 shadow-sm">
              <Cpu size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Tecnologia Educacional (TDICs)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Aulas transmitidas ao vivo via estúdios com professores habilitados nos componentes curriculares, aliadas à mediação de um professor presencial em sala.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50/60 to-white p-8 rounded-2xl border border-amber-100 shadow-xs hover:border-amber-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-6 shadow-sm">
              <Leaf size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Identidade Regional & Agroecologia
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Currículo enriquecido com o componente NBAZ (Noções Básicas de Agroecologia e Zootecnia), estimulando o desenvolvimento sustentável local e o Projeto de Vida.
            </p>
          </div>
        </div>

        {/* Quadro das Comunidades Tradicionais Atendidas */}
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 overflow-hidden relative shadow-xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
              <HeartHandshake size={16} />
              <span>Educação Inclusiva na Amazônia</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              A Quem o MEDTEC Rondônia se Destina?
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              O sistema estadual de ensino de Rondônia leva a escola pública até as regiões geograficamente desafiadoras, garantindo que o direito constitucional à educação de qualidade seja uma realidade palpável para todos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <Trees className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-sm text-white">Povos Indígenas</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Aldeias e territórios demarcados com respeito à sua cultura.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <Waves className="text-teal-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-sm text-white">Comunidades Ribeirinhas</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Populações às margens dos rios Madeira, Guaporé, Mamoré e afluentes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <Award className="text-amber-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-sm text-white">Quilombolas</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Comunidades remanescentes com valorização de suas raízes históricas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <Leaf className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-sm text-white">Áreas Rurais e Assentamentos</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Pequenos produtores agropecuários e linhas rurais distantes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

