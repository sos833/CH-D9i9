
"use client";

import * as React from "react";
import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { columns as columnsDef } from "./components/columns";
import {
  DraggableDialog,
  DraggableDialogContent,
  DraggableDialogDescription,
  DraggableDialogFooter,
  DraggableDialogHeader,
  DraggableDialogTitle,
  DraggableDialogClose,
  DraggableDialogTrigger,
  DraggableDialogBody,
} from "@/components/ui/draggable-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Supplier, SupplierTransaction } from "@/lib/types";
import { useApp } from "@/context/app-context";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/firebase";
import { useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";

const supplierSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().min(1, "الهاتف مطلوب"),
});

const transactionSchema = z.object({
    amount: z.coerce.number().min(0.01, "المبلغ يجب أن يكون أكبر من صفر."),
    description: z.string().optional(),
})

function SuppliersPageContent() {
  const { suppliers, loading, addSupplier, updateSupplier, addSupplierTransaction } = useApp();
  const firestore = useFirestore();

  const [openAdd, setOpenAdd] = React.useState(false);
  const [openPayment, setOpenPayment] = React.useState(false);
  const [openPurchase, setOpenPurchase] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDetails, setOpenDetails] = React.useState(false);
  
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
  
  const [transactionAmount, setTransactionAmount] = React.useState("");
  const [transactionDescription, setTransactionDescription] = React.useState("");

  const [newSupplierName, setNewSupplierName] = React.useState("");
  const [newSupplierPhone, setNewSupplierPhone] = React.useState("");
  
  const [editSupplierName, setEditSupplierName] = React.useState("");
  const [editSupplierPhone, setEditSupplierPhone] = React.useState("");

  const { toast } = useToast();

  const { data: supplierTransactions } = useCollection<SupplierTransaction>(
    firestore && selectedSupplier ? collection(firestore, `suppliers/${selectedSupplier.id}/transactions`) : null
  );

  const handleSaveSupplier = async () => {
    const result = supplierSchema.safeParse({ name: newSupplierName, phone: newSupplierPhone });
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "خطأ في الإدخال",
        description: result.error.errors[0].message,
      });
      return;
    }

    const newSupplierData: Omit<Supplier, 'id'> = {
      name: newSupplierName,
      phone: newSupplierPhone,
      totalDebt: 0,
    };
    
    await addSupplier(newSupplierData);
    
    toast({
      title: "تم الحفظ",
      description: `تمت إضافة المورد ${newSupplierName} بنجاح.`,
    });
    setOpenAdd(false);
    setNewSupplierName("");
    setNewSupplierPhone("");
  };
  
  const handleOpenTransactionDialog = (supplier: Supplier, type: 'payment' | 'purchase') => {
    setSelectedSupplier(supplier);
    setTransactionAmount("");
    setTransactionDescription("");
    if (type === 'payment') {
      setOpenPayment(true);
    } else {
      setOpenPurchase(true);
    }
  };

  const handleSaveTransaction = async (type: 'payment' | 'purchase') => {
    if (!selectedSupplier) return;
    const result = transactionSchema.safeParse({ amount: transactionAmount, description: transactionDescription });
     if (!result.success) {
      toast({ variant: "destructive", title: "خطأ", description: result.error.errors[0].message });
      return;
    }
    
    const { amount, description } = result.data;
    if (type === 'payment' && amount > selectedSupplier.totalDebt) {
       toast({ variant: "destructive", title: "خطأ", description: "المبلغ المدفوع أكبر من الدين المستحق." });
      return;
    }

    const newTransaction: Omit<SupplierTransaction, 'id'> = {
      date: new Date().toISOString(),
      supplierId: selectedSupplier.id,
      type: type,
      amount: amount,
      description: description || (type === 'payment' ? `دفعة للمورد ${selectedSupplier.name}` : `شراء من المورد ${selectedSupplier.name}`),
    };
    
    await addSupplierTransaction(newTransaction);

    toast({
      title: "تمت العملية",
      description: `تم تسجيل العملية بنجاح.`,
    });
    
    if (type === 'payment') {
        setOpenPayment(false);
    } else {
        setOpenPurchase(false);
    }
    setSelectedSupplier(null);
  };
  
  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditSupplierName(supplier.name);
    setEditSupplierPhone(supplier.phone);
    setOpenEdit(true);
  };
  
  const handleViewDetailsClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setOpenDetails(true);
  };
  
  const handleUpdateSupplier = async () => {
     if (!selectedSupplier) return;
     
     const result = supplierSchema.safeParse({ name: editSupplierName, phone: editSupplierPhone });
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "خطأ في الإدخال",
          description: result.error.errors[0].message,
        });
        return;
      }
     
     await updateSupplier(selectedSupplier.id, { name: editSupplierName, phone: editSupplierPhone });
     
     toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات المورد بنجاح.",
    });
     setOpenEdit(false);
     setSelectedSupplier(null);
  };

  const columns = columnsDef({ 
    onAddPayment: (supplier) => handleOpenTransactionDialog(supplier, 'payment'),
    onAddPurchase: (supplier) => handleOpenTransactionDialog(supplier, 'purchase'),
    onEdit: handleEditClick,
    onViewDetails: handleViewDetailsClick
  });


  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <PageHeader title="الموردون" description="إدارة الموردين وتتبع الديون المستحقة لهم." />
        <div className="ml-auto flex items-center gap-2">
          <DraggableDialog open={openAdd} onOpenChange={setOpenAdd}>
            <DraggableDialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  إضافة مورد
                </span>
              </Button>
            </DraggableDialogTrigger>
            <DraggableDialogContent>
              <DraggableDialogHeader>
                <DraggableDialogTitle>إضافة مورد جديد</DraggableDialogTitle>
                <DraggableDialogDescription>
                 أدخل تفاصيل المورد الجديد.
                </DraggableDialogDescription>
              </DraggableDialogHeader>
              <DraggableDialogBody>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    الاسم
                  </Label>
                  <Input id="name" placeholder="اسم الشركة أو المورد" className="col-span-3" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mt-4">
                  <Label htmlFor="phone" className="text-right">
                    الهاتف
                  </Label>
                  <Input id="phone" placeholder="0XXXXXXXXX" className="col-span-3" value={newSupplierPhone} onChange={e => setNewSupplierPhone(e.target.value)}/>
                </div>
              </DraggableDialogBody>
              <DraggableDialogFooter>
                <DraggableDialogClose asChild>
                  <Button type="button" variant="secondary">
                    إلغاء
                  </Button>
                </DraggableDialogClose>
                <Button type="button" onClick={handleSaveSupplier}>حفظ المورد</Button>
              </DraggableDialogFooter>
            </DraggableDialogContent>
          </DraggableDialog>
        </div>
      </div>
       {loading ? (
            <div className="rounded-md border h-96 flex items-center justify-center">
                <p>جار تحميل البيانات...</p>
            </div>
        ) : (
        <DataTable
            columns={columns}
            data={suppliers}
            filterColumnId="name"
            filterPlaceholder="تصفية الموردين..."
        />
        )}

       {selectedSupplier && (
        <DraggableDialog open={openPayment} onOpenChange={setOpenPayment}>
          <DraggableDialogContent>
            <DraggableDialogHeader>
              <DraggableDialogTitle>تسديد دفعة لـ {selectedSupplier.name}</DraggableDialogTitle>
              <DraggableDialogDescription>
                الدين الحالي: {selectedSupplier.totalDebt.toFixed(2)} د.ج
              </DraggableDialogDescription>
            </DraggableDialogHeader>
            <DraggableDialogBody>
              <div className="grid gap-4">
                <Label htmlFor="payment-amount">المبلغ المدفوع</Label>
                <Input 
                  id="payment-amount" 
                  type="number" 
                  placeholder="0.00" 
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                />
              </div>
            </DraggableDialogBody>
            <DraggableDialogFooter>
              <DraggableDialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => setSelectedSupplier(null)}>
                  إلغاء
                </Button>
              </DraggableDialogClose>
              <Button type="button" onClick={() => handleSaveTransaction('payment')}>حفظ الدفعة</Button>
            </DraggableDialogFooter>
          </DraggableDialogContent>
        </DraggableDialog>
      )}

      {selectedSupplier && (
        <DraggableDialog open={openPurchase} onOpenChange={setOpenPurchase}>
          <DraggableDialogContent>
            <DraggableDialogHeader>
              <DraggableDialogTitle>إضافة عملية شراء من {selectedSupplier.name}</DraggableDialogTitle>
              <DraggableDialogDescription>
                سيتم إضافة هذا المبلغ إلى إجمالي الدين المستحق للمورد.
              </DraggableDialogDescription>
            </DraggableDialogHeader>
            <DraggableDialogBody>
              <div className="grid gap-4">
                <div>
                    <Label htmlFor="purchase-amount">مبلغ الشراء</Label>
                    <Input 
                      id="purchase-amount" 
                      type="number" 
                      placeholder="0.00" 
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                    />
                </div>
                 <div>
                    <Label htmlFor="purchase-description">الوصف (اختياري)</Label>
                    <Textarea
                      id="purchase-description" 
                      placeholder="مثال: فاتورة رقم 123، سلع متنوعة..." 
                      value={transactionDescription}
                      onChange={(e) => setTransactionDescription(e.target.value)}
                    />
                </div>
              </div>
            </DraggableDialogBody>
            <DraggableDialogFooter>
              <DraggableDialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => setSelectedSupplier(null)}>
                  إلغاء
                </Button>
              </DraggableDialogClose>
              <Button type="button" onClick={() => handleSaveTransaction('purchase')}>إضافة شراء</Button>
            </DraggableDialogFooter>
          </DraggableDialogContent>
        </DraggableDialog>
      )}
      
       {selectedSupplier && (
        <DraggableDialog open={openEdit} onOpenChange={setOpenEdit}>
          <DraggableDialogContent>
            <DraggableDialogHeader>
              <DraggableDialogTitle>تعديل المورد</DraggableDialogTitle>
            </DraggableDialogHeader>
            <DraggableDialogBody>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-supplier-name" className="text-right">
                  الاسم
                </Label>
                <Input id="edit-supplier-name" value={editSupplierName} onChange={e => setEditSupplierName(e.target.value)} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4 mt-4">
                <Label htmlFor="edit-supplier-phone" className="text-right">
                  الهاتف
                </Label>
                <Input id="edit-supplier-phone" value={editSupplierPhone} onChange={e => setEditSupplierPhone(e.target.value)} className="col-span-3" />
              </div>
            </DraggableDialogBody>
            <DraggableDialogFooter>
              <DraggableDialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => setSelectedSupplier(null)}>
                  إلغاء
                </Button>
              </DraggableDialogClose>
              <Button onClick={handleUpdateSupplier}>حفظ التغييرات</Button>
            </DraggableDialogFooter>
          </DraggableDialogContent>
        </DraggableDialog>
       )}
       
        {selectedSupplier && (
            <DraggableDialog open={openDetails} onOpenChange={(isOpen) => {
                setOpenDetails(isOpen);
                if (!isOpen) setSelectedSupplier(null);
            }}>
            <DraggableDialogContent className="max-w-lg">
                <DraggableDialogHeader>
                    <DraggableDialogTitle>تفاصيل المورد: {selectedSupplier.name}</DraggableDialogTitle>
                    <DraggableDialogDescription>
                        <p><strong>الهاتف:</strong> {selectedSupplier.phone}</p>
                        <p><strong>إجمالي الدين المستحق:</strong> <span className="font-bold text-destructive">{selectedSupplier.totalDebt.toFixed(2)} د.ج</span></p>
                    </DraggableDialogDescription>
                </DraggableDialogHeader>
                 <DraggableDialogBody>
                    <h4 className="font-semibold mb-2">سجل المعاملات</h4>
                    <ScrollArea className="h-72">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>النوع</TableHead>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead className="text-left">المبلغ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {(supplierTransactions || []).length > 0 ? (
                                (supplierTransactions || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{new Date(t.date).toLocaleDateString('ar-DZ')}</TableCell>
                                        <TableCell>
                                            {t.type === 'payment' ? (
                                                <Badge variant="default">دفعة</Badge>
                                            ) : (
                                                <Badge variant="destructive">شراء</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">{t.description}</TableCell>
                                        <TableCell className={`text-left font-medium ${t.type === 'payment' ? 'text-green-600' : 'text-destructive'}`}>
                                            {t.type === 'payment' ? '-' : '+'}
                                            {t.amount.toFixed(2)} د.ج
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">لا توجد معاملات لعرضها.</TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                 </DraggableDialogBody>
                <DraggableDialogFooter>
                    <DraggableDialogClose asChild>
                        <Button type="button" variant="secondary">
                        إغلاق
                        </Button>
                    </DraggableDialogClose>
                </DraggableDialogFooter>
            </DraggableDialogContent>
            </DraggableDialog>
        )}

    </AppLayout>
  );
}


export default function SuppliersPage() {
    return (
        <React.Suspense fallback={<div className="h-96 w-full rounded-lg border flex items-center justify-center mt-4"><p>جار تحميل صفحة الموردين...</p></div>}>
            <SuppliersPageContent />
        </React.Suspense>
    );
}

    