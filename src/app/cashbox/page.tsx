
"use client";

import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/app-context";
import React from "react";
import { z } from "zod";
import type { CashWithdrawal } from "@/lib/types";
import { Banknote } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns as withdrawalColumns } from "./components/columns";

const withdrawalSchema = z.object({
  amount: z.coerce.number().min(0.01, "مبلغ السحب يجب أن يكون أكبر من صفر."),
});

export default function CashboxPage() {
  const { storeSettings, transactions, cashWithdrawals, setCashWithdrawals } = useApp();
  const { toast } = useToast();
  const [isClient, setIsClient] = React.useState(false);
  const [openWithdrawal, setOpenWithdrawal] = React.useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = React.useState('');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const totalCashSales = (transactions || [])
    .filter(t => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.total, 0);
  
  const totalWithdrawn = (cashWithdrawals || []).reduce((sum, w) => sum + w.amount, 0);

  const initialCash = storeSettings?.initialCash || 0;
  const currentCashInBox = initialCash + totalCashSales - totalWithdrawn;

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
    
    setCashWithdrawals(prev => [...(prev || []), newWithdrawal]);
    
    toast({
      title: "تم السحب بنجاح",
      description: `تم سحب مبلغ ${amountToWithdraw.toFixed(2)} د.ج من الصندوق.`,
    });

    setOpenWithdrawal(false);
    setWithdrawalAmount('');
  };

  if (!isClient) {
    return (
      <AppLayout>
        <PageHeader title="صندوق النقد (لاكاس)" description="إدارة النقدية وسجل السحوبات." />
        <div className="h-96 w-full rounded-lg border flex items-center justify-center mt-4">
          <p>جار التحميل...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
         <PageHeader title="صندوق النقد (لاكاس)" description="إدارة النقدية وسجل السحوبات." />
         <Dialog open={openWithdrawal} onOpenChange={setOpenWithdrawal}>
            <DialogTrigger asChild>
              <Button>
                سحب أموال
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>سحب أموال من الصندوق</DialogTitle>
                <DialogDescription>
                  الرصيد الحالي: {currentCashInBox.toFixed(2)} د.ج
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
      </div>
     
      <div className="grid gap-4 md:grid-cols-3 grid-cols-1 mt-4">
        <StatCard 
            title="الرصيد الحالي في الصندوق" 
            value={`د.ج ${currentCashInBox.toFixed(2)}`}
            icon={<Banknote />} 
            description={`يبدأ بـ ${initialCash.toFixed(2)} د.ج الأولي`}
        />
        <StatCard 
            title="إجمالي المبيعات النقدية" 
            value={`د.ج ${totalCashSales.toFixed(2)}`}
            icon={<Banknote />} 
            description={`منذ بداية الاستخدام`}
        />
        <StatCard 
            title="إجمالي المبالغ المسحوبة" 
            value={`د.ج ${totalWithdrawn.toFixed(2)}`}
            icon={<Banknote />} 
            description={`${(cashWithdrawals || []).length} عملية سحب`}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold tracking-tight mb-4">سجل عمليات السحب</h3>
        <DataTable
            columns={withdrawalColumns}
            data={(cashWithdrawals || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
            filterColumnId="date" // Filtering might not be ideal here, but need to provide a prop
            filterPlaceholder="لا يوجد فلتر لهذه القائمة"
        />
      </div>

    </AppLayout>
  );
}

    