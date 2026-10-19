import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import FaqCentralSection from '@/components/FaqCentralSection';

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#040B16] text-[#0B1B30] dark:text-[#E6F4FF]">
      <SiteHeader />

      <main className="flex-1">
        <FaqCentralSection />
      </main>

      <SiteFooter />
    </div>
  );
}
