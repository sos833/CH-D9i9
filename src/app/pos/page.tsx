"use client";

import * as React from "react";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockProducts } from "@/lib/data";
import { Search, CreditCard, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Product } from "@/lib/types";

type CartItem = Product & { quantity: number };

export default function PosPage() {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

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
    setCart([]);
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
    setCart([]);
    router.push(`/customers?debt=${debtAmount}`);
  };

  return (
    <AppLayout>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن منتج بالاسم أو الباركود..."
              className="w-full pl-10"
            />
          </div>
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4 flex flex-col items-start justify-center h-full">
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
            <CardHeader className="flex flex-row items-start bg-muted/50">
              <div className="grid gap-0.5">
                <CardTitle className="group flex items-center gap-2 text-lg">
                  السلة
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
              <ScrollArea className="h-[40vh]">
                <div className="grid gap-3">
                  <div className="font-semibold">تفاصيل الطلب</div>
                  {cart.length > 0 ? (
                    <ul className="grid gap-3">
                      {cart.map(item => (
                         <li key={item.id} className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {item.name} <span>× {item.quantity}</span>
                          </span>
                          <span>{(item.sellingPrice * item.quantity).toFixed(2)} د.ج</span>
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
    </AppLayout>
  );
}
