import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
});

export const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["super_admin", "admin", "karyawan"]).default("karyawan"),
  nama: z.string().optional(),
});

export const updateUserSchema = z.object({
  nama: z.string().optional(),
  role: z.enum(["super_admin", "admin", "karyawan"]).optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
});

export const prakiraanSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  slug: z.string().optional(),
  explanation: z.string().optional(),
  waktu_mulai: z.string().optional(),
  waktu_berakhir: z.string().optional(),
  category_id: z.string().uuid().optional(),
  display_type: z.enum(["gambar_saja", "gambar_teks", "gambar_galeri"]).optional(),
  url: z.string().optional(),
  next_url: z.string().optional(),
  next_explanation: z.string().optional(),
  next_waktu_mulai: z.string().optional(),
  next_waktu_berakhir: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
  prioritas: z.number().int().optional(),
});

export const bukuTamuSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  no_telepon: z.string().min(1, "No telepon harus diisi"),
  instansi: z.string().optional(),
  keperluan: z.string().min(1, "Keperluan harus diisi"),
});

export const layananCardSchema = z.object({
  nama_layanan: z.string().min(1, "Nama layanan harus diisi"),
  deskripsi: z.string().optional(),
  url_google_form: z.string().optional(),
  cover_url: z.string().optional(),
});

export const strukturOrganisasiSchema = z.object({
  jabatan: z.string().min(1, "Jabatan harus diisi"),
  nama: z.string().optional(),
  inisial: z.string().optional(),
  deskripsi: z.string().optional(),
  urutan: z.number().int().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini harus diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});
