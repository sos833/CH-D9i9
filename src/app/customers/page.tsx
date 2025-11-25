
"use client";

import * as React from "react";
import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
import { useSearchParams, useRouter } from 'next/navigation';
import type { Customer, Transaction } from "@/lib/types";
import { useApp } from "@/context/app-context";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().min(1, "الهاتف مطلوب"),
});

type CartItemData = {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export default function CustomersPage() {
  const { customers, setCustomers, transactions, setTransactions, setProducts, setCashWithdrawals, cashWithdrawals } = useApp();
  const [isClient, setIsClient] = React.useState(false);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openPayment, setOpenPayment] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDetails, setOpenDetails] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState("");

  const [newCustomerName, setNewCustomerName] = React.useState("");
  const [newCustomerPhone, setNewCustomerPhone] = React.useState("");
  
  const [editCustomerName, setEditCustomerName] = React.useState("");
  const [editCustomerPhone, setEditCustomerPhone] = React.useState("");


  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const debtAmountStr = searchParams.get('debt');
  const cartStr = searchParams.get('cart');

  const debtAmount = debtAmountStr ? parseFloat(debtAmountStr) : 0;
  const cartFromPOS: CartItemData[] | null = cartStr ? JSON.parse(decodeURIComponent(cartStr)) : null;

  
  React.useEffect(() => {
    setIsClient(true);
    if (debtAmount > 0) {
      setOpenAdd(true);
    }
  }, [debtAmount]);

  const handleSaveCustomer = () => {
    const result = customerSchema.safeParse({ name: newCustomerName, phone: newCustomerPhone });
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "خطأ في الإدخال",
        description: result.error.errors[0].message,
      });
      return;
    }

    const newCustomer: Customer = {
      id: `CUST${Date.now()}`,
      name: newCustomerName,
      phone: newCustomerPhone,
      totalDebt: debtAmount || 0,
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    
    if (cartFromPOS && debtAmount > 0) {
        const newTransaction: Transaction = {
            id: `TXN${Date.now()}`,
            date: new Date().toISOString(),
            items: cartFromPOS,
            total: debtAmount,
            paymentMethod: 'credit',
            customerId: newCustomer.id,
            customerName: newCustomer.name,
        };
        setTransactions(prev => [...prev, newTransaction]);
        
        setProducts(prevProducts => {
            return prevProducts.map(p => {
                const cartItem = cartFromPOS.find(ci => ci.productId === p.id);
                if (cartItem) {
                    return { ...p, stock: p.stock - cartItem.quantity };
                }
                return p;
            });
        });
    }

    toast({
      title: "تم الحفظ",
      description: `تمت إضافة العميل ${newCustomer.name} بنجاح.`,
    });
    setOpenAdd(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    router.replace('/customers');
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
    if (amount > selectedCustomer.totalDebt) {
       toast({ variant: "destructive", title: "خطأ", description: "المبلغ المدفوع أكبر من الدين." });
      return;
    }

    const paymentTransaction: Transaction = {
      id: `TXN${Date.now()}`,
      date: new Date().toISOString(),
      items: [{
        productId: 'DEBT_PAYMENT',
        productName: `دفعة دين - ${selectedCustomer.name}`,
        quantity: 1,
        price: amount,
      }],
      total: amount,
      paymentMethod: 'cash', // Debt payment is always cash
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
    };
    setTransactions(prev => [...prev, paymentTransaction]);
        
    const newTotalDebt = selectedCustomer.totalDebt - amount;

    if (newTotalDebt <= 0.001) { // Use a small threshold for floating point comparison
        setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
        toast({
            title: "تم تسديد الدين",
            description: `تم تسديد دين العميل ${selectedCustomer.name} بالكامل.`,
        });
    } else {
        setCustomers(customers.map(c => 
            c.id === selectedCustomer.id 
                ? { ...c, totalDebt: newTotalDebt } 
                : c
        ));
         toast({
          title: "تمت العملية",
          description: `تمت إضافة دفعة بقيمة ${amount.toFixed(2)} د.ج للعميل ${selectedCustomer.name}.`,
        });
    }
    
    setOpenPayment(false);
    setSelectedCustomer(null);
  };
  
  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditCustomerName(customer.name);
    setEditCustomerPhone(customer.phone);
    setOpenEdit(true);
  };
  
  const handleViewDetailsClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenDetails(true);
  };
  
  const handleUpdateCustomer = () => {
     if (!selectedCustomer) return;
     
     const result = customerSchema.safeParse({ name: editCustomerName, phone: editCustomerPhone });
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "خطأ في الإدخال",
          description: result.error.errors[0].message,
        });
        return;
      }
     
     setCustomers(customers.map(c => 
        c.id === selectedCustomer.id 
            ? { ...c, name: editCustomerName, phone: editCustomerPhone } 
            : c
     ));
     
     setTransactions(prev => prev.map(t =>
        t.customerId === selectedCustomer.id
            ? { ...t, customerName: editCustomerName }
            : t
     ));

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
          <Dialog open={openAdd} onOpenChange={(isOpen) => {
            setOpenAdd(isOpen);
            if (!isOpen) router.replace('/customers');
          }}>
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
                  <Input id="name" placeholder="اسم العميل الكامل" className="col-span-3" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    الهاتف
                  </Label>
                  <Input id="phone" placeholder="0XXXXXXXXX" className="col-span-3" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)}/>
                </div>
                {debtAmount > 0 && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="debt" className="text-right">
                      قيمة الدين
                    </Label>
                    <Input id="debt" value={`${debtAmount.toFixed(2)} د.ج`} readOnly className="col-span-3" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" onClick={() => router.replace('/customers')}>
                    إلغاء
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveCustomer}>{debtAmount ? 'حفظ الدين' : 'حفظ العميل'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
       {isClient ? (
        <DataTable
            columns={columns}
            data={customers.filter(c => c.totalDebt > 0)}
            filterColumnId="name"
            filterPlaceholder="تصفية العملاء..."
        />
        ) : (
            <div className="rounded-md border h-96 flex items-center justify-center">
                <p>جار تحميل البيانات...</p>
            </div>
        )}

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
                <Input id="edit-customer-name" value={editCustomerName} onChange={e => setEditCustomerName(e.target.value)} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-customer-phone" className="text-right">
                  الهاتف
                </Label>
                <Input id="edit-customer-phone" value={editCustomerPhone} onChange={e => setEditCustomerPhone(e.target.value)} className="col-span-3" />
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

    