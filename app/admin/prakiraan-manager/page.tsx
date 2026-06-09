"use client";

import { useState, useEffect } from "react";
import { Upload, X, Edit3, Trash2, Check, Plus, Calendar, Clock, AlertCircle, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface PrakiraanItem {
  id: string;
  title: string;
  url: string;
  explanation: string;
  waktu_mulai?: string;
  waktu_berakhir?: string;
  created_at?: string;
  uploader?: string;
  next_url?: string;
  next_explanation?: string;
  next_waktu_mulai?: string;
  next_waktu_berakhir?: string;
  display_type?: string;
  gallery_images?: string[];
}

function getUserRole(): string {
  try {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("adminUser") : null;
    if (stored) return JSON.parse(stored).role || "";
  } catch {}
  return "";
}

const isAdmin = () => {
  const role = getUserRole();
  return role === "admin" || role === "super_admin";
};

const formatToDateOnly = (isoString?: string) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  } catch (e) {
    return "";
  }
};

// Convert a YYYY-MM-DD string to end-of-day ISO string (23:59:59)
const dateToEndOfDayISO = (dateStr: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr + "T23:59:59");
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
};

// Convert a YYYY-MM-DD string to start-of-day ISO string (00:00:00)
const dateToStartOfDayISO = (dateStr: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
};


