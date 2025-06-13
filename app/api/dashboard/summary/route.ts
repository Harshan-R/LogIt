//..app/api/dashboard/summary/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { emp_id, employee_name, from_date, to_date } = await req.json();

    // ✅ Step 1: Fetch employees based on filters
    let employeeQuery = supabaseAdmin.from("employees").select("*");

    if (emp_id) {
      employeeQuery = employeeQuery.ilike("emp_id", `%${emp_id}%`);
    }

    if (employee_name) {
      employeeQuery = employeeQuery.ilike("name", `%${employee_name}%`);
    }

    const { data: employees, error: empError } = await employeeQuery;

    if (empError || !employees?.length) {
      return NextResponse.json(
        { error: "No employees found", details: empError?.message },
        { status: 404 }
      );
    }

    const employeeIds = employees.map((e) => e.id);

    // ✅ Step 2: Fetch uploaded files (simulate timesheets)
    let uploadsQuery = supabaseAdmin
      .from("uploads")
      .select("id, employee_id, file_path, month_year, created_at")
      .in("employee_id", employeeIds);

    if (from_date) {
      uploadsQuery = uploadsQuery.gte("created_at", from_date);
    }

    if (to_date) {
      uploadsQuery = uploadsQuery.lte("created_at", to_date);
    }

    const { data: uploads, error: uploadError } = await uploadsQuery;

    if (uploadError) {
      console.error("Upload fetch error:", uploadError.message);
    }

    // ✅ Step 3: Fetch summaries (ratings, etc.)
    const { data: summaries, error: sumError } = await supabaseAdmin
      .from("summaries")
      .select("*")
      .in("employee_id", employeeIds);

    if (sumError) {
      console.error("Summaries fetch error:", sumError.message);
    }

    const ratings = summaries?.map((s) => s.rating).filter(Boolean) as number[];
    const avg_rating = ratings.length
      ? parseFloat(
          (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
        )
      : null;

    return NextResponse.json({
      employees,
      uploads,
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
