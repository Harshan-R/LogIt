// components/charts/HoursChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HoursChartProps {
  data: { date: string; hours: number }[];
}

export default function HoursChart({ data }: HoursChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} />
        <Tooltip />
        <Area type="monotone" dataKey="hours" stroke="#34d399" fill="#bbf7d0" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
