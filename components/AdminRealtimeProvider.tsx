"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabaseBrowser";
import { useNotification } from "@/components/NotificationProvider";

interface Stats {
  bukuTamu: number;
}

const DEFAULT_STATS: Stats = { bukuTamu: 0 };

const AdminRealtimeContext = createContext<{ stats: Stats } | undefined>(undefined);

export function AdminRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const { showNotification } = useNotification();

  useEffect(() => {
    const client = supabase;
    const fetchInitial = async () => {
      try {
        const res = await fetch("/api/admin/stats/buku-tamu");
        const buku = await res.json().catch(() => ({ count: 0 }));
        setStats({
          bukuTamu: typeof buku.count === "number" ? buku.count : 0,
        });
      } catch (e) {
        console.error("Error fetching initial admin stats:", e);
      }
    };

    fetchInitial();

    if (!client) return;

    const subs: any[] = [];

    const subscribeTo = (table: string, message: string, updater?: () => void) => {
      try {
        const ch = client
          .channel(`global-realtime:${table}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table }, () => {
            if (updater) updater();
            showNotification(message, "success", 4000);
          })
          .subscribe();
        subs.push(ch);
      } catch (e) {
        // ignore
      }
    };

    subscribeTo("buku_tamu", "Data Buku Tamu baru masuk", () => setStats(s => ({ ...s, bukuTamu: s.bukuTamu + 1 })));

    return () => {
      try {
        subs.forEach(ch => client.removeChannel(ch));
      } catch (e) {
        try { subs.forEach(ch => ch.unsubscribe && ch.unsubscribe()); } catch {}
      }
    };
  }, [showNotification]);

  return <AdminRealtimeContext.Provider value={{ stats }}>{children}</AdminRealtimeContext.Provider>;
}

export function useAdminRealtime() {
  const ctx = useContext(AdminRealtimeContext);
  if (!ctx) throw new Error("useAdminRealtime must be used within AdminRealtimeProvider");
  return ctx;
}
