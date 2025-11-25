
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { subDays, format, startOfWeek, startOfMonth, eachDayOfInterval, parseISO, endOfDay, isWithinInterval, addDays } from "date-fns"
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
       const todayTransactions = transactions.filter(t => format(parseISO(t.date), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'));
       const profit = calculateProfit(todayTransactions, products);
       return [{ name: 'اليوم', total: profit }];
    }

    if (viewMode === 'week') {
      const weekStart = startOfWeek(now, { locale: ar });
      const days = eachDayOfInterval({ start: weekStart, end: now });

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
        // We will group by week
        let currentDay = monthStart;
        const data = [];
        while(currentDay <= now) {
            const weekEnd = endOfDay(addDays(currentDay, 6));
            const weekTransactions = transactions.filter(t => {
                const transactionDate = parseISO(t.date);
                return isWithinInterval(transactionDate, { start: currentDay, end: weekEnd });
            });
            const profit = calculateProfit(weekTransactions, products);
            data.push({
                name: `أسبوع ${format(currentDay, 'd')}`,
                total: profit
            });
            currentDay = addDays(weekEnd, 1);
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
            content={<ChartTooltipContent formatter={(value) => `${(value as number).toFixed(2)} د.ج`} nameKey="name" labelKey="total" />}
          />
          <Bar dataKey="total" name="الربح" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
