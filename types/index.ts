// ..types/index.ts

export type TimesheetRow = {
  id: string;
  date: string;
  emp_id: string;
  name: string;
  project: string;
  hours_worked: number;
  work_summary: string;
  is_leave: boolean;
};

export interface TimesheetEntry {
  id: string;
  employee_id: string;
  project_id: string;
  date: string;
  hours_worked: number;
  is_leave: boolean;
  work_summary: string;
}
export type OllamaAnalysisEntry = {
  id: string;
  performance: string;
  learning_note: string;
};

// export type OllamaAnalysisResult = {
//   summary: string;
//   overall_rating: number;
//   entries: OllamaAnalysisEntry[];
// };

export interface OllamaEntryResult {
  id: string;
  performance: string;
  learning_note: string;
}

export interface OllamaAnalysisResult {
  entries: OllamaEntryResult[];
  summary: string;
  overall_rating: number;
}
