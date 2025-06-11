// ..app/dashboard/reports/export/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { exportChartAsImage } from "@/components/ChartExporter";
import { generatePDFWithCharts } from "@/lib/pdfGenerator";
import { saveAs } from "file-saver";

export default function ExportPDFPage() {
  const searchParams = useSearchParams();
  const empId = searchParams.get("empId"); // ?empId=uuid
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (empId) {
      const fetchData = async () => {
        const res = await fetch(`/api/dashboard/summary?empId=${empId}`);
        const json = await res.json();
        setData(json);
      };
      fetchData();
    }
  }, [empId]);

  const handleExport = async () => {
    if (!data) return;

    setLoading(true);

    const barChartImage = await exportChartAsImage("ratings-chart");
    const areaChartImage = await exportChartAsImage("hours-chart");
    const radialChartImage = await exportChartAsImage("average-rating-chart");

    const pdfBuffer = await generatePDFWithCharts({
      orgName: data.orgName || "LogIt",
      employee: {
        emp_id: data.employee.emp_id,
        name: data.employee.name,
        designation: data.employee.designation,
      },
      timesheets: data.timesheets,
      summaries: data.summaries,
      average_rating: data.average_rating,
      barChartImg: barChartImage!,
      areaChartImg: areaChartImage!,
      radialChartImg: radialChartImage!,
    });

    const bufferCopy = new Uint8Array(pdfBuffer.length);
    bufferCopy.set(pdfBuffer);

    //const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const blob = new Blob([bufferCopy], { type: "application/pdf" });
    saveAs(blob, `Report_${data.employee.name}.pdf`);
    setLoading(false);
  };

  if (!data) return <p className="p-6">Loading employee data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Export Report for {data.employee.name}
      </h1>
      <Button onClick={handleExport} disabled={loading}>
        {loading ? "Generating PDF..." : "Export PDF"}
      </Button>

      {/* Render chart containers visible to ChartExporter */}
      <div id="ratings-chart" className="w-[300px] h-[200px] mt-8">
        {/* <RatingsChart data={...} /> */}
      </div>
      <div id="hours-chart" className="w-[300px] h-[200px] mt-4">
        {/* <HoursChart data={...} /> */}
      </div>
      <div
        id="average-rating-chart"
        className="w-[150px] h-[150px] mt-4 rounded-full"
      >
        {/* <RadialChart data={...} /> */}
      </div>
    </div>
  );
}
