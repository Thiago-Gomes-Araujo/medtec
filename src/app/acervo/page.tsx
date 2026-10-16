import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import GallerySection from '@/components/GallerySection';
import { getDatabase } from '@/lib/db';
import initialData from '@/data/initialData.json';
import { GalleryItem } from '@/types';

export default async function AcervoPage() {
  const db = getDatabase();
  const gallery = (db.gallery && db.gallery.length > 0) 
    ? db.gallery 
    : (initialData.gallery as GalleryItem[]);

  return (
    <div className="flex flex-col min-h-screen bg-[#040B16] text-[#E6F4FF]">
      <SiteHeader />

      <main className="flex-1">
        <GallerySection gallery={gallery} />
      </main>

      <SiteFooter />
    </div>
  );
}
