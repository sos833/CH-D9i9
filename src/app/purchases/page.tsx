
"use client";

import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { columns as columnsDef } from "./components/columns";
import { useApp } from "@/context/app-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as React from "react";
import type { Purchase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function PurchasesPage() {
  const { purchases, loading } = useApp();
  const [selectedPurchase, setSelectedPurchase] = React.useState<Purchase | null>(null);
  const router = useRouter();

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
  };

  const purchaseColumns = columnsDef({ onViewDetails: handleViewDetails });

  return (
    <AppLayout>
       <div className="flex items-center justify-between">
        <PageHeader title="المشتريات" description="عرض جميع فواتير الشراء المسجلة." />
        <Button size="sm" className="h-8 gap-1" onClick={() => router.push('/purchases/new')}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              فاتورة شراء جديدة
            </span>
        </Button>
      </div>

      {loading ? (
        <div className="rounded-md border h-96 flex items-center justify-center">
            <p>جار تحميل البيانات...</p>
        </div>
       ) : (
        <DataTable
            columns={purchaseColumns}
            data={purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
            filterColumnId="supplierName"
            filterPlaceholder="تصفية حسب اسم المورد..."
        />
       )}

      {selectedPurchase && (
        <Dialog open={!!selectedPurchase} onOpenChange={(isOpen) => !isOpen && setSelectedPurchase(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تفاصيل فاتورة الشراء</DialogTitle>
              <DialogDescription>
                معرف الفاتورة: {selectedPurchase.id}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="py-4 pr-6">
                <p><strong>التاريخ:</strong> {new Date(selectedPurchase.date).toLocaleString('ar-DZ')}</p>
                <p><strong>المورد:</strong> {selectedPurchase.supplierName}</p>
                <Separator className="my-4" />
                <h4 className="font-semibold mb-2">المنتجات:</h4>
                <ul className="grid gap-3">
                  {selectedPurchase.items.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground"> (x{item.quantity})</span>
                      </div>
                      <span>بسعر: {item.costPrice.toFixed(2)} د.ج</span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>التكلفة الإجمالية:</span>
                  <span>{selectedPurchase.totalCost.toFixed(2)} د.ج</span>
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
