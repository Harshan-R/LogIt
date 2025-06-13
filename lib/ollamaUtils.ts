//..lib/ollamaUtils.ts

import { ParsedTimesheetRow, OllamaAnalysisResult } from "@/types";

export async function analyzeTimesheetWithOllama(
  empId: string,
  monthYear: string,
  entries: ParsedTimesheetRow[]
): Promise<OllamaAnalysisResult> {
  const formatted = entries
    .map(
      (e) =>
        `Date: ${e.date}, Day: ${e.day}, Project: ${e.project}, Team: ${
          e.team
        }, Hours: ${e.hours_worked}, Assigned: ${
          e.work_assigned || "N/A"
        }, Done: ${e.work_done || "N/A"}`
    )
    .join("\n");

  const prompt = `
You are an AI assistant analyzing an employee's monthly timesheet performance.

Instructions:
- The data contains multiple rows. Each row represents one working day.
- Compare the "Work Assigned" and "Work Done" fields to evaluate the quality of daily output.
- The "Hours Worked" field indicates daily effort.
- Weekends and leave days may exist; skip evaluating those.
- Do NOT evaluate line by line. Instead, generate an overall monthly summary.

Return strictly this JSON format:
{
  "emp_id": "${empId}",
  "month_year": "${monthYear}",
  "summary": "A detailed paragraph analyzing the employee's overall performance.",
  "rating": 7.5
}

Timesheet Data:
${formatted}
`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemma:3b",
      prompt,
      stream: false,
    }),
  });

  const json = await response.json();

  try {
    const match = json.response.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not find valid JSON.");
    const result = JSON.parse(match[0]);

    // Attach parsed timesheet JSON
    return {
      emp_id: empId,
      month_year: monthYear,
      summary: result.summary,
      rating: result.rating,
      json_data: entries,
    };
  } catch (err) {
    console.error("Failed to parse Ollama response:", json.response);
    throw err;
  }
}
