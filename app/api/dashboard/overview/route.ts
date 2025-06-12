// File: app/api/dashboard/overview/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    //const { org_id } = await req.json();
        const org_id = "2d33db3a-232a-477e-bf67-7132efb1aa63";


    if (!org_id) {
      return NextResponse.json(
        { error: "org_id is required" },
        { status: 400 }
      );
    }

    // 1. Count of employees
    const { count: employeeCount } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org_id);

    // 2. Best performer(s) - summaries with max rating
    const { data: topPerformersRaw } = await supabase
      .from("summaries")
      .select("employee_id, rating")
      .eq("type", "monthly")
      .eq("rating", 10)
      .order("created_at", { ascending: false });

    // Get unique top employee ids
    const topEmployeeIds = [
      ...new Set(topPerformersRaw?.map((p) => p.employee_id)),
    ];

    // 2b. Fetch employee names
    const { data: topEmployees } = await supabase
      .from("employees")
      .select("id, name, emp_id")
      .in("id", topEmployeeIds);

    // 3. Project count by status
    const { data: projects } = await supabase
      .from("projects")
      .select("status")
      .eq("org_id", org_id);

    const projectCountByStatus = {
      live: 0,
      hold: 0,
      completed: 0,
    };

    projects?.forEach((p) => {
      const key = p.status as keyof typeof projectCountByStatus;
      if (projectCountByStatus[key] !== undefined) {
        projectCountByStatus[key]++;
      }
    });

    // 4. Project list with client names
    const { data: projectList } = await supabase
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

