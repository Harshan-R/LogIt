// ..app/dashboard/reports/page.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type TimesheetEntry = {
  id: string;
  date: string;
  hours_worked: number;
  is_leave: boolean;
  work_summary: string | null;
  employee: {
    name: string;
    emp_id: string;
  } | null;
  project: {
    name: string;
  } | null;
};

export default function ReportsPage() {
  const [data, setData] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimesheets = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const orgId = user.user_metadata?.organization_id;
      if (!orgId) return;

      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
            id,
            date,
            hours_worked,
            is_leave,
            work_summary,
            employee:employee_id ( name, emp_id ),
            project:project_id ( name )
          `
        )
        .eq("organization_id", orgId)
        .order("date", { ascending: false });

      if (error) {
        console.error("Failed to fetch timesheets:", error.message);
      } else {
        // 🛠 Ensure employee and project are not arrays
        const normalized = (data as any[]).map((entry) => ({
          ...entry,
          employee: Array.isArray(entry.employee)
            ? entry.employee[0]
            : entry.employee,
          project: Array.isArray(entry.project)
            ? entry.project[0]
            : entry.project,
        }));
        setData(normalized);
      }

      setLoading(false);
    };

    fetchTimesheets();
  }, []);

  return (
    <Card className="max-w-6xl mx-auto mt-10 p-4">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">Uploaded Timesheets</h2>

        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-600">No timesheets uploaded yet.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2">Employee</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Hours</th>
                  <th className="p-2">Project</th>
                  <th className="p-2">Leave</th>
                  <th className="p-2">Summary</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="p-2">
                      {entry.employee?.name || "Unknown"}{" "}
                      <span className="text-gray-400 text-xs ml-1">
                        ({entry.employee?.emp_id || "N/A"})
                      </span>
                    </td>
                    <td className="p-2">{entry.date}</td>
                    <td className="p-2">{entry.hours_worked ?? 0}</td>
                    <td className="p-2">
                      {entry.project?.name || (
                        <Badge variant="outline">Unassigned</Badge>
                      )}
                    </td>
                    <td className="p-2">
                      {entry.is_leave ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white">No</Badge>
                      )}
                    </td>
                    <td className="p-2">
                      {entry.work_summary || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
