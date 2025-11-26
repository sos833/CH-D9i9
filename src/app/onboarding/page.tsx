
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const { setStoreSettings } = useApp();
  const { toast } = useToast();
  const [storeName, setStoreName] = React.useState('');
  const [initialCash, setInitialCash] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const cashAmount = parseFloat(initialCash) || 0;

    if (!storeName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال اسم المحل.",
      });
      return;
    }
    
    await setStoreSettings({
      storeName: storeName,
      initialCash: cashAmount,
      initialSetupDone: true,
    });
    
    toast({
      title: "تم الإعداد بنجاح!",
      description: `مرحباً بك في ${storeName}.`,
    });

    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center animate-fade-in-up">
              <Logo className="h-32 w-32 text-primary" />
            </div>
            <CardTitle className="text-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>مرحبًا بك في دفتر دي زاد</CardTitle>
            <CardDescription className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              لنقم بإعداد حسابك. أدخل تفاصيل متجرك للبدء.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="grid gap-2">
              <Label htmlFor="store-name">اسم المحل</Label>
              <Input
                id="store-name"
                placeholder="مثال: متجر السعادة"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="initial-cash">صندوق النقد الأولي (لاكاس)</Label>
              <Input
                id="initial-cash"
                type="number"
                placeholder="0.00"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
              />
               <p className="text-xs text-muted-foreground">
                أدخل المبلغ النقدي الموجود حاليًا في صندوقك. اتركه فارغًا إذا كان صفرًا.
              </p>
            </div>
          </CardContent>
          <CardFooter className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Button type="submit" className="w-full">
              بدء الاستخدام
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    