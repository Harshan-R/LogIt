// app/context/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserContextType {
  role: string | null;
  orgId: number | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  role: null,
  orgId: null,
  loading: true,
});

export const useUserContext = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.warn("No authenticated user found.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("role, organization_id")
          .eq("auth_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user info:", error.message);
        } else if (data) {
          setRole(data.role);
          setOrgId(data.organization_id);
        }
      } catch (err) {
        console.error("Unexpected error in UserContext:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <UserContext.Provider value={{ role, orgId, loading }}>
      {children}
    </UserContext.Provider>
  );
}
