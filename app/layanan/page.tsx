"use client";

import Navbar from '@/components/Navbar';
import LayananSection from '@/components/LayananSection';
import Footer from '@/components/Footer';

export default function LayananPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-0">
        <LayananSection />
      </div>
      <Footer />
    </main>
  );
}
