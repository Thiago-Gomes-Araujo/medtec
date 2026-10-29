import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import FloatingSocialRotator from '@/components/FloatingSocialRotator';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700', '800'],
});

const interDisplay = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
  weight: ['600', '700', '800'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medtec.seduc.ro.gov.br';

export const instant = false;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MEDTEC Rondônia | Ensino Médio com Mediação Tecnológica - SEDUC-RO',
    template: '%s | MEDTEC Rondônia - SEDUC-RO',
  },
  description:
    'Portal oficial do Ensino Médio com Mediação Tecnológica da Secretaria de Estado da Educação de Rondônia (SEDUC-RO). Aulas ao vivo via satélite, projetos pedagógicos, mural de avisos e escolas atendidas nos 52 municípios.',
  keywords: [
    'MEDTEC',
    'SEDUC Rondônia',
    'Mediação Tecnológica',
    'Governo de Rondônia',
    'Educação Básica',
    'Educação Rural',
    'Educação Ribeirinha',
    'Educação Indígena',
    'Transparência SEDUC',
  ],
  authors: [{ name: 'SEDUC - Secretaria de Estado da Educação de Rondônia' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MEDTEC Rondônia | Ensino Médio com Mediação Tecnológica - SEDUC-RO',
    description:
      'Portal oficial do Ensino Médio com Mediação Tecnológica da Secretaria de Estado da Educação de Rondônia (SEDUC-RO). Aulas ao vivo via satélite, projetos pedagógicos, mural de avisos e escolas atendidas nos 52 municípios.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'MEDTEC - SEDUC-RO',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MEDTEC Rondônia | Ensino Médio com Mediação Tecnológica - SEDUC-RO',
    description:
      'Portal oficial do Ensino Médio com Mediação Tecnológica da Secretaria de Estado da Educação de Rondônia (SEDUC-RO).',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${interDisplay.variable} ${jetbrains.variable} scroll-smooth overflow-x-hidden max-w-[100vw]`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
      <body className="bg-[#F8FAFC] dark:bg-[#0B1528] min-h-screen text-[#0F172A] dark:text-[#F8FAFC] font-sans antialiased selection:bg-[#004A99] selection:text-white dark:selection:bg-[#38BDF8] dark:selection:text-slate-900 flex flex-col transition-colors duration-200 overflow-x-hidden max-w-[100vw]">
        {children}
        <FloatingSocialRotator />
      </body>
    </html>
  );
}
