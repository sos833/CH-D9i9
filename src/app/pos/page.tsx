import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockProducts } from "@/lib/data";
import { PlusCircle, Search, CreditCard, DollarSign } from "lucide-react";
import Image from "next/image";

export default function PosPage() {
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
                <Card key={product.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-0">
                    <Image
                      src={`https://picsum.photos/seed/${product.id}/200/150`}
                      alt={product.name}
                      width={200}
                      height={150}
                      className="w-full h-auto aspect-video object-cover"
                      data-ai-hint="product image"
                    />
                  </CardContent>
                  <CardFooter className="p-3 flex flex-col items-start">
                    <p className="font-semibold text-sm truncate w-full">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sellingPrice} د.ج</p>
                  </CardFooter>
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
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Gaufrettes Amigo <span>× 2</span>
                      </span>
                      <span>40.00 د.ج</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Jus Rouiba <span>× 1</span>
                      </span>
                      <span>110.00 د.ج</span>
                    </li>
                  </ul>
                  <Separator className="my-2" />
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">المجموع الفرعي</span>
                      <span>150.00 د.ج</span>
                    </li>
                    <li className="flex items-center justify-between font-semibold">
                      <span className="text-muted-foreground">الإجمالي</span>
                      <span>150.00 د.ج</span>
                    </li>
                  </ul>
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2 p-4 border-t bg-muted/50">
                <Button size="lg" className="w-full gap-2">
                  <DollarSign className="h-4 w-4" /> دفع نقدي
                </Button>
                <Button variant="outline" size="lg" className="w-full gap-2">
                   <CreditCard className="h-4 w-4" /> كريدي (دين)
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
