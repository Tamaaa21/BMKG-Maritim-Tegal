"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseBrowser";
import { MessageSquare, FileText, ImageIcon } from "lucide-react";
import { useNotification } from "@/components/NotificationProvider";

export default function AdminDashboard() {
  const { showNotification } = useNotification();
  const [stats, setStats] = useState({
    bukuTamu: 0,
    layananBerbayar: 0,
    layananNolRupiah: 0,
  });

  useEffect(() => {
    const client = supabase;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const retryFetch = async (input: string, attempts = 3, delayMs = 500): Promise<Response> => {
      let lastErr: any;
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await fetch(input);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res;
        } catch (err) {
          lastErr = err;
          if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        }
      }
      throw lastErr;
    };
    if (!client) {
      // fallback to previous polling behaviour via APIs
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const retryFetch = async (input: string, attempts = 3, delayMs = 500): Promise<Response> => {
        let lastErr: any;
        for (let i = 0; i < attempts; i++) {
          try {
            const res = await fetch(input);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res;
          } catch (err) {
            lastErr = err;
            if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
          }
        }
        throw lastErr;
      };

      const fetchStatsFallback = async () => {
        try {
          const [bukuTamuRes, berbayarRes, nolRupiahRes] = await Promise.all([
            retryFetch(`${origin}/api/admin/stats/buku-tamu`),
            retryFetch(`${origin}/api/admin/stats/layanan-berbayar`),
            retryFetch(`${origin}/api/admin/stats/layanan-nol-rupiah`),
          ]);

          const bukuTamu = await bukuTamuRes.json();
          const berbayar = await berbayarRes.json();
          const nolRupiah = await nolRupiahRes.json();

          setStats({
            bukuTamu: bukuTamu.count || 0,
            layananBerbayar: berbayar.count || 0,
            layananNolRupiah: nolRupiah.count || 0,
          });
        } catch (error) {
          console.error("Error fetching stats fallback:", error);
        }
      };
      fetchStatsFallback();
      return;
    }

    // initial counts via APIs (safe, keeps logic centralized)
    let mounted = true;
    const fetchInitial = async () => {
      try {
        const [bukuTamuRes, berbayarRes, nolRupiahRes] = await Promise.all([
          retryFetch(`${origin}/api/admin/stats/buku-tamu`),
          retryFetch(`${origin}/api/admin/stats/layanan-berbayar`),
          retryFetch(`${origin}/api/admin/stats/layanan-nol-rupiah`),
        ]);

        const bukuTamu = await bukuTamuRes.json();
        const berbayar = await berbayarRes.json();
        const nolRupiah = await nolRupiahRes.json();

        if (!mounted) return;
        setStats({
          bukuTamu: bukuTamu.count || 0,
          layananBerbayar: berbayar.count || 0,
          layananNolRupiah: nolRupiah.count || 0,
        });
      } catch (error) {
        console.error("Error fetching initial stats:", error);
        showNotification("Gagal memuat data statistik", "error", 5000);
      }
    };
    fetchInitial();

    // subscribe to INSERT events for realtime updates
    const bukuSub = client
      .channel("public:buku_tamu")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "buku_tamu" },
        () => {
          setStats((s) => ({ ...s, bukuTamu: s.bukuTamu + 1 }));
          showNotification("Data Buku Tamu baru masuk", "success", 4000);
        }
      )
      .subscribe();

    const berbayarSub = client
      .channel("public:layanan_berbayar")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "layanan_berbayar" },
        () => {
          setStats((s) => ({ ...s, layananBerbayar: s.layananBerbayar + 1 }));
          showNotification("Layanan Berbayar baru masuk", "success", 4000);
        }
      )
      .subscribe();

    const nolSub = client
      .channel("public:layanan_nol_rupiah")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "layanan_nol_rupiah" },
        () => {
          setStats((s) => ({ ...s, layananNolRupiah: s.layananNolRupiah + 1 }));
          showNotification("Layanan Nol Rupiah baru masuk", "success", 4000);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      try {
        if (client) {
          client.removeChannel(bukuSub);
          client.removeChannel(berbayarSub);
          client.removeChannel(nolSub);
        }
      } catch (e) {
        // fallback unsubscribe
        try {
          bukuSub.unsubscribe();
        } catch {}
        try {
          berbayarSub.unsubscribe();
        } catch {}
        try {
          nolSub.unsubscribe();
        } catch {}
      }
    };
  }, [showNotification]);

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
        </div>
      </div>
    </div>
  );
}
