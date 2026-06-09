"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, ImageIcon, BarChart3, MessageSquare, FileText, LogOut, Menu, X, Bell, Trash2, Settings, Users, LogIn, Shield } from "lucide-react";
import { NotificationProvider, useNotification } from "@/components/NotificationProvider";
import { AdminRealtimeProvider } from "@/components/AdminRealtimeProvider";
import supabase from "@/lib/supabaseBrowser";

interface UserInfo {
  username: string;
  role: string;
  nama: string;
  id: string;
}

function decodeUserFromToken(): UserInfo | null {
  try {
    const token = sessionStorage.getItem("adminToken");
    if (!token) return null;
    const decoded = atob(token);
    // Format: username:id:timestamp
    const parts = decoded.split(":");
    if (parts.length >= 2) {
      const stored = sessionStorage.getItem("adminUser");
      if (stored) return JSON.parse(stored);
    }
    return null;
  } catch {
    return null;
  }
}

const contentNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero-manager", label: "Slider Home", icon: ImageIcon },
  { href: "/admin/publikasi-manager", label: "Publikasi / Buletin", icon: FileText },
  { href: "/admin/prakiraan-manager", label: "Prakiraan", icon: ImageIcon },
  { href: "/admin/display-manager", label: "Kelola Display", icon: ImageIcon },
  { href: "/admin/kegiatan-manager", label: "Dokumentasi Kegiatan", icon: ImageIcon },
  { href: "/admin/buku-tamu", label: "Data Buku Tamu", icon: MessageSquare },
  { href: "/admin/layanan", label: "Kelola Layanan", icon: FileText },
  { href: "/admin/login-history", label: "History Login", icon: LogIn },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

const adminNavItems = [
  { href: "/admin/users", label: "Manajemen Karyawan", icon: Users },
];

const ADMIN_ONLY_PATHS = [
  "/admin/users",
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AdminRealtimeProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminRealtimeProvider>
    </NotificationProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const { notifications, removeNotification, showNotification } = useNotification();
  const [notifOpen, setNotifOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const userInitial = user?.nama?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "A";

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const subs: any[] = [];

    const subscribeTo = (table: string, message: string) => {
      try {
        // use a distinct channel name for global admin notifications
        // to avoid adding callbacks to an already-subscribed channel
        const ch = client
          .channel(`global-notif:${table}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table },
            (payload: any) => {
              showNotification(message, "success", 5000);
            }
          )
          .subscribe();
        subs.push(ch);
      } catch (e) {
        // ignore subscribe errors
      }
    };

    subscribeTo("buku_tamu", "Data Buku Tamu baru masuk");
    subscribeTo("layanan_berbayar", "Layanan Berbayar baru masuk");
    subscribeTo("layanan_nol_rupiah", "Layanan Nol Rupiah baru masuk");
    subscribeTo("kegiatan_documents", "Dokumentasi kegiatan baru masuk");

    return () => {
      try {
        subs.forEach((ch) => client.removeChannel(ch));
      } catch (e) {
        try {
          subs.forEach((ch) => ch.unsubscribe && ch.unsubscribe());
        } catch (err) {
          // ignore
        }
      }
    };
  }, [showNotification]);

  useEffect(() => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const storedUser = sessionStorage.getItem("adminUser");
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      } else {
        let userData: UserInfo | null = null;
        if (storedUser) {
          try { userData = JSON.parse(storedUser); setUser(userData); } catch {}
        }
        setIsLoggedIn(true);
        setLoading(false);

        // Redirect karyawan trying to access admin-only pages
        if (userData) {
          const isUserAdmin = userData.role === "admin" || userData.role === "super_admin";
          if (!isUserAdmin && ADMIN_ONLY_PATHS.includes(pathname)) {
            router.push("/admin/dashboard");
          }
        }
      }
    } catch (err) {
      console.error("Error checking admin token:", err);
      setIsLoggedIn(false);
      setLoading(false);
      try { router.push("/admin/login"); } catch (e) { /* ignore */ }
    }
  }, [router, pathname]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminUser");
    } catch (e) {
      // ignore
    }
    setIsLoggedIn(false);
    setLoading(false);
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Allow the login page to render even when not logged in
    if (pathname === "/admin/login") {
      return <>{children}</>;
    }
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 sm:w-56 bg-[#003399] text-white transition-transform duration-300 lg:relative lg:translate-x-0 overflow-hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-blue-700 flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-bold">BMKG Admin</h1>
            <p className="text-blue-200 text-xs mt-1">Tegal Maritim</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 sm:space-y-2">
            <div className="pb-1">
              <p className="px-3 text-[10px] font-bold text-blue-200 uppercase tracking-wider">Konten</p>
            </div>
            {contentNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap sm:whitespace-normal ${isActive
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10"
                    }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                </a>
              );
            })}
            {isAdmin && (
              <>
                <div className="pt-3 pb-1">
                  <p className="px-3 text-[10px] font-bold text-blue-200 uppercase tracking-wider">Administrasi</p>
                </div>
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap sm:whitespace-normal ${isActive
                        ? "bg-white/20 text-white"
                        : "text-blue-100 hover:bg-white/10"
                        }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                    </a>
                  );
                })}
              </>
            )}
          </nav>

          {/* Logout */}
          <div className="p-2 sm:p-4 border-t border-blue-700 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              {/* <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Notifikasi"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button> */}

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Notifikasi</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { notifications.forEach(n => removeNotification(n.id)); }}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Bersihkan semua"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button onClick={() => setNotifOpen(false)} className="text-xs text-gray-500">Tutup</button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">Tidak ada notifikasi</div>
                    ) : (
                      notifications.slice().reverse().map(n => (
                        <div key={n.id} className="p-3 border-b border-gray-100 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">!
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                            <div className="text-xs text-gray-500 mt-1">{n.type}</div>
                          </div>
                          <button onClick={() => removeNotification(n.id)} className="text-gray-400 hover:text-gray-600">
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.nama || user?.username || "Administrator"}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role === "super_admin" ? "Super Admin" : user?.role || "Admin Access"}</p>
            </div>
            <div className="w-10 h-10 bg-[#003399] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 md:p-6">{children}</div>
        </main>
      </div>

      {/* Close sidebar when clicking outside on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
