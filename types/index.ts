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

export type OllamaAnalysisEntry = {
  id: string;
  performance: string;
  learning_note: string;
};

export type OllamaAnalysisResult = {
  summary: string;
  overall_rating: number;
  entries: OllamaAnalysisEntry[];
};
