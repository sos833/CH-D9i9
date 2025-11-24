"use client";

import * as React from "react";
import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockCustomers } from "@/lib/data";
import { columns as columnsDef } from "./components/columns";
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
import { useSearchParams } from 'next/navigation';
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>(mockCustomers);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openPayment, setOpenPayment] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDetails, setOpenDetails] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState("");

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const debtAmount = searchParams.get('debt');
  
  React.useEffect(() => {
    if (debtAmount) {
      setOpenAdd(true);
    }
  }, [debtAmount]);

  const handleSaveCustomer = () => {
    // In a real app, you'd handle form submission here
    toast({
      title: "تم الحفظ",
      description: "تمت إضافة العميل بنجاح.",
    });
    setOpenAdd(false);
  };
  
  const handleAddPaymentClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentAmount("");
    setOpenPayment(true);
  };

  const handleSavePayment = () => {
    if (!selectedCustomer || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "خطأ", description: "الرجاء إدخال مبلغ صحيح." });
      return;
    }
    
    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id 
        ? { ...c, totalDebt: Math.max(0, c.totalDebt - amount) } 
        : c
    ));
    
    toast({
      title: "تمت العملية",
      description: `تمت إضافة دفعة بقيمة ${amount} د.ج للعميل ${selectedCustomer.name}.`,
    });
    
    setOpenPayment(false);
    setSelectedCustomer(null);
  };
  
  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenEdit(true);
  };
  
  const handleViewDetailsClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenDetails(true);
  };
  
  const handleUpdateCustomer = () => {
     if (!selectedCustomer) return;
     // Logic to update customer would go here
     toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات العميل بنجاح.",
    });
     setOpenEdit(false);
     setSelectedCustomer(null);
  };

  const columns = columnsDef({ 
    onAddPayment: handleAddPaymentClick,
    onEdit: handleEditClick,
    onViewDetails: handleViewDetailsClick
  });

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <PageHeader title="العملاء" description="إدارة العملاء وتتبع ديونهم." />
        <div className="ml-auto flex items-center gap-2">
          {/* Add Customer Dialog */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
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
                <DialogTitle>{debtAmount ? 'إضافة دين لعميل' : 'إضافة عميل جديد'}</DialogTitle>
                <DialogDescription>
                 {debtAmount ? 'أدخل تفاصيل العميل لإضافة الدين.' : 'أدخل تفاصيل العميل الجديد لحفظه في القائمة.'}
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
                {debtAmount && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="debt" className="text-right">
                      قيمة الدين
                    </Label>
                    <Input id="debt" value={`${debtAmount} د.ج`} readOnly className="col-span-3" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    إلغاء
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveCustomer}>{debtAmount ? 'حفظ الدين' : 'حفظ العميل'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={customers}
        filterColumnId="name"
        filterPlaceholder="تصفية العملاء..."
      />

       {/* Add Payment Dialog */}
      {selectedCustomer && (
        <Dialog open={openPayment} onOpenChange={setOpenPayment}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة دفعة لـ {selectedCustomer.name}</DialogTitle>
              <DialogDescription>
                الرصيد الحالي للدين: {selectedCustomer.totalDebt.toFixed(2)} د.ج
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-amount" className="text-right">
                  المبلغ المدفوع
                </Label>
                <Input 
                  id="payment-amount" 
                  type="number" 
                  placeholder="0.00" 
                  className="col-span-3" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => setSelectedCustomer(null)}>
                  إلغاء
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSavePayment}>حفظ الدفعة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
       {/* Edit Customer Dialog */}
       {selectedCustomer && (
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل العميل</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-customer-name" className="text-right">
                  الاسم
                </Label>
                <Input id="edit-customer-name" defaultValue={selectedCustomer?.name} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-customer-phone" className="text-right">
                  الهاتف
                </Label>
                <Input id="edit-customer-phone" defaultValue={selectedCustomer?.phone} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => setSelectedCustomer(null)}>
                  إلغاء
                </Button>
              </DialogClose>
              <Button onClick={handleUpdateCustomer}>حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
       )}
       
       {/* Customer Details Dialog */}
        {selectedCustomer && (
            <Dialog open={openDetails} onOpenChange={setOpenDetails}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>تفاصيل العميل</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p><strong>الاسم:</strong> {selectedCustomer.name}</p>
                    <p><strong>الهاتف:</strong> {selectedCustomer.phone}</p>
                    <p><strong>إجمالي الدين:</strong> {selectedCustomer.totalDebt.toFixed(2)} د.ج</p>
                    {/* We can add transaction history here later */}
                </div>
                <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary" onClick={() => setSelectedCustomer(null)}>
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
