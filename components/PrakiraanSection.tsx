"use client";

import { ChevronRight, MapPin, Anchor, Waves, TrendingUp, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import PrakiraanModal from "./modals/PrakiraanModal";

const defaultForecastCards = [
  {
    title: "Prakiraan Cuaca Kota",
    desc: "Prakiraan cuaca untuk wilayah kota di sekitar Tegal",
    image: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: MapPin,
    color: "from-blue-900/80",
    images: [{ url: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600", explanation: "Prakiraan cuaca untuk wilayah kota di sekitar Tegal" }],
    created_at: null,
    details: [],
  },
  {
    title: "Prakiraan Cuaca Pelabuhan",
    desc: "Informasi khusus untuk pelabuhan di Tegal",
    image: "https://images.pexels.com/photos/753331/pexels-photo-753331.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: Anchor,
    color: "from-teal-900/80",
    images: [{ url: "https://images.pexels.com/photos/753331/pexels-photo-753331.jpeg?auto=compress&cs=tinysrgb&w=600", explanation: "Informasi khusus untuk pelabuhan di Tegal" }],
    created_at: null,
    details: [],
  },
  {
    title: "Prakiraan Cuaca Maritim",
    desc: "Prakiraan cuaca maritim untuk keselamatan pelayaran",
    image: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: Waves,
    color: "from-cyan-900/80",
    images: [{ url: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=600", explanation: "Prakiraan cuaca maritim untuk keselamatan pelayaran" }],
    created_at: null,
    details: [],
  },
  {
    title: "Informasi Pasang Surut / Wisata Bahari",
    desc: "Informasi pasang surut dan kondisi wisata bahari",
    image: "https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=600",
    icon: TrendingUp,
    color: "from-sky-900/80",
    images: [{ url: "https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=600", explanation: "Informasi pasang surut dan kondisi wisata bahari" }],
    created_at: null,
    details: [],
  },
];

const getCardConfig = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("kota") || t.includes("wilayah") || t.includes("darat")) {
    return { icon: MapPin, color: "from-blue-900/80" };
  }
  if (t.includes("pelabuhan") || t.includes("pantai") || t.includes("dermaga") || t.includes("pelaut")) {
    return { icon: Anchor, color: "from-teal-900/80" };
  }
  if (t.includes("maritim") || t.includes("laut") || t.includes("gelombang") || t.includes("perairan")) {
    return { icon: Waves, color: "from-cyan-900/80" };
  }
  if (t.includes("pasang") || t.includes("surut") || t.includes("wisata") || t.includes("bahari")) {
    return { icon: TrendingUp, color: "from-sky-900/80" };
  }
  return { icon: Sun, color: "from-indigo-900/80" };
};

export default function PrakiraanSection({ limit }: { limit?: number }) {
  const [selectedForecast, setSelectedForecast] = useState<any>(null);
  const [forecastCards, setForecastCards] = useState<any[]>(defaultForecastCards);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchPrakiraan() {
      try {
        const res = await fetch("/api/admin/prakiraan-images?filterExpired=true");
        const json = await res.json();
        if (mounted && json?.success && Array.isArray(json.data)) {
          if (json.data.length > 0) {
            const mapped = json.data.map((it: any) => {
              const { icon, color } = getCardConfig(it.title);
              return {
                title: it.title,
                desc: it.explanation || "",
                image: it.url,
                icon: icon,
                color: color,
                images: [{ url: it.url, explanation: it.explanation || "" }],
                created_at: it.created_at || null,
                details: [],
              };
            });
            setForecastCards(mapped);
          } else {
            // If all cards in DB are expired/hidden, show empty state (no cards at all)
            setForecastCards([]);
          }
        }
      } catch (e) {
        console.error("Error fetching forecast:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPrakiraan();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="prakiraan" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Informasi Prakiraan</h2>
          <p className="text-gray-500 mt-2">Pilih kategori informasi prakiraan yang Anda butuhkan</p>
        </div>

        {/* 4-column Responsive Grid for Forecast Cards */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : forecastCards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
            <p className="text-gray-500 font-medium text-sm">Tidak ada informasi prakiraan cuaca aktif saat ini.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-stretch gap-6">
            {(limit ? forecastCards.slice(0, limit) : forecastCards).map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedForecast(card)}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#003399] transition-all duration-300 group flex flex-col text-left h-full"
                >
                  <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent opacity-65`} />
                    <div className="absolute top-4 left-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
                      <Icon size={18} />
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-gray-900 font-bold text-sm md:text-base mb-2 group-hover:text-[#003399] transition-colors leading-snug line-clamp-2">
                        {card.title}
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                        {card.desc ? card.desc.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : ""}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#003399] font-semibold">
                      <span>Lihat Detail</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selanjutnya */}
        {limit && (
          <div className="mt-10 text-center">
            <a
              href="/prakiraan"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white font-semibold text-sm rounded-full transition-all duration-200"
            >
              Selanjutnya <ChevronRight size={16} />
            </a>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedForecast && (
        <PrakiraanModal
          isOpen={!!selectedForecast}
          onClose={() => setSelectedForecast(null)}
          data={{
            title: selectedForecast.title,
            desc: "",
            image: selectedForecast.image,
            images: selectedForecast.images || [],
            details: selectedForecast.details || [],
            explanation: selectedForecast.desc || "",
            lastUpdated: selectedForecast.created_at
              ? new Date(selectedForecast.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) + " WIB"
              : "Default",
          }}
        />
      )}
    </section>
  );
}
