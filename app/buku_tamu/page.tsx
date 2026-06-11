"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Camera, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";

interface BukuTamuFormData {
  nama: string;
  email: string;
  instansi: string;
  keperluan: string;
  noTelepon: string;
}

export default function BukuTamuPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BukuTamuFormData>();
  const [submitted, setSubmitted] = useState(false);
  const [fotoData, setFotoData] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setShowCamera(true);

      await new Promise(r => setTimeout(r, 100));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const onLoadedMetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Play error:", err);
              setCameraError("Tidak dapat memutar video kamera");
            });
          }
        };

        videoRef.current.addEventListener("loadedmetadata", onLoadedMetadata);

        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState < 2) {
            videoRef.current.play().catch(err => console.error("Fallback play error:", err));
          }
        }, 500);
      }
    } catch (error) {
      setShowCamera(false);
      setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        context.scale(-1, 1);
        context.drawImage(videoRef.current, -videoRef.current.videoWidth, 0);

        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.85);
        setFotoData(imageData);
        stopCamera();
      }
    }
  };

  const retakeFoto = () => {
    setFotoData(null);
    startCamera();
  };

  const removeFoto = () => {
    setFotoData(null);
  };

  const onSubmit = async (data: BukuTamuFormData) => {
    if (!fotoData) {
      alert("Foto wajib diambil!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/submit/buku-tamu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: data.nama,
          email: data.email,
          no_telepon: data.noTelepon,
          instansi: data.instansi || null,
          keperluan: data.keperluan,
          foto_data: fotoData,
        }),
      });

      if (!response.ok) throw new Error("Gagal mengirim data");

      setSubmitted(true);
      reset();
      setFotoData(null);
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim data buku tamu. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar minimal />

      <div className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-8xl w-full max-h-[1000px]">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-[#003399] text-xs md:text-sm font-semibold uppercase tracking-widest">Buku Tamu Digital</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Buku Tamu Kunjungan</h1>
            <p className="text-gray-500 text-sm mt-2">Silakan isi formulir di bawah ini saat melakukan kunjungan ke Stasiun Meteorologi Maritim Tegal.</p>
          </div>

          {/* Form Card */}
          <div className="w-full bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden">            <div className="bg-gradient-to-r from-[#003399] to-[#0055cc] text-white px-6 py-5">
            <h2 className="text-lg font-bold">Formulir Buku Tamu</h2>
            <p className="text-blue-100 text-xs mt-1">Data Anda tersimpan dengan aman di sistem kami.</p>
          </div>

            {!submitted ? (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Kolom Kiri: Input Form */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Nama */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          {...register("nama", { required: "Nama lengkap wajib diisi" })}
                          placeholder="Masukkan nama lengkap Anda"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm transition-all"
                        />
                        {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          {...register("email", {
                            required: "Email wajib diisi",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Format email tidak valid"
                            }
                          })}
                          placeholder="nama@email.com"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm transition-all"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>

                      {/* No. Telepon */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon/WhatsApp <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          {...register("noTelepon", { required: "Nomor telepon wajib diisi" })}
                          placeholder="Contoh: 081234567890"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm transition-all"
                        />
                        {errors.noTelepon && <p className="text-red-500 text-xs mt-1">{errors.noTelepon.message}</p>}
                      </div>

                      {/* Instansi */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Instansi / Organisasi / Sekolah</label>
                        <input
                          type="text"
                          {...register("instansi")}
                          placeholder="Nama instansi (opsional)"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Keperluan */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Keperluan Kunjungan <span className="text-red-500">*</span></label>
                      <textarea
                        {...register("keperluan", { required: "Jelaskan tujuan atau keperluan kunjungan Anda" })}
                        placeholder="Contoh: Koordinasi data maritim, kunjungan sekolah, studi banding, dll."
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm resize-none transition-all"
                      />
                      {errors.keperluan && <p className="text-red-500 text-xs mt-1">{errors.keperluan.message}</p>}
                    </div>
                  </div>

                  {/* Kolom Kanan: Kamera / Capture Foto */}
                  <div className="pt-0 lg:pl-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Foto Kunjungan / Identitas <span className="text-red-500">*</span></label>

                    {showCamera ? (
                      <div className="space-y-4">
                        <div className="relative w-full bg-black rounded-2xl overflow-hidden aspect-video border border-gray-800 max-w-md mx-auto">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            disablePictureInPicture
                            className="absolute inset-0 w-full h-full bg-black object-cover"
                            style={{ transform: "scaleX(-1)" }}
                          />
                        </div>
                        {cameraError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
                            <p className="text-xs text-red-600 text-center">{cameraError}</p>
                          </div>
                        )}
                        <div className="flex gap-3 max-w-md mx-auto">
                          <button
                            type="button"
                            onClick={captureFoto}
                            className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-md"
                          >
                            <Camera size={16} />
                            Ambil Foto
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : fotoData ? (
                      <div className="space-y-4">
                        <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-video border border-gray-200 max-w-md mx-auto">
                          <img
                            src={fotoData}
                            alt="Foto kunjungan"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex gap-3 max-w-md mx-auto">
                          <button
                            type="button"
                            onClick={retakeFoto}
                            className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-md"
                          >
                            <Camera size={16} />
                            Foto Ulang
                          </button>
                          <button
                            type="button"
                            onClick={removeFoto}
                            className="flex-1 px-5 py-2.5 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <Trash2 size={16} />
                            Hapus Foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-md mx-auto">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="w-full px-5 py-6 border-2 border-dashed border-[#003399]/40 bg-blue-50/50 hover:bg-blue-50 hover:border-[#003399] text-[#003399] font-bold rounded-2xl transition-all text-sm flex flex-col items-center justify-center gap-2 cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-[#003399]/10 rounded-full flex items-center justify-center mb-1">
                            <Camera size={20} />
                          </div>
                          Buka Kamera & Ambil Foto
                        </button>
                        <p className="text-gray-400 text-[10px] text-center mt-2">
                          * Izin kamera diperlukan untuk validasi foto tamu.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading || !fotoData}
                    className="w-full py-3 bg-[#003399] hover:bg-[#0044cc] text-white font-bold rounded-xl transition-all text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? "Mengirim..." : "Kirim Buku Tamu"}
                    {!loading && <ChevronRight size={16} />}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={44} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Buku Tamu Terkirim!</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-sm">
                  Terima kasih telah mengisi buku tamu kunjungan Stasiun Meteorologi Maritim Tegal.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-all"
                >
                  Isi Kembali
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
