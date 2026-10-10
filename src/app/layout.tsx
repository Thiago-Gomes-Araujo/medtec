import type { Metadata } from 'next';
import { JetBrains_Mono, Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
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
    <html lang="pt-BR" className={`${manrope.variable} ${spaceGrotesk.variable} ${jetbrains.variable} scroll-smooth`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="site-mesh min-h-screen text-slate-800 font-sans antialiased selection:bg-cyan-400 selection:text-slate-950 flex flex-col">
        {children}
      </body>
    </html>
  );
}
