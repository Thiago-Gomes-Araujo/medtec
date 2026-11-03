'use client';

import { medtecApi } from '@/lib/api';
import CommunityTaxonomyManager from './CommunityTaxonomyManager';

export default function DisciplinasPanel() {
  return <CommunityTaxonomyManager modulo="p_disciplinas" heading="Disciplinas" singular="disciplina" plural="disciplinas"
    deleteHint="Disciplina ligada a professor não pode ser excluída; nesse caso, desative-a." service={medtecApi.disciplinasProfessor} />;
}
