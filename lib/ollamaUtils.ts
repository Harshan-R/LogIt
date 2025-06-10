// lib/ollamaUtils.ts

type TimesheetEntry = {
  id: string;
  employee_id: string;
  date: string;
  work_summary: string;
  hours_worked: number;
};

type OllamaAnalysisEntry = {
  id: string;
  performance: string;
  learning_note: string;
};

type OllamaAnalysisResult = {
  summary: string;
  overall_rating: number;
  entries: OllamaAnalysisEntry[];
};

export async function analyzeTimesheetWithOllama(
  entries: TimesheetEntry[]
): Promise<OllamaAnalysisResult> {
  const formatted = entries
    .map(
      (e) =>
        `ID: ${e.id}, Date: ${e.date}, Employee: ${e.employee_id}, Hours: ${
          e.hours_worked
        }, Summary: ${e.work_summary || "N/A"}`
    )
    .join("\n");

  const prompt = `
You're an AI assistant analyzing employee timesheet data.
Each entry includes ID, date, employee ID, hours worked, and a summary of work.

1. For each entry, return:
   - the same "id"
   - a short "performance" comment
   - one "learning_note"

2. Then provide:
   - "summary": a single paragraph summarizing overall performance
   - "overall_rating": number from 1.0 to 5.0

Return strictly in this JSON format:

{
  "summary": "Overall team performed well...",
  "overall_rating": 4.5,
  "entries": [
    {
      "id": "UUID-123",
      "performance": "Completed tasks efficiently.",
      "learning_note": "Improved knowledge of Docker and CI/CD."
    }
  ]
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
    const match = json.response.match(/\{[\s\S]*\}/); // match full JSON block
    if (!match) throw new Error("Full JSON object not found in response.");

    const result = JSON.parse(match[0]);
    return result as OllamaAnalysisResult;
  } catch (err) {
    console.error("Failed to parse Ollama response:", json.response);
    throw err;
  }
}
