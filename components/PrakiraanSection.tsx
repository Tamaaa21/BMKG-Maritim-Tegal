"use client";

import { ChevronRight, MapPin, Anchor, Waves, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import PrakiraanModal from "./modals/PrakiraanModal";

const defaultForecastCards = [
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
  const [selectedForecast, setSelectedForecast] = useState<typeof defaultForecastCards[0] | null>(null);
  const [forecastCards, setForecastCards] = useState(defaultForecastCards);

  useEffect(() => {
    let mounted = true;
    async function fetchPrakiraan() {
      try {
        const res = await fetch("/api/admin/prakiraan-images");
        const json = await res.json();
          if (mounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const items: any[] = json.data;
          // group items by category (title prefixed with category id)
          const byCategory: Record<number, any[]> = {};
          items.forEach((it) => {
            const m = String(it.title || '').match(/^(\d+)/);
            const key = m ? parseInt(m[1], 10) : null;
            if (key && !Number.isNaN(key)) {
              if (!byCategory[key]) byCategory[key] = [];
              byCategory[key].push(it);
            }
          });

          const updated = defaultForecastCards.map((card, idx) => {
            const cat = idx + 1;
            const entries = byCategory[cat] || [];
            return {
              ...card,
              // preserve single-image API (first entry) for backward compatibility
              image: entries[0]?.url || card.image,
              images: entries.map((e: any) => ({ url: e.url, explanation: e.explanation || '' })),
              desc: entries[0]?.explanation || card.desc || '',
              created_at: entries[0]?.created_at || entries[0]?.createdAt || null,
              details: entries[0]?.details || [],
            };
          });
          setForecastCards(updated);
        }
      } catch (e) {
        // ignore and keep defaults
      }
    }
    fetchPrakiraan();
    return () => { mounted = false };
  }, []);

  // Pamflet rotator (left card) — load from saved pamflets (no defaults)
  const [pamphletImages, setPamphletImages] = useState<string[]>([]);
  const [pamphletIndex, setPamphletIndex] = useState(0);
  useEffect(() => {
    let mounted = true;
    async function fetchPamflets() {
      try {
        const res = await fetch('/api/admin/pamflets');
        const j = await res.json();
        if (mounted && j?.success && Array.isArray(j.data)) {
          const urls = j.data.map((it: any) => it.url).filter(Boolean);
          setPamphletImages(urls);
          setPamphletIndex(0);
        }
      } catch (e) {
        // ignore
      }
    }
    fetchPamflets();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    if (!pamphletImages || pamphletImages.length === 0) return;
    const t = setInterval(() => setPamphletIndex((s) => (s + 1) % pamphletImages.length), 15000);
    return () => clearInterval(t);
  }, [pamphletImages]);

  // Forecast detail grid is provided by admin per-entry now.

  return (
    <section id="prakiraan" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Informasi Prakiraan</h2>
          <p className="text-gray-500 mt-2">Pilih kategori informasi prakiraan yang Anda butuhkan</p>
        </div>

        {/* Main Forecast Card */}
       

        {/* Main Feature & List Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pamflet rotator (Large Feature) */}
          <div className="lg:col-span-2">
            <div
              className="relative rounded-2xl overflow-hidden shadow-md transition-all duration-300 cursor-default w-full"
              style={{ aspectRatio: "16/12" }}
            >
              {pamphletImages && pamphletImages.length > 0 ? (
                <img
                  src={pamphletImages[pamphletIndex]}
                  alt={`Pamflet ${pamphletIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-gray-100" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div>
                  <h3 className="text-white font-bold text-2xl mb-2 leading-tight">Display Informasi Terbaru</h3>
                  <p className="text-blue-100 text-sm mb-4 leading-relaxed max-w-md">Kumpulan display dan pengumuman; berganti otomatis setiap 15 detik.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Side List (All Forecast Cards Vertical, includes Kota) */}
          <div className="flex flex-col gap-4">
            {forecastCards.map((card, i) => (
              <button
                key={i}
                onClick={() => setSelectedForecast(card)}
                className="flex gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#003399] hover:shadow-md transition-all group"
              >
                <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: "80px", height: "80px" }}>
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent opacity-60`} />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h4 className="text-gray-900 font-bold text-sm leading-tight mb-1 group-hover:text-[#003399] transition-colors line-clamp-2">
                      {card.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{card.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-[#003399] transition-colors self-end" />
                </div>
              </button>
            ))}
          </div>
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
            desc: '',
            image: selectedForecast.image,
            images: (selectedForecast as any).images || [],
            details: (selectedForecast as any).details || [],
            explanation: (selectedForecast as any).desc || '',
            lastUpdated: (selectedForecast as any).created_at || "18 Mei 2024, 12:01 WIB",
          }}
        />
      )}
    </section>
  );
}
