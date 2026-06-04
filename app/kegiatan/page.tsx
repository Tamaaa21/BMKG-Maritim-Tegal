"use client";

import Navbar from '@/components/Navbar';
import KegiatanSection from '@/components/KegiatanSection';
import Footer from '@/components/Footer';

export default function KegiatanPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-0">
        <KegiatanSection />
      </div>
      <Footer />
    </main>
  );
}
