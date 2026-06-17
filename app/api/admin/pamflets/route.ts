import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { uploadFile } from "@/lib/upload";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, notFound, serverError } from "@/lib/response";
import type { Pamflet } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function handleDbError(error: any) {
  const msg = String(error?.message || error);
  if (msg.includes("Could not find the table") || msg.includes("does not exist")) {
    return NextResponse.json({
      success: false,
      message: "Tabel pamflets belum dibuat di database. Jalankan migration SQL di Supabase dashboard.",
    }, { status: 500 });
  }
  return null;
}

export async function GET() {
  try {
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("pamflets")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      const dbErr = handleDbError(error);
      if (dbErr) return dbErr;
      throw error;
    }
    return ok(data as Pamflet[]);
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
    const url = form.get("url")?.toString() || null;
    const uploader = req.headers.get("x-auth-user-username") || form.get("uploader")?.toString() || null;
    const title = form.get("title")?.toString() || "";
    const waktu_berakhir = form.get("waktu_berakhir")?.toString() || null;

    let storedUrl = url;
    if (file && file.size) {
      const result = await uploadFile(file, "pamflets");
      storedUrl = result.url;
    }

    if (!storedUrl) return badRequest("No file or url provided");

    // Get next order
    const { data: existing, error: existingError } = await supabase
      .from("pamflets")
      .select("order")
      .order("order", { ascending: false })
      .limit(1);

    if (existingError) {
      const dbErr = handleDbError(existingError);
      if (dbErr) return dbErr;
    }

    const nextOrder = (existing && existing.length > 0 ? existing[0].order : 0) + 1;

    const { data, error } = await supabase
      .from("pamflets")
      .insert({ title, url: storedUrl, order: nextOrder, uploader: uploader || null, waktu_berakhir })
      .select()
      .single();

    if (error) {
      const dbErr = handleDbError(error);
      if (dbErr) return dbErr;
      throw error;
    }
    logActivity(req.headers.get("x-auth-user-id"), `Menambah pamflet: ${title}`);
    return ok(data as Pamflet);
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
    const { data, error } = await supabase
      .from("pamflets")
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

    // Reassign order for remaining items
    const { data: remaining, error: remainingError } = await supabase
      .from("pamflets")
      .select("*")
      .order("order", { ascending: true });

    if (remainingError) {
      const dbErr = handleDbError(remainingError);
      if (dbErr) return dbErr;
    }

    if (remaining && remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        await supabase
          .from("pamflets")
          .update({ order: i + 1 })
          .eq("id", remaining[i].id);
      }
    }

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus pamflet: ${data?.title || id}`);
    return ok(data as Pamflet);
  } catch (error) {
    const dbErr = handleDbError(error);
    if (dbErr) return dbErr;
    return serverError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const supabase: any = getSupabaseAdmin();

    // Support bulk reordering for drag and drop
    if (body.items && Array.isArray(body.items)) {
      const { data: allItems, error: allItemsError } = await supabase
        .from("pamflets")
        .select("*");

      if (allItemsError) {
        const dbErr = handleDbError(allItemsError);
        if (dbErr) return dbErr;
      }

      const all = allItems || [];
      const newOrderedList: any[] = [];
      body.items.forEach((id: string) => {
        const found = all.find((it: any) => it.id === id);
        if (found) newOrderedList.push(found);
      });
      all.forEach((it: any) => {
        if (!newOrderedList.some((n: any) => n.id === it.id)) {
          newOrderedList.push(it);
        }
      });

      for (let i = 0; i < newOrderedList.length; i++) {
        await supabase
          .from("pamflets")
          .update({ order: i + 1 })
          .eq("id", newOrderedList[i].id);
      }

      logActivity(req.headers.get("x-auth-user-id"), `Mengurutkan ulang pamflet`);
      const { data: updated, error: updatedError } = await supabase
        .from("pamflets")
        .select("*")
        .order("order", { ascending: true });

      if (updatedError) {
        const dbErr = handleDbError(updatedError);
        if (dbErr) return dbErr;
      }

      return ok(updated as Pamflet[]);
    }

    const { id, direction } = body;
    if (!id || !direction) {
      return badRequest("id and direction are required");
    }
    if (direction !== "up" && direction !== "down") {
      return badRequest("direction must be up or down");
    }

    const { data: allItems, error: allItemsError } = await supabase
      .from("pamflets")
      .select("*")
      .order("order", { ascending: true });

    if (allItemsError) {
      const dbErr = handleDbError(allItemsError);
      if (dbErr) return dbErr;
    }

    const items = allItems || [];
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx === -1) return notFound();

    if (direction === "up" && idx > 0) {
      const temp = items[idx];
      items[idx] = items[idx - 1];
      items[idx - 1] = temp;
    } else if (direction === "down" && idx < items.length - 1) {
      const temp = items[idx];
      items[idx] = items[idx + 1];
      items[idx + 1] = temp;
    }

    for (let i = 0; i < items.length; i++) {
      await supabase
        .from("pamflets")
        .update({ order: i + 1 })
        .eq("id", items[i].id);
    }

    logActivity(req.headers.get("x-auth-user-id"), `Memindahkan pamflet: ${direction === "up" ? "naik" : "turun"}`);
    const { data: finalList, error: finalListError } = await supabase
      .from("pamflets")
      .select("*")
      .order("order", { ascending: true });

    if (finalListError) {
      const dbErr = handleDbError(finalListError);
      if (dbErr) return dbErr;
    }

    return ok(finalList as Pamflet[]);
  } catch (error) {
    const dbErr = handleDbError(error);
    if (dbErr) return dbErr;
    return serverError(error);
  }
}
