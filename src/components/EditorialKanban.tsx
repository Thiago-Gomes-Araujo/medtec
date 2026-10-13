'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  etapasEditoriais,
  itensEditoriaisIniciais,
  ItemEditorial,
  EtapaEditorial
} from '@/data/medtecData';

interface AuditLog {
  data: string;
  acao: string;
  titulo: string;
}

export default function EditorialKanban() {
  const [itens, setItens] = useState<ItemEditorial[]>(itensEditoriaisIniciais);
  const [historico, setHistorico] = useState<AuditLog[]>([
    {
      data: '09/10/2026 14:20',
      acao: 'Enviado para Revisão Jurídica/LGPD',
      titulo: itensEditoriaisIniciais[0].titulo
    },
    {
      data: '08/10/2026 10:05',
      acao: 'Aprovado pela Coordenação MEDTEC',
      titulo: itensEditoriaisIniciais[1].titulo
    },
    {
      data: '02/10/2026 09:00',
      acao: 'Publicado na Rede SEDUC',
      titulo: itensEditoriaisIniciais[2].titulo
    }
  ]);

  const avancarEtapa = (id: number) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const currentIndex = etapasEditoriais.indexOf(item.etapa);
        const nextIndex = Math.min(currentIndex + 1, etapasEditoriais.length - 1);
        const proximaEtapa = etapasEditoriais[nextIndex];

        setHistorico((h) => [
          {
            data: new Date().toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            acao: `Avançado para ${proximaEtapa}`,
            titulo: item.titulo,
          },
          ...h,
        ]);

        return {
          ...item,
          etapa: proximaEtapa,
          atualizado: new Date().toLocaleDateString('pt-BR'),
        };
      })
    );
  };

  return (
    <div className="space-y-10">
      {/* 4 Stages Kanban Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {etapasEditoriais.map((etapaNome, idx) => {
          const itensDestaEtapa = itens.filter((i) => i.etapa === etapaNome);

          return (
            <div
              key={etapaNome}
              className="rounded-2xl border border-slate-200 bg-card p-4 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Etapa {idx + 1}
                  </span>
                  <span className="font-display text-xl font-bold text-primary">
                    {itensDestaEtapa.length}
                  </span>
                </div>

                <p className="mt-1 font-semibold text-slate-900 text-sm">{etapaNome}</p>

                <div className="mt-3 space-y-2">
                  {itensDestaEtapa.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">Nenhum item nesta etapa</p>
                  ) : (
                    itensDestaEtapa.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 shadow-sm hover:border-slate-300 transition-colors"
                      >
                        <p className="text-xs font-semibold text-slate-800 leading-snug">
                          {item.titulo}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {item.tipo} · {item.autor}
                        </p>

                        {item.anexos.length > 0 && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                            <Paperclip className="h-3 w-3 text-slate-400" />
                            {item.anexos.length} anexo(s) verificado(s)
                          </p>
                        )}

                        {etapaNome === 'Publicado' ? (
                          <p className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded px-2 py-0.5 w-fit">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            No ar / Aprovado
                          </p>
                        ) : (
                          <button
                            onClick={() => avancarEtapa(item.id)}
                            className="mt-2.5 flex items-center justify-center gap-1 w-full rounded-lg bg-primary text-primary-foreground py-1.5 text-xs font-semibold shadow hover:opacity-90 transition-opacity"
                          >
                            Avançar
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Columns: Attached Documents Table & Approval Audit History */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Table of Documents */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Conteúdos e Documentos Anexados
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-card shadow-card">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Conteúdo</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Anexos Auditados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itens.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-900">
                      {item.titulo}
                      <span className="block text-xs font-normal text-slate-500 mt-0.5">
                        Atualizado em {item.atualizado}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.etapa === 'Publicado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.etapa === 'Revisão Jurídica/LGPD'
                            ? 'bg-amber-100 text-amber-800'
                            : item.etapa === 'Aprovado'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.etapa}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      {item.anexos.length ? (
                        <div className="space-y-1">
                          {item.anexos.map((anexo) => (
                            <span
                              key={anexo}
                              className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]"
                            >
                              <FileCheck className="h-3.5 w-3.5 text-primary" />
                              {anexo}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit History Timeline */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Histórico de Aprovação e Auditoria
          </h2>

          <ol className="space-y-3 rounded-2xl border border-slate-200 bg-card p-5 shadow-card max-h-[380px] overflow-y-auto">
            {historico.map((log, idx) => (
              <li key={idx} className="border-l-2 border-primary pl-3 py-1">
                <p className="text-[11px] text-slate-400 font-medium">{log.data}</p>
                <p className="text-sm font-semibold text-slate-800">{log.acao}</p>
                <p className="text-xs text-slate-500 truncate">{log.titulo}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
