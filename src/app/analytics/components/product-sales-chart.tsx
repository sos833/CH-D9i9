"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useApp } from "@/context/app-context";
import { useMemo } from "react";
import type { Transaction } from "@/lib/types";

export default function ProductSalesChart() {
  const { transactions } = useApp();

  const productSalesData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const salesCount: { [key: string]: { name: string; count: number } } = {};

    transactions.forEach(transaction => {
      // We only care about actual sales, not debt payments
      if (transaction.items.some(item => item.productId === 'DEBT_PAYMENT')) {
          return;
      }
      
      transaction.items.forEach(item => {
        if (!salesCount[item.productId]) {
          salesCount[item.productId] = { name: item.productName, count: 0 };
        }
        salesCount[item.productId].count += item.quantity;
      });
    });
    
    return Object.values(salesCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Get top 10 best-selling products

  }, [transactions]);

  if (productSalesData.length === 0) {
    return <div className="text-center text-muted-foreground p-8">لا توجد بيانات مبيعات لعرضها.</div>;
  }

  return (
    <ChartContainer config={{}} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={productSalesData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            width={120}
            interval={0}
          />
          <Tooltip 
             cursor={{ fill: 'hsl(var(--muted))' }}
             content={<ChartTooltipContent formatter={(value, name) => [`${value} مبيعات`, name]} />}
          />
          <Bar dataKey="count" name="عدد المبيعات" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
