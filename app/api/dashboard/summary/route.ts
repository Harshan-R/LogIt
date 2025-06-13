// File: app/api/dashboard/summary/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { emp_id, employee_name, project_id, from_date, to_date } =
      await req.json();
    const org_id = "2d33db3a-232a-477e-bf67-7132efb1aa63";

    if (!org_id) {
      return NextResponse.json(
        { error: "org_id is required" },
        { status: 400 }
      );
    }

    let employeeQuery = supabaseAdmin
      .from("employees")
      .select("*")
      .eq("org_id", org_id);

    if (emp_id) employeeQuery = employeeQuery.ilike("emp_id", `%${emp_id}%`);
    if (employee_name)
      employeeQuery = employeeQuery.ilike("name", `%${employee_name}%`);

    const { data: employees, error: empError } = await employeeQuery;
    if (empError || !employees?.length) {
      return NextResponse.json(
        { error: "No employees found" },
        { status: 404 }
      );
    }

    const employeeIds = employees.map((e) => e.id);

    let timesheetQuery = supabaseAdmin
      .from("timesheets")
      .select("*, project:project_id(name)")
      .in("employee_id", employeeIds);

    if (project_id)
      timesheetQuery = timesheetQuery.eq("project_id", project_id);
    if (from_date) timesheetQuery = timesheetQuery.gte("date", from_date);
    if (to_date) timesheetQuery = timesheetQuery.lte("date", to_date);

    const { data: timesheets } = await timesheetQuery;

    const { data: summaries } = await supabaseAdmin
      .from("summaries")
      .select("*")
      .in("employee_id", employeeIds);

    const ratings = summaries?.map((s) => s.rating).filter(Boolean) as number[];
    const avg_rating = ratings.length
      ? parseFloat(
          (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
        )
      : null;

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
