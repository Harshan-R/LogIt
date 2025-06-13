import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseTimesheetExcel } from "@/lib/excelParser";
import { sanitizeOllamaOutput } from "@/lib/ollamaUtils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee_id, date_range, file_path } = body;

    if (!employee_id || !date_range || !file_path) {
      return NextResponse.json(
        {
          error:
            "Missing required filters (employee_id, date_range, file_path)",
        },
        { status: 400 }
      );
    }

    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from("timesheets")
      .download(file_path);

    if (fileError || !fileData) {
      return NextResponse.json(
        { error: "Unable to fetch file" },
        { status: 404 }
      );
    }

    const file = new File(
      [fileData],
      file_path.split("/").pop() || "timesheet.xlsx",
      { type: fileData.type }
    );

    const timesheetRows = await parseTimesheetExcel(file);
    const filtered = timesheetRows.filter((row) => {
      return (
        row.date >= date_range.start &&
        row.date <= date_range.end &&
        row.hours_worked
      );
    });

    if (!filtered.length) {
      return NextResponse.json(
        { error: "No relevant timesheet data." },
        { status: 404 }
      );
    }

    const prompt = `
You are an assistant generating a high-level timesheet insight report.

Data below contains daily logs with:
- date, day, hours worked, project, work_done.

Analyze all of it and return JSON in this exact format:
{
  "productivityRating": "High" | "Medium" | "Low",
  "mainProjects": ["Project A", "Project B"],
  "totalHours": 120,
  "daysWorked": 18,
  "leavesTaken": 2,
  "summaryNotes": "..." (one paragraph summary)
}

Here is the timesheet data:
${filtered
  .map(
    (t) =>
      `Date: ${t.date}, Day: ${t.day}, Hours: ${t.hours_worked}, Project: ${
        t.project
      }, Done: ${t.work_done || "-"}`
  )
  .join("\n")}
`;

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        prompt,
        options: { temperature: 0.3 },
        stream: false,
      }),
    });

    const ollamaJson = await ollamaRes.json();
    const cleanOutput = sanitizeOllamaOutput(ollamaJson.response || "");

    let insights = null;
    try {
      insights = JSON.parse(cleanOutput);
    } catch {
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
