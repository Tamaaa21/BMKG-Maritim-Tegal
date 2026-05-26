"use client";

import { Play, Download, Share2, ChevronRight } from "lucide-react";

const publications = [
  {
    title: "Buletin Cuaca Maritim Mei 2024",
    date: "15 Mei 2024",
    type: "PDF",
    color: "bg-red-500",
  },
  {
    title: "Analisa Gelombang Mingguan",
    date: "12 Mei 2024",
    type: "PDF",
    color: "bg-red-500",
  },
  {
    title: "Informasi Pasang Surut Mei 2024",
    date: "10 Mei 2024",
    type: "PDF",
    color: "bg-red-500",
  },
  {
    title: "Prospek Cuaca Dasarian II Mei 2024",
    date: "8 Mei 2024",
    type: "PDF",
    color: "bg-red-500",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="mb-12">
          <span className="text-[#003399] text-sm font-semibold uppercase tracking-widest">Tentang Kami</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Tentang Kami</h2>
          <p className="text-gray-500 text-base mt-1">Stasiun Meteorologi Maritim Tegal</p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Text */}
          <div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Stasiun Meteorologi Maritim Tegal merupakan unit pelaksana teknis BMKG yang bertugas memberikan layanan informasi meteorologi, klimatologi, dan geofisika khususnya di wilayah maritim Tegal dan sekitarnya sejak tahun 2010.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Kami berkomitmen untuk menyediakan data dan informasi cuaca maritim yang akurat, cepat, dan terpercaya untuk mendukung keselamatan pelayaran, nelayan, dan masyarakat umum di wilayah perairan Tegal dan sekitarnya.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white text-sm font-semibold rounded-full transition-colors"
            >
              Selengkapnya <ChevronRight size={16} />
            </a>
          </div>

          {/* Right: Video Player */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
            <img
              src="https://images.pexels.com/photos/1098460/pexels-photo-1098460.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="BMKG Stasiun Meteorologi Maritim Tegal"
              className="w-full h-64 md:h-72 object-cover"
            />
            <div className="absolute inset-0 bg-[#003399]/50 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4">
                <Play className="text-[#003399] ml-1" size={28} fill="currentColor" />
              </div>
              <p className="text-white font-bold text-lg tracking-wide">PROFILE</p>
              <p className="text-white font-black text-xl tracking-widest text-center px-4">
                STASIUN METEOROLOGI<br />MARITIM TEGAL
              </p>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
              0:00 / 2:15
            </div>
          </div>
        </div>

        {/* Publications */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Publikasi Terbaru</h3>
            <a href="#" className="text-[#003399] text-sm font-semibold hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {publications.map((pub, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`${pub.color} rounded-lg p-2.5 flex-shrink-0`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" fill="none" stroke="white" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-800 text-xs font-semibold leading-tight mb-1 group-hover:text-[#003399] transition-colors">
                      {pub.title}
                    </p>
                    <p className="text-gray-400 text-xs">{pub.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button className="flex items-center gap-1 text-xs text-[#003399] hover:underline">
                    <Download size={12} /> Unduh
                  </button>
                  <span className="text-gray-200">|</span>
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#003399]">
                    <Share2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
