"use client";

import HeroBackgroundSlideshow from "./HeroBackgroundSlideshow";
import MaritimeWeatherCard from "./MaritimeWeatherCard";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col">
      <HeroBackgroundSlideshow />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#001a66]/90 via-[#003399]/75 to-[#003399]/50" />

      {/* Badge */}
      <div className="relative z-10 flex justify-center pt-24 px-6 md:px-16">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-xs">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Informasi Resmi BMKG
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center px-6 md:px-16 pb-8">
        <div className="w-full max-w-7xl mx-auto flex justify-center">
          {/* Centered Content */}
          <div className="text-white max-w-3xl text-center flex flex-col items-center justify-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
              Selamat Datang di <br /> Badan Meteorologi, Klimatologi, dan Geofisika<br />
              <span className="text-yellow-400">Stasiun Meteorologi Maritim Tegal</span>
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
              Menyediakan informasi cuaca maritim yang akurat, cepat, dan terpercaya untuk keselamatan pelayaran dan masyarakat.
            </p>
            <div className="flex flex-wrap justify-center gap-3 w-full">
              <a
                href="#prakiraan"
                className="px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
              >
                Lihat Prakiraan
              </a>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

