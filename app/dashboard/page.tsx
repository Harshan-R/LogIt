// ..app/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClockIcon, UserIcon, FileBarChart2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { InsightsCard } from "@/components/insights/InsightsCard";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalEmployees: 0,
    totalSheets: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalHours: 1275,
        totalEmployees: 14,
        totalSheets: 52,
      });
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {loading ? (
        <>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </>
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
        </>
      )}
      <InsightsCard />
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
