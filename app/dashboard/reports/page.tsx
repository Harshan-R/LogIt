// app/dashboard/reports/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import Papa from "papaparse";

const PAGE_SIZE = 10;

type ParsedTimesheet = {
  id: string;
  date: string;
  day: string;
  project: string;
  team: string;
  hours_worked: number;
  work_assigned: string;
  work_done: string;
};

export default function ReportsPage({
  empId,
  monthYear,
}: {
  empId: string;
  monthYear: string;
}) {
  const [data, setData] = useState<ParsedTimesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTimesheets = async () => {
      const { data, error } = await supabase
        .from("summaries")
        .select("json_data")
        .eq("month_year", monthYear)
        .eq("employee_id", empId)
        .single();

      if (error) {
        console.error("Error fetching parsed timesheet summary:", error);
        setLoading(false);
        return;
      }

      const parsedData = data?.json_data || [];
      setData(parsedData);
      setLoading(false);
    };

    if (empId && monthYear) fetchTimesheets();
  }, [empId, monthYear]);

  const filteredData = useMemo(() => {
    return data
      .filter((entry) => {
        const search = searchTerm.toLowerCase();
        return (
          entry.project?.toLowerCase().includes(search) ||
          entry.team?.toLowerCase().includes(search)
        );
      })
      .slice(0, page * PAGE_SIZE);
  }, [data, searchTerm, page]);

  const handleDownloadCSV = () => {
    const csv = Papa.unparse(
      filteredData.map((entry) => ({
        Date: entry.date,
        Day: entry.day,
        Project: entry.project,
        Team: entry.team,
        Hours: entry.hours_worked,
        "Work Assigned": entry.work_assigned,
        "Work Done": entry.work_done,
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Timesheet_${empId}_${monthYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalHours = useMemo(
    () => data.reduce((sum, e) => sum + (e.hours_worked || 0), 0),
    [data]
  );

  const leaveDays = useMemo(
    () => data.filter((e) => !e.project && !e.hours_worked).length,
    [data]
  );

  return (
    <Card className="max-w-6xl mx-auto mt-10 p-4">
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <h2 className="text-xl font-semibold">Parsed Timesheet</h2>
          <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search project or team..."
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
          <p className="text-sm text-gray-600">No entries found.</p>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-2">
              Total Hours: <strong>{totalHours}</strong> | Leave Days:{" "}
              <strong>{leaveDays}</strong>
            </div>

            <div className="overflow-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    {[
                      "Date",
                      "Day",
                      "Project",
                      "Team",
                      "Hours",
                      "Work Assigned",
                      "Work Done",
                    ].map((label) => (
                      <th key={label} className="p-2">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((entry, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{entry.date}</td>
                      <td className="p-2">{entry.day}</td>
                      <td className="p-2">
                        {entry.project || <Badge variant="outline">—</Badge>}
                      </td>
                      <td className="p-2">
                        {entry.team || <Badge variant="outline">—</Badge>}
                      </td>
                      <td className="p-2">{entry.hours_worked ?? 0}</td>
                      <td className="p-2">
                        {entry.work_assigned || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2">
                        {entry.work_done || (
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
