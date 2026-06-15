# Ringkasan Project BMKG Maritim Tegal

## 1. Informasi Umum Project

| Aspek | Detail |
|-------|--------|
| Nama Project | BMKG Maritim Tegal |
| Nama Folder | BMKG-Maritim-Tegal |
| Deskripsi | Portal informasi cuaca maritim dan layanan publik berbasis web untuk Stasiun Meteorologi Maritim Tegal – BMKG. Menyediakan prakiraan cuaca, informasi gempa, layanan publik, buku tamu, dan panel admin untuk manajemen konten. |
| Tujuan Project | Menjadi pusat informasi digital BMKG Maritim Tegal yang menyediakan data cuaca maritim secara real-time, layanan publik berbasis formulir, dan sistem informasi display digital. |
| Target Pengguna | Masyarakat umum (pengunjung web), pegawai/karyawan BMKG, admin dan super admin BMKG |
| Bahasa Pemrograman | TypeScript, JavaScript, SQL |
| Tipe Project | Web Application (Next.js Fullstack) |

### Fitur Utama

- Halaman publik (Home, About, Prakiraan Cuaca, Layanan, Kegiatan, Buku Tamu, Kontak)
- Informasi cuaca real-time dari BMKG dan OpenWeatherMap
- Informasi gempa bumi terkini dari BMKG TEWS
- Formulir layanan publik (berbayar dan gratis/nol rupiah)
- Buku tamu dengan fitur foto kamera
- Panel admin CMS untuk mengelola konten website
- Display digital otomatis (slideshow) untuk monitor informasi publik
- Manajemen pengguna dengan role-based access control (RBAC)
- Sistem autentikasi custom (token-based)

---

## 2. Teknologi yang Digunakan

| Kategori | Teknologi | Versi |
|----------|-----------|-------|
| Framework Frontend | Next.js (App Router) | ^16.2.6 |
| Bahasa Frontend | TypeScript + React | ^19.2.6 |
| CSS Framework | Tailwind CSS | 3.3.3 |
| UI Component Library | shadcn/ui (Radix UI) | - |
| Backend / API | Next.js API Routes (Node.js) | - |
| Database | Supabase (PostgreSQL) | - |
| Authentication | Custom (bcryptjs + SHA256 HMAC token) | bcryptjs ^3.0.3 |
| Storage | Supabase Storage + Local File System | - |
| State Management | React Context + useState | - |
| Form Validation | React Hook Form + Zod | ^7.76.1 / ^3.23.8 |
| Styling Utility | clsx + tailwind-merge + class-variance-authority | - |
| Animasi | Framer Motion | ^12.40.0 |
| Chart | Recharts | ^2.12.7 |
| Icons | Lucide React | ^0.446.0 |
| Rich Text Editor | React Quill | ^2.0.0 / ^3.8.3 |
| PDF Export | jsPDF + jsPDF-AutoTable | ^4.2.1 / ^5.0.8 |
| Date Utility | date-fns | ^3.6.0 |
| Alert/Modal | SweetAlert2 | ^11.26.25 |
| Toast Notification | Sonner | ^1.5.0 |
| HTML Parsing | Cheerio | ^1.0.0-rc.12 |
| WebSocket Support (Node) | ws | ^8.21.0 |
| Carousel | Embla Carousel React | ^8.3.0 |
| Webcam | React Webcam | ^7.2.0 |
| OTP Input | Input OTP | ^1.2.4 |
| Theme | next-themes | ^0.4.0 |
| Linter | ESLint (Next.js) | 8.49.0 |
| Package Manager | npm | - |

---

## 3. Struktur Project

