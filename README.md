# BMKG Maritim Tegal

BMKG-Maritim-Tegal adalah situs portal berbasis Next.js untuk menampilkan informasi maritim dan layanan publik Kota Tegal, dibangun dengan fokus pada CMS ringan menggunakan Supabase sebagai backend.

**Teknologi utama**
- Framework: Next.js (React + TypeScript)
- Styling: Tailwind CSS
- Backend / Auth / DB: Supabase (Postgres + RLS)
- Bahasa: TypeScript

**Fitur singkat**
- Halaman publik untuk berita, kegiatan, publikasi, prakiraan, dan hero slideshow.
- Form layanan (berbayar / nol rupiah), buku tamu, dan manajemen publikasi.
- Panel admin terbatas untuk mengelola hero images, publikasi, dan pra-kiraan.

Lokasi file penting:
- Migrasi gabungan SQL: `supabase/migrations/20260528120000_06_combined_migrations.sql`
- Backup migrasi lama: `supabase/migrations/backup/`

Persiapan & Penggunaan
1. Prasyarat
	- Node.js (LTS), npm atau yarn
	- Supabase project (atau Postgres) untuk menyimpan data

2. Install dependensi
```
npm install
```

3. Konfigurasi environment
	- Buat file `.env.local` pada root project.
	- Minimal variabel yang diperlukan:
	  - `NEXT_PUBLIC_SUPABASE_URL` — URL Supabase
	  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
	  - `SUPABASE_SERVICE_ROLE_KEY` — (opsional untuk tugas admin/server)

4. Menjalankan migrasi (opsi)
	- Jika menggunakan Supabase CLI: jalankan perintah untuk menjalankan/menerapkan SQL ke database Anda.
	- Alternatif: jalankan file SQL secara langsung ke database Postgres Anda:
```
# contoh menggunakan psql
# psql -h <host> -U <user> -d <db> -f supabase/migrations/20260528120000_06_combined_migrations.sql
```

Catatan: Saya telah menggabungkan semua migrasi ke satu file `supabase/migrations/20260528120000_06_combined_migrations.sql` dan memindahkan file migrasi lama ke `supabase/migrations/backup/` sebagai cadangan.

5. Menjalankan aplikasi (development)
```
npm run dev
```

6. Build & produksi
```
npm run build
npm run start
```

Kontak & kontribusi
- Jika Anda ingin menjalankan migrasi, tinjau file gabungan sebelum mengeksekusi pada database produksi.
- Untuk pertanyaan lebih lanjut, beritahu saya tindakan mana yang Anda inginkan (mis. hapus backup, rollback, atau jalankan migrasi otomatis).


