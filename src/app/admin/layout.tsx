import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Painel Gestor | MEDTEC Rondônia - SEDUC-RO',
  description:
    'Painel administrativo restrito da Coordenadoria de Mídias Educacionais do Ensino Médio com Mediação Tecnológica (SEDUC-RO).',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div translate="no" className="notranslate w-full h-full">
      {children}
    </div>
  );
}
