'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Presentation,
  Award,
  GraduationCap,
  Medal,
  Cpu,
  Building2,
  MapPin,
  ArrowRight,
  CheckCircle2,
  X,
  Quote,
  Sparkles,
  ShieldCheck,
  BookOpen,
  School,
  Tv
} from 'lucide-react';
import { Professor, Aluno } from '@/types';

// Curated 3 featured teachers
const featuredTeachers: Professor[] = [
  {
    id: 1,
    nome: 'Profa. Ana Beatriz Moura',
    funcao: 'Ministrante',
    disciplina: 'Biologia',
    municipio: 'Porto Velho',
    escola: 'Estúdio MEDTEC, SEDUC-RO',
    resumo: 'Transforma o bioma amazônico em laboratório vivo, conectando conteúdos do ENEM à realidade das comunidades ribeirinhas.',
    entrevista: 'Começo cada aula lembrando que do outro lado da tela há estudantes que atravessam rios para chegar à escola. Uso exemplos da floresta, da pesca e da agricultura familiar para tornar a biologia concreta. O retorno dos mediadores é essencial: eles me contam o que funcionou e o que precisa de reforço imediato nas transmissões.'
  },
  {
    id: 2,
    nome: 'Prof. Carlos Henrique Lima',
    funcao: 'Mediador',
    disciplina: 'Mediação Presencial',
    municipio: 'Guajará-Mirim',
    escola: 'EEEFM Simón Bolívar (Surpresa)',
    resumo: 'Há 7 anos mediando aulas no distrito de Surpresa, organiza grupos de estudo e acolhe estudantes de comunidades isoladas.',
    entrevista: 'Meu papel não é substituir o ministrante da TV, mas ser a ponte humana. Quando a transmissão termina, tiramos dúvidas, fazemos experimentos com o que temos na comunidade e garantimos que nenhum jovem desista do sonho de concluir o Ensino Médio.'
  },
  {
    id: 3,
    nome: 'Profa. Marta Oro Win',
    funcao: 'Mediadora',
    disciplina: 'Língua Materna e Mediação',
    municipio: 'Cacoal',
    escola: 'EEEFM Indígena Paiter Suruí',
    resumo: 'Articula os saberes tradicionais do povo Suruí com o currículo estadual transmitido ao vivo da capital.',
    entrevista: 'O MEDTEC nos deu autonomia sem apagar nossa identidade. As aulas chegam em alta resolução via satélite, e em sala integramos os conceitos com a nossa língua, história e preservação ambiental.'
  }
];

// Curated 3 featured students
const featuredStudents: Aluno[] = [
  {
    id: 1,
    nome: 'Larissa Gomes',
    idade: 17,
    comunidade: 'Distrito de Nazaré (ribeirinha)',
    municipio: 'Porto Velho',
    conquista: 'Aprovada em Medicina na UNIR',
    categoria: 'Vestibular',
    resumo: 'Estudou pelas aulas do MEDTEC no distrito às margens do Rio Madeira e conquistou vaga direta no curso de Medicina através do ENEM.'
  },
  {
    id: 2,
    nome: 'Pedro Henrique Souza',
    idade: 16,
    comunidade: 'Linha 184 (rural)',
    municipio: 'Vilhena',
    conquista: 'Medalha de Prata na OBMEP',
    categoria: 'Olimpíada',
    resumo: 'Filho de pequenos agricultores da Linha 184, destacou-se nacionalmente na Olimpíada Brasileira de Matemática das Escolas Públicas com reforço das aulas de estúdio.'
  },
  {
    id: 3,
    nome: 'Equipe Robótica Jamari',
    idade: 17,
    comunidade: 'Distrito de Triunfo (rural)',
    municipio: 'Candeias do Jamari',
    conquista: '1º Lugar na Feira Estadual de Ciências',
    categoria: 'Robótica',
    resumo: 'Desenvolveram protótipo funcional de sensor de umidade de solo de baixo custo para otimizar irrigação na agricultura familiar do Cone Sul.'
  }
];

