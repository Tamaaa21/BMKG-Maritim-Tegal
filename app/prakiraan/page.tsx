"use client";

import Navbar from '@/components/Navbar';
import PrakiraanSection from '@/components/PrakiraanSection';
import Footer from '@/components/Footer';

export default function PrakiraanPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-0">
        <PrakiraanSection />
      </div>
      <Footer />
    </main>
  );
}
