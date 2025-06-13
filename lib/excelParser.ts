//..lib/excelParser.ts


import Papa from "papaparse";
import * as XLSX from "xlsx";

export async function parseTimesheetFile(file: File): Promise<any[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return await parseCSV(file);
  } else if (extension === "xlsx") {
    return await parseTimesheetExcel(file);
  } else {
    throw new Error("Unsupported file type. Please upload CSV or Excel.");
  }
}

async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(normalizeData(results.data)),
      error: reject,
    });
  });
}

// ✅ Now exported
export async function parseTimesheetExcel(file: File): Promise<any[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  return normalizeData(rows);
}

function normalizeData(rows: any[]): any[] {
  return rows
    .map((row: any) => {
      const day = row["Day"]?.toLowerCase();
      const dateStr = row["Date"] || row["date"];

      const isWeekend = day === "saturday" || day === "sunday";
      const isLeave = !row["Work Done"] && !row["Hours Worked"];

      return {
        date: new Date(dateStr).toISOString().slice(0, 10),
        day: row["Day"],
        emp_id: row["Employee ID"] || row["emp_id"],
        name: row["Name"] || row["name"],
        project: row["Project"] || "",
        team: row["Team"] || "",
        hours_worked: parseFloat(row["Hours Worked"]) || 0,
        work_assigned: row["Work Assigned"] || "",
        work_done: row["Work Done"] || "",
        is_leave: isLeave || isWeekend,
        is_weekend: isWeekend,
        month_year: new Date(dateStr).toISOString().slice(0, 7),
      };
    })
    .filter((row) => row.date); // filter out blanks
}
