'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDialogFocus } from './useDialogFocus';
import { motion } from 'framer-motion';
import {
  Presentation,
  Award,
  Building2,
  MapPin,
  ArrowRight,
  X,
  Quote,
  BookOpen,
} from 'lucide-react';
import { medtecApi, type ConquistaPublica, type ProfessorPublico } from '@/lib/api';
import { getNameInitials } from '@/lib/community-content';

interface CommunityMuralSectionProps {
  initialTeachers?: ProfessorPublico[];
  initialStudents?: ConquistaPublica[];
}

function renderSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061224] animate-pulse">
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function CommunityMuralSection({ initialTeachers, initialStudents }: CommunityMuralSectionProps = {}) {
  const [teachers, setTeachers] = useState<ProfessorPublico[]>(initialTeachers || []);
  const [students, setStudents] = useState<ConquistaPublica[]>(initialStudents || []);
  const [loading, setLoading] = useState(!initialTeachers && !initialStudents);
  const [teachersFailed, setTeachersFailed] = useState(false);
  const [studentsFailed, setStudentsFailed] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<ProfessorPublico | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<ConquistaPublica | null>(null);

  useEffect(() => {
    if (initialTeachers && initialStudents) return;

    const controller = new AbortController();
    async function loadCommunity() {
      setLoading(true);
      const [teachersResult, studentsResult] = await Promise.allSettled([
        medtecApi.professoresPublicos.list({ page: 1, per_page: 3 }, controller.signal),
        medtecApi.conquistasPublicas.list({ page: 1, per_page: 3 }, controller.signal),
      ]);
      if (controller.signal.aborted) return;
      if (teachersResult.status === 'fulfilled') setTeachers(teachersResult.value.data.items);
      setTeachersFailed(teachersResult.status === 'rejected');
      if (studentsResult.status === 'fulfilled') setStudents(studentsResult.value.data.items);
      setStudentsFailed(studentsResult.status === 'rejected');
      setLoading(false);
    }

    void loadCommunity();
    return () => controller.abort();
  }, [initialTeachers, initialStudents]);

  const { dialogRef: teacherDialogRef, overlayRef: teacherOverlayRef } = useDialogFocus(!!selectedTeacher, () => setSelectedTeacher(null));
  const { dialogRef: studentDialogRef, overlayRef: studentOverlayRef } = useDialogFocus(!!selectedStudent, () => setSelectedStudent(null));

  return (
    <section
      id="comunidade-escolar"
      className="relative scroll-mt-20 py-20 sm:py-28 bg-white dark:bg-[#07162C] transition-colors duration-200 border-t border-slate-200/80 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ================= 1. CABEÇALHO GERAL DA SEÇÃO ================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="space-y-3 max-w-3xl"
        >
          <p className="text-sm font-semibold text-[#004A99] dark:text-sky-400">
            Comunidade Escolar Conectada
          </p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-slate-900 dark:text-white text-balance">
            Quem Ensina e Quem Transforma a Educação em Rondônia
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-normal text-pretty">
            Conheça os professores ministrantes e mediadores que conduzem as aulas diárias e os estudantes das comunidades rurais, ribeirinhas e indígenas que conquistaram resultados de destaque.
          </p>
        </motion.div>

        {/* ================= 2. MURAL LADO A LADO EM 2 COLUNAS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
        >
          {/* ================= COLUNA DA ESQUERDA: CORPO DOCENTE ================= */}
          <div className="bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-between shadow-xs border-t-4 border-t-[#004A99]">
            <div>
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-sky-50 dark:bg-sky-950/40 text-[#004A99] dark:text-[#38BDF8] border border-sky-200 dark:border-sky-800/40 shrink-0 mt-0.5">
                    <Presentation className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      Professores e Mediadores
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Integração entre o estúdio central em Porto Velho e as salas de aula nos municípios.
                    </p>
                  </div>
                </div>

                <Link
                  href="/professores"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#004A99] dark:text-[#38BDF8] hover:underline shrink-0 pt-0.5"
                >
                  <span>Ver quadro docente</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-5 space-y-3.5">
                {loading ? renderSkeleton() : teachers.length === 0 ? (
                  <div className="my-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-[#061224]/50">
                    <Presentation className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {teachersFailed ? 'Não foi possível carregar os professores' : 'Nenhum docente cadastrado'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                      {teachersFailed ? 'Tente novamente em instantes.' : 'Os perfis docentes serão exibidos assim que cadastrados.'}
                    </p>
                  </div>
                ) : (
                  teachers.slice(0, 3).map((prof) => (
                    <div
                      key={prof.id}
                      className="relative group p-4 rounded-lg border border-slate-200/90 dark:border-slate-800/90 bg-slate-50/60 dark:bg-[#061224]/60 hover:bg-slate-50 dark:hover:bg-[#0F2647]/50 hover:border-[#004A99]/40 dark:hover:border-[#00D8FF]/40 transition-all cursor-pointer shadow-2xs"
                    >
                      <button type="button" aria-label={`Abrir perfil de ${prof.nome}`} aria-haspopup="dialog"
                        onClick={() => setSelectedTeacher(prof)}
                        className="absolute inset-0 z-10 w-full rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" />
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-md bg-[#004A99] text-white font-bold text-sm grid place-items-center shrink-0 shadow-2xs">
                          {getNameInitials(prof.nome)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors">
                            {prof.nome}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            <BookOpen className="h-3 w-3 text-slate-400" />
                            {prof.disciplinas.map((item) => item.nome).join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {prof.escola_nome} • {prof.cidade_nome}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {prof.pratica_pedagogica}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/professores"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#004A99] hover:bg-[#003875] text-white dark:bg-[#00D8FF] dark:hover:brightness-110 dark:text-slate-950 py-2.5 px-4 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <span>Explorar Todos os Professores e Mediadores</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* ================= COLUNA DA DIREITA: ALUNOS QUE INSPIRAM ================= */}
          <div className="bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col justify-between shadow-xs border-t-4 border-t-emerald-600">
            <div>
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shrink-0 mt-0.5">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      Alunos que Inspiram
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Histórias de aprovações, medalhas científicas e inovação estudantil.
                    </p>
                  </div>
                </div>

                <Link
                  href="/alunos"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 pt-0.5"
                >
                  <span>Ver todas as conquistas</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-5 space-y-3.5">
                {loading ? renderSkeleton() : students.length === 0 ? (
                  <div className="my-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-[#061224]/50">
                    <Award className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {studentsFailed ? 'Não foi possível carregar as conquistas' : 'Nenhuma conquista publicada'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                      {studentsFailed ? 'Tente novamente em instantes.' : 'As histórias de estudantes serão exibidas assim que publicadas.'}
                    </p>
                  </div>
                ) : (
                  students.slice(0, 3).map((conquista) => (
                    <div
                      key={conquista.id}
                      className="relative group p-4 rounded-lg border border-slate-200/90 dark:border-slate-800/90 bg-slate-50/60 dark:bg-[#061224]/60 hover:bg-slate-50 dark:hover:bg-[#0F2647]/50 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 transition-all cursor-pointer shadow-2xs"
                    >
                      <button type="button" aria-label={`Abrir conquista de ${conquista.nome_aluno}`} aria-haspopup="dialog"
                        onClick={() => setSelectedStudent(conquista)}
                        className="absolute inset-0 z-10 w-full rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500" />
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-md px-3 py-2 mb-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Award className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200 truncate group-hover:underline">
                            {conquista.titulo}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded shrink-0">
                          {conquista.categoria_nome}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {conquista.nome_aluno}
                      </h4>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {conquista.escola_nome} • {conquista.cidade_nome}
                        </span>
                      </p>

                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {conquista.relato}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/alunos"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 py-2.5 px-4 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <span>Conhecer Todas as Histórias de Alunos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= MODAL DE LEITURA RÁPIDA: PROFESSOR ================= */}
      {selectedTeacher && (
        <div ref={teacherOverlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div ref={teacherDialogRef} role="dialog" aria-modal="true" aria-label={`Perfil de ${selectedTeacher.nome}`} tabIndex={-1} className="relative w-full max-w-xl rounded-xl bg-white dark:bg-[#0C1E38] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-14 h-14 rounded-md bg-[#004A99] text-white font-bold text-lg grid place-items-center shrink-0 shadow-xs">
                {getNameInitials(selectedTeacher.nome)}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {selectedTeacher.nome}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedTeacher.disciplinas.map((item) => item.nome).join(', ')}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061224] p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span><strong>Escola:</strong> {selectedTeacher.escola_nome}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span><strong>Município:</strong> {selectedTeacher.cidade_nome}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300">
                <strong className="block text-slate-900 dark:text-white mb-1">Prática Pedagógica:</strong>
                <p className="leading-relaxed">{selectedTeacher.pratica_pedagogica}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <Link
                href={`/professores/${selectedTeacher.id}`}
                className="text-xs font-semibold text-[#004A99] dark:text-[#38BDF8] hover:underline"
              >
                Ver página e relatos →
              </Link>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="rounded-md bg-slate-900 dark:bg-[#00D8FF] px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:brightness-110 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE LEITURA RÁPIDA: CONQUISTA ================= */}
      {selectedStudent && (
        <div ref={studentOverlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div ref={studentDialogRef} role="dialog" aria-modal="true" aria-label={`Conquista de ${selectedStudent.nome_aluno}`} tabIndex={-1} className="relative w-full max-w-xl rounded-xl bg-white dark:bg-[#0C1E38] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer absolute right-4 top-4"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-8">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {selectedStudent.categoria_nome}
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {selectedStudent.titulo}
              </h3>
            </div>

            <div className="mt-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061224] p-3 text-xs space-y-1.5">
                <p className="font-semibold text-slate-900 dark:text-white">{selectedStudent.nome_aluno}</p>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{selectedStudent.escola_nome} • {selectedStudent.cidade_nome}</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#061224] p-4">
                <Quote className="h-5 w-5 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {selectedStudent.relato}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <Link
                href="/alunos"
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Ver todas as histórias de alunos →
              </Link>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-md bg-slate-900 dark:bg-[#00D8FF] px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:brightness-110 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
