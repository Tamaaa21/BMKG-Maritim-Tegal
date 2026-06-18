import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function logActivity(
  userId: string | null | undefined,
  aktivitas: string,
  username?: string | null
) {
  if (!userId) return;

  const supabase: any = getSupabaseAdmin();
  let finalUsername = username || "";

  if (!finalUsername) {
    const { data: user } = await supabase
      .from("users")
      .select("username")
      .eq("id", userId)
      .maybeSingle();

    finalUsername = user?.username || "unknown";
  }

  const { error } = await supabase
    .from("login_logs")
    .insert({ user_id: userId, username: finalUsername, aktivitas });

  if (error) {
    console.error("[logActivity] Gagal mencatat aktivitas:", error);
  }
}
