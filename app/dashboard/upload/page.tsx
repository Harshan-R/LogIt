// ../app/dashboard/uplaod/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file");

    setLoading(true);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records: jsonData }),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success("Sheet uploaded successfully!");
    } else {
      toast.error(result.error || "Upload failed");
    }

    setLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto mt-12 p-6 space-y-6">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">Upload Timesheet</h2>
        <Input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
        />
        <Button onClick={handleUpload} disabled={loading || !file}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </CardContent>
    </Card>
  );
}
