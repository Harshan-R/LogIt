// File: app/api/timesheets/process/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
// import { analyzeTimesheetWithOllama } from "@/lib/ollamaUtils";
import { analyzeTimesheetWithOllama } from "@/lib/ollamaUtils";
import type { TimesheetRow, OllamaAnalysisResult } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parsedTimesheetData } = body;

    if (!parsedTimesheetData || !Array.isArray(parsedTimesheetData)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Step 1: Analyze using Ollama
    const ollamaResponse: OllamaAnalysisResult =
      await analyzeTimesheetWithOllama(parsedTimesheetData);

    // Step 2: Update timesheet entries with performance and learning_note
    const updates = ollamaResponse.entries.map(async (entry) => {
      return await supabase
        .from("timesheets")
        .update({
          performance: entry.performance,
          learning_note: entry.learning_note,
        })
        .eq("id", entry.id);
    });

    await Promise.all(updates);

    return NextResponse.json({ message: "Timesheets updated successfully." });
  } catch (error) {
    console.error("Error processing timesheet:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
