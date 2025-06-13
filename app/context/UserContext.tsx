//..app/context/UserContext.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserContextType {
  email: string | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  email: null,
  loading: true,
});

export const useUserContext = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        setEmail(user.email ?? null); // ✅ Safe fallback
      } else {
        console.warn("User not found or error fetching user:", error?.message);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ email, loading }}>
      {children}
    </UserContext.Provider>
  );
}
