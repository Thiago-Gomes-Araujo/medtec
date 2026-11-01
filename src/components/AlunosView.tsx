'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import StudentStories from '@/components/StudentStories';
import { medtecApi, type CategoriaConquistaPublica, type ConquistaPublica } from '@/lib/api';
import { communityErrorMessage } from '@/lib/community-content';

const PAGE_SIZE = 12;
const fieldClass = 'w-full rounded-md border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-[#00D8FF]';

export default function AlunosView() {
  const [categorias, setCategorias] = useState<CategoriaConquistaPublica[]>([]);
  const [categoria, setCategoria] = useState('');
  const [cidade, setCidade] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [busca, setBusca] = useState('');
  const [conquistas, setConquistas] = useState<ConquistaPublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCategorias() {
      try {
        const response = await medtecApi.conquistasPublicas.listCategorias(controller.signal);
        if (!controller.signal.aborted) setCategorias(response.data);
      } catch (err) {
        // As conquistas continuam disponíveis sem o filtro.
        if (!controller.signal.aborted) console.warn('Falha ao carregar categorias de conquistas:', err);
      }
    }
    void loadCategorias();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setBusca(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadConquistas() {
      setLoading(true);
      setError(null);
      try {
        const response = await medtecApi.conquistasPublicas.list({
          categoria: categoria || undefined, busca: busca || undefined, page: 'all',
        }, controller.signal);
        if (controller.signal.aborted) return;
        setConquistas(response.data.items);
        setVisible(PAGE_SIZE);
      } catch (err) {
        if (!controller.signal.aborted) setError(communityErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadConquistas();
    return () => controller.abort();
  }, [categoria, busca, version]);

  // O filtro `cidade` da API pede o id, mas o site não tem rota pública de cidades
  // nem recebe esse id: as opções e o recorte usam `cidade_nome` da própria lista.
  const cidades = useMemo(() => {
    const names = new Set(conquistas.map((item) => item.cidade_nome).filter(Boolean));
    if (cidade) names.add(cidade);
    return [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [conquistas, cidade]);
  const filtered = useMemo(
    () => (cidade ? conquistas.filter((item) => item.cidade_nome === cidade) : conquistas),
    [conquistas, cidade],
  );

  return (
    <div>
      <div className="mb-8 grid gap-3 md:grid-cols-3 p-4 rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs">
        <select name="conquistas-categoria" aria-label="Filtrar por categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} className={`${fieldClass} px-3 font-semibold`}>
          <option value="">Todas as conquistas</option>
          {categorias.map((item) => <option key={item.slug} value={item.slug}>{item.nome}</option>)}
        </select>
        <select name="conquistas-cidade" aria-label="Filtrar por município" value={cidade} onChange={(e) => { setCidade(e.target.value); setVisible(PAGE_SIZE); }} className={`${fieldClass} px-3 font-semibold`}>
          <option value="">Todos os municípios</option>
          {cidades.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            name="conquistas-busca"
            aria-label="Buscar conquistas"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do aluno ou título..."
            className={`${fieldClass} pl-9 pr-3 placeholder-slate-400 dark:placeholder-slate-500`}
          />
        </div>
      </div>

      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Carregando conquistas...</p>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-6 text-sm text-amber-900 dark:text-amber-200 space-y-3">
          <p>{error}</p>
          <button type="button" onClick={() => setVersion((current) => current + 1)} className="font-bold underline cursor-pointer">Tentar novamente</button>
        </div>
      ) : (
        <>
          <StudentStories conquistas={filtered.slice(0, visible)} />
          {filtered.length > visible && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setVisible(visible + PAGE_SIZE)} className="rounded-md border border-slate-200 dark:border-[#1A365D] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                Carregar mais conquistas
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
