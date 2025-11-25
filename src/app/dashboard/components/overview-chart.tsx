
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { subDays, format, startOfWeek, startOfMonth, eachDayOfInterval, parseISO, endOfDay, isWithinInterval, addDays, endOfMonth, startOfDay, endOfHour, startOfHour, eachHourOfInterval, isSameDay } from "date-fns"
import { ar } from "date-fns/locale"
import { useApp } from "@/context/app-context"
import { useMemo } from "react"
import type { Transaction, Product } from "@/lib/types"

const calculateProfit = (transactions: Transaction[], products: Product[]) => {
  let totalProfit = 0;
  const productMap = new Map(products.map(p => [p.id, p]));

  transactions.forEach(transaction => {
    // Exclude debt payments from profit calculation
    if (transaction.items.some(item => item.productId === 'DEBT_PAYMENT')) {
      return;
    }
    transaction.items.forEach(item => {
      const product = productMap.get(item.productId);
      const costPrice = product ? product.costPrice : 0;
      const profitPerItem = item.price - costPrice;
      totalProfit += profitPerItem * item.quantity;
    });
  });

  return totalProfit;
};


export default function OverviewChart({ viewMode }: { viewMode: 'day' | 'week' | 'month' }) {
  const { transactions, products } = useApp();

  const chartData = useMemo(() => {
    const now = new Date();
    
    if (viewMode === 'day') {
       const todayStart = startOfDay(now);
       const todayEnd = endOfDay(now);
       const hours = eachHourOfInterval({ start: todayStart, end: todayEnd });

       return hours.map(hour => {
         const hourStart = startOfHour(hour);
         const hourEnd = endOfHour(hour);
         const hourTransactions = transactions.filter(t => {
           const transactionDate = parseISO(t.date);
           return isWithinInterval(transactionDate, { start: hourStart, end: hourEnd });
         });
         const profit = calculateProfit(hourTransactions, products);
         return {
           name: format(hour, 'HH:00'),
           total: profit
         };
       });
    }

    if (viewMode === 'week') {
      const weekStart = startOfWeek(now, { locale: ar });
      const weekEnd = addDays(weekStart, 6);
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

      return days.map(day => {
        const dayTransactions = transactions.filter(t => format(parseISO(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
        const profit = calculateProfit(dayTransactions, products);
        return { 
          name: format(day, 'EEE', { locale: ar }), 
          total: profit 
        };
      });
    }

    if (viewMode === 'month') {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        
        let currentDay = monthStart;
        const data = [];
        let weekCount = 1;

        while(currentDay <= monthEnd && weekCount <= 4) {
            const weekEnd = endOfDay(addDays(currentDay, 6));
            const intervalEnd = weekEnd > monthEnd ? monthEnd : weekEnd;

            const weekTransactions = transactions.filter(t => {
                const transactionDate = parseISO(t.date);
                return isWithinInterval(transactionDate, { start: currentDay, end: intervalEnd });
            });
            const profit = calculateProfit(weekTransactions, products);
data.push({
                name: `الأسبوع ${weekCount}`,
                total: profit
            });

            currentDay = addDays(intervalEnd, 1);
            weekCount++;
        }
        return data;
    }
    
    return [];
  }, [viewMode, transactions, products]);

  return (
    <ChartContainer config={{}} className="min-h-[250px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
           <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={viewMode === 'day' ? 2 : 0}
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
            content={<ChartTooltipContent formatter={(value, name) => [`${(value as number).toFixed(2)} د.ج`, `الربح في ${name}`]} />}
          />
          <Bar dataKey="total" name="الربح" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
