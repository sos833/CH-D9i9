"use client";

import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockProducts } from "@/lib/data";
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

export default function InventoryPage() {
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, you would handle form submission here
    toast({
      title: "تم الحفظ",
      description: "تمت إضافة المنتج بنجاح.",
    });
    setOpenAdd(false);
  };
  
  const handleUpdate = () => {
    // In a real app, you would handle form submission here
    toast({
      title: "تم التحديث",
      description: "تم تحديث المنتج بنجاح.",
    });
    setOpenEdit(false);
    setSelectedProduct(null);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setOpenEdit(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setOpenDelete(true);
  };

  const confirmDelete = () => {
    if (!selectedProduct) return;
    setProducts(products.filter(p => p.id !== selectedProduct.id));
    toast({
      title: "تم الحذف",
      description: `تم حذف المنتج "${selectedProduct.name}" بنجاح.`,
    });
    setOpenDelete(false);
    setSelectedProduct(null);
  };
  
  const columns = columnsDef({ onEdit: handleEditClick, onDelete: handleDeleteClick });

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
                  <Label htmlFor="stock" className="text-right">
                    المخزون
                  </Label>
                  <Input id="stock" type="number" placeholder="0" className="col-span-3" />
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
      <DataTable
        columns={columns}
        data={products}
        filterColumnId="name"
        filterPlaceholder="تصفية المنتجات..."
      />

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
                  <Label htmlFor="edit-product-name" className="text-right">
                    الاسم
                  </Label>
                  <Input id="edit-product-name" defaultValue={selectedProduct?.name} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-selling-price" className="text-right">
                    سعر البيع
                  </Label>
                  <Input id="edit-selling-price" type="number" defaultValue={selectedProduct?.sellingPrice} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-cost-price" className="text-right">
                    سعر التكلفة
                  </Label>
                  <Input id="edit-cost-price" type="number" defaultValue={selectedProduct?.costPrice} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-stock" className="text-right">
                    المخزون
                  </Label>
                  <Input id="edit-stock" type="number" defaultValue={selectedProduct?.stock} className="col-span-3" />
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
