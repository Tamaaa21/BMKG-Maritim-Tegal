"use client";

import { MessageSquare, FileText, ImageIcon, Users, LogIn } from "lucide-react";
import { useAdminRealtime } from "@/components/AdminRealtimeProvider";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { stats } = useAdminRealtime();
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/stats/users")
      .then(r => r.json())
      .then(d => { if (typeof d.count === "number") setUserCount(d.count); })
      .catch(() => {});
  }, []);

  const cards = [
    {
      title: "Buku Tamu",
      value: stats.bukuTamu,
      icon: MessageSquare,
      color: "bg-blue-100",
      textColor: "text-blue-600",
      href: "/admin/buku-tamu",
    },
    {
      title: "Layanan Berbayar",
      value: stats.layananBerbayar,
      icon: FileText,
      color: "bg-green-100",
      textColor: "text-green-600",
      href: "/admin/layanan?tab=berbayar",
    },
    {
      title: "Layanan Nol Rupiah",
      value: stats.layananNolRupiah,
      icon: FileText,
      color: "bg-purple-100",
      textColor: "text-purple-600",
      href: "/admin/layanan?tab=nol-rupiah",
    },
    {
      title: "Karyawan Aktif",
      value: userCount,
      icon: Users,
      color: "bg-orange-100",
      textColor: "text-orange-600",
      href: "/admin/users",
    },
    {
      title: "History Login",
      value: "Lihat",
      icon: LogIn,
      color: "bg-teal-100",
      textColor: "text-teal-600",
      href: "/admin/login-history",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">Selamat datang di panel administrasi BMKG Tegal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#003399]/20 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex-1">
                  <p className="text-gray-500 text-xs md:text-sm font-medium">{card.title}</p>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-1 md:mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-2 md:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <Icon size={20} className={`${card.textColor} md:w-6 md:h-6`} />
                </div>
              </div>
              <p className="text-[#003399] text-xs md:text-sm font-semibold group-hover:gap-1 flex items-center gap-0 transition-all">
                Lihat Detail →
              </p>
            </a>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
          <a
            href="/admin/hero-manager"
            className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border border-gray-200 rounded-lg hover:border-[#003399] hover:bg-blue-50 transition-all group"
          >
            <ImageIcon size={18} className="text-[#003399] group-hover:scale-110 transition-transform flex-shrink-0 md:w-5 md:h-5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm md:text-base truncate">Kelola Slider Home</p>
              <p className="text-gray-500 text-xs">Ubah gambar latar hero section</p>
            </div>
          </a>
          <a
            href="/admin/prakiraan-manager"
            className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border border-gray-200 rounded-lg hover:border-[#003399] hover:bg-blue-50 transition-all group"
          >
            <ImageIcon size={18} className="text-[#003399] group-hover:scale-110 transition-transform flex-shrink-0 md:w-5 md:h-5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm md:text-base truncate">Kelola Prakiraan</p>
              <p className="text-gray-500 text-xs">Ubah gambar utama prakiraan</p>
            </div>
          </a>
          <a
            href="/admin/users"
            className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border border-gray-200 rounded-lg hover:border-[#003399] hover:bg-blue-50 transition-all group"
          >
            <Users size={18} className="text-[#003399] group-hover:scale-110 transition-transform flex-shrink-0 md:w-5 md:h-5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm md:text-base truncate">Manajemen Karyawan</p>
              <p className="text-gray-500 text-xs">Atur hak akses pengguna</p>
            </div>
          </a>
          <a
            href="/admin/login-history"
            className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border border-gray-200 rounded-lg hover:border-[#003399] hover:bg-blue-50 transition-all group"
          >
            <LogIn size={18} className="text-[#003399] group-hover:scale-110 transition-transform flex-shrink-0 md:w-5 md:h-5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm md:text-base truncate">History Login</p>
              <p className="text-gray-500 text-xs">Pantau aktivitas login</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
