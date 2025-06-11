// ..app/dashboard/reports/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import Papa from "papaparse";

const PAGE_SIZE = 10;

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
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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
        .order(sortColumn, { ascending: sortDirection === "asc" });

      if (error) {
        console.error("Failed to fetch timesheets:", error.message);
      } else {
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
  }, [sortColumn, sortDirection]);

  const filteredData = useMemo(() => {
    return data
      .filter((entry) => {
        const search = searchTerm.toLowerCase();
        return (
          entry.employee?.name.toLowerCase().includes(search) ||
          entry.employee?.emp_id.toLowerCase().includes(search)
        );
      })
      .slice(0, page * PAGE_SIZE);
  }, [data, searchTerm, page]);

  const handleDownloadCSV = () => {
    const csv = Papa.unparse(
      filteredData.map((entry) => ({
        Employee: entry.employee?.name || "",
        ID: entry.employee?.emp_id || "",
        Date: entry.date,
        Hours: entry.hours_worked,
        Project: entry.project?.name || "",
        Leave: entry.is_leave ? "Yes" : "No",
        Summary: entry.work_summary || "",
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `timesheet_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalHours = useMemo(
    () => data.reduce((sum, e) => sum + (e.hours_worked || 0), 0),
    [data]
  );
  const totalLeaves = useMemo(
    () => data.filter((e) => e.is_leave).length,
    [data]
  );

  return (
    <Card className="max-w-6xl mx-auto mt-10 p-4">
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <h2 className="text-xl font-semibold">Uploaded Timesheets</h2>
          <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search employee..."
              className="w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1"
              variant="outline"
            >
              <Download className="w-4 h-4" /> CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : filteredData.length === 0 ? (
          <p className="text-sm text-gray-600">No timesheets found.</p>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-2">
              Total Hours: <strong>{totalHours}</strong> | Total Leaves:{" "}
              <strong>{totalLeaves}</strong>
            </div>

            <div className="overflow-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    {[
                      { key: "employee", label: "Employee" },
                      { key: "date", label: "Date" },
                      { key: "hours_worked", label: "Hours" },
                      { key: "project", label: "Project" },
                      { key: "is_leave", label: "Leave" },
                      { key: "work_summary", label: "Summary" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="p-2 cursor-pointer hover:underline"
                        onClick={() => {
                          if (sortColumn === col.key) {
                            setSortDirection(
                              sortDirection === "asc" ? "desc" : "asc"
                            );
                          } else {
                            setSortColumn(col.key);
                            setSortDirection("asc");
                          }
                        }}
                      >
                        {col.label}{" "}
                        {sortColumn === col.key
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((entry) => (
                    <tr key={entry.id} className="border-t">
                      <td className="p-2">
                        {entry.employee?.name || "Unknown"}{" "}
                        <span className="text-gray-400 text-xs ml-1">
                          ({entry.employee?.emp_id || "N/A"})
                        </span>
                      </td>
                      <td className="p-2">
                        {format(new Date(entry.date), "dd MMM yyyy")}
                      </td>
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

            {data.length > filteredData.length && (
              <div className="text-center mt-4">
                <Button onClick={() => setPage((prev) => prev + 1)}>
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
