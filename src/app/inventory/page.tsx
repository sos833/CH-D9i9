"use client";

import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockProducts } from "@/lib/data";
import { columns } from "./components/columns";
import React from "react";
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

export default function InventoryPage() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, you would handle form submission here
    toast({
      title: "تم الحفظ",
      description: "تمت إضافة المنتج بنجاح.",
    });
    setOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <PageHeader title="المخزون" description="إدارة المنتجات والأسعار والمخزون." />
        <div className="ml-auto flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  إضافة منتج
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المنتج الجديد لإضافته إلى المخزون.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product-name" className="text-right">
                    الاسم
                  </Label>
                  <Input id="product-name" placeholder="اسم المنتج" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="barcode" className="text-right">
                    الباركود
                  </Label>
                  <Input id="barcode" placeholder="الباركود (اختياري)" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cost-price" className="text-right">
                    سعر التكلفة
                  </Label>
                  <Input id="cost-price" type="number" placeholder="0.00" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="selling-price" className="text-right">
                    سعر البيع
                  </Label>
                  <Input id="selling-price" type="number" placeholder="0.00" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">إلغاء</Button>
                </DialogClose>
                <Button onClick={handleSave}>حفظ المنتج</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={mockProducts}
        filterColumnId="name"
        filterPlaceholder="تصفية المنتجات..."
      />
    </AppLayout>
  );
}
