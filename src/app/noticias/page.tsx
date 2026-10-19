import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import NewsEditorialSection from '@/components/NewsEditorialSection';
import { getDatabase } from '@/lib/db';
import initialData from '@/data/initialData.json';
import { NewsItem } from '@/types';

export default async function NoticiasPage() {
  const data = getDatabase();
  const newsList = (data.news && data.news.length > 0)
    ? data.news
    : (initialData.news as NewsItem[]);

  return (
    <div className="flex flex-col min-h-screen bg-[#040B16] text-[#E6F4FF]">
      <SiteHeader />

      <main className="flex-1">
        <NewsEditorialSection news={newsList} />
      </main>

      <SiteFooter />
    </div>
  );
}