```
BMKG-Maritim-Tegal/
├── app/                          # Next.js App Router (pages + API)
│   ├── about/                    # Halaman About, Visi-Misi, Struktur Organisasi
│   ├── admin/                    # Panel admin (dashboard, managers, settings)
│   ├── api/                      # API Routes (admin, submit, bmkg, weather)
│   ├── buku_tamu/                # Halaman publik buku tamu
│   ├── display/                  # Halaman display digital (slideshow)
│   ├── kegiatan/                 # Halaman publik kegiatan
│   ├── kontak/                   # Halaman publik kontak
│   ├── layanan/                  # Halaman publik layanan
│   ├── prakiraan/                # Halaman publik prakiraan cuaca
│   ├── globals.css               # Global styles (Tailwind)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Halaman utama (Home)
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components (~45+)
│   ├── modals/                   # Modal components (BukuTamuModal, PrakiraanModal)
│   ├── Navbar.tsx                # Navigasi utama
│   ├── Footer.tsx                # Footer website
│   ├── HeroSection.tsx           # Hero section home
│   ├── HeroBackgroundSlideshow.tsx
│   ├── PrakiraanSection.tsx      # Section prakiraan cuaca
│   ├── LayananSection.tsx        # Section layanan publik
│   ├── KegiatanSection.tsx       # Section dokumentasi kegiatan
│   ├── BuletinSection.tsx        # Section publikasi/buletin
│   ├── EarthquakeCard.tsx        # Kartu info gempa
│   ├── MaritimeWeatherCard.tsx   # Kartu cuaca maritim
│   ├── ContactSection.tsx        # Section kontak
│   ├── AboutSection.tsx          # Section about
│   ├── InformasiLainnyaSection.tsx
│   ├── WhatsAppFloating.tsx      # Tombol WhatsApp mengambang
│   ├── DisableDevTools.tsx       # Proteksi dev tools
│   └── AdminRealtimeProvider.tsx # Context realtime admin
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Auth functions (hash, verify, token)
│   ├── supabaseBrowser.ts        # Supabase browser client singleton
│   ├── utils.ts                  # Utility (cn function)
│   └── sweetalert.ts             # SweetAlert2 helpers
├── hooks/                        # Custom React hooks
│   ├── use-toast.ts              # Hook notifikasi
│   └── useBmkgForecast.ts        # Hook cuaca BMKG (file kosong)
├── data/                         # Data JSON lokal
│   ├── publications.json         # Data publikasi/buletin
│   ├── pamflets.json             # Data pamflet display
│   └── struktur_organisasi.json  # Data struktur organisasi (fallback)
├── types/                        # TypeScript declarations
│   └── cheerio.d.ts              # Type declaration for cheerio
├── supabase/                     # Database migrations
│   ├── migrations/               # File migrasi SQL (.sql)
│   └── migrations/backup/        # Backup migrasi awal
├── public/                       # Static assets
├── test-files/                   # File pengujian
├── .env.local                    # Environment variables (rahasia)
├── next.config.js                # Konfigurasi Next.js
├── tailwind.config.ts            # Konfigurasi Tailwind CSS
├── tsconfig.json                 # Konfigurasi TypeScript
├── postcss.config.js             # Konfigurasi PostCSS
├── netlify.toml                  # Konfigurasi deployment Netlify
├── components.json               # Konfigurasi shadcn/ui
├── proxy.ts                      # Middleware autentikasi admin
├── package.json                  # Dependencies
└── .eslintrc.json                # Konfigurasi ESLint
```

---

## 4. Arsitektur Sistem

### Alur Aplikasi

1. **Publik**: Pengunjung mengakses halaman publik (Home, About, Prakiraan, Layanan, Kegiatan, Buku Tamu, Kontak). Data diambil dari Supabase via API Routes Next.js yang menggunakan service role key atau anon key.

2. **Admin**: Admin login via `/admin/login`, mendapatkan token yang disimpan di sessionStorage. Setiap request ke `/api/admin/*` (write operations) menyertakan token di header Authorization. Token diverifikasi di `proxy.ts` middleware.

3. **Display**: Halaman `/display` untuk monitor informasi publik. Menampilkan slideshow pamflet otomatis dengan data cuaca dan gempa real-time.

### Frontend ke Backend

- **Client Components** (`"use client"`) melakukan fetch ke API Routes internal (`/api/...`)
- **API Routes** menggunakan Supabase client (biasanya dengan service role key) untuk query/insert ke database
- Beberapa data disimpan di file JSON lokal (`data/`) untuk publikasi dan pamflet
- API Routes juga memproksi data dari BMKG dan OpenWeatherMap

### Koneksi Database

- Menggunakan `@supabase/supabase-js` untuk koneksi ke Supabase PostgreSQL
- Dua mode koneksi:
  - **Browser client**: anon key (read-only untuk publik)
  - **Server API Routes**: service role key (bypass RLS, akses penuh)
- File upload menggunakan Supabase Storage

### Autentikasi

