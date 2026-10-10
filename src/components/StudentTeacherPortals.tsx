import React from 'react';
import { 
  FileDown, 
  HelpCircle, 
  Tv, 
  BookOpenCheck, 
  Headphones, 
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function StudentTeacherPortals() {
  return (
    <section className="py-16 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card Aluno */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 rounded-3xl p-8 border border-emerald-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <BookOpenCheck size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Espaço do Estudante MEDTEC
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Acesse cronogramas de transmissão ao vivo, apostilas digitais em PDF, materiais de apoio para o ENEM e simulados do Sistema de Avaliação Educacional de Rondônia.
              </p>

              <div className="space-y-2 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Cadernos de Atividades e Módulos Didáticos da BNCC</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Guia de Estudos Orientados e Projeto de Vida</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Material do Itinerário Agroecologia & Zootecnia (NBAZ)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-100 flex flex-wrap gap-3">
              <a
                href="#noticias"
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>Baixar Grade Semanal</span>
                <FileDown size={14} />
              </a>
              <a
                href="#avisos"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
              >
                <span>Avisos e Provas</span>
              </a>
            </div>
          </div>

          {/* Card Professor Mediador */}
          <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50/30 rounded-3xl p-8 border border-teal-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <Headphones size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Central do Professor Mediador
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Área de suporte pedagógico e técnico para professores que atuam diretamente com as turmas nas escolas estaduais e polos municipais de Rondônia.
              </p>

              <div className="space-y-2 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>Orientações da Coordenadoria de Mídias Educacionais</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>Suporte para Antenas Satelitais e Receptores Digitais</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>Alinhamento Pedagógico das TDICs e Diário de Classe</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-teal-100 flex flex-wrap gap-3">
              <a
                href="mailto:medtec@seduc.ro.gov.br"
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>Suporte Pedagógico</span>
                <HelpCircle size={14} />
              </a>
              <a
                href="#redes"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
              >
                <span>Grupo no WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

