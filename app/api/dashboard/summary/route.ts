// File: app/api/dashboard/summary/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { org_id, emp_id, employee_name, project_id, from_date, to_date } =
      body;

    if (!org_id) {
      return NextResponse.json(
        { error: "org_id is required" },
        { status: 400 }
      );
    }

    // 1. Filter employees by emp_id or name
    let employeeQuery = supabase
      .from("employees")
      .select("*")
      .eq("org_id", org_id);

    if (emp_id) employeeQuery = employeeQuery.ilike("emp_id", `%${emp_id}%`);
    if (employee_name)
      employeeQuery = employeeQuery.ilike("name", `%${employee_name}%`);

    const { data: employees, error: empError } = await employeeQuery;
    if (empError || !employees || employees.length === 0) {
      return NextResponse.json(
        { error: "No employees found" },
        { status: 404 }
      );
    }

    const employeeIds = employees.map((e) => e.id);

    // 2. Fetch timesheets for filtered employees + optional filters
    let timesheetQuery = supabase
      .from("timesheets")
      .select("*, project:project_id(name)")
      .in("employee_id", employeeIds);

    if (project_id)
      timesheetQuery = timesheetQuery.eq("project_id", project_id);
    if (from_date) timesheetQuery = timesheetQuery.gte("date", from_date);
    if (to_date) timesheetQuery = timesheetQuery.lte("date", to_date);

    const { data: timesheets } = await timesheetQuery;

    // 3. Fetch summaries
    const { data: summaries } = await supabase
      .from("summaries")
      .select("*")
      .in("employee_id", employeeIds);

    // 4. Calculate average rating
    const ratings = summaries?.map((s) => s.rating).filter(Boolean) as number[];
    const avg_rating =
      ratings.length > 0
        ? parseFloat(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
          )
        : null;

    // 5. Build response
    return NextResponse.json({
      employees,
      timesheets,
      summaries,
      average_rating: avg_rating,
    });
  } catch (err) {
    console.error("Summary API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
