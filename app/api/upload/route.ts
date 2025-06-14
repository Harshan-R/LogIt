// app/api/upload/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { analyzeTimesheetWithOllama } from "@/lib/ollamaUtils";
import { parseTimesheetExcel } from "@/lib/excelParser";
import { ParsedTimesheetRow, OllamaAnalysisResult } from "@/types";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const emp_id = formData.get("emp_id") as string;
  const month_year = formData.get("month_year") as string;

  if (!file || !emp_id || !month_year) {
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
  let parsedRows: ParsedTimesheetRow[];
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
    analyzed = await analyzeTimesheetWithOllama(emp_id, month_year, parsedRows);
  } catch (err) {
    return NextResponse.json(
      { error: "Ollama analysis failed" },
      { status: 500 }
    );
  }

  // ✅ Enrich and store in summaries table
  const { error: insertError } = await supabaseAdmin.from("summaries").insert([
    {
      employee_id: emp_id,
      month_year,
      summary: analyzed.summary,
      rating: analyzed.rating,
      json_data: parsedRows, // Raw timesheet for traceability
    },
  ]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Upload and analysis successful",
    file_path: fileName,
  });
}
