
"use client";

import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { columns as columnsDef } from "./components/columns";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Supplier } from "@/lib/types";
import { useApp } from "@/context/app-context";
import { z } from "zod";

const supplierSchema = z.object({
    name: z.string().min(1, "اسم المورد مطلوب"),
    company: z.string().optional(),
    phone: z.string().optional(),
});

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, loading } = useApp();
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
  
  const [newSupplier, setNewSupplier] = React.useState({ name: '', company: '', phone: '' });
  const [editSupplierState, setEditSupplierState] = React.useState<Partial<Supplier>>({});

  const { toast } = useToast();

  const handleSave = async () => {
    const result = supplierSchema.safeParse(newSupplier);

    if (!result.success) {
        toast({
            variant: "destructive",
            title: "خطأ في الإدخال",
            description: result.error.errors[0].message,
        });
        return;
    }
    
    await addSupplier(result.data);

    toast({
      title: "تم الحفظ",
      description: "تمت إضافة المورد بنجاح.",
    });
    setOpenAdd(false);
    setNewSupplier({ name: '', company: '', phone: '' });
  };
  
  const handleUpdate = async () => {
    if (!selectedSupplier) return;
    
    const result = supplierSchema.safeParse(editSupplierState);

    if (!result.success) {
        toast({
            variant: "destructive",
            title: "خطأ في الإدخال",
            description: result.error.errors[0].message,
        });
        return;
    }

    await updateSupplier(selectedSupplier.id, result.data);
    toast({
      title: "تم التحديث",
      description: "تم تحديث المورد بنجاح.",
    });
    setOpenEdit(false);
    setSelectedSupplier(null);
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditSupplierState({
        name: supplier.name,
        company: supplier.company,
        phone: supplier.phone,
    });
    setOpenEdit(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedSupplier) return;
    await deleteSupplier(selectedSupplier.id);
    toast({
      title: "تم الحذف",
      description: `تم حذف المورد "${selectedSupplier.name}" بنجاح.`,
    });
    setOpenDelete(false);
    setSelectedSupplier(null);
  };
  
  const columns = columnsDef({ onEdit: handleEditClick, onDelete: handleDeleteClick });

  const handleNewSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewSupplier(prev => ({ ...prev, [id]: value }));
  };

  const handleEditSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('edit-', '');
    setEditSupplierState(prev => ({ ...prev, [fieldName]: value }));
};

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <PageHeader title="الموردون" description="إدارة قائمة الموردين." />
        <div className="ml-auto flex items-center gap-2">
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  إضافة مورد
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مورد جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المورد الجديد.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    الاسم
                  </Label>
                  <Input id="name" placeholder="اسم جهة الاتصال" className="col-span-3" value={newSupplier.name} onChange={handleNewSupplierChange} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">
                    الشركة
                  </Label>
                  <Input id="company" placeholder="اسم الشركة (اختياري)" className="col-span-3" value={newSupplier.company} onChange={handleNewSupplierChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    الهاتف
                  </Label>
                  <Input id="phone" placeholder="رقم الهاتف (اختياري)" className="col-span-3" value={newSupplier.phone} onChange={handleNewSupplierChange}/>
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    إلغاء
                  </Button>
                </DialogClose>
                <Button onClick={handleSave}>حفظ المورد</Button>
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
            data={suppliers}
            filterColumnId="name"
            filterPlaceholder="تصفية الموردين..."
        />
       )}

       {selectedSupplier && (
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعديل المورد</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    الاسم
                  </Label>
                  <Input id="edit-name" value={editSupplierState.name || ''} onChange={handleEditSupplierChange} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-company" className="text-right">
                    الشركة
                  </Label>
                  <Input id="edit-company" value={editSupplierState.company || ''} onChange={handleEditSupplierChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">
                    الهاتف
                  </Label>
                  <Input id="edit-phone" value={editSupplierState.phone || ''} onChange={handleEditSupplierChange} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                  <Button type="button" variant="secondary" onClick={() => setSelectedSupplier(null)}>
                    إلغاء
                  </Button>
                </DialogClose>
                <Button onClick={handleUpdate}>حفظ التغييرات</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

      {selectedSupplier && (
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
              <AlertDialogDescription>
                هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المورد بشكل دائم.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedSupplier(null)}>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>متابعة</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </AppLayout>
  );
}
