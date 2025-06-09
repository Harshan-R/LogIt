// ..components/Navbar.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || "");
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
      <div className="text-lg font-semibold capitalize">
        {pathname.replace("/dashboard", "").slice(1) || "Dashboard"}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">{userEmail}</div>
        <Avatar>
          <AvatarImage
            src="https://api.dicebear.com/7.x/initials/svg?seed=user"
            alt="avatar"
          />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
