"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, ImageIcon, BarChart3, MessageSquare, FileText, LogOut, Menu, X } from "lucide-react";
import { NotificationProvider, useNotification } from "@/components/NotificationProvider";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero-manager", label: "Slider Home", icon: ImageIcon },
  { href: "/admin/publikasi-manager", label: "Publikasi / Buletin", icon: FileText },
  { href: "/admin/prakiraan-manager", label: "Prakiraan", icon: ImageIcon },
  { href: "/admin/kegiatan-manager", label: "Dokumentasi Kegiatan", icon: ImageIcon },
  { href: "/admin/buku-tamu", label: "Data Buku Tamu", icon: MessageSquare },
  { href: "/admin/layanan", label: "Data Layanan", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </NotificationProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("adminToken");
      // Debug: ensure we never stay loading indefinitely
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        // If we're already on the login page, don't push to avoid redirect loop
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      } else {
        setIsLoggedIn(true);
        setLoading(false);
      }
    } catch (err) {
      // If localStorage access fails for any reason, stop loading and redirect to login
      // eslint-disable-next-line no-console
      console.error("Error checking admin token:", err);
      setIsLoggedIn(false);
      setLoading(false);
      try {
        router.push("/admin/login");
      } catch (e) {
        // ignore
      }
    }
  }, [router, pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("adminToken");
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
        className={`fixed inset-y-0 left-0 z-40 w-64 sm:w-56 bg-[#003399] text-white transition-transform duration-300 lg:relative lg:translate-x-0 overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap sm:whitespace-normal ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                </a>
              );
            })}
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
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">Administrator</p>
              <p className="text-xs text-gray-500">Admin Access</p>
            </div>
            <div className="w-10 h-10 bg-[#003399] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              A
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
