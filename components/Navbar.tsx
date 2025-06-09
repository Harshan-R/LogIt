// ..components/Navbar.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface NavbarProps {
  userName: string;
  organizationId: string;
}

export default function Navbar({ userName, organizationId }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

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
        <div className="text-sm text-gray-700 text-right">
          <div>{userName}</div>
          <div className="text-xs text-gray-400">Org ID: {organizationId}</div>
        </div>
        <Avatar>
          <AvatarImage
            src="https://api.dicebear.com/7.x/initials/svg?seed=user"
            alt="avatar"
          />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
