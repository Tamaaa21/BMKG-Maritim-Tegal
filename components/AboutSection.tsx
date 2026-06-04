"use client";

import { Play, Download, Share2, ChevronRight, FileText } from "lucide-react";
import { useEffect, useState } from 'react';

type Pub = { 
  id: string; 
  title: string; 
  date?: string; 
  created_at?: string; 
  url: string; 
  cover_url?: string;
  description?: string; 
  uploader?: string 
};

export default function AboutSection({ showExtras = true }: { showExtras?: boolean }) {
  const [publications, setPublications] = useState<Pub[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/publications')
      .then((r) => r.json())
      .then((b) => {
        if (!mounted) return;
        if (b?.success && Array.isArray(b.data)) {
          const mapped = b.data.map((d: any) => ({ 
            id: d.id, 
            title: d.title || d.name || 'Publikasi', 
            date: d.created_at || d.date || '', 
            url: d.url, 
            cover_url: d.cover_url || '',
            description: d.description || '', 
            uploader: d.uploader || '' 
          }));
          setPublications(mapped);
        } else {
          setPublications([]);
        }
      })
      .catch(() => setPublications([]));
    return () => { mounted = false };
  }, []);
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
              <iframe
    className="w-full h-64 md:h-72 object-cover"
    src="https://www.youtube.com/embed/wBkyfeTdfVc"
    title="BMKG Stasiun Meteorologi Maritim Tegal"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  ></iframe>
          </div>
        </div>

        {/* Visi & Misi */}
        {showExtras && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">Visi</h4>
            <p className="text-gray-700">Menjadi penyedia informasi meteorologi maritim terpercaya yang mendukung keselamatan pelayaran dan kesejahteraan masyarakat pesisir di wilayah Tegal dan sekitarnya.</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">Misi</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Menyediakan informasi prakiraan cuaca dan peringatan dini yang akurat dan tepat waktu.</li>
              <li>Mengembangkan sistem observasi dan pemrosesan data untuk peningkatan kualitas layanan.</li>
              <li>Menyelenggarakan edukasi dan koordinasi kepada pemangku kepentingan terkait keselamatan maritim.</li>
              <li>Meningkatkan kapabilitas sumber daya manusia dan infrastruktur stasiun.</li>
            </ul>
          </div>
        </div>
        )}

        {/* Struktur Organisasi */}
        {showExtras && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Struktur Organisasi</h3>
          <p className="text-gray-500 text-sm mb-6">Susunan organisasi singkat Stasiun Meteorologi Maritim Tegal.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-lg mb-3">K</div>
              <p className="text-gray-900 font-semibold">Kepala Stasiun</p>
              <p className="text-gray-500 text-sm">Drs. Nama Kepala</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0ea5a6] text-white flex items-center justify-center font-bold text-lg mb-3">O</div>
              <p className="text-gray-900 font-semibold">Seksi Observasi</p>
              <p className="text-gray-500 text-sm">Kepala Seksi Observasi</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#f59e0b] text-white flex items-center justify-center font-bold text-lg mb-3">D</div>
              <p className="text-gray-900 font-semibold">Seksi Data & Informasi</p>
              <p className="text-gray-500 text-sm">Kepala Seksi Data</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#ef4444] text-white flex items-center justify-center font-bold text-lg mb-3">P</div>
              <p className="text-gray-900 font-semibold">Seksi Pelayanan</p>
              <p className="text-gray-500 text-sm">Kepala Seksi Pelayanan</p>
            </div>
          </div>
        </div>
        )}

        {/* Publications */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Publikasi Terbaru</h3>
            <a href="#" className="text-[#003399] text-sm font-semibold hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {publications.map((pub, i) => (
              <div
                key={pub.id || i}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Cover Container */}
                  <div className="h-48 w-full overflow-hidden bg-gray-50 relative flex items-center justify-center border-b border-gray-100">
                    {pub.cover_url ? (
                      <img
                        src={pub.cover_url}
                        alt={pub.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : pub.url.endsWith(".pdf") ? (
                      <div className="flex flex-col items-center gap-2 text-center p-6 select-none bg-gradient-to-br from-red-50/50 to-orange-50/30 w-full h-full justify-center">
                        <FileText size={48} className="text-red-500 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-[10px] font-bold text-red-600 bg-red-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">PDF Dokumen</span>
                      </div>
                    ) : (
                      <img
                        src={pub.url}
                        alt={pub.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div>
                      <h4 className="text-gray-900 font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#003399] transition-colors">
                        {pub.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {pub.date ? new Date(pub.date).toLocaleDateString("id-ID", { dateStyle: "long" }) : ""}
                      </p>
                    </div>
                    {pub.description && (
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mt-1.5">
                        {pub.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 pt-0">
                  <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#003399] font-bold hover:text-blue-800 transition-colors"
                    >
                      <Download size={14} /> Unduh File
                    </a>
                    <button 
                      className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: pub.title, url: pub.url }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(window.location.origin + pub.url);
                          alert("Link publikasi berhasil disalin ke clipboard!");
                        }
                      }}
                      title="Bagikan"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