- Custom authentication (bukan Supabase Auth)
- Login via `/api/admin/login`:
  1. Validasi username/password dari tabel `users`
  2. Password diverifikasi dengan bcryptjs (mendukung migrasi dari plain text)
  3. Session token dibuat dengan format: `base64(userId:role:random:timestamp:sha256Signature)`
  4. Token expiry: 24 jam
  5. Token disimpan di `sessionStorage` pada browser
- Middleware `proxy.ts` memvalidasi token untuk semua write operations ke `/api/admin/*`

### Integrasi Pihak Ketiga

| Integrasi | Jenis | Deskripsi |
|-----------|-------|-----------|
| BMKG API | Eksternal | `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=33.76.01.1001` - Prakiraan cuaca Kota Tegal |
| BMKG TEWS | Eksternal | `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json` - Informasi gempa terkini |
| OpenWeatherMap | Eksternal | `https://api.openweathermap.org/data/2.5/weather` - Fallback cuaca (memerlukan API key) |
| YouTube | Embed | Pemutaran video YouTube di display dan kegiatan |
| Google Maps | Embed | Peta lokasi di halaman kontak |
| Supabase | Backend | Database, Storage, Realtime subscriptions |
| Netlify | Hosting | Deployment via `@netlify/plugin-nextjs` |

---

## 5. Database

### Daftar Tabel

| No | Nama Tabel | Fungsi |
|----|-----------|--------|
| 1 | `admin_users` | Mapping user_id ke admin (sistem lama, masih digunakan beberapa RLS policy) |
| 2 | `users` | Data pengguna admin/karyawan (RBAC utama) |
| 3 | `buku_tamu` | Entri buku tamu dari pengunjung |
| 4 | `layanan_berbayar` | Pendaftaran layanan berbayar |
| 5 | `layanan_nol_rupiah` | Pendaftaran layanan gratis |
| 6 | `layanan_cards` | Kartu informasi layanan publik |
| 7 | `hero_images` | Gambar slider hero section |
| 8 | `prakiraan_images` | Kartu informasi prakiraan cuaca |
| 9 | `prakiraan_categories` | Kategori prakiraan cuaca |
| 10 | `kegiatan_documents` | Dokumentasi kegiatan |
| 11 | `login_logs` | Log masuk pengguna admin |
| 12 | `struktur_organisasi` | Data struktur organisasi |

### Relasi Antar Tabel

```
users.id ───────────── login_logs.user_id (FK, ON DELETE SET NULL)
prakiraan_categories.id ── prakiraan_images.category_id (FK, ON DELETE SET NULL)
users.id ──< (referenced by) admin_users.user_id (FK)
users.role ── (constraint: 'admin', 'super_admin', 'karyawan')
```

### Detail Tabel

#### `users`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | ID unik |
| username | text | UNIQUE, NOT NULL | Username login |
| password | text | NOT NULL | Hash bcrypt ($2a$...) |
| role | text | NOT NULL, CHECK IN ('admin','super_admin','karyawan') | Role pengguna |
| nama | text | nullable | Nama lengkap |
| is_active | boolean | DEFAULT true | Status aktif |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

#### `prakiraan_images`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid | PK |
| title | text | Judul prakiraan |
| url | text | URL gambar utama |
| explanation | text | Penjelasan (rich text) |
| uploader | text | Nama pengupload |
| is_active | boolean | Status aktif |
| slug | text | Slug untuk URL (UNIQUE via index) |
| category_id | uuid | FK ke prakiraan_categories |
| waktu_mulai | timestamptz | Jadwal mulai tayang |
| waktu_berakhir | timestamptz | Jadwal berakhir tayang |
| display_type | text | CHECK: gambar_saja/gambar_teks/gambar_galeri |
| gallery_images | jsonb | Array URL gambar galeri |
| next_url | text | URL prakiraan berikutnya |
| next_explanation | text | Penjelasan prakiraan berikutnya |
| next_waktu_mulai | timestamptz | Jadwal mulai berikutnya |
| next_waktu_berakhir | timestamptz | Jadwal berakhir berikutnya |
| prioritas | integer | DEFAULT 1 |

