// app/api/upload/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // ✅ use admin client
import { analyzeTimesheetWithOllama } from "@/lib/ollamaUtils";
import * as xlsx from "xlsx";
import { TimesheetEntry, OllamaAnalysisResult } from "@/types";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const orgId = formData.get("orgId") as string;
  const userId = formData.get("userId") as string;

  if (!file || !orgId || !userId) {
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

  // 🟨 Parse Excel
  const workbook = xlsx.read(fileBuffer);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const jsonData = xlsx.utils.sheet_to_json(sheet) as TimesheetEntry[];

  // 🟩 Analyze with Ollama
  const analyzed: OllamaAnalysisResult = await analyzeTimesheetWithOllama(
    jsonData
  );

  // 🟦 Enrich data with Ollama output
  const enriched = jsonData.map((row, idx) => ({
    employee_id: row.employee_id,
    project_id: row.project_id,
    date: row.date,
    work_summary: row.work_summary ?? null,
    hours_worked: row.hours_worked ?? 0,
    is_leave: row.is_leave ?? false,
    performance: analyzed.entries[idx]?.performance ?? "",
    learning_note: analyzed.entries[idx]?.learning_note ?? "",
    created_by: userId,
  }));

  const { error: insertError } = await supabaseAdmin
    .from("timesheets")
    .insert(enriched);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Upload and analysis successful" });
}
