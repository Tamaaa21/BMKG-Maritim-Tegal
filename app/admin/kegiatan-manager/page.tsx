"use client";

import { useState, useEffect } from "react";
import { Upload, Trash } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { kegiatanCategories } from "@/components/kegiatanCategories";

export default function KegiatanManager() {
  const [items, setItems] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [category, setCategory] = useState("");
  const categories = kegiatanCategories;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/kegiatan-documents');
      const json = await res.json();
      if (json?.success) setItems(json.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', title || file.name);
      if (description) form.append('description', description);
      if (eventDate) form.append('event_date', eventDate);
      const res = await fetch('/api/admin/kegiatan-documents', { method: 'POST', body: form });
      const json = await res.json();
      if (json?.success) {
        setItems([json.data, ...items]);
        setFile(null); setTitle(''); setDescription(''); setEventDate('');
      } else {
        alert('Upload gagal');
      }
    } catch (e) { console.error(e); alert('Upload error'); }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus dokumen ini?')) return;
    try {
      const res = await fetch(`/api/admin/kegiatan-documents/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json?.success) setItems(items.filter(i => i.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dokumentasi Kegiatan</h1>
        <p className="text-gray-500 mt-2">Upload foto atau dokumen kegiatan</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Judul</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal Kegiatan</label>
            <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm">
              <option value="">Pilih kategori</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1" rows={3} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer">
            <Upload /> <span>{file ? file.name : 'Pilih file'}</span>
            <input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
          <button onClick={handleUpload} disabled={uploading || !file} className="px-4 py-2 bg-[#003399] text-white rounded-md">{uploading ? 'Mengupload...' : 'Upload'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 items-start">
            <div style={{ width: 120, height: 80 }} className="flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                {editingId === item.id ? (
                  <Input className="font-semibold w-2/3 border-b" value={editValues.title || ''} onChange={e => setEditValues({...editValues, title: e.target.value})} />
                ) : (
                  <h3 className="font-semibold">{item.title}</h3>
                )}

                <div className="flex items-center gap-2">
                  {editingId === item.id ? (
                    <>
                      <button onClick={async () => {
                        try {
                          const body = {
                            title: editValues.title,
                            description: editValues.description,
                            event_date: editValues.event_date,
                            category: editValues.category,
                          };
                          const res = await fetch(`/api/admin/kegiatan-documents/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                          const json = await res.json();
                          if (json?.success) {
                            setItems(items.map(i => i.id === item.id ? json.data : i));
                            setEditingId(null);
                          } else {
                            alert('Gagal menyimpan');
                          }
                        } catch (e) { console.error(e); alert('Error saat menyimpan'); }
                      }} className="text-sm px-2 py-1 bg-green-600 text-white rounded">Simpan</button>
                      <button onClick={() => setEditingId(null)} className="text-sm px-2 py-1 bg-gray-200 rounded">Batal</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditingId(item.id);
                        setEditValues({ title: item.title, description: item.description, event_date: item.event_date, category: item.category });
                      }} className="text-sm px-2 py-1 bg-blue-600 text-white rounded">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 px-2 py-1"><Trash /></button>
                    </>
                  )}
                </div>
              </div>
              {editingId === item.id ? (
                  <div className="mt-2">
                  <Textarea value={editValues.description || ''} onChange={e => setEditValues({...editValues, description: e.target.value})} className="w-full" rows={2} />
                  <div className="flex gap-2 mt-2">
                    <Input type="date" value={editValues.event_date || ''} onChange={e => setEditValues({...editValues, event_date: e.target.value})} className="w-48" />
                    <select value={editValues.category || ''} onChange={e => setEditValues({...editValues, category: e.target.value})} className="rounded-md border border-input px-3 py-2 text-sm">
                      <option value="">Pilih kategori</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{item.event_date ? new Date(item.event_date).toLocaleDateString() : ''} {item.category ? `· ${item.category}` : ''}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