#### `buku_tamu`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid | PK |
| nama | text | Nama pengunjung |
| email | text | Email |
| no_telepon | text | Nomor telepon |
| instansi | text | Instansi |
| keperluan | text | Keperluan kunjungan |
| foto_url | text | URL foto |
| foto_data | text | Data base64 foto |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `layanan_berbayar` / `layanan_nol_rupiah`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid | PK |
| email | text | Email pendaftar |
| nama_lengkap | text | Nama lengkap |
| alamat | text | Alamat |
| instansi | text | Instansi (opsional) |
| no_hp | text | Nomor HP |
| status | text | DEFAULT 'pending' |
| ktp_file_path | text | Path file KTP |
| surat_file_path | text | Path file surat |
| form_file_path | text | Path file formulir |
| *(nol_rupiah only)* tipe | text | Tipe layanan |
| *(nol_rupiah only)* photo_path | text | Path foto |

#### `login_logs`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK ke users (ON DELETE SET NULL) |
| username | text | Username saat login |
| ip_address | text | Alamat IP |
| user_agent | text | User agent browser |
| aktivitas | text | DEFAULT 'login' |
| created_at | timestamptz | |

#### `hero_images`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid | PK |
| name | text | Nama gambar |
| url | text | URL gambar |
| order_index | integer | Urutan tampil |
| is_active | boolean | Status aktif |

#### `struktur_organisasi`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid | PK |
| jabatan | text | Nama jabatan |
| nama | text | Nama pejabat |
| inisial | text | Inisial/foto |
| deskripsi | text | Deskripsi tugas |
| urutan | integer | Urutan tampil |

#### `kegiatan_documents`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid | PK |
| title | text | Judul dokumen |
| description | text | Deskripsi |
| category | text | Kategori |
| url | text | URL file |
| file_path | text | Path file |
| file_type | text | Tipe file |
| event_date | date | Tanggal kegiatan |
| is_active | boolean | Status aktif |
| image_urls | jsonb | Array URL gambar (multiple) |
| youtube_url | text | URL YouTube |

### Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌───────────────────┐
│    users    │       │  login_logs       │
│─────────────│       │───────────────────│
│ id (PK)     │──1:N──│ user_id (FK)      │
│ username    │       │ username          │
│ password    │       │ ip_address        │
│ role        │       │ user_agent        │
│ nama        │       │ aktivitas         │
│ is_active   │       │ created_at        │
│ created_at  │       └───────────────────┘
└─────────────┘
       │
       │ 1:1
       │
┌──────┴──────┐
│ admin_users │
│─────────────│
│ user_id (FK)│
│ username    │
└─────────────┘

┌──────────────────┐      ┌─────────────────────────┐
│ prakiraan_        │      │ prakiraan_images        │
│ categories        │      │─────────────────────────│
│──────────────────│      │ id (PK)                 │
│ id (PK)          │──1:N─│ category_id (FK)        │
│ name             │      │ title                   │
│ slug (UNIQUE)    │      │ url                     │
│ description      │      │ slug (index)            │
│ icon             │      │ explanation             │
└──────────────────┘      │ waktu_mulai             │
                          │ waktu_berakhir          │
┌──────────────────┐      │ display_type            │
│ struktur_         │      │ gallery_images (jsonb)  │
│ organisasi       │      │ prioritas               │
│──────────────────│      │ next_url                │
│ id (PK)          │      └─────────────────────────┘
│ jabatan          │
│ nama             │      ┌─────────────────────────┐
│ inisial          │      │ kegiatan_documents      │
│ deskripsi        │      │─────────────────────────│
│ urutan           │      │ id (PK)                 │
└──────────────────┘      │ title                   │
                          │ url                     │
┌──────────────────┐      │ image_urls (jsonb)      │
│  hero_images     │      │ youtube_url             │
│──────────────────│      │ event_date              │
│ id (PK)          │      └─────────────────────────┘
│ name             │
│ url              │      ┌─────────────────────────┐
│ order_index      │      │ layanan_cards           │
│ is_active        │      │─────────────────────────│
└──────────────────┘      │ id (PK)                 │
                          │ nama_layanan            │
                          │ deskripsi               │
                          │ url_google_form         │
                          │ cover_url               │
                          └─────────────────────────┘
