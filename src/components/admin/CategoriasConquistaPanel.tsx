'use client';

import { medtecApi } from '@/lib/api';
import CommunityTaxonomyManager from './CommunityTaxonomyManager';

export default function CategoriasConquistaPanel() {
  return <CommunityTaxonomyManager modulo="c_categorias_conquista_aluno" heading="Categorias de conquista" singular="categoria" plural="categorias"
    deleteHint="Categoria com conquistas não pode ser excluída; nesse caso, desative-a." service={medtecApi.categoriasConquista} />;
}
