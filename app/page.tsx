"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import PrakiraanSection from "@/components/PrakiraanSection";
import LayananSection from "@/components/LayananSection";
import KegiatanSection from "@/components/KegiatanSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <PrakiraanSection />
      <LayananSection />
      <KegiatanSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
