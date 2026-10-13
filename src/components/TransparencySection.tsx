'use client';

import React, { useState } from 'react';
import { Search, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { indicadoresData, contratosData, Indicador, Contrato } from '@/data/medtecData';

export default function TransparencySection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | number>('todos');
  const [activeTab, setActiveTab] = useState<'indicadores' | 'orcamento'>('indicadores');

  const filterItem = (title: string, year: number) => {
    const matchYear = selectedYear === 'todos' || year === selectedYear;
    const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchYear && matchSearch;
  };

  const filteredIndicadores = indicadoresData.filter((i) =>
    filterItem(i.metrica, i.ano)
  );

  const filteredContratos = contratosData.filter((c) =>
    filterItem(c.item, c.ano)
  );

  return (
    <div>
      {/* Search and Filters Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Busca rápida em transparência..."
            className="w-full rounded-lg border border-slate-200 bg-card py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        {/* Year Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['todos', 2026, 2025, 2024].map((ano) => (
            <button
              key={ano}
              onClick={() => setSelectedYear(ano)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedYear === ano
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ano === 'todos' ? 'Todos os anos' : ano}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('indicadores')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'indicadores'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Indicadores Educacionais ({filteredIndicadores.length})
        </button>
        <button
          onClick={() => setActiveTab('orcamento')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'orcamento'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Execução Orçamentária e Contratos ({filteredContratos.length})
        </button>
      </div>

      {/* Indicators Grid */}
      {activeTab === 'indicadores' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIndicadores.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-card p-8 text-center text-sm text-slate-500">
              Nenhum indicador encontrado para o termo pesquisado.
            </div>
          ) : (
            filteredIndicadores.map((ind: Indicador, idx: number) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-card p-5 shadow-card hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">Ano de Referência: {ind.ano}</span>
                    <span>Atualizado: {ind.data}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {ind.metrica}
                  </h3>
                  <p className="mt-3 font-display text-3xl font-bold text-primary tracking-tight">
                    {ind.valor}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={ind.fonte.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-primary transition-colors"
                  >
                    Fonte: <span className="underline">{ind.fonte.nome}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                    <CheckCircle2 className="h-3 w-3 text-sky-600" />
                    Auditado
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contracts & Budget Grid */}
      {activeTab === 'orcamento' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContratos.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-card p-8 text-center text-sm text-slate-500">
              Nenhum contrato localizado com este filtro.
            </div>
          ) : (
            filteredContratos.map((cont: Contrato, idx: number) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-card p-5 shadow-card hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">Exercício: {cont.ano}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cont.status === 'Em execução'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {cont.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {cont.item}
                  </h3>
                  <p className="mt-3 font-display text-2xl font-bold text-primary tracking-tight">
                    {cont.valor}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={cont.fonte.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-primary transition-colors"
                  >
                    Publicação: <span className="underline">{cont.fonte.nome}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-[11px] text-slate-500">
                    Ref: {cont.data}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Official Audit Notice */}
      <div className="mt-8 rounded-xl border border-sky-200 bg-sky-50/80 p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0" />
          <p className="text-xs text-sky-950">
            <strong>Garantia de Transparência Pública:</strong> Todos os dados e contratos apresentados obedecem à Lei de Acesso à Informação (LAI nº 12.527/2011) e às normas do Tribunal de Contas do Estado de Rondônia (TCE-RO).
          </p>
        </div>
        <a
          href="https://transparencia.ro.gov.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-sky-800 underline hover:text-sky-950"
        >
          Acessar Portal da Transparência RO ↗
        </a>
      </div>
    </div>
  );
}
