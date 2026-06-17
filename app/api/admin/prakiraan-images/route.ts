import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { uploadFile } from "@/lib/upload";
import { logActivity } from "@/lib/activity-log";
import { prakiraanSchema } from "@/lib/validation";
import { ok, badRequest, serverError } from "@/lib/response";
import type { PrakiraanImage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_DISPLAY_TYPES = ["gambar_saja", "gambar_teks", "gambar_galeri"];

export async function POST(req: Request) {
  try {
    const supabase: any = getSupabaseAdmin();
    const contentType = req.headers.get("content-type") || "";

    // JSON body: create entry from an existing URL (useful for default images)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const parsed = prakiraanSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest(parsed.error.errors.map(e => e.message).join(", "));
      }

      if (!parsed.data.url) return badRequest("No url provided");

      const insertData: Record<string, unknown> = {
        title: parsed.data.title,
        url: parsed.data.url,
      };
      if (parsed.data.explanation) insertData.explanation = parsed.data.explanation;
      if (parsed.data.slug) insertData.slug = parsed.data.slug;
      if (parsed.data.waktu_mulai) insertData.waktu_mulai = parsed.data.waktu_mulai;
      if (parsed.data.waktu_berakhir) insertData.waktu_berakhir = parsed.data.waktu_berakhir;
      if (parsed.data.category_id) insertData.category_id = parsed.data.category_id;
      if (parsed.data.display_type && VALID_DISPLAY_TYPES.includes(parsed.data.display_type)) {
        insertData.display_type = parsed.data.display_type;
      }
      if (parsed.data.next_url) insertData.next_url = parsed.data.next_url;
      if (parsed.data.next_explanation) insertData.next_explanation = parsed.data.next_explanation;
      if (parsed.data.next_waktu_mulai) insertData.next_waktu_mulai = parsed.data.next_waktu_mulai;
      if (parsed.data.next_waktu_berakhir) insertData.next_waktu_berakhir = parsed.data.next_waktu_berakhir;
      if (parsed.data.gallery_images) insertData.gallery_images = parsed.data.gallery_images;
      if (parsed.data.prioritas !== undefined) insertData.prioritas = parsed.data.prioritas;
      if (body.uploader) insertData.uploader = body.uploader;

      const { data: insertResult, error: insertError } = await supabase
        .from("prakiraan_images")
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;
      logActivity(req.headers.get("x-auth-user-id"), `Menambah prakiraan: ${parsed.data.title}`);
      return ok(insertResult as PrakiraanImage);
    }

    // Multipart form-data upload
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const nextFile = form.get("nextFile") as File | null;
    const title = form.get("title")?.toString() || file?.name || `prakiraan-${Date.now()}`;
    const explanation = form.get("explanation")?.toString() || null;
    const uploader = form.get("uploader")?.toString() || null;
    const waktuMulai = form.get("waktu_mulai")?.toString() || form.get("waktuMulai")?.toString() || null;
    const waktuBerakhir = form.get("waktu_berakhir")?.toString() || form.get("waktuBerakhir")?.toString() || null;
    const nextExplanation = form.get("next_explanation")?.toString() || null;
    const nextWaktuMulai = form.get("next_waktu_mulai")?.toString() || null;
    const nextWaktuBerakhir = form.get("next_waktu_berakhir")?.toString() || null;
    const displayType = form.get("display_type")?.toString() || null;
    const galleryImagesRaw = form.get("gallery_images")?.toString() || null;
    const prioritasRaw = form.get("prioritas")?.toString() || null;
    const slug = form.get("slug")?.toString() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const categoryId = form.get("category_id")?.toString() || null;

    if (!file) return badRequest("No file provided");

    const { url: publicUrl } = await uploadFile(file, "prakiraan");

    let nextPublicUrl: string | null = null;
    if (nextFile) {
      const result = await uploadFile(nextFile, "prakiraan");
      nextPublicUrl = result.url;
    }

    const insertData: Record<string, unknown> = { title, url: publicUrl, slug };
    if (categoryId) insertData.category_id = categoryId;
    if (explanation) insertData.explanation = explanation;
    if (uploader) insertData.uploader = uploader;
    if (waktuMulai) insertData.waktu_mulai = waktuMulai;
    if (waktuBerakhir) insertData.waktu_berakhir = waktuBerakhir;
    if (nextPublicUrl) insertData.next_url = nextPublicUrl;
    if (nextExplanation) insertData.next_explanation = nextExplanation;
    if (nextWaktuMulai) insertData.next_waktu_mulai = nextWaktuMulai;
    if (nextWaktuBerakhir) insertData.next_waktu_berakhir = nextWaktuBerakhir;
    if (displayType && VALID_DISPLAY_TYPES.includes(displayType)) insertData.display_type = displayType;
    if (galleryImagesRaw) {
      try { insertData.gallery_images = JSON.parse(galleryImagesRaw); } catch { /* ignore */ }
    }
    if (prioritasRaw) insertData.prioritas = parseInt(prioritasRaw, 10);

    const { data: insertResult, error: insertError } = await supabase
      .from("prakiraan_images")
      .insert(insertData)
      .select()
      .single();

    if (insertError) throw insertError;

    logActivity(req.headers.get("x-auth-user-id"), `Menambah prakiraan: ${title}`);
    return ok(insertResult as PrakiraanImage);
  } catch (error) {
    return serverError(error);
  }
}

export async function GET(req: Request) {
  try {
    const supabase: any = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const filterExpired = searchParams.get("filterExpired") === "true";
    const activeOnly = searchParams.get("activeOnly") === "true";

    let query = supabase.from("prakiraan_images").select(`*, category:category_id(*)`);

    const nowStr = new Date().toISOString();

    if (filterExpired || activeOnly) {
      query = query.or(`waktu_berakhir.is.null,waktu_berakhir.gt.${nowStr}`);
      query = query.or(`waktu_mulai.is.null,waktu_mulai.lte.${nowStr}`);
    }

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    return ok(data as PrakiraanImage[]);
  } catch (error) {
    return serverError(error);
  }
}
