"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2, Loader, AlertTriangle, RefreshCw } from "lucide-react";
import MaritimeWeatherCard from "@/components/MaritimeWeatherCard";

export default function DisplayPage() {
  const [pamphletImages, setPamphletImages] = useState<string[]>([]);
  const [pamphletIndex, setPamphletIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchPamflets() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/pamflets");
        const j = await res.json();
        if (mounted && j?.success && Array.isArray(j.data)) {
          const urls = j.data.map((it: any) => it.url).filter(Boolean);
          setPamphletImages(urls);
          setPamphletIndex(0);
        }
      } catch (e) {
        console.error("Gagal memuat display:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPamflets();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isPlaying || !pamphletImages || pamphletImages.length <= 1) return;
    const t = setInterval(() => {
      setPamphletIndex((s) => (s + 1) % pamphletImages.length);
    }, 15000);
    return () => clearInterval(t);
  }, [pamphletImages, isPlaying]);

  const handlePrev = () => {
    if (pamphletImages.length === 0) return;
    setPamphletIndex((s) => (s - 1 + pamphletImages.length) % pamphletImages.length);
  };

  const handleNext = () => {
    if (pamphletImages.length === 0) return;
    setPamphletIndex((s) => (s + 1) % pamphletImages.length);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <main className="h-screen w-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      <Navbar minimal />

      {/* Content area — mt-16 clears fixed navbar, pt-2 adds small top breathing room */}
      <div className="h-[calc(100vh-64px)] mt-16 flex flex-col pt-2 pb-2 px-4 md:px-10 w-full max-w-[1600px] mx-auto overflow-hidden">

        {/* Main Grid Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden min-h-0">

          {/* ───── Left Column: Main Pamphlet Display ───── */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0">
            <div
              ref={containerRef}
              className={`relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl w-full flex-1 flex flex-col justify-center items-center group transition-all duration-300 ${isFullscreen ? "rounded-none border-none max-w-none w-screen h-screen aspect-auto" : ""
                }`}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader size={36} className="text-blue-500 animate-spin" />
                  <p className="text-gray-400 text-sm">Memuat display informasi...</p>
                </div>
              ) : pamphletImages.length > 0 ? (
                <>
                  {/* Slide image */}
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={pamphletImages[pamphletIndex]}
                      alt={`Display ${pamphletIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50 pointer-events-none" />

                  {/* Controls (visible on hover) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-4">
                      <button onClick={togglePlay} className="w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all" title={isPlaying ? "Jeda" : "Putar"}>
                        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                      </button>
                      <span className="text-xs text-gray-300 font-medium">
                        Slide {pamphletIndex + 1} / {pamphletImages.length}
                        {isPlaying && <span className="ml-2 text-blue-400 text-[10px] uppercase tracking-wider animate-pulse">(Auto)</span>}
                      </span>
                    </div>

                    <div className="hidden md:flex items-center gap-1.5">
                      {pamphletImages.map((_, idx) => (
                        <button key={idx} onClick={() => setPamphletIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${idx === pamphletIndex ? "bg-blue-500 w-5" : "bg-white/30 hover:bg-white/50 w-2"}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={handlePrev} className="w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all" title="Sebelumnya">
                        <ChevronLeft size={18} />
                      </button>
                      <button onClick={handleNext} className="w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all" title="Selanjutnya">
                        <ChevronRight size={18} />
                      </button>
                      <button onClick={toggleFullscreen} className="w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all ml-1" title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}>
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-white font-semibold">Tidak Ada Display</h3>
                  <p className="text-gray-500 text-sm mt-1">Belum ada pamflet atau display yang diunggah.</p>
                </div>
              )}
            </div>
            {pamphletImages.length > 1 && (
              <p className="text-gray-600 text-[10px] mt-1.5 italic text-center flex-shrink-0">
                * Arahkan kursor ke display untuk membuka kontrol navigasi & layar penuh.
              </p>
            )}
          </div>

          {/* ───── Right Column: Video + Earthquake ───── */}
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-4 h-full min-h-0">

            {/* Card 1 (top-right): Video Card */}
            <div className="flex flex-col gap-4 h-full min-h-0">
              <div className="shrink-0">
                <MaritimeWeatherCard />
              </div>

              <div className="flex-1 min-h-0">
                <EarthquakeCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ──────────────────────────────────────────────
   Earthquake Card — fetches latest quake data
   from BMKG public JSON API (no proxy needed,
   same-origin fetch is not used here as BMKG
   allows CORS on their public data endpoint).
   The shakemap image URL is constructed client-
   side and rendered with a sanitised <img> tag.
────────────────────────────────────────────── */
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

function EarthquakeCard() {
  const [gempa, setGempa] = useState<GempaData | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loadingGempa, setLoadingGempa] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchGempa = async () => {
    setLoadingGempa(true);
    setFetchError(null);
    setImgError(false);
    try {
      // BMKG public REST API — returns JSON with CORS headers allowed
      const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data: GempaData = json?.Infogempa?.gempa;
      if (!data) throw new Error("Data gempa tidak tersedia");
      setGempa(data);
    } catch (e: any) {
      setFetchError(e?.message || "Gagal memuat data gempa");
    } finally {
      setLoadingGempa(false);
    }
  };

  useEffect(() => {
    fetchGempa();
    // Refresh every 5 minutes
    const iv = setInterval(fetchGempa, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // Build the shakemap URL safely — only allow filenames from BMKG domain
  const shakemapUrl = gempa?.Shakemap
    ? `https://data.bmkg.go.id/DataMKG/TEWS/${encodeURIComponent(gempa.Shakemap)}`
    : null;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-orange-400" />
          <p className="text-white text-xs font-bold uppercase tracking-widest">Gempa Terkini</p>
        </div>
        <button
          onClick={fetchGempa}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          title="Refresh data gempa"
        >
          <RefreshCw size={12} className={loadingGempa ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {loadingGempa && !gempa ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader size={24} className="text-orange-400 animate-spin" />
          </div>
        ) : fetchError && !gempa ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4">
            <AlertTriangle size={24} className="text-red-400" />
            <p className="text-red-300 text-xs text-center">{fetchError}</p>
            <button onClick={fetchGempa} className="mt-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
              Coba Lagi
            </button>
          </div>
        ) : gempa ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Shakemap image */}
            {shakemapUrl && !imgError ? (
              <div className="w-2/5 flex-shrink-0 bg-gray-900/50 flex items-center justify-center p-1">
                <img
                  src={shakemapUrl}
                  alt="Peta Shakemap Gempa BMKG"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              </div>
            ) : null}

            {/* Info text */}
            <div className="flex-1 min-w-0 overflow-y-auto px-3 py-2 space-y-1.5 text-xs">
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Magnitudo</p>
                <p className="text-orange-400 text-lg font-extrabold leading-none">{gempa.Magnitude} SR</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Waktu</p>
                <p className="text-white font-medium">{gempa.Tanggal} — {gempa.Jam}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Kedalaman</p>
                <p className="text-white font-medium">{gempa.Kedalaman}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Wilayah</p>
                <p className="text-white font-medium leading-snug">{gempa.Wilayah}</p>
              </div>
              {gempa.Potensi && (
                <div className="pt-1 border-t border-white/10">
                  <p className="text-yellow-300 text-[10px] font-semibold leading-snug">{gempa.Potensi}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
