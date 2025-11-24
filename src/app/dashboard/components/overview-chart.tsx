"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { subDays, format } from "date-fns"
import { ar } from "date-fns/locale"

type OverviewChartProps = {
  viewMode: 'day' | 'week' | 'month';
};

const generateChartData = (viewMode: 'day' | 'week' | 'month') => {
  const now = new Date();
  let data = [];

  switch (viewMode) {
    case 'day':
      // Show last 24 hours
      for (let i = 23; i >= 0; i--) {
        const date = subDays(now, i / 24); // Not precise, but good for hourly demo
        data.push({
          name: `${23-i}:00`,
          total: Math.floor(Math.random() * 1000) + 200,
        });
      }
      break;
    case 'week':
       // Show last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        data.push({
          name: format(date, 'EEEE', { locale: ar }),
          total: Math.floor(Math.random() * 5000) + 1000,
        });
      }
      break;
    case 'month':
    default:
       // Show last 30 days
       for (let i = 29; i >= 0; i--) {
        const date = subDays(now, i);
        data.push({
          name: format(date, 'd MMM', { locale: ar }),
          total: Math.floor(Math.random() * 8000) + 1500,
        });
      }
      break;
  }
  return data;
}


export default function OverviewChart({ viewMode }: OverviewChartProps) {
  const data = generateChartData(viewMode);
  return (
    <ChartContainer config={{}} className="min-h-[250px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `د.ج ${value}`}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent />}
          />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
