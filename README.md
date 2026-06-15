# BMKG Maritim Tegal

Portal informasi cuaca maritim dan layanan publik berbasis Next.js untuk Stasiun Meteorologi Maritim Tegal – BMKG.

Dokumentasi lengkap: [ringkasan.md](./ringkasan.md)

## Teknologi Utama

- **Framework:** Next.js (React + TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend / Auth / DB:** Supabase (Postgres + RLS)
- **Animasi:** Framer Motion
- **Form:** React Hook Form + Zod

## Fitur Singkat

- Halaman publik (Home, About, Prakiraan, Layanan, Kegiatan, Buku Tamu, Kontak)
- Informasi cuaca real-time dari BMKG dan OpenWeatherMap
- Informasi gempa terkini dari BMKG TEWS
- Form layanan publik (berbayar / nol rupiah)
- Panel admin CMS (dashboard, prakiraan, publikasi, kegiatan, hero slider, users, dll)
- Display digital otomatis (slideshow untuk monitor informasi publik)

## Cara Install & Jalankan

### Prasyarat

Pastikan sudah terinstall:

| Software | Minimal Versi |
|----------|--------------|
| Node.js | 20.x LTS |
| npm | 9+ (bundle dengan Node.js) |

### Langkah-langkah

```bash
# 1. Clone repository
git clone <url-repository>
cd BMKG-Maritim-Tegal

# 2. Install semua dependency
npm install
```

### 3. Konfigurasi Environment

Buat file `.env.local` di root project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Database Migration

Jalankan semua file SQL di `supabase/migrations/` secara berurutan sesuai timestamp di Supabase SQL Editor atau via psql.

### 5. Jalankan Development

```bash
npm run dev
```

### 6. Build & Production

```bash
npm run build
npm run start
```

### 7. Lint & Type Check

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```

## Struktur Database

12 tabel utama: `users`, `buku_tamu`, `layanan_berbayar`, `layanan_nol_rupiah`, `layanan_cards`, `hero_images`, `prakiraan_images`, `prakiraan_categories`, `kegiatan_documents`, `login_logs`, `struktur_organisasi`, `admin_users`.

Lihat [ringkasan.md](./ringkasan.md#5-database) untuk detail skema dan ERD.

## Environment Variables

| Variabel | Wajib | Fungsi |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya | Service role key (bypass RLS) |
| `SUPABASE_STORAGE_BUCKET` | Tidak | Nama bucket storage |
| `TOKEN_SECRET` | Tidak | Secret HMAC token |
| `BMKG_CACHE_TTL` | Tidak | Cache TTL BMKG API |
| `OPENWEATHER_API_KEY` | Tidak | API key OpenWeatherMap |

## Deployment

Project siap di-deploy ke **Netlify** (lihat `netlify.toml`).

```bash
npx next build
```

## Role Pengguna

| Role | Akses |
|------|-------|
| `super_admin` | Full akses (termasuk manajemen users) |
| `admin` | Semua fitur kecuali manajemen users |
| `karyawan` | Terbatas (dashboard, history login, ganti password) |

## Dokumentasi Lengkap

Baca [ringkasan.md](./ringkasan.md) untuk dokumentasi project yang mencakup:

1. Informasi Umum Project
2. Teknologi yang Digunakan
3. Struktur Project
4. Arsitektur Sistem
5. Database (skema, relasi, ERD)
6. Role dan Hak Akses
7. Fitur Utama
8. API dan Integrasi
9. Environment Variables
10. Dependency Penting
11. Keamanan (auth, RLS, middleware, proteksi route)
12. Deployment