```

---

## 6. Role dan Hak Akses

| Role | Hak Akses | Fitur | Pembatasan |
|------|-----------|-------|------------|
| `super_admin` | Akses penuh ke semua fitur admin | Dashboard, semua manager, Manajemen Karyawan, History Login, Pengaturan, Struktur Organisasi | Tidak bisa dihapus dari UI |
| `admin` | Akses ke semua fitur kecuali Manajemen Karyawan | Dashboard, semua manager informasi, History Login, Pengaturan, Struktur Organisasi | Tidak bisa mengakses `/admin/users` (dicek di layout) |
| `karyawan` | Akses terbatas | Dashboard, History Login (read-only), Pengaturan (ganti password sendiri) | Menu "Administrasi" disembunyikan. Tidak bisa menghapus data. |
| `anon` (public) | Read-only untuk data publik + insert form | Melihat halaman publik, mengisi buku tamu, mendaftar layanan | Tidak bisa mengakses halaman admin |

---

## 7. Fitur Utama

### Halaman Publik

| Fitur | Deskripsi |
|-------|-----------|
| **Home** | Hero section dengan animasi teks, slideshow background, informasi cuaca, gempa, dan prakiraan |
| **About** | Informasi tentang BMKG Maritim Tegal, visi-misi, struktur organisasi |
| **Prakiraan Cuaca** | Kartu prakiraan cuaca per kategori (Kota Tegal, Pelabuhan, Maritim, Pasang Surut) dengan filter kategori, status aktif/jadwal/kadaluwarsa |
| **Detail Prakiraan** | Halaman detail dengan 3 mode tampilan: gambar saja, gambar+teks, gambar+galeri+teks |
| **Layanan** | Kartu layanan publik dengan link Google Form |
| **Kegiatan** | Galeri dokumentasi kegiatan dengan lightbox, embed YouTube |
| **Buku Tamu** | Formulir buku tamu dengan kamera untuk foto selfie |
| **Kontak** | Informasi kontak, alamat, Google Maps, jam layanan |

### Panel Admin

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Ringkasan statistik (buku tamu, prakiraan aktif/tidak aktif, karyawan), akses cepat ke manager |
| **Prakiraan Manager** | CRUD prakiraan images + categories, filter (kategori, status, tanggal), rich text editor, gallery images, jadwal tayang, auto-switch |
| **Publikasi / Buletin** | Upload dan kelola file publikasi/buletin dengan cover image |
| **Dokumentasi Kegiatan** | Upload multiple files, embed YouTube URL, edit inline |
| **Slider Home** | Upload gambar/video untuk hero slideshow, drag reorder, toggle aktif |
| **Struktur Organisasi** | CRUD jabatan, upload foto, urutan tampil |
| **Data Buku Tamu** | Lihat, cari, export PDF, backup/restore JSON, hapus bulk |
| **Kelola Layanan** | CRUD kartu layanan dengan cover image dan link Google Form |
| **Kelola Display** | Upload pamflet untuk display digital |
| **Manajemen Karyawan** | CRUD pengguna (username, password, role, status aktif) |
| **History Login** | Riwayat login dengan filter, search, sort, backup/restore, hapus bulk |
| **Pengaturan** | Ganti password akun sendiri |

### Fitur Display Digital

| Fitur | Deskripsi |
|-------|-----------|
| **Slideshow Pamflet** | Tampilan layar penuh gambar/video/YouTube dengan kontrol play/pause, navigasi slide, auto-play |
| **Cuaca Real-time** | Menampilkan suhu, kelembapan, kecepatan angin (knot), arah angin dari BMKG API |
| **Info Gempa** | Shakemap, magnitudo, kedalaman, koordinat, wilayah, potensi tsunami, skala MMI dari BMKG TEWS |
| **Volume Control** | Kontrol mute/unmute, volume slider untuk video |

### Fitur Lainnya

| Fitur | Deskripsi |
|-------|-----------|
| **Real-time Stats** | Admin dashboard stats update real-time via Supabase Realtime subscriptions |
| **Export PDF** | Buku tamu bisa diexport ke PDF dengan foto |
| **Backup/Restore** | Buku tamu dan login history bisa dibackup/restore dalam format JSON |
| **WhatsApp Floating** | Tombol WhatsApp mengambang di semua halaman publik |
| **Disable DevTools** | Proteksi sederhana terhadap DevTools browser |

---

## 8. API dan Integrasi

### API Internal (Next.js API Routes)

#### Publik

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/bmkg/tegal` | GET | Proxy prakiraan cuaca BMKG untuk Kota Tegal (dengan caching) |
| `/api/weather` | GET | Proxy cuaca dari BMKG atau OpenWeatherMap (dengan caching) |
| `/api/struktur-organisasi` | GET | Data struktur organisasi |
| `/api/prakiraan/[slug]` | GET | Detail prakiraan berdasarkan slug |
| `/api/publications` | GET | Data publikasi/buletin |
| `/api/submit/buku-tamu` | POST | Submit buku tamu (publik) |
| `/api/submit/layanan-berbayar` | POST | Submit layanan berbayar (publik) |
| `/api/submit/layanan-nol-rupiah` | POST | Submit layanan nol rupiah (publik) |

