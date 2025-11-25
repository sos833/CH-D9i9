
"use client";

import AppLayout from '@/components/app-layout';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import OverviewChart from './components/overview-chart';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from '@/context/app-context';
import { isToday, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { customers, transactions } = useApp();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const totalDebt = customers.reduce((sum, customer) => sum + customer.totalDebt, 0);
  const todaySales = transactions.filter(t => isToday(parseISO(t.date)));
  const todayRevenue = todaySales.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0);

  if (!isClient) {
    // Render a loading state or skeleton on the server
    return (
       <AppLayout>
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
               <PageHeader title="لوحة المعلومات" description="نظرة عامة على أداء متجرك." />
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card><CardContent className="p-6 h-28"></CardContent></Card>
              <Card><CardContent className="p-6 h-28"></CardContent></Card>
              <Card><CardContent className="p-6 h-28"></CardContent></Card>
              <Card><CardContent className="p-6 h-28"></CardContent></Card>
            </div>
             <div className="grid gap-4 grid-cols-1">
                <Card><CardContent className="p-6 h-96"></CardContent></Card>
            </div>
          </div>
       </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <PageHeader title="لوحة المعلومات" description="نظرة عامة على أداء متجرك." />
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="إيرادات اليوم (النقدية)" 
            value={`د.ج ${todayRevenue.toFixed(2)}`}
            icon={<DollarSign />} 
            description={`${todaySales.length} عملية بيع اليوم`} 
          />
          <StatCard 
            title="إجمالي الديون" 
            value={`د.ج ${totalDebt.toFixed(2)}`}
            icon={<CreditCard />} 
            description={`${customers.filter(c => c.totalDebt > 0).length} عملاء مدينون`} 
          />
           <StatCard 
            title="إجمالي المبيعات" 
            value={transactions.length.toString()} 
            icon={<Activity />} 
            description="إجمالي عدد المعاملات" 
          />
          <StatCard 
            title="إجمالي العملاء" 
            value={`${customers.length}`}
            icon={<Users />} 
            description="عدد العملاء المسجلين" 
          />
        </div>
        <div className="grid gap-4 grid-cols-1">
          <Tabs defaultValue="month" className="space-y-4">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="day">اليوم</TabsTrigger>
                <TabsTrigger value="week">الأسبوع</TabsTrigger>
                <TabsTrigger value="month">الشهر</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="day" className="space-y-4">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>نظرة عامة على أرباح اليوم</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <OverviewChart viewMode="day" />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="week" className="space-y-4">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>نظرة عامة على أرباح الأسبوع</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <OverviewChart viewMode="week" />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="month" className="space-y-4">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>نظرة عامة على أرباح الشهر</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <OverviewChart viewMode="month" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

    