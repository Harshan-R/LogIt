//..app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClockIcon,
  UserIcon,
  FileBarChart2Icon,  
  LayoutDashboardIcon,
} from "lucide-react";
import { InsightsCard } from "@/components/insights/InsightsCard";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalEmployees: 0,
    totalSheets: 0,
    totalProjects: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);

      const orgId = "2d33db3a-232a-477e-bf67-7132efb1aa63" ; 
      //localStorage.setItem("org_id", "2d33db3a-232a-477e-bf67-7132efb1aa63");


      const [empRes, tsRes, prjRes] = await Promise.all([
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId),
        supabase
          .from("timesheets")
          .select("hours_worked", { count: "exact" })
          .eq("org_id", orgId),
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId),
      ]);

      const totalHours =
        tsRes.data?.reduce((acc, cur) => acc + cur.hours_worked, 0) || 0;

      setStats({
        totalHours,
        totalEmployees: empRes.count || 0,
        totalSheets: tsRes.count || 0,
        totalProjects: prjRes.count || 0,
      });

      setLoading(false);
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-4">
      {loading ? (
        Array(4)
          .fill(0)
          .map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
      ) : (
        <>
          <StatCard
            title="Total Hours"
            value={`${stats.totalHours} hrs`}
            icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
            badge="Tracked"
          />
          <StatCard
            title="Employees"
            value={`${stats.totalEmployees}`}
            icon={<UserIcon className="w-6 h-6 text-green-600" />}
            badge="Team"
          />
          <StatCard
            title="Sheets Uploaded"
            value={`${stats.totalSheets}`}
            icon={<FileBarChart2Icon className="w-6 h-6 text-purple-600" />}
            badge="Reports"
          />
          <StatCard
            title="Projects"
            value={`${stats.totalProjects}`}
            icon={<LayoutDashboardIcon className="w-6 h-6 text-orange-600" />}
            badge="Projects"
          />
        </>
      )}
      <div className="col-span-full">
        <InsightsCard />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  badge,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  badge: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <Badge variant="outline">{badge}</Badge>
        </p>
      </CardContent>
    </Card>
  );
}
