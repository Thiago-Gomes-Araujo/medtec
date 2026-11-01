'use client';

import Image from 'next/image';

export function CommunityDemoPhoto({ url, alt }: { url?: string; alt?: string }) {
  if (url !== '/hero.jpg') return null;
  return <Image unoptimized src="/hero.jpg" alt={alt || 'Imagem institucional de demonstração'} width={640} height={360} className="mb-4 w-full rounded-xl object-cover max-h-48" />;
}

export default function CommunityDemoMedia({ photo, materials = [], onChange }: {
  photo?: string;
  materials?: { titulo: string; url: string }[];
  onChange: (fields: { foto_url?: string; foto_alt?: string; materiais?: { titulo: string; url: string }[] }) => void;
}) {
  return (
    <fieldset className="space-y-3 text-sm">
      <legend className="font-semibold">Foto e materiais da prévia</legend>
      <label className="block">
        Imagem de demonstração
        <select aria-label="Imagem de demonstração" name="demo-photo" value={photo || ''} onChange={event => onChange({ foto_url: event.target.value, foto_alt: event.target.value ? 'Imagem institucional de demonstração; não retrata este perfil fictício.' : '' })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
          <option value="">Sem imagem</option>
          <option value="/hero.jpg">Imagem institucional existente (exemplo)</option>
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input name="demo-material" type="checkbox" checked={materials.length > 0} onChange={event => onChange({ materiais: event.target.checked ? [{ titulo: 'Material fictício — sem arquivo', url: '' }] : [] })} />
        Incluir material fictício na prévia
      </label>
      {materials.map((material, index) => <p key={index} className="text-slate-600 dark:text-slate-300">{material.titulo}</p>)}
      <button type="button" disabled title="Aguardando acervo oficial e armazenamento privado" className="rounded-xl border border-slate-300 px-3 py-2 text-slate-500 disabled:cursor-not-allowed">Selecionar foto e materiais oficiais — indisponível</button>
      <p className="text-xs text-slate-600 dark:text-slate-300">Somente a imagem institucional já pública e um material sem arquivo podem ser usados nesta demonstração. Uploads e documentos de autorização aguardam integração oficial.</p>
    </fieldset>
  );
}
