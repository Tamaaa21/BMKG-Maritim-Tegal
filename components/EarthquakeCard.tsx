"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Loader, 
  RefreshCw, 
  Calendar, 
  Clock, 
  Compass, 
  MapPin, 
  Activity, 
  ShieldCheck,
  Info
} from "lucide-react";

interface GempaData {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
  Dirasakan: string;
  Shakemap: string;
}

export default function EarthquakeCard() {
  const [gempa, setGempa] = useState<GempaData | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loadingGempa, setLoadingGempa] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchGempa = async () => {
    setLoadingGempa(true);
    setFetchError(null);
    setImgError(false);
    try {
      const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();
      const data: GempaData = json?.Infogempa?.gempa;
      if (!data) throw new Error("Data gempa terbaru tidak ditemukan.");
      setGempa(data);
    } catch (e: any) {
      setFetchError(e?.message || "Gagal memuat data dari server BMKG.");
    } finally {
      setLoadingGempa(false);
    }
  };

  useEffect(() => {
    fetchGempa();
    const iv = setInterval(fetchGempa, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const shakemapUrl = gempa?.Shakemap
    ? `https://data.bmkg.go.id/DataMKG/TEWS/${encodeURIComponent(gempa.Shakemap)}`
    : null;

  // Determine alert levels for tsunami warning
  const isTsunamiSafe = gempa?.Potensi?.toLowerCase().includes("tidak berpotensi");

  return (
    <section id="gempa" className="py-24 bg-gray-50 text-slate-800 relative overflow-hidden border-t border-b border-gray-100">
      {/* Decorative background grid and glowing circles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 border border-red-100 text-xs font-bold uppercase rounded-full tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              BMKG TEWS (Early Warning System)
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
              Informasi Gempabumi Terkini
            </h2>
            <p className="text-slate-500 mt-2.5 text-sm md:text-base max-w-2xl leading-relaxed">
              Monitoring seismik real-time gempabumi berkekuatan tinggi di seluruh wilayah Indonesia langsung dari stasiun geofisika nasional.
            </p>
          </div>

          <button
            onClick={fetchGempa}
            disabled={loadingGempa}
            className="self-start md:self-end flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-slate-700 hover:text-slate-900 font-semibold text-xs transition-all duration-300 disabled:opacity-50 active:scale-95 shadow-sm"
          >
            <RefreshCw size={13} className={loadingGempa ? "animate-spin" : ""} />
            <span>SINKRONISASI DATA</span>
          </button>
        </div>

        {/* Dashboard Box */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl">
          
          <AnimatePresence mode="wait">
            {loadingGempa && !gempa ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400"
              >
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold tracking-wider uppercase text-slate-500">Menghubungi Server BMKG...</span>
              </motion.div>
            ) : fetchError && !gempa ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 flex flex-col items-center justify-center gap-3 text-center px-4"
              >
                <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Gagal Sinkronisasi</h3>
                <p className="text-slate-500 text-sm max-w-sm leading-relaxed">{fetchError}</p>
                <button 
                  onClick={fetchGempa} 
                  className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition-colors uppercase tracking-wider"
                >
                  Coba Ulangi
                </button>
              </motion.div>
            ) : gempa ? (
              <motion.div 
                key="data"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col lg:flex-row items-stretch"
              >
                {/* Left Column: Shakemap Image */}
                {shakemapUrl && !imgError ? (
                  <div className="w-full lg:w-5/12 bg-gray-50 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-200 relative group overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md bg-white border border-gray-200 text-[10px] uppercase font-bold text-slate-600 tracking-wider shadow-sm">
                      Visualisasi Shakemap
                    </div>
                    <div className="w-full aspect-square relative rounded-2xl overflow-hidden bg-white flex items-center justify-center border border-gray-100 shadow-md">
                      <img
                        src={shakemapUrl}
                        alt="BMKG Shakemap"
                        className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImgError(true)}
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full lg:w-5/12 bg-gray-50 p-8 flex flex-col items-center justify-center text-slate-400 border-b lg:border-b-0 lg:border-r border-gray-200 min-h-[300px]">
                    <MapPin size={48} className="text-slate-300 mb-3" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Peta Shakemap Tidak Tersedia</span>
                  </div>
                )}

                {/* Right Column: Parameters detail panel */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-8 bg-white">
                  <div className="space-y-6">
                    {/* Magnitude & Depth Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-gray-200 hover:bg-gray-100/50 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                          <Activity size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kekuatan</p>
                          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 leading-none">{gempa.Magnitude} <span className="text-xs font-semibold text-orange-500">SR</span></p>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-gray-200 hover:bg-gray-100/50 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Compass size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kedalaman</p>
                          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 leading-none">{gempa.Kedalaman}</p>
                        </div>
                      </div>
                    </div>

                    {/* Wilayah / Lokasi */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:bg-gray-100/50 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pusat Gempa / Wilayah</p>
                          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">{gempa.Wilayah}</p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-150 pt-6">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Tanggal Kejadian</p>
                          <p className="text-slate-800 font-semibold mt-0.5">{gempa.Tanggal}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Clock size={16} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Waktu Kejadian</p>
                          <p className="text-slate-800 font-semibold mt-0.5">{gempa.Jam} WIB</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Compass size={16} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Titik Koordinat</p>
                          <p className="text-slate-800 font-semibold mt-0.5">{gempa.Lintang} — {gempa.Bujur}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Info size={16} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Parameter Sistem</p>
                          <p className="text-slate-800 font-semibold mt-0.5 font-mono">Auto-TEWS</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning Alerts / Tsunami Potency */}
                  <div className="space-y-4">
                    {gempa.Potensi && (
                      <div 
                        className={`flex items-center gap-4 p-4 rounded-2xl border ${
                          isTsunamiSafe 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                            : "bg-red-50 border-red-100 text-red-700 animate-pulse"
                        }`}
                      >
                        {isTsunamiSafe ? (
                          <ShieldCheck size={24} className="flex-shrink-0" />
                        ) : (
                          <AlertTriangle size={24} className="flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider opacity-85">Status Ancaman Tsunami</p>
                          <p className="text-sm font-bold mt-0.5 leading-snug">{gempa.Potensi}</p>
                        </div>
                      </div>
                    )}

                    {/* MMI shake info */}
                    {gempa.Dirasakan && (
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Skala Guncangan (Dirasakan / MMI)</p>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-1.5">{gempa.Dirasakan}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
