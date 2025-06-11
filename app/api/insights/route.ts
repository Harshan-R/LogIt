// app/api/insights/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🧼 Clean Ollama output
function sanitizeOllamaOutput(response: string) {
  return response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee_id, date_range, project_id } = body;

    if (!employee_id || !date_range) {
      return NextResponse.json(
        { error: "Missing required filters (employee_id, date_range)" },
        { status: 400 }
      );
    }

    const { data: timesheets, error } = await supabase
      .from("timesheets")
      .select(
        `date, hours_worked, is_leave, work_summary, project:project_id ( name )`
      )
      .eq("employee_id", employee_id)
      .gte("date", date_range.start)
      .lte("date", date_range.end);

    if (error || !timesheets || timesheets.length === 0) {
      return NextResponse.json({ error: "No data found." }, { status: 404 });
    }

    const prompt = `You are an assistant summarizing employee productivity.

Here are the timesheet entries:

${timesheets
  .map(
    (t) =>
      `Date: ${t.date}, Hours: ${t.hours_worked}, Leave: ${
        t.is_leave
      },  Summary: ${
        t.work_summary ?? "-"
      }`
  )
  .join("\n")}

Return a structured JSON with fields: productivityRating (High/Medium/Low), mainProjects (array), totalHours, daysWorked, leavesTaken, and summaryNotes.`;

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b", // or whichever model you're using
        prompt,
        options: { temperature: 0.3},
        stream: false,
        think: false,
      }),
    });

    const ollamaJson = await ollamaRes.json();
    const rawOutput = ollamaJson.response || "";
    const cleanOutput = sanitizeOllamaOutput(rawOutput);

    // Try to parse JSON from the response
    let insights = null;
    try {
      insights = JSON.parse(cleanOutput);
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to parse summary." },
        { status: 500 }
      );
    }

    return NextResponse.json({ insights }, { status: 200 });
  } catch (err) {
    console.error("Insights API error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
