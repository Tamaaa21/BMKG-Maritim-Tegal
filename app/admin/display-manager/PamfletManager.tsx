"use client";

import { useEffect, useState } from "react";
import { Upload, Trash, Calendar, AlertCircle, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { Input } from '@/components/ui/input';

function getUserRole(): string {
  try {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("adminUser") : null;
    if (stored) return JSON.parse(stored).role || "";
  } catch { }
  return "";
}

function isAdmin() {
  const role = getUserRole();
  return role === "admin" || role === "super_admin";
}

const isVideoUrl = (url: string) => {
  return !!(url && (url.match(/\.(mp4|webm|ogg|mov|mkv|avi|3gp|flv|wmv)/i) || url.includes("video")));
};

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return null;
  let videoId: string | null = null;
  
  if (url.includes('/shorts/')) {
    const parts = url.split('/shorts/');
    if (parts[1]) {
      videoId = parts[1].split(/[?&#]/)[0];
    }
  } else {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
  }

  if (videoId && videoId.length === 11) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&showinfo=0&iv_load_policy=3`;
  }
  return null;
};

const isYoutubeUrl = (url: string) => {
  return !!getYoutubeEmbedUrl(url);
};

export default function PamfletManager() {
  const [items, setItems] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [addingUrl, setAddingUrl] = useState('');
  const [waktuBerakhir, setWaktuBerakhir] = useState('');
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchList = async () => {
    try {
      const r = await fetch('/api/admin/pamflets');
      const j = await r.json();
      if (j?.success) setItems(j.data);
    } catch (e) { }
  };

  useEffect(() => { fetchList(); }, []);

  const handleUpload = async () => {
    if (!file && !addingUrl) return;
    setLoading(true);
    try {
      const form = new FormData();
      if (file) form.append('file', file);
      if (addingUrl) form.append('url', addingUrl);
      // attach uploader info from adminToken (format: base64(username:ts))
      try {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('adminToken') : null;
        if (token) {
          const decoded = atob(token);
          const username = decoded.split(':')[0];
          if (username) form.append('uploader', username);
        }
      } catch (e) {
        // ignore
      }
      form.append('title', 'Pamflet');
      // If waktu_berakhir is set, convert date to end-of-day ISO
      if (waktuBerakhir) {
        try {
          const endOfDay = new Date(waktuBerakhir + 'T23:59:59');
          if (!isNaN(endOfDay.getTime())) {
            form.append('waktu_berakhir', endOfDay.toISOString());
          }
        } catch (e) { }
      }
      const r = await fetch('/api/admin/pamflets', { method: 'POST', body: form });
      const j = await r.json();
      if (j?.success) {
        setFile(null);
        setAddingUrl('');
        setWaktuBerakhir('');
        fetchList();
      }
    } catch (e) { }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pamflet ini?')) return;
    await fetch(`/api/admin/pamflets?id=${id}`, { method: 'DELETE' });
    fetchList();
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const r = await fetch('/api/admin/pamflets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction }),
      });
      const j = await r.json();
      if (j?.success) {
        fetchList();
      }
    } catch (e) {
      console.error("Gagal mengubah urutan:", e);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAdmin()) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!isAdmin() || draggedIndex === null || draggedIndex === targetIndex) return;

    const reorderedItems = [...items];
    const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, draggedItem);

    setDraggedIndex(targetIndex);
    setItems(reorderedItems);
  };

  const handleDragEnd = async () => {
    if (!isAdmin()) return;
    setDraggedIndex(null);
    try {
      const itemIds = items.map((item) => item.id);
      const r = await fetch('/api/admin/pamflets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemIds }),
      });
      const j = await r.json();
      if (j?.success) {
        setItems(j.data);
      } else {
        fetchList();
      }
    } catch (e) {
      console.error("Gagal memperbarui urutan:", e);
      fetchList();
    }
  };

  return (
    <div className="mt-4 bg-white rounded-2xl border p-6 space-y-6">
      {/* Upload Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload */}
          <label className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 hover:border-[#003399] rounded-xl cursor-pointer transition-colors hover:bg-blue-50/30">
            <Upload className="text-gray-400 flex-shrink-0" size={18} />
            <span className="text-sm text-gray-600 truncate">
              {file ? file.name : 'Pilih file gambar/video untuk diunggah'}
            </span>
            <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>

          {/* URL Input */}
          <Input
            value={addingUrl}
            onChange={e => setAddingUrl(e.target.value)}
            placeholder="Atau tempel URL gambar/video"
          />
        </div>

        {/* Date + Upload Button Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">


          <button
            onClick={handleUpload}
            disabled={loading || (!file && !addingUrl)}
            className="px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {loading ? 'Mengunggah...' : 'Tambah Display'}
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-xl bg-gray-50">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={28} />
          <p className="text-gray-500 text-sm">Belum ada Display yang diunggah.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((it, idx) => {
            const isExpired = it.waktu_berakhir && new Date(it.waktu_berakhir) < new Date();
            return (
              <div
                key={it.id}
                draggable={isAdmin()}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragEnd={handleDragEnd}
                className={`relative rounded-xl overflow-hidden border shadow-sm bg-white flex flex-col transition-all duration-200 select-none ${
                  isAdmin() ? "cursor-grab active:cursor-grabbing" : ""
                } ${
                  draggedIndex === idx 
                    ? "opacity-45 border-[#003399] border-dashed border-2 scale-95 shadow-inner" 
                    : "border-gray-200 hover:border-[#003399]/40 hover:shadow-md"
                }`}
              >
                <div className="relative w-full h-36 overflow-hidden flex-shrink-0 bg-slate-900 flex items-center justify-center">
                  {isYoutubeUrl(it.url) ? (
                    <div className="w-full h-full bg-black relative">
                      <iframe
                        src={getYoutubeEmbedUrl(it.url) || ""}
                        className="w-full h-full border-none pointer-events-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                      <div className="absolute inset-0 bg-transparent" />
                    </div>
                  ) : isVideoUrl(it.url) ? (
                    <video src={it.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={it.url} alt={it.title} className="w-full h-full object-cover" />
                  )}
                  {/* Expired badge */}
                  {isExpired && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Kadaluarsa
                    </span>
                  )}
                  {/* Expiry date label */}
                  {it.waktu_berakhir && (
                    <div className={`absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] font-medium flex items-center gap-1 ${isExpired ? 'bg-red-600/80 text-white' : 'bg-black/50 text-gray-200'}`}>
                      <Calendar size={9} />
                      {isExpired ? 'Exp:' : 'Berakhir:'} {new Date(it.waktu_berakhir).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>
                {/* Control Panel (Always Visible) */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    {isAdmin() && (
                      <GripVertical size={14} className="text-gray-400 select-none pointer-events-none" />
                    )}
                    <span className="font-extrabold text-[#003399] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[10px]" title="Urutan Konten">
                      #{it.order || (idx + 1)}
                    </span>
                  </div>
                  {isAdmin() && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReorder(it.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-gray-500 hover:bg-gray-200 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 rounded transition-colors"
                        title="Geser Kiri (Naikkan Urutan)"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => handleReorder(it.id, 'down')}
                        disabled={idx === items.length - 1}
                        className="p-1 text-gray-500 hover:bg-gray-200 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 rounded transition-colors"
                        title="Geser Kanan (Turunkan Urutan)"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(it.id)}
                        className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors ml-0.5"
                        title="Hapus Display"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
