"use client";

import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";

const forecastCategories = [
  { id: 1, name: "Prakiraan Cuaca Kota" },
  { id: 2, name: "Prakiraan Cuaca Pelabuhan" },
  { id: 3, name: "Prakiraan Cuaca Maritim" },
  { id: 4, name: "Informasi Pasang Surut / Wisata Bahari" },
];

export default function PrakiraanManager() {
  const [images, setImages] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  const handleUpload = async (categoryId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(categoryId.toString());
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", `${categoryId} - ${categoryId}`);
      if (explanations[categoryId]) form.append('explanation', explanations[categoryId]);

      const res = await fetch("/api/admin/prakiraan-images", {
        method: "POST",
        body: form,
      });
      const body = await res.json();
      if (body?.success && body.data) {
        setImages({ ...images, [categoryId]: body.data.url });
        if (body.data.explanation) setExplanations({ ...explanations, [categoryId]: body.data.explanation });
      } else {
        setImages({ ...images, [categoryId]: URL.createObjectURL(file) });
      }
    } catch (err) {
      console.error(err);
      setImages({ ...images, [categoryId]: URL.createObjectURL(file) });
    } finally {
      setUploading(null);
    }
  };

  const handleReset = (categoryId: number) => {
    const defaults: Record<number, string> = {
      1: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600",
      2: "https://images.pexels.com/photos/753331/pexels-photo-753331.jpeg?auto=compress&cs=tinysrgb&w=600",
      3: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=600",
      4: "https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=600",
    };
    setImages({ ...images, [categoryId]: defaults[categoryId] });
  };

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/prakiraan-images').then(r => r.json()).then((b) => {
      if (!mounted) return;
      if (b?.success) {
        const map: Record<string, string> = {};
        const expl: Record<string, string> = {};
        b.data.forEach((item: any) => {
          // try to detect category id from title prefix
          const m = String(item.title || '').match(/^(\d+)/);
          const key = m ? m[1] : item.id;
          map[key] = item.url;
          if (item.explanation) expl[key] = item.explanation;
        });
        // fill defaults for missing
        const defaults: Record<number, string> = {
          1: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600",
          2: "https://images.pexels.com/photos/753331/pexels-photo-753331.jpeg?auto=compress&cs=tinysrgb&w=600",
          3: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=600",
          4: "https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=600",
        };
        forecastCategories.forEach(c => {
          if (!map[c.id]) map[c.id] = map[c.id] || defaults[c.id];
          if (!expl[c.id]) expl[c.id] = '';
        });
        setImages(map as any);
        setExplanations(expl as any);
      }
    }).catch(err => console.error(err));
    return () => { mounted = false };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Prakiraan</h1>
        <p className="text-gray-500 mt-2">Atur gambar untuk setiap kategori prakiraan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forecastCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">{category.name}</h3>

            {/* Current Image */}
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
              <img src={images[category.id]} alt={category.name} className="w-full h-full object-cover" />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Penjelasan Gambar</label>
              <textarea value={explanations[category.id] || ''} onChange={e => setExplanations({...explanations, [category.id]: e.target.value})} className="mt-1 block w-full border rounded-md p-2" rows={2} />
            </div>

            {/* Upload Area */}
            <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#003399] cursor-pointer transition-colors mb-3">
              <Upload size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">
                {uploading === category.id.toString() ? "Mengupload..." : "Ganti Gambar"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(category.id, e)}
                disabled={uploading === category.id.toString()}
                className="hidden"
              />
            </label>

            <button
              onClick={() => handleReset(category.id)}
              className="w-full px-3 py-2 text-sm border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset ke Gambar Default
            </button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-end">
        <button className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button className="px-6 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors">
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
