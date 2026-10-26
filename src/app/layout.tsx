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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medtec.seduc.ro.gov.br';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'MEDTEC: Ensino Médio com Mediação Tecnológica de Rondônia',
  description: 'Portal oficial do Ensino Médio com Mediação Tecnológica da SEDUC-RO. Lei Estadual nº 3.846/2016 e Portaria SEDUC nº 928/2025.',
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MEDTEC - Governo de Rondônia',
    description: 'Ensino Médio com Mediação Tecnológica na Rede Estadual de Rondônia. SEDUC-RO.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'MEDTEC - SEDUC-RO',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${manrope.variable} ${spaceGrotesk.variable} ${jetbrains.variable} scroll-smooth`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('medtec-theme');
                  var isDark = theme === 'dark';
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="site-mesh min-h-screen text-[#0B1B30] dark:text-[#E6F4FF] font-sans antialiased selection:bg-cyan-400 selection:text-slate-950 flex flex-col transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
