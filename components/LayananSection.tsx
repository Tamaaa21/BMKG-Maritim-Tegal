"use client";

import { ChevronRight, CreditCard, Gift, Shield, Star } from "lucide-react";
import { useState } from "react";
import BukuTamuModal from "./modals/BukuTamuModal";
import LayananBerbayarModal from "./modals/LayananBerbayarModal";
import LayananNolRupiahModal from "./modals/LayananNolRupiahModal";

const services = [
  {
    icon: CreditCard,
    title: "Layanan Berbayar",
    subtitle: "(PNBP)",
    desc: "Layanan informasi meteorologi, klimatologi, dan geofisika yang diberikan untuk mendukung keselamatan yang membutuhkan biaya sesuai ketentuan.",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accent: "border-emerald-200",
  },
  {
    icon: Gift,
    title: "Layanan Nol Rupiah",
    subtitle: "",
    desc: "Layanan informasi yang diberikan secara gratis untuk mendukung keselamatan masyarakat.",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accent: "border-blue-200",
  },
  {
    icon: Shield,
    title: "SPAK",
    subtitle: "(Sarana Prasarana & Alat)",
    desc: "Layanan pemeriksaan dan kalibrasi peralatan meteorologi sesuai standar yang berlaku.",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accent: "border-orange-200",
  },
  {
    icon: Star,
    title: "IKM",
    subtitle: "(Indeks Kepuasan Masyarakat)",
    desc: "Berikan penilaian Anda terhadap layanan kami untuk terus meningkatkan kualitas.",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    accent: "border-yellow-200",
  },
];

export default function LayananSection() {
  const [bukuTamuOpen, setBukuTamuOpen] = useState(false);
  const [layananBerbayarOpen, setLayananBerbayarOpen] = useState(false);
  const [layananNolRupiahOpen, setLayananNolRupiahOpen] = useState(false);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {services.map((svc, i) => {
            let onCardClick = () => {};
            if (i === 0) onCardClick = () => setLayananBerbayarOpen(true);
            else if (i === 1) onCardClick = () => setLayananNolRupiahOpen(true);

            return (
              <button
                key={i}
                onClick={onCardClick}
                className={`bg-white border ${svc.accent} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col text-left`}
              >
                <div className={`w-14 h-14 ${svc.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <svc.icon size={26} className={svc.iconColor} />
                </div>
                <h3 className="text-gray-900 font-bold text-base mb-0.5">{svc.title}</h3>
                {svc.subtitle && (
                  <p className="text-gray-500 text-xs mb-3">{svc.subtitle}</p>
                )}
                {!svc.subtitle && <div className="mb-3" />}
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{svc.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-[#003399] font-semibold group-hover:gap-2 transition-all">
                  Klik Di Sini <ChevronRight size={14} />
                </span>
              </button>
            );
          })}
        </div>

        {/* Buku Tamu Card */}
        <div className="mb-8">
          <button
            onClick={() => setBukuTamuOpen(true)}
            className="w-full bg-gradient-to-r from-[#003399] to-[#0055cc] hover:from-[#0044cc] hover:to-[#0066dd] text-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Buku Tamu</h3>
                <p className="text-blue-100 text-sm">Daftar sebagai tamu dan kunjungi kami</p>
              </div>
              <ChevronRight size={20} className="flex-shrink-0" />
            </div>
          </button>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003399]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-[#003399]" />
            </div>
            <p className="text-gray-600 text-sm">
              Untuk permohonan layanan dapat dilakukan secara online.
            </p>
          </div>
          <button
            onClick={() => setLayananBerbayarOpen(true)}
            className="flex-shrink-0 px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white text-sm font-semibold rounded-full transition-colors"
          >
            Ajukan Layanan
          </button>
        </div>
      </div>

      {/* Modals */}
      <BukuTamuModal isOpen={bukuTamuOpen} onClose={() => setBukuTamuOpen(false)} />
      <LayananBerbayarModal isOpen={layananBerbayarOpen} onClose={() => setLayananBerbayarOpen(false)} />
      <LayananNolRupiahModal isOpen={layananNolRupiahOpen} onClose={() => setLayananNolRupiahOpen(false)} />
    </section>
  );
}
