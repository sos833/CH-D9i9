
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

function CustomersPageContent() {
  const { customers, transactions, loading, addCustomer, updateCustomer, addTransaction, updateProductsStock, updateCustomerDebt } = useApp();
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
    if (debtAmount > 0) {
      setOpenAdd(true);
    }
  }, [debtAmount]);

  const handleSaveCustomer = async () => {
    const result = customerSchema.safeParse({ name: newCustomerName, phone: newCustomerPhone });
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "خطأ في الإدخال",
        description: result.error.errors[0].message,
      });
      return;
    }

    const newCustomerData: Omit<Customer, 'id'> = {
      name: newCustomerName,
      phone: newCustomerPhone,
      totalDebt: debtAmount || 0,
    };
    
    const newCustomerRef = await addCustomer(newCustomerData);
    
    if (cartFromPOS && debtAmount > 0 && newCustomerRef) {
        const newTransaction: Omit<Transaction, 'id'> = {
            date: new Date().toISOString(),
            items: cartFromPOS,
            total: debtAmount,
            paymentMethod: 'credit',
            customerId: newCustomerRef.id,
            customerName: newCustomerName,
        };
        await addTransaction(newTransaction);
        await updateProductsStock(cartFromPOS.map(item => ({ productId: item.productId, quantity: item.quantity })));
    }

    toast({
      title: "تم الحفظ",
      description: `تمت إضافة العميل ${newCustomerName} بنجاح.`,
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

  const handleSavePayment = async () => {
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

    const paymentTransaction: Omit<Transaction, 'id'> = {
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
    await addTransaction(paymentTransaction);
    
    const newTotalDebt = selectedCustomer.totalDebt - amount;
    
    await updateCustomer(selectedCustomer.id, { totalDebt: newTotalDebt });

    if (newTotalDebt <= 0.001) {
        toast({
            title: "تم تسديد الدين",
            description: `تم تسديد دين العميل ${selectedCustomer.name} بالكامل.`,
        });
    } else {
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
  
  const handleUpdateCustomer = async () => {
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
     
     await updateCustomer(selectedCustomer.id, { name: editCustomerName, phone: editCustomerPhone });
     
     // Note: Updating customerName in past transactions can be complex and is omitted here.
     // It's often better to reference customer by ID and fetch details when needed.

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

  const customerTransactions = selectedCustomer 
    ? transactions
        .filter(t => t.customerId === selectedCustomer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

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
       {loading ? (
            <div className="rounded-md border h-96 flex items-center justify-center">
                <p>جار تحميل البيانات...</p>
            </div>
        ) : (
        <DataTable
            columns={columns}
            data={customers.filter(c => c.totalDebt > 0.01)}
            filterColumnId="name"
            filterPlaceholder="تصفية العملاء..."
        />
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
            <Dialog open={openDetails} onOpenChange={(isOpen) => {
                setOpenDetails(isOpen);
                if (!isOpen) setSelectedCustomer(null);
            }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>تفاصيل العميل: {selectedCustomer.name}</DialogTitle>
                    <DialogDescription>
                        <p><strong>الهاتف:</strong> {selectedCustomer.phone}</p>
                        <p><strong>إجمالي الدين الحالي:</strong> <span className="font-bold text-destructive">{selectedCustomer.totalDebt.toFixed(2)} د.ج</span></p>
                    </DialogDescription>
                </DialogHeader>
                 <ScrollArea className="h-72 mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>النوع</TableHead>
                                <TableHead className="text-left">المبلغ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {customerTransactions.length > 0 ? (
                            customerTransactions.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell>{new Date(t.date).toLocaleDateString('ar-DZ')}</TableCell>
                                    <TableCell>
                                        {t.items.some(i => i.productId === 'DEBT_PAYMENT') ? (
                                            <Badge variant="default">دفعة</Badge>
                                        ) : (
                                            <Badge variant="destructive">دين</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className={`text-left font-medium ${t.items.some(i => i.productId === 'DEBT_PAYMENT') ? 'text-green-600' : 'text-destructive'}`}>
                                        {t.items.some(i => i.productId === 'DEBT_PAYMENT') ? '+' : '-'}
                                        {t.total.toFixed(2)} د.ج
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">لا توجد معاملات لعرضها.</TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
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

export default function CustomersPage() {
    return (
        <React.Suspense fallback={<div className="h-96 w-full rounded-lg border flex items-center justify-center mt-4"><p>جار تحميل صفحة العملاء...</p></div>}>
            <CustomersPageContent />
        </React.Suspense>
    );
}
    

    