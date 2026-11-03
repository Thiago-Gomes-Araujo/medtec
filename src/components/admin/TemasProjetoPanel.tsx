'use client';

import { medtecApi } from '@/lib/api';
import CommunityTaxonomyManager from './CommunityTaxonomyManager';

export default function TemasProjetoPanel() {
  return <CommunityTaxonomyManager modulo="pj_temas" heading="Temas de projeto" singular="tema" plural="temas" masculine
    deleteHint="Tema com projetos não pode ser excluído; nesse caso, desative-o." service={medtecApi.temasProjeto} />;
}
