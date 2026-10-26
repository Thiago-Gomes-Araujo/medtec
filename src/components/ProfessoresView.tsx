'use client';

import React, { useState } from 'react';
import TeacherProfiles from '@/components/TeacherProfiles';

export default function ProfessoresView() {
  const [filterRole, setFilterRole] = useState<'Todas' | 'Ministrante' | 'Mediador'>('Todas');

  return (
    <div>
      {/* Quick Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['Todas', 'Ministrante', 'Mediador'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              filterRole === role
                ? 'bg-slate-900 text-white dark:bg-[#00D8FF] dark:text-slate-950 shadow-xs'
                : 'border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F2647]'
            }`}
          >
            {role === 'Todas' ? 'Todos os Docentes' : `Professores ${role}s`}
          </button>
        ))}
      </div>

      <TeacherProfiles filterRole={filterRole} />
    </div>
  );
}
