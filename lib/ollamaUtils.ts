// lib/ollamaUtils.ts

type TimesheetEntry = {
  employee_id: string;
  date: string;
  work_summary: string;
  hours_worked: number;
};

type AnalyzedResult = {
  date: string;
  employee_id: string;
  performance: string;
  learning_note: string;
};

export async function analyzeTimesheetWithOllama(
  entries: TimesheetEntry[]
): Promise<AnalyzedResult[]> {
  // Convert timesheet entries into readable lines for prompt
  const formatted = entries
    .map(
      (e) =>
        `Date: ${e.date}, Employee: ${e.employee_id}, Hours: ${
          e.hours_worked
        }, Summary: ${e.work_summary || "N/A"}`
    )
    .join("\n");

  const prompt = `
You're an AI assistant helping analyze employee timesheets.
Each entry includes date, employee ID, hours worked, and a summary of work.
For each date & employee, provide a short performance summary and one learning note.

Return only a JSON array like:
[
  {
    "date": "2024-05-01",
    "employee_id": "EMP123",
    "performance": "Completed tasks on time with high quality.",
    "learning_note": "Improved understanding of async JS operations."
  }
]

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

  // Attempt to parse JSON from Ollama's response
  try {
    const match = json.response.match(/\[.*\]/s); // extract array string
    if (!match) throw new Error("JSON array not found in response.");

    const result = JSON.parse(match[0]);
    return result;
  } catch (err) {
    console.error("Failed to parse Ollama response:", json.response);
    throw err;
  }
}
