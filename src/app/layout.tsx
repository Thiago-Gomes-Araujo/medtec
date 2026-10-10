import type { Metadata } from 'next';
import { Manrope, Sora } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MEDTEC em Foco — Ensino Médio com Mediação Tecnológica de Rondônia',
  description: 'Histórias, escolas, dados e transparência do Ensino Médio com Mediação Tecnológica da SEDUC-RO. Lei Estadual nº 3.846/2016.',
  keywords: [
    'MEDTEC',
    'SEDUC Rondônia',
    'Mediação Tecnológica',
    'Governo de Rondônia',
    'Educação Básica',
    'Educação Rural',
    'Educação Ribeirinha',
    'Educação Indígena',
    'Transparência SEDUC'
  ],
  authors: [{ name: 'SEDUC - Secretaria de Estado da Educação de Rondônia' }],
  openGraph: {
    title: 'MEDTEC em Foco — Rondônia',
    description: 'A educação que chega a todos os cantos de Rondônia. Histórias, escolas e transparência oficial.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'MEDTEC em Foco · SEDUC-RO',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${sora.variable} scroll-smooth`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-[#2d46e5] selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
