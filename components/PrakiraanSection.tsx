"use client";

import { ChevronRight, MapPin, Anchor, Waves, TrendingUp } from "lucide-react";
import { useState } from "react";
import PrakiraanModal from "./modals/PrakiraanModal";

const forecastCards = [
  {
    title: "Prakiraan Cuaca Kota",
    desc: "Prakiraan cuaca untuk wilayah kota di sekitar Tegal",
    image: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: MapPin,
    color: "from-blue-900/80",
  },
  {
    title: "Prakiraan Cuaca Pelabuhan",
    desc: "Informasi khusus untuk pelabuhan di Tegal",
    image: "https://images.pexels.com/photos/753331/pexels-photo-753331.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: Anchor,
    color: "from-teal-900/80",
  },
  {
    title: "Prakiraan Cuaca Maritim",
    desc: "Prakiraan cuaca maritim untuk keselamatan pelayaran",
    image: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: Waves,
    color: "from-cyan-900/80",
  },
  {
    title: "Informasi Pasang Surut / Wisata Bahari",
    desc: "Informasi pasang surut dan kondisi wisata bahari",
    image: "https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: TrendingUp,
    color: "from-sky-900/80",
  },
];

const mainForecast = {
  date: "Senin, 18 Mei 2024",
  location: "Perairan Tegal – Jawa Tengah",
  wave: "1.0 – 2.0 m",
  wind: "10 – 25 km/h",
  visibility: "> 5 km",
  condition: "Berawan – Hujan Ringan",
};

export default function PrakiraanSection() {
  const [selectedForecast, setSelectedForecast] = useState<typeof forecastCards[0] | null>(null);

  const forecastDetails = {
    "Prakiraan Cuaca Kota": [
      { label: "Suhu", value: "24-30°C" },
      { label: "Cuaca", value: "Berawan" },
      { label: "Kelembapan", value: "75%" },
      { label: "Angin", value: "15 km/h" },
    ],
    "Prakiraan Cuaca Pelabuhan": [
      { label: "Gelombang", value: "1-2 meter" },
      { label: "Arus", value: "0.5 knot" },
      { label: "Visibilitas", value: ">5 km" },
      { label: "Kondisi", value: "Layak Berlayar" },
    ],
    "Prakiraan Cuaca Maritim": [
      { label: "Gelombang", value: "1.5-2.5 m" },
      { label: "Periode", value: "6-8 detik" },
      { label: "Arah Angin", value: "Tenggara" },
      { label: "Kecepatan", value: "10-20 km/h" },
    ],
    "Informasi Pasang Surut / Wisata Bahari": [
      { label: "Kondisi Pasang", value: "Naik" },
      { label: "Jam Pasang", value: "19:00 WIB" },
      { label: "Tinggi Pasang", value: "0.8 m" },
      { label: "Kondisi Wisata", value: "Baik" },
    ],
  };

  return (
    <section id="prakiraan" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#003399] text-sm font-semibold uppercase tracking-widest">Cuaca & Maritim</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Informasi Prakiraan</h2>
          <p className="text-gray-500 mt-2">Pilih kategori informasi prakiraan yang Anda butuhkan</p>
        </div>

        {/* Main Forecast Card */}
        <div className="bg-gradient-to-r from-[#003399] to-[#0055cc] rounded-2xl p-6 md:p-8 mb-8 shadow-xl text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-blue-200 text-sm mb-1">{mainForecast.date}</p>
              <h3 className="text-xl font-bold mb-1">{mainForecast.location}</h3>
              <p className="text-blue-200 text-sm">Prakiraan Cuaca Maritim Terkini</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Gelombang", value: mainForecast.wave },
                { label: "Angin", value: mainForecast.wind },
                { label: "Jarak Pandang", value: mainForecast.visibility },
                { label: "Kondisi", value: mainForecast.condition },
              ].map((item) => (
                <div key={item.label} className="bg-white/15 rounded-xl px-4 py-3 text-center">
                  <p className="text-blue-200 text-xs mb-1">{item.label}</p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Forecast Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {forecastCards.map((card, i) => (
            <button
              key={i}
              onClick={() => setSelectedForecast(card)}
              className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer text-left"
              style={{ minHeight: "260px" }}
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent`} />
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                <div className="flex justify-end">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <card.icon size={18} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1 leading-tight">{card.title}</h3>
                  <p className="text-blue-100 text-xs mb-3 leading-relaxed">{card.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-white/90 group-hover:text-white font-semibold bg-white/20 group-hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
                    Lihat Selengkapnya <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm text-center sm:text-left">
            Informasi disediakan berdasarkan data terbaru dan diupdate setiap hari.
          </p>
          <button
            onClick={() => setSelectedForecast(forecastCards[0])}
            className="flex-shrink-0 px-5 py-2 bg-[#003399] hover:bg-[#0044cc] text-white text-sm font-semibold rounded-full transition-colors"
          >
            Pahami Lebih Lanjut
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedForecast && (
        <PrakiraanModal
          isOpen={!!selectedForecast}
          onClose={() => setSelectedForecast(null)}
          data={{
            title: selectedForecast.title,
            desc: selectedForecast.desc,
            image: selectedForecast.image,
            details: forecastDetails[selectedForecast.title as keyof typeof forecastDetails] || [],
            lastUpdated: "18 Mei 2024, 12:01 WIB",
          }}
        />
      )}
    </section>
  );
}
