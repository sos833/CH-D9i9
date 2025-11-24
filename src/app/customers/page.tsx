"use client";

import * as React from "react";
import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockCustomers } from "@/lib/data";
import { columns } from "./components/columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


export default function CustomersPage() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, you'd handle form submission here
    toast({
      title: "تم الحفظ",
      description: "تمت إضافة العميل بنجاح.",
    });
    setOpen(false);
  };


  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <PageHeader title="العملاء" description="إدارة العملاء وتتبع ديونهم." />
        <div className="ml-auto flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  إضافة عميل
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل العميل الجديد لحفظه في القائمة.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    الاسم
                  </Label>
                  <Input id="name" placeholder="اسم العميل الكامل" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    الهاتف
                  </Label>
                  <Input id="phone" placeholder="0XXXXXXXXX" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    إلغاء
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleSave}>حفظ العميل</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={mockCustomers}
        filterColumnId="name"
        filterPlaceholder="تصفية العملاء..."
      />
    </AppLayout>
  );
}