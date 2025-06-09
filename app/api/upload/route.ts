// /app/api/upload/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
//import { analyzeTimesheetWithOllama } from "@/lib/ollama"; // next step
import { analyzeTimesheetWithOllama } from "@/lib/ollamaUtils";
import * as xlsx from "xlsx";
import { Readable } from "stream";

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

  const { error: uploadError } = await supabase.storage
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
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  // 🟩 Send to Ollama
  const analyzed = await analyzeTimesheetWithOllama(jsonData);

  // 🟦 Save to Supabase (example: insert multiple)
  const enriched = jsonData.map((row: any, idx: number) => ({
    employee_id: row.employee_id,
    project_id: row.project_id,
    date: row.date,
    work_summary: row.work_summary || null,
    hours_worked: row.hours || 0,
    is_leave: row.is_leave || false,
    performance: analyzed[idx]?.performance || "",
    learning_note: analyzed[idx]?.learning_note || "",
    created_by: userId,
  }));

  const { error: insertError } = await supabase
    .from("timesheets")
    .insert(enriched);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Upload and analysis successful" });
}
