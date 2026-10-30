'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  HelpCircle,
  Lock,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { FaqItem, FaqCategory } from '@/types';

export type FaqViewMode = 'lista' | 'editor';

interface FaqModuleProps {
  faqs: FaqItem[];
  viewMode: FaqViewMode;
  onViewModeChange: (mode: FaqViewMode) => void;
}

export default function FaqModule({
  faqs: faqsList,
  viewMode: faqViewMode,
  onViewModeChange: setFaqViewMode,
}: FaqModuleProps) {
  // Estado para formulário de Dúvidas Frequentes (FAQ)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqSearchTerm, setFaqSearchTerm] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('Todas as Dúvidas');
  const [faqTagsInput, setFaqTagsInput] = useState('');

  const emptyFaqForm: Partial<FaqItem> = {
    index: '',
    question: '',
    answer: '',
    category: 'Metodologia & Aulas ao Vivo',
    personas: ['estudantes', 'mediadores'],
    actionLink: {
      label: '',
      href: '',
    },
    tags: ['MEDTEC', 'Rondônia'],
  };

  const [faqForm, setFaqForm] = useState<Partial<FaqItem>>(emptyFaqForm);

  const handleNewFaq = () => {
    setEditingFaq(null);
    const count = faqsList.length;
    const nextIndex = String(count + 1).padStart(2, '0');
    setFaqForm({
      ...emptyFaqForm,
      index: nextIndex,
    });
    setFaqTagsInput('MEDTEC, Rondônia');
    setFaqViewMode('editor');
  };

  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFaqForm({
      ...faq,
      actionLink: faq.actionLink ? { ...faq.actionLink } : { label: '', href: '' },
      personas: [...faq.personas],
      tags: [...faq.tags],
    });
    setFaqTagsInput(faq.tags.join(', '));
    setFaqViewMode('editor');
  };

  const handleDeleteFaq = () => {
    alert('A exclusão de dúvidas frequentes (FAQ) está desabilitada aguardando suporte oficial do backend Rails. Nenhuma gravação local é simulada.');
  };

  const handleToggleFaqPersona = (persona: 'estudantes' | 'mediadores' | 'gestores') => {
    const current = faqForm.personas || [];
    const next = current.includes(persona)
      ? current.filter((p) => p !== persona)
      : [...current, persona];
    setFaqForm((prev) => ({ ...prev, personas: next }));
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    alert('A criação e edição de dúvidas frequentes (FAQ) estão desabilitadas aguardando suporte oficial do backend Rails. A persistência em disco local foi descontinuada para cumprir a diretriz de fonte única de dados.');
  };

  const categoryOptions: FaqCategory[] = [
    'Todas as Dúvidas',
    'Metodologia & Aulas ao Vivo',
    'Infraestrutura & Satélite',
    'Comunidades & Matrículas',
    'Legislação & Diretrizes',
  ];

  const getCategoryBadgeClass = (cat?: string) => {
    switch (cat) {
      case 'Metodologia & Aulas ao Vivo':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Infraestrutura & Satélite':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'Comunidades & Matrículas':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Legislação & Diretrizes':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const filteredFaqs = faqsList.filter((f) => {
    const matchesCat =
      selectedFaqCategory === 'Todas as Dúvidas' || f.category === selectedFaqCategory;
    const q = faqSearchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q)) ||
      f.index.includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Módulo em Homologação Técnica:</strong> As operações de criação, edição e exclusão de dúvidas (FAQ) estão desabilitadas aguardando suporte oficial do backend Rails. Nenhuma persistência simulada em disco local é utilizada.
        </span>
      </div>

      {/* Sub-navegação Interna: Lista vs Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFaqViewMode('lista')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              faqViewMode === 'lista'
                ? 'bg-[#004A99] text-white shadow-xs'
                : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Dúvidas Cadastradas ({faqsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (faqViewMode !== 'editor') {
                handleNewFaq();
              }
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              faqViewMode === 'editor'
                ? 'bg-[#004A99] text-white shadow-xs'
                : 'bg-white dark:bg-[#0B1729] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>{editingFaq ? `Editando: ${editingFaq.index || 'FAQ'}` : 'Nova Dúvida'}</span>
          </button>
        </div>

        {faqViewMode === 'lista' ? (
          <button
            type="button"
            onClick={handleNewFaq}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>+ Cadastrar Nova Dúvida</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingFaq(null);
              setFaqViewMode('lista');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para a Lista</span>
          </button>
        )}
      </div>

      {/* MODO 1: LISTA DE DÚVIDAS */}
      {faqViewMode === 'lista' && (
        <div className="space-y-5">
          {/* Filtros e Barra de Busca */}
          <div className="bg-white dark:bg-[#0B1729] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Campo de Busca */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={faqSearchTerm}
                  onChange={(e) => setFaqSearchTerm(e.target.value)}
                  placeholder="Buscar dúvida por palavra-chave, resposta ou tag..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] dark:focus:ring-sky-400"
                />
              </div>

              {/* Seletor de Categoria */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 shrink-0 font-medium hidden sm:inline">
                  Categoria:
                </span>
                <select
                  value={selectedFaqCategory}
                  onChange={(e) => setSelectedFaqCategory(e.target.value)}
                  className="text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags rápidas de categoria */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              {categoryOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedFaqCategory(opt)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    selectedFaqCategory === opt
                      ? 'bg-[#004A99] text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Grid / Lista de Cards de Dúvidas */}
          {filteredFaqs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1729] space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#004A99] dark:text-sky-400 mx-auto flex items-center justify-center">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Nenhuma dúvida encontrada
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {faqSearchTerm
                  ? `Nenhum resultado corresponde à busca "${faqSearchTerm}". Tente outros termos.`
                  : 'Nenhuma dúvida cadastrada nesta categoria. Clique no botão abaixo para adicionar a primeira.'}
              </p>
              <button
                type="button"
                onClick={handleNewFaq}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Cadastrar Nova Dúvida</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-[#0B1729] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#004A99]/40 dark:hover:border-sky-500/40 transition space-y-3"
                >
                  {/* Topo do Card: Número, Categoria e Ações */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-sky-400 dark:text-slate-950">
                        {faq.index || 'FAQ'}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(
                          faq.category
                        )}`}
                      >
                        {faq.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditFaq(faq)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#004A99] dark:text-sky-300 text-xs font-bold transition cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteFaq}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition cursor-pointer"
                        title="Excluir dúvida"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pergunta */}
                  <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {faq.question}
                  </h4>

                  {/* Resposta */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3">
                    {faq.answer}
                  </p>

                  {/* Rodapé: Personas, Tags e Link de Ação */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Personas e Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Público:</span>
                      {faq.personas?.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize"
                        >
                          {p}
                        </span>
                      ))}

                      {faq.tags?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                          {faq.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botão de Ação Link */}
                    {faq.actionLink?.label && faq.actionLink?.href && (
                      <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[#004A99] dark:text-sky-400 font-bold">
                        <span>Link: {faq.actionLink.label}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODO 2: EDITOR / FORMULÁRIO DE DÚVIDA */}
      {faqViewMode === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna 1 (8 cols): Formulário de Edição */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0B1729] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#004A99] dark:text-sky-400" />
                  <span>{editingFaq ? 'Editar Dúvida Frequente' : 'Cadastrar Nova Dúvida Frequente'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Preencha os campos para conferir a prévia. O salvamento aguarda suporte oficial do backend Rails.
                </p>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                {faqForm.index || '01'}
              </span>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-5">
              {/* Linha 1: Número de Ordem e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Número de Ordem (Index) *
                  </label>
                  <input
                    type="text"
                    value={faqForm.index || ''}
                    onChange={(e) => setFaqForm({ ...faqForm, index: e.target.value })}
                    placeholder="Ex: 01, 02, 11"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria Temática *
                  </label>
                  <select
                    value={faqForm.category || 'Metodologia & Aulas ao Vivo'}
                    onChange={(e) =>
                      setFaqForm({
                        ...faqForm,
                        category: e.target.value as FaqItem['category'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                    required
                  >
                    <option value="Metodologia & Aulas ao Vivo">Metodologia & Aulas ao Vivo</option>
                    <option value="Infraestrutura & Satélite">Infraestrutura & Satélite</option>
                    <option value="Comunidades & Matrículas">Comunidades & Matrículas</option>
                    <option value="Legislação & Diretrizes">Legislação & Diretrizes</option>
                  </select>
                </div>
              </div>

              {/* Pergunta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pergunta Completa *
                </label>
                <input
                  type="text"
                  value={faqForm.question || ''}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="Ex: Como funciona a transmissão ao vivo nas escolas ribeirinhas?"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] font-medium"
                  required
                />
              </div>

              {/* Resposta */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Resposta Oficial Completa *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {(faqForm.answer || '').length} caracteres
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={faqForm.answer || ''}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Escreva a resposta detalhada e oficial da SEDUC-RO para esta dúvida..."
                  className="w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99] leading-relaxed"
                  required
                />
              </div>

              {/* Personas / Públicos Alvo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Públicos-alvo (A quem interessa esta dúvida)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'estudantes', label: '🎓 Estudantes e Famílias' },
                      { id: 'mediadores', label: '👩‍🏫 Professores Mediadores' },
                      { id: 'gestores', label: '🏢 Gestores Escolares / SEDUC' },
                    ] as const
                  ).map((p) => {
                    const isSelected = (faqForm.personas || []).includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleToggleFaqPersona(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 text-[#004A99] dark:text-sky-300'
                            : 'bg-slate-50 dark:bg-[#071324] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Link de Ação Opcional (Redirecionamento) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Botão de Ação / Link Rápido (Opcional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={faqForm.actionLink?.label || ''}
                      onChange={(e) =>
                        setFaqForm({
                          ...faqForm,
                          actionLink: {
                            label: e.target.value,
                            href: faqForm.actionLink?.href || '',
                          },
                        })
                      }
                      placeholder="Ex: CONHECER O CORPO DOCENTE"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      URL de Destino
                    </label>
                    <input
                      type="text"
                      value={faqForm.actionLink?.href || ''}
                      onChange={(e) =>
                        setFaqForm({
                          ...faqForm,
                          actionLink: {
                            label: faqForm.actionLink?.label || '',
                            href: e.target.value,
                          },
                        })
                      }
                      placeholder="Ex: /professores, /mapa, /noticias"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B1729] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tags e Palavras-chave (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={faqTagsInput}
                  onChange={(e) => setFaqTagsInput(e.target.value)}
                  placeholder="Ex: MEDTEC, Satélite, Aulas ao Vivo, CEE-RO"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004A99]"
                />
              </div>

              {/* Botões do Formulário */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFaq(null);
                    setFaqViewMode('lista');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={true}
                  title="Aguardando suporte oficial do backend Rails"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-400 text-white text-xs font-bold transition shadow-xs cursor-not-allowed opacity-60"
                >
                  <Lock className="h-4 w-4" />
                  <span>Aguardando Endpoint da API</span>
                </button>
              </div>
            </form>
          </div>

          {/* Coluna 2 (4 cols): Pré-visualização Fiel em Tempo Real */}
          <div className="lg:col-span-4 space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Visualização no Portal</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Em tempo real</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-sky-400 dark:text-slate-950">
                  {faqForm.index || '01'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                    faqForm.category
                  )}`}
                >
                  {faqForm.category || 'Metodologia & Aulas ao Vivo'}
                </span>
              </div>

              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {faqForm.question || 'Sua pergunta aparecerá aqui...'}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                {faqForm.answer || 'A resposta detalhada oficial aparecerá aqui.'}
              </p>

              {/* Personas */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-wrap gap-1">
                {(faqForm.personas || []).map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Ação */}
              {faqForm.actionLink?.label && faqForm.actionLink?.href && (
                <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-[#0284C7] dark:text-[#00D8FF] font-mono font-bold">
                  <span className="truncate">{faqForm.actionLink.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
              <p className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Prévia sem publicação</span>
              </p>
              <p className="text-[11px] mt-0.5">
                Esta prévia não altera o portal. A publicação aguarda suporte oficial do backend Rails.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
