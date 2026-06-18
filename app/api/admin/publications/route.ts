import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { uploadFile } from "@/lib/upload";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, notFound, serverError } from "@/lib/response";
import type { Publication } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function handleDbError(error: any) {
  const msg = String(error?.message || error);
  if (msg.includes("Could not find the table") || msg.includes("does not exist")) {
    return NextResponse.json({
      success: false,
      message: "Tabel publications belum dibuat di database. Jalankan migration SQL di Supabase dashboard.",
    }, { status: 500 });
  }
  return null;
}

export async function GET() {
  try {
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      const dbErr = handleDbError(error);
      if (dbErr) return dbErr;
      throw error;
    }
    return ok(data as Publication[]);
  } catch (error) {
    const dbErr = handleDbError(error);
    if (dbErr) return dbErr;
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const supabase: any = getSupabaseAdmin();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const coverFile = form.get("coverFile") as File | null;
    const url = form.get("url")?.toString() || null;
    const coverUrl = form.get("coverUrl")?.toString() || null;
    const title = form.get("title")?.toString() || "";
    const description = form.get("description")?.toString() || "";
    const uploader = req.headers.get("x-auth-user-username") || form.get("uploader")?.toString() || null;

    let storedUrl = url;
    let filePath: string | null = null;
    if (file && file.size) {
      const result = await uploadFile(file, "publications");
      storedUrl = result.url;
      filePath = result.path;
    }

    let storedCoverUrl = coverUrl;
    if (coverFile && coverFile.size) {
      const result = await uploadFile(coverFile, "publications");
      storedCoverUrl = result.url;
    }

    if (!storedUrl) return badRequest("No file or url provided");

    const { data, error } = await supabase
      .from("publications")
      .insert({
        title,
        description,
        url: storedUrl,
        cover_url: storedCoverUrl,
        file_path: filePath,
        uploader: uploader || null,
      })
      .select()
      .single();

    if (error) {
      const dbErr = handleDbError(error);
      if (dbErr) return dbErr;
      throw error;
    }
    logActivity(req.headers.get("x-auth-user-id"), `Menambah publikasi: ${title}`, req.headers.get("x-auth-user-username"));
    return ok(data as Publication);
  } catch (error) {
    const dbErr = handleDbError(error);
    if (dbErr) return dbErr;
    return serverError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequest("id required");

    const supabase: any = getSupabaseAdmin();

    // Delete storage file if it exists
    const { data: existing, error: existingError } = await supabase
      .from("publications")
      .select("file_path")
      .eq("id", id)
      .single();

    if (existingError) {
      const dbErr = handleDbError(existingError);
      if (dbErr) return dbErr;
    }

    if (existing?.file_path) {
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
      await supabase.storage.from(bucket).remove([existing.file_path]).catch(() => {});
    }

    const { data, error } = await supabase
      .from("publications")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const dbErr = handleDbError(error);
      if (dbErr) return dbErr;
      if (error.message?.includes("not found") || error.code === "PGRST116") {
        return notFound();
      }
      throw error;
    }
    if (!data) return notFound();

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus publikasi: ${data?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as Publication);
  } catch (error) {
    const dbErr = handleDbError(error);
    if (dbErr) return dbErr;
    return serverError(error);
  }
}
