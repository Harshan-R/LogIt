// ..app/dashboard/reports/export/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { exportChartAsImage } from "@/components/ChartExporter";
import { generatePDFWithCharts } from "@/lib/pdfGenerator";
import { saveAs } from "file-saver";
import RatingsChart from "@/components/charts/RatingsChart";
import HoursChart from "@/components/charts/HoursChart";
import RadialChart from "@/components/charts/RadialChart";
import { Skeleton } from "@/components/ui/skeleton";

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
    const blob = new Blob([bufferCopy], { type: "application/pdf" });
    saveAs(blob, `Report_${data.employee.name}.pdf`);
    setLoading(false);
  };

  if (!data) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-40 w-40 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Export Report for {data.employee.name}
      </h1>

      <Button onClick={handleExport} disabled={loading}>
        {loading ? "Generating PDF..." : "Export PDF"}
      </Button>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Chart 1: Ratings Over Time */}
        <div className="w-full h-[300px]" id="ratings-chart">
          <RatingsChart data={data.summaries} />
        </div>

        {/* Chart 2: Hours Worked Over Time */}
        <div className="w-full h-[300px]" id="hours-chart">
          <HoursChart data={data.timesheets} />
        </div>
      </div>

      {/* Chart 3: Average Rating (Radial) */}
      <div
        id="average-rating-chart"
        className="w-[200px] h-[200px] mt-8 mx-auto"
      >
        <RadialChart rating={data.average_rating} />
      </div>
    </div>
  );
}
