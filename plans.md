Tentu, ini rencana pengembangan sistem (SOP & Fitur) untuk upgrade panel admin kamu. Rencana ini dirancang agar alur kerja (workflow) tetap rapi dan hak akses terjaga dengan aman.

---

## 1. Modul Manajemen Konten Prakiraan (Auto-Switch)

Fitur ini memastikan informasi di panel tetap *fresh* dengan sistem antrean (queue).

### Logika Pembaruan Otomatis

* **Sistem Antrean:** Setiap konten diberi atribut `expired_at`. Sistem akan menjalankan pengecekan: jika `waktu_sekarang > expired_at`, status konten menjadi *archived* dan sistem otomatis menampilkan konten aktif berikutnya berdasarkan urutan (ID atau Sort Order).
* **Opsi Tampilan (Display Modes):**
| Mode | Komponen yang Ditampilkan |
| --- | --- |
| **Gambar Saja** | Hanya menampilkan `image_1` (Fullscreen). |
| **Gambar + Teks** | Menampilkan `image_1` dengan overlay teks informasi utama. |
| **Gambar + Galeri** | Menampilkan `image_1` sebagai konten utama, dan `image_2`, `image_3`, dst. sebagai *thumbnail* atau *slider* di bawahnya. |



---

## 2. Manajemen Karyawan & Hak Akses (RBAC)

Sistem menggunakan *Role-Based Access Control* (RBAC) untuk membedakan antara **Super Admin** dan **Karyawan**.

### Tabel Hak Akses

| Fitur | Super Admin | Karyawan |
| --- | --- | --- |
| Tambah Karyawan Baru | ✅ Ya | ❌ Tidak |
| Hapus Data/Karyawan | ✅ Ya | ❌ Tidak |
| Upload Konten | ✅ Ya | ✅ Ya |
| Edit Konten | ✅ Ya | ✅ Ya |
| Ubah Role (Promosi ke Admin) | ✅ Ya | ❌ Tidak |

> **Catatan Teknis:** Di database, tambahkan kolom `role` pada tabel `users`. Jika `role == 'admin'`, maka tombol "Hapus" dan "Tambah User" akan di-disable atau disembunyikan dari UI.

---

## 3. Fitur History Login

Untuk memantau aktivitas dan keamanan akun.

### Data yang Dicatat:

Setiap kali ada user yang masuk, sistem akan menyimpan log ke tabel `login_histories`:

* **User ID:** Siapa yang login.
* **Timestamp:** Tanggal dan jam presisi.
* **IP Address:** Lokasi akses perangkat.
* **User Agent:** Perangkat yang digunakan (Contoh: Chrome on Windows).

---

## Alur Implementasi (Roadmap)

### Tahap 1: Struktur Database

Update tabel yang sudah ada atau buat tabel baru:

1. **Table `forecasts`:** Tambah kolom `display_type` (enum), `expired_at`, dan kolom array/relasi untuk gambar galeri.
2. **Table `users`:** Tambah kolom `role` (admin/karyawan).
3. **Table `login_logs`:** Buat baru untuk mencatat riwayat masuk.

### Tahap 2: Backend Logic

* Buat fungsi pengecekan kadaluwarsa (Cron Job atau Server-side check saat page load).
* Buat Middleware untuk membatasi akses (Contoh: Karyawan dilarang mengakses route `POST /delete-item`).

### Tahap 3: UI/UX Panel Admin

* **Form Upload:** Tambahkan dropdown untuk memilih "Mode Tampilan" (Gambar/Teks/Galeri).
* **Dashboard History:** Halaman khusus bagi Admin untuk melihat daftar siapa saja yang login belakangan ini.

---

