"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn, User, Lock, Droplets, Wind } from "lucide-react";
import { Input } from '@/components/ui/input';
import DistortedCaptcha, { DistortedCaptchaRef } from "@/components/ui/DistortedCaptcha";

export default function AdminLoginPage() {
  const router = useRouter();
  const captchaRef = useRef<DistortedCaptchaRef>(null);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaValid) {
      setError("Captcha tidak valid. Silakan coba lagi.");
      captchaRef.current?.refresh();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        const text = await response.text();
        console.error("Failed to parse JSON from /api/admin/login:", parseErr, text);
        setError("Terjadi kesalahan pada respons server");
        return;
      }

      if (!response.ok) {
        setError(data?.message || "Login gagal");
        captchaRef.current?.refresh();
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan server");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#0a192f]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[100px] mix-blend-screen" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-indigo-500/20 blur-[80px] mix-blend-screen animate-bounce" style={{ animationDuration: '7s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-8 overflow-hidden">
          
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="text-center mb-8 relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <LogIn className="text-white drop-shadow-md" size={36} />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Panel</h1>
            <p className="text-blue-200 text-sm mt-2 font-medium flex items-center justify-center gap-1">
              <Droplets size={14} className="text-cyan-400" />
              BMKG Maritim Tegal
              <Wind size={14} className="text-cyan-400" />
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 backdrop-blur-sm rounded-xl p-3.5 flex gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-red-100 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-blue-100 pl-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-300 group-focus-within:text-cyan-400 transition-colors">
                  <User size={18} />
                </div>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-300/50 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 h-12 rounded-xl transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-blue-100 pl-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-300 group-focus-within:text-cyan-400 transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-300/50 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 h-12 rounded-xl transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Verifikasi Keamanan</p>
                <DistortedCaptcha 
                  ref={captchaRef} 
                  onValidateChange={setCaptchaValid} 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : "Masuk ke Sistem"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
