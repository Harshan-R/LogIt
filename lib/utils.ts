import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getMonthYearFromParsedRows(rows: { date: string }[]): string {
  if (!rows.length) return "UNKNOWN";
  const date = new Date(rows[0].date);
  const month = date.toLocaleString("default", { month: "long" }).toUpperCase();
  const year = date.getFullYear();
  return `${month} ${year}`; // e.g., "JUNE 2025"
}
