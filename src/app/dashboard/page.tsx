"use client";

import AppLayout from '@/components/app-layout';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, CreditCard, Activity, Power } from 'lucide-react';
import OverviewChart from './components/overview-chart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from '@/context/app-context';


export default function DashboardPage() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const { customers, products } = useApp();

  const totalDebt = customers.reduce((sum, customer) => sum + customer.totalDebt, 0);

  const handleSave = () => {
    // Here you would typically save the data to your backend
    console.log("Saving end of day summary...");
    toast({
      title: "تم الحفظ",
      description: "تم حفظ ملخص نهاية اليوم بنجاح.",
    });
    setOpen(false); // Close the dialog
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <PageHeader title="لوحة المعلومات" description="نظرة عامة على أداء متجرك." />
          <div className="ml-auto flex items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <Power className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    نهاية اليوم
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>ملخص نهاية اليوم</DialogTitle>
                  <DialogDescription>
                    أدخل تفاصيل الإيرادات والمصروفات والديون لهذا اليوم.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="daily-income" className="text-right">
                      المدخلات
                    </Label>
                    <Input id="daily-income" type="number" placeholder="0.00" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expenses" className="text-right">
                      المخرجات
                    </Label>
                    <Input id="expenses" type="number" placeholder="0.00" className="col-span-3" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="profit" className="text-right">
                      الربح
                    </Label>
                    <Input id="profit" type="number" placeholder="0.00" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="debts" className="text-right">
                      ديون جديدة
                    </Label>
                    <Input id="debts" type="number" placeholder="0.00" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      إلغاء
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={handleSave}>حفظ</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="إجمالي الإيرادات" 
            value="د.ج 45,231.89" 
            icon={<DollarSign />} 
            description="+20.1% عن الشهر الماضي" 
          />
          <StatCard 
            title="إجمالي الديون" 
            value={`د.ج ${totalDebt.toFixed(2)}`}
            icon={<CreditCard />} 
            description={`${customers.filter(c => c.totalDebt > 0).length} عملاء مدينون`} 
          />
           <StatCard 
            title="مبيعات اليوم" 
            value="+573" 
            icon={<Activity />} 
            description="+201 since last hour" 
          />
          <StatCard 
            title="عملاء جدد" 
            value={`+${customers.length}`}
            icon={<Users />} 
            description="إجمالي العملاء" 
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