#### Admin (membutuhkan autentikasi untuk write operations)

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/admin/login` | POST | Login admin (publik - tanpa auth) |
| `/api/admin/change-password` | POST | Ganti password |
| `/api/admin/upload` | POST | Upload file ke Supabase Storage |
| `/api/admin/hero-images` | GET, POST | CRUD hero images |
| `/api/admin/hero-images/[id]` | DELETE | Hapus hero image |
| `/api/admin/prakiraan-images` | GET, POST | CRUD prakiraan images |
| `/api/admin/prakiraan-images/[id]` | GET, PUT, DELETE | Detail/update/hapus prakiraan |
| `/api/admin/prakiraan-images/auto-switch` | POST | Auto-switch prakiraan |
| `/api/admin/prakiraan-categories` | GET, POST | CRUD kategori prakiraan |
| `/api/admin/prakiraan-categories/[id]` | PUT, DELETE | Update/hapus kategori |
| `/api/admin/kegiatan-documents` | GET, POST | CRUD kegiatan documents |
| `/api/admin/kegiatan-documents/[id]` | PUT, DELETE | Update/hapus kegiatan |
| `/api/admin/layanan-cards` | GET, POST | CRUD layanan cards |
| `/api/admin/layanan-cards/[id]` | PUT, DELETE | Update/hapus layanan card |
| `/api/admin/layanan-berbayar` | GET | Daftar layanan berbayar |
| `/api/admin/layanan-berbayar/[id]` | GET | Detail layanan berbayar |
| `/api/admin/layanan-nol-rupiah` | GET | Daftar layanan nol rupiah |
| `/api/admin/layanan-nol-rupiah/[id]` | GET | Detail layanan nol rupiah |
| `/api/admin/buku-tamu` | GET | Daftar buku tamu |
| `/api/admin/buku-tamu/[id]` | DELETE | Hapus buku tamu |
| `/api/admin/buku-tamu/backup` | GET | Backup buku tamu ke JSON |
| `/api/admin/buku-tamu/restore` | POST | Restore buku tamu dari JSON |
| `/api/admin/users` | GET, POST | CRUD users |
| `/api/admin/users/[id]` | PUT, DELETE | Update/hapus user |
| `/api/admin/login-logs` | GET | Daftar log login |
| `/api/admin/login-logs/backup` | GET | Backup log login |
| `/api/admin/login-logs/restore` | POST | Restore log login |
| `/api/admin/pamflets` | GET, POST, DELETE | CRUD pamflet display (local JSON) |
| `/api/admin/publications` | GET, POST, DELETE | CRUD publikasi (local JSON) |
| `/api/admin/struktur-organisasi` | GET, POST | CRUD struktur organisasi |
| `/api/admin/struktur-organisasi/[id]` | PUT, DELETE | Update/hapus struktur |
| `/api/admin/stats/buku-tamu` | GET | Count buku tamu |
| `/api/admin/stats/layanan-berbayar` | GET | Count layanan berbayar |
| `/api/admin/stats/layanan-nol-rupiah` | GET | Count layanan nol rupiah |
| `/api/admin/stats/users` | GET | Count users aktif |
| `/api/admin/stats/prakiraan` | GET | Count prakiraan aktif/tidak aktif |

### API Eksternal

| Endpoint | Fungsi |
|----------|--------|
| `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=33.76.01.1001` | Prakiraan cuaca BMKG untuk Kelurahan Pesurungan Kidul, Tegal |
| `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json` | Data gempa bumi terkini (M ≥ 5.0) |
| `https://api.openweathermap.org/data/2.5/weather` | Data cuaca OpenWeatherMap (fallback) |
| YouTube Iframe API | Embed video YouTube |

---

## 9. Environment Variables

