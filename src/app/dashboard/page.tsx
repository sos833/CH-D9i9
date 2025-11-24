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


export default function DashboardPage() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

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
            value="د.ج 12,870.00" 
            icon={<CreditCard />} 
            description="+180.1% عن الشهر الماضي" 
          />
           <StatCard 
            title="مبيعات اليوم" 
            value="+573" 
            icon={<Activity />} 
            description="+201 since last hour" 
          />
          <StatCard 
            title="عملاء جدد" 
            value="+23" 
            icon={<Users />} 
            description="هذا الشهر" 
          />
        </div>
        <div className="grid gap-4 grid-cols-1">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>نظرة عامة على الأرباح</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <OverviewChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
