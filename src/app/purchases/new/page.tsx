
"use client";

import * as React from "react";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Save, Plus, Minus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Product, Purchase, Supplier } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-context";

type CartItem = Product & { quantity: number };

export default function NewPurchasePage() {
  const { products, suppliers, loading, addPurchase, increaseProductsStock } = useApp();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const [selectedSupplierId, setSelectedSupplierId] = React.useState<string | null>(null);
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

  const totalCost = cart.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);

  const processPurchase = async () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "السلة فارغة. الرجاء إضافة منتجات أولاً.",
      });
      return;
    }
    if (!selectedSupplierId) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء اختيار مورد.",
      });
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    const cartItemsForPurchase = cart.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      costPrice: item.costPrice,
    }));

    const newPurchase: Omit<Purchase, 'id'> = {
      date: new Date().toISOString(),
      items: cartItemsForPurchase,
      totalCost: totalCost,
      supplierId: supplier.id,
      supplierName: supplier.name,
    };

    await addPurchase(newPurchase);
    await increaseProductsStock(cart.map(item => ({ productId: item.id, quantity: item.quantity })));
    
    toast({
      title: "تم تسجيل الفاتورة",
      description: `تم تسجيل فاتورة شراء من ${supplier.name} بنجاح.`,
    });
    clearCart();
    router.push('/purchases');
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchQuery))
  );

  return (
    <AppLayout>
      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن منتج..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
           {loading ? (
                <div className="rounded-md border h-[60vh] flex items-center justify-center">
                    <p>جار تحميل المنتجات...</p>
                </div>
             ) : (
              <ScrollArea className="h-[60vh] lg:h-[70vh]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="overflow-hidden relative group cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4 flex flex-col items-start justify-center h-full">
                        <p className="font-semibold text-sm truncate w-full">{product.name}</p>
                        <p className="text-sm text-muted-foreground">التكلفة: {product.costPrice.toFixed(2)} د.ج</p>
                         <p className="text-xs text-muted-foreground">المخزون: {product.stock}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
             )}
        </div>
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/50">
              <CardTitle className="group flex items-center gap-2 text-lg">
                فاتورة الشراء
              </CardTitle>
               {cart.length > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearCart}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">إفراغ الفاتورة</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6 text-sm">
             <div className="grid gap-3 mb-4">
                <Label htmlFor="supplier">المورد</Label>
                 <Select onValueChange={setSelectedSupplierId} value={selectedSupplierId || undefined}>
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="اختر موردًا" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
             <Separator />
              <ScrollArea className="h-[40vh] lg:h-[45vh] mt-4">
                <div className="grid gap-3">
                  {cart.length > 0 ? (
                    <ul className="grid gap-4">
                      {cart.map(item => (
                         <li key={item.id} className="flex items-center justify-between gap-4">
                          <div className="flex-1 truncate">
                             <span className="font-medium">{item.name}</span>
                             <p className="text-xs text-muted-foreground">التكلفة: {item.costPrice.toFixed(2)} د.ج</p>
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
                            {(item.costPrice * item.quantity).toFixed(2)} د.ج
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">الفاتورة فارغة</p>
                  )}
                  {cart.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <ul className="grid gap-3">
                        <li className="flex items-center justify-between font-semibold">
                          <span className="text-muted-foreground">التكلفة الإجمالية</span>
                          <span>{totalCost.toFixed(2)} د.ج</span>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2 p-4 border-t bg-muted/50">
                <Button size="lg" className="w-full gap-2" onClick={processPurchase} disabled={cart.length === 0 || !selectedSupplierId}>
                  <Save className="h-4 w-4" /> حفظ الفاتورة
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
