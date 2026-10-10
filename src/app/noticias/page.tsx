import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsSection from '@/components/NewsSection';
import { getDatabase } from '@/lib/db';
import Link from 'next/link';
import { ChevronRight, Newspaper } from 'lucide-react';

export default function NoticiasPage() {
  const data = getDatabase();

  return (
    <div className="flex flex-col min-h-screen">
      <Header socials={data.socials} />

      {/* Breadcrumb / Topo */}
      <div className="bg-slate-100 py-6 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-emerald-700">Início</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-bold">Todas as Notícias</span>
        </div>
      </div>

      <main className="flex-1 py-10">
        <NewsSection news={data.news} />
      </main>

      <Footer socials={data.socials} siteInfo={data.siteInfo} />
    </div>
  );
}
