import Papa from "papaparse";
import * as XLSX from "xlsx";

export async function parseTimesheetFile(file: File): Promise<any[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return await parseCSV(file);
  } else if (extension === "xlsx") {
    return await parseExcel(file);
  } else {
    throw new Error("Unsupported file type. Please upload CSV or Excel file.");
  }
}

async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(normalizeData(results.data));
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

async function parseExcel(file: File): Promise<any[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet);
  console.log(normalizeData(json));
  return normalizeData(json);
}

function normalizeData(rows: any[]): any[] {
  return rows.map((row) => ({
    date: row["Date"] || row["date"],
    emp_id: row["Employee ID"] || row["emp_id"],
    name: row["Name"] || row["name"],
    project: row["Project"] || row["project"],
    hours_worked: parseFloat(row["Hours"] || row["hours_worked"] || 0),
    work_summary: row["Summary"] || row["work_summary"] || "",
    is_leave:
      row["Leave"]?.toString().toLowerCase() === "yes" ||
      row["is_leave"] === true,
  }));
}
