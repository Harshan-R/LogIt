//..app/dashboard/layout.tsx
import { ReactNode } from "react";
import { getUserSession } from "@/lib/getUserSession";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getUserSession();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={session?.user_metadata?.role || "unknown"} />
      <div className="flex flex-col flex-1">
        <Navbar
          userName={session?.user_metadata?.full_name || "User"}
          organizationId={session?.user_metadata?.organization_id || "N/A"}
        />
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
