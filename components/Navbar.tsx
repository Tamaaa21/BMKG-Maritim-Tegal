"use client";

import { useState, useEffect } from "react";
import { Menu, X, Search, Globe } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Prakiraan", href: "#prakiraan" },
  { label: "Layanan", href: "#layanan" },
  { label: "Kegiatan", href: "#kegiatan" },
  { label: "Kontak", href: "#kontak" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("Home");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#003399] shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-white">
              <img src="https://www.bmkg.go.id/images/logo-bmkg.png" alt="BMKG" className="w-full h-full object-contain p-1" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">BMKG</p>
              <p className="text-blue-200 text-xs leading-tight">Stasiun Meteorologi Maritim Tegal</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActive(link.label)}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md relative group ${
                  active === link.label ? "text-white" : "text-blue-100 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-yellow-400 transition-all duration-200 ${
                    active === link.label ? "w-3/4" : "w-0 group-hover:w-3/4"
                  }`}
                />
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-blue-100 hover:text-white transition-colors">
              <Search size={18} />
            </button>
            <button className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs text-blue-100 hover:text-white border border-blue-300/40 rounded-full transition-colors">
              <Globe size={14} />
              ID
            </button>
            <button
              className="md:hidden p-2 text-blue-100 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#003399] border-t border-blue-700 px-4 py-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => { setActive(link.label); setMenuOpen(false); }}
              className="block px-3 py-2 text-sm text-blue-100 hover:text-white hover:bg-blue-800 rounded-md transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
