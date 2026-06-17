"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import supabase from "@/lib/supabaseBrowser";
import { toast } from "sonner";

interface Stats {
  bukuTamu: number;
  layananBerbayar: number;
  layananNolRupiah: number;
}

interface AdminRealtimeContextType {
  stats: Stats;
  unreadBukuTamu: number;
  resetUnreadBukuTamu: () => void;
}

const DEFAULT_STATS: Stats = { bukuTamu: 0, layananBerbayar: 0, layananNolRupiah: 0 };

const AdminRealtimeContext = createContext<AdminRealtimeContextType | undefined>(undefined);

export function AdminRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [unreadBukuTamu, setUnreadBukuTamu] = useState(0);

  const resetUnreadBukuTamu = useCallback(() => setUnreadBukuTamu(0), []);

  const onNewBukuTamu = useCallback(() => {
    setStats(s => ({ ...s, bukuTamu: s.bukuTamu + 1 }));
    setUnreadBukuTamu(u => u + 1);
    toast.success("Buku Tamu Baru", {
      description: "Ada pengunjung baru yang mengisi buku tamu.",
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    const client = supabase;
    let previousBukuCount = 0;
    let pollingTimer: ReturnType<typeof setInterval> | null = null;

    const fetchInitial = async () => {
      try {
        const paths = [
          "/api/admin/stats/buku-tamu",
          "/api/admin/stats/layanan-berbayar",
          "/api/admin/stats/layanan-nol-rupiah",
        ];

        const [bukuRes, berbayarRes, nolRes] = await Promise.all(paths.map(p => fetch(p)));

        if (!bukuRes.ok || !berbayarRes.ok || !nolRes.ok) {
          console.warn("Failed to fetch admin stats:", {
            buku: bukuRes.status,
            berbayar: berbayarRes.status,
            nol: nolRes.status,
          });
        }

        const buku = await bukuRes.json().catch(() => ({ count: 0 }));
        const berbayar = await berbayarRes.json().catch(() => ({ count: 0 }));
        const nol = await nolRes.json().catch(() => ({ count: 0 }));

        const bukuCount = typeof buku.count === "number" ? buku.count : 0;
        previousBukuCount = bukuCount;

        setStats({
          bukuTamu: bukuCount,
          layananBerbayar: typeof berbayar.count === "number" ? berbayar.count : 0,
          layananNolRupiah: typeof nol.count === "number" ? nol.count : 0,
        });
      } catch (e) {
        console.error("Error fetching initial admin stats:", e);
      }
    };

    fetchInitial();

    // Polling fallback — check every 30s for new buku_tamu entries
    pollingTimer = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/stats/buku-tamu");
        const json = await res.json();
        const currentCount = typeof json.count === "number" ? json.count : previousBukuCount;
        if (currentCount > previousBukuCount) {
          const diff = currentCount - previousBukuCount;
          for (let i = 0; i < diff; i++) {
            onNewBukuTamu();
          }
        }
        previousBukuCount = currentCount;
      } catch {
        // ignore polling errors
      }
    }, 30000);

    // Supabase Realtime subscriptions
    if (!client) return () => { if (pollingTimer) clearInterval(pollingTimer); };

    const subs: any[] = [];
    const subscribeTo = (table: string, updater?: () => void) => {
      try {
        const ch = client
          .channel(`global-realtime:${table}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table }, () => {
            if (updater) updater();
          })
          .subscribe();
        subs.push(ch);
      } catch (e) {
        // ignore
      }
    };

    subscribeTo("buku_tamu", onNewBukuTamu);
    subscribeTo("layanan_berbayar", () => setStats(s => ({ ...s, layananBerbayar: s.layananBerbayar + 1 })));
    subscribeTo("layanan_nol_rupiah", () => setStats(s => ({ ...s, layananNolRupiah: s.layananNolRupiah + 1 })));

    return () => {
      if (pollingTimer) clearInterval(pollingTimer);
      try {
        subs.forEach(ch => client.removeChannel(ch));
      } catch (e) {
        try { subs.forEach(ch => ch.unsubscribe && ch.unsubscribe()); } catch {}
      }
    };
  }, [onNewBukuTamu]);

  return (
    <AdminRealtimeContext.Provider value={{ stats, unreadBukuTamu, resetUnreadBukuTamu }}>
      {children}
    </AdminRealtimeContext.Provider>
  );
}

export function useAdminRealtime() {
  const ctx = useContext(AdminRealtimeContext);
  if (!ctx) throw new Error("useAdminRealtime must be used within AdminRealtimeProvider");
  return ctx;
}
