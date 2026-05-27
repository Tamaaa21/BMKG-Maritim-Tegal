"use client";

import { useEffect, useState } from "react";
import { Upload, Trash, Plus } from "lucide-react";

export default function PublicationManager() {
  const [items, setItems] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [addingUrl, setAddingUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      const r = await fetch('/api/admin/publications');
      const j = await r.json();
      if (j?.success) setItems(j.data);
    } catch (e) {}
  };

  useEffect(() => { fetchList(); }, []);

  const handleUpload = async () => {
    if (!file && !addingUrl) return;
    setLoading(true);
    try {
      const form = new FormData();
      if (file) form.append('file', file);
      if (addingUrl) form.append('url', addingUrl);
      form.append('title', title || 'Publikasi');
      form.append('description', description || '');
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (token) {
          const decoded = atob(token);
          const username = decoded.split(':')[0];
          if (username) form.append('uploader', username);
        }
      } catch (e) {}
      const r = await fetch('/api/admin/publications', { method: 'POST', body: form });
      const j = await r.json();
      if (j?.success) {
        setFile(null); setAddingUrl(''); setTitle(''); setDescription(''); fetchList();
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus publikasi ini?')) return;
    await fetch(`/api/admin/publications?id=${id}`, { method: 'DELETE' });
    fetchList();
  };

  return (
    <div className="mt-4 bg-white rounded-2xl border p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <label className="col-span-2 flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer">
          <Upload />
          <span className="text-sm text-gray-600">Pilih file (PDF / gambar)</span>
          <input type="file" accept="image/*,application/pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="hidden" />
        </label>
        <div className="flex items-center gap-2">
          <input value={addingUrl} onChange={e=>setAddingUrl(e.target.value)} placeholder="Atau tempel URL file" className="flex-1 border rounded-md p-2" />
          <button onClick={handleUpload} disabled={loading} className="px-4 py-2 bg-[#003399] text-white rounded-md">{loading? 'Mengirim...':'Tambah'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Judul publikasi" className="border rounded-md p-2" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Deskripsi singkat" className="border rounded-md p-2" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(it => (
          <div key={it.id} className="relative rounded-lg overflow-hidden border p-2">
            {it.url.endsWith('.pdf') ? (
              <div className="flex items-center justify-center h-36 bg-gray-100">PDF</div>
            ) : (
              <img src={it.url} alt={it.title} className="w-full h-36 object-cover" />
            )}
            <div className="mt-2 text-sm font-semibold">{it.title}</div>
            <div className="text-xs text-gray-500 line-clamp-2">{it.description}</div>
            <button className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1" onClick={()=>handleDelete(it.id)}><Trash size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
