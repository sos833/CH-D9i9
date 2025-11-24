
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { subDays, format, startOfWeek, startOfMonth, eachDayOfInterval, getDay, eachHourOfInterval, startOfHour, endOfDay, subHours, parseISO } from "date-fns"
import { ar } from "date-fns/locale"
import { useApp } from "@/context/app-context"

export default function OverviewChart({ viewMode }: { viewMode: 'day' | 'week' | 'month' }) {
  const { dailySummaries } = useApp();

  const generateChartData = () => {
    const now = new Date();
    
    if (viewMode === 'day') {
       const todaySummary = dailySummaries.find(s => format(parseISO(s.date), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'));
       // For day view, maybe we can show something else or just a single bar
       // For now, let's return a single point or an empty array if no summary for today
       return todaySummary ? [{ name: 'اليوم', total: todaySummary.profit }] : [];
    }

    if (viewMode === 'week') {
      const weekStart = startOfWeek(now, { locale: ar });
      const days = eachDayOfInterval({ start: weekStart, end: now });
      return days.map(day => {
        const daySummary = dailySummaries.find(s => format(parseISO(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
        return { 
          name: format(day, 'EEEE', { locale: ar }), 
          total: daySummary ? daySummary.profit : 0 
        };
      });
    }

    if (viewMode === 'month') {
        const monthStart = startOfMonth(now);
        const days = eachDayOfInterval({ start: monthStart, end: now });
        return days.map(day => {
            const daySummary = dailySummaries.find(s => format(parseISO(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
            return { 
                name: format(day, 'd MMM'), 
                total: daySummary ? daySummary.profit : 0 
            };
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
