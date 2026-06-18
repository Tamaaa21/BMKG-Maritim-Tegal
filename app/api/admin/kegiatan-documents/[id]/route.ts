import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { uploadMultipleFiles } from "@/lib/upload";
import { logActivity } from "@/lib/activity-log";
import { ok, serverError } from "@/lib/response";
import type { KegiatanDocument } from "@/lib/types";

export const runtime = "nodejs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase: any = getSupabaseAdmin();

    const { data: row } = await supabase
      .from("kegiatan_documents")
      .select("*")
      .eq("id", id)
      .single();

    try {
      if (row?.file_path) {
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
        await supabase.storage.from(bucket).remove([row.file_path]);
      }
    } catch (e) {
      console.warn("Failed to remove storage object", e);
    }

    const { data, error } = await supabase
      .from("kegiatan_documents")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user-id"), `Menghapus dokumentasi kegiatan: ${data?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as KegiatanDocument);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase: any = getSupabaseAdmin();

    let body: Record<string, unknown> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const files = form.getAll("files") as File[];
      const description = form.get("description");
      const event_date = form.get("event_date");
      const title = form.get("title");
      const youtube_url = form.get("youtube_url");

      if (title) body.title = title.toString();
      if (description) body.description = description.toString();
      if (event_date) body.event_date = event_date.toString();
      if (youtube_url !== null) body.youtube_url = youtube_url?.toString() || null;

      if (files.length > 0) {
        const uploaded = await uploadMultipleFiles(files, "kegiatan");
        const imageUrls = uploaded.map(u => u.url);
        const firstFile = uploaded[0];
        body.url = firstFile.url;
        body.file_path = firstFile.path;
        body.file_type = files[0].type;
        body.image_urls = imageUrls;
      }
    } else {
      body = await req.json();
    }

    const { data, error } = await supabase
      .from("kegiatan_documents")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user-id"), `Mengubah dokumentasi kegiatan: ${data?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as KegiatanDocument);
  } catch (error) {
    return serverError(error);
  }
}
