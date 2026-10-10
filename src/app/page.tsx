import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Announcements from '@/components/Announcements';
import AboutSection from '@/components/AboutSection';
import Methodology from '@/components/Methodology';
import NewsSection from '@/components/NewsSection';
import GallerySection from '@/components/GallerySection';
import SocialSection from '@/components/SocialSection';
import StudentTeacherPortals from '@/components/StudentTeacherPortals';
import Footer from '@/components/Footer';
import { getDatabase } from '@/lib/db';

export default function Home() {
  const data = getDatabase();

  return (
    <div className="flex flex-col min-h-screen">
      <Header socials={data.socials} />
      
      <main className="flex-1">
        <Hero siteInfo={data.siteInfo} stats={data.stats} />
        <Announcements announcements={data.announcements} />
        <AboutSection siteInfo={data.siteInfo} />
        <Methodology />
        <NewsSection news={data.news} />
        <GallerySection gallery={data.gallery} />
        <SocialSection socials={data.socials} />
        <StudentTeacherPortals />
      </main>

      <Footer socials={data.socials} siteInfo={data.siteInfo} />
    </div>
  );
}
