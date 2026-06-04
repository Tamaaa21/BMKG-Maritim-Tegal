"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Eye, Download } from "lucide-react";
import { Input } from '@/components/ui/input';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BukuTamuEntry {
  id: string;
  nama: string;
  email: string;
  no_telepon: string;
  instansi: string | null;
  keperluan: string;
  foto_data: string | null;
  created_at: string;
}

export default function BukuTamuPage() {
  const [data, setData] = useState<BukuTamuEntry[]>([]);
  const [filtered, setFiltered] = useState<BukuTamuEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<BukuTamuEntry | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/buku-tamu");
      const result = await response.json();
      setData(result || []);
      setFiltered(result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.no_telepon.includes(search)
    );
    setFiltered(filtered);
  }, [search, data]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      await fetch(`/api/admin/buku-tamu/${id}`, { method: "DELETE" });
      setData(data.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Laporan Buku Tamu - Stasiun Meteorologi Maritim Tegal", 14, 20);
    
    const tableColumn = ["No", "Nama", "Email", "Telepon", "Instansi", "Keperluan", "Tanggal"];
    const tableRows: any[] = [];

    filtered.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.nama,
        item.email,
        item.no_telepon,
        item.instansi || "-",
        item.keperluan,
        new Date(item.created_at).toLocaleDateString("id-ID")
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 51, 153] }
    });

    doc.save(`Buku_Tamu_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Data Buku Tamu</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Manajemen data pengunjung dan tamu</p>
      </div>

      {/* Search & Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari berdasarkan nama, email, atau telepon..." className="pl-12 text-sm" />
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-[#003399] hover:bg-[#0044cc] text-white px-4 py-2.5 rounded-lg font-semibold transition-colors w-full sm:w-auto text-sm shadow-sm"
        >
          <Download size={18} /> Cetak PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-700">Nama</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700">Telepon</th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700">Instansi</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700">Tanggal</th>
                  <th className="px-3 md:px-6 py-3 text-center text-xs font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-4 text-xs md:text-sm font-medium text-gray-900">{item.nama}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600 truncate">{item.email}</td>
                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-600">{item.no_telepon}</td>
                    <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-600">{item.instansi || "-"}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-3 md:px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedEntry(item)}
                          className="p-2 hover:bg-blue-50 text-[#003399] rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Detail Pengunjung</h2>
            <div className="space-y-4">
              {/* Foto */}
              {selectedEntry.foto_data && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">Foto</p>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                    <img
                      src={selectedEntry.foto_data}
                      alt="Foto pengunjung"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Nama</p>
                <p className="text-gray-900 font-medium">{selectedEntry.nama}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                <p className="text-gray-900 font-medium text-sm break-all">{selectedEntry.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Telepon</p>
                <p className="text-gray-900 font-medium">{selectedEntry.no_telepon}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Instansi</p>
                <p className="text-gray-900 font-medium">{selectedEntry.instansi || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Keperluan</p>
                <p className="text-gray-900 font-medium text-sm">{selectedEntry.keperluan}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Tanggal</p>
                <p className="text-gray-900 font-medium">{new Date(selectedEntry.created_at).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedEntry(null)}
              className="w-full mt-6 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
