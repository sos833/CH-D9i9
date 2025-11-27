"use client";

import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  DraggableDialog,
  DraggableDialogContent,
  DraggableDialogDescription,
  DraggableDialogHeader,
  DraggableDialogTitle,
  DraggableDialogFooter,
  DraggableDialogClose,
  DraggableDialogBody,
} from "@/components/ui/draggable-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/app-context";
import React from "react";
import { z } from "zod";
import type { CashWithdrawal } from "@/lib/types";
import { Banknote, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns as withdrawalColumns } from "./components/columns";

const withdrawalSchema = z.object({
  amount: z.coerce.number().min(0.01, "مبلغ السحب يجب أن يكون أكبر من صفر."),
});

export default function CashboxPage() {
  const { storeSettings, transactions, cashWithdrawals, addCashWithdrawal, loading } = useApp();
  const { toast } = useToast();
  const [openWithdrawal, setOpenWithdrawal] = React.useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = React.useState('');

  const totalCashSales = (transactions || [])
    .filter(t => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.total, 0);
  
  const totalWithdrawn = (cashWithdrawals || []).reduce((sum, w) => sum + w.amount, 0);

  const initialCash = storeSettings?.initialCash || 0;
  const currentCashInBox = initialCash + totalCashSales - totalWithdrawn;

  const handleSaveWithdrawal = async () => {
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
        title: "رصيد غير كافٍ",
        description: "لا يمكنك سحب مبلغ أكبر من الموجود في الصندوق.",
      });
      return;
    }

    const newWithdrawal: Omit<CashWithdrawal, 'id'> = {
      date: new Date().toISOString(),
      amount: amountToWithdraw,
    };
    
    await addCashWithdrawal(newWithdrawal);
    
    toast({
      title: "تم السحب بنجاح",
      description: `تم سحب مبلغ ${amountToWithdraw.toFixed(2)} د.ج من الصندوق.`,
    });

    setOpenWithdrawal(false);
    setWithdrawalAmount('');
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="صندوق النقد (لاكاس)" description="إدارة النقدية وسجل السحوبات." />
        <div className="h-96 w-full rounded-lg border flex items-center justify-center mt-4">
          <p className="text-muted-foreground">جار التحميل...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="صندوق النقد (لاكاس)" description="إدارة النقدية وسجل السحوبات." />
        
        <Button onClick={() => setOpenWithdrawal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          سحب أموال
        </Button>
      </div>
     
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-6">
        <StatCard 
            title="الرصيد الحالي (الكاش)" 
            value={`${currentCashInBox.toFixed(2)} د.ج`}
            icon={<Banknote className="h-4 w-4 text-muted-foreground" />} 
            description={`يبدأ بـ ${initialCash.toFixed(2)} د.ج الأولي`}
        />
        <StatCard 
            title="إجمالي المبيعات (كاش)" 
            value={`${totalCashSales.toFixed(2)} د.ج`}
            icon={<Banknote className="h-4 w-4 text-green-500" />} 
            description={`منذ بداية الاستخدام`}
        />
        <StatCard 
            title="إجمالي المسحوبات" 
            value={`${totalWithdrawn.toFixed(2)} د.ج`}
            icon={<Banknote className="h-4 w-4 text-red-500" />} 
            description={`${(cashWithdrawals || []).length} عملية سحب`}
        />
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-bold tracking-tight">سجل عمليات السحب</h3>
        <div className="rounded-md border bg-card">
            <DataTable
                columns={withdrawalColumns}
                data={(cashWithdrawals || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                filterColumnId="date"
                filterPlaceholder="البحث بالتاريخ..."
            />
        </div>
      </div>

      <DraggableDialog open={openWithdrawal} onOpenChange={setOpenWithdrawal}>
        <DraggableDialogContent className="sm:max-w-[425px]" dir="rtl">
          <DraggableDialogHeader className="text-right">
            <DraggableDialogTitle>سحب أموال من الصندوق</DraggableDialogTitle>
            <DraggableDialogDescription>
              الرصيد المتوفر حالياً: <span className="font-bold text-foreground">{currentCashInBox.toFixed(2)} د.ج</span>
            </DraggableDialogDescription>
          </DraggableDialogHeader>
          <DraggableDialogBody>
            <div className="grid gap-2">
              <Label htmlFor="withdrawal-amount" className="text-right">
                المبلغ المراد سحبه (د.ج)
              </Label>
              <Input
                id="withdrawal-amount"
                type="number"
                placeholder="0.00"
                className="text-left"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
              />
            </div>
          </DraggableDialogBody>
          <DraggableDialogFooter className="gap-2 sm:gap-0">
            <DraggableDialogClose asChild>
              <Button type="button" variant="outline">
                إلغاء
              </Button>
            </DraggableDialogClose>
            <Button type="button" onClick={handleSaveWithdrawal}>تأكيد السحب</Button>
          </DraggableDialogFooter>
        </DraggableDialogContent>
      </DraggableDialog>
    </AppLayout>
  );
}
