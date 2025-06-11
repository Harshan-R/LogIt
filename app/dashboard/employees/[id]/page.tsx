// app/dashboard/employees/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

type Timesheet = {
  id: string;
  date: string;
  hours_worked: number;
  is_leave: boolean;
  work_summary: string | null;
  project: {
    name: string;
  } | null;
};

type Employee = {
  id: string;
  name: string;
  emp_id: string;
  designation: string;
};

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  //   const [barData, setBarData] = useState([]);
  //   const [areaData, setAreaData] = useState([]);
  //   const [radialData, setRadialData] = useState([]);
  const [loading, setLoading] = useState(true);

  type BarChartData = { date: string; hours: number };
  type AreaChartData = { date: string; total: number };
  type RadialChartData = { name: string; value: number; fill: string };

  const [barData, setBarData] = useState<BarChartData[]>([]);
  const [areaData, setAreaData] = useState<AreaChartData[]>([]);
  const [radialData, setRadialData] = useState<RadialChartData[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchEmployeeDetails = async () => {
      setLoading(true);

      const { data: employeeData, error: empError } = await supabase
        .from("employees")
        .select("id, name, emp_id, designation")
        .eq("id", id)
        .single();

      const { data: timesheetData, error: tsError } = await supabase
        .from("timesheets")
        .select(
          `
          id,
          date,
          hours_worked,
          is_leave,
          work_summary,
          project:project_id ( name )
        `
        )
        .eq("employee_id", id)
        .order("date", { ascending: false });

      if (empError || tsError) {
        console.error("Fetch error:", empError || tsError);
      } else {
        setEmployee(employeeData);
        const normalized = (timesheetData as any[]).map((entry) => ({
          ...entry,
          project: Array.isArray(entry.project)
            ? entry.project[0]
            : entry.project,
        }));
        setTimesheets(normalized);

        // Bar Chart Data
        setBarData(
          normalized.map((t) => ({ date: t.date, hours: t.hours_worked }))
        );

        // Area Chart Data
        let runningTotal = 0;
        const cum = normalized.map((t) => {
          runningTotal += t.hours_worked ?? 0;
          return { date: t.date, total: runningTotal };
        });
        setAreaData(cum);

        // Radial Chart Data
        const worked = normalized.filter((t) => !t.is_leave).length;
        const leaves = normalized.filter((t) => t.is_leave).length;
        setRadialData([
          { name: "Worked", value: worked, fill: "#4ade80" },
          { name: "Leave", value: leaves, fill: "#f87171" },
        ]);
      }

      setLoading(false);
    };

    fetchEmployeeDetails();
  }, [id]);

  if (loading) {
    return <Skeleton className="h-40 w-full mt-10 mx-auto max-w-4xl" />;
  }

  if (!employee) {
    return (
      <p className="text-center text-red-500 mt-10">
        Employee not found or failed to load.
      </p>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto mt-10 p-4">
      <CardContent className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{employee.name}</h2>
          <p className="text-sm text-muted-foreground">
            ID: {employee.emp_id} — {employee.designation}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Hours Per Day</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-2">Cumulative Hours</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#34d399"
                  fill="#bbf7d0"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 flex flex-col items-center justify-center">
            <h4 className="font-semibold mb-2">Attendance</h4>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="80%"
                data={radialData}
                startAngle={180}
                endAngle={-180}
              >
                <RadialBar dataKey="value" background />
                <Legend
                  iconSize={10}
                  layout="horizontal"
                  verticalAlign="bottom"
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="overflow-auto">
          <h3 className="text-lg font-semibold mb-2">Timesheets</h3>
          {timesheets.length === 0 ? (
            <p className="text-sm text-gray-600">No timesheet records.</p>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Hours</th>
                  <th className="p-2">Leave</th>
                  <th className="p-2">Project</th>
                  <th className="p-2">Summary</th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="p-2">{entry.date}</td>
                    <td className="p-2">{entry.hours_worked}</td>
                    <td className="p-2">
                      {entry.is_leave ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white">No</Badge>
                      )}
                    </td>
                    <td className="p-2">
                      {entry.project?.name || (
                        <Badge variant="outline">Unassigned</Badge>
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
