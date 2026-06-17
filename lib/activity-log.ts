import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function logActivity(
  userId: string | null | undefined,
  aktivitas: string
) {
  if (!userId) return;

  const supabase: any = getSupabaseAdmin();

  const { data: user } = await supabase
    .from("users")
    .select("username")
    .eq("id", userId)
    .single();

  const username = user?.username || "unknown";

  await supabase.from("login_logs").insert({
    user_id: userId,
    username,
    aktivitas,
  }).catch(() => {
    // fallback if aktivitas column doesn't exist
    supabase.from("login_logs").insert({
      user_id: userId,
      username,
    }).catch(() => {});
  });
}
