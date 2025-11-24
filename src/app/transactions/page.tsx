
"use client";

import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns";
import { useApp } from "@/context/app-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import * as React from "react";
import type { Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function TransactionsPage() {
  const { transactions } = useApp();
  const [isClient, setIsClient] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const transactionColumns = columns({ onViewDetails: handleViewDetails });

  return (
    <AppLayout>
      <PageHeader title="المعاملات" description="عرض جميع المعاملات والمبيعات المسجلة." />
      {isClient ? (
        <DataTable
            columns={transactionColumns}
            data={transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
            filterColumnId="customerName"
            filterPlaceholder="تصفية حسب اسم العميل..."
        />
       ) : (
            <div className="rounded-md border h-96 flex items-center justify-center">
                <p>جار تحميل البيانات...</p>
            </div>
       )}

      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={(isOpen) => !isOpen && setSelectedTransaction(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تفاصيل المعاملة</DialogTitle>
              <DialogDescription>
                معرف المعاملة: {selectedTransaction.id}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="py-4 pr-6">
                <p><strong>التاريخ:</strong> {new Date(selectedTransaction.date).toLocaleString('ar-DZ')}</p>
                <p><strong>طريقة الدفع:</strong> {selectedTransaction.paymentMethod === 'cash' ? 'نقدي' : 'دين'}</p>
                {selectedTransaction.customerName && <p><strong>العميل:</strong> {selectedTransaction.customerName}</p>}
                <Separator className="my-4" />
                <h4 className="font-semibold mb-2">المنتجات:</h4>
                <ul className="grid gap-3">
                  {selectedTransaction.items.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground"> (x{item.quantity})</span>
                      </div>
                      <span>{(item.price * item.quantity).toFixed(2)} د.ج</span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي:</span>
                  <span>{selectedTransaction.total.toFixed(2)} د.ج</span>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  إغلاق
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
