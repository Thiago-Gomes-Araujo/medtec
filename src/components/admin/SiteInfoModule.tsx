'use client';

import React from 'react';
import { Info, Lock } from 'lucide-react';
import AdminLiveSimulator from '@/components/AdminLiveSimulator';
import type { DatabaseSchema } from '@/types';

export interface SiteInfoModuleProps {
  data: DatabaseSchema;
  setData: React.Dispatch<React.SetStateAction<DatabaseSchema | null>>;
  onPreview: (data: DatabaseSchema) => void;
}

export default function SiteInfoModule({
  data,
  setData,
  onPreview,
}: SiteInfoModuleProps) {
  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2.5">
        <Info className="h-4 w-4 shrink-0 text-[#004A99] dark:text-sky-400" />
        <span>
          <strong>Configurações Institucionais e Métricas:</strong> Conforme a diretriz de fonte única de dados, os indicadores oficiais de alcance (estudantes, salas, municípios, horas) serão sincronizados diretamente via API assim que o endpoint de estatísticas for disponibilizado pelo backend. A gravação em disco local foi desativada para prevenir inconsistências.
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 bg-white dark:bg-[#0B1729] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Textos Institucionais & Métricas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Altere os títulos, slogans e números exibidos na página inicial do MEDTEC em tempo real.
            </p>
          </div>

          <div className="space-y-6">
            {/* Métricas */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Números e Métricas de Alcance (Hero)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Estudantes Formados/Atendidos
                  </label>
                  <input
                    type="text"
                    value={data.stats.studentsCount}
                    onChange={e => setData({ ...data, stats: { ...data.stats, studentsCount: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Salas Conectadas
                  </label>
                  <input
                    type="text"
                    value={data.stats.schoolsCount}
                    onChange={e => setData({ ...data, stats: { ...data.stats, schoolsCount: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Municípios Atendidos
                  </label>
                  <input
                    type="text"
                    value={data.stats.citiesCount}
                    onChange={e => setData({ ...data, stats: { ...data.stats, citiesCount: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Horas de Transmissão
                  </label>
                  <input
                    type="text"
                    value={data.stats.liveHoursCount}
                    onChange={e => setData({ ...data, stats: { ...data.stats, liveHoursCount: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Textos */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Hero
                </label>
                <input
                  type="text"
                  value={data.siteInfo.heroTitle}
                  onChange={e => setData({ ...data, siteInfo: { ...data.siteInfo, heroTitle: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Hero
                </label>
                <textarea
                  rows={2}
                  value={data.siteInfo.heroDescription}
                  onChange={e => setData({ ...data, siteInfo: { ...data.siteInfo, heroDescription: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Referência Legal / Legislação
                </label>
                <input
                  type="text"
                  value={data.siteInfo.lawText}
                  onChange={e => setData({ ...data, siteInfo: { ...data.siteInfo, lawText: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={true}
              title="Aguardando disponibilização de endpoint de estatísticas no backend Rails"
              className="px-6 py-2.5 rounded-xl bg-slate-400 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-not-allowed opacity-60"
            >
              <Lock size={16} />
              <span>Gravação Aguardando Endpoint da API</span>
            </button>
          </div>
        </div>

        {/* Coluna Direita: Simulador de Métricas Fiel ao Vivo */}
        <div className="xl:col-span-5 xl:sticky xl:top-24">
          <AdminLiveSimulator
            type="siteInfo"
            data={data}
            hasUnsavedChanges={false}
            onOpenFullscreen={() => onPreview(data)}
          />
        </div>
      </div>
    </div>
  );
}
