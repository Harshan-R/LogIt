// ..lib/syncUser.ts
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export async function syncUser(user: User) {
  if (!user || !user.email) {
    return { error: "No user or email provided" };
  }

  // Check if user exists in the users table by email
  const { data: existingUser, error } = await supabase
    .from("users")
    .select("id, org_id, role")
    .eq("email", user.email)
    .single();

  if (error) {
    return { error: "User not found in database. Access denied." };
  }

  // Optional: attach to context, log it, or return it
  return {
    success: true,
    user: existingUser,
  };
}
