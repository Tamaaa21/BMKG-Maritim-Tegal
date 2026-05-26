"use client";

import { ChevronRight, CreditCard, Gift, Shield, Star } from "lucide-react";

const services = [
  {
    icon: CreditCard,
    title: "Layanan Berbayar",
    subtitle: "(PNBP)",
    desc: "Layanan informasi meteorologi, klimatologi, dan geofisika yang diberikan secara gratis untuk mendukung keselamatan yang membutuhkan biaya sesuai ketentuan.",
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
          {services.map((svc, i) => (
            <div
              key={i}
              className={`bg-white border ${svc.accent} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col`}
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
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-1 text-sm text-[#003399] font-semibold hover:gap-2 transition-all"
              >
                Selengkapnya <ChevronRight size={14} />
              </a>
            </div>
          ))}
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
          <a
            href="#"
            className="flex-shrink-0 px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white text-sm font-semibold rounded-full transition-colors"
          >
            Ajukan Layanan
          </a>
        </div>
      </div>
    </section>
  );
}
