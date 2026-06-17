"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_BEFORE_MS = 60 * 1000;
const AUTH_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function useSessionTimeout() {
  const router = useRouter();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimer();

    idleTimerRef.current = setTimeout(async () => {
      const result = await Swal.fire({
        title: "Sesi Akan Berakhir",
        text: "Anda tidak melakukan aktivitas selama 15 menit. Sesi akan berakhir dalam 60 detik.",
        icon: "warning",
        timer: WARNING_BEFORE_MS,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "Saya masih di sini",
        confirmButtonColor: "#003399",
        showCancelButton: false,
        allowOutsideClick: false,
        willClose: () => {
          clearIdleTimer();
        },
      });

      if (result.dismiss === Swal.DismissReason.timer) {
        try {
          await fetch("/api/admin/logout", { method: "POST" });
        } catch {}
        router.push("/admin/login");
      } else {
        resetIdleTimer();
      }
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
  }, [clearIdleTimer, router]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    const handleActivity = () => resetIdleTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetIdleTimer();

    // Periodic auth check — detect server-side expiry
    authCheckRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) {
          await Swal.fire({
            title: "Sesi Berakhir",
            text: "Sesi Anda telah berakhir. Silakan login kembali.",
            icon: "info",
            confirmButtonText: "OK",
            confirmButtonColor: "#003399",
          });
          router.push("/admin/login");
        }
      } catch {}
    }, AUTH_CHECK_INTERVAL_MS);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearIdleTimer();
      if (authCheckRef.current) clearInterval(authCheckRef.current);
    };
  }, [resetIdleTimer, clearIdleTimer, router]);
}
