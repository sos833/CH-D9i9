"use client";

import * as React from "react";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockProducts } from "@/lib/data";
import { Search, CreditCard, DollarSign, MoreVertical, Plus, Minus, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Product } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";


type CartItem = Product & { quantity: number };

export default function PosPage() {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const [openEdit, setOpenEdit] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
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

  const handleCashPayment = () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "السلة فارغة. الرجاء إضافة منتجات أولاً.",
      });
      return;
    }
    // In a real app, you'd record this transaction
    toast({
      title: "تم الدفع",
      description: `تم استلام مبلغ ${total.toFixed(2)} د.ج نقدًا.`,
    });
    // This should also update dashboard stats, but for now we clear cart
    clearCart();
  };

  const handleCreditPayment = () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "السلة فارغة. الرجاء إضافة منتجات أولاً.",
      });
      return;
    }
    const debtAmount = total.toFixed(2);
    // Clear cart and navigate
    clearCart();
    router.push(`/customers?debt=${debtAmount}`);
  };
  
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setOpenEdit(true);
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

  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  return (
    <AppLayout>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن منتج بالاسم أو الباركود..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[60vh]">
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
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                  <CardContent 
                    className="p-4 flex flex-col items-start justify-center h-full cursor-pointer"
                    onClick={() => addToCart(product)}
                   >
                    <p className="font-semibold text-sm truncate w-full">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sellingPrice} د.ج</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div>
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
              <ScrollArea className="h-[40vh]">
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
                <Button size="lg" className="w-full gap-2" onClick={handleCashPayment}>
                  <DollarSign className="h-4 w-4" /> دفع نقدي
                </Button>
                <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleCreditPayment}>
                   <CreditCard className="h-4 w-4" /> كريدي (دين)
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
       {/* Edit Product Dialog */}
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
    </AppLayout>
  );
}
