"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Calendar } from "lucide-react";
import { kegiatanTabs } from "@/components/kegiatanCategories";

const activities = [
  {
    title: "Sosialisasi Info Cuaca Maritim",
    date: "12 Mei 2024",
    category: "Sosialisasi",
    image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Pengamatan Maritim di Perairan",
    date: "10 Mei 2024",
    category: "Pengamatan",
    image: "https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Kunjungan Tamu ke Stasiun",
    date: "8 Mei 2024",
    category: "Kunjungan",
    image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Pemeliharaan Alat Observasi",
    date: "8 Mei 2024",
    category: "Lainnya",
    image: "https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Pemasangan AWS di Perairan",
    date: "5 Mei 2024",
    category: "Lainnya",
    image: "https://images.pexels.com/photos/2422290/pexels-photo-2422290.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Pelatihan Internal Pegawai",
    date: "3 Mei 2024",
    category: "Lainnya",
    image: "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Sosialisasi ke Nelayan",
    date: "30 Apr 2024",
    category: "Sosialisasi",
    image: "https://images.pexels.com/photos/1007865/pexels-photo-1007865.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Pengamatan Pasang Surut",
    date: "28 Apr 2024",
    category: "Pengamatan",
    image: "https://images.pexels.com/photos/1430675/pexels-photo-1430675.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

export default function KegiatanSection() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [lightbox, setLightbox] = useState<null | any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/kegiatan-documents').then(r => r.json()).then((b) => {
      if (!mounted) return;
      if (b?.success) {
        const data = b.data.map((d: any) => ({
          title: d.title,
          date: d.event_date ? new Date(d.event_date).toLocaleDateString('id-ID') : (new Date(d.created_at).toLocaleDateString('id-ID')),
          category: d.category || 'Lainnya',
          image: d.url,
          description: d.description || '',
        }));
        setItems(data);
      } else {
        setItems(activities);
      }
    }).catch(() => setItems(activities));
    return () => { mounted = false };
  }, []);

  const filtered = activeCategory === 'Semua' ? items : items.filter(a => a.category === activeCategory);

  return (
    <section id="kegiatan" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[#003399] text-sm font-semibold uppercase tracking-widest">Dokumentasi</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Kegiatan Kami</h2>
          <p className="text-gray-500 mt-2">Dokumentasi kegiatan Stasiun Meteorologi Maritim Tegal</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {kegiatanTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-[#003399] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#003399] hover:text-[#003399]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ aspectRatio: "4/3" }}
              onClick={() => setLightbox(item)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs font-semibold leading-tight">{item.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar size={10} className="text-blue-300" />
                  <p className="text-blue-300 text-xs">{item.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white font-semibold text-sm rounded-full transition-all duration-200"
          >
            Lihat Semua Kegiatan <ChevronRight size={16} />
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X size={16} />
            </button>
            <img src={lightbox.image} alt={lightbox.title} className="w-full h-72 object-cover" />
            <div className="p-5">
              <p className="text-xs text-[#003399] font-semibold uppercase tracking-wide mb-1">{lightbox.category}</p>
              <h3 className="text-gray-900 font-bold text-lg">{lightbox.title}</h3>
              <div className="flex items-center gap-1 mt-2">
                <Calendar size={12} className="text-gray-400" />
                <p className="text-gray-500 text-sm">{lightbox.date}</p>
              </div>
              {lightbox.description ? (
                <p className="text-gray-700 text-sm mt-3">{lightbox.description}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
