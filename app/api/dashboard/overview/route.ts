//..app/api/dashboard/overview/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // use admin client

export async function POST(req: Request) {
  try {
    const org_id = "2d33db3a-232a-477e-bf67-7132efb1aa63";

    if (!org_id) {
      return NextResponse.json(
        { error: "org_id is required" },
        { status: 400 }
      );
    }

    const { count: employeeCount } = await supabaseAdmin
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org_id);

    const { data: topPerformersRaw } = await supabaseAdmin
      .from("summaries")
      .select("employee_id, rating")
      .eq("type", "monthly")
      .eq("rating", 10)
      .order("created_at", { ascending: false });

    const topEmployeeIds = [
      ...new Set(topPerformersRaw?.map((p) => p.employee_id)),
    ];

    const { data: topEmployees } = await supabaseAdmin
      .from("employees")
      .select("id, name, emp_id")
      .in("id", topEmployeeIds);

    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("status")
      .eq("org_id", org_id);

    const projectCountByStatus = { live: 0, hold: 0, completed: 0 };
    projects?.forEach((p) => {
      const key = p.status as keyof typeof projectCountByStatus;
      if (projectCountByStatus[key] !== undefined) projectCountByStatus[key]++;
    });

    const { data: projectList } = await supabaseAdmin
      .from("projects")
      .select("id, name, client_name")
      .eq("org_id", org_id);

    return NextResponse.json({
      employeeCount,
      topEmployees,
      projectCountByStatus,
      projectList,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
