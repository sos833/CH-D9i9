
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!storeName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال اسم المحل.",
      });
      return;
    }
    
    setStoreSettings({
      storeName: storeName,
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
            <div className="mb-4 flex justify-center">
              <Logo className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">مرحبًا بك في دفتر دي زاد</CardTitle>
            <CardDescription>
              لنقم بإعداد حسابك. أدخل اسم متجرك للبدء.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              بدء الاستخدام
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