function getInitials(name: string) {
  const parts = name.replace(/^(Prof\.|Profa\.)\s*/i, '').trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StudentCategoryIcon({ categoria, className }: { categoria: string; className?: string }) {
  switch (categoria) {
    case 'Vestibular':
      return <GraduationCap className={className} />;
    case 'Olimpíada':
      return <Medal className={className} />;
    case 'Robótica':
      return <Cpu className={className} />;
    default:
      return <Award className={className} />;
  }
}

export default function CommunityMuralSection() {
  const [selectedTeacher, setSelectedTeacher] = useState<Professor | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Aluno | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTeacher(null);
        setSelectedStudent(null);
      }
    };
    if (selectedTeacher || selectedStudent) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedTeacher, selectedStudent]);

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
              {/* Topo do Mural Docente */}
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

              {/* Lista dos 3 Docentes em Destaque */}
              <div className="mt-5 space-y-3.5">
                {featuredTeachers.map((prof) => {
                  const isMinistrante = prof.funcao === 'Ministrante';

                  return (
                    <div
                      key={prof.id}
                      onClick={() => setSelectedTeacher(prof)}
                      className="group p-4 rounded-lg border border-slate-200/90 dark:border-slate-800/90 bg-slate-50/60 dark:bg-[#061224]/60 hover:bg-slate-50 dark:hover:bg-[#0F2647]/50 hover:border-[#004A99]/40 dark:hover:border-[#00D8FF]/40 transition-all cursor-pointer shadow-2xs"
                    >
                      {/* Linha Superior: Avatar + Nome + Especialidade + Badge de Papel */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          {/* Avatar Técnico Quadrado */}
                          <div
                            className={`w-11 h-11 rounded-md text-white font-bold text-sm grid place-items-center shrink-0 shadow-2xs ${
                              isMinistrante ? 'bg-[#004A99]' : 'bg-[#0F766E]'
                            }`}
                          >
                            {getInitials(prof.nome)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate group-hover:text-[#004A99] dark:group-hover:text-[#00D8FF] transition-colors">
                              {prof.nome}
                            </h4>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              <BookOpen className="h-3 w-3 text-slate-400" />
                              {prof.disciplina}
                            </span>
                          </div>
                        </div>

                        {/* Selo de Papel Pedagógico */}
                        {isMinistrante ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 text-[11px] font-semibold text-[#004A99] dark:text-[#38BDF8] border border-sky-200 dark:border-sky-800/50 w-fit shrink-0">
                            <Tv className="h-3 w-3 shrink-0" />
                            Ministrante • Estúdio PVH
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50 w-fit shrink-0">
                            <School className="h-3 w-3 shrink-0" />
                            Mediação Presencial • Escola
                          </span>
                        )}
                      </div>

                      {/* Unidade e Município */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {prof.escola} • {prof.municipio}
                        </span>
                      </div>

                      {/* Resumo da Prática Pedagógica */}
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {prof.resumo}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rodapé da Coluna Esquerda: Link CTA */}
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
              {/* Topo do Mural Estudantil */}
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
                      Histórias reais de aprovações, medalhas científicas e inovação estudantil (LGPD verificada).
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

              {/* Lista das 3 Conquistas em Destaque */}
              <div className="mt-5 space-y-3.5">
                {featuredStudents.map((aluno) => {
                  return (
                    <div
                      key={aluno.id}
                      onClick={() => setSelectedStudent(aluno)}
                      className="group p-4 rounded-lg border border-slate-200/90 dark:border-slate-800/90 bg-slate-50/60 dark:bg-[#061224]/60 hover:bg-slate-50 dark:hover:bg-[#0F2647]/50 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 transition-all cursor-pointer shadow-2xs"
                    >
                      {/* Faixa Superior de Conquista (Trophy-first) */}
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-md px-3 py-2 mb-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <StudentCategoryIcon
                            categoria={aluno.categoria}
                            className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0"
                          />
                          <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200 truncate group-hover:underline">
                            {aluno.conquista}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded shrink-0">
                          {aluno.categoria}
                        </span>
                      </div>

                      {/* Protagonista e Linha Territorial */}
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {aluno.nome}
                        </h4>
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>✓ Imagem autorizada (LGPD)</span>
                        </span>
                      </div>

                      {/* Rota Territorial */}
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {aluno.comunidade} • {aluno.municipio}
                        </span>
                      </p>

                      {/* Resumo da Trajetória */}
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {aluno.resumo}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rodapé da Coluna Direita: Link CTA */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-xl bg-white dark:bg-[#0C1E38] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3.5 pr-8">
              <div
                className={`w-14 h-14 rounded-md text-white font-bold text-lg grid place-items-center shrink-0 shadow-xs ${
                  selectedTeacher.funcao === 'Ministrante' ? 'bg-[#004A99]' : 'bg-[#0F766E]'
                }`}
              >
                {getInitials(selectedTeacher.nome)}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {selectedTeacher.nome}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedTeacher.disciplina} • {selectedTeacher.funcao}
                </p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="mt-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061224] p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span><strong>Lotação:</strong> {selectedTeacher.escola}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span><strong>Município:</strong> {selectedTeacher.municipio}, Rondônia</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#004A99] dark:text-[#00D8FF]" />
                  <span>Relato de Prática Docente com Mediação Tecnológica</span>
                </div>
                <div className="relative rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#061224] p-4">
                  <Quote className="h-5 w-5 text-slate-300 dark:text-slate-600 mb-1" />
                  <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 italic">
                    “{selectedTeacher.entrevista}”
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300">
                <strong className="block text-slate-900 dark:text-white mb-1">Prática Pedagógica:</strong>
                <p className="leading-relaxed">{selectedTeacher.resumo}</p>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <Link
                href="/professores"
                className="text-xs font-semibold text-[#004A99] dark:text-[#38BDF8] hover:underline"
              >
                Abrir diretório acadêmico completo →
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

      {/* ================= MODAL DE LEITURA RÁPIDA: ALUNO ================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-xl bg-white dark:bg-[#0C1E38] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer absolute right-4 top-4"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Cabeçalho do Aluno */}
            <div className="pr-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                  Protagonismo Estudantil
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {selectedStudent.categoria}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {selectedStudent.conquista}
              </h3>
            </div>

            {/* Conteúdo */}
            <div className="mt-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061224] p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedStudent.nome} ({selectedStudent.idade} anos)
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    LGPD Verificada
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{selectedStudent.comunidade} • {selectedStudent.municipio}, Rondônia</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>História de Sucesso no MEDTEC</span>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#061224] p-4">
                  <Quote className="h-5 w-5 text-slate-300 dark:text-slate-600 mb-1" />
                  <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 italic">
                    “{selectedStudent.resumo}”
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Registro de autorização de imagem e consentimento livre e esclarecido firmado conforme a Lei nº 13.709/2018 (LGPD) e o Estatuto da Criança e do Adolescente (ECA).
                </span>
              </div>
            </div>

            {/* Rodapé do Modal */}
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
