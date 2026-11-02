'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Building2, Lightbulb, MapPin, Search } from 'lucide-react';
import CommunityComingSoon from '@/components/CommunityComingSoon';
import { medtecApi, type ProjetoPublico, type TemaProjetoPublico } from '@/lib/api';
import { COMMUNITY_COMING_SOON } from '@/lib/community-content';
import { getProjetoImageSrc } from '@/lib/projetos-content';

const PAGE_SIZE = 12;
const fieldClass = 'w-full rounded-md border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-[#00D8FF]';

export default function ProjetosView() {
  const [temas, setTemas] = useState<TemaProjetoPublico[]>([]);
  const [tema, setTema] = useState('');
  const [cidade, setCidade] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [busca, setBusca] = useState('');
  const [projetos, setProjetos] = useState<ProjetoPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    async function loadTemas() {
      try {
        const response = await medtecApi.projetosPublicos.listTemas(controller.signal);
        if (!controller.signal.aborted) setTemas(response.data);
      } catch (err) {
        // Os projetos continuam disponíveis sem o filtro.
        if (!controller.signal.aborted) console.warn('Falha ao carregar temas de projeto:', err);
      }
    }
    void loadTemas();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setBusca(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProjetos() {
      setLoading(true);
      try {
        const response = await medtecApi.projetosPublicos.list({
          tema: tema || undefined, busca: busca || undefined, page: 'all',
        }, controller.signal);
        if (controller.signal.aborted) return;
        setProjetos(response.data.items);
        setVisible(PAGE_SIZE);
      } catch {
        if (!controller.signal.aborted) setUnavailable(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadProjetos();
    return () => controller.abort();
  }, [tema, busca]);

  // O filtro `cidade` da API pede o id, mas o site não tem rota pública de cidades
  // nem recebe esse id: as opções e o recorte usam `cidade_nome` da própria lista.
  const cidades = useMemo(() => {
    const names = new Set(projetos.map((item) => item.cidade_nome).filter(Boolean));
    if (cidade) names.add(cidade);
    return [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [projetos, cidade]);
  const filtered = useMemo(
    () => (cidade ? projetos.filter((item) => item.cidade_nome === cidade) : projetos),
    [projetos, cidade],
  );

  if (unavailable) {
    return <CommunityComingSoon icon={Lightbulb} message={COMMUNITY_COMING_SOON.projetos} />;
  }

  return (
    <div>
      <div className="mb-8 grid gap-3 md:grid-cols-3 p-4 rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs">
        <select name="projetos-tema" aria-label="Filtrar por tema" value={tema} onChange={(e) => setTema(e.target.value)} className={`${fieldClass} px-3 font-semibold`}>
          <option value="">Todos os temas</option>
          {temas.map((item) => <option key={item.slug} value={item.slug}>{item.nome}</option>)}
        </select>
        <select name="projetos-cidade" aria-label="Filtrar por município" value={cidade} onChange={(e) => { setCidade(e.target.value); setVisible(PAGE_SIZE); }} className={`${fieldClass} px-3 font-semibold`}>
          <option value="">Todos os municípios</option>
          {cidades.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            name="projetos-busca"
            aria-label="Buscar projetos"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar pelo título do projeto..."
            className={`${fieldClass} pl-9 pr-3 placeholder-slate-400 dark:placeholder-slate-500`}
          />
        </div>
      </div>

      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Carregando projetos...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#1A365D] p-12 text-center bg-white/50 dark:bg-[#0C1E38]/50">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Nenhum projeto encontrado</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ajuste os filtros ou tente outra busca.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(0, visible).map((item) => {
              const image = getProjetoImageSrc(item);
              return (
                <article key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] shadow-xs hover:shadow-md transition-shadow">
                  {image && <Image unoptimized src={image} alt={`Capa do projeto ${item.titulo}`} width={640} height={360} className="h-44 w-full object-cover" />}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-xs font-semibold text-[#004A99] dark:text-sky-400">{item.tema_nome}</span>
                    <h3 className="mt-2 font-display font-bold text-base text-slate-900 dark:text-white break-words">{item.titulo}</h3>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">{item.relato}</p>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A365D] space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{item.escola_nome}</span></p>
                      <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{item.cidade_nome}</span></p>
                    </div>
                    <Link href={`/projetos/${item.id}`} aria-label={`Ver o projeto ${item.titulo}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#004A99] dark:text-[#38BDF8] hover:underline">
                      <span>Ver projeto, membros e anexos</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          {filtered.length > visible && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setVisible(visible + PAGE_SIZE)} className="rounded-md border border-slate-200 dark:border-[#1A365D] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                Carregar mais projetos
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
