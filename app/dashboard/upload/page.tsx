// ../app/dashboard/uplaod/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parseTimesheetFile } from "@/lib/parseTimesheetFile";
import { toast } from "sonner";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile(uploaded);
    }
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
    if (parsedData.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/timesheets/process", {
        method: "POST",
        body: JSON.stringify({ entries: parsedData }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Upload failed");
      toast.success("Timesheets uploaded & analyzed!");
      setFile(null);
      setParsedData([]);
    } catch (err) {
      toast.error("Failed to upload and analyze timesheets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-10 p-6">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">Upload Timesheet</h2>
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
                    <th key={key} className="p-1 border-b text-muted-foreground">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="p-1">{val as string}</td>
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
