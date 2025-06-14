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

type Summary = {
  id: string;
  month_year: string;
  rating: number;
  summary: string;
  json_data: any[];
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
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  type BarChartData = { date: string; hours: number };
  type AreaChartData = { date: string; total: number };
  type RadialChartData = { name: string; value: number; fill: string };

  const [barData, setBarData] = useState<BarChartData[]>([]);
  const [areaData, setAreaData] = useState<AreaChartData[]>([]);
  const [radialData, setRadialData] = useState<RadialChartData[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: empData, error: empErr } = await supabase
        .from("employees")
        .select("id, name, emp_id, designation")
        .eq("id", id)
        .single();

      const { data: summariesData, error: summErr } = await supabase
        .from("summaries")
        .select("*")
        .eq("employee_id", id)
        .order("month_year", { ascending: false });

      if (empErr || summErr) {
        console.error("Fetch error:", empErr || summErr);
      } else {
        setEmployee(empData);
        setSummaries(summariesData as Summary[]);

        // Flatten and sort json_data by date
        const allEntries = summariesData
          .flatMap((summary) => summary.json_data)
          .filter((e) => e.date && e.hours_worked !== undefined)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        // Bar Chart: Hours per day
        setBarData(
          allEntries.map((entry) => ({
            date: entry.date,
            hours: entry.hours_worked,
          }))
        );

        // Area Chart: Cumulative
        let total = 0;
        setAreaData(
          allEntries.map((entry) => {
            total += entry.hours_worked;
            return { date: entry.date, total };
          })
        );

        // Radial Chart: Worked vs Leave
        const worked = allEntries.filter((e) => !e.is_leave).length;
        const leaves = allEntries.filter((e) => e.is_leave).length;
        setRadialData([
          { name: "Worked", value: worked, fill: "#4ade80" },
          { name: "Leave", value: leaves, fill: "#f87171" },
        ]);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading)
    return <Skeleton className="h-40 w-full mt-10 mx-auto max-w-4xl" />;

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
          <h3 className="text-lg font-semibold mb-2">Timesheet Details</h3>
          {summaries.length === 0 ? (
            <p className="text-sm text-gray-600">No data available.</p>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2">Month</th>
                  <th className="p-2">Rating</th>
                  <th className="p-2">Summary</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2">{s.month_year}</td>
                    <td className="p-2">{s.rating}</td>
                    <td className="p-2">{s.summary}</td>
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
