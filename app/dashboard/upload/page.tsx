//..app/dashboard/upload/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parseTimesheetFile } from "@/lib/parseTimesheetFile";
import { toast } from "sonner";
import { format } from "date-fns";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
  const [monthYear, setMonthYear] = useState(
    format(new Date(), "MMMM yyyy").toUpperCase()
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) setFile(uploaded);
  };

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await parseTimesheetFile(file);
      setParsedData(result);
      toast.success("File parsed successfully!");
    } catch (err) {
      toast.error("Failed to parse file");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!employeeId || !monthYear) {
      toast.error("Please fill Employee ID and Month-Year");
      return;
    }

    if (parsedData.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/timesheets/process", {
        method: "POST",
        body: JSON.stringify({
          employee_id: employeeId.trim(),
          month_year: monthYear.trim(),
          entries: parsedData,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Upload failed");
      toast.success("Timesheets uploaded & analyzed!");
      setFile(null);
      setParsedData([]);
      setEmployeeId("");
    } catch (err) {
      toast.error("Failed to upload and analyze timesheets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-10 p-6">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">Upload Timesheet</h2>

        <Input
          placeholder="Employee ID (e.g., EMP001)"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <Input
          placeholder="Month-Year (e.g., JUNE 2025)"
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value.toUpperCase())}
        />

        <Input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />

        <div className="flex gap-2">
          <Button disabled={!file || loading} onClick={handleParse}>
            Parse
          </Button>
          <Button
            disabled={parsedData.length === 0 || loading}
            onClick={handleUpload}
            variant="outline"
          >
            Upload & Analyze
          </Button>
        </div>

        {parsedData.length > 0 && (
          <div className="border rounded p-2 text-sm max-h-80 overflow-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  {Object.keys(parsedData[0]).map((key) => (
                    <th
                      key={key}
                      className="p-1 border-b text-muted-foreground"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="p-1">
                        {val as string}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-1">
              Showing first 10 rows...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
