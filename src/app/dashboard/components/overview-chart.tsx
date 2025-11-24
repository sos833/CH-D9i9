
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { subDays, format, startOfWeek, startOfMonth, eachDayOfInterval, getDay, eachHourOfInterval, startOfHour, endOfDay, subHours } from "date-fns"
import { ar } from "date-fns/locale"
import { useApp } from "@/context/app-context"
import { parseISO } from "date-fns"


export default function OverviewChart({ viewMode }: { viewMode: 'day' | 'week' | 'month' }) {
  const { transactions } = useApp();

  const generateChartData = () => {
    const now = new Date();
    
    if (viewMode === 'day') {
      const hours = eachHourOfInterval({
        start: subHours(startOfHour(now), 23),
        end: startOfHour(now)
      });
      return hours.map(hour => {
        const total = transactions
          .filter(t => {
            const tDate = parseISO(t.date);
            return tDate >= hour && tDate < new Date(hour.getTime() + 60 * 60 * 1000);
          })
          .reduce((sum, t) => sum + t.total, 0);
        return { name: format(hour, 'HH:mm'), total };
      });
    }

    if (viewMode === 'week') {
      const weekStart = startOfWeek(now, { locale: ar });
      const days = eachDayOfInterval({ start: weekStart, end: now });
      return days.map(day => {
        const total = transactions
          .filter(t => format(parseISO(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
          .reduce((sum, t) => sum + t.total, 0);
        return { name: format(day, 'EEEE', { locale: ar }), total };
      });
    }

    if (viewMode === 'month') {
        const monthStart = startOfMonth(now);
        const days = eachDayOfInterval({ start: monthStart, end: now });
        return days.map(day => {
            const total = transactions
              .filter(t => format(parseISO(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
              .reduce((sum, t) => sum + t.total, 0);
            return { name: format(day, 'd MMM'), total };
        });
    }
    
    return [];
  };

  const data = generateChartData();

  return (
    <ChartContainer config={{}} className="min-h-[250px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
           <CartesianGrid vertical={false} />
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
            tickFormatter={(value) => `${value} د.ج`}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent formatter={(value) => `${value} د.ج`} />}
          />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
