//..app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserIcon, FileBarChart2Icon, LayoutDashboardIcon } from "lucide-react";
import { InsightsCard } from "@/components/insights/InsightsCard";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type GroupedProject = {
  status: string;
  count: number;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalProjects: 0,
    totalSheets: 0, // Placeholder if needed later
  });
  const [projectGroups, setProjectGroups] = useState<GroupedProject[]>([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);

      const [empRes, prjRes, groupedPrjRes] = await Promise.all([
        supabase.from("employees").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("status, count:status"),
        // .group("status"),
      ]);

      setStats({
        totalEmployees: empRes.count || 0,
        totalProjects: prjRes.count || 0,
        totalSheets: 0, // Update if tracking uploads
      });

      setProjectGroups(groupedPrjRes.data as GroupedProject[]);
      setLoading(false);
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-4">
      {loading ? (
        Array(3)
          .fill(0)
          .map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
      ) : (
        <>
          <StatCard
            title="Employees"
            value={`${stats.totalEmployees}`}
            icon={<UserIcon className="w-6 h-6 text-green-600" />}
            badge="Team"
          />
          <StatCard
            title="Projects"
            value={`${stats.totalProjects}`}
            icon={<LayoutDashboardIcon className="w-6 h-6 text-orange-600" />}
            badge="Projects"
          />
          <StatCard
            title="Sheets Uploaded"
            value={`${stats.totalSheets}`}
            icon={<FileBarChart2Icon className="w-6 h-6 text-purple-600" />}
            badge="Uploads"
          />
        </>
      )}

      <div className="col-span-full">
        <InsightsCard />
      </div>

      <div className="col-span-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Projects by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectGroups}>
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