| Variabel | Fungsi | Wajib |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | Ya |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key untuk Supabase client browser | Ya |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key untuk akses server-side (bypass RLS) | Ya (untuk admin) |
| `SUPABASE_STORAGE_BUCKET` | Nama bucket Supabase Storage (default: "public") | Tidak |
| `TOKEN_SECRET` | Secret key untuk HMAC session token (default: hardcoded) | Tidak |
| `BMKG_CACHE_TTL` | Cache TTL BMKG API dalam ms (default: 600000 = 10 menit) | Tidak |
| `BMKG_API_URL` | URL API BMKG kustom | Tidak |
| `OPENWEATHER_API_KEY` | API key OpenWeatherMap | Tidak |

---

## 10. Dependency Penting

### Production Dependencies

| Package | Kegunaan |
|---------|----------|
| `next` | Framework React fullstack |
| `react` / `react-dom` | Library UI |
| `@supabase/supabase-js` | Client Supabase database, storage, realtime |
| `@supabase/auth-helpers-nextjs` | Helper autentikasi Supabase untuk Next.js |
| `typescript` | Type safety |
| `tailwindcss` | Utility-first CSS framework |
| `@radix-ui/*` (~30 packages) | Headless UI primitives (dialog, dropdown, popover, dll) |
| `lucide-react` | Icon library |
| `framer-motion` | Animasi React |
| `recharts` | Charting library |
| `react-hook-form` | Form management |
| `zod` | Validasi schema |
| `date-fns` | Manipulasi tanggal |
| `bcryptjs` | Hashing password |
| `jspdf` / `jspdf-autotable` | Generate PDF + auto-table |
| `sweetalert2` / `sweetalert2-react-content` | Alert/modal popup |
| `sonner` | Toast notifications |
| `react-quill` / `react-quill-new` | Rich text editor |
| `react-webcam` | Akses kamera browser |
| `embla-carousel-react` | Carousel/slider |
| `cmdk` | Command menu |
| `input-otp` | OTP input |
| `vaul` | Drawer component |
| `react-day-picker` | Date picker |
| `react-resizable-panels` | Resizable panels |
| `clsx` / `tailwind-merge` / `class-variance-authority` | Utility CSS class management |
| `next-themes` | Dark/light mode |
| `next-auth` | Autentikasi (terinstal tapi tidak digunakan) |
| `cheerio` | HTML parsing (terinstal tapi tidak digunakan langsung) |
| `ws` | WebSocket for Node.js (Supabase realtime) |
| `dotenv` | Load environment variables |

### Dev Dependencies

| Package | Kegunaan |
|---------|----------|
| `eslint` / `eslint-config-next` | Linter |
| `postcss` / `autoprefixer` | CSS processing |
| `@types/node` / `@types/react` / `@types/react-dom` | TypeScript types |
| `tailwindcss-animate` | Animasi Tailwind |

---

## 11. Keamanan

### Authentication

- **Custom token-based authentication** (bukan Supabase Auth atau NextAuth.js)
- Password di-hash dengan **bcryptjs** (salt rounds: 12)
- Mendukung migrasi password dari plain text ke bcrypt saat login pertama
- Session token dibuat dengan format: `base64URL(userId:role:random:timestamp:sha256HMAC)`
- Token expiry: **24 jam** sejak pembuatan
- Token disimpan di `sessionStorage` browser (bukan cookie)
- Setiap request write ke `/api/admin/*` menyertakan token di header `Authorization: Bearer <token>`

### Authorization

- **Role-based**: `super_admin`, `admin`, `karyawan`
- Pengecekan role di frontend (layout admin) untuk menyembunyikan menu
- Pengecekan role di backend untuk operasi sensitif (manajemen users)
- Route `/admin/users` hanya bisa diakses oleh `admin` dan `super_admin`

### Middleware (proxy.ts)

- File `proxy.ts` bertindak sebagai middleware untuk semua request `/api/admin/:path*`
- **GET requests**: Diizinkan tanpa autentikasi (untuk frontend publik)
- **Write operations** (POST/PUT/PATCH/DELETE): Wajib menyertakan Bearer token
- Token diverifikasi (format, signature HMAC, expiry)
- Jika valid, header `x-auth-user` dan `x-auth-role` ditambahkan ke request
- Route `/api/admin/login` dikecualikan dari autentikasi

### Supabase RLS (Row Level Security)

