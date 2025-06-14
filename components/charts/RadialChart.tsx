// components/charts/RadialChart.tsx
"use client";

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface RadialChartProps {
  rating: number; // out of 10
}

export default function RadialChart({ rating }: RadialChartProps) {
  const data = [
    {
      name: "Rating",
      value: rating,
      fill: "#f59e0b",
    },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="60%"
        outerRadius="100%"
        barSize={16}
        data={data}
        startAngle={180}
        endAngle={-180}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 10]}
          angleAxisId={0}
          tick={false}
        />
        {/* removed clockwise in the below line i.e background clockWise datakey="value"  */}
        <RadialBar background dataKey="value" cornerRadius={10} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
