import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { analyzeTimesheetWithOllama } from "@/lib/ollamaUtils";
import { parseTimesheetExcel } from "@/lib/excelParser";
import { getMonthYearFromParsedRows } from "@/lib/utils"; // You can add this helper.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { file_path, employee_id } = body;

    if (!file_path || !employee_id) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const { data: fileData, error } = await supabaseAdmin.storage
      .from("timesheets")
      .download(file_path);

    if (error || !fileData) {
      return NextResponse.json(
        { error: "Unable to read file from storage" },
        { status: 404 }
      );
    }

    const file = new File(
      [fileData],
      file_path.split("/").pop() || "timesheet.xlsx",
      { type: fileData.type }
    );

    const parsedData = await parseTimesheetExcel(file);
    const filtered = parsedData.filter((entry) => entry.hours_worked); // skip off/leave

    if (!filtered.length) {
      return NextResponse.json(
        { error: "No usable data in timesheet" },
        { status: 422 }
      );
    }

    const monthYear = getMonthYearFromParsedRows(filtered); // e.g., "JUNE 2025"

    const ollamaResponse = await analyzeTimesheetWithOllama(
      employee_id,
      monthYear,
      filtered
    );

    const { summary, rating, json_data } = ollamaResponse;

    const { error: insertError } = await supabaseAdmin
      .from("summaries")
      .insert([
        {
          summary,
          rating,
          employee_id,
          month_year: monthYear,
          json_data,
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to store summary" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Summary generated and stored." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
