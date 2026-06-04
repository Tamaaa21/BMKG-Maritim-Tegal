"use client";

import { ChevronRight, CreditCard, Gift, Shield, Star, Info, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LayananCard {
  id: string;
  nama_layanan: string;
  deskripsi: string;
  url_google_form: string | null;
}

const icons = [CreditCard, Gift, Shield, Star];
const bgColors = ["bg-emerald-100", "bg-blue-100", "bg-orange-100", "bg-yellow-100"];
const iconColors = ["text-emerald-600", "text-blue-600", "text-orange-600", "text-yellow-600"];
const borderColors = ["border-emerald-200", "border-blue-200", "border-orange-200", "border-yellow-200"];

export default function LayananSection({ limit }: { limit?: number }) {
  const [services, setServices] = useState<LayananCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/admin/layanan-cards");
        const json = await res.json();
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setServices(json.data);
        } else {
          // If empty or success is false, use fallback empty state or default
          setServices([]);
        }
      } catch (e) {
        console.error("Gagal mengambil data layanan:", e);
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const handleCardClick = (url: string | null) => {
    if (url && url.trim() !== "") {
      window.open(url, "_blank");
    } else {
      setAlertOpen(true);
    }
  };

  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#003399] text-sm font-semibold uppercase tracking-widest">Pelayanan</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Layanan Kami</h2>
          <p className="text-gray-500 mt-2">Pilih jenis layanan yang Anda butuhkan</p>
        </div>

        {/* Service Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
                <div className="h-5 bg-gray-200 rounded w-2/3 my-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-10">
            <Info size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">Belum ada kartu layanan yang terdaftar.</p>
            <p className="text-gray-400 text-sm mt-1">Admin dapat menambahkan layanan di Panel Admin.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-stretch gap-6 mb-10">
            {(limit ? services.slice(0, limit) : services).map((svc, i) => {
              const iconIdx = i % 4;
              const IconComponent = icons[iconIdx];
              const iconBg = bgColors[iconIdx];
              const iconColor = iconColors[iconIdx];
              const accent = borderColors[iconIdx];

              return (
                <button
                  key={svc.id}
                  onClick={() => handleCardClick(svc.url_google_form)}
                  className={`w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white border ${accent} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col text-left h-full`}
                >
                  <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <IconComponent size={26} className={iconColor} />
                  </div>
                  <h3 className="text-gray-900 font-bold text-base mb-2 group-hover:text-[#003399] transition-colors leading-snug">
                    {svc.nama_layanan}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">
                    {svc.deskripsi}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-[#003399] font-semibold group-hover:gap-2 transition-all">
                    Kunjungi Layanan <ChevronRight size={14} />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selanjutnya */}
        {limit && (
          <div className="mb-10 text-center">
            <a
              href="/layanan"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white font-semibold text-sm rounded-full transition-all duration-200"
            >
              Selanjutnya <ChevronRight size={16} />
            </a>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003399]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-[#003399]" />
            </div>
            <p className="text-gray-600 text-sm">
              Untuk permohonan layanan dapat dilakukan secara online melalui tautan yang disediakan.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Pop-up Modal */}
      <AnimatePresence>
        {alertOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setAlertOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setAlertOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 bg-blue-50 text-[#003399] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                <Info size={32} />
              </div>

              {/* Title & Message */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">Halaman Belum Diperbarui</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Mohon maaf, halaman layanan ini belum diperbarui oleh admin.
              </p>

              {/* Action Button */}
              <button
                onClick={() => setAlertOpen(false)}
                className="w-full py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
              >
                Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
