"use client";

import { useState, useEffect } from "react";
import { LogIn, Monitor, Globe, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LoginLog {
  id: string;
  user_id: string;
  username: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export default function LoginHistoryPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/login-logs");
      const json = await res.json();
      if (json?.success) {
        setLogs(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch login logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = logs.filter(log =>
    log.username.toLowerCase().includes(search.toLowerCase()) ||
    (log.ip_address || "").includes(search) ||
    (log.user_agent || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">History Login</h1>
        <p className="text-gray-500 mt-2">Pantau aktivitas masuk pengguna ke panel administrasi.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LogIn size={20} className="text-[#003399]" />
            Riwayat Masuk
            {!loading && (
              <span className="text-sm font-normal text-gray-400">({filtered.length} catatan)</span>
            )}
          </h2>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari username/IP..."
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-gray-50">
            <LogIn className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 text-sm">Belum ada riwayat login.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-semibold text-gray-500">Waktu</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500">User</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500">IP Address</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500 hidden md:table-cell">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-900 font-medium text-xs">
                          {new Date(log.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-gray-900">{log.username}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-gray-400" />
                        <span className="text-gray-600 text-xs font-mono">{log.ip_address}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Monitor size={14} className="text-gray-400" />
                        <span className="text-gray-500 text-xs truncate max-w-[250px] block" title={log.user_agent}>
                          {log.user_agent}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
