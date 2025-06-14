// components/charts/RatingsChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RatingsChartProps {
  data: { month_year: string; rating: number }[];
}

export default function RatingsChart({ data }: RatingsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="month_year" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} domain={[0, 10]} />
        <Tooltip />
        <Bar dataKey="rating" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
