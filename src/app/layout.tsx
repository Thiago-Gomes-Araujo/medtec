import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MEDTEC - Ensino Médio com Mediação Tecnológica | SEDUC Rondônia',
  description: 'Portal Institucional do Ensino Médio com Mediação Tecnológica do Estado de Rondônia. Notícias, avisos, galeria e inovação na educação pública.',
  keywords: [
    'MEDTEC',
    'SEDUC Rondônia',
    'Governo de Rondônia',
    'Mediação Tecnológica',
    'Ensino Médio Rondônia',
    'Educação Rural',
    'Educação Indígena',
    'Educação Ribeirinha'
  ],
  authors: [{ name: 'SEDUC - Secretaria de Estado da Educação de Rondônia' }],
  openGraph: {
    title: 'MEDTEC - Ensino Médio com Mediação Tecnológica | SEDUC Rondônia',
    description: 'Conectando Saberes e Transformando Vidas no Campo, nas Águas e nas Florestas de Rondônia.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Governo do Estado de Rondônia - SEDUC',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
