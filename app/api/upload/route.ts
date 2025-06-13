// app/api/upload/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { analyzeTimesheetWithOllama } from "@/lib/ollamaUtils";
import { parseTimesheetExcel } from "@/lib/excelParser";
import { TimesheetEntry, OllamaAnalysisResult } from "@/types";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  
  if (!file ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Upload to Supabase Storage
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("timesheet-uploads")
    .upload(fileName, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // ✅ Parse Excel using shared utility
  let parsedRows: TimesheetEntry[];
  try {
    parsedRows = await parseTimesheetExcel(file);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to parse Excel file" },
      { status: 400 }
    );
  }

  // ✅ Analyze with Ollama
  let analyzed: OllamaAnalysisResult;
  try {
    analyzed = await analyzeTimesheetWithOllama(parsedRows);
  } catch (err) {
    return NextResponse.json(
      { error: "Ollama analysis failed" },
      { status: 500 }
    );
  }

  // ✅ Enrich parsed rows with AI analysis
  const enriched = parsedRows.map((row, idx) => ({
    employee_id: row.emp_id || row.employee_id,
    project: row.project || null,
    date: row.date,
    work_summary: row.work_summary ?? null,
    hours_worked: row.hours_worked ?? 0,
    is_leave: row.is_leave ?? false,
    performance: analyzed.entries[idx]?.performance ?? "",
    learning_note: analyzed.entries[idx]?.learning_note ?? "",
    
   
  }));

  const { error: insertError } = await supabaseAdmin
    .from("timesheets")
    .insert(enriched);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Upload and analysis successful" });
}
