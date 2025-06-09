// ..lib/syncUser.ts
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export async function syncUser(user: User) {
  if (!user) return { error: "No user provided" };

  const authId = user.id;
  const { full_name, organization_id } = user.user_metadata || {};

  if (!organization_id || !full_name) {
    return { error: "Missing metadata: organization_id or full_name" };
  }

  // Check if user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return { error: fetchError.message };
  }

  if (!existingUser) {
    const { error: insertError } = await supabase.from("users").insert({
      auth_id: authId,
      name: full_name,
      role: "team_lead", // default role
      organization_id,
    });

    if (insertError) return { error: insertError.message };
  }

  return { success: true };
}
