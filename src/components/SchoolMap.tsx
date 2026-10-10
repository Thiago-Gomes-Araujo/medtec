'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, BookOpen, Satellite, Users, UserCheck } from 'lucide-react';
import { escolasData, municipiosList, geoPositions, Escola } from '@/data/medtecData';

export default function SchoolMap() {
  const [selectedCity, setSelectedCity] = useState<string>('Porto Velho');
  const [selectedType, setSelectedType] = useState<string>('todas');

  const filteredSchools = useMemo(() => {
    return escolasData.filter((e) => {
      const matchCity = selectedCity === 'Todos' || e.municipio === selectedCity;
      const matchType = selectedType === 'todas' || e.tipo === selectedType;
      return matchCity && matchType;
    });
  }, [selectedCity, selectedType]);

  const stats = useMemo(() => {
    return filteredSchools.reduce(
      (acc, curr) => ({
        turmas: acc.turmas + curr.turmas,
        alunos: acc.alunos + curr.alunos,
      }),
      { turmas: 0, alunos: 0 }
    );
  }, [filteredSchools]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Map Column */}
      <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-card flex flex-col justify-between">
        <div>
          {/* City Filters */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCity('Todos')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCity === 'Todos'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Todos
            </button>
            {municipiosList.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedCity(m)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCity === m
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['todas', 'urbana', 'rural', 'ribeirinha', 'indígena'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setSelectedType(tipo)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  selectedType === tipo
                    ? 'bg-secondary text-secondary-foreground font-semibold border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* Territory SVG Canvas */}
        <div className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-xl bg-sky-50/50 border border-sky-100 shadow-inner">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {/* Rondônia Territory Polygon */}
            <path
              d="M22 4 L44 8 L52 22 L66 30 L78 44 L88 62 L92 92 L70 96 L56 80 L40 72 L22 62 L6 54 L8 36 L16 24 Z"
              className="fill-sky-100/60 stroke-sky-500"
              strokeWidth="0.8"
            />
            {/* Madeira River Line */}
            <path
              d="M22 4 C 26 14, 20 30, 10 44"
              className="fill-none stroke-blue-500/80"
              strokeWidth="1.4"
              strokeDasharray="2 1"
            />
          </svg>

          {/* Geo Pins for Municipalities */}
          {municipiosList.map((m) => {
            const [x, y] = geoPositions[m] ?? [50, 50];
            const isSelected = selectedCity === m;

            return (
              <button
                key={m}
                onClick={() => setSelectedCity(m)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-full text-center transition-all group z-10"
                title={`Ver escolas em ${m}`}
              >
                <MapPin
                  className={`mx-auto h-7 w-7 transition-all ${
                    isSelected
                      ? 'scale-125 fill-primary text-primary-foreground drop-shadow-md'
                      : 'fill-white text-primary drop-shadow group-hover:scale-110'
                  }`}
                />
                <span
                  className={`mt-0.5 block whitespace-nowrap rounded px-1.5 text-[10px] font-semibold transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-white/95 text-slate-800 shadow-sm border border-slate-200 group-hover:bg-slate-50'
                  }`}
                >
                  {m}
                </span>
              </button>
            );
          })}

          <div className="absolute bottom-2 left-2 rounded-md bg-white/80 backdrop-blur px-2 py-1 text-[10px] text-slate-500 border border-slate-200">
            Território de Rondônia · Cobertura 100%
          </div>
        </div>
      </div>

      {/* School List & Stats Column */}
      <div className="space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-card p-4 text-center shadow-card">
            <p className="font-display text-2xl font-bold text-primary">{filteredSchools.length}</p>
            <p className="text-xs text-slate-500 font-medium">Escolas</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-card p-4 text-center shadow-card">
            <p className="font-display text-2xl font-bold text-primary">{stats.turmas}</p>
            <p className="text-xs text-slate-500 font-medium">Turmas</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-card p-4 text-center shadow-card">
            <p className="font-display text-2xl font-bold text-primary">{stats.alunos}</p>
            <p className="text-xs text-slate-500 font-medium">Alunos</p>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
          {filteredSchools.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-card p-8 text-center text-sm text-slate-500">
              Nenhuma unidade escolar encontrada para o filtro selecionado.
            </p>
          ) : (
            filteredSchools.map((escola: Escola) => (
              <div
                key={escola.id}
                className="rounded-xl border border-slate-200 bg-card p-4 shadow-card hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {escola.nome}
                  </h3>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                    {escola.tipo}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500 font-medium">
                  {escola.municipio}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    {escola.turmas} turmas
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    {escola.alunos} alunos
                  </span>
                  <span className="flex items-center gap-1">
                    <Satellite className="h-3.5 w-3.5 text-primary" />
                    {escola.conexao}
                  </span>
                  <span className="col-span-2 flex items-center gap-1 sm:col-span-4 font-medium text-slate-700 bg-slate-50 rounded p-1">
                    <UserCheck className="h-3.5 w-3.5 text-success shrink-0" />
                    <span className="truncate">Mediador: {escola.mediador}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
