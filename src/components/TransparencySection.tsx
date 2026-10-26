'use client';

import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, ShieldCheck, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { Indicador, Contrato } from '@/types';
import { sanitizeSearchInput } from '@/lib/security';

export default function TransparencySection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | number>('todos');
  const [activeTab, setActiveTab] = useState<'indicadores' | 'orcamento'>('indicadores');
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTransparency() {
      setLoading(true);
      try {
        const res = await fetch('/api/transparency');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIndicadores(data.indicadores || []);
            setContratos(data.contratos || []);
          }
        }
      } catch (err) {
        console.error('Falha ao carregar dados de transparência da API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTransparency();
    return () => {
      isMounted = false;
    };
  }, []);

  const filterItem = (title: string, year: number) => {
    const matchYear = selectedYear === 'todos' || year === selectedYear;
    const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchYear && matchSearch;
  };

  const filteredIndicadores = indicadores.filter((i) =>
    filterItem(i.metrica, i.ano)
  );

  const filteredContratos = contratos.filter((c) =>
    filterItem(c.item, c.ano)
  );

  return (
    <div>
      {/* Search and Filters Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#6482A6]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
            maxLength={100}
            placeholder="Busca rápida em transparência..."
            className="w-full rounded-lg border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#061224] py-2 pl-9 pr-3 text-sm text-slate-800 dark:text-[#E6F4FF] placeholder-slate-400 dark:placeholder-[#6482A6] focus:border-primary dark:focus:border-[#00D8FF] focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-colors"
          />
        </div>

        {/* Year Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['todos', 2026, 2025, 2024].map((ano) => (
            <button
              key={ano}
              onClick={() => setSelectedYear(ano)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                selectedYear === ano
                  ? 'bg-primary dark:bg-[#00D8FF] text-primary-foreground dark:text-slate-950 shadow-sm'
                  : 'border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F2647]'
              }`}
            >
              {ano === 'todos' ? 'Todos os anos' : ano}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 dark:border-[#1A365D] mb-6 gap-2">
        <button
          onClick={() => setActiveTab('indicadores')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'indicadores'
              ? 'border-primary dark:border-[#00D8FF] text-primary dark:text-[#00D8FF]'
              : 'border-transparent text-slate-500 dark:text-[#6482A6] hover:text-slate-800 dark:hover:text-[#E6F4FF]'
          }`}
        >
          Indicadores Educacionais ({loading ? '...' : filteredIndicadores.length})
        </button>
        <button
          onClick={() => setActiveTab('orcamento')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'orcamento'
              ? 'border-primary dark:border-[#00D8FF] text-primary dark:text-[#00D8FF]'
              : 'border-transparent text-slate-500 dark:text-[#6482A6] hover:text-slate-800 dark:hover:text-[#E6F4FF]'
          }`}
        >
          Execução Orçamentária e Contratos ({loading ? '...' : filteredContratos.length})
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white/60 dark:bg-[#0C1E38]/60 p-5 animate-pulse space-y-3"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Indicators Grid */}
          {activeTab === 'indicadores' && (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIndicadores.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-8 text-center text-sm font-mono text-slate-500 dark:text-slate-400">
                  Nenhum indicador encontrado para o termo pesquisado.
                </div>
              ) : (
                filteredIndicadores.map((ind: Indicador, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-[#00D8FF]/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#6482A6] mb-1.5 font-mono">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Ano: {ind.ano}</span>
                        <span className="text-[11px]">Atualizado: {ind.data}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-[#E6F4FF] leading-snug line-clamp-2">
                        {ind.metrica}
                      </h3>
                      <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-primary dark:text-[#00D8FF] tracking-tight">
                        {ind.valor}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-dashed border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <a
                        href={ind.fonte.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-[#00D8FF] transition-colors"
                      >
                        Fonte: <span className="underline">{ind.fonte.nome}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40 px-2 py-0.5 text-[10px] font-mono font-semibold text-sky-800 dark:text-sky-300">
                        <CheckCircle2 className="h-3 w-3 text-sky-600 dark:text-[#00D8FF]" />
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
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContratos.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-8 text-center text-sm font-mono text-slate-500 dark:text-slate-400">
              Nenhum contrato localizado com este filtro.
            </div>
          ) : (
            filteredContratos.map((cont: Contrato, idx: number) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-[#00D8FF]/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#6482A6] mb-1.5 font-mono">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Exercício: {cont.ano}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        cont.status === 'Em execução'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                          : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40'
                      }`}
                    >
                      {cont.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#E6F4FF] leading-snug line-clamp-2">
                    {cont.item}
                  </h3>
                  <p className="mt-2 font-display text-xl sm:text-2xl font-bold text-primary dark:text-[#00D8FF] tracking-tight">
                    {cont.valor}
                  </p>
                </div>

                <div className="mt-3.5 pt-3 border-t border-dashed border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <a
                    href={cont.fonte.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-[#00D8FF] transition-colors"
                  >
                    Publicação: <span className="underline">{cont.fonte.nome}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-[#6482A6]">
                    Ref: {cont.data}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )}

      {/* Official Audit Notice */}
      <div className="mt-8 rounded-xl border border-sky-200 dark:border-[#1A365D] bg-sky-50/80 dark:bg-[#0C1E38] p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-[#00D8FF] shrink-0" />
          <p className="text-xs text-sky-950 dark:text-slate-300">
            <strong>Garantia de Transparência Pública:</strong> Todos os dados e contratos apresentados obedecem à Lei de Acesso à Informação (LAI nº 12.527/2011) e às normas do Tribunal de Contas do Estado de Rondônia (TCE-RO).
          </p>
        </div>
        <a
          href="https://transparencia.ro.gov.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-[#00D8FF] hover:underline hover:text-sky-950 dark:hover:text-white transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none"
        >
          <span>Acessar Portal da Transparência RO</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
