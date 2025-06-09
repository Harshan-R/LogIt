//..components/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  UploadIcon,
  BarChartIcon,
  LogOutIcon,
  UsersIcon,
} from "lucide-react";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Upload Sheets", href: "/dashboard/upload", icon: UploadIcon },
  { name: "Reports", href: "/dashboard/reports", icon: BarChartIcon },
  { name: "Employees", href: "/dashboard/employees", icon: UsersIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-6">LogIt</h2>
      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t pt-4">
        <Link
          href="/auth/logout"
          className="flex items-center gap-3 text-sm text-red-500 hover:text-red-700"
        >
          <LogOutIcon className="w-5 h-5" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
