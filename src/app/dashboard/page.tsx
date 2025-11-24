
"use client";

import AppLayout from '@/components/app-layout';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, CreditCard, Activity, Power, Banknote } from 'lucide-react';
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
import { format, isToday, parseISO } from 'date-fns';
import { z } from 'zod';
import type { CashWithdrawal } from '@/lib/types';


const summarySchema = z.object({
  income: z.coerce.number().min(0, "المدخلات يجب أن تكون رقمًا موجبًا."),
  expenses: z.coerce.number().min(0, "المخرجات يجب أن تكون رقمًا موجبًا."),
  profit: z.coerce.number(), // Can be negative
});

const withdrawalSchema = z.object({
  amount: z.coerce.number().min(0.01, "مبلغ السحب يجب أن يكون أكبر من صفر."),
});


export default function DashboardPage() {
  const { toast } = useToast();
  const [openSummary, setOpenSummary] = React.useState(false);
  const [openWithdrawal, setOpenWithdrawal] = React.useState(false);
  const { customers, transactions, dailySummaries, setDailySummaries, storeSettings, cashWithdrawals, setCashWithdrawals } = useApp();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const [summary, setSummary] = React.useState({ income: '', expenses: '', profit: '' });
  const [withdrawalAmount, setWithdrawalAmount] = React.useState('');

  const totalDebt = customers.reduce((sum, customer) => sum + customer.totalDebt, 0);
  const todaySales = transactions.filter(t => isToday(parseISO(t.date)));
  const todayRevenue = todaySales.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0);
  const totalCashSales = transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0);
  const totalWithdrawn = cashWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const currentCashInBox = storeSettings.initialCash + totalCashSales - totalWithdrawn;


  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSummary(prev => {
        const newSummary = { ...prev, [id]: value };
        const income = parseFloat(newSummary.income) || 0;
        const expenses = parseFloat(newSummary.expenses) || 0;
        const profit = income - expenses;
        return { ...newSummary, profit: isNaN(profit) ? '' : profit.toFixed(2) };
    });
  };

  const handleSaveSummary = () => {
    const result = summarySchema.safeParse({
        income: summary.income,
        expenses: summary.expenses,
        profit: summary.profit,
    });

    if (!result.success) {
        toast({
            variant: "destructive",
            title: "خطأ في الإدخال",
            description: result.error.errors[0].message,
        });
        return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const newSummary = {
      id: today,
      date: new Date().toISOString(),
      ...result.data
    };

    setDailySummaries(prev => {
      const existingIndex = prev.findIndex(s => s.id === today);
      if (existingIndex > -1) {
        const updatedSummaries = [...prev];
        updatedSummaries[existingIndex] = newSummary;
        return updatedSummaries;
      }
      return [...prev, newSummary];
    });

    toast({
      title: "تم الحفظ",
      description: "تم حفظ ملخص نهاية اليوم بنجاح.",
    });
    setOpenSummary(false); // Close the dialog
    setSummary({ income: '', expenses: '', profit: '' });
  };
  
  const handleSaveWithdrawal = () => {
    const result = withdrawalSchema.safeParse({ amount: withdrawalAmount });
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "خطأ في الإدخال",
        description: result.error.errors[0].message,
      });
      return;
    }

    const amountToWithdraw = result.data.amount;
    
    if (amountToWithdraw > currentCashInBox) {
       toast({
        variant: "destructive",
        title: "خطأ",
        description: "المبلغ المطلوب سحبه أكبر من المبلغ الموجود في الصندوق.",
      });
      return;
    }

    const newWithdrawal: CashWithdrawal = {
      id: `WDL${Date.now()}`,
      date: new Date().toISOString(),
      amount: amountToWithdraw,
    };
    
    setCashWithdrawals(prev => [...prev, newWithdrawal]);
    
    toast({
      title: "تم السحب بنجاح",
      description: `تم سحب مبلغ ${amountToWithdraw.toFixed(2)} د.ج من الصندوق.`,
    });

    setOpenWithdrawal(false);
    setWithdrawalAmount('');
  };

  if (!isClient) {
    // Render a loading state or skeleton on the server
    return (
       <AppLayout>
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
               <PageHeader title="لوحة المعلومات" description="نظرة عامة على أداء متجرك." />
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card><CardContent className="p-6 h-28"></CardContent></Card>
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
          <div className="ml-auto flex items-center gap-2">
            <Dialog open={openSummary} onOpenChange={setOpenSummary}>
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
                    أدخل تفاصيل الإيرادات والمصروفات لهذا اليوم.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income" className="text-right">
                      المدخلات
                    </Label>
                    <Input id="income" type="number" placeholder="0.00" className="col-span-3" value={summary.income} onChange={handleSummaryChange}/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expenses" className="text-right">
                      المخرجات
                    </Label>
                    <Input id="expenses" type="number" placeholder="0.00" className="col-span-3" value={summary.expenses} onChange={handleSummaryChange}/>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="profit" className="text-right">
                      الربح
                    </Label>
                    <Input id="profit" type="number" placeholder="0.00" className="col-span-3" value={summary.profit} readOnly/>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      إلغاء
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={handleSaveSummary}>حفظ</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">صندوق النقد (لاكاس)</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentCashInBox.toFixed(2)} د.ج</div>
              <p className="text-xs text-muted-foreground">
                الرصيد النقدي الحالي في الصندوق
              </p>
              <Dialog open={openWithdrawal} onOpenChange={setOpenWithdrawal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    سحب أموال
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>سحب أموال من الصندوق</DialogTitle>
                    <DialogDescription>
                      أدخل المبلغ الذي تود سحبه. الرصيد الحالي: {currentCashInBox.toFixed(2)} د.ج
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="withdrawal-amount" className="text-right">
                        المبلغ
                      </Label>
                      <Input
                        id="withdrawal-amount"
                        type="number"
                        placeholder="0.00"
                        className="col-span-3"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        إلغاء
                      </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSaveWithdrawal}>تأكيد السحب</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
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

    