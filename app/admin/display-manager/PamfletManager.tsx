"use client";

import { useEffect, useState } from "react";
import { Upload, Trash, Plus } from "lucide-react";
import { Input } from '@/components/ui/input';

export default function PamfletManager() {
  const [items, setItems] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [addingUrl, setAddingUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      const r = await fetch('/api/admin/pamflets');
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
      const r = await fetch('/api/admin/pamflets', { method: 'POST', body: form });
      const j = await r.json();
      if (j?.success) {
        setFile(null); setAddingUrl(''); fetchList();
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pamflet ini?')) return;
    await fetch(`/api/admin/pamflets?id=${id}`, { method: 'DELETE' });
    fetchList();
  };

  return (
    <div className="mt-4 bg-white rounded-2xl border p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <label className="col-span-2 flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer">
          <Upload />
          <span className="text-sm text-gray-600">Pilih file gambar</span>
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="hidden" />
        </label>
        <div className="flex items-center gap-2">
          <Input value={addingUrl} onChange={e=>setAddingUrl(e.target.value)} placeholder="Atau tempel URL gambar" className="flex-1" />
          <button onClick={handleUpload} disabled={loading} className="px-4 py-2 bg-[#003399] text-white rounded-md">{loading? 'Mengirim...':'Tambah'}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(it => (
          <div key={it.id} className="relative rounded-lg overflow-hidden border">
            <img src={it.url} alt={it.title} className="w-full h-36 object-cover" />
            <button className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1" onClick={()=>handleDelete(it.id)}><Trash size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
