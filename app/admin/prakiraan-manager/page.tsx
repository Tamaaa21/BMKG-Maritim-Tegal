"use client";

import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import PamfletManager from "./PamfletManager";

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
  // items per category: map categoryId -> array of entries
  const [items, setItems] = useState<Record<string, any[]>>({});
  const [saving, setSaving] = useState(false);

  const handleUpload = async (categoryId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(categoryId.toString());
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", `${categoryId} - ${categoryId}`);
      if (explanations[categoryId]) form.append('explanation', explanations[categoryId]);
      // attach uploader from admin token so uploaded record is linked to the user
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (token) {
          const username = atob(token).split(':')[0];
          if (username) form.append('uploader', username);
        }
      } catch (e) {
        // ignore token decode errors
      }

      const res = await fetch("/api/admin/prakiraan-images", {
        method: "POST",
        body: form,
      });
      const body = await res.json();
      if (body?.success && body.data) {
        // append to category items array
        setItems(prev => ({ ...prev, [categoryId]: [...(prev[categoryId] || []), body.data] }));
        // set representative image and explanation if missing
        setImages(prev => ({ ...prev, [categoryId]: prev[categoryId] || body.data.url }));
        if (body.data.explanation) setExplanations(prev => ({ ...prev, [categoryId]: prev[categoryId] || body.data.explanation }));
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

  const deleteEntry = async (categoryId: number, entryId: number) => {
    try {
      await fetch(`/api/admin/prakiraan-images/${entryId}`, { method: 'DELETE' });
      setItems(prev => ({ ...prev, [categoryId]: (prev[categoryId] || []).filter(e => e.id !== entryId) }));
      // refresh representative image
      setImages(prev => {
        const arr = (items[categoryId] || []).filter(e => e.id !== entryId);
        return { ...prev, [categoryId]: arr[0]?.url || prev[categoryId] };
      });
    } catch (e) {
      console.error('deleteEntry error', e);
    }
  };

  const updateEntryExplanation = async (categoryId: number, entryId: number, explanation: string) => {
    try {
      await fetch(`/api/admin/prakiraan-images/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ explanation }),
      });
      setItems(prev => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).map(e => e.id === entryId ? { ...e, explanation } : e)
      }));
      setExplanations(prev => ({ ...prev, [categoryId]: explanation }));
    } catch (e) {
      console.error('updateEntryExplanation error', e);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/prakiraan-images');
        const b = await res.json();
        if (!mounted) return;
        if (b?.success) {
          const map: Record<string, string> = {};
          const expl: Record<string, string> = {};
          const itmap: Record<string, any[]> = {};
          b.data.forEach((item: any) => {
            // try to detect category id from title prefix
            const m = String(item.title || '').match(/^(\d+)/);
            const key = m ? m[1] : String(item.id);
            if (!itmap[key]) itmap[key] = [];
            itmap[key].push(item);
            if (item.explanation && !expl[key]) expl[key] = item.explanation;
            if (!map[key]) map[key] = item.url;
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
            if (!itmap[c.id]) itmap[c.id] = [];
          });
          setImages(map as any);
          setExplanations(expl as any);
          setItems(itmap as any);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false };
  }, []);

  const saveCategory = async (cid: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      let username = null;
      try { if (token) username = atob(token).split(':')[0]; } catch (e) {}

      const expl = explanations[cid] || '';
      const existing = items[cid];

      if (existing && existing.id) {
        await fetch(`/api/admin/prakiraan-images/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ explanation: expl, uploader: username }),
        });
      } else {
        const category = forecastCategories.find(c => c.id === cid);
        await fetch('/api/admin/prakiraan-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: images[cid], title: `${cid} - ${category?.name || cid}`, explanation: expl, uploader: username }),
        });
      }

      // refresh items
      const res = await fetch('/api/admin/prakiraan-images');
      const b2 = await res.json();
      if (b2?.success) {
        const itmap2: Record<string, any> = {};
        b2.data.forEach((item: any) => {
          const m = String(item.title || '').match(/^(\d+)/);
          const key = m ? m[1] : item.id;
          itmap2[key] = item;
        });
        setItems(itmap2 as any);
        if (itmap2[cid]) {
          setImages(prev => ({ ...prev, [cid]: itmap2[cid].url }));
          setExplanations(prev => ({ ...prev, [cid]: itmap2[cid].explanation || '' }));
        }
      }
    } catch (e) {
      console.error('saveCategory error', e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Prakiraan</h1>
        <p className="text-gray-500 mt-2">Atur gambar untuk setiap kategori prakiraan</p>
      </div>

      {/* Pamflet Manager */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kelola Pamflet Prakiraan</h2>
        <p className="text-gray-500 mt-1">Atur pamflet yang tampil di bagian Prakiraan. Upload gambar atau tambahkan URL.</p>

        <PamfletManager />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forecastCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">{category.name}</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Daftar Gambar</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(items[category.id] || []).map((it) => (
                  <div key={it.id} className="bg-white rounded-md border p-2 flex gap-2 items-start">
                    <img src={it.url} className="w-24 h-16 object-cover rounded-md" alt={it.title} />
                    <div className="flex-1">
                      <textarea
                        className="w-full border rounded-md p-2 text-sm"
                        rows={2}
                        defaultValue={it.explanation || ''}
                        onBlur={(e) => updateEntryExplanation(category.id, it.id, e.target.value)}
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => deleteEntry(category.id, it.id)} className="text-sm px-3 py-1 border rounded text-red-600">Hapus</button>
                        <button onClick={() => setImages(prev => ({ ...prev, [category.id]: it.url }))} className="text-sm px-3 py-1 border rounded">Jadikan Utama</button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!(items[category.id] || []).length) && (
                  <div className="col-span-2 rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
                    <img src={images[category.id]} alt={category.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Upload Area */}
            <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#003399] cursor-pointer transition-colors mb-3">
              <Upload size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">
                {uploading === category.id.toString() ? "Mengupload..." : "Unggah Gambar Baru"}
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
        <button onClick={async () => {
          setSaving(true);
          try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            let username = null;
            try { if (token) username = atob(token).split(':')[0]; } catch (e) {}

            for (const c of forecastCategories) {
              const cid = c.id;
              const expl = explanations[cid] || '';
              const entries = items[cid] || [];
              if (entries.length === 0) {
                // create a representative entry from current image URL
                if (images[cid]) {
                  await fetch('/api/admin/prakiraan-images', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: images[cid], title: `${cid} - ${c.name}`, explanation: expl, uploader: username }),
                  });
                }
              } else {
                // ensure each entry's explanation is saved
                for (const ent of entries) {
                  const entExpl = ent.explanation || expl || '';
                  if (ent.id) {
                    await fetch(`/api/admin/prakiraan-images/${ent.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ explanation: entExpl, uploader: username }),
                    });
                  } else if (ent.url) {
                    await fetch('/api/admin/prakiraan-images', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: ent.url, title: `${cid} - ${c.name}`, explanation: entExpl, uploader: username }),
                    });
                  }
                }
              }
            }

            // refresh items (group into arrays)
            const res = await fetch('/api/admin/prakiraan-images');
            const b2 = await res.json();
            if (b2?.success) {
              const itmap2: Record<string, any[]> = {};
              b2.data.forEach((item: any) => {
                const m = String(item.title || '').match(/^(\d+)/);
                const key = m ? m[1] : String(item.id);
                if (!itmap2[key]) itmap2[key] = [];
                itmap2[key].push(item);
              });
              // ensure keys exist for all categories
              forecastCategories.forEach(c => { if (!itmap2[c.id]) itmap2[c.id] = []; });
              setItems(itmap2 as any);
            }
          } catch (e) {
            console.error(e);
          } finally { setSaving(false); }
        }} className={`px-6 py-2.5 ${saving? 'opacity-60 pointer-events-none': ''} bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors`}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
}