Semua tabel memiliki RLS enabled dengan policy:

| Tabel | Policy SELECT | Policy INSERT | Policy UPDATE/DELETE |
|-------|--------------|--------------|---------------------|
| `users` | Authenticated (read non-sensitive) | Admin/Super Admin only | Admin/Super Admin only |
| `buku_tamu` | Admin only | Anyone (anon + authenticated) | - |
| `layanan_berbayar` | Admin only | Anyone | - |
| `layanan_nol_rupiah` | Admin only | Anyone | - |
| `hero_images` | Public (active only) | Admin only | Admin only |
| `prakiraan_images` | Public (active only) | Admin only | Admin only |
| `prakiraan_categories` | Public | Admin/Super Admin | Admin/Super Admin |
| `kegiatan_documents` | Public (active only) | Admin only | Admin only |
| `login_logs` | Admin/Super Admin | Anyone | Admin/Super Admin |
| `struktur_organisasi` | Public | Admin only | Admin only |
| `layanan_cards` | Public | Admin only | Admin only |

Catatan: Service role key **bypass** semua RLS policy. API Routes admin menggunakan service role key.

### Proteksi Route

- Admin layout memeriksa keberadaan token dan role pengguna
- Jika tidak login, redirect ke `/admin/login`
- Admin layout melakukan patch pada `window.fetch` untuk otomatis menyertakan Bearer token
- Jika role bukan admin/super_admin, halaman `/admin/users` di-block

### Validasi Input

- Server-side: Cek required fields di setiap API Route
- Client-side: React Hook Form + Zod untuk validasi form
- Password: Minimal 6 karakter untuk password baru

### Lainnya

- `DisableDevTools` component mencoba mempersulit akses DevTools
- `next.config.js` mengatur `images.unoptimized: true`
- Tidak ada proteksi CSRF (perlu improvement)
- File `.env.local` tidak di-commit (ada di `.gitignore`)

---

## 12. Deployment

### Menjalankan Project Lokal

```bash
# 1. Clone repository
git clone <repo-url>
cd BMKG-Maritim-Tegal

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Copy .env.local dan isi dengan kredensial Supabase:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY

# 4. Jalankan migrasi database
# Jalankan SQL dari supabase/migrations/ di Supabase SQL Editor
# Urutan: combined migration -> migrasi tambahan sesuai timestamp

# 5. Jalankan development server
npm run dev
```

### Build Production

```bash
npm run build
npm run start
```

### Lint & Type Check

```bash
npm run lint      # ESLint
npm run typecheck # TypeScript check (tsc --noEmit)
```

### Deployment

Berdasarkan `netlify.toml`:

| Service | Konfigurasi |
|---------|-------------|
| **Netlify** | Build command: `npx next build`, Publish dir: `.next` |
| **Plugin** | `@netlify/plugin-nextjs` untuk Next.js on Netlify |

Project siap di-deploy ke Netlify dengan menghubungkan repository Git dan mengatur environment variables di dashboard Netlify.

---

## 13. Ringkasan Teknis

| Aspek | Detail |
|-------|--------|
| Nama Project | BMKG Maritim Tegal |
| Framework | Next.js (App Router) |
| Bahasa Pemrograman | TypeScript, JavaScript, SQL |
| Database | Supabase PostgreSQL (12 tabel) |
| Authentication | Custom (bcrypt + SHA256 HMAC token) |
| Hosting | Netlify (via @netlify/plugin-nextjs) |
| Storage | Supabase Storage + Local Filesystem |
| UI Library | shadcn/ui (Radix UI primitives) |
| CSS Framework | Tailwind CSS |
| Total Role | 3 (super_admin, admin, karyawan) + anon (public) |
| Total Tabel Database | 12 |
| Total API Routes (internal) | ~35+ endpoint |
| Integrasi Eksternal | BMKG API, BMKG TEWS, OpenWeatherMap, YouTube, Google Maps |
| Animasi | Framer Motion |
| Chart | Recharts |
| Form | React Hook Form + Zod |
| Rich Text | React Quill |
| PDF Export | jsPDF + AutoTable |

---

> **Catatan:** Dokumentasi ini dibuat berdasarkan analisis source code. Informasi yang tidak ditemukan pada source code ditandai atau tidak disertakan. Untuk environment variables yang bersifat rahasia, nilai tidak ditampilkan.
