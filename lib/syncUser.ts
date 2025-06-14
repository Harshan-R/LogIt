// ..lib/syncUser.ts

import { User } from "@supabase/supabase-js";

export async function syncUser(user: User) {
  if (!user || !user.email) {
    return { error: "No user or email provided" };
  }

  // Only authenticated Supabase users (via OTP/email) can access the app
  return {
    success: true,
    user: {
      email: user.email,
    },
  };
}
