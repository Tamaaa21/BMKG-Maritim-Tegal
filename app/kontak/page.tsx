"use client";

import Navbar from '@/components/Navbar';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function KontakPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-0">
        <ContactSection />
      </div>
      <Footer />
    </main>
  );
}
