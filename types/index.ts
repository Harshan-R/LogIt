// types/index.ts

// export type ParsedTimesheetRow = {
//   date: string;
//   day: string;
//   emp_id: string;
//   name?: string;
//   project: string;
//   team: string;
//   hours_worked: number;
//   work_assigned: string;
//   work_done: string;
//   is_leave: boolean;
//   is_weekend: boolean;
//   month_year: string;
// };

export interface SummaryInsert {
  employee_id: string; // UUID from employees table
  month_year: string; // "YYYY-MM"
  summary: string;
  rating: number; // 0 to 10
  json_data: ParsedTimesheetRow[];
}

// export interface OllamaEntryResult {
//   date: string;
//   performance: string;
//   learning_note: string;
//}

// export interface OllamaAnalysisResult {
//   entries: OllamaEntryResult[];
//   summary: string;
//   overall_rating: number;
// }

export type ParsedTimesheetRow = {
  date: string;
  day: string;
  project: string;
  team: string;
  hours_worked: number;
  work_assigned: string;
  work_done: string;
  is_leave?: boolean;
};

export interface OllamaAnalysisResult {
  emp_id: string;
  month_year: string;
  summary: string;
  rating: number;
  json_data: ParsedTimesheetRow[];
}