export default function PrakiraanManager() {
  const [items, setItems] = useState<PrakiraanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNextSection, setShowNextSection] = useState(false);

  // Modal Editor States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingEntry, setEditingEntry] = useState<{
    id?: string;
    title: string;
    url: string;
    explanation: string;
    waktu_mulai?: string;
    waktu_berakhir?: string;
    file?: File;
    next_url?: string;
    next_explanation?: string;
    next_waktu_mulai?: string;
    next_waktu_berakhir?: string;
    nextFile?: File;
    display_type?: string;
    gallery_images?: string[];
    galleryFiles?: File[];
  } | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/prakiraan-images");
      const b = await res.json();
      if (b?.success) {
        setItems(b.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch prakiraan items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setShowNextSection(false);
    setEditingEntry({
      title: "",
      url: "",
      explanation: "",
      waktu_mulai: "",
      waktu_berakhir: "",
      next_url: "",
      next_explanation: "",
      next_waktu_mulai: "",
      next_waktu_berakhir: "",
      display_type: "gambar_saja",
      gallery_images: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PrakiraanItem) => {
    setModalMode("edit");
    const hasNext = !!item.next_url;
    setShowNextSection(hasNext);
    setEditingEntry({
      id: item.id,
      title: item.title,
      url: item.url,
      explanation: item.explanation || "",
      waktu_mulai: item.waktu_mulai ? formatToDateOnly(item.waktu_mulai) : "",
      waktu_berakhir: item.waktu_berakhir ? formatToDateOnly(item.waktu_berakhir) : "",
      next_url: item.next_url || "",
      next_explanation: item.next_explanation || "",
      next_waktu_mulai: item.next_waktu_mulai ? formatToDateOnly(item.next_waktu_mulai) : "",
      next_waktu_berakhir: item.next_waktu_berakhir ? formatToDateOnly(item.next_waktu_berakhir) : "",
      display_type: item.display_type || "gambar_saja",
      gallery_images: item.gallery_images || [],
    });
    setIsModalOpen(true);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kartu prakiraan ini?")) return;
    try {
      const res = await fetch(`/api/admin/prakiraan-images/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Gagal menghapus kartu");
      }
    } catch (e) {
      console.error("deleteEntry error", e);
    }
  };

  const handleModalSave = async () => {
    if (!editingEntry) return;
    if (!editingEntry.title.trim()) {
      alert("Judul kartu harus diisi");
      return;
    }
    if (modalMode === "add" && !editingEntry.file) {
      alert("Silakan pilih/unggah gambar kartu terlebih dahulu");
      return;
    }

    setSaving(true);
    try {
      let username = "admin";
      try {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("adminToken") : null;
        if (token) {
          username = atob(token).split(":")[0] || "admin";
        }
      } catch (e) { }

      if (modalMode === "add" && editingEntry.file) {
        // Upload new file and create card
        const form = new FormData();
        form.append("file", editingEntry.file);
        form.append("title", editingEntry.title);
        form.append("explanation", editingEntry.explanation);
        form.append("uploader", username);
        form.append("display_type", editingEntry.display_type || "gambar_saja");
        if (editingEntry.waktu_berakhir) {
          form.append("waktu_berakhir", dateToEndOfDayISO(editingEntry.waktu_berakhir) || "");
        }
        if (editingEntry.waktu_mulai) {
          form.append("waktu_mulai", dateToStartOfDayISO(editingEntry.waktu_mulai) || "");
        }
        if (editingEntry.nextFile) {
          form.append("nextFile", editingEntry.nextFile);
        }
        if (editingEntry.next_explanation) {
          form.append("next_explanation", editingEntry.next_explanation);
        }
        if (editingEntry.next_waktu_mulai) {
          form.append("next_waktu_mulai", dateToStartOfDayISO(editingEntry.next_waktu_mulai) || "");
        }
        if (editingEntry.next_waktu_berakhir) {
          form.append("next_waktu_berakhir", dateToEndOfDayISO(editingEntry.next_waktu_berakhir) || "");
        }

        const res = await fetch("/api/admin/prakiraan-images", {
          method: "POST",
          body: form,
        });
        const body = await res.json();
        if (body?.success) {
          alert("Berhasil menambahkan kartu prakiraan baru");
          fetchItems();
          setIsModalOpen(false);
          setEditingEntry(null);
        } else {
          alert("Gagal menambahkan kartu: " + (body?.message || "Error"));
        }
      } else if (modalMode === "edit" && editingEntry.id) {
        let finalUrl = editingEntry.url;
        let finalNextUrl = editingEntry.next_url;

        // Helper to upload a file and get its URL
        const uploadTempImage = async (file: File): Promise<string> => {
          const form = new FormData();
          form.append("file", file);
          form.append("title", editingEntry.title + " (temp)");
          const uploadRes = await fetch("/api/admin/prakiraan-images", {
            method: "POST",
            body: form,
          });
          const uploadBody = await uploadRes.json();
          if (uploadBody?.success && uploadBody.data?.url) {
            // Clean up the temporary row created by upload
            await fetch(`/api/admin/prakiraan-images/${uploadBody.data.id}`, { method: "DELETE" });
            return uploadBody.data.url;
          }
          throw new Error("Gagal mengunggah gambar");
        };

        // If a new current file was chosen during edit, upload it first
        if (editingEntry.file) {
          finalUrl = await uploadTempImage(editingEntry.file);
        }

        // If a new next file was chosen during edit, upload it first
        if (editingEntry.nextFile) {
          finalNextUrl = await uploadTempImage(editingEntry.nextFile);
        }

        // Build patch payload
        const patchPayload: any = {
          title: editingEntry.title,
          url: finalUrl,
          explanation: editingEntry.explanation,
          waktu_mulai: editingEntry.waktu_mulai ? dateToStartOfDayISO(editingEntry.waktu_mulai) : null,
          waktu_berakhir: editingEntry.waktu_berakhir ? dateToEndOfDayISO(editingEntry.waktu_berakhir) : null,
          display_type: editingEntry.display_type || "gambar_saja",
          uploader: username,
        };
        if (finalNextUrl !== undefined) {
          patchPayload.next_url = finalNextUrl;
        }
        if (editingEntry.next_explanation !== undefined) {
          patchPayload.next_explanation = editingEntry.next_explanation;
        }
        if (editingEntry.next_waktu_mulai) {
          patchPayload.next_waktu_mulai = dateToStartOfDayISO(editingEntry.next_waktu_mulai);
        } else {
          patchPayload.next_waktu_mulai = null;
        }
        if (editingEntry.next_waktu_berakhir) {
          patchPayload.next_waktu_berakhir = dateToEndOfDayISO(editingEntry.next_waktu_berakhir);
        } else {
          patchPayload.next_waktu_berakhir = null;
        }

        // Update existing entry
        const res = await fetch(`/api/admin/prakiraan-images/${editingEntry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchPayload),
        });
        const body = await res.json();
        if (body?.success) {
          alert("Berhasil memperbarui kartu prakiraan");
          fetchItems();
          setIsModalOpen(false);
          setEditingEntry(null);
        } else {
          alert("Gagal memperbarui kartu: " + (body?.message || "Error"));
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Prakiraan</h1>
          <p className="text-gray-500 mt-2">Atur kartu prakiraan cuaca dinamis yang tampil di halaman depan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#003399] hover:bg-[#0044cc] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={18} /> Tambah Kartu Baru
        </button>
      </div>

      {/* Cards List Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Daftar Kartu Prakiraan Cuaca</h2>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-gray-50">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 text-sm">Belum ada kartu prakiraan cuaca yang ditambahkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const now = new Date();
              const isExpired = item.waktu_berakhir && new Date(item.waktu_berakhir) < now;
              const isScheduled = item.waktu_mulai && new Date(item.waktu_mulai) > now;
              const isActive = !isExpired && !isScheduled;

              // Calculate days until scheduled
              const daysUntilStart = isScheduled && item.waktu_mulai
                ? Math.ceil((new Date(item.waktu_mulai).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : null;

              // Calculate days until expiry
              const daysUntilExpiry = !isExpired && item.waktu_berakhir
                ? Math.ceil((new Date(item.waktu_berakhir).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group ${
                    isScheduled ? "border-amber-200 ring-1 ring-amber-100" :
                    isExpired ? "border-red-200 opacity-75" :
                    "border-gray-200"
                  }`}
                >
                  {/* Gambar Preview — lebih tinggi & informatif */}
                  <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                    <img
                      src={item.url}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isExpired ? "grayscale" : ""}`}
                      alt={item.title}
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {isExpired && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                          Kadaluwarsa
                        </span>
                      )}
                      {isScheduled && !isExpired && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                          Terjadwal
                        </span>
                      )}
                      {isActive && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                          Aktif
                        </span>
                      )}
                    </div>

                    {/* Countdown badge for scheduled */}
                    {isScheduled && daysUntilStart !== null && (
                      <div className="absolute top-3 right-3 bg-amber-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                        {daysUntilStart === 0 ? "Mulai Hari Ini" : `${daysUntilStart}h lagi`}
                      </div>
                    )}

                    {/* Display Type Badge */}
                    {item.display_type && item.display_type !== "gambar_saja" && (
                      <div className="absolute top-10 right-3">
                        <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.display_type === "gambar_teks" ? "Gbr + Teks" : "Galeri"}
                        </span>
                      </div>
                    )}

                    {/* Title overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-1">
                      <h3 className="font-bold text-white text-sm line-clamp-1 drop-shadow">{item.title}</h3>
                      <p className="text-white/70 text-[10px] mt-0.5">oleh {item.uploader || "admin"}</p>
                    </div>
                  </div>

                  {/* Info Body */}
                  <div className="p-4 flex flex-col gap-3 flex-1">

                    {/* Jadwal Info — Prominent */}
                    <div className={`rounded-xl p-3 flex flex-col gap-2 text-xs ${
                      isScheduled ? "bg-amber-50 border border-amber-100" :
                      isExpired ? "bg-red-50 border border-red-100" :
                      "bg-emerald-50 border border-emerald-100"
                    }`}>
                      <p className={`font-bold uppercase tracking-wide text-[10px] ${
                        isScheduled ? "text-amber-700" :
                        isExpired ? "text-red-700" :
                        "text-emerald-700"
                      }`}>
                        {isScheduled ? "📅 Jadwal Tayang Berikutnya" : isExpired ? "⛔ Sudah Berakhir" : "✅ Jadwal Tayang"}
                      </p>

                      <div className="flex flex-col gap-1.5">
                        {item.waktu_mulai && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Calendar size={10} /> Mulai
                            </span>
                            <span className={`font-semibold ${isScheduled ? "text-amber-700" : "text-gray-700"}`}>
                              {new Date(item.waktu_mulai).toLocaleDateString("id-ID", {
                                day: "2-digit", month: "short", year: "numeric"
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock size={10} /> Berakhir
                          </span>
                          {item.waktu_berakhir ? (
                            <span className={`font-semibold ${isExpired ? "text-red-600" : "text-gray-700"}`}>
                              {new Date(item.waktu_berakhir).toLocaleDateString("id-ID", {
                                day: "2-digit", month: "short", year: "numeric"
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-[10px]">Tidak terbatas</span>
                          )}
                        </div>

                        {/* Countdown bar for active items */}
                        {isActive && daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                          <div className="mt-1">
                            <div className="flex justify-between text-[10px] text-orange-600 font-medium mb-1">
                              <span>Sisa waktu tayang</span>
                              <span>{daysUntilExpiry} hari</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-400 rounded-full transition-all"
                                style={{ width: `${Math.max(5, (daysUntilExpiry / 7) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Penjelasan singkat */}
                    {item.explanation && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Penjelasan</p>
                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                          {item.explanation.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')}
                        </p>
                      </div>
                    )}

                    {/* Next Forecast Section */}
                    {item.next_url && (
                      <div className="rounded-xl p-3 border border-dashed border-blue-200 bg-blue-50/50">
                        <p className="font-bold uppercase tracking-wide text-[10px] text-blue-700 mb-2">
                          📋 Prakiraan Berikutnya
                        </p>
                        <div className="flex gap-2 mb-2">
                          <img
                            src={item.next_url}
                            alt="Next forecast"
                            className="w-16 h-12 rounded-lg object-cover border border-blue-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            {item.next_waktu_mulai && (
                              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Calendar size={9} />
                                Mulai: {new Date(item.next_waktu_mulai).toLocaleDateString("id-ID", {
                                  day: "2-digit", month: "short", year: "numeric"
                                })}
                              </p>
                            )}
                            {item.next_waktu_berakhir && (
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                <Clock size={9} />
                                Berakhir: {new Date(item.next_waktu_berakhir).toLocaleDateString("id-ID", {
                                  day: "2-digit", month: "short", year: "numeric"
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.next_explanation && (
                          <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
                            {item.next_explanation.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 px-4 pb-4">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 border border-blue-100 rounded-xl text-[#003399] hover:bg-blue-50/70 font-semibold transition-colors"
                    >
                      <Edit3 size={12} /> Edit Kartu
                    </button>
                    {isAdmin() && (
                      <button
                        onClick={() => deleteEntry(item.id)}
                        className="flex items-center justify-center px-3 py-2 border border-red-100 rounded-xl text-red-600 hover:bg-red-50/70 transition-colors"
                        title="Hapus kartu"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Editor */}
      {isModalOpen && editingEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            if (!saving) {
              setIsModalOpen(false);
              setEditingEntry(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-zoom-in max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Tambah Kartu Prakiraan Baru" : "Edit Kartu Prakiraan"}
              </h2>
              {!saving && (
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEntry(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Judul Kartu */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Judul Kartu Prakiraan</label>
                <Input
                  value={editingEntry.title}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  placeholder="Contoh: Prakiraan Cuaca Pelabuhan Tegal"
                  disabled={saving}
                />
              </div>

              {/* Upload Gambar */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Unggah Gambar Kartu</label>
                <div className="flex items-center gap-4">
                  {editingEntry.url && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                      <img src={editingEntry.url} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl hover:bg-blue-50/10 cursor-pointer transition-all duration-200">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-600 font-semibold">
                      {editingEntry.file ? editingEntry.file.name : "Pilih Gambar (Image)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditingEntry({
                            ...editingEntry,
                            file,
                            url: URL.createObjectURL(file),
                          });
                        }
                      }}
                      disabled={saving}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Mode Tampilan */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Mode Tampilan</label>
                <select
                  value={editingEntry.display_type || "gambar_saja"}
                  onChange={(e) => setEditingEntry({ ...editingEntry, display_type: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
                  disabled={saving}
                >
                  <option value="gambar_saja">Gambar Saja</option>
                  <option value="gambar_teks">Gambar + Teks</option>
                  <option value="gambar_galeri">Gambar + Galeri</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  <strong>Gambar Saja:</strong> Tampilkan gambar penuh. <strong>Gambar + Teks:</strong> Tampilkan dengan overlay teks. <strong>Galeri:</strong> Tampilkan dengan thumbnail tambahan.
                </p>
              </div>

              {/* Penjelasan Textarea */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Penjelasan Cuaca Detail</label>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <ReactQuill
                    theme="snow"
                    value={editingEntry.explanation}
                    onChange={(content) => setEditingEntry({ ...editingEntry, explanation: content })}
                    placeholder="Tuliskan informasi penjelasan detail mengenai kondisi cuaca secara lengkap dan jelas..."
                    readOnly={saving}
                    className="min-h-[150px] quill-editor"
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['clean']
                      ],
                    }}
                  />
                </div>
                <style jsx global>{`
                  .quill-editor .ql-editor {
                    min-height: 150px;
                    font-size: 0.875rem;
                    line-height: 1.625;
                  }
                  .quill-editor .ql-toolbar {
                    border-top: none !important;
                    border-left: none !important;
                    border-right: none !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    background-color: #f9fafb;
                  }
                  .quill-editor .ql-container {
                    border: none !important;
                  }
                `}</style>
              </div>

              {/* Tanggal Mulai */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Tanggal Mulai Tayang</label>
                <input
                  type="date"
                  value={editingEntry.waktu_mulai || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, waktu_mulai: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
                  disabled={saving}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Kartu prakiraan akan mulai tampil di halaman pengguna mulai tanggal ini. Kosongkan jika langsung tampil.
                </p>
              </div>

              {/* Tanggal Berakhir */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Tanggal Berakhir</label>
                <input
                  type="date"
                  value={editingEntry.waktu_berakhir || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, waktu_berakhir: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
                  disabled={saving}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Kartu prakiraan ini akan otomatis disembunyikan dari halaman pengguna setelah tanggal di atas. Kosongkan jika tidak berdurasi.
                </p>
              </div>

              {/* Next Forecast Toggle */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNextSection(!showNextSection)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900">Prakiraan Berikutnya</p>
                    <p className="text-[11px] text-gray-400">Tambah jadwal prakiraan cuaca untuk periode selanjutnya</p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-200 ${
                      showNextSection ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Next Forecast Content */}
              {showNextSection && (
                <div className="space-y-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Informasi Prakiraan Berikutnya</p>

                  {/* Upload Gambar Next */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Gambar Prakiraan Berikutnya</label>
                    <div className="flex items-center gap-4">
                      {editingEntry.next_url && (
                        <div className="w-24 h-16 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                          <img src={editingEntry.next_url} className="w-full h-full object-cover" alt="Next Preview" />
                        </div>
                      )}
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 hover:border-[#003399] rounded-xl hover:bg-blue-50/10 cursor-pointer transition-all duration-200">
                        <Upload size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-600 font-semibold">
                          {editingEntry.nextFile ? editingEntry.nextFile.name : "Pilih Gambar (Image)"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditingEntry({
                                ...editingEntry,
                                nextFile: file,
                                next_url: URL.createObjectURL(file),
                              });
                            }
                          }}
                          disabled={saving}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Penjelasan Next */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Penjelasan Prakiraan Berikutnya</label>
                    <div className="bg-white rounded-xl overflow-hidden border border-blue-200">
                      <ReactQuill
                        theme="snow"
                        value={editingEntry.next_explanation || ""}
                        onChange={(content) => setEditingEntry({ ...editingEntry, next_explanation: content })}
                        placeholder="Tuliskan informasi penjelasan detail untuk prakiraan berikutnya..."
                        readOnly={saving}
                        className="min-h-[120px] quill-editor"
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['clean']
                          ],
                        }}
                      />
                    </div>
                  </div>

                  {/* Tanggal Mulai Next */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Tanggal Mulai Tayang (Berikutnya)</label>
                    <input
                      type="date"
                      value={editingEntry.next_waktu_mulai || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, next_waktu_mulai: e.target.value })}
                      className="w-full rounded-xl border border-blue-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
                      disabled={saving}
                    />
                  </div>

                  {/* Tanggal Berakhir Next */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Tanggal Berakhir (Berikutnya)</label>
                    <input
                      type="date"
                      value={editingEntry.next_waktu_berakhir || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, next_waktu_berakhir: e.target.value })}
                      className="w-full rounded-xl border border-blue-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003399] bg-white text-gray-900"
                      disabled={saving}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEntry(null);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleModalSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
