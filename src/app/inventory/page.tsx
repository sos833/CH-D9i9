
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
import type { Product } from "@/lib/types";
import { useApp } from "@/context/app-context";
import { z } from "zod";

const productSchema = z.object({
    name: z.string().min(1, "اسم المنتج مطلوب"),
    stock: z.coerce.number().min(0, "المخزون لا يمكن أن يكون سالبًا"),
    costPrice: z.coerce.number().min(0, "سعر التكلفة لا يمكن أن يكون سالبًا"),
    sellingPrice: z.coerce.number().min(0, "سعر البيع لا يمكن أن يكون سالبًا"),
});

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, loading } = useApp();
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  
  const [newProduct, setNewProduct] = React.useState({ name: '', stock: '', costPrice: '', sellingPrice: '' });
  const [editProductState, setEditProductState] = React.useState<Partial<Product>>({});

  const { toast } = useToast();

  const handleSave = async () => {
    const result = productSchema.safeParse({
        name: newProduct.name,
        stock: newProduct.stock,
        costPrice: newProduct.costPrice,
        sellingPrice: newProduct.sellingPrice,
    });

    if (!result.success) {
        toast({
            variant: "destructive",
            title: "خطأ في الإدخال",
            description: result.error.errors[0].message,
        });
        return;
    }
    
    await addProduct(result.data);

    toast({
      title: "تم الحفظ",
      description: "تمت إضافة المنتج بنجاح.",
    });
    setOpenAdd(false);
    setNewProduct({ name: '', stock: '', costPrice: '', sellingPrice: '' });
  };
  
  const handleUpdate = async () => {
    if (!selectedProduct) return;
    
    const result = productSchema.safeParse({
        name: editProductState.name,
        stock: editProductState.stock,
        costPrice: editProductState.costPrice,
        sellingPrice: editProductState.sellingPrice,
    });

    if (!result.success) {
        toast({
            variant: "destructive",
            title: "خطأ في الإدخال",
            description: result.error.errors[0].message,
        });
        return;
    }

    await updateProduct(selectedProduct.id, result.data);
    toast({
      title: "تم التحديث",
      description: "تم تحديث المنتج بنجاح.",
    });
    setOpenEdit(false);
    setSelectedProduct(null);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductState({
        name: product.name,
        stock: product.stock,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
    });
    setOpenEdit(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct(selectedProduct.id);
    toast({
      title: "تم الحذف",
      description: `تم حذف المنتج "${selectedProduct.name}" بنجاح.`,
    });
    setOpenDelete(false);
    setSelectedProduct(null);
  };
  
  const columns = columnsDef({ onEdit: handleEditClick, onDelete: handleDeleteClick });

  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewProduct(prev => ({ ...prev, [id]: value }));
  };

  const handleEditProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('edit-', '');
    setEditProductState(prev => ({ ...prev, [fieldName]: value }));
};

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <PageHeader title="المخزون" description="إدارة المنتجات والأسعار والمخزون." />
        <div className="ml-auto flex items-center gap-2">
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
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
                  <Label htmlFor="name" className="text-right">
                    الاسم
                  </Label>
                  <Input id="name" placeholder="اسم المنتج" className="col-span-3" value={newProduct.name} onChange={handleNewProductChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    المخزون
                  </Label>
                  <Input id="stock" type="number" placeholder="0" className="col-span-3" value={newProduct.stock} onChange={handleNewProductChange}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="costPrice" className="text-right">
                    سعر التكلفة
                  </Label>
                  <Input id="costPrice" type="number" placeholder="0.00" className="col-span-3" value={newProduct.costPrice} onChange={handleNewProductChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sellingPrice" className="text-right">
                    سعر البيع
                  </Label>
                  <Input id="sellingPrice" type="number" placeholder="0.00" className="col-span-3" value={newProduct.sellingPrice} onChange={handleNewProductChange} />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    إلغاء
                  </Button>
                </DialogClose>
                <Button onClick={handleSave}>حفظ المنتج</Button>
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
            data={products}
            filterColumnId="name"
            filterPlaceholder="تصفية المنتجات..."
        />
       )}

       {/* Edit Product Dialog */}
       {selectedProduct && (
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعديل المنتج</DialogTitle>
                <DialogDescription>
                  قم بتحديث تفاصيل المنتج.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    الاسم
                  </Label>
                  <Input id="edit-name" value={editProductState.name || ''} onChange={handleEditProductChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-stock" className="text-right">
                    المخزون
                  </Label>
                  <Input id="edit-stock" type="number" value={editProductState.stock ?? ''} onChange={handleEditProductChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-costPrice" className="text-right">
                    سعر التكلفة
                  </Label>
                  <Input id="edit-costPrice" type="number" value={editProductState.costPrice ?? ''} onChange={handleEditProductChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-sellingPrice" className="text-right">
                    سعر البيع
                  </Label>
                  <Input id="edit-sellingPrice" type="number" value={editProductState.sellingPrice ?? ''} onChange={handleEditProductChange} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                  <Button type="button" variant="secondary" onClick={() => setSelectedProduct(null)}>
                    إلغاء
                  </Button>
                </DialogClose>
                <Button onClick={handleUpdate}>حفظ التغييرات</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

      {/* Delete Product Confirmation Dialog */}
      {selectedProduct && (
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
              <AlertDialogDescription>
                هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المنتج بشكل دائم
                من خوادمنا.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedProduct(null)}>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>متابعة</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </AppLayout>
  );
}
