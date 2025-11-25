
"use client";

import * as React from "react";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, CreditCard, DollarSign, MoreVertical, Plus, Minus, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Product, Transaction } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
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

import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-context";
import { z } from "zod";


const productSchema = z.object({
    name: z.string().min(1, "اسم المنتج مطلوب"),
    stock: z.coerce.number().min(0, "المخزون لا يمكن أن يكون سالبًا"),
    costPrice: z.coerce.number().min(0, "سعر التكلفة لا يمكن أن يكون سالبًا"),
    sellingPrice: z.coerce.number().min(0, "سعر البيع لا يمكن أن يكون سالبًا"),
    barcode: z.string().optional(),
});


type CartItem = Product & { quantity: number };

export default function PosPage() {
  const { products, setProducts, setTransactions, customers, setCustomers } = useApp();
  const [isClient, setIsClient] = React.useState(false);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [editProductDetails, setEditProductDetails] = React.useState<Partial<Product>>({});
  const [searchQuery, setSearchQuery] = React.useState("");

  const [newProduct, setNewProduct] = React.useState({ name: '', barcode: '', stock: '', costPrice: '', sellingPrice: '' });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
           return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
            toast({
                variant: "destructive",
                title: "نفذ المخزون",
                description: `لا يوجد سوى ${product.stock} عناصر متبقية من ${product.name}.`,
            });
            return prevCart;
        }
      }
      if (product.stock > 0) {
        return [...prevCart, { ...product, quantity: 1 }];
      } else {
         toast({
            variant: "destructive",
            title: "نفذ المخزون",
            description: `المنتج ${product.name} غير متوفر حاليًا.`,
        });
        return prevCart;
      }
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const productInStock = products.find(p => p.id === productId);
    if (!productInStock) return;

    if (newQuantity > productInStock.stock) {
        toast({
            variant: "destructive",
            title: "نفذ المخزون",
            description: `لا يوجد سوى ${productInStock.stock} عناصر متبقية من ${productInStock.name}.`,
        });
        newQuantity = productInStock.stock;
    }

    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

  const processSale = (paymentMethod: 'cash' | 'credit') => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "السلة فارغة. الرجاء إضافة منتجات أولاً.",
      });
      return;
    }

    if (paymentMethod === 'cash') {
        const newTransaction: Transaction = {
          id: `TXN${Date.now()}`,
          date: new Date().toISOString(),
          items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.sellingPrice
          })),
          total: total,
          paymentMethod: 'cash',
        };
        setTransactions(prev => [...prev, newTransaction]);
        
        setProducts(prevProducts => {
          return prevProducts.map(p => {
            const cartItem = cart.find(ci => ci.id === p.id);
            if (cartItem) {
              return { ...p, stock: p.stock - cartItem.quantity };
            }
            return p;
          });
        });

        toast({
          title: "تم الدفع",
          description: `تم استلام مبلغ ${total.toFixed(2)} د.ج نقدًا.`,
        });
        clearCart();
    } else if (paymentMethod === 'credit') {
        const debtAmount = total;
        const cartData = cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.sellingPrice
          }));

        router.push(`/customers?debt=${debtAmount}&cart=${encodeURIComponent(JSON.stringify(cartData))}`);
        clearCart();
    }
  };

  const handleCashPayment = () => {
    processSale('cash');
  };

  const handleCreditPayment = () => {
    processSale('credit');
  };
  
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductDetails({
        name: product.name,
        sellingPrice: product.sellingPrice,
    });
    setOpenEdit(true);
  };
  
  const handleUpdate = () => {
    if (!selectedProduct) return;
    
    const result = productSchema.safeParse({
        name: editProductDetails.name,
        sellingPrice: editProductDetails.sellingPrice,
        stock: selectedProduct.stock, 
        costPrice: selectedProduct.costPrice
    });

     if (!result.success) {
        toast({
            variant: "destructive",
            title: "خطأ في الإدخال",
            description: result.error.errors.map(e => e.message).join(', '),
        });
        return;
    }
    
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, ...editProductDetails } as Product : p));
    setCart(prevCart => prevCart.map(item => item.id === selectedProduct.id ? { ...item, ...editProductDetails } as CartItem : item));

    toast({
      title: "تم التحديث",
      description: "تم تحديث المنتج بنجاح.",
    });
    setOpenEdit(false);
    setSelectedProduct(null);
  };
  
  const handleEditDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('edit-', '');
    setEditProductDetails(prev => ({ ...prev, [fieldName]: value }));
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchQuery))
  );

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setOpenDelete(true);
  };

  const confirmDelete = () => {
    if (!selectedProduct) return;
    setProducts(products.filter(p => p.id !== selectedProduct.id));
    setCart(cart.filter(p => p.id !== selectedProduct.id));
    toast({
      title: "تم الحذف",
      description: `تم حذف المنتج "${selectedProduct.name}" بنجاح.`,
    });
    setOpenDelete(false);
    setSelectedProduct(null);
  };

  const handleSave = () => {
    const result = productSchema.safeParse({
        name: newProduct.name,
        stock: newProduct.stock,
        costPrice: newProduct.costPrice || 0,
        sellingPrice: newProduct.sellingPrice,
        barcode: newProduct.barcode,
    });

    if (!result.success) {
        toast({
            variant: "destructive",
            title: "خطأ في الإدخال",
            description: result.error.errors[0].message,
        });
        return;
    }
    
    const productToAdd: Product = {
      id: `PROD${Date.now()}`,
      name: result.data.name,
      barcode: result.data.barcode || '',
      stock: result.data.stock,
      costPrice: result.data.costPrice,
      sellingPrice: result.data.sellingPrice,
    };
    
    setProducts(prev => [...prev, productToAdd]);
    toast({
      title: "تم الحفظ",
      description: "تمت إضافة المنتج بنجاح.",
    });
    setOpenAdd(false);
    setNewProduct({ name: '', barcode: '', stock: '', costPrice: '', sellingPrice: '' });
  };
  
  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewProduct(prev => ({ ...prev, [id]: value }));
  };


  return (
    <AppLayout>
      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن منتج بالاسم أو الباركود..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
             <Dialog open={openAdd} onOpenChange={setOpenAdd}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-10 gap-1">
                  <PlusCircle className="h-4 w-4" />
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
                    <Label htmlFor="barcode" className="text-right">
                      الباركود
                    </Label>
                    <Input id="barcode" placeholder="الباركود (اختياري)" className="col-span-3" value={newProduct.barcode} onChange={handleNewProductChange} />
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
           {isClient ? (
              <ScrollArea className="h-[60vh] lg:h-[70vh]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="overflow-hidden relative group"
                    >
                      <div 
                         className="absolute top-2 right-2 z-10"
                         onClick={(e) => e.stopPropagation()}
                       >
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                               <MoreVertical className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handleEditClick(product)}>
                               تعديل المنتج
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-destructive focus:text-destructive">
                               حذف المنتج
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                      <CardContent 
                        className="p-4 flex flex-col items-start justify-center h-full cursor-pointer"
                        onClick={() => addToCart(product)}
                       >
                        <p className="font-semibold text-sm truncate w-full">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sellingPrice.toFixed(2)} د.ج</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
             ) : (
                <div className="rounded-md border h-[60vh] flex items-center justify-center">
                    <p>جار تحميل المنتجات...</p>
                </div>
             )}
        </div>
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/50">
              <CardTitle className="group flex items-center gap-2 text-lg">
                السلة
              </CardTitle>
               {cart.length > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearCart}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">إفراغ السلة</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6 text-sm">
              <ScrollArea className="h-[40vh] lg:h-[45vh]">
                <div className="grid gap-3">
                  {cart.length > 0 ? (
                    <ul className="grid gap-4">
                      {cart.map(item => (
                         <li key={item.id} className="flex items-center justify-between gap-4">
                          <div className="flex-1 truncate">
                             <span className="font-medium">{item.name}</span>
                             <p className="text-xs text-muted-foreground">{item.sellingPrice.toFixed(2)} د.ج</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <span className="w-20 text-left font-semibold">
                            {(item.sellingPrice * item.quantity).toFixed(2)} د.ج
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">السلة فارغة</p>
                  )}
                  {cart.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <ul className="grid gap-3">
                        <li className="flex items-center justify-between font-semibold">
                          <span className="text-muted-foreground">الإجمالي</span>
                          <span>{total.toFixed(2)} د.ج</span>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2 p-4 border-t bg-muted/50">
                <Button size="lg" className="w-full gap-2" onClick={handleCashPayment} disabled={cart.length === 0}>
                  <DollarSign className="h-4 w-4" /> دفع نقدي
                </Button>
                <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleCreditPayment} disabled={cart.length === 0}>
                   <CreditCard className="h-4 w-4" /> كريدي (دين)
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
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
              <Input id="edit-name" value={editProductDetails.name || ''} onChange={handleEditDetailsChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sellingPrice" className="text-right">
                سعر البيع
              </Label>
              <Input id="edit-sellingPrice" type="number" value={editProductDetails.sellingPrice || ''} onChange={handleEditDetailsChange} className="col-span-3" />
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

      {selectedProduct && (
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
              <AlertDialogDescription>
                هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المنتج بشكل دائم
                من مخزونك.
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

    