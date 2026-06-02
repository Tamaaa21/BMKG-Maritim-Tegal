"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function WhatsAppFloating() {
  const pathname = usePathname();

  // hide floating WA on admin routes
  if (pathname && pathname.startsWith("/admin")) return null;

  const phone = "628112636067"; // Indonesian full international format without +
  const text = encodeURIComponent("Halo Stasiun Meteorologi Maritim Tegal, saya ingin bertanya tentang layanan.");
  const href = `https://wa.me/${phone}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      className="fixed right-4 bottom-4 md:right-8 md:bottom-8 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 md:px-5 py-3 md:py-3.5 rounded-full shadow-lg transition-transform transform hover:-translate-y-1"
    >
      {/* WhatsApp SVG */}
      <span className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-white/10 rounded-full">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          <path d="M20.52 3.48A11.94 11.94 0 0 0 12.02.5C6.05.5 1.06 5.5 1.06 11.5c0 2.03.53 4.02 1.54 5.76L.5 23.5l6.55-2.18A11.94 11.94 0 0 0 12.02 23.5c5.97 0 10.96-5 10.96-11.5 0-2.99-1.16-5.72-3.46-7.52zM12.02 21.5c-2.04 0-3.95-.61-5.57-1.66l-.4-.26-3.88 1.29 1.31-3.8-.27-.39A9.01 9.01 0 0 1 3.04 11.5c0-4.97 4.02-9 8.98-9 2.4 0 4.65.93 6.35 2.62 1.7 1.7 2.63 3.96 2.63 6.37 0 4.98-4.02 9-8.98 9z" />
          <path d="M15.55 14.02c-.31-.16-1.83-.9-2.12-1.01-.29-.11-.5-.16-.71.16-.21.31-.8 1.01-.98 1.22-.18.21-.36.24-.67.08-.31-.16-1.31-.48-2.5-1.54-.93-.83-1.56-1.86-1.74-2.17-.18-.31-.02-.48.14-.63.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.10-.21.05-.39-.03-.55-.08-.16-.71-1.71-.98-2.34-.26-.62-.52-.54-.71-.55-.18-.01-.39-.01-.6-.01-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.15.21 2.22 3.39 5.38 4.75 3.16 1.35 3.16.9 3.74.84.58-.06 1.83-.74 2.09-1.45.26-.71.26-1.32.18-1.45-.08-.13-.29-.21-.6-.37z" />
        </svg>
      </span>

      <span className="hidden md:inline-block">Chat WhatsApp</span>
    </a>
  );
}
