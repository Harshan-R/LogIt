//..app/dashboard/layout.tsx
import { ReactNode } from "react";
import { getUserSession } from "@/lib/getUserSession";
import Sidebar from "@/components/Sidebar";
//import  Toaster  from "@/components/ui/sonner";
import { SonnerToaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getUserSession();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={session?.user?.user_metadata?.role || "unknown"} />

      <div className="flex flex-col flex-1">
        <Navbar
          userName={session?.user?.user_metadata?.full_name || "User"}
          organizationId={
            session?.user?.user_metadata?.organization_id || "N/A"
          }
        />

        {/* <Toaster />
        {children} */}
        <SonnerToaster />
        {children}

        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
