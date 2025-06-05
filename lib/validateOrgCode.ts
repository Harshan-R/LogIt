//..lib/validateOrgCode.ts
import { supabase } from "./supabaseClient";

export const validateOrgCode = async (code: string) => {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("code", code)
    .single();

  if (error || !data) return null;
  return data;
};
